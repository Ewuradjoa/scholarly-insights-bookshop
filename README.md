# Scholarly Insights Academia Bookshop

A growing bookshop for Scholarly Insights Academia. **How to Fall Out of Love** by Ewuradjoa Quansah has its own detail page at /books/how-to-fall-out-of-love. **The Scholarship Blueprint** by Ewuradjoa Mansa Quansah is a forthcoming title only: its supplied draft is not final and it is not available to buy.

The storefront uses a calm, classic palette across the collection while each cover keeps its own colours. The EPUB and website reading PDF are already in the private Supabase bucket for purchase-gated delivery. Lulu validation and print-file preparation have already been completed; the remaining print setup is to add the accepted package and stable file locations to Worker settings. Live Stripe prices and secrets are configured, and the webhook is active. Checkout remains disabled until Lulu settings, end-to-end launch checks and buyer-facing policies are complete.

## Local development

1. Install Node.js 22.23.2 and run npm install.
2. Copy .env.example to .env.local; keep CHECKOUT_ENABLED=false.
3. Run npm run dev and open http://localhost:3000.

## Cloudflare Workers

Connect this repository to the scholarly-insights-bookshop Worker. Leave the build command empty; use npm run deploy:vinext as the deploy command and npm run preview:vinext for previews. The Worker is connected to books.scholarlyinsightsacademia.co.uk; its custom domain is also declared in cloudflare.config.ts so future deployments keep using the same address. Keep existing main-site DNS records unchanged. Checkout and fulfilment launch flags must stay false until the deployment checklist is complete. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Supabase and reviews

The current Supabase project has the order, verified-purchase review, moderation, fulfilment and order-email schema applied. Its ebooks storage bucket is private with public access disabled; 0005_private_ebook_bucket.sql records this for new environments. Customer reviews require a completed paid order, are moderated before public display, and can be reported. Paid paperback orders wait for owner approval before any Lulu print request; ebook downloads are granted after payment confirmation.

Customer accounts use email and password, with an email confirmation code during account creation and an email recovery code only when resetting a password. Administrator access additionally requires an authenticator-app TOTP factor, enforced on the dashboard and its APIs. The public book pages do not link to the private admin route; guessing its URL does not grant access. The owner is set only by the `ADMIN_OWNER_EMAIL` Worker secret. Only the owner can grant or revoke staff access in the order desk. Staff must create and confirm their own bookshop account first, then use their own password and authenticator; never share the owner's sign-in. Staff permissions are checked server-side on every admin request and can be revoked immediately. Supabase Auth's default Site URL is the public shop domain, and its callback allow-list includes that domain and local development. The production `workers.dev` URL is disabled in Cloudflare; preview URLs remain available for development. Keep the service-role key server-side. The EPUB and website reading PDF are in the private bucket at `how-to-fall-out-of-love/How_to_Fall_Out_of_Love.epub` and `how-to-fall-out-of-love/How_to_Fall_Out_of_Love_Website_Edition.pdf`; the Worker config points to these objects. Never commit book files or secrets to GitHub.

## Before selling

Supabase project URL, public key, server-only service key and `ADMIN_OWNER_EMAIL` are configured in Cloudflare. Stripe is configured in live mode with £9.99 ebook and £19.99 paperback prices, agreed UK delivery upgrades, a restricted live key and an active webhook. The webhook has not received an event yet. The Resend API key is stored as a Cloudflare secret and the verified sender is `Scholarly Insights Academia Bookshop <orders@scholarlyinsightsacademia.co.uk>`; sending still needs an end-to-end confirmation-email check. Lulu validation was completed during setup and must not be repeated. Finish Lulu Worker settings for the contact email, accepted package ID and stable file URLs/checksums. Review tax, refund and support policies and complete end-to-end payment, webhook, download, email, fulfilment and admin checks. Keep `CHECKOUT_ENABLED=false`, `FULFILMENT_CONFIGURED=false` and `LAUNCH_CHECKS_PASSED=false` until those checks are approved. See [DEPLOYMENT.md](DEPLOYMENT.md) for details.
