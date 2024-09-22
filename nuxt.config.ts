// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",

  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],
  css: ["~/assets/css/style.css"],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  routeRules: {
    "/**": { isr: 60 },
    // all routes (by default) will be revalidated every 60 seconds, in the background

    // this page will be generated on demand and then cached permanently
    "/static": { isr: true },
    // this page is generated at build time and cached permanently
    "/prerendered": { prerender: true },
    // this page will be always fresh
    "/dynamic": { isr: false },
    // you can do lots more with route rules too!
    "/redirect": { redirect: "/static" },

    "/spa": { ssr: false },
  },

  runtimeConfig: {
    nitro: { envPrefix: "VERCEL_" },
    region: process.env.VERCEL_REGION,
  },
});
