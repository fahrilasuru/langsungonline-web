export const BASE = "/demo/portfolio";

export const img = (id: string, w = 900) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const profile = {
    name: "Raka Pratama",
    role: "UI/UX Designer & Front-end Developer",
    city: "Surabaya, Jawa Timur",
    email: "halo@rakapratama.demo",
    phone: "+62 812-3456-7890",
    wa: "6281234567890",
    portrait: img("1507003211169-0a1dd7228f2d", 900),
    workspace: img("1504384308090-c894fdcc538d", 1000),
    team: img("1522071820081-009f0129c71c", 1000),
};

export const wa = (text: string) =>
    `https://wa.me/${profile.wa}?text=${encodeURIComponent(text)}`;

export const waDefault = wa(
    "Halo Raka, saya ingin berdiskusi tentang proyek website/aplikasi. Jenis proyek saya: ___ dan target waktunya: ___.",
);

export const nav = [
    { href: `${BASE}/`, label: "Beranda", key: "home" },
    { href: `${BASE}/proyek/`, label: "Proyek", key: "proyek" },
    { href: `${BASE}/layanan/`, label: "Layanan", key: "layanan" },
    { href: `${BASE}/tentang/`, label: "Tentang", key: "tentang" },
    { href: `${BASE}/kontak/`, label: "Kontak", key: "kontak" },
];

export const stats = [
    { n: "7+", l: "Tahun pengalaman" },
    { n: "60+", l: "Proyek selesai" },
    { n: "35+", l: "Klien & tim" },
    { n: "4.9/5", l: "Rating kepuasan" },
];

export const services = [
    {
        icon: "fa-pen-ruler",
        title: "Desain UI/UX",
        short: "Riset singkat, wireframe, hingga prototipe interaktif yang siap diuji ke pengguna.",
        long: "Saya mulai dari memahami pengguna dan tujuan bisnis Anda, lalu menerjemahkannya menjadi alur dan tampilan yang jelas. Hasil akhirnya prototipe yang bisa dicoba sebelum satu baris kode ditulis.",
        points: ["Riset pengguna & pemetaan alur", "Wireframe dan prototipe Figma", "Desain visual untuk web dan mobile", "Uji kegunaan dengan 5 pengguna"],
        img: img("1586717791821-3f44a563fa4c", 900),
        price: "Mulai Rp3.500.000",
    },
    {
        icon: "fa-code",
        title: "Pengembangan Website",
        short: "Website cepat, rapi di semua layar, dan mudah dikelola, dibangun dengan Astro dan React.",
        long: "Website dibangun dengan teknologi modern supaya cepat dibuka, ramah mesin pencari, dan gampang diperbarui oleh Anda sendiri tanpa harus selalu menghubungi developer.",
        points: ["Landing page hingga multipage", "Responsif & lolos Core Web Vitals", "SEO teknis & analitik", "Panduan pengelolaan konten"],
        img: img("1461749280684-dccba630e2f6", 900),
        price: "Mulai Rp4.500.000",
    },
    {
        icon: "fa-magnifying-glass-chart",
        title: "Audit & Redesain UX",
        short: "Temukan alasan pengunjung pergi sebelum membeli, lalu perbaiki bagian yang paling berdampak.",
        long: "Cocok untuk website atau aplikasi yang sudah berjalan tetapi konversinya rendah. Saya telaah data, rekaman sesi, dan alur pengguna, lalu menyusun daftar perbaikan berdasarkan prioritas.",
        points: ["Audit heuristik & analitik", "Laporan temuan berprioritas", "Redesain halaman kunci", "Pendampingan implementasi"],
        img: img("1551288049-bebda4e38f71", 900),
        price: "Mulai Rp2.500.000",
    },
    {
        icon: "fa-swatchbook",
        title: "Design System",
        short: "Kumpulan komponen dan aturan visual agar tim Anda membangun produk dengan konsisten.",
        long: "Untuk tim yang produknya makin besar dan tampilannya mulai tidak seragam. Saya merapikan warna, tipografi, dan komponen, lalu mendokumentasikannya supaya desainer dan developer berbicara dengan bahasa yang sama.",
        points: ["Token warna, tipografi, spasi", "Pustaka komponen Figma", "Komponen kode (React/Astro)", "Dokumentasi pemakaian"],
        img: img("1558655146-9f40138edfeb", 900),
        price: "Mulai Rp8.000.000",
    },
];

export type Project = {
    slug: string; title: string; category: string; year: string; client: string;
    role: string; duration: string; summary: string; img: string; tags: string[];
    challenge: string; solution: string; results: { n: string; l: string }[]; tools: string[];
};

