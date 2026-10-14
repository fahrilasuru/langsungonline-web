import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
    site: "https://coba.langsung.online",
    output: "server",
    adapter: vercel(),

    server: {
        port: 4322,
    },

    redirects: {
        "/preview": "/",
    },

    vite: {
        plugins: [tailwindcss()],

        ssr: {
            noExternal: ["@langsungonline/ui"],
        },
    },
});
