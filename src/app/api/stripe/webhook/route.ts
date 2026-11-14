import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { submitSandboxPrintJob } from '@/lib/lulu';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signingSecret) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, signingSecret); }
  catch { return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 }); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== 'paid' || session.metadata?.book_slug !== 'how-to-fall-out-of-love' || !session.metadata.customer_user_id) return NextResponse.json({ received: true });
    const edition = session.metadata.edition;
    if (edition !== 'ebook' && edition !== 'paperback') return NextResponse.json({ received: true });
    const db = supabaseAdmin();
    const { error } = await db.from('orders').upsert({
      stripe_session_id: session.id, stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      user_id: session.metadata.customer_user_id,
      book_slug: 'how-to-fall-out-of-love', edition, status: 'paid', amount_total: session.amount_total,
      currency: session.currency, customer_email: session.customer_details?.email ?? session.customer_email,
      customer_name: session.customer_details?.name, shipping_address: session.shipping_details?.address ?? null,
      shipping_phone: session.customer_details?.phone ?? null,
    }, { onConflict: 'stripe_session_id', ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: 'Order could not be recorded.' }, { status: 500 });
    if (edition === 'paperback') {
      const { data: order, error: lookupError } = await db.from('orders').select('id,shipping_address,shipping_phone,customer_name,customer_email,fulfilment_status').eq('stripe_session_id', session.id).single();
      if (lookupError || !order) return NextResponse.json({ error: 'Paid order could not be loaded for fulfilment.' }, { status: 500 });
      if (order.fulfilment_status === 'not_started') {
        const { data: claimed, error: claimError } = await db.rpc('claim_lulu_submission', { p_order_id: order.id });
        if (claimError) return NextResponse.json({ error: 'Paperback fulfilment could not be queued.' }, { status: 500 });
        if (claimed?.length) {
          try {
            const job = await submitSandboxPrintJob({ orderId: order.id, shippingAddress: order.shipping_address, phone: order.shipping_phone, customerName: order.customer_name });
            const { error: saveError } = await db.from('orders').update({ lulu_job_id: job.id, fulfilment_status: 'submitted', fulfilment_error: null }).eq('id', order.id);
            if (saveError) return NextResponse.json({ error: 'Print job was submitted but its reference could not be saved.' }, { status: 500 });
          } catch {
            await db.from('orders').update({ fulfilment_status: 'submission_failed', fulfilment_error: 'Lulu sandbox rejected or could not accept this print job. Review the order and print settings before retrying.' }).eq('id', order.id);
            return NextResponse.json({ error: 'Paperback fulfilment submission failed.' }, { status: 500 });
          }
        }
      }
    }
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
