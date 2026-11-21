# Deployment and launch status

## Current production setup

- Cloudflare Worker: `scholarly-insights-bookshop`, connected to the GitHub repository `Ewuradjoa/scholarly-insights-bookshop` and the public address `https://books.scholarlyinsightsacademia.co.uk`.
- Stripe is configured in live mode. The live ebook (£9.99) and paperback (£19.99) prices and UK basic, priority (+£1), and express (+£5) delivery rates are configured in Cloudflare.
- The restricted live Stripe key and live webhook signing secret are stored as encrypted Cloudflare secrets and deployed. The active webhook at `/api/stripe/webhook` listens for `checkout.session.completed` and `charge.refunded`. It has not received an event yet.
- `CHECKOUT_ENABLED`, `FULFILMENT_CONFIGURED`, and `LAUNCH_CHECKS_PASSED` remain `false`. No live customer payment or Lulu print order has been made.
- The EPUB and website reading PDF are stored in the private Supabase `ebooks` bucket at `how-to-fall-out-of-love/How_to_Fall_Out_of_Love.epub` and `how-to-fall-out-of-love/How_to_Fall_Out_of_Love_Website_Edition.pdf`. Keep these files private; never commit them to GitHub or put them under `public/`.
- Lulu API credentials are stored as encrypted Cloudflare secrets. The Worker remains pointed at Lulu sandbox, and automatic print submission remains off. Print-ready files were validated in the prior Lulu workflow; do not repeat that validation.
- **The Scholarship Blueprint** is a forthcoming title only. Its supplied cover and manuscript are not final and the title is not available for purchase.

## Remaining before checkout can be enabled

1. **Finish Lulu sandbox settings.** Add the contact email, accepted package ID, and stable URLs plus MD5 checksums for the validated interior and full-wrap cover as Cloudflare settings: `LULU_CONTACT_EMAIL`, `LULU_POD_PACKAGE_ID`, `LULU_INTERIOR_URL`, `LULU_INTERIOR_MD5`, `LULU_COVER_URL`, and `LULU_COVER_MD5`. Keep `LULU_PRINT_API_BASE=https://api.sandbox.lulu.com`, `LULU_SANDBOX=true`, and `LULU_AUTO_SUBMIT=false`. Do not submit a print order or proof during setup.
2. **Run the launch checks.** Check account creation and confirmation, password sign-in and recovery, owner MFA and staff controls, live Stripe checkout creation, webhook delivery and replay handling, payment/refund order updates, confirmation emails, purchase-gated ebook access, verified-purchase reviews and moderation, and Lulu sandbox status handling. A paperback order must remain queued until it is paid and the owner approves submission. Do not use a real customer order as a test, and do not submit any Lulu job without a paid customer order and owner approval.
3. **Review buyer-facing policies.** Confirm support contact, tax, delivery estimates, cancellation and refund terms before enabling live checkout.
4. **Enable launch flags only after the settings and checks are complete.** Then set `FULFILMENT_CONFIGURED=true`, `LAUNCH_CHECKS_PASSED=true`, and finally `CHECKOUT_ENABLED=true`. Keep all three false until then.

The buyer-facing ebook price is fixed at £9.99 and paperback at £19.99, with the agreed delivery upgrades. Stripe and provider fees reduce the net amount received; these customer prices do not guarantee £9.99 net proceeds.

## Configuration notes

Use `.env.example` for the names required for local development. Production values belong in Cloudflare Worker settings; secret values must remain encrypted secrets and never be committed to Git or shared in chat. Non-secret Stripe mode and price/rate IDs are deployment variables. The private Supabase service-role key must remain server-side.
