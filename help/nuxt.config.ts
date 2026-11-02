const rawBaseURL = process.env.NUXT_APP_BASE_URL || "/";
const withLeadingSlash = rawBaseURL.startsWith("/")
  ? rawBaseURL
  : `/${rawBaseURL}`;
const baseURL = withLeadingSlash.endsWith("/")
  ? withLeadingSlash
  : `${withLeadingSlash}/`;

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  ssr: true,

  modules: ["@nuxt/content"],

  css: ["~/assets/css/main.css"],

  app: {
    baseURL,
    head: {
      htmlAttrs: {
        lang: "en-GB",
      },
      title: "Help",
      titleTemplate: "%s – Waymark",
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: `${baseURL}favicon.svg`,
        },
        {
          rel: "stylesheet",
          href: `${baseURL}assets/css/ogis.css`,
        },
        {
          rel: "stylesheet",
          href: `${baseURL}assets/waymark-js/css/waymark-js.min.css`,
        },
        {
          rel: "stylesheet",
          href: `${baseURL}assets/css/front.min.css`,
        },
      ],
      script: [
        {
          src: `${baseURL}assets/js/jquery.min.js`,
          defer: true,
        },
        {
          src: `${baseURL}assets/js/jquery-migrate.min.js`,
          defer: true,
        },
        {
          src: `${baseURL}assets/waymark-js/js/waymark-js.min.js`,
          defer: true,
        },
      ],
    },
  },

  nitro: {
    preset: "github_pages",
  },

  content: {
    experimental: {
      sqliteConnector: "native",
    },
    build: {
      markdown: {
        toc: {
          depth: 3,
        },
        highlight: {
          langs: [
            "js",
            "jsx",
            "json",
            "ts",
            "tsx",
            "vue",
            "css",
            "html",
            "bash",
            "md",
            "mdc",
            "yaml",
            "sql",
          ],
          theme: {
            default: "github-light",
            dark: "github-dark",
          },
        },
      },
    },
  },
});
