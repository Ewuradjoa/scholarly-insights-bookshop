import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderConfirmation } from '@/lib/order-email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const mode = process.env.STRIPE_MODE;
  const correctStripeKey = mode === 'live'
    ? (secret?.startsWith('sk_live_') || secret?.startsWith('rk_live_'))
    : mode === 'test' && (secret?.startsWith('sk_test_') || secret?.startsWith('rk_test_'));
  if (!correctStripeKey || !signingSecret) return NextResponse.json({ error: 'Stripe mode and webhook configuration do not match.' }, { status: 503 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, signingSecret); }
  catch { return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 }); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== 'paid') return NextResponse.json({ received: true });
    if (session.mode !== 'payment' || session.currency !== 'gbp' || session.metadata?.book_slug !== 'how-to-fall-out-of-love' || !session.metadata.customer_user_id) {
      return NextResponse.json({ error: 'Paid checkout does not match a supported book order.' }, { status: 500 });
    }
    const edition = session.metadata.edition;
    if (edition !== 'ebook' && edition !== 'paperback') return NextResponse.json({ error: 'Paid checkout has an unsupported edition.' }, { status: 500 });
    if (edition === 'ebook' && (session.metadata.digital_content_consent !== 'accepted' || !session.metadata.digital_content_consent_at)) {
      return NextResponse.json({ error: 'Paid ebook checkout is missing its recorded immediate-delivery consent.' }, { status: 500 });
    }
    const expectedPriceId = edition === 'ebook' ? process.env.STRIPE_EBOOK_PRICE_ID : process.env.STRIPE_PAPERBACK_PRICE_ID;
    const expectedSubtotal = edition === 'ebook' ? 999 : 1999;
    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 2 });
    const item = items.data[0];
    if (!expectedPriceId || items.data.length !== 1 || item.price?.id !== expectedPriceId || item.quantity !== 1 || item.amount_subtotal !== expectedSubtotal || session.amount_subtotal !== expectedSubtotal) {
      return NextResponse.json({ error: 'Paid checkout amount or product does not match the approved order.' }, { status: 500 });
    }
    const shippingRate = session.shipping_cost?.shipping_rate;
    const shippingRateId = typeof shippingRate === 'string' ? shippingRate : shippingRate?.id ?? null;
    const shippingLevels = new Map<string, 'MAIL' | 'PRIORITY_MAIL' | 'EXPRESS'>([
      [process.env.STRIPE_PAPERBACK_BASIC_SHIPPING_RATE_ID ?? '', 'MAIL'],
      [process.env.STRIPE_PAPERBACK_PRIORITY_SHIPPING_RATE_ID ?? '', 'PRIORITY_MAIL'],
      [process.env.STRIPE_PAPERBACK_EXPRESS_SHIPPING_RATE_ID ?? '', 'EXPRESS'],
    ].filter(([rateId]) => Boolean(rateId)) as [string, 'MAIL' | 'PRIORITY_MAIL' | 'EXPRESS'][]);
    const shippingLevel = shippingRateId ? shippingLevels.get(shippingRateId) : undefined;
    const expectedShippingAmount = shippingLevel === 'PRIORITY_MAIL' ? 100 : shippingLevel === 'EXPRESS' ? 500 : 0;
    if (edition === 'paperback' && (!shippingLevel || session.shipping_cost?.amount_total !== expectedShippingAmount)) {
      return NextResponse.json({ error: 'Selected Stripe delivery option does not match the approved shipping price.' }, { status: 500 });
    }
    const db = supabaseAdmin();
    const { error } = await db.from('orders').upsert({
      stripe_session_id: session.id, stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      user_id: session.metadata.customer_user_id,
      book_slug: 'how-to-fall-out-of-love', edition, status: 'paid', amount_total: session.amount_total,
      currency: session.currency, customer_email: session.customer_details?.email ?? session.customer_email,
      customer_name: session.customer_details?.name, shipping_address: session.shipping_details?.address ?? null,
      shipping_phone: session.customer_details?.phone ?? null,
      shipping_method: shippingLevel ?? null,
    }, { onConflict: 'stripe_session_id', ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: 'Order could not be recorded.' }, { status: 500 });
    const { data: orderForEmail, error: emailOrderError } = await db.from('orders').select('id,customer_email,edition,amount_total,currency,shipping_method,confirmation_email_status').eq('stripe_session_id', session.id).single();
    if (emailOrderError || !orderForEmail) return NextResponse.json({ error: 'Paid order could not be loaded for its confirmation email.' }, { status: 500 });
    if (orderForEmail.confirmation_email_status !== 'sent') {
      const { data: claimed, error: claimError } = await db.rpc('claim_order_confirmation_email', { p_order_id: orderForEmail.id });
      if (claimError) return NextResponse.json({ error: 'Order confirmation could not be queued.' }, { status: 500 });
      if (claimed) {
        try {
          await sendOrderConfirmation({
            orderId: orderForEmail.id,
            sessionId: session.id,
            email: orderForEmail.customer_email,
            edition: orderForEmail.edition,
            amountTotal: orderForEmail.amount_total,
            currency: orderForEmail.currency,
            shippingMethod: orderForEmail.shipping_method,
            digitalContentConsentAt: session.metadata.digital_content_consent_at ?? null,
          });
          const { error: sentError } = await db.from('orders').update({ confirmation_email_status: 'sent', confirmation_email_sent_at: new Date().toISOString(), confirmation_email_error: null }).eq('id', orderForEmail.id);
          if (sentError) return NextResponse.json({ error: 'Confirmation email was sent but its status could not be saved.' }, { status: 500 });
        } catch {
          await db.from('orders').update({ confirmation_email_status: 'failed', confirmation_email_error: 'The order confirmation could not be delivered. It will be retried automatically.' }).eq('id', orderForEmail.id);
          return NextResponse.json({ error: 'Order confirmation email could not be sent.' }, { status: 500 });
        }
      }
    }
    // Paid paperbacks remain queued until the owner explicitly approves the
    // individual order in the admin dashboard. Stripe webhooks never create
    // billable Lulu print jobs.
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
    if (paymentIntentId) {
      const { error } = await supabaseAdmin().from('orders').update({ status: 'refunded' }).eq('stripe_payment_intent_id', paymentIntentId);
      if (error) return NextResponse.json({ error: 'Refund status could not be recorded.' }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}

