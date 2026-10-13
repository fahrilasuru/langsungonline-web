// Data & state demo. Semua di memori; tidak ada jaringan, tidak ada penyimpanan permanen.

/** @typedef {{id: string, label: string, icon?: string}} Opt */
/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} type
 * @property {string} label
 * @property {string} [help]
 * @property {boolean} [required]
 * @property {string} [placeholder]
 * @property {number} [maxLength]
 * @property {Opt[]} [options]
 * @property {string} [variant]
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {string} [prefix]
 * @property {string} [suffix]
 * @property {number} [stars]
 * @property {number} [maxSel]
 * @property {number} [maxFiles]
 * @property {string} [yesLabel]
 * @property {string} [noLabel]
 * @property {Opt[]} [rows]
 * @property {Opt[]} [cols]
 * @property {{q: string, eq: string}} [showIf]
 */

export const LIMITS = Object.freeze({
    questions: 40,
    sections: 6,
    options: 12,
    label: 120,
    help: 200,
    option: 60,
    sectionTitle: 60,
    formTitle: 80,
    formDesc: 240,
});

export function seedForm() {
    return {
        title: "Konsultasi proyek interior",
        description:
            "Isi formulir singkat ini. Tim RuangRapi menghubungi Anda dalam 1×24 jam kerja untuk menjadwalkan survei lokasi.",
        sections: [
            {
                id: "s_kontak",
                title: "Kontak",
                desc: "Agar tim kami bisa menghubungi Anda.",
                questions: [
                    { id: "q_name", type: "short", label: "Nama lengkap", required: true, maxLength: 60, placeholder: "Contoh: Dewi Kartika", autocomplete: "name" },
                    { id: "q_email", type: "email", label: "Email", required: true, placeholder: "nama@email.com" },
                    { id: "q_wa", type: "phone", label: "Nomor WhatsApp", help: "Kami menghubungi pada jam kerja, Senin sampai Sabtu.", required: true, placeholder: "0812 3456 7890" },
                    {
                        id: "q_city", type: "select", label: "Kota lokasi proyek", required: true,
                        options: [
                            { id: "o1", label: "Surabaya" }, { id: "o2", label: "Sidoarjo" }, { id: "o3", label: "Gresik" },
                            { id: "o4", label: "Malang" }, { id: "o5", label: "Kota lain di Jawa Timur" },
                        ],
                    },
                ],
            },
            {
                id: "s_proyek",
                title: "Proyek",
                desc: "Ceritakan ruang yang ingin Anda kerjakan.",
                questions: [
                    {
                        id: "q_type", type: "radio", variant: "cards", label: "Jenis properti", required: true,
                        options: [
                            { id: "o1", label: "Rumah tinggal", icon: "home" }, { id: "o2", label: "Apartemen", icon: "building" },
                            { id: "o3", label: "Kantor", icon: "briefcase" }, { id: "o4", label: "Kafe atau toko", icon: "coffee" },
                        ],
                    },
                    {
                        id: "q_rooms", type: "checkbox", variant: "chips", label: "Ruangan yang dikerjakan", help: "Pilih satu atau lebih.", required: true, maxSel: 6,
                        options: [
                            { id: "o1", label: "Ruang tamu" }, { id: "o2", label: "Dapur" }, { id: "o3", label: "Kamar tidur" },
                            { id: "o4", label: "Kamar mandi" }, { id: "o5", label: "Ruang kerja" }, { id: "o6", label: "Teras" },
                        ],
                    },
                    { id: "q_area", type: "number", label: "Perkiraan luas", required: true, min: 6, max: 2000, suffix: "m²", placeholder: "36" },
                    { id: "q_plan", type: "yesno", label: "Apakah Anda sudah punya denah?", required: true },
                    { id: "q_planfile", type: "file", label: "Unggah denah atau foto ruangan", help: "PDF, JPG, PNG, atau WebP. Maksimal 3 berkas, masing-masing 5 MB.", maxFiles: 3, showIf: { q: "q_plan", eq: "yes" } },
                    {
                        id: "q_style", type: "ranking", label: "Urutkan gaya yang paling Anda sukai", help: "Gunakan tombol panah. Gaya teratas adalah favorit Anda.",
                        options: [
                            { id: "o1", label: "Minimalis modern" }, { id: "o2", label: "Skandinavia" }, { id: "o3", label: "Industrial" },
                            { id: "o4", label: "Japandi" }, { id: "o5", label: "Klasik" },
                        ],
                    },
                ],
            },
            {
                id: "s_anggaran",
                title: "Anggaran",
                desc: "Supaya penawaran kami sesuai kebutuhan Anda.",
                questions: [
                    { id: "q_budget", type: "slider", label: "Perkiraan anggaran", help: "Geser sesuai kisaran Anda. Angka ini bisa kita diskusikan nanti.", required: true, min: 25, max: 1000, step: 25, prefix: "Rp ", suffix: " juta" },
                    { id: "q_start", type: "date", label: "Rencana mulai pengerjaan", help: "Boleh perkiraan.", minToday: true },
                    {
                        id: "q_urgent", type: "radio", label: "Seberapa mendesak proyek ini?", required: true,
                        options: [{ id: "o1", label: "Fleksibel, tidak terburu-buru" }, { id: "o2", label: "Dalam 1 sampai 2 bulan" }, { id: "o3", label: "Secepatnya" }],
                    },
                    { id: "q_survey", type: "yesno", label: "Bersedia dikunjungi tim survei?", help: "Survei lokasi gratis di Surabaya, Sidoarjo, dan Gresik.", required: true, yesLabel: "Bersedia", noLabel: "Belum" },
                ],
            },
            {
                id: "s_pengalaman",
                title: "Pengalaman",
                desc: "Bantu kami memperbaiki layanan. Cukup satu menit.",
                questions: [
                    { id: "q_rate", type: "rating", label: "Seberapa puas Anda dengan respons tim kami sejauh ini?", required: true, stars: 5 },
                    { id: "q_mood", type: "emoji", label: "Bagaimana kesan pertama Anda pada website kami?" },
                    {
                        id: "q_matrix", type: "matrix", label: "Nilai aspek berikut",
                        rows: [{ id: "r1", label: "Kejelasan informasi" }, { id: "r2", label: "Kecepatan balasan" }, { id: "r3", label: "Kemudahan menghubungi" }],
                        cols: [{ id: "c1", label: "Kurang" }, { id: "c2", label: "Cukup" }, { id: "c3", label: "Baik" }, { id: "c4", label: "Sangat baik" }],
                    },
                    { id: "q_nps", type: "nps", label: "Seberapa besar kemungkinan Anda merekomendasikan RuangRapi?", required: true },
                    { id: "q_note", type: "long", label: "Ada hal lain yang perlu kami tahu?", maxLength: 500, placeholder: "Contoh: ada hewan peliharaan, ruangan sempit, atau referensi gaya yang Anda suka." },
                ],
            },
        ],
    };
}

