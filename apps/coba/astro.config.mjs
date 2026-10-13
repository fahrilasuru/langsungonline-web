import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

// coba.langsung.online: preview hasil AI (SSR) dan demo. Satu app = satu host, jadi tidak perlu middleware.
export default defineConfig({
    site: "https://coba.langsung.online",
    output: "server", // halaman statis memakai `export const prerender = true`
    adapter: vercel(),
    server: { port: 4322 },
    redirects: {
        "/preview": "/", // riwayat preview sudah ada di beranda coba
    },
    integrations: [sitemap({ filter: (page) => !/\/preview(\/|$)/.test(page) })],
    vite: {
        plugins: [tailwindcss()],
        ssr: { noExternal: ["@langsungonline/ui"] }, // paket workspace dikirim sebagai source (.astro/.ts)
    },
});
