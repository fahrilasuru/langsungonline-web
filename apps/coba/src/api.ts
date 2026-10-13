import type { PreviewResponse } from "./types";
import { fixtures } from "./fixtures/index";

// Dibaca saat runtime (process.env) dengan cadangan ke import.meta.env. Di produksi tidak ada cadangan localhost.
const API = (globalThis.process?.env?.API_URL ?? import.meta.env.API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "")).replace(/\/$/, "");

// UUID dari API; kunci fixture (demo, jasa, ...) juga lolos pola ini.
const VALID_ID = /^[A-Za-z0-9_-]{1,64}$/;

export async function getPreview(id: string): Promise<PreviewResponse | null> {
  if (!VALID_ID.test(id)) return null;
  // hasOwn: "constructor", "toString" dan kunci prototype lain bukan fixture.
  if (Object.hasOwn(fixtures, id)) return fixtures[id]; // /preview/demo, /preview/jasa: tanpa backend
  if (!API) throw new Error("API_URL belum diatur di environment variables");
  const res = await fetch(`${API}/preview/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(8000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as PreviewResponse;
}
