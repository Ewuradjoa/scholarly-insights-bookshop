# Deployment and setup checklist

## Domain

The intended address is `https://books.scholarlyinsightsacademia.co.uk`. Connect this repository to Cloudflare Workers Builds and initialize the project with vinext (`npx vinext check`, then `npx vinext init`). Add the hostname as a Worker custom domain in Cloudflare. If Cloudflare already hosts authoritative DNS for the parent domain, it will add/manage the subdomain record. Preserve the current main-site records.

## Private settings

Configure these as Cloudflare Worker secrets or encrypted variables (never in Git): Supabase URL/anon key/service role key, Stripe test secret and webhook signing secret, both Stripe Price IDs, Lulu sandbox client key/secret and print identifiers, final ebook object path, allowlisted admin email, and the site URL. Apply migrations `supabase/migrations/0001_shop.sql` and `0002_reviews_and_reporting.sql`; enable email OTP/magic-link sign-in and configure the `/auth/callback` URL; create the private `ebooks` bucket and upload only the approved final ebook file.

Keep `CHECKOUT_ENABLED=false`, `FULFILMENT_CONFIGURED=false`, and `LAUNCH_CHECKS_PASSED=false` until end-to-end test purchases, webhook replay/refund behavior, ebook authorization, Lulu sandbox shipping and admin access have been reviewed. Only then may those gates be changed to `true`.

## Current completion state

- Ready: responsive storefront, disabled edition buttons, server-side checkout gate, signed Stripe webhook foundation with idempotent paid-order insert, private short-lived ebook link endpoint, customer sign-in and account pages, verified-purchase review submission/display/reporting and moderation, admin order/fulfilment dashboard, Cloudflare deployment notes.
- Still to implement/configure before selling: email receipts/delivery, Stripe refunds and event handling, Lulu order submission/status sync, final book/cover assets, shipping/ISBN/trim configuration, actual credentials/price IDs, test sign-off, Cloudflare deployment and DNS association.
