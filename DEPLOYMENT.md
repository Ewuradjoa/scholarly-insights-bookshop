# Deployment and setup checklist

## Domain

The intended address is `https://books.scholarlyinsightsacademia.co.uk`. The repository is configured for Cloudflare Workers using vinext. It pins Node.js 22.23.2 for Workers Builds because the current Cloudflare deploy CLI requires a newer runtime than the Workers Builds default. Run `npm run cf:check` and review compatibility before launch.

Connect this repository to a Cloudflare Worker named `scholarly-insights-bookshop` using these build settings: leave the build command empty, set deploy command to `npm run deploy:vinext`, and preview command to `npm run preview:vinext`. Add the hostname as a Worker custom domain. If Cloudflare hosts authoritative DNS for the parent domain, it can create/manage the subdomain record. Preserve the current main-site records. Keep checkout disabled while the shop is being reviewed and until launch requirements are complete.

## Private settings

Configure these as Cloudflare Worker secrets or encrypted variables (never in Git): Supabase URL/anon key/service role key, Stripe test secret and webhook signing secret, ebook/paperback Price IDs and paperback shipping-rate ID, Resend API key and verified sender address, Lulu sandbox client key/secret, POD package ID, public HTTPS print-only interior/cover PDF URLs and checksums, Lulu contact email/shipping level, final ebook object path, allowlisted admin email, and the site URL. Resend sends an idempotent order confirmation after Stripe confirms payment; the message links to the customer account and never includes the ebook file. Create a separate [Lulu sandbox account](https://developers.sandbox.lulu.com/); sandbox API calls go only to its sandbox endpoint and do not create production print orders. Apply migrations `supabase/migrations/0001_shop.sql`, `0002_reviews_and_reporting.sql`, `0003_lulu_fulfilment.sql`, and `0004_order_confirmations.sql`; enable email OTP/magic-link sign-in and configure the `/auth/callback` URL; create the private `ebooks` bucket and upload only the approved final ebook file.

Keep `CHECKOUT_ENABLED=false`, `FULFILMENT_CONFIGURED=false`, and `LAUNCH_CHECKS_PASSED=false` until end-to-end test purchases, webhook replay/refund behavior, ebook authorization, Lulu sandbox shipping and admin access have been reviewed. Lulu requests are restricted to `https://api.sandbox.lulu.com`; sandbox print jobs are not sent to production. This code does not switch to Lulu production. UK paperback shipping uses a configured Stripe shipping rate; international countries remain unavailable until their shipping prices are configured.

## Current completion state

- Ready: responsive storefront, disabled edition buttons, server-side checkout gate, signed Stripe webhook with idempotent paid-order insert and refund updates, retryable order-confirmation email, private short-lived ebook link endpoint, customer sign-in/account pages, verified-purchase review submission/display/reporting and moderation, admin order/fulfilment dashboard, Lulu sandbox job submission/status refresh, Cloudflare deployment notes.
- Still to configure before selling: Resend account and verified sender, final ebook and print files, approved ISBN/trim/POD package, actual credentials/prices/shipping rate, sandbox test sign-off, international shipping rates, Cloudflare deployment and DNS association.
