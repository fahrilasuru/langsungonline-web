import type { Hours } from "./types";
export { wa, consult } from "@langsungonline/ui/wa";
export const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
export const initials = (s: string) => s.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
export const telUrl = (p?: string) => (p ? "tel:" + p.replace(/\D/g, "") : "");
type Place = { name: string; address?: string; city?: string };
export const hasPlace = (b: Place) => !!(b.address || b.city);
export const mapsUrl = (b: Place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([b.name, b.address ?? b.city].filter(Boolean).join(" "))}`;
export const hoursText = (h: Hours[] = []) => h.map((x) => `${x.days}, ${x.open}`).join(" · ");
/** "Kedai kopi · Bandung", atau hanya kategori bila kota tidak ada. */
export const place = (b: { category: string; city?: string }) => [b.category, b.city].filter(Boolean).join(" · ");
