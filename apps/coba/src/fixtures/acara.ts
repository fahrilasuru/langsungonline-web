import type { Ready } from "../types";
import { community as c } from "./stock";

// Contoh komunitas dengan kegiatan berjadwal: offering berupa acara, tanpa produk dan tanpa marketplace.
const acara: Ready = {
  status: "ready", job_id: "acara", consult_whatsapp: "6281234567890",
  business: {
    name: "Taman Baca Bersama", category: "Komunitas baca", logo_icon: "book-open", city: "Malang", whatsapp: "6281234567890",
    bio: "Tempat berbagi buku dan cerita setiap bulan.", hours: [], products: [],
  },
  site: {
    slug: "taman-baca-bersama", theme: { primary: "#D9822B", background: "#FFFBF2", ink: "#3A2A12" },
    hero: { headline: "Membaca lebih menyenangkan kalau bersama", subheadline: "Komunitas baca di Malang. Siapa pun boleh bergabung, tanpa biaya.", cta_label: "Gabung lewat WhatsApp", image: c.group },
    positioning: { title: "Tentang komunitas", body: "Kami bertemu untuk bertukar buku dan cerita, dengan suasana santai.", points: ["Terbuka untuk umum", "Tukar dan pinjam buku", "Diskusi ringan"] },
    offering: { kind: "events", title: "Kegiatan kami", items: [
      { name: "Ngobrol buku bulanan", date: "Setiap bulan", description: "Bahas satu buku bersama-sama." },
      { name: "Tukar buku", description: "Bawa buku lama, pulang dengan buku baru." },
    ] },
    proof: { title: "Suasana kegiatan", facts: [], photos: [c.chat, c.learn, c.room] },
    cta: { headline: "Ikut kegiatan berikutnya", body: "Kabari kami lewat WhatsApp, kami kirim jadwalnya.", label: "Gabung lewat WhatsApp" },
  },
  recommended_presence: [
    { type: "website", priority: "primary", reason: "Website memuat jadwal dan cara bergabung dalam satu tempat." },
    { type: "google_business", priority: "high", reason: "Profil Google memuat ulasan dan cara menghubungi komunitas, juga tanpa alamat tetap.", data: { photos: [c.room], rating: { value: 4.8, sample: true } } },
    { type: "instagram", priority: "supporting", reason: "Instagram membagikan dokumentasi kegiatan.", data: {
      handle: "tamanbacabersama", grid_image: c.group,
      highlights: [
        { label: "Jadwal", icon: "calendar-days", kind: "text", title: "Jadwal kegiatan", body: "Jadwal terbaru dibagikan lewat WhatsApp." },
        { label: "Gabung", icon: "comment", kind: "contact" },
      ],
      posts: [{ caption: "Kumpul bulanan." }, { caption: "Ngobrol santai." }, { caption: "Belajar bersama." }] } },
  ],
  extras: [{ type: "whatsapp_business", note: "Pesanan dan pertanyaan pelanggan tetap lewat satu nomor." }],
  recommendations: ["Website menjelaskan kegiatan dan cara bergabung.", "Instagram menjaga komunitas tetap aktif.", "WhatsApp menjadi jalur utama untuk bergabung."],
};
export default acara;
