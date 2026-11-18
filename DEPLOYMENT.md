# Deployment and launch checklist

## Current live setup

- Cloudflare Worker: `scholarly-insights-bookshop` at `https://scholarly-insights-bookshop.scholarlyinsightsconsulting.workers.dev`.
- Intended shop address: `https://books.scholarlyinsightsacademia.co.uk`. The custom domain has not been added yet.
- Checkout is disabled. The worker config explicitly keeps `CHECKOUT_ENABLED`, `FULFILMENT_CONFIGURED` and `LAUNCH_CHECKS_PASSED` false.
- Supabase project has the shop schema, email sign-in redirects and a private `ebooks` bucket.
- The private bucket contains `how-to-fall-out-of-love/How_to_Fall_Out_of_Love.epub` and `how-to-fall-out-of-love/How_to_Fall_Out_of_Love_Website_Edition.pdf`. `cloudflare.config.ts` sets these object paths. No book files belong in `public/` or GitHub.
- The Scholarship Blueprint is a forthcoming catalogue listing. Its supplied cover is a draft and it is not for sale.
- The How to Fall Out of Love back-cover panel and full-wrap concept are available in the workspace review outputs. The author has chosen the Scholarly Insights Academia imprint and does not want to buy an ISBN. Prepare this edition for the author's own shop using the Lulu Print API; do not select Global Distribution or add a barcode.

## Remaining before checkout can be enabled

1. **Lulu print package:** use `How_to_Fall_Out_of_Love_Final_Interior_Production.pdf` (6 × 9 inches, 103 pages) as the print interior, after Lulu preflight accepts it. The back panel and a full-wrap concept are ready for review, but the concept is not the final print file: the supplied front cover is 1024 × 1536 pixels (about 171 PPI at 6 × 9 inches), below Lulu's 300 PPI minimum for embedded cover images. Obtain a print-resolution front cover, upload the accepted interior to Lulu, choose the final paperback and paper settings, download Lulu's project-specific cover template, and place the approved back panel/front art into that template. Review and approve the proof. Keep the print interior and wrap cover separate from the website PDF and EPUB.
2. **Paperback price and delivery:** the agreed customer price is £19.99 with basic UK tracked delivery included; priority and express are +£1 and +£5. The Stripe test products and rates are active and configured on the Worker; the non-secret test IDs are also recorded in `cloudflare.config.ts` so a later Git deployment retains them. The Lulu public calculator currently estimates £3.55 to print and £4.04 for UK trackable Mail (7–9 business days), with Priority Mail at £5.04 (6–8 days) and Express at £9.04 (5–7 days). These are starting estimates for 6 × 9 in, 103 pages, standard black-and-white, 60# cream paper and matte cover—not a final quote for a Lulu project or delivery postcode. The £19.99 base price therefore covers the current £7.59 print-plus-Mail estimate before Stripe fees, tax, or any provider charges. Confirm the exact Lulu sandbox quote and specifications before finalizing margin or fulfillment. The ebook remains £9.99.
3. **Provider setup:** store the Supabase server key, Stripe test key and webhook signing secret, Resend key, and Lulu sandbox credentials as Cloudflare secrets. Add the administrator's exact email to `ADMIN_EMAILS`. Never put secrets in Git or chat.
4. **Lulu sandbox:** configure the package ID and stable print-file URLs plus checksums. The calculator's current package candidate is `0600X0900.BW.STD.PB.060UC444.MXX`; confirm it against the accepted Lulu print files and project before using it. `LULU_PRINT_API_BASE` must remain `https://api.sandbox.lulu.com` during testing.
5. **End-to-end review:** verify sign-in and admin access, successful and failed payments, webhook replay and refunds, confirmation email, paid-only EPUB/PDF access, review eligibility/moderation/reporting, and sandbox paperback fulfilment/status updates.
6. **Launch setup:** review customer support, tax and refund information. After all checks pass, configure the custom domain while preserving existing main-site DNS records. Only then enable checkout and fulfilment.

Do not set `CHECKOUT_ENABLED=true`, `FULFILMENT_CONFIGURED=true` or `LAUNCH_CHECKS_PASSED=true` until the above checks and launch approvals are complete. Checkout's ebook price must remain £9.99; Stripe fees can reduce the amount received by that amount, so the buyer-facing price does not guarantee £9.99 net proceeds.

## Environment reference

Use `.env.example` as the list of required names. Put secret values in Cloudflare Worker secrets, not in `cloudflare.config.ts`, source control, or messages. Non-secret runtime settings and the two private ebook object paths are in `cloudflare.config.ts`.
