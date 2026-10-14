
import { defineMiddleware } from "astro:middleware";

const PREFIX = "/sditdarulquran";
const TARGET = "https://sditdarulquran.sch.id";

const ASSET_PREFIXES = [
  "/_astro/",
  "/assets/",
  "/images/",
  "/fonts/",
];

const ASSET_EXTENSIONS =
  /\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|map)$/i;

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;

  // Halaman di bawah prefix /sditdarulquran
  const isMainRoute =
    pathname === PREFIX ||
    pathname.startsWith(`${PREFIX}/`);

  // Aset hasil build, public, dan file statis
  const isAssetRoute =
    ASSET_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    ) || ASSET_EXTENSIONS.test(pathname);

  // Jangan mengganggu route Astro lainnya
  if (!isMainRoute && !isAssetRoute) {
    return next();
  }

  // /sditdarulquran/profil -> /profil
  // /sditdarulquran         -> /
  const targetPath = isMainRoute
    ? pathname.slice(PREFIX.length) || "/"
    : pathname;

  const targetUrl = new URL(
    `${targetPath}${search}`,
    TARGET
  );

  try {
    const response = await fetch(targetUrl, {
      method: context.request.method,
      headers: {
        accept:
          context.request.headers.get("accept") ?? "*/*",
        "user-agent":
          context.request.headers.get("user-agent") ?? "",
      },
      redirect: "manual",
    });

    const headers = new Headers(response.headers);

    // Header ini tidak perlu diteruskan secara mentah
    // jika respons akan dimodifikasi di kemudian hari.
    headers.delete("content-length");
    headers.delete("content-encoding");
    headers.delete("transfer-encoding");

    // Pertahankan status dan body asli dari target
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("[Proxy sditdarulquran]", error);

    return new Response("Bad Gateway: upstream proxy failed", {
      status: 502,
    });
  }
});
