export function checkoutReady() {
  return process.env.CHECKOUT_ENABLED === 'true'
    && Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
    && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    && Boolean(process.env.STRIPE_EBOOK_PRICE_ID && process.env.STRIPE_PAPERBACK_PRICE_ID)
    && Boolean(process.env.EBOOK_PRIVATE_BUCKET && process.env.EBOOK_OBJECT_PATH)
    && Boolean(process.env.LULU_CLIENT_KEY && process.env.LULU_CLIENT_SECRET && process.env.LULU_SANDBOX === 'true')
    && Boolean(process.env.LULU_PRINT_FILE_ID && process.env.LULU_PRINT_PRODUCT_ID)
    && process.env.FULFILMENT_CONFIGURED === 'true'
    && process.env.LAUNCH_CHECKS_PASSED === 'true';
}

export function adminAllowlist() {
  return (process.env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}
