export function checkoutReady() {
  const mode = process.env.STRIPE_MODE;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const correctStripeKey = mode === 'live'
    ? (secretKey?.startsWith('sk_live_') || secretKey?.startsWith('rk_live_'))
    : mode === 'test' && (secretKey?.startsWith('sk_test_') || secretKey?.startsWith('rk_test_'));
  return process.env.CHECKOUT_ENABLED === 'true'
    && Boolean(correctStripeKey && process.env.STRIPE_WEBHOOK_SECRET)
    && Boolean(process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY)
    && Boolean(process.env.STRIPE_EBOOK_PRICE_ID && process.env.STRIPE_PAPERBACK_PRICE_ID)
    && Boolean(process.env.STRIPE_PAPERBACK_BASIC_SHIPPING_RATE_ID && process.env.STRIPE_PAPERBACK_PRIORITY_SHIPPING_RATE_ID && process.env.STRIPE_PAPERBACK_EXPRESS_SHIPPING_RATE_ID)
    && new Set([process.env.STRIPE_PAPERBACK_BASIC_SHIPPING_RATE_ID, process.env.STRIPE_PAPERBACK_PRIORITY_SHIPPING_RATE_ID, process.env.STRIPE_PAPERBACK_EXPRESS_SHIPPING_RATE_ID]).size === 3
    && Boolean(process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_FROM)
    && Boolean(process.env.EBOOK_PRIVATE_BUCKET && process.env.EBOOK_OBJECT_PATH && process.env.EBOOK_PDF_OBJECT_PATH)
    && process.env.LULU_MODE === 'production'
    && Boolean(process.env.LULU_PRODUCTION_CLIENT_KEY && process.env.LULU_PRODUCTION_CLIENT_SECRET && process.env.LULU_SANDBOX === 'false')
    && process.env.LULU_PRINT_API_BASE === 'https://api.lulu.com'
    && Boolean(process.env.LULU_CONTACT_EMAIL && process.env.LULU_POD_PACKAGE_ID)
    && Boolean(process.env.LULU_FILES_BUCKET && process.env.LULU_INTERIOR_OBJECT_PATH && process.env.LULU_INTERIOR_MD5 && process.env.LULU_COVER_OBJECT_PATH && process.env.LULU_COVER_MD5)
    && process.env.LULU_AUTO_SUBMIT === 'false'
    && process.env.FULFILMENT_CONFIGURED === 'true'
    && process.env.LAUNCH_CHECKS_PASSED === 'true';
}

export function adminAllowlist() {
  return (process.env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}
