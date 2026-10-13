import type { Ready } from "../types";
import { coffee as c } from "./stock";

// Cerita sekadarnya ("kedai kopi di Bandung"): tanpa alamat, telepon, jam buka, dan harga.
// Semua isi tambahan ditandai suggested.
const minim: Ready = {
  status: "ready", job_id: "minim", consult_whatsapp: "6281234567890", completeness: "minimal",
  business: {
    name: "Kedai Kopi Anda", category: "Kedai kopi", logo_icon: "mug-hot", city: "Bandung", whatsapp: "6281234567890", hours: [],
    products: [
      { id: "s1", name: "Kopi susu", category: "Minuman", image: c.latte, suggested: true },
      { id: "s2", name: "Americano", category: "Minuman", image: c.cup, suggested: true },
      { id: "s3", name: "Roti bakar", category: "Makanan", image: c.bread, suggested: true },
    ],
  },
  site: {
    slug: "kedai-kopi-anda", theme: { primary: "#B4552D", background: "#FFF9F0", ink: "#33221A" },
    hero: { headline: "Kopi enak, tempat nyaman", subheadline: "Kedai kopi di Bandung. Mampir, atau tanya lewat WhatsApp.", cta_label: "Tanya via WhatsApp", image: c.cafe },
    positioning: { title: "Tentang kami", body: "Ceritakan di sini bagaimana kedai Anda bermula dan apa yang membuatnya berbeda.", points: [], suggested: true },
    offering: { kind: "catalog", title: "Contoh menu", product_ids: ["s1", "s2", "s3"], suggested: true },
    proof: { title: "Suasana", facts: [], photos: [c.cafe, c.cup, c.beans], suggested: true },
    cta: { headline: "Ingin tahu lebih lanjut?", body: "Tanyakan menu dan jam buka lewat WhatsApp.", label: "Tanya via WhatsApp" },
  },
  recommended_presence: [
    { type: "website", priority: "primary", reason: "Website menjadi pusat informasi kedai Anda." },
    { type: "google_business", priority: "high", reason: "Pelanggan di Bandung bisa menemukan kedai Anda lewat pencarian.", data: { photos: [c.cafe, c.latte], rating: { value: 4.8, sample: true } } },
    { type: "instagram", priority: "supporting", reason: "Foto menu dan suasana mudah dibagikan di Instagram.", data: {
      handle: "kedaikopianda", grid_image: c.cafe, suggested: true,
      highlights: [{ label: "Menu", icon: "mug-hot", kind: "menu" }, { label: "Tanya", icon: "comment", kind: "contact" }, { label: "Lokasi", icon: "location-dot", kind: "location" }],
      posts: [{ caption: "Kopi susu favorit." }, { caption: "Suasana sore." }, { caption: "Teman minum kopi." }] } },
  ],
  extras: [{ type: "whatsapp_business", note: "Pesanan dan pertanyaan pelanggan tetap lewat satu nomor." }],
  recommendations: ["Website menjadi pusat informasi kedai Anda.", "Google membantu pelanggan di Bandung menemukan Anda.", "WhatsApp menjadi jalur utama untuk bertanya."],
};
export default minim;
