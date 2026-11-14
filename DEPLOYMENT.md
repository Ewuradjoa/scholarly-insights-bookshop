# Deployment and setup checklist

## Domain

The intended address is `https://books.scholarlyinsightsacademia.co.uk`. Connect this repository to Cloudflare Workers Builds and initialize the project with vinext (`npx vinext check`, then `npx vinext init`). Add the hostname as a Worker custom domain in Cloudflare. If Cloudflare already hosts authoritative DNS for the parent domain, it will add/manage the subdomain record. Preserve the current main-site records.

## Private settings

Configure these as Cloudflare Worker secrets or encrypted variables (never in Git): Supabase URL/anon key/service role key, Stripe test secret and webhook signing secret, both Stripe Price IDs, Lulu sandbox client key/secret and print identifiers, final ebook object path, allowlisted admin email, and the site URL. Apply `supabase/migrations/0001_shop.sql`; enable email-confirmed customer login; create the private `ebooks` bucket and upload only the approved final ebook file.

Keep `CHECKOUT_ENABLED=false`, `FULFILMENT_CONFIGURED=false`, and `LAUNCH_CHECKS_PASSED=false` until end-to-end test purchases, webhook replay/refund behavior, ebook authorization, Lulu sandbox shipping and admin access have been reviewed. Only then may those gates be changed to `true`.

## Current completion state

- Ready: responsive storefront, disabled edition buttons, server-side checkout gate, signed Stripe webhook foundation with idempotent paid-order insert, private short-lived ebook link endpoint, verified-purchase review insert policy/schema, initial private admin overview, Cloudflare deployment notes.
- Still to implement/configure before selling: buyer sign-in UI and email flows, connect product/review data to storefront, review form and average-rating display, review abuse reporting, moderator approve/reject workflow, full order detail and fulfilment dashboard, email receipts/delivery, Stripe refunds and event handling, Lulu order submission/status sync, final book/cover assets, shipping/ISBN/trim configuration, actual credentials/price IDs, test sign-off, Cloudflare deployment and DNS association.
- A `501` is returned for review reports until authenticated reporting and abuse controls are implemented. This keeps public review collection from silently accepting unhandled reports.
