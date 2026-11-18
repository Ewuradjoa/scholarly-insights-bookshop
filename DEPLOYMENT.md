# Deployment and launch checklist

## Current live setup

- Cloudflare Worker: `scholarly-insights-bookshop` at `https://scholarly-insights-bookshop.scholarlyinsightsconsulting.workers.dev`.
- Intended shop address: `https://books.scholarlyinsightsacademia.co.uk`. The custom domain has not been added yet.
- Checkout is disabled. The worker config explicitly keeps `CHECKOUT_ENABLED`, `FULFILMENT_CONFIGURED` and `LAUNCH_CHECKS_PASSED` false.
- Supabase project has the shop schema, email sign-in redirects and a private `ebooks` bucket.
- The private bucket contains `how-to-fall-out-of-love/How_to_Fall_Out_of_Love.epub` and `how-to-fall-out-of-love/How_to_Fall_Out_of_Love_Website_Edition.pdf`. `cloudflare.config.ts` sets these object paths. No book files belong in `public/` or GitHub.
- The Scholarship Blueprint is a forthcoming catalogue listing. Its supplied cover is a draft and it is not for sale.

## Remaining before checkout can be enabled

1. **Lulu print package:** use `How_to_Fall_Out_of_Love_Final_Interior_Production.pdf` (6 × 9 inches, 103 pages) as the print interior, after Lulu preflight accepts it. The available cover PNG is front cover art only. Generate the Lulu full-wrap cover from the final trim size, paper, ink and page count, then review and approve the proof. Keep the print interior and wrap cover separate from the website PDF and EPUB.
2. **Paperback price and delivery:** the agreed customer price is £19.99 with basic UK tracked delivery included; priority and express are upgrades. Add and verify the corresponding Stripe test products and shipping rates against Lulu's actual print and delivery costs before treating the margin as final.
3. **Provider setup:** store the Supabase server key, Stripe test key and webhook signing secret, Resend key, and Lulu sandbox credentials as Cloudflare secrets. Add the administrator's exact email to `ADMIN_EMAILS`. Never put secrets in Git or chat.
4. **Lulu sandbox:** configure the package ID and stable print-file URLs plus checksums. `LULU_PRINT_API_BASE` must remain `https://api.sandbox.lulu.com` during testing.
5. **End-to-end review:** verify sign-in and admin access, successful and failed payments, webhook replay and refunds, confirmation email, paid-only EPUB/PDF access, review eligibility/moderation/reporting, and sandbox paperback fulfilment/status updates.
6. **Launch setup:** review customer support, tax and refund information. After all checks pass, configure the custom domain while preserving existing main-site DNS records. Only then enable checkout and fulfilment.

Do not set `CHECKOUT_ENABLED=true`, `FULFILMENT_CONFIGURED=true` or `LAUNCH_CHECKS_PASSED=true` until the above checks and launch approvals are complete. The ebook buyer price remains capped at £9.99; Stripe fees come out of that amount, so proceeds will be less than £9.99.

## Environment reference

Use `.env.example` as the list of required names. Put secret values in Cloudflare Worker secrets, not in `cloudflare.config.ts`, source control, or messages. Non-secret runtime settings and the two private ebook object paths are configured in cloudflare.config.ts.