export const projects: Project[] = [
    {
        slug: "kopi-kelana",
        title: "Kopi Kelana: pesan dari meja tanpa antre",
        category: "Aplikasi Mobile",
        year: "2026",
        client: "Kopi Kelana (jaringan kafe, 6 cabang)",
        role: "Desain UI/UX, prototipe, front-end",
        duration: "10 minggu",
        summary: "Aplikasi pemesanan dari meja yang memangkas antrean kasir di jam sibuk.",
        img: img("1501339847302-ac426a4a7cbb", 1200),
        tags: ["UI/UX", "Mobile", "React Native"],
        challenge: "Di akhir pekan, antrean kasir bisa mencapai 15 menit dan sebagian pelanggan memilih pergi. Kasir juga kewalahan mencatat pesanan sambil menjelaskan menu.",
        solution: "Saya merancang alur pesan dari meja lewat kode QR: pilih menu, atur level gula dan es, bayar, lalu pantau status pesanan. Menu dipecah per kategori dengan foto besar dan filter cepat untuk 'paling laris' dan 'tanpa kafein'.",
        results: [{ n: "-42%", l: "Waktu tunggu pesanan" }, { n: "+28%", l: "Rata-rata nilai transaksi" }, { n: "4.8", l: "Rating di toko aplikasi" }],
        tools: ["Figma", "React Native", "Firebase", "Midtrans"],
    },
    {
        slug: "dompetku",
        title: "Dompetku: pencatat keuangan yang tidak membosankan",
        category: "Aplikasi Mobile",
        year: "2025",
        client: "Dompetku (startup fintech tahap awal)",
        role: "Riset, desain produk, design system",
        duration: "12 minggu",
        summary: "Aplikasi pencatat keuangan pribadi dengan onboarding 3 langkah dan laporan yang mudah dibaca.",
        img: img("1563986768609-322da13575f3", 1200),
        tags: ["Produk", "Design System", "Fintech"],
        challenge: "Sebagian besar pengguna baru berhenti sebelum selesai mendaftar, dan laporan bulanan dianggap terlalu rumit oleh pengguna non-akuntan.",
        solution: "Onboarding dipangkas dari 7 menjadi 3 langkah, dan laporan diganti ringkasan bahasa sehari-hari seperti 'Bulan ini kamu paling banyak keluar di makanan'. Semua komponen dirapikan menjadi design system agar tim bisa bergerak lebih cepat.",
        results: [{ n: "+61%", l: "Penyelesaian pendaftaran" }, { n: "3 langkah", l: "Onboarding (sebelumnya 7)" }, { n: "-35%", l: "Waktu desain per fitur" }],
        tools: ["Figma", "Maze", "Storybook", "TypeScript"],
    },
    {
        slug: "klinik-sehat-pratama",
        title: "Klinik Sehat Pratama: janji temu online",
        category: "Website",
        year: "2025",
        client: "Klinik Sehat Pratama, Surabaya",
        role: "Desain UI/UX, pengembangan website",
        duration: "6 minggu",
        summary: "Website klinik dengan jadwal dokter real-time dan pendaftaran janji temu via WhatsApp.",
        img: img("1576091160399-112ba8d25d1d", 1200),
        tags: ["Website", "Astro", "SEO"],
        challenge: "Pasien harus menelepon resepsionis hanya untuk menanyakan jadwal dokter, dan website lama sulit ditemukan di Google.",
        solution: "Halaman dokter menampilkan jadwal praktik yang selalu diperbarui, dengan tombol daftar yang langsung membuka WhatsApp berisi data pasien. Struktur SEO lokal dan halaman per layanan membantu klinik muncul untuk pencarian 'dokter gigi Surabaya'.",
        results: [{ n: "+3x", l: "Kunjungan dari Google" }, { n: "-50%", l: "Telepon tanya jadwal" }, { n: "94", l: "Skor performa Lighthouse" }],
        tools: ["Astro", "Tailwind", "Google Sheets API", "Figma"],
    },
    {
        slug: "propertiku-dashboard",
        title: "Propertiku: dashboard untuk tim pemasaran",
        category: "Dashboard",
        year: "2025",
        client: "Propertiku (agen properti, 20 marketing)",
        role: "Desain UI/UX, front-end",
        duration: "8 minggu",
        summary: "Dashboard internal yang menyatukan leads, jadwal survei, dan target penjualan dalam satu layar.",
        img: img("1460925895917-afdab827c52f", 1200),
        tags: ["Dashboard", "React", "Data"],
        challenge: "Data leads tersebar di spreadsheet dan grup chat, sehingga follow-up sering terlewat dan manajer sulit melihat performa tim.",
        solution: "Saya merancang papan leads bergaya kanban, kalender survei, dan ringkasan target per marketing. Prioritas visual diberikan pada 'leads yang perlu dihubungi hari ini' agar tidak ada yang terlewat.",
        results: [{ n: "+37%", l: "Leads yang ditindaklanjuti" }, { n: "1 layar", l: "Ganti 4 spreadsheet" }, { n: "2 jam", l: "Hemat laporan mingguan" }],
        tools: ["React", "Recharts", "Supabase", "Figma"],
    },
    {
        slug: "belajar-bareng",
        title: "Belajar Bareng: platform kursus untuk SMA",
        category: "Website",
        year: "2024",
        client: "Belajar Bareng (bimbingan belajar online)",
        role: "UX, desain visual, front-end",
        duration: "9 minggu",
        summary: "Platform kursus online dengan jalur belajar bertahap dan pelacak progres yang memotivasi.",
        img: img("1522202176988-66273c2fd55f", 1200),
        tags: ["Web App", "Pendidikan", "UX"],
        challenge: "Siswa mendaftar kursus tetapi jarang menyelesaikannya, karena tidak tahu harus mulai dari materi mana.",
        solution: "Setiap mata pelajaran dikemas menjadi jalur belajar mingguan dengan target kecil dan lencana progres. Halaman kelas dirancang agar video, ringkasan, dan latihan soal ada dalam satu alur.",
        results: [{ n: "+48%", l: "Kursus yang diselesaikan" }, { n: "12 mnt", l: "Rata-rata sesi belajar" }, { n: "4.7/5", l: "Skor kepuasan siswa" }],
        tools: ["Figma", "Astro", "React", "PostgreSQL"],
    },
    {
        slug: "tenun-studio",
        title: "Tenun Studio: identitas dan toko online",
        category: "Website",
        year: "2024",
        client: "Tenun Studio (brand fesyen lokal)",
        role: "Identitas visual, desain & pengembangan toko",
        duration: "7 minggu",
        summary: "Identitas visual dan toko online untuk brand fesyen kain tenun yang ingin tampil lebih modern.",
        img: img("1561070791-2526d30994b8", 1200),
        tags: ["Brand", "E-commerce", "Astro"],
        challenge: "Produknya cantik tetapi foto dan tampilan toko belum mencerminkan kualitas, sehingga sulit menjual ke pembeli di luar kota.",
        solution: "Saya menyusun palet warna dari motif tenun, memilih tipografi yang hangat namun modern, dan membangun toko dengan halaman produk bercerita yang menonjolkan proses pembuatan setiap kain.",
        results: [{ n: "+45%", l: "Konversi checkout" }, { n: "2.1x", l: "Pesanan dari luar Jawa" }, { n: "1,8 dtk", l: "Waktu muat halaman" }],
        tools: ["Figma", "Astro", "Snipcart", "Cloudinary"],
    },
];

