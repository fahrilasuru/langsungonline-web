import GoogleBusiness from "./GoogleBusiness.astro";
import Instagram from "./Instagram.astro";
import Marketplace from "./Marketplace.astro";
// Tipe kanal -> komponen. Tipe yang tidak ada di sini dilewati, bukan error.
export const registry: Record<string, any> = { google_business: GoogleBusiness, instagram: Instagram, marketplace: Marketplace };
