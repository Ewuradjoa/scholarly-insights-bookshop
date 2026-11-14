# Scholarly Insights Academia Bookshop

Separate Next.js storefront for **How to Fall Out of Love** by Ewuradjoa Quansah. The public home page is ready for review. The checkout buttons remain disabled and the server checkout endpoint returns `503` until explicitly enabled and all integrations are configured.

## Local development

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env.local`; keep `CHECKOUT_ENABLED=false`.
3. Run `npm run dev` and open `http://localhost:3000`.

## Cloudflare Workers

Cloudflare currently recommends vinext for Next.js projects on Workers. The repository is ready for the migration, but the generated Worker/Vite configuration still needs to be added. From the project folder, run `npx vinext check` and review the report, then run:

```sh
npx vinext init --platform=cloudflare --name=scholarly-insights-bookshop --cdn-cache=none --data-cache=none --image-optimization=none
```

This adds the Cloudflare build configuration without replacing the existing Next.js commands. Review and commit the generated source configuration, then use the generated Cloudflare deploy command when ready. Do not deploy the production shop until provider secrets, final assets, shipping settings, and launch checks are complete. Since vinext is in beta, review compatibility output before production. See [Cloudflare's Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) and the [vinext Cloudflare deployment guide](https://vinext.dev/docs/deploying/cloudflare).

Connect the GitHub repository to Cloudflare Workers Builds, set the production build/deploy commands from the generated setup, and add `books.scholarlyinsightsacademia.co.uk` as a custom domain for the Worker. Cloudflare provisions the needed DNS record after the domain is active in the same Cloudflare account. Keep the existing main website DNS records unchanged.

## Integrations and launch gates

1. Create a Supabase project. Apply migrations `0001_shop.sql`, `0002_reviews_and_reporting.sql`, and `0003_lulu_fulfilment.sql`. Enable email OTP/magic-link sign-in and configure the callback URL to include `/auth/callback`. Keep the service role key server-side only. Set up private `ebooks` storage with no public read policy.
2. Set `ADMIN_EMAILS` to the exact administrator email addresses. Customer sign-in, purchase history, download access, verified review submission, approved review display, review reporting, and allowlisted order/review moderation screens are implemented.
3. In Stripe test mode, create one-time GBP prices and a paperback shipping rate. Set `STRIPE_EBOOK_PRICE_ID`, `STRIPE_PAPERBACK_PRICE_ID`, and `STRIPE_PAPERBACK_SHIPPING_RATE_ID`. Paperback delivery is limited to the UK until country-specific shipping rates are configured. Register `POST /api/stripe/webhook` for `checkout.session.completed` and `charge.refunded`; configure and store the endpoint signing secret. The current webhook persists completed paid sessions idempotently.
4. Store final ebook files in a private Supabase bucket. Configure order-confirmation email delivery before enabling ebook sales. Do not put book files in `public/`.
5. Create a separate [Lulu sandbox account](https://developers.sandbox.lulu.com/) and store its credentials as secrets. Add an HTTPS address for the print-only interior PDF and cover PDF plus their MD5 checksums, the confirmed POD package ID, a Lulu contact email and shipping level. Keep those print files separate from the private ebook. Paid paperback test orders submit a sandbox print job; administrators can refresh job status. Lulu sandbox jobs are not sent to production. See [Lulu's API reference](https://lulu.apidocumentation.com/) and [sandbox details](https://help.api.lulu.com/en/support/solutions/articles/64000306383-do-you-have-a-sandbox-environment-).
6. Configure tax, refund, privacy and customer-support policies; test successful payment, failed/cancelled payment, refund, duplicate webhook, email delivery, ebook download authorization, Lulu sandbox job submission/status refresh, and UK shipping charges.
7. Keep `CHECKOUT_ENABLED=false`. The edition buttons remain disabled while launch settings and final assets are incomplete.

## Reviews

The migrations tie each review to a paid order and authenticated user, permit one review per order, default reviews to pending, and expose only approved reviews publicly. Authenticated reports are limited to one per reader per review. Allowlisted administrators can approve or reject reviews and mark reports reviewed or dismissed. The customer account can review eligible paid orders; the product page shows approved notes and an average rating.

## Secrets

Never commit `.env.local`, service-role keys, Stripe keys, webhook secrets, or Lulu credentials. Use Cloudflare Worker secrets for production and the local environment file for local development. Do not paste keys into chat.