export const categories = ["Semua", "Website", "Aplikasi Mobile", "Dashboard"];

export const process = [
    { icon: "fa-comments", title: "Diskusi awal", text: "Kita bicarakan tujuan, target pengguna, budget, dan tenggat. Gratis, sekitar 30 menit." },
    { icon: "fa-compass-drafting", title: "Rancangan", text: "Saya menyusun alur dan wireframe, lalu Anda memberi masukan sebelum masuk ke visual." },
    { icon: "fa-laptop-code", title: "Desain & pengembangan", text: "Visual final dibuat dan dibangun menjadi produk nyata, dengan pembaruan progres tiap minggu." },
    { icon: "fa-rocket", title: "Peluncuran & dukungan", text: "Produk diuji, diluncurkan, dan Anda mendapat dukungan perbaikan selama 30 hari." },
];

export const testimonials = [
    { name: "Dewi Anggraini", role: "Pemilik, Kopi Kelana", text: "Raka paham betul alur di kafe kami. Antrean jam sibuk berkurang drastis dan karyawan lebih tenang. Komunikasinya jelas dan tidak pernah telat dari jadwal." },
    { name: "dr. Hendra Wijaya", role: "Direktur, Klinik Sehat Pratama", text: "Sebelumnya pasien selalu menelepon. Sekarang cukup buka website, lihat jadwal, dan daftar. Hasilnya rapi dan mudah kami perbarui sendiri." },
    { name: "Michelle Tan", role: "Product Lead, Dompetku", text: "Design system dari Raka membuat tim kami bergerak jauh lebih cepat. Ia berpikir seperti desainer sekaligus developer, jadi hasilnya mudah diimplementasikan." },
];

