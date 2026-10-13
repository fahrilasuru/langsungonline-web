import type { APIRoute } from "astro";
import { getPreview } from "../../../api";
export const prerender = false;

// Ringkasan status untuk halaman riwayat (diambil lewat server Astro, jadi tidak ada urusan CORS).
export const GET: APIRoute = async ({ params }) => {
  const headers = { "content-type": "application/json", "cache-control": "no-store" };
  let d;
  try { d = await getPreview(params.job_id!); }
  catch { return new Response(JSON.stringify({ status: "unavailable" }), { status: 503, headers }); } // riwayat mengabaikan 503
  if (!d) return new Response(JSON.stringify({ status: "missing" }), { status: 404, headers });
  const ready = d.status === "ready";
  return new Response(JSON.stringify({ status: d.status, name: ready ? d.business.name : null, category: ready ? d.business.category : null }), { headers });
};
