import type { Site } from "./types";

export type SitePage = { id: "home" | "about" | "offering" | "gallery" | "contact"; path: string; label: string };
const KIND_LABEL = { catalog: "Produk", packages: "Paket", services: "Layanan", events: "Acara" } as const;
/** Alamat contoh untuk bilah browser: bukan domain nyata dan bukan milik Langsung Online. */
export const exampleDomain = (slug: string) => `${slug.replace(/-/g, "") || "usahaanda"}.com`;
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Halaman situs diturunkan dari data yang ada: bagian kosong berarti halamannya tidak dibuat. */
export function pagesOf(site: Site): SitePage[] {
  const pages: SitePage[] = [{ id: "home", path: "", label: "Beranda" }];
  if (site.positioning.body || site.process) pages.push({ id: "about", path: "tentang", label: "Tentang" });
  if (site.offering) {
    const label = site.offering.nav_label || KIND_LABEL[site.offering.kind];
    let path = slugify(label) || "layanan";
    if (["tentang", "galeri", "kontak"].includes(path)) path += "-2";
    pages.push({ id: "offering", path, label });
  }
  if ((site.proof?.photos.length ?? 0) >= 3) pages.push({ id: "gallery", path: "galeri", label: "Galeri" });
  pages.push({ id: "contact", path: "kontak", label: "Kontak" });
  return pages;
}