// ---------- State formulir ----------

let form = seedForm();
const formSubs = new Set();

export const getForm = () => form;
export const subscribeForm = (fn) => formSubs.add(fn);
/** Panggil setelah mengubah `form` secara langsung. */
export const touchForm = () => formSubs.forEach((fn) => fn(form));
export function replaceForm(next) {
    form = next;
    touchForm();
}
export const allQuestions = () => form.sections.flatMap((s) => s.questions);
export const findQuestion = (id) => allQuestions().find((q) => q.id === id) || null;

// ---------- Respons ----------

/**
 * @typedef {Object} Resp
 * @property {string} id
 * @property {Date} at
 * @property {string} name
 * @property {string} email
 * @property {string} wa
 * @property {string} city
 * @property {string} type
 * @property {number} budget  juta rupiah
 * @property {number} rating  1..5
 * @property {number} nps     0..10
 * @property {"Baru"|"Dibaca"|"Ditindaklanjuti"} status
 * @property {{q: string, a: string}[]} answers
 * @property {boolean} [fresh]
 */

export const STATUSES = Object.freeze(["Baru", "Dibaca", "Ditindaklanjuti"]);

/** @type {Resp[]} */
let responses = buildSeedResponses();
const respSubs = new Set();

export const getResponses = () => responses;
export const subscribeResponses = (fn) => respSubs.add(fn);
export const touchResponses = () => respSubs.forEach((fn) => fn(responses));
export function addResponse(r) {
    responses = [r, ...responses];
    touchResponses();
}

