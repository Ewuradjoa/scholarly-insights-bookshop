import { bindings, defineConfig, defineWorker } from "cf/config";

// Workers Builds provides these at build time. Keep credentials out of the
// repository and pass the values into the deployed Worker configuration.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export default defineConfig({
  worker: defineWorker({
    name: "scholarly-insights-bookshop",
    domains: ["books.scholarlyinsightsacademia.co.uk"],
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-14",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      CHECKOUT_ENABLED: bindings.text(process.env.CHECKOUT_ENABLED ?? "false"),
      EBOOK_OBJECT_PATH: bindings.text("how-to-fall-out-of-love/How_to_Fall_Out_of_Love.epub"),
      EBOOK_PDF_OBJECT_PATH: bindings.text("how-to-fall-out-of-love/How_to_Fall_Out_of_Love_Website_Edition.pdf"),
      EBOOK_PRIVATE_BUCKET: bindings.text("ebooks"),
      FULFILMENT_CONFIGURED: bindings.text(process.env.FULFILMENT_CONFIGURED ?? "false"),
      LAUNCH_CHECKS_PASSED: bindings.text(process.env.LAUNCH_CHECKS_PASSED ?? "false"),
      LULU_AUTO_SUBMIT: bindings.text("false"),
      LULU_PRINT_API_BASE: bindings.text("https://api.sandbox.lulu.com"),
      LULU_SANDBOX: bindings.text("true"),
      NEXT_PUBLIC_SITE_URL: bindings.text("https://books.scholarlyinsightsacademia.co.uk"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: bindings.text(supabasePublishableKey),
      NEXT_PUBLIC_SUPABASE_URL: bindings.text(supabaseUrl),
      ORDER_EMAIL_FROM: bindings.text("Scholarly Insights Academia Bookshop <orders@scholarlyinsightsacademia.co.uk>"),
      // Select test or live deliberately; price IDs must come from that same mode.
      STRIPE_MODE: bindings.text(process.env.STRIPE_MODE ?? "test"),
      STRIPE_EBOOK_PRICE_ID: bindings.text(process.env.STRIPE_EBOOK_PRICE_ID ?? ""),
      STRIPE_PAPERBACK_PRICE_ID: bindings.text(process.env.STRIPE_PAPERBACK_PRICE_ID ?? ""),
      STRIPE_PAPERBACK_BASIC_SHIPPING_RATE_ID: bindings.text(process.env.STRIPE_PAPERBACK_BASIC_SHIPPING_RATE_ID ?? ""),
      STRIPE_PAPERBACK_PRIORITY_SHIPPING_RATE_ID: bindings.text(process.env.STRIPE_PAPERBACK_PRIORITY_SHIPPING_RATE_ID ?? ""),
      STRIPE_PAPERBACK_EXPRESS_SHIPPING_RATE_ID: bindings.text(process.env.STRIPE_PAPERBACK_EXPRESS_SHIPPING_RATE_ID ?? ""),
    },
  }),
});
