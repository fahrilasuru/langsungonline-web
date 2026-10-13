// Data demo "Langkah Nusa Travel" — semua nama, harga, dan testimoni adalah contoh fiktif.

export const PHONE = "6281234567890";
export const BASE = "/demo/travel";

export const wa = (text: string) =>
    `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;

export const WA_DEFAULT = wa(
    "Halo Langkah Nusa, saya ingin konsultasi rencana liburan. Tujuan: ___, jumlah peserta: ___, perkiraan tanggal: ___.",
);

export const img = (id: string, w = 800) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const rupiah = (n: number) =>
    "Rp" + n.toLocaleString("id-ID");

export type Paket = {
    slug: string;
    nama: string;
    tujuan: string;
    kategori: "Domestik" | "Internasional";
    tipe: "Open Trip" | "Private Trip";
    durasi: string;
    harga: number;
    foto: string;
    badge?: string;
    rating: number;
    ulasan: number;
    ringkas: string;
    highlight: string[];
    termasuk: string[];
    itinerary: { hari: string; judul: string; isi: string }[];
};

export const paket: Paket[] = [
    {
        slug: "bali-eksotis",
        nama: "Bali Eksotis: Ubud, Nusa Penida & Uluwatu",
        tujuan: "Bali",
        kategori: "Domestik",
        tipe: "Open Trip",
        durasi: "4 Hari 3 Malam",
        harga: 3450000,
        foto: "1537996194471-e657df975ab4",
        badge: "Terlaris",
        rating: 4.9,
        ulasan: 86,
        ringkas:
            "Rute santai yang memadukan sawah Ubud, tebing Nusa Penida, dan sunset di Uluwatu.",
        highlight: [
            "Tegallalang & Pura Tirta Empul",
            "Day trip Nusa Penida (Kelingking, Angel's Billabong)",
            "Sunset dan tari Kecak di Uluwatu",
        ],
        termasuk: [
            "Hotel bintang 3-4 (twin sharing)",
            "Transportasi AC + driver",
            "Tiket masuk wisata sesuai itinerary",
            "Sarapan dan 2x makan siang",
            "Tour leader lokal",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Tiba & Ubud", isi: "Jemput di bandara, makan siang, Tegallalang, check-in hotel di Ubud." },
            { hari: "Hari 2", judul: "Nusa Penida", isi: "Fast boat ke Nusa Penida, Kelingking Beach, Angel's Billabong, Crystal Bay." },
            { hari: "Hari 3", judul: "Uluwatu", isi: "Pura Tirta Empul, waktu bebas pantai, sunset Uluwatu dan tari Kecak." },
            { hari: "Hari 4", judul: "Pulang", isi: "Belanja oleh-oleh, antar ke bandara." },
        ],
    },
    {
        slug: "labuan-bajo-sailing",
        nama: "Labuan Bajo Sailing Trip: Padar & Komodo",
        tujuan: "Labuan Bajo",
        kategori: "Domestik",
        tipe: "Open Trip",
        durasi: "3 Hari 2 Malam",
        harga: 4950000,
        foto: "1570789210967-2cac24afeb00",
        badge: "Favorit",
        rating: 4.9,
        ulasan: 64,
        ringkas:
            "Menginap di atas kapal phinisi, trekking Pulau Padar, dan bertemu komodo di habitat aslinya.",
        highlight: [
            "Trekking sunrise Pulau Padar",
            "Snorkeling Pink Beach & Manta Point",
            "Pulau Komodo bersama ranger resmi",
        ],
        termasuk: [
            "Kapal phinisi + kru + kabin AC",
            "Semua makan di atas kapal",
            "Tiket Taman Nasional Komodo",
            "Alat snorkeling dasar",
            "Dokumentasi drone",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Kelor & Rinca", isi: "Naik kapal dari pelabuhan, trekking Pulau Kelor, Pulau Rinca, sunset di Kalong." },
            { hari: "Hari 2", judul: "Padar & Pink Beach", isi: "Sunrise Padar, snorkeling Pink Beach, Pulau Komodo, Manta Point." },
            { hari: "Hari 3", judul: "Gua & Pulang", isi: "Gua Batu Cermin, belanja oleh-oleh, antar ke bandara." },
        ],
    },
    {
        slug: "bromo-ijen",
        nama: "Bromo – Ijen Sunrise Adventure",
        tujuan: "Jawa Timur",
        kategori: "Domestik",
        tipe: "Open Trip",
        durasi: "3 Hari 2 Malam",
        harga: 1850000,
        foto: "1588668214407-6ea9a6d8c272",
        rating: 4.8,
        ulasan: 112,
        ringkas:
            "Dua gunung ikonik dalam satu perjalanan: lautan pasir Bromo dan api biru Kawah Ijen.",
        highlight: [
            "Sunrise Penanjakan & jeep Bromo",
            "Pendakian malam ke api biru Ijen",
            "Penginapan dekat titik awal pendakian",
        ],
        termasuk: [
            "Jeep Bromo 4WD",
            "Penginapan 2 malam",
            "Masker gas & senter",
            "Tiket masuk TNBTS dan Ijen",
            "Pemandu berpengalaman",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Menuju Bromo", isi: "Berangkat dari Surabaya/Malang, istirahat di Cemoro Lawang." },
            { hari: "Hari 2", judul: "Sunrise Bromo", isi: "Penanjakan, lautan pasir, kawah Bromo, lanjut ke Banyuwangi." },
            { hari: "Hari 3", judul: "Api Biru Ijen", isi: "Pendakian dini hari, blue fire, turun dan antar kembali." },
        ],
    },
    {
        slug: "raja-ampat",
        nama: "Raja Ampat Escape: Wayag & Piaynemo",
        tujuan: "Raja Ampat",
        kategori: "Domestik",
        tipe: "Private Trip",
        durasi: "5 Hari 4 Malam",
        harga: 9800000,
        foto: "1544551763-46a013bb70d5",
        badge: "Premium",
        rating: 5.0,
        ulasan: 31,
        ringkas:
            "Surga bawah laut Indonesia dengan homestay tepi pantai dan speedboat privat.",
        highlight: [
            "Viewpoint Piaynemo & Telaga Bintang",
            "Snorkeling di Arborek dan Friwen Wall",
            "Homestay tepi laut dengan masakan lokal",
        ],
        termasuk: [
            "Homestay/resort 4 malam",
            "Speedboat privat",
            "Semua makan",
            "Izin masuk kawasan konservasi",
            "Pemandu lokal Waisai",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Sorong – Waisai", isi: "Jemput di Sorong, ferry ke Waisai, check-in homestay." },
            { hari: "Hari 2", judul: "Piaynemo", isi: "Speedboat ke Piaynemo, Telaga Bintang, snorkeling Pulau Mansuar." },
            { hari: "Hari 3", judul: "Arborek", isi: "Desa Arborek, snorkeling manta, makan malam bakar ikan." },
            { hari: "Hari 4", judul: "Friwen Wall", isi: "Snorkeling/diving ringan, waktu bebas." },
            { hari: "Hari 5", judul: "Pulang", isi: "Ferry kembali ke Sorong dan antar ke bandara." },
        ],
    },
    {
        slug: "lombok-gili",
        nama: "Lombok & Tiga Gili Santai",
        tujuan: "Lombok",
        kategori: "Domestik",
        tipe: "Open Trip",
        durasi: "4 Hari 3 Malam",
        harga: 3950000,
        foto: "1506929562872-bb421503ef21",
        rating: 4.8,
        ulasan: 57,
        ringkas:
            "Pantai selatan Lombok, air terjun Sendang Gile, dan hopping tiga Gili dengan jadwal longgar.",
        highlight: [
            "Pantai Tanjung Aan & Bukit Merese",
            "Island hopping Gili Trawangan, Meno, Air",
            "Snorkeling bersama penyu",
        ],
        termasuk: [
            "Hotel & villa (twin sharing)",
            "Boat ke Gili",
            "Sarapan dan 1x makan malam",
            "Sepeda/cidomo di Gili",
            "Tour leader",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Kuta Lombok", isi: "Tiba, Tanjung Aan, Bukit Merese, sunset." },
            { hari: "Hari 2", judul: "Air Terjun", isi: "Sendang Gile & Tiu Kelep, lanjut ke Senggigi." },
            { hari: "Hari 3", judul: "Tiga Gili", isi: "Boat hopping, snorkeling penyu, bebas di Trawangan." },
            { hari: "Hari 4", judul: "Pulang", isi: "Sarapan, belanja mutiara, antar ke bandara." },
        ],
    },
    {
        slug: "yogyakarta-borobudur",
        nama: "Yogyakarta Klasik & Borobudur Sunrise",
        tujuan: "Yogyakarta",
        kategori: "Domestik",
        tipe: "Open Trip",
        durasi: "3 Hari 2 Malam",
        harga: 1650000,
        foto: "1596402184320-417e7178b2cd",
        rating: 4.7,
        ulasan: 73,
        ringkas:
            "Budaya, kuliner, dan candi untuk keluarga atau rombongan kantor.",
        highlight: [
            "Sunrise Candi Borobudur",
            "Keraton, Tamansari, Malioboro",
            "Jeep lava tour Merapi",
        ],
        termasuk: [
            "Hotel bintang 3",
            "Bus/Hiace AC",
            "Tiket candi dan keraton",
            "Sarapan dan 2x makan",
            "Pemandu",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Kota Yogya", isi: "Keraton, Tamansari, makan gudeg, Malioboro." },
            { hari: "Hari 2", judul: "Borobudur & Merapi", isi: "Sunrise Borobudur, lava tour Merapi, Prambanan." },
            { hari: "Hari 3", judul: "Pulang", isi: "Belanja bakpia, antar ke stasiun/bandara." },
        ],
    },
    {
        slug: "jepang-sakura",
        nama: "Jepang Klasik: Tokyo, Kyoto & Osaka",
        tujuan: "Jepang",
        kategori: "Internasional",
        tipe: "Open Trip",
        durasi: "6 Hari 5 Malam",
        harga: 18900000,
        foto: "1528360983277-13d401cdc186",
        badge: "Segera Penuh",
        rating: 4.9,
        ulasan: 48,
        ringkas:
            "Rute klasik Golden Route dengan Shinkansen, kuil, dan waktu bebas belanja.",
        highlight: [
            "Kuil Senso-ji & Shibuya Crossing",
            "Fushimi Inari dan Arashiyama",
            "Shinkansen Tokyo – Kyoto",
        ],
        termasuk: [
            "Tiket pesawat PP (ekonomi)",
            "Hotel bintang 3-4",
            "Shinkansen & transportasi lokal",
            "Bantuan pengurusan visa",
            "Tour leader dari Indonesia",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Berangkat", isi: "Penerbangan menuju Tokyo." },
            { hari: "Hari 2", judul: "Tokyo", isi: "Asakusa, Senso-ji, Akihabara, Shibuya." },
            { hari: "Hari 3", judul: "Tokyo – Kyoto", isi: "Shinkansen ke Kyoto, Gion, jalan malam." },
            { hari: "Hari 4", judul: "Kyoto", isi: "Fushimi Inari, Kinkaku-ji, Arashiyama." },
            { hari: "Hari 5", judul: "Osaka", isi: "Kastil Osaka, Dotonbori, belanja." },
            { hari: "Hari 6", judul: "Pulang", isi: "Transfer ke bandara Kansai." },
        ],
    },
    {
        slug: "korea-selatan",
        nama: "Korea Selatan: Seoul, Nami & Everland",
        tujuan: "Korea Selatan",
        kategori: "Internasional",
        tipe: "Open Trip",
        durasi: "6 Hari 5 Malam",
        harga: 14900000,
        foto: "1517154421773-0529f29ea451",
        rating: 4.8,
        ulasan: 39,
        ringkas:
            "Wisata kota, taman, dan belanja yang pas untuk keluarga dan rombongan teman.",
        highlight: [
            "Istana Gyeongbokgung (sewa hanbok)",
            "Pulau Nami & Petite France",
            "Everland dan belanja Myeongdong",
        ],
        termasuk: [
            "Tiket pesawat PP",
            "Hotel bintang 3-4",
            "Tiket Everland",
            "Bantuan K-ETA/visa",
            "Tour leader",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Berangkat", isi: "Penerbangan menuju Seoul." },
            { hari: "Hari 2", judul: "Seoul", isi: "Gyeongbokgung, Bukchon, Insadong." },
            { hari: "Hari 3", judul: "Nami", isi: "Pulau Nami, Petite France, Garden of Morning Calm." },
            { hari: "Hari 4", judul: "Everland", isi: "Seharian di Everland." },
            { hari: "Hari 5", judul: "Belanja", isi: "Myeongdong, Hongdae, N Seoul Tower." },
            { hari: "Hari 6", judul: "Pulang", isi: "Transfer ke bandara Incheon." },
        ],
    },
    {
        slug: "singapura-malaysia",
        nama: "Singapura – Malaysia: Sekali Jalan",
        tujuan: "Singapura & Malaysia",
        kategori: "Internasional",
        tipe: "Open Trip",
        durasi: "5 Hari 4 Malam",
        harga: 6250000,
        foto: "1525625293386-3f8f99389edd",
        rating: 4.7,
        ulasan: 52,
        ringkas:
            "Dua negara tanpa ribet: Gardens by the Bay, Genting Highlands, dan Kuala Lumpur.",
        highlight: [
            "Marina Bay & Gardens by the Bay",
            "Universal Studios (opsional)",
            "Petronas Twin Towers & Batu Caves",
        ],
        termasuk: [
            "Tiket pesawat PP",
            "Hotel bintang 3-4",
            "Bus lintas negara",
            "Sarapan harian",
            "Tour leader",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Singapura", isi: "Tiba, Merlion, Marina Bay, Gardens by the Bay." },
            { hari: "Hari 2", judul: "Singapura", isi: "Sentosa atau Universal Studios (opsional)." },
            { hari: "Hari 3", judul: "Menuju Malaysia", isi: "Bus ke Johor Bahru, lanjut ke Kuala Lumpur." },
            { hari: "Hari 4", judul: "Kuala Lumpur", isi: "Batu Caves, Petronas, Genting Highlands." },
            { hari: "Hari 5", judul: "Pulang", isi: "Belanja, antar ke bandara KLIA." },
        ],
    },
    {
        slug: "turki-klasik",
        nama: "Turki Klasik: Istanbul & Cappadocia",
        tujuan: "Turki",
        kategori: "Internasional",
        tipe: "Private Trip",
        durasi: "8 Hari 7 Malam",
        harga: 21500000,
        foto: "1524231757912-21f4fe3a7200",
        badge: "Premium",
        rating: 4.9,
        ulasan: 27,
        ringkas:
            "Balon udara Cappadocia, Hagia Sophia, dan Pamukkale dalam satu rute nyaman.",
        highlight: [
            "Hagia Sophia & Grand Bazaar",
            "Hot air balloon Cappadocia (opsional)",
            "Pamukkale & Efesus",
        ],
        termasuk: [
            "Tiket pesawat PP",
            "Hotel bintang 4 + hotel gua",
            "Domestic flight Istanbul – Kayseri",
            "Makan sesuai itinerary",
            "Tour leader",
        ],
        itinerary: [
            { hari: "Hari 1", judul: "Berangkat", isi: "Penerbangan menuju Istanbul." },
            { hari: "Hari 2-3", judul: "Istanbul", isi: "Hagia Sophia, Blue Mosque, Grand Bazaar, kruser Bosphorus." },
            { hari: "Hari 4-5", judul: "Cappadocia", isi: "Goreme, lembah, balon udara (opsional)." },
            { hari: "Hari 6-7", judul: "Pamukkale & Efesus", isi: "Kolam travertine, kota kuno Efesus." },
            { hari: "Hari 8", judul: "Pulang", isi: "Transfer ke bandara." },
        ],
    },
];

export const destinasi = [
    {
        nama: "Bali",
        foto: "1537996194471-e657df975ab4",
        waktu: "April – Oktober",
        cocok: "Pasangan, keluarga, pencari ketenangan",
        deskripsi:
            "Mulai dari sawah berundak di Ubud sampai tebing Uluwatu, Bali cocok untuk liburan yang bisa diatur santai atau padat.",
        sorotan: ["Ubud & Tegallalang", "Nusa Penida", "Uluwatu"],
    },
    {
        nama: "Labuan Bajo",
        foto: "1570789210967-2cac24afeb00",
        waktu: "April – Desember",
        cocok: "Rombongan teman, petualang, fotografer",
        deskripsi:
            "Pintu masuk ke Taman Nasional Komodo. Pengalaman terbaik adalah menginap di kapal dan melihat Padar saat matahari terbit.",
        sorotan: ["Pulau Padar", "Pink Beach", "Manta Point"],
    },
    {
        nama: "Bromo & Ijen",
        foto: "1588668214407-6ea9a6d8c272",
        waktu: "Mei – September",
        cocok: "Pendaki pemula, anak muda, fotografer",
        deskripsi:
            "Dua gunung dengan pemandangan sangat berbeda dan bisa dijangkau dalam akhir pekan panjang dari Surabaya atau Malang.",
        sorotan: ["Sunrise Penanjakan", "Lautan pasir", "Api biru Ijen"],
    },
    {
        nama: "Raja Ampat",
        foto: "1544551763-46a013bb70d5",
        waktu: "Oktober – April",
        cocok: "Penyelam, pasangan, wisata premium",
        deskripsi:
            "Salah satu keanekaragaman laut terkaya di dunia. Butuh perencanaan transportasi yang matang, dan di situlah kami membantu.",
        sorotan: ["Piaynemo", "Arborek", "Friwen"],
    },
    {
        nama: "Jepang",
        foto: "1528360983277-13d401cdc186",
        waktu: "Maret – April & Oktober – November",
        cocok: "Keluarga, pasangan, wisata budaya",
        deskripsi:
            "Musim sakura dan musim gugur adalah puncaknya. Kami bantu visa dan susun rute supaya tidak habis di transportasi.",
        sorotan: ["Tokyo", "Kyoto", "Osaka"],
    },
    {
        nama: "Turki",
        foto: "1524231757912-21f4fe3a7200",
        waktu: "April – Juni & September – Oktober",
        cocok: "Pasangan, keluarga besar, wisata sejarah",
        deskripsi:
            "Perpaduan Eropa dan Asia dengan sejarah ribuan tahun. Balon udara Cappadocia sangat bergantung pada cuaca sehingga jadwal dibuat fleksibel.",
        sorotan: ["Istanbul", "Cappadocia", "Pamukkale"],
    },
];

export const layanan = [
    { ikon: "fa-suitcase-rolling", judul: "Paket Wisata", isi: "Open trip dan private trip dengan itinerary jelas, harga tertulis." },
    { ikon: "fa-plane-departure", judul: "Tiket Pesawat", isi: "Pencarian rute dan jadwal terbaik, termasuk tiket grup." },
    { ikon: "fa-hotel", judul: "Hotel & Villa", isi: "Reservasi akomodasi sesuai budget dan lokasi yang Anda inginkan." },
    { ikon: "fa-passport", judul: "Visa & Dokumen", isi: "Pendampingan dokumen visa Jepang, Korea, Schengen, dan lainnya." },
    { ikon: "fa-people-group", judul: "Gathering & MICE", isi: "Outing kantor, study tour sekolah, dan perjalanan komunitas." },
    { ikon: "fa-map-location-dot", judul: "Custom Itinerary", isi: "Punya rute sendiri? Kami susun ulang agar realistis dan efisien." },
];

export const langkah = [
    { judul: "Ceritakan rencana Anda", isi: "Kirim tujuan, tanggal, jumlah peserta, dan budget lewat WhatsApp." },
    { judul: "Terima penawaran", isi: "Kami kirim itinerary dan rincian biaya dalam 1 hari kerja." },
    { judul: "Konfirmasi & DP", isi: "Setelah cocok, bayar DP untuk mengunci tiket dan akomodasi." },
    { judul: "Berangkat tenang", isi: "Tim kami mendampingi sebelum, selama, dan sesudah perjalanan." },
];

export const testimoni = [
    {
        nama: "Rina Kusuma",
        asal: "Surabaya",
        trip: "Bali Eksotis",
        foto: "1494790108377-be9c29b29330",
        isi: "Jadwalnya rapi tapi tidak terburu-buru. Tour leader-nya sabar membantu keluarga kami yang membawa dua anak kecil.",
    },
    {
        nama: "Andika Pratama",
        asal: "Jakarta",
        trip: "Labuan Bajo Sailing",
        foto: "1507003211169-0a1dd7228f2d",
        isi: "Harga yang tertulis di awal sama dengan yang dibayar di akhir. Kapalnya bersih dan kru ramah.",
    },
    {
        nama: "Maya Lestari",
        asal: "Bandung",
        trip: "Jepang Klasik",
        foto: "1438761681033-6461ffad8d80",
        isi: "Urusan visa dibantu dari awal sampai selesai. Saya tinggal menyiapkan koper.",
    },
];

export const faq = [
    { q: "Apakah ada biaya untuk konsultasi awal?", a: "Tidak. Konsultasi dan penyusunan penawaran awal gratis, tanpa kewajiban memesan." },
    { q: "Berapa DP yang harus dibayar?", a: "Umumnya 30–50% dari total paket untuk mengunci tiket dan akomodasi. Pelunasan paling lambat 14 hari sebelum keberangkatan untuk paket domestik, dan 30 hari untuk internasional." },
    { q: "Apakah harga paket sudah termasuk tiket pesawat?", a: "Paket domestik umumnya belum termasuk tiket pesawat ke kota tujuan, tetapi kami bisa membantu mencarikan. Paket internasional sudah termasuk tiket PP, kecuali disebutkan lain." },
    { q: "Bagaimana jika perjalanan dibatalkan?", a: "Kebijakan pembatalan mengikuti ketentuan maskapai dan hotel. Kami jelaskan rincian biaya pembatalan sebelum Anda membayar DP." },
    { q: "Apakah bisa membawa anak kecil atau orang tua?", a: "Bisa. Beberapa itinerary punya versi lebih ringan. Sampaikan kondisi peserta saat konsultasi agar rute disesuaikan." },
    { q: "Apakah mengurus visa?", a: "Ya, kami mendampingi dokumen dan pengajuan. Keputusan visa tetap sepenuhnya di tangan kedutaan negara tujuan." },
    { q: "Minimal peserta untuk private trip?", a: "Mulai dari 2 orang. Semakin banyak peserta, biaya per orang biasanya semakin terjangkau." },
];
