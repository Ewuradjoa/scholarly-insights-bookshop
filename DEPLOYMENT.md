# Deployment and setup checklist

## Domain

The intended address is `https://books.scholarlyinsightsacademia.co.uk`. The repository is set up for Cloudflare Workers Builds with vinext. Use an empty build command, `npm run deploy:vinext` as the deploy command, and `npm run preview:vinext` for previews. Add the custom domain when launch settings and final book files are ready, and preserve existing main-site DNS records.

## Supabase and private files

The current project has the bookshop order, verified review, moderation, fulfilment and order-email schema applied. The `ebooks` storage bucket is private with public access disabled. `supabase/migrations/0005_private_ebook_bucket.sql` records this for new environments. Enable email sign-in and configure `/auth/callback`. Keep the service-role key server-side. Upload only an approved final ebook to private storage; never put book files in `public/` or GitHub.

## Provider configuration

Add Supabase, Stripe test, Resend and Lulu sandbox credentials as Cloudflare secrets, never in Git or chat. Configure GBP ebook and paperback prices, UK paperback shipping, the Stripe webhook, verified email sender, and Lulu sandbox package plus print-only interior and cover PDFs. Keep the print files separate from the ebook. Lulu requests remain restricted to `https://api.sandbox.lulu.com`.

Keep `CHECKOUT_ENABLED=false`, `FULFILMENT_CONFIGURED=false` and `LAUNCH_CHECKS_PASSED=false` until payment, refund, webhook replay, email, ebook access, Lulu fulfilment and admin access have all been reviewed. Configure international shipping and customer-support, tax and refund policies before offering those options.

## Current state

- Supabase schema and private ebook bucket are set up.
- The repository includes the multi-book storefront, disabled checkout gate, Stripe webhook, private ebook delivery, verified reviews, admin order dashboard and Lulu sandbox integration.
- Still needed before selling: final book files and print specifications, provider credentials and prices, sandbox sign-off, and the Cloudflare custom domain.
