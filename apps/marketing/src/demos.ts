// Daftar demo yang ditampilkan di /demo. Satu-satunya tempat yang perlu diubah saat menambah demo.
//  - "situs": contoh situs lengkap, beberapa halaman
//  - "fitur": satu halaman yang memperagakan satu kemampuan
// Setiap `url` harus menunjuk rute yang ada di folder ini.

export type DemoKind = "situs" | "fitur";

export interface Demo {
    kind: DemoKind;
    title: string;
    description: string;
    url: string;
    icon: string; // nama ikon Font Awesome (fas fa-<icon>)
    iconBg: string;
    iconColor: string;
    tags: string[];
    features: string[];
}

export const demoGroups: { kind: DemoKind; title: string; subtitle: string }[] = [
    {
        kind: "situs",
        title: "Contoh situs lengkap",
        subtitle: "Beberapa halaman yang saling terhubung, seperti situs bisnis yang sudah jadi.",
    },
    {
        kind: "fitur",
        title: "Contoh fitur",
        subtitle: "Satu halaman, satu kemampuan. Bisa ditambahkan ke situs Anda.",
    },
];

export const demos: Demo[] = [
    // ---------------------------------------------------------------- situs lengkap
    {
        kind: "situs",
        title: "Bisnis Jasa",
        description: "Landing page untuk kontraktor, interior design, atau penyedia layanan profesional.",
        url: "/demo/jasa-interior",
        icon: "helmet-safety",
        iconBg: "#ede9fe",
        iconColor: "#7c3aed",
        tags: ["Interior", "Kontraktor", "Servis"],
        features: ["Galeri proyek dengan filter", "Foto sebelum dan sesudah", "Paket harga dan FAQ"],
    },
    {
        kind: "situs",
        title: "Toko Online",
        description: "Toko kopi dengan katalog, keranjang, dan checkout untuk penjual produk.",
        url: "/demo/toko-kopi",
        icon: "bag-shopping",
        iconBg: "#fef9c3",
        iconColor: "#ca8a04",
        tags: ["Makanan", "Retail", "Produk"],
        features: ["Katalog dan detail produk", "Keranjang belanja", "Halaman checkout"],
    },
    {
        kind: "situs",
        title: "Biro Perjalanan",
        description: "Situs paket wisata dan destinasi untuk biro perjalanan atau agen tur.",
        url: "/demo/travel",
        icon: "plane",
        iconBg: "#cffafe",
        iconColor: "#0891b2",
        tags: ["Wisata", "Tur", "Tiket"],
        features: ["Daftar paket wisata", "Halaman destinasi", "Kontak dan FAQ"],
    },
    {
        kind: "situs",
        title: "Portofolio Pribadi",
        description: "Situs personal untuk desainer, developer, konsultan, atau freelancer.",
        url: "/demo/portfolio",
        icon: "user-tie",
        iconBg: "#dbeafe",
        iconColor: "#2563eb",
        tags: ["Desainer", "Developer", "Personal Brand"],
        features: ["Proyek dengan halaman detail", "Layanan dan profil", "Halaman kontak"],
    },

    // ---------------------------------------------------------------- fitur
    {
        kind: "fitur",
        title: "Dashboard Admin",
        description: "Panel pengelolaan usaha kecil: produk, pesanan, pengguna, dan laporan.",
        url: "/demo/admin",
        icon: "chart-line",
        iconBg: "#e0e7ff",
        iconColor: "#4f46e5",
        tags: ["UMKM", "Dashboard"],
        features: ["Produk dan pesanan", "Pengguna dan laporan", "Riwayat aktivitas"],
    },
    {
        kind: "fitur",
        title: "Chat",
        description: "Antarmuka obrolan untuk layanan pelanggan atau komunikasi tim.",
        url: "/demo/chat",
        icon: "comments",
        iconBg: "#dcfce7",
        iconColor: "#16a34a",
        tags: ["Pelanggan", "Tim"],
        features: ["Daftar percakapan", "Kolom tulis pesan"],
    },
    {
        kind: "fitur",
        title: "Formulir",
        description: "Formulir pendaftaran bertahap yang rapi dan mudah diisi.",
        url: "/demo/formulir",
        icon: "clipboard-list",
        iconBg: "#fce7f3",
        iconColor: "#db2777",
        tags: ["Pendaftaran", "Formulir"],
        features: ["Data diri dan alamat", "Unggah berkas", "Media sosial dan minat"],
    },
    {
        kind: "fitur",
        title: "Brosur Acara",
        description: "Brosur acara yang bisa dibagikan lewat tautan, lengkap dengan tanggal dan pembicara.",
        url: "/demo/brosur-acara",
        icon: "file-lines",
        iconBg: "#f3e8ff",
        iconColor: "#9333ea",
        tags: ["Acara", "Seminar"],
        features: ["Judul dan tanggal acara", "Daftar pembicara"],
    },
];
