# Deployment and launch status

## Current production setup

- Cloudflare Worker: `scholarly-insights-bookshop`, connected to `Ewuradjoa/scholarly-insights-bookshop` and `https://books.scholarlyinsightsacademia.co.uk`.
- Stripe is configured in live mode. The ebook is £9.99; the paperback is £19.99 with basic tracked UK delivery included. Priority adds £1 and express adds £5.
- The restricted live Stripe key and live webhook signing secret are encrypted Cloudflare secrets. The webhook at `/api/stripe/webhook` listens for `checkout.session.completed` and `charge.refunded`; it has not yet received an event.
- Current runtime flags: `FULFILMENT_CONFIGURED=true`, `LAUNCH_CHECKS_PASSED=false`, `CHECKOUT_ENABLED=false`. No live customer payment or Lulu print order has been made.
- Ebook and Lulu print files are in private Supabase Storage. Keep these files private; never commit them to GitHub or put them under `public/`.
- Lulu production credentials are encrypted Cloudflare secrets. Production package, contact, private file paths and checksums are configured as Cloudflare variables. Lulu validation and print-file preparation are complete; do not repeat that validation. Automatic print submission remains off. A paid paperback order stays queued until the owner approves that individual order. When approved, the server supplies Lulu temporary signed links to the private print files.
- Customer buyer-information pages are live: terms of sale, delivery/cancellation/returns, privacy and contact. Seller details are Scholarly Insights Academia, 188 Carlton Road, Nottingham, NG3 2BB, United Kingdom; `scholarlyinsightsconsulting@gmail.com`. The seller has confirmed it is not VAT registered and does not charge VAT.
- **The Scholarship Blueprint** remains a forthcoming title; its manuscript is not final and it is not available to buy.

## Remaining before checkout can be enabled

1. **Complete safe end-to-end checks.** Verify customer account sign-in, owner MFA and staff permissions, Stripe checkout session creation in test mode, signed webhook receipt and replay handling, paid/refund order updates, confirmation email, purchase-gated ebook access, verified-purchase reviews and moderation, and admin order visibility. Do not make a live customer charge. Do not submit a Lulu print job as a test or without a paid customer order and owner approval.
2. **Confirm sender and order handling.** Complete a test confirmation email and verify the customer can access an ebook after a test paid event. Confirm paperback orders remain queued pending the owner's per-order approval.
3. **Keep the launch gates honest.** After those checks pass, set `LAUNCH_CHECKS_PASSED=true`. `FULFILMENT_CONFIGURED` is already true. Set `CHECKOUT_ENABLED=true` only after the launch checks are complete and the live checkout route has been verified without completing a real payment.

The buyer-facing ebook price is fixed at £9.99 and the basic paperback price is £19.99. Stripe and provider fees reduce net proceeds; the retail prices do not guarantee £9.99 net income per sale.

## Configuration notes

Production values belong in Cloudflare Worker settings. Keep secret values encrypted and out of Git and chat. Non-secret Stripe mode, price/rate IDs and Lulu file metadata are supplied to Workers Builds as variables. The Supabase service-role key and Stripe/Lulu/Resend credentials must remain server-side secrets.

