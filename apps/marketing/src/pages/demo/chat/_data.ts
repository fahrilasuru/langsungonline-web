/* Data contoh untuk demo chat RuangRapi. Semua nama, nomor, dan alamat fiktif. */

export type Tone = 0 | 1 | 2 | 3 | 4 | 5;
export type AttachmentKind = "image" | "doc";
export type Status = "sent" | "delivered" | "read";

export interface Attachment {
    kind: AttachmentKind;
    name: string;
    size: string;
    /** Hanya diisi untuk gambar yang dipilih pengguna (blob: URL buatan sendiri). */
    url?: string;
}

export interface Message {
    id: string;
    from: "in" | "out";
    text?: string;
    author?: string;
    attachment?: Attachment;
    at: number;
    status?: Status;
}

export interface Reply {
    text: string;
    author?: string;
}

export interface Conversation {
    id: string;
    name: string;
    initials: string;
    tone: Tone;
    role: string;
    label: string;
    group?: boolean;
    subtitle?: string;
    online: boolean;
    seenAt: number;
    unread: number;
    draft: string;
    location?: string;
    budget?: string;
    phone?: string;
    /** Indeks pada STAGES, atau null bila bukan percakapan proyek. */
    stage: number | null;
    replies: Reply[];
    fileReply: Reply;
    replyIndex: number;
    messages: Message[];
}

export const STAGES = ["Konsultasi", "Survei", "Penawaran", "Pengerjaan", "Serah terima"] as const;

export const QUICK_REPLIES = [
    {
        label: "Jadwal survei",
        text: "Kami bisa jadwalkan survei lokasi besok pukul 10.00 atau lusa pukul 14.00. Waktu mana yang lebih nyaman?",
    },
    {
        label: "Minta foto ruangan",
        text: "Boleh kirimkan foto ruangan dan perkiraan ukurannya? Itu membantu kami menyiapkan estimasi.",
    },
    {
        label: "Info harga",
        text: "Harga bergantung pada ukuran dan material. Setelah survei, kami kirim penawaran tertulis yang rinci tanpa biaya tambahan.",
    },
    {
        label: "Terima kasih",
        text: "Terima kasih sudah menghubungi RuangRapi. Kabari kami jika ada yang ingin ditanyakan.",
    },
] as const;

const NOW = Date.now();
const MIN = 60_000;
const ago = (minutes: number) => NOW - minutes * MIN;

let seq = 0;
export const nextId = () => `m${++seq}`;

const text = (
    from: "in" | "out",
    body: string,
    minutesAgo: number,
    author?: string,
): Message => ({
    id: nextId(),
    from,
    text: body,
    at: ago(minutesAgo),
    ...(from === "out" ? { status: "read" as const } : {}),
    ...(author ? { author } : {}),
});

const file = (
    from: "in" | "out",
    name: string,
    size: string,
    kind: AttachmentKind,
    minutesAgo: number,
    author?: string,
): Message => ({
    id: nextId(),
    from,
    attachment: { kind, name, size },
    at: ago(minutesAgo),
    ...(from === "out" ? { status: "read" as const } : {}),
    ...(author ? { author } : {}),
});

