# Deployment and setup checklist

## Domain

The intended address is `https://books.scholarlyinsightsacademia.co.uk`. Connect this repository to Cloudflare Workers Builds and initialize the project with vinext (`npx vinext check`, then `npx vinext init`). Add the hostname as a Worker custom domain in Cloudflare. If Cloudflare already hosts authoritative DNS for the parent domain, it will add/manage the subdomain record. Preserve the current main-site records.

## Private settings

Configure these as Cloudflare Worker secrets or encrypted variables (never in Git): Supabase URL/anon key/service role key, Stripe test secret and webhook signing secret, ebook/paperback Price IDs and paperback shipping-rate ID, Lulu sandbox client key/secret, POD package ID, public HTTPS print-only interior/cover PDF URLs and checksums, Lulu contact email/shipping level, final ebook object path, allowlisted admin email, and the site URL. Create a separate [Lulu sandbox account](https://developers.sandbox.lulu.com/); sandbox API calls go only to its sandbox endpoint and do not create production print orders. Apply migrations `supabase/migrations/0001_shop.sql`, `0002_reviews_and_reporting.sql`, and `0003_lulu_fulfilment.sql`; enable email OTP/magic-link sign-in and configure the `/auth/callback` URL; create the private `ebooks` bucket and upload only the approved final ebook file.

Keep `CHECKOUT_ENABLED=false`, `FULFILMENT_CONFIGURED=false`, and `LAUNCH_CHECKS_PASSED=false` until end-to-end test purchases, webhook replay/refund behavior, ebook authorization, Lulu sandbox shipping and admin access have been reviewed. Lulu requests are restricted to `https://api.sandbox.lulu.com`; sandbox print jobs are not sent to production. This code does not switch to Lulu production. UK paperback shipping uses a configured Stripe shipping rate; international countries remain unavailable until their shipping prices are configured.

## Current completion state

- Ready: responsive storefront, disabled edition buttons, server-side checkout gate, signed Stripe webhook with idempotent paid-order insert and refund updates, private short-lived ebook link endpoint, customer sign-in/account pages, verified-purchase review submission/display/reporting and moderation, admin order/fulfilment dashboard, Lulu sandbox job submission/status refresh, Cloudflare deployment notes.
- Still to implement/configure before selling: email receipts/delivery, final ebook and print files, approved ISBN/trim/POD package, actual credentials/prices/shipping rate, sandbox test sign-off, international shipping rates, Cloudflare deployment and DNS association.
