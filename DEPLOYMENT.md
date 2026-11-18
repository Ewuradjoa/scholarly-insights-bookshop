# Deployment and launch checklist

## Current live setup

- Cloudflare Worker: scholarly-insights-bookshop at https://scholarly-insights-bookshop.scholarlyinsightsconsulting.workers.dev.
- Intended shop address: https://books.scholarlyinsightsacademia.co.uk. The custom domain has not been added yet.
- Checkout is disabled. The worker config explicitly keeps CHECKOUT_ENABLED, FULFILMENT_CONFIGURED and LAUNCH_CHECKS_PASSED false.
- Supabase project has the shop schema, email sign-in redirects and a private ebooks bucket.
- The private bucket contains how-to-fall-out-of-love/How_to_Fall_Out_of_Love.epub and how-to-fall-out-of-love/How_to_Fall_Out_of_Love_Website_Edition.pdf. cloudflare.config.ts sets these object paths. No book files belong in public/ or GitHub.
- The Scholarship Blueprint is a forthcoming catalogue listing. Its supplied cover is a draft and it is not for sale.
- The How to Fall Out of Love back-cover panel and full-wrap concept are available in the workspace review outputs. The chosen imprint is Scholarly Insights Academia; no ISBN is being purchased. This edition is for the author's own shop using the Lulu Print API, with no Global Distribution or barcode.

## Remaining before checkout can be enabled

1. Lulu print package: use How_to_Fall_Out_of_Love_Final_Interior_Production.pdf (6 × 9 inches, 103 pages) after Lulu preflight accepts it. The current front image is 1024 × 1536 pixels, about 171 PPI at 6 × 9 inches; Lulu's cover specification requires embedded images to be at least 300 PPI. Obtain print-resolution front artwork, create the project in Lulu, choose final trim/paper/ink settings, download its project-specific cover template, and place the approved back and front artwork into that template. Review and approve the proof. Keep the print interior and wrap cover separate from the website PDF and EPUB.
2. Paperback price and delivery: the agreed customer price is £19.99 with basic UK tracked delivery included; priority and express are +£1 and +£5. The Stripe test products and rates are active and configured on the Worker, and their non-secret test IDs are recorded in cloudflare.config.ts. Lulu's public calculator currently estimates £3.55 to print and £4.04 for UK trackable Mail (7–9 business days), with Priority Mail at £5.04 (6–8 days) and Express at £9.04 (5–7 days). This estimate assumes 6 × 9 in, 103 pages, standard black-and-white, 60# cream paper and matte cover. These are starting estimates, not the final project or postcode-specific quote. The £19.99 base price covers the current £7.59 print-plus-Mail estimate before Stripe fees, tax, or any other provider charges. Confirm the actual Lulu sandbox cost and selected print specifications before finalizing margins.
3. Provider setup: verify the existing Supabase server key, Stripe test key, Stripe webhook secret and ADMIN_EMAILS in Cloudflare; add Resend and Lulu sandbox credentials as Worker secrets. Never put secrets in Git or chat.
4. Lulu sandbox: configure the package ID and stable print-file URLs plus checksums. The current package candidate from the calculator is 0600X0900.BW.STD.PB.060UC444.MXX; confirm it against accepted Lulu print files and the Lulu project before using it. LULU_PRINT_API_BASE must remain https://api.sandbox.lulu.com during testing.
5. End-to-end review: verify sign-in and admin access, successful and failed payments, webhook replay and refunds, confirmation email, paid-only EPUB/PDF access, review eligibility/moderation/reporting, and sandbox paperback fulfilment/status updates.
6. Launch setup: review customer support, tax and refund information. After all checks pass, configure the custom domain while preserving existing main-site DNS records. Only then enable checkout and fulfilment.

Do not set CHECKOUT_ENABLED=true, FULFILMENT_CONFIGURED=true or LAUNCH_CHECKS_PASSED=true until the above checks and launch approvals are complete. The ebook price remains £9.99; Stripe fees reduce the amount received, so £9.99 is the buyer price, not guaranteed net proceeds.

## Environment reference

Use .env.example as the list of required names. Put secret values in Cloudflare Worker secrets, not in cloudflare.config.ts, source control, or messages. Non-secret runtime settings and the two private ebook object paths are in cloudflare.config.ts.
