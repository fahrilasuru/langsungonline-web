import type { APIContext, APIRoute } from "astro";

const apiHandlers = import.meta.glob(
  "../../../tenantPages/*/api/**/*.ts",
);

const supportedMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
] as const;

const dispatch: APIRoute = async (context: APIContext) => {
  const { tenant, apiPath } = context.params;
  const method = context.request.method;

  if (!tenant || !apiPath) {
    return new Response("Not Found", { status: 404 });
  }

  // Validasi segmen path.
  const validSegment = /^[a-zA-Z0-9_-]+$/;
  const segments = apiPath.split("/").filter(Boolean);

  if (
    !validSegment.test(tenant) ||
    !segments.every((segment: string) => validSegment.test(segment))
  ) {
    return new Response("Not Found", { status: 404 });
  }

  if ( !supportedMethods.includes(method as (typeof supportedMethods)[number]) ) {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: supportedMethods.join(", ") },
    });
  }

  const normalizedPath = segments.join("/");
  const candidates = [
    `../../../tenantPages/${tenant}/api/${normalizedPath}.ts`,
    `../../../tenantPages/${tenant}/api/${normalizedPath}/index.ts`,
  ];

  const modulePath = candidates.find(
    (path) => path in apiHandlers,
  );

  if (!modulePath) {
    return new Response("Not Found", { status: 404 });
  }

  const loadHandler = apiHandlers[modulePath];

  if (!loadHandler) {
    return new Response("Not Found", { status: 404 });
  }

  const module = await loadHandler() as Record< string, unknown >;
  const handler = module[method];

  if (typeof handler !== "function") {
    const allow = supportedMethods.filter(
      (m) => typeof module[m] === "function",
    );

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: allow.join(", ") },
    });
  }

  return (handler as APIRoute)(context);
};

export const GET = dispatch;
export const POST = dispatch;
export const PUT = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
export const OPTIONS = dispatch;
export const HEAD = dispatch;
