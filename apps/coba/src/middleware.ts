import { defineMiddleware } from "astro:middleware";

const PREFIX = "/sditdarulquran";
const TARGET = "https://sditdarulquran.sch.id";

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname, search } = context.url;

    // Hanya proxy path yang cocok dengan prefix ini
    if (
        pathname !== PREFIX &&
        !pathname.startsWith(`${PREFIX}/`)
    ) {
        return next();
    }

    // Hilangkan prefix agar /sditdarulquran menjadi /
    const targetPath = pathname.slice(PREFIX.length) || "/";
    const targetUrl = new URL(`${targetPath}${search}`, TARGET);

    // Teruskan method, headers, dan body request asli
    const proxyRequest = new Request(targetUrl, context.request);

    return fetch(proxyRequest);
});
