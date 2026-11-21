# Scholarly Insights Academia Bookshop

A growing bookshop for Scholarly Insights Academia. **How to Fall Out of Love** by Dr Ewuradjoa Mansa Quansah has its own detail page at `/books/how-to-fall-out-of-love`. **The Scholarship Blueprint** is a forthcoming title only; its supplied draft is not final and it is not available to buy.

The storefront uses a calm, classic palette across the collection while each cover keeps its own colours. The EPUB, website reading PDF and Lulu print files are held in private Supabase Storage. Lulu file preparation and validation are complete, and production settings are configured. Paid paperback orders remain queued until the owner approves each individual print request. Live Stripe prices, credentials and webhook are configured. Checkout remains disabled while end-to-end payment, webhook, email, account, download and admin checks are completed.

## Local development

1. Install Node.js 22.23.2 and run `npm install`.
2. Copy `.env.example` to `.env.local`; keep `CHECKOUT_ENABLED=false`.
3. Run `npm run dev` and open `http://localhost:3000`.

## Cloudflare Workers

The repository is connected to the `scholarly-insights-bookshop` Worker at `https://books.scholarlyinsightsacademia.co.uk`. Cloudflare Workers Builds uses `npm run deploy:vinext` as the deploy command and `npm run preview:vinext` for previews. The custom domain is declared in `cloudflare.config.ts`; keep existing main-site DNS records unchanged. See [DEPLOYMENT.md](DEPLOYMENT.md) for the live launch state.

## Supabase and reviews

The Supabase project has the order, verified-purchase review, moderation, fulfilment and order-email schema applied. Its ebooks storage bucket is private with public access disabled; `0005_private_ebook_bucket.sql` records this for new environments. Customer reviews require a completed paid order, are moderated before public display, and can be reported. Paid paperback orders wait for owner approval before any Lulu print request; ebook downloads are granted after payment confirmation.

Customer accounts use email and password, with an email confirmation code during account creation and a recovery code when resetting a password. Administrator access additionally requires an authenticator-app TOTP factor. The public pages do not link to the private admin route; the owner is set only by the `ADMIN_OWNER_EMAIL` Worker secret. Only the owner can grant or revoke staff access. Staff use their own confirmed account, password and authenticator; never share the owner's sign-in. The service-role key stays server-side. Never commit book files or secrets to GitHub.

## Before selling

Stripe is configured in live mode with a £9.99 ebook, £19.99 paperback, basic tracked UK delivery included, priority delivery (+£1), and express delivery (+£5). The live webhook listens for `checkout.session.completed` and `charge.refunded`, but has not yet received an event. The Resend sender is configured; its end-to-end confirmation-email flow still needs checking. Lulu production credentials are encrypted Cloudflare secrets, settings are configured, and automatic print submission remains off. Do not repeat Lulu validation.

The buyer-facing terms, delivery and cancellation information, privacy notice and contact page are published. The seller is not VAT registered and does not charge VAT. Before enabling checkout, complete end-to-end checks for account access, admin MFA and staff permissions, a signed Stripe webhook, order and refund updates, confirmation emails, purchase-gated downloads, verified-purchase review moderation, and the manual per-order Lulu approval flow. Use a test environment; do not create a live customer charge or a Lulu print job as a test. Current launch flags: `FULFILMENT_CONFIGURED=true`, `LAUNCH_CHECKS_PASSED=false`, `CHECKOUT_ENABLED=false`. See [DEPLOYMENT.md](DEPLOYMENT.md).