export const CONVERSATIONS: Conversation[] = [
    {
        id: "dewi",
        name: "Bu Dewi Lestari",
        initials: "DL",
        tone: 0,
        role: "Kitchen set 3 meter",
        label: "Penawaran",
        online: true,
        seenAt: ago(1),
        unread: 2,
        draft: "",
        location: "Waru, Sidoarjo",
        budget: "Rp15–20 juta",
        phone: "0812-••••-3321",
        stage: 2,
        replies: [
            { text: "Oke, kalau 3–4 minggu masih cocok dengan jadwal saya." },
            { text: "DP-nya berapa persen ya?" },
            { text: "Baik, nanti saya kabari akhir pekan ini." },
        ],
        fileReply: { text: "Sudah saya terima, terima kasih." },
        replyIndex: 0,
        messages: [
            text("in", "Selamat sore, saya lihat portofolio kitchen set di website. Bisa dibuatkan untuk dapur ukuran 3 meter?", 1500),
            text("out", "Selamat sore Bu Dewi, tentu bisa. Boleh kirim foto dapur dan perkiraan ukurannya? Tim kami bantu hitung kebutuhannya.", 1490),
            file("in", "foto_dapur_waru.jpg", "1,4 MB", "image", 1480),
            text("out", "Terima kasih, fotonya jelas. Untuk finishing, Ibu lebih suka HPL atau duco? HPL lebih tahan panas dan air, duco tampilannya lebih mulus.", 1470),
            text("in", "HPL saja, yang tahan lama. Kira-kira biayanya berapa ya?", 1440),
            text("out", "Estimasi awal untuk 3 meter dengan HPL dan top table granit sekitar Rp17–19 juta. Rincian lengkapnya ada di penawaran berikut.", 120),
            file("out", "Penawaran_KitchenSet_Dewi.pdf", "286 KB", "doc", 119),
            text("in", "Terima kasih, saya baca dulu ya.", 3),
            text("in", "Kalau mulai dikerjakan, kira-kira berapa lama sampai terpasang?", 2),
        ],
    },
    {
        id: "rani",
        name: "Rani Kusuma",
        initials: "RK",
        tone: 2,
        role: "Interior kafe 40 m²",
        label: "Baru",
        online: true,
        seenAt: ago(1),
        unread: 1,
        draft: "",
        location: "Gresik Kota",
        budget: "Rp120–150 juta",
        phone: "0857-••••-9084",
        stage: 0,
        replies: [
            { text: "Luas ruangnya sekitar 40 m², ada area outdoor kecil di depan." },
            { text: "Targetnya buka dua bulan lagi, apakah memungkinkan?" },
            { text: "Boleh minta contoh proyek kafe sebelumnya?" },
        ],
        fileReply: { text: "Sudah masuk, terima kasih. Saya lihat dulu." },
        replyIndex: 0,
        messages: [
            text("in", "Halo, kami mau bikin kafe 40 m² di Gresik dengan konsep industrial hangat. Apakah RuangRapi menerima proyek komersial?", 12),
        ],
    },
    {
        id: "hendra",
        name: "Pak Hendra Wijaya",
        initials: "HW",
        tone: 1,
        role: "Renovasi dapur dan kamar mandi",
        label: "Survei",
        online: false,
        seenAt: ago(36),
        unread: 0,
        draft: "",
        location: "Rungkut, Surabaya",
        budget: "Rp60–80 juta",
        phone: "0813-••••-7745",
        stage: 1,
        replies: [
            { text: "Baik Pak, saya tunggu." },
            { text: "Pagar warna hitam ya, langsung masuk saja." },
            { text: "Terima kasih infonya." },
        ],
        fileReply: { text: "Sudah saya terima, terima kasih." },
        replyIndex: 0,
        messages: [
            text("in", "Pak, saya mau renovasi dapur dan kamar mandi sekaligus. Bisa survei dulu?", 1700),
            text("out", "Bisa, Pak Hendra. Kami ada slot survei besok pukul 10.00 atau lusa pukul 14.00. Bapak lebih nyaman yang mana?", 1690),
            text("in", "Besok jam 10 saja.", 1650),
            text("out", "Siap, besok pukul 10.00 di Rungkut ya. Tim survei membawa meteran dan contoh material.", 1648),
            text("out", "Tim survei kami sedang menuju lokasi Bapak, estimasi tiba 15 menit lagi.", 40),
            text("in", "Baik, saya tunggu di rumah ya.", 38),
        ],
    },
    {
        id: "tim",
        name: "Tim Lapangan",
        initials: "TL",
        tone: 3,
        role: "Grup internal",
        label: "Internal",
        group: true,
        subtitle: "Dimas, Sari, Bagas, dan 3 anggota lain",
        online: true,
        seenAt: ago(1),
        unread: 0,
        draft: "",
        location: "Kantor RuangRapi, Surabaya",
        stage: null,
        replies: [
            { author: "Dimas", text: "Siap, besok pagi saya cek langsung." },
            { author: "Sari", text: "Noted, saya update jadwalnya di papan proyek." },
            { author: "Bagas", text: "Oke, material kami siapkan hari ini." },
        ],
        fileReply: { author: "Dimas", text: "Siap, kami cek berkasnya." },
        replyIndex: 0,
        messages: [
            text("in", "Backdrop TV Pak Yusuf sudah selesai dipasang, rapi.", 200, "Dimas"),
            file("in", "backdrop_tv_yusuf.jpg", "2,3 MB", "image", 199, "Dimas"),
            text("out", "Bagus, terima kasih Dimas. Besok tolong cek sambungan lampu LED-nya sekali lagi ya.", 180),
            text("in", "Material HPL untuk kitchen set Bu Dewi sudah tersedia di gudang.", 55, "Sari"),
        ],
    },
    {
        id: "yusuf",
        name: "Pak Yusuf Hakim",
        initials: "YH",
        tone: 5,
        role: "Wardrobe dan backdrop TV",
        label: "Pengerjaan",
        online: false,
        seenAt: ago(125),
        unread: 0,
        draft: "",
        location: "Citraland, Surabaya",
        budget: "Rp28–35 juta",
        phone: "0821-••••-1208",
        stage: 3,
        replies: [
            { text: "Siap, saya ada di rumah seharian." },
            { text: "Lampunya sudah menyala semua, bagus." },
            { text: "Nanti saya kabari kalau ada yang kurang." },
        ],
        fileReply: { text: "Terima, nanti saya lihat." },
        replyIndex: 0,
        messages: [
            text("in", "Backdrop TV-nya sudah terpasang, rapi sekali. Terima kasih.", 140),
            text("out", "Senang mendengarnya, Pak Yusuf. Besok tim kami datang untuk cek sambungan lampu dan finishing akhir.", 130),
        ],
    },
    {
        id: "maya",
        name: "Maya Anggraini",
        initials: "MA",
        tone: 4,
        role: "Apartemen studio 28 m²",
        label: "Penawaran",
        online: false,
        seenAt: ago(305),
        unread: 0,
        draft: "",
        location: "Gunawangsa Tidar, Surabaya",
        budget: "Rp45–55 juta",
        phone: "0878-••••-5560",
        stage: 2,
        replies: [
            { text: "Boleh tanya, apakah warna kayunya bisa diganti lebih terang?" },
            { text: "Suami setuju, tinggal soal jadwal mulai." },
            { text: "Terima kasih ya." },
        ],
        fileReply: { text: "Sudah saya terima, terima kasih." },
        replyIndex: 0,
        messages: [
            text("in", "Kak, revisi desain yang saya minta kemarin sudah ada?", 340),
            text("out", "Sudah Bu Maya, versi 2 dengan tempat tidur lipat sudah kami kirim.", 330),
            file("out", "Desain_Studio_Maya_v2.pdf", "3,1 MB", "doc", 329),
            text("in", "Cantik! Saya diskusi dulu dengan suami, nanti kabari lagi ya.", 310),
        ],
    },
    {
        id: "klinik",
        name: "dr. Sinta Maharani",
        initials: "SM",
        tone: 2,
        role: "Renovasi ruang tunggu klinik",
        label: "Survei",
        online: false,
        seenAt: ago(2895),
        unread: 0,
        draft: "",
        location: "Sidoarjo Kota",
        budget: "Rp80–100 juta",
        phone: "0811-••••-4073",
        stage: 1,
        replies: [
            { text: "Kami buka sampai pukul 20.00, jadi survei sebaiknya sore." },
            { text: "Ruangnya sekitar 6×5 meter." },
            { text: "Baik, kami tunggu jadwalnya." },
        ],
        fileReply: { text: "Terima kasih, sudah masuk." },
        replyIndex: 0,
        messages: [
            text("in", "Kami ingin ruang tunggu klinik lebih lega, dikerjakan di luar jam praktik. Bisa?", 2950),
            text("out", "Bisa, dok. Pengerjaan malam atau hari Minggu kami atur supaya tidak mengganggu layanan.", 2940),
            text("in", "Baik, kapan bisa survei?", 2900),
        ],
    },
    {
        id: "rizal",
        name: "Rizal Pratama",
        initials: "RP",
        tone: 1,
        role: "Pertanyaan harga lemari",
        label: "Baru",
        online: false,
        seenAt: ago(3995),
        unread: 0,
        draft: "",
        location: "Gresik",
        phone: "0838-••••-6619",
        stage: 0,
        replies: [
            { text: "Oke, nanti saya kirim ukurannya." },
            { text: "Kira-kira 2,4 meter, apakah cukup untuk lemari 3 pintu?" },
        ],
        fileReply: { text: "Sudah terkirim ya, terima kasih." },
        replyIndex: 0,
        messages: [
            text("in", "Harga custom lemari per meter berapa ya?", 4020),
            text("out", "Mulai Rp1,8 juta per meter untuk lemari multiplek HPL, Pak. Untuk angka pasti kami perlu ukuran ruangnya.", 4010),
            text("in", "Oke noted, nanti saya ukur dulu.", 4000),
        ],
    },
];
