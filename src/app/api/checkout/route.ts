import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { checkoutReady } from '@/lib/config';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!checkoutReady()) return NextResponse.json({ error: 'Checkout is not available yet.' }, { status: 503 });
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!stripeSecret || !siteUrl) return NextResponse.json({ error: 'Checkout configuration is incomplete.' }, { status: 503 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || !('edition' in body) || !['ebook', 'paperback'].includes(String(body.edition))) {
    return NextResponse.json({ error: 'Choose a valid edition.' }, { status: 400 });
  }

  const edition = body.edition as 'ebook' | 'paperback';
  const digitalContentConsent = 'digitalContentConsent' in body && body.digitalContentConsent === true;
  if (edition === 'ebook' && !digitalContentConsent) {
    return NextResponse.json({ error: 'Please confirm that you consent to immediate ebook delivery before checkout.' }, { status: 400 });
  }
  const authorization = request.headers.get('authorization');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!authorization?.startsWith('Bearer ') || !supabaseUrl || !anonKey) return NextResponse.json({ error: 'Sign in before checkout so your order and review eligibility can be securely linked.' }, { status: 401 });
  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in before checkout.' }, { status: 401 });
  if (!user.email) return NextResponse.json({ error: 'Your account needs an email address before checkout.' }, { status: 400 });
  const price = edition === 'ebook' ? process.env.STRIPE_EBOOK_PRICE_ID : process.env.STRIPE_PAPERBACK_PRICE_ID;
  if (!price) return NextResponse.json({ error: 'This edition is not configured.' }, { status: 503 });

  const paperbackShippingRates = edition === 'paperback'
    ? [
        process.env.STRIPE_PAPERBACK_BASIC_SHIPPING_RATE_ID,
        process.env.STRIPE_PAPERBACK_PRIORITY_SHIPPING_RATE_ID,
        process.env.STRIPE_PAPERBACK_EXPRESS_SHIPPING_RATE_ID,
      ].filter((rate): rate is string => Boolean(rate))
    : [];
  if (edition === 'paperback' && paperbackShippingRates.length !== 3) {
    return NextResponse.json({ error: 'Paperback delivery options are not fully configured.' }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecret);
  const digitalContentConsentAt = edition === 'ebook' ? new Date().toISOString() : undefined;
  const expectedAmount = edition === 'ebook' ? 999 : 1999;
  const configuredPrice = await stripe.prices.retrieve(price).catch(() => null);
  if (!configuredPrice?.active || configuredPrice.currency !== 'gbp' || configuredPrice.unit_amount !== expectedAmount || configuredPrice.type !== 'one_time') {
    return NextResponse.json({ error: 'This edition’s Stripe price is not configured to the approved UK price.' }, { status: 503 });
  }
  const shippingOptions = [];
  if (edition === 'paperback') {
    for (const rateId of paperbackShippingRates) {
      const rate = await stripe.shippingRates.retrieve(rateId).catch(() => null);
      const expectedShippingAmount = rateId === process.env.STRIPE_PAPERBACK_PRIORITY_SHIPPING_RATE_ID
        ? 100
        : rateId === process.env.STRIPE_PAPERBACK_EXPRESS_SHIPPING_RATE_ID ? 500 : 0;
      if (!rate?.active || rate.type !== 'fixed_amount' || rate.fixed_amount?.currency !== 'gbp' || rate.fixed_amount.amount !== expectedShippingAmount) {
        return NextResponse.json({ error: 'A paperback delivery price is not configured correctly.' }, { status: 503 });
      }
      shippingOptions.push({ shipping_rate: rateId });
    }
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', payment_method_types: ['card'], line_items: [{ price, quantity: 1 }], billing_address_collection: 'required', customer_email: user.email,
    shipping_address_collection: edition === 'paperback' ? { allowed_countries: ['GB'] } : undefined,
    shipping_options: edition === 'paperback' ? shippingOptions : undefined,
    phone_number_collection: edition === 'paperback' ? { enabled: true } : undefined,
    success_url: `${siteUrl}/order/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/books/how-to-fall-out-of-love#editions`,
    metadata: {
      book_slug: 'how-to-fall-out-of-love', edition, customer_user_id: user.id,
      digital_content_consent: edition === 'ebook' ? 'accepted' : 'not_applicable',
      ...(digitalContentConsentAt ? { digital_content_consent_at: digitalContentConsentAt } : {}),
    },
  });
  return NextResponse.json({ url: session.url });
}

