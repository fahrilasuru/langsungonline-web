import type { Ready } from "../types";
import { coffee as c } from "./stock";

const kopi: Ready = {
  status: "ready", job_id: "demo", consult_whatsapp: "6281234567890",
  business: {
    name: "Kopi Senja", category: "Kedai kopi", logo_icon: "mug-hot", city: "Bandung", address: "Jl. Braga No. 12, Bandung",
    phone: "0812-3456-7890", whatsapp: "6281234567890", bio: "Kopi lokal, suasana hangat. Pesan lewat WhatsApp.",
    hours: [{ days: "Setiap hari", open: "08.00–22.00" }],
    products: [
      { id: "p1", name: "Kopi Susu Senja", price: 22000, category: "Minuman", image: c.latte },
      { id: "p2", name: "Americano", price: 18000, category: "Minuman", image: c.cup },
      { id: "p3", name: "Roti Bakar Coklat", price: 16000, category: "Makanan", image: c.bread },
      { id: "p4", name: "Biji Kopi 200g", price: 65000, category: "Biji Kopi", image: c.beans },
    ],
  },
  site: {
    slug: "kopi-senja", theme: { primary: "#B4552D", background: "#FFF9F0", ink: "#33221A", accent: "#E8A24C", font: "serif" },
    hero: { headline: "Kopi hangat untuk sore yang tenang", subheadline: "Kedai kecil di Bandung dengan biji kopi pilihan petani lokal. Mampir, atau pesan lewat WhatsApp.", cta_label: "Pesan via WhatsApp", secondary_label: "Lihat menu", badges: ["Buka setiap hari", "Biji kopi lokal"], image: c.cafe },
    highlights: { title: "Kenapa orang betah di Kopi Senja", suggested: true, items: [
      { icon: "mug-hot", title: "Diseduh saat dipesan", text: "Setiap gelas dibuat setelah Anda memesan." },
      { icon: "seedling", title: "Biji kopi lokal", text: "Dipilih dari petani lokal, disangrai sendiri." },
      { icon: "users", title: "Enak untuk ngobrol", text: "Tempat duduk nyaman untuk berdua atau berkelompok." },
      { icon: "comment-dots", title: "Pesan lewat WhatsApp", text: "Tanya menu atau pesan tanpa antre." },
    ] },
    stats: { items: [{ value: "08.00–22.00", label: "Jam buka" }, { value: "Setiap hari", label: "Buka sepanjang minggu" }, { value: "Bandung", label: "Jl. Braga No. 12" }] },
    positioning: { title: "Berawal dari cinta pada kopi lokal", body: "Kopi Senja berawal dari kecintaan pada kopi lokal. Kami menyeduh dengan sepenuh hati untuk setiap tamu, dengan biji kopi pilihan petani lokal dan suasana yang tenang di sore hari.", points: ["Biji kopi dari petani lokal", "Diseduh saat dipesan", "Tempat nyaman untuk ngobrol"], image: c.cup },
    offering: { kind: "catalog", title: "Menu favorit", nav_label: "Menu", intro: "Pilihan yang paling sering dipesan di Kopi Senja.", product_ids: ["p1", "p2", "p3", "p4"] },
    process: { title: "Cara memesan", suggested: true, steps: [
      { title: "Pilih menu", text: "Lihat menu dan tentukan pilihan Anda." },
      { title: "Kirim lewat WhatsApp", text: "Sebutkan pesanan dan jumlahnya." },
      { title: "Nikmati", text: "Kami siapkan, Anda tinggal menikmati." },
    ] },
    proof: { title: "Suasana di Kopi Senja", facts: [], photos: [c.cafe, c.cup, c.beans, c.latte, c.bread, c.cafe] },
    faq: { title: "Pertanyaan umum", suggested: true, items: [
      { q: "Bagaimana cara memesan?", a: "Hubungi kami lewat WhatsApp, sebutkan menu yang diinginkan." },
      { q: "Jam berapa buka?", a: "Setiap hari pukul 08.00 sampai 22.00." },
      { q: "Di mana lokasinya?", a: "Jl. Braga No. 12, Bandung. Buka petanya di halaman Kontak." },
    ] },
    cta: { headline: "Mampir atau pesan sekarang", body: "Kami siap melayani setiap hari.", label: "Pesan via WhatsApp" },
  },
  recommended_presence: [
    { type: "website", priority: "primary", reason: "Website menjadi pusat informasi Kopi Senja." },
    { type: "google_business", priority: "high", reason: "Google membantu pelanggan menemukan lokasi dan jam buka.", data: { photos: [c.cafe, c.latte, c.beans], rating: { value: 4.8, sample: true } } },
    { type: "instagram", priority: "supporting", reason: "Instagram mendukung promosi dan membangun kepercayaan.", data: {
      handle: "kopisenja", grid_image: c.cafe,
      highlights: [
        { label: "Menu", icon: "mug-hot", kind: "menu" },
        { label: "Lokasi", icon: "location-dot", kind: "location" },
        { label: "Promo", icon: "tag", kind: "text", title: "Promo", body: "Tulis promo terbaru Anda di sini." },
        { label: "Tanya", icon: "comment", kind: "contact" },
      ],
      posts: [
        { caption: "Kopi Susu Senja, teman sore yang pas." },
        { caption: "Sore di Kopi Senja. Mampir, yuk." },
        { caption: "Roti bakar coklat, hangat dari panggangan." },
        { caption: "Biji kopi lokal, disangrai sendiri." },
        { caption: "Americano untuk yang suka kopi pekat." },
        { caption: "Sudut favorit untuk ngobrol lama." },
      ] } },
    { type: "marketplace", priority: "supporting", reason: "Biji kopi kemasan bisa dibeli lewat kanal yang sudah dikenal.", data: { platform: "shopee", store_name: "Kopi Senja Official", product_ids: ["p4", "p1", "p3"] } },
  ],
  extras: [{ type: "whatsapp_business", note: "Pesanan dan pertanyaan pelanggan tetap lewat satu nomor." }, { type: "tiktok" }],
  recommendations: ["Website menjadi pusat informasi Kopi Senja.", "Google membantu pelanggan menemukan lokasi dan jam buka.", "Instagram mendukung promosi dan membangun kepercayaan.", "WhatsApp menjadi jalur utama untuk bertanya atau memesan."],
};
export default kopi;
