# Deployment and setup checklist

## Domain

The intended address is `https://books.scholarlyinsightsacademia.co.uk`. Cloudflare's current Next.js path uses vinext. From the repository root, first run `npx vinext check` and review compatibility, then initialize the Cloudflare configuration:

```sh
npx vinext init --platform=cloudflare --name=scholarly-insights-bookshop --cdn-cache=none --data-cache=none --image-optimization=none
```

Commit the generated `vite.config.ts`, `cloudflare.config.ts`, and updated package scripts. Connect the repository to Cloudflare Workers Builds only after the generated configuration is committed. The intended hostname is a Worker custom domain: `books.scholarlyinsightsacademia.co.uk`. If Cloudflare hosts authoritative DNS for the parent domain, it can create/manage the subdomain record when the custom domain is added. Preserve the current main-site records.

## Private settings

Configure these as Cloudflare Worker secrets or encrypted variables (never in Git): Supabase URL/anon key/service role key, Stripe test secret and webhook signing secret, ebook/paperback Price IDs and paperback shipping-rate ID, Resend API key and verified sender address, Lulu sandbox client key/secret, POD package ID, public HTTPS print-only interior/cover PDF URLs and checksums, Lulu contact email/shipping level, final ebook object path, allowlisted admin email, and the site URL. Resend sends an idempotent order confirmation after Stripe confirms payment; the message links to the customer account and never includes the ebook file. Create a separate [Lulu sandbox account](https://developers.sandbox.lulu.com/); sandbox API calls go only to its sandbox endpoint and do not create production print orders. Apply migrations `supabase/migrations/0001_shop.sql`, `0002_reviews_and_reporting.sql`, `0003_lulu_fulfilment.sql`, and `0004_order_confirmations.sql`; enable email OTP/magic-link sign-in and configure the `/auth/callback` URL; create the private `ebooks` bucket and upload only the approved final ebook file.

Keep `CHECKOUT_ENABLED=false`, `FULFILMENT_CONFIGURED=false`, and `LAUNCH_CHECKS_PASSED=false` until end-to-end test purchases, webhook replay/refund behavior, ebook authorization, Lulu sandbox shipping and admin access have been reviewed. Lulu requests are restricted to `https://api.sandbox.lulu.com`; sandbox print jobs are not sent to production. This code does not switch to Lulu production. UK paperback shipping uses a configured Stripe shipping rate; international countries remain unavailable until their shipping prices are configured.

## Current completion state

- Ready: responsive storefront, disabled edition buttons, server-side checkout gate, signed Stripe webhook with idempotent paid-order insert and refund updates, retryable order-confirmation email, private short-lived ebook link endpoint, customer sign-in/account pages, verified-purchase review submission/display/reporting and moderation, admin order/fulfilment dashboard, Lulu sandbox job submission/status refresh, Cloudflare deployment notes.
- Still to configure before selling: Resend account and verified sender, final ebook and print files, approved ISBN/trim/POD package, actual credentials/prices/shipping rate, sandbox test sign-off, international shipping rates, Cloudflare deployment and DNS association.