// PRNG deterministik supaya data contoh selalu sama.
function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function buildSeedResponses() {
    const rnd = mulberry32(20261012);
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const first = ["Dewi", "Budi", "Rina", "Agus", "Siti", "Hendra", "Maya", "Yoga", "Intan", "Fajar", "Lestari", "Rizky", "Anita", "Bayu", "Citra", "Dimas", "Eka", "Galih", "Hana", "Irfan", "Joko", "Kirana", "Lukman", "Mita", "Nanda", "Putri", "Rani", "Sandi", "Tari", "Wahyu", "Yuni", "Zahra"];
    const last = ["Kartika", "Santoso", "Wijaya", "Pratama", "Rahayu", "Hidayat", "Susanto", "Nugroho", "Setiawan", "Kurniawan", "Hartono", "Utami", "Firmansyah", "Permata", "Saputra", "Wibowo"];
    const cities = ["Surabaya", "Surabaya", "Surabaya", "Sidoarjo", "Sidoarjo", "Gresik", "Malang"];
    const types = ["Rumah tinggal", "Rumah tinggal", "Rumah tinggal", "Apartemen", "Apartemen", "Kantor", "Kafe atau toko"];
    const rooms = ["Ruang tamu", "Dapur", "Kamar tidur", "Kamar mandi", "Ruang kerja", "Teras"];
    const styles = ["Minimalis modern", "Skandinavia", "Industrial", "Japandi", "Klasik"];
    const urgent = ["Fleksibel, tidak terburu-buru", "Dalam 1 sampai 2 bulan", "Secepatnya"];
    const notes = ["", "", "Ada dua kucing di rumah, mohon material yang tahan cakar.", "Plafon rendah, ingin terasa lebih lega.", "Referensi gaya saya kirim lewat WhatsApp.", "", "Dapur sempit, butuh banyak penyimpanan."];
    const now = Date.now();
    const out = [];
    const used = new Set();
    for (let i = 0; i < 34; i++) {
        const fn = pick(first);
        const ln = pick(last);
        const hoursAgo = i < 4 ? 1 + i * 5 + rnd() * 3 : 24 + Math.pow(rnd(), 0.8) * 24 * 13;
        const at = new Date(now - hoursAgo * 3600 * 1000);
        const budget = Math.round((50 + rnd() * rnd() * 700) / 25) * 25;
        const rating = rnd() < 0.62 ? 5 : rnd() < 0.7 ? 4 : rnd() < 0.7 ? 3 : 2;
        const nps = rating === 5 ? 9 + Math.floor(rnd() * 2) : rating === 4 ? 7 + Math.floor(rnd() * 3) : 3 + Math.floor(rnd() * 5);
        const city = pick(cities);
        const type = pick(types);
        const picked = rooms.filter(() => rnd() < 0.4);
        if (!picked.length) picked.push(pick(rooms));
        let code = "";
        do code = "RR-" + Array.from({ length: 6 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(rnd() * 31)]).join("");
        while (used.has(code));
        used.add(code);
        const status = i < 4 ? "Baru" : i < 12 ? "Dibaca" : "Ditindaklanjuti";
        const note = pick(notes);
        const answers = [
            { q: "Kota lokasi proyek", a: city },
            { q: "Jenis properti", a: type },
            { q: "Ruangan yang dikerjakan", a: picked.join(", ") },
            { q: "Perkiraan luas", a: `${24 + Math.floor(rnd() * 12) * 6} m²` },
            { q: "Apakah Anda sudah punya denah?", a: rnd() < 0.5 ? "Ya" : "Tidak" },
            { q: "Gaya favorit", a: pick(styles) },
            { q: "Perkiraan anggaran", a: `Rp ${budget.toLocaleString("id-ID")} juta` },
            { q: "Seberapa mendesak proyek ini?", a: pick(urgent) },
            { q: "Kepuasan terhadap respons tim", a: `${rating} dari 5 bintang` },
            { q: "Kemungkinan merekomendasikan", a: `${nps} dari 10` },
        ];
        if (note) answers.push({ q: "Catatan tambahan", a: note });
        out.push({
            id: code,
            at,
            name: `${fn} ${ln}`,
            email: `${fn}.${ln}`.toLowerCase() + "@example.com",
            wa: "0812-5550-" + String(1000 + Math.floor(rnd() * 8999)),
            city,
            type,
            budget,
            rating,
            nps,
            status,
            answers,
        });
    }
    return out.sort((a, b) => b.at - a.at);
}
