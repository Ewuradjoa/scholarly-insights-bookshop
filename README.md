# Scholarly Insights Academia Bookshop

Separate Next.js storefront for **How to Fall Out of Love** by Ewuradjoa Quansah. The public home page is ready for review. The checkout buttons remain disabled and the server checkout endpoint returns `503` until explicitly enabled and all integrations are configured.

## Local development

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env.local`; keep `CHECKOUT_ENABLED=false`.
3. Run `npm run dev` and open `http://localhost:3000`.

## Cloudflare Workers

Cloudflare currently recommends vinext for new full-stack Next.js projects on Workers. This app is prepared with vinext packages and scripts; run `npx vinext check`, then `npx vinext init` and follow the Cloudflare Workers setup for the generated configuration before deployment. Deploy with `npx @vinext/cloudflare deploy`. Since vinext is in beta, review its compatibility output before production. See [Cloudflare's Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).

Connect the GitHub repository to Cloudflare Workers Builds, set the production build/deploy commands from the generated setup, and add `books.scholarlyinsightsacademia.co.uk` as a custom domain for the Worker. Cloudflare provisions the needed DNS record after the domain is active in the same Cloudflare account. Keep the existing main website DNS records unchanged.

## Integrations and launch gates

1. Create a Supabase project. Apply `supabase/migrations/0001_shop.sql`. Enable verified email sign-in. Keep the service role key server-side only. Set up private `ebooks` storage with no public read policy.
2. Add a buyer account sign-in flow before checkout. Set `ADMIN_EMAILS` to the exact administrator email addresses. The current page includes an administrator landing view; the authentication tenant and full order moderation controls still need configuration/implementation.
3. In Stripe test mode, create two one-time prices in GBP and set `STRIPE_EBOOK_PRICE_ID` and `STRIPE_PAPERBACK_PRICE_ID`. Register `POST /api/stripe/webhook` for `checkout.session.completed`, `charge.refunded`, and `checkout.session.expired`; configure and store the endpoint signing secret. The current webhook persists completed paid sessions idempotently.
4. Store final ebook files in a private Supabase bucket. Implement short-lived signed download links and order confirmation email delivery before enabling ebook sales. Do not put book files in `public/`.
5. Configure Lulu developer sandbox credentials and validate the final print-ready interior, cover, trim size, ISBN and shipping/print settings. Implement order submission and status reconciliation against Lulu's current API contract; no live Lulu calls are made by this starter.
6. Configure tax, refund, privacy and customer-support policies; test successful payment, failed/cancelled payment, refund, duplicate webhook, ebook download authorization and paperback fulfilment in test mode.
7. Only after all launch gates pass, set `CHECKOUT_ENABLED=true`, provide all price IDs and fulfillment settings, and change the checkout button UI to submit to `/api/checkout`.

## Reviews

The migration ties each review to a paid order and authenticated user, permits one review per order, defaults reviews to pending, and exposes only approved reviews to the public. Report counts and moderation fields are present. The customer report endpoint and administrator moderation interface are intentionally not live yet; build and validate authenticated abuse/report controls before collecting public reviews. Approved review display and average-rating UI are also pending.

## Secrets

Never commit `.env.local`, service-role keys, Stripe keys, webhook secrets, or Lulu credentials. Use Cloudflare Worker secrets for production and the local environment file for local development. Do not paste keys into chat.
