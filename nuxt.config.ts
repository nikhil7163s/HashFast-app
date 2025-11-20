import { defineNuxtConfig } from "nuxt/config";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: false },
    modules: ["@nuxtjs/tailwindcss"],
    css: ["~/assets/css/main.css"],
    runtimeConfig: {
        // Private keys (only available on server-side)
        databaseUrl: process.env.DATABASE_URL,
        jwtSecret: process.env.JWT_SECRET,
    },
    app: {
        head: {
            link: [
                {
                    rel: "preconnect",
                    href: "https://fonts.googleapis.com",
                },
                {
                    rel: "preconnect",
                    href: "https://fonts.gstatic.com",
                    crossorigin: "",
                },
                {
                    rel: "stylesheet",
                    href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
                },
            ],
            meta: [
                {
                    name: "description",
                    content: "Create and pay payment links for your HBAR, USDC on Hedera",
                },
            ],
        },
    },
    nitro: {
        experimental: {
            wasm: true,
        },
        nodeOptions: {
            "--no-warnings": true,
        },
    },
    postcss: {
        plugins: {
            "postcss-preset-env": {
                stage: 1,
                features: {
                    "nesting-rules": true,
                },
            },
            autoprefixer: {},
        },
    },
});
