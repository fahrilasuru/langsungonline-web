import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// langsung.online: situs pemasaran murni statis. Tidak ada logika host, middleware, atau SSR.
export default defineConfig({
    site: "https://langsung.online",
    server: { port: 4321 },
    integrations: [sitemap()],
    vite: {
        plugins: [tailwindcss()],
        ssr: { noExternal: ["@langsungonline/ui"] }, // paket workspace dikirim sebagai source (.astro/.ts)
    },
});
