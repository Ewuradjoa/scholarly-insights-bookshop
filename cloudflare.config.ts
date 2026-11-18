import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "scholarly-insights-bookshop",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-14",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      CHECKOUT_ENABLED: bindings.text("false"),
      EBOOK_OBJECT_PATH: bindings.text("how-to-fall-out-of-love/How_to_Fall_Out_of_Love.epub"),
      EBOOK_PDF_OBJECT_PATH: bindings.text("how-to-fall-out-of-love/How_to_Fall_Out_of_Love_Website_Edition.pdf"),
      EBOOK_PRIVATE_BUCKET: bindings.text("ebooks"),
      FULFILMENT_CONFIGURED: bindings.text("false"),
      LAUNCH_CHECKS_PASSED: bindings.text("false"),
      LULU_PRINT_API_BASE: bindings.text("https://api.sandbox.lulu.com"),
      LULU_SANDBOX: bindings.text("true"),
      NEXT_PUBLIC_SITE_URL: bindings.text("https://books.scholarlyinsightsacademia.co.uk"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: bindings.text("sb_publishable_pK-BQqz-vBfBR23RFlGuqg_LBifokcq"),
      NEXT_PUBLIC_SUPABASE_URL: bindings.text("https://sqtfcjtdimkfydiwsoqx.supabase.co"),
    },
  }),
});