export const experience = [
    { year: "2025 - sekarang", title: "Desainer & developer independen", place: "Surabaya", text: "Menangani produk digital untuk UMKM, klinik, dan startup tahap awal di Jawa Timur." },
    { year: "2021 - 2025", title: "Senior Product Designer", place: "Nusa Digital (studio produk)", text: "Memimpin desain untuk 12 aplikasi, membangun design system, dan membimbing 3 desainer junior." },
    { year: "2019 - 2021", title: "UI Designer & Front-end Developer", place: "Arek Kreatif Studio", text: "Mengerjakan website dan aplikasi untuk klien lokal dari sektor ritel dan pendidikan." },
    { year: "2017 - 2019", title: "Freelancer", place: "Remote", text: "Memulai karier dengan mengerjakan desain landing page dan identitas visual kecil-kecilan." },
];

export const skills = [
    { group: "Desain", items: ["Figma", "Riset pengguna", "Prototyping", "Design system", "Tipografi"] },
    { group: "Pengembangan", items: ["Astro", "React", "TypeScript", "Tailwind CSS", "Node.js"] },
    { group: "Kolaborasi", items: ["Workshop", "Presentasi ke klien", "Dokumentasi", "Notion", "Maze"] },
];

export const values = [
    { icon: "fa-bullseye", title: "Mulai dari tujuan", text: "Setiap keputusan desain harus bisa dijelaskan: apa yang ingin dicapai pengguna dan bisnis Anda." },
    { icon: "fa-gauge-high", title: "Cepat dan ringan", text: "Website yang lambat membuat orang pergi. Saya menjaga performa sejak hari pertama." },
    { icon: "fa-handshake", title: "Terbuka dan jelas", text: "Estimasi, jadwal, dan progres disampaikan apa adanya. Tidak ada biaya tersembunyi." },
    { icon: "fa-universal-access", title: "Bisa dipakai semua orang", text: "Kontras, ukuran teks, dan navigasi keyboard dipertimbangkan, bukan ditambahkan di akhir." },
];

export const packages = [
    { name: "Landing Page", price: "Rp4.500.000", note: "Untuk peluncuran produk atau promosi", features: ["1 halaman panjang", "Desain Figma + kode", "Responsif & SEO dasar", "Revisi 2 kali", "Garansi perbaikan 30 hari"], featured: false },
    { name: "Website Multipage", price: "Rp9.000.000", note: "Untuk bisnis jasa dan company profile", features: ["Hingga 6 halaman", "Riset & wireframe", "Blog / portofolio", "Integrasi WhatsApp & analitik", "Revisi 3 kali", "Garansi perbaikan 60 hari"], featured: true },
    { name: "Produk Digital", price: "Rp18.000.000+", note: "Untuk aplikasi web atau mobile", features: ["Riset & uji pengguna", "Prototipe interaktif", "Design system dasar", "Pendampingan developer", "Revisi sesuai sprint"], featured: false },
];

export const faqs = [
    { q: "Berapa lama pengerjaan sebuah website?", a: "Landing page biasanya 1 sampai 2 minggu, website multipage 3 sampai 5 minggu, dan produk digital 8 sampai 12 minggu. Jadwal pasti saya sampaikan setelah diskusi awal." },
    { q: "Apakah harga di sini sudah final?", a: "Harga adalah titik awal. Biaya akhir bergantung pada jumlah halaman, fitur, dan kebutuhan konten. Anda akan mendapat penawaran tertulis sebelum proyek dimulai." },
    { q: "Apakah saya bisa memperbarui konten sendiri?", a: "Bisa. Saya menyiapkan panduan singkat dan, jika diperlukan, sistem pengelolaan konten sederhana supaya Anda tidak bergantung pada developer untuk hal kecil." },
    { q: "Bagaimana sistem pembayarannya?", a: "Pembayaran dibagi menjadi 3 tahap: 40% di awal, 40% setelah desain disetujui, dan 20% saat serah terima. Transfer bank dan dompet digital tersedia." },
    { q: "Apakah menerima klien di luar Surabaya?", a: "Tentu. Sebagian besar klien saya bekerja jarak jauh lewat Google Meet dan WhatsApp. Untuk area Surabaya dan sekitarnya, pertemuan tatap muka juga bisa diatur." },
    { q: "Apa yang saya dapat setelah proyek selesai?", a: "Seluruh file desain, kode sumber, dan akses domain atau hosting menjadi milik Anda. Saya juga menyertakan dukungan perbaikan selama 30 sampai 60 hari." },
];
