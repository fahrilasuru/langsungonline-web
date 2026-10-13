import type { Ready } from "../types";
import { studio as s } from "./stock";

// Contoh bisnis jasa: tanpa produk, tanpa marketplace, offering berupa paket.
const nara: Ready = {
  status: "ready", job_id: "jasa", consult_whatsapp: "6281234567890",
  business: {
    name: "Nara Studio", category: "Studio desain grafis", logo_icon: "pen-ruler", city: "Yogyakarta", address: "Jl. Kaliurang Km 5, Yogyakarta",
    phone: "0813-1111-2222", whatsapp: "6281311112222", bio: "Identitas visual dan materi promosi untuk usaha kecil.",
    hours: [{ days: "Senin–Jumat", open: "09.00–17.00" }], products: [],
  },
  site: {
    slug: "nara-studio", theme: { primary: "#2F5D8A", background: "#F7FAFC", ink: "#1D2B3A", accent: "#5BB5E0", font: "sans" },
    hero: { headline: "Tampilan usaha yang rapi dan mudah diingat", subheadline: "Logo, kemasan, dan materi promosi yang dibuat sesuai cerita usaha Anda.", cta_label: "Diskusi lewat WhatsApp", secondary_label: "Lihat paket", badges: ["Diskusi lewat WhatsApp", "Revisi dibahas bersama"], image: s.laptop },
    highlights: { title: "Cara kami bekerja", suggested: true, items: [
      { icon: "comment-dots", title: "Mulai dari mendengarkan", text: "Kami memahami usaha Anda sebelum merancang." },
      { icon: "pen-ruler", title: "Rancangan siap pakai", text: "File siap cetak dan siap unggah." },
      { icon: "handshake", title: "Revisi dibahas bersama", text: "Penyesuaian dilakukan lewat diskusi langsung." },
    ] },
    positioning: { title: "Desain yang sederhana dan tepat sasaran", body: "Kami mulai dari mendengarkan, lalu menyiapkan rancangan yang bisa langsung dipakai.", points: ["Brief singkat lewat WhatsApp", "Revisi dibahas bersama", "File siap cetak dan siap unggah"], image: s.team },
    offering: { kind: "packages", title: "Paket layanan", nav_label: "Paket", intro: "Pilih yang paling dekat dengan kebutuhan Anda, lalu sesuaikan bersama kami.", tiers: [
      { name: "Dasar", price: 750000, features: ["Logo", "Satu kali revisi"] },
      { name: "Usaha", price: 1800000, features: ["Logo dan palet warna", "Template media sosial", "Dua kali revisi"], featured: true },
      { name: "Lengkap", features: ["Identitas visual", "Kemasan", "Pendampingan"] },
    ] },
    process: { title: "Alur pengerjaan", suggested: true, steps: [
      { title: "Brief", text: "Ceritakan kebutuhan lewat WhatsApp." },
      { title: "Rancangan", text: "Kami siapkan rancangan awal." },
      { title: "Revisi", text: "Kita sempurnakan bersama." },
      { title: "Serah terima", text: "Anda menerima file akhir." },
    ] },
    proof: { title: "Suasana kerja kami", facts: ["Diskusi langsung, tanpa istilah teknis"], photos: [s.team, s.desk, s.meeting] },
    faq: { title: "Pertanyaan umum", suggested: true, items: [
      { q: "Bagaimana memulai?", a: "Hubungi kami lewat WhatsApp dan ceritakan kebutuhan Anda." },
      { q: "Apakah ada revisi?", a: "Ya, jumlah revisi mengikuti paket yang dipilih." },
      { q: "Kapan kalian bisa dihubungi?", a: "Pada hari kerja, Senin sampai Jumat pukul 09.00 sampai 17.00." },
    ] },
    cta: { headline: "Ceritakan kebutuhan Anda", body: "Kami balas pada jam kerja.", label: "Diskusi lewat WhatsApp" },
  },
  recommended_presence: [
    { type: "website", priority: "primary", reason: "Website menunjukkan layanan dan cara bekerja Nara Studio." },
    { type: "google_business", priority: "high", reason: "Klien sekitar bisa menemukan studio dan jam kerjanya.", data: { photos: [s.team, s.meeting], rating: { value: 4.8, sample: true } } },
    { type: "instagram", priority: "supporting", reason: "Instagram memperlihatkan contoh hasil kerja.", data: {
      handle: "narastudio", grid_image: s.laptop,
      highlights: [
        { label: "Paket", icon: "layer-group", kind: "text", title: "Paket layanan", body: "Mulai dari logo sampai identitas visual lengkap." },
        { label: "Lokasi", icon: "location-dot", kind: "location" },
        { label: "Tanya", icon: "comment", kind: "contact" },
      ],
      posts: [
        { caption: "Proses merancang identitas visual." },
        { caption: "Diskusi bersama klien." },
        { caption: "Revisi dibahas langsung." },
        { caption: "Presentasi rancangan." },
      ] } },
  ],
  extras: [{ type: "whatsapp_business", note: "Pesanan dan pertanyaan pelanggan tetap lewat satu nomor." }],
  recommendations: ["Website menjelaskan layanan dan paket dengan jelas.", "Google membantu klien menemukan studio.", "WhatsApp menjadi jalur utama untuk berdiskusi."],
};
export default nara;
