import { defineMiddleware } from "astro:middleware";

const PREFIX = "/sditdarulquran";
const TARGET_ORIGIN = "https://sditdarulquran.sch.id";

// Endpoint yang tetap ditangani oleh aplikasi Astro lokal.
const LOCAL_PREFIXES = [
  "/api",
  "/_vercel",
];

function isLocalPath(pathname: string): boolean {
  return LOCAL_PREFIXES.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function toTargetUrl(requestUrl: URL): URL | null {
  const pathname = requestUrl.pathname;

  // Hanya proxy URL di bawah namespace target.
  if (pathname !== PREFIX && !pathname.startsWith(`${PREFIX}/`)) {
    return null;
  }

  // /sditdarulquran       -> /
  // /sditdarulquran/ppdb  -> /ppdb
  const targetPath =
    pathname === PREFIX ? "/" : pathname.slice(PREFIX.length);

  const targetUrl = new URL(TARGET_ORIGIN);
  targetUrl.pathname = targetPath;
  targetUrl.search = requestUrl.search;

  return targetUrl;
}

/**
 * Ubah URL internal target agar tetap berada di namespace proxy.
 * Contoh:
 * /ppdb -> /sditdarulquran/ppdb
 */
function rewriteUrl(value: string): string {
  const trimmed = value.trim();

  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    /^(?:data:|blob:|mailto:|tel:|javascript:)/i.test(trimmed)
  ) {
    return value;
  }

  try {
    const url = new URL(trimmed, TARGET_ORIGIN);

    // Jangan mengubah URL eksternal.
    if (url.origin !== TARGET_ORIGIN) {
      return value;
    }

    // Jangan menambahkan prefix dua kali.
    if (
      url.pathname === PREFIX ||
      url.pathname.startsWith(`${PREFIX}/`)
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return `${PREFIX}${url.pathname === "/" ? "" : url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

/**
 * Penulisan ulang sederhana untuk atribut URL pada HTML.
 * Ini bukan parser HTML lengkap.
 */
function rewriteHtml(html: string): string {
  // href, src, action, poster, dan atribut URL tunggal lainnya.
  html = html.replace(
    /\b(href|src|action|poster|content|data-src|data-href)=(["'])(.*?)\2/gi,
    (match, attribute, quote, value) => {
      // content bisa berisi metadata selain URL.
      if (
        attribute.toLowerCase() === "content" &&
        !/^(?:https?:\/\/|\/)/i.test(value.trim())
      ) {
        return match;
      }

      return `${attribute}=${quote}${rewriteUrl(value)}${quote}`;
    },
  );

  // srcset dapat berisi beberapa URL yang dipisahkan koma.
  html = html.replace(
    /\bsrcset=(["'])(.*?)\1/gi,
    (_match, quote, value) => {
      const rewritten = value
        .split(",")
        .map((candidate: string) => {
          const parts = candidate.trim().split(/\s+/);
          if (parts[0]) parts[0] = rewriteUrl(parts[0]);
          return parts.join(" ");
        })
        .join(", ");

      return `srcset=${quote}${rewritten}${quote}`;
    },
  );

  // URL absolut yang masih mengarah ke domain target.
  html = html.replace(
    /https:\/\/sditdarulquran\.sch\.id(?=\/|["'\s)])/gi,
    "",
  );

  // CSS inline atau URL root pada atribut style.
  html = html.replace(
    /url\((["']?)(\/[^)'"]+)\1\)/gi,
    (_match, quote, path) =>
      `url(${quote}${rewriteUrl(path)}${quote})`,
  );

  return html;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const requestUrl = new URL(context.request.url);
  const pathname = requestUrl.pathname;

  // Biarkan route lokal seperti / dan /api tetap ditangani Astro.
  if (isLocalPath(pathname)) {
    return next();
  }

  const targetUrl = toTargetUrl(requestUrl);

  // Bukan URL target: lanjutkan ke route Astro.
  if (!targetUrl) {
    return next();
  }

  const headers = new Headers(context.request.headers);

  // Header host harus ditentukan oleh fetch ke server tujuan.
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  // Jangan meneruskan header kompresi dari browser secara manual.
  headers.delete("accept-encoding");

  const method = context.request.method;
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await context.request.arrayBuffer();

  let upstream: Response;

  try {
    upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (error) {
    console.error("Reverse proxy error:", error);

    return new Response("Target website tidak dapat diakses.", {
      status: 502,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  const responseHeaders = new Headers(upstream.headers);

  // Cookie target mungkin perlu penyesuaian domain/path
  // jika situs target menggunakan sesi login.
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  // Pertahankan URL lokal saat target mengirim redirect.
  const location = responseHeaders.get("location");

  if (location) {
    try {
      const redirectUrl = new URL(location, targetUrl);

      if (redirectUrl.origin === TARGET_ORIGIN) {
        responseHeaders.set(
          "location",
          rewriteUrl(
            `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`,
          ),
        );
      }
    } catch {
      // Biarkan header Location asli jika bukan URL yang valid.
    }
  }

  const contentType = responseHeaders.get("content-type") ?? "";

  // Tulis ulang link halaman HTML.
  if (
    contentType.includes("text/html") &&
    method !== "HEAD" &&
    upstream.body
  ) {
    const html = await upstream.text();
    const rewrittenHtml = rewriteHtml(html);

    responseHeaders.delete("content-length");
    responseHeaders.delete("content-security-policy");
    responseHeaders.delete("content-security-policy-report-only");

    return new Response(rewrittenHtml, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  }

  // Tulis ulang URL root dalam CSS eksternal.
  if (
    contentType.includes("text/css") &&
    method !== "HEAD" &&
    upstream.body
  ) {
    const css = await upstream.text();
    const rewrittenCss = css.replace(
      /url\((["']?)(\/[^)'"]+)\1\)/gi,
      (_match, quote, path) =>
        `url(${quote}${rewriteUrl(path)}${quote})`,
    );

    return new Response(rewrittenCss, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  }

  // Gambar, font, JavaScript, dan jenis respons lain diteruskan apa adanya.
  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
});
