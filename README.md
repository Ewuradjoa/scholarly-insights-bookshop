# Scholarly Insights Academia Bookshop

A growing bookshop for Scholarly Insights Academia. **How to Fall Out of Love** by Ewuradjoa Quansah has its own detail page at /books/how-to-fall-out-of-love. **The Scholarship Blueprint** by Ewuradjoa Mansa Quansah is a forthcoming title only: its supplied draft is not final and it is not available to buy.

The storefront uses a calm, classic palette across the collection while each cover keeps its own colours. The EPUB and website reading PDF are already in the private Supabase bucket for purchase-gated delivery. The paperback still needs a Lulu-approved print package. Checkout remains disabled until prices, fulfilment settings and integrations are ready and tested.

## Local development

1. Install Node.js 22.23.2 and run npm install.
2. Copy .env.example to .env.local; keep CHECKOUT_ENABLED=false.
3. Run npm run dev and open http://localhost:3000.

## Cloudflare Workers

Connect this repository to the scholarly-insights-bookshop Worker. Leave the build command empty; use npm run deploy:vinext as the deploy command and npm run preview:vinext for previews. Add books.scholarlyinsightsacademia.co.uk as a custom domain when the launch configuration is ready. Keep existing main-site DNS records unchanged. Run npm run cf:check before launch.

## Supabase and reviews

The current Supabase project has the order, verified-purchase review, moderation, fulfilment and order-email schema applied. Its ebooks storage bucket is private with public access disabled; 0005_private_ebook_bucket.sql records this for new environments. Customer reviews require a completed paid order, are moderated before public display, and can be reported.

Email magic-link sign-in is enabled. Supabase redirects are configured for the current Workers preview, local development and planned shop domain, using `/auth/callback`. Before admin access is available, set `ADMIN_EMAILS` to the administrator's exact email address in Cloudflare secrets. Keep the service-role key server-side. The EPUB and website reading PDF are in the private bucket at `how-to-fall-out-of-love/How_to_Fall_Out_of_Love.epub` and `how-to-fall-out-of-love/How_to_Fall_Out_of_Love_Website_Edition.pdf`; the Worker config points to these objects. Never commit book files or secrets to GitHub.

## Before selling

Add Supabase project URL and public anon key plus the server-only service-role key as Cloudflare secrets. Add Stripe test credentials, prices, and the three UK paperback delivery rate IDs (basic included, priority upgrade, express upgrade); set up Resend, set `ADMIN_EMAILS`, and configure Lulu sandbox with an approved full-wrap cover and print-ready interior. The available print interior is 6 × 9 inches and 103 pages; the existing cover image is front-only. Review tax, refund and support policies and complete end-to-end payment, webhook, download, email, fulfilment and admin checks. Keep `CHECKOUT_ENABLED=false`, `FULFILMENT_CONFIGURED=false` and `LAUNCH_CHECKS_PASSED=false` until those checks are approved. See [DEPLOYMENT.md](DEPLOYMENT.md) for details.
