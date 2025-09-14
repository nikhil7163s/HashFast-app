import { defineNuxtPlugin } from "nuxt/app";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook("app:error", (err) => {
        console.error("🔴 Nuxt app error:", err);
    });
});
