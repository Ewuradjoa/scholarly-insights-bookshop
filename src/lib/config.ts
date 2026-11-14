export function checkoutReady() {
  const validLuluShippingLevels = ['MAIL', 'PRIORITY_MAIL', 'GROUND', 'EXPEDITED', 'EXPRESS'];
  return process.env.CHECKOUT_ENABLED === 'true'
    && Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
    && Boolean(process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY)
    && Boolean(process.env.STRIPE_EBOOK_PRICE_ID && process.env.STRIPE_PAPERBACK_PRICE_ID && process.env.STRIPE_PAPERBACK_SHIPPING_RATE_ID)
    && Boolean(process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_FROM)
    && Boolean(process.env.EBOOK_PRIVATE_BUCKET && process.env.EBOOK_OBJECT_PATH)
    && Boolean(process.env.LULU_CLIENT_KEY && process.env.LULU_CLIENT_SECRET && process.env.LULU_SANDBOX === 'true')
    && process.env.LULU_PRINT_API_BASE === 'https://api.sandbox.lulu.com'
    && Boolean(process.env.LULU_CONTACT_EMAIL && process.env.LULU_POD_PACKAGE_ID)
    && Boolean(process.env.LULU_INTERIOR_URL && process.env.LULU_INTERIOR_MD5 && process.env.LULU_COVER_URL && process.env.LULU_COVER_MD5)
    && validLuluShippingLevels.includes(process.env.LULU_SHIPPING_LEVEL ?? '')
    && process.env.FULFILMENT_CONFIGURED === 'true'
    && process.env.LAUNCH_CHECKS_PASSED === 'true';
}

export function adminAllowlist() {
  return (process.env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}
