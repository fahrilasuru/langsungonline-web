// Data contoh & fungsi bantu untuk demo Admin UMKM Kita.
// Semua data hanya hidup di memori browser (tidak ada server): refresh = kembali ke awal.

export const CATEGORIES = ["Makanan", "Minuman", "Fashion", "Kecantikan", "Kerajinan"];

export const ORDER_STATUS = {
    baru: { label: "Baru", tone: "blue" },
    diproses: { label: "Diproses", tone: "warn" },
    dikirim: { label: "Dikirim", tone: "info" },
    selesai: { label: "Selesai", tone: "ok" },
    dibatalkan: { label: "Dibatalkan", tone: "danger" },
};

export const ORDER_FLOW = ["baru", "diproses", "dikirim", "selesai"];
export const ROLES = ["Super Admin", "Admin", "Staff Gudang", "Kasir", "Marketing"];
export const PAYMENTS = ["Transfer BCA", "QRIS", "GoPay", "COD"];
export const COURIERS = ["JNE Reguler", "J&T Express", "SiCepat", "Kurir Toko"];
export const LOW_STOCK = 12;

const MIN = 60 * 1000;
export const ago = (minutes) => Date.now() - minutes * MIN;

/* ---------- Format ---------- */
const nf = new Intl.NumberFormat("id-ID");
export const rupiah = (n) => "Rp " + nf.format(Math.round(n));
export const num = (n) => nf.format(n);

export function compactRp(n) {
    const abs = Math.abs(n);
    if (abs >= 1e9) return "Rp " + (n / 1e9).toFixed(1).replace(".", ",") + " M";
    if (abs >= 1e6) return "Rp " + (n / 1e6).toFixed(1).replace(".", ",") + " jt";
    if (abs >= 1e3) return "Rp " + Math.round(n / 1e3) + " rb";
    return "Rp " + Math.round(n);
}

export function relTime(ts) {
    const m = Math.max(0, Math.round((Date.now() - ts) / MIN));
    if (m < 1) return "Baru saja";
    if (m < 60) return m + " mnt lalu";
    const h = Math.round(m / 60);
    if (h < 24) return h + " jam lalu";
    const d = Math.round(h / 24);
    if (d < 7) return d + " hari lalu";
    return fmtDate(ts);
}

export function fmtDate(ts, withTime = false) {
    const o = { day: "numeric", month: "short", year: "numeric" };
    if (withTime) {
        o.hour = "2-digit";
        o.minute = "2-digit";
    }
    return new Date(ts).toLocaleString("id-ID", o).replace(/\./g, ":").replace(/(\d{2}):(\d{2})$/, "$1.$2");
}

export function fmtTime(ts) {
    return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(":", ".");
}

export function dayGroup(ts) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const day = 24 * 60 * MIN;
    if (ts >= start.getTime()) return "Hari ini";
    if (ts >= start.getTime() - day) return "Kemarin";
    return new Date(ts).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

export const todayLabel = () =>
    new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const initials = (name) =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

export const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const stockState = (p) => {
    if (p.status === "arsip") return { key: "arsip", label: "Diarsipkan", tone: "muted" };
    if (p.stock <= 0) return { key: "habis", label: "Habis", tone: "danger" };
    if (p.stock <= LOW_STOCK) return { key: "menipis", label: "Menipis", tone: "warn" };
    return { key: "tersedia", label: "Tersedia", tone: "ok" };
};

/* ---------- Deret waktu ---------- */
const scaleTo = (arr, target) => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.map((v) => Math.round((v * target) / sum / 1000) * 1000);
};

const DAILY_RAW = [
    0.31, 0.42, 0.38, 0.29, 0.47, 0.55, 0.44, 0.36, 0.41, 0.49, 0.37, 0.52, 0.61, 0.46, 0.33, 0.4, 0.45, 0.39, 0.5, 0.58,
    0.43, 0.35, 0.41, 0.47, 0.44, 0.53, 0.62, 0.48, 0.37, 0.45,
];

const MONTHLY_REVENUE = [6.1, 6.7, 7.2, 6.9, 8.4, 9.1, 9.8, 10.6, 9.9, 11.4, 10.25, 12.85].map((v) => v * 1e6);
const COST_RATIO = [0.44, 0.43, 0.45, 0.44, 0.42, 0.43, 0.41, 0.42, 0.43, 0.41, 0.42, 0.42];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function buildSeries() {
    const now = new Date();
    const daily = scaleTo(DAILY_RAW, 12850000);
    const dailyLabels = daily.map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (daily.length - 1 - i));
        return d.getDate() + " " + MONTHS[d.getMonth()];
    });
    const dailyDow = daily.map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (daily.length - 1 - i));
        return DAYS[d.getDay()];
    });
    const monthlyLabels = MONTHLY_REVENUE.map((_, i) => MONTHS[(now.getMonth() - (11 - i) + 120) % 12]);
    return {
        daily,
        dailyLabels,
        dailyDow,
        monthlyLabels,
        monthlyRevenue: [...MONTHLY_REVENUE],
        monthlyProfit: MONTHLY_REVENUE.map((v, i) => Math.round(v * (1 - COST_RATIO[i]))),
        monthlyOrders: MONTHLY_REVENUE.map((v) => Math.round(v / 285000)),
    };
}

/* ---------- Seed utama ---------- */
export function createSeed() {
    const P = (id, name, sku, category, price, stock, sold, icon, status = "aktif") => ({
        id, name, sku, category, price, stock, sold, icon, status, desc: "",
    });

    const products = [
        P(1, "Kopi Arabika Gayo 200 gr", "KPI-001", "Minuman", 45000, 24, 182, "local_cafe"),
        P(2, "Teh Melati Premium 100 gr", "TEH-002", "Minuman", 28000, 56, 134, "emoji_food_beverage"),
        P(3, "Keripik Pisang Madu", "SNK-003", "Makanan", 12500, 112, 320, "bakery_dining"),
        P(4, "Sambal Roa Botol", "SMB-004", "Makanan", 32000, 9, 98, "local_fire_department"),
        P(5, "Batik Pria Lengan Panjang", "BTK-005", "Fashion", 185000, 7, 41, "checkroom"),
        P(6, "Batik Tulis Dress Wanita", "BTK-006", "Fashion", 245000, 15, 29, "dry_cleaning"),
        P(7, "Sabun Herbal Sereh", "SBN-007", "Kecantikan", 22000, 12, 205, "spa"),
        P(8, "Lulur Kopi Alami", "LLR-008", "Kecantikan", 38000, 0, 77, "face"),
        P(9, "Tas Anyaman Pandan", "TAS-009", "Kerajinan", 95000, 18, 52, "shopping_bag"),
        P(10, "Gantungan Kunci Kayu", "GKC-010", "Kerajinan", 8000, 240, 410, "key"),
        P(11, "Madu Hutan Murni 250 ml", "MDU-011", "Makanan", 78000, 31, 88, "water_drop"),
        P(12, "Kain Tenun Ikat", "NTK-012", "Fashion", 320000, 5, 14, "texture"),
        P(13, "Dodol Garut Original", "DDL-013", "Makanan", 25000, 64, 121, "cake"),
        P(14, "Minyak Kelapa Murni 250 ml", "MKM-014", "Kecantikan", 42000, 28, 63, "opacity"),
        P(15, "Kopi Robusta Lampung 250 gr", "KPI-015", "Minuman", 38000, 41, 96, "coffee"),
        P(16, "Jahe Merah Instan", "JHM-016", "Minuman", 18000, 77, 150, "local_drink"),
        P(17, "Rendang Kering Kemasan", "RDG-017", "Makanan", 65000, 22, 74, "lunch_dining"),
        P(18, "Tikar Anyaman Mini", "TKR-018", "Kerajinan", 54000, 11, 33, "grid_view"),
        P(19, "Selendang Songket", "SLD-019", "Fashion", 275000, 8, 19, "auto_awesome"),
        P(20, "Lilin Aromaterapi", "LLN-020", "Kecantikan", 48000, 36, 58, "local_florist", "arsip"),
    ];

    const C = (name, phone, address) => ({ name, phone, address });
    const customers = [
        C("Budi Santoso", "0812-3456-7801", "Jl. Darmo Permai III No. 12, Surabaya"),
        C("Dewi Lestari", "0813-2211-9045", "Perum Taman Pinang Blok C-7, Sidoarjo"),
        C("Agus Setiawan", "0857-6120-3388", "Jl. Veteran No. 45, Gresik"),
        C("Ratna Sari", "0821-4410-7762", "Jl. Ijen Raya No. 8, Malang"),
        C("Hendra Wijaya", "0878-9012-5543", "Jl. Mayjen Sungkono No. 101, Surabaya"),
        C("Putri Ayu", "0852-3307-1129", "Jl. Raya Rungkut Asri 5, Surabaya"),
        C("Yoga Prakoso", "0896-1145-6620", "Jl. Gajah Mada No. 27, Mojokerto"),
        C("Lina Marlina", "0813-7741-0092", "Jl. Setiabudi No. 66, Bandung"),
        C("Fajar Nugroho", "0819-5520-3317", "Jl. Kaliurang Km 5, Yogyakarta"),
        C("Citra Dewanti", "0812-9087-4465", "Jl. Fatmawati No. 19, Jakarta Selatan"),
        C("Rizky Ramadhan", "0877-3321-8054", "Jl. Margonda Raya No. 140, Depok"),
        C("Nadia Rahma", "0821-6638-2901", "Jl. Pandanaran No. 33, Semarang"),
        C("Tono Hartanto", "0856-4429-7716", "Jl. Slamet Riyadi No. 90, Solo"),
        C("Maria Goreti", "0831-2208-6647", "Jl. Sunset Road No. 12, Denpasar"),
    ];
    const customerOf = (n) => customers.find((c) => c.name === n);

    // [pelanggan, [[produk, jumlah]], status, menit lalu, pembayaran, kurir]
    const specs = [
        ["Budi Santoso", [[1, 2], [3, 1]], "baru", 2, "QRIS", "JNE Reguler"],
        ["Dewi Lestari", [[5, 1], [7, 2]], "baru", 15, "Transfer BCA", "J&T Express"],
        ["Agus Setiawan", [[10, 10], [3, 3]], "baru", 38, "COD", "Kurir Toko"],
        ["Ratna Sari", [[2, 3]], "baru", 64, "GoPay", "SiCepat"],
        ["Hendra Wijaya", [[11, 1], [1, 1]], "baru", 95, "Transfer BCA", "JNE Reguler"],
        ["Putri Ayu", [[9, 1]], "baru", 180, "QRIS", "Kurir Toko"],
        ["Yoga Prakoso", [[6, 1]], "diproses", 260, "Transfer BCA", "J&T Express"],
        ["Lina Marlina", [[4, 2], [13, 2]], "diproses", 420, "QRIS", "SiCepat"],
        ["Fajar Nugroho", [[12, 1]], "diproses", 700, "Transfer BCA", "JNE Reguler"],
        ["Citra Dewanti", [[7, 3], [8, 1]], "diproses", 1100, "GoPay", "J&T Express"],
        ["Rizky Ramadhan", [[1, 1], [2, 1], [3, 2]], "diproses", 1500, "COD", "SiCepat"],
        ["Nadia Rahma", [[5, 2]], "dikirim", 1900, "Transfer BCA", "JNE Reguler"],
        ["Tono Hartanto", [[9, 2], [10, 5]], "dikirim", 2600, "QRIS", "J&T Express"],
        ["Maria Goreti", [[11, 2]], "dikirim", 3200, "Transfer BCA", "SiCepat"],
        ["Budi Santoso", [[3, 6]], "dikirim", 4000, "COD", "Kurir Toko"],
        ["Dewi Lestari", [[6, 1], [7, 1]], "dikirim", 5000, "GoPay", "JNE Reguler"],
        ["Agus Setiawan", [[1, 3]], "selesai", 6500, "QRIS", "J&T Express"],
        ["Ratna Sari", [[12, 1], [5, 1]], "selesai", 8000, "Transfer BCA", "SiCepat"],
        ["Hendra Wijaya", [[2, 2], [13, 3]], "selesai", 10000, "QRIS", "JNE Reguler"],
        ["Putri Ayu", [[7, 4]], "selesai", 13000, "COD", "Kurir Toko"],
        ["Yoga Prakoso", [[10, 20]], "selesai", 17000, "Transfer BCA", "J&T Express"],
        ["Lina Marlina", [[11, 1], [3, 2]], "selesai", 21000, "GoPay", "SiCepat"],
        ["Fajar Nugroho", [[9, 1], [6, 1]], "selesai", 26000, "QRIS", "JNE Reguler"],
        ["Citra Dewanti", [[8, 2]], "selesai", 32000, "Transfer BCA", "J&T Express"],
        ["Rizky Ramadhan", [[4, 1]], "dibatalkan", 36000, "COD", "SiCepat"],
        ["Nadia Rahma", [[5, 1]], "dibatalkan", 41000, "Transfer BCA", "JNE Reguler"],
    ];

    const orders = specs.map(([name, items, status, minutes, payment, courier], i) => {
        const created = ago(minutes);
        const lines = items.map(([pid, qty]) => {
            const p = products.find((x) => x.id === pid);
            return { pid, name: p.name, price: p.price, qty };
        });
        const flow = status === "dibatalkan" ? ["baru", "dibatalkan"] : ORDER_FLOW.slice(0, ORDER_FLOW.indexOf(status) + 1);
        const history = flow.map((s, k) => ({ status: s, ts: Math.min(Date.now(), created + k * 95 * MIN) }));
        const c = customerOf(name);
        return {
            id: "INV-" + (1049 - i),
            customer: name,
            phone: c.phone,
            address: c.address,
            items: lines,
            total: lines.reduce((a, l) => a + l.price * l.qty, 0),
            status,
            payment,
            courier,
            note: i === 0 ? "Tolong dikemas rapi, untuk hadiah." : "",
            created,
            history,
        };
    });

    const U = (id, name, email, role, status, lastLogin) => ({ id, name, email, role, status, lastLogin });
    const users = [
        U(1, "Admin Utama", "admin@umkmkita.id", "Super Admin", "aktif", ago(4)),
        U(2, "Rina Wulandari", "rina@umkmkita.id", "Admin", "aktif", ago(55)),
        U(3, "Dimas Pratama", "dimas@umkmkita.id", "Staff Gudang", "aktif", ago(190)),
        U(4, "Sari Kusuma", "sari@umkmkita.id", "Kasir", "aktif", ago(1500)),
        U(5, "Maya Anggraini", "maya@umkmkita.id", "Marketing", "aktif", ago(3300)),
        U(6, "Bagus Hartono", "bagus@umkmkita.id", "Staff Gudang", "nonaktif", ago(21000)),
    ];

    const A = (type, text, minutes, icon) => ({ id: 0, type, text, ts: ago(minutes), icon });
    const activity = [
        A("pesanan", "Pesanan baru <strong>#INV-1049</strong> dari Budi Santoso", 2, "shopping_cart"),
        A("pengguna", "<strong>Rina Wulandari</strong> masuk ke dashboard", 55, "login"),
        A("pesanan", "Pesanan <strong>#INV-1042</strong> diubah menjadi Diproses", 260, "sync_alt"),
        A("produk", "Stok <strong>Sambal Roa Botol</strong> berkurang menjadi 9", 300, "inventory_2"),
        A("pesanan", "Pesanan <strong>#INV-1037</strong> dikirim via JNE Reguler", 1900, "local_shipping"),
        A("produk", "<strong>Dimas Pratama</strong> menambah stok Kopi Arabika Gayo (+24)", 2200, "add_box"),
        A("pengguna", "Pengguna baru <strong>Maya Anggraini</strong> ditambahkan", 3300, "person_add"),
        A("sistem", "Cadangan data harian selesai", 4300, "cloud_done"),
        A("pesanan", "Pesanan <strong>#INV-1033</strong> selesai", 6500, "task_alt"),
        A("produk", "Harga <strong>Batik Pria Lengan Panjang</strong> diubah ke Rp 185.000", 8200, "sell"),
        A("pesanan", "Pesanan <strong>#INV-1024</strong> dibatalkan pelanggan", 36000, "cancel"),
        A("pengguna", "<strong>Bagus Hartono</strong> dinonaktifkan", 41000, "person_off"),
        A("sistem", "Pengaturan toko diperbarui oleh Admin Utama", 52000, "settings"),
        A("produk", "Produk <strong>Lilin Aromaterapi</strong> diarsipkan", 60000, "archive"),
        A("pesanan", "Pesanan <strong>#INV-1019</strong> selesai", 66000, "task_alt"),
        A("sistem", "Cadangan data harian selesai", 70000, "cloud_done"),
    ].map((a, i) => ({ ...a, id: i + 1 }));

    const notifications = [
        { id: 1, icon: "shopping_cart", text: "Pesanan baru <strong>#INV-1049</strong> dari Budi Santoso", ts: ago(2), read: false, view: "pesanan", ref: "INV-1049" },
        { id: 2, icon: "shopping_cart", text: "Pesanan baru <strong>#INV-1048</strong> dari Dewi Lestari", ts: ago(15), read: false, view: "pesanan", ref: "INV-1048" },
        { id: 3, icon: "warning", text: "Stok <strong>Lulur Kopi Alami</strong> habis", ts: ago(120), read: false, view: "produk", ref: "habis" },
        { id: 4, icon: "star", text: "Ulasan 5 bintang untuk <strong>Kopi Arabika Gayo</strong>", ts: ago(600), read: true, view: "produk", ref: "" },
    ];

    return {
        products,
        customers,
        orders,
        users,
        activity,
        notifications,
        series: buildSeries(),
        customerBase: 1010,
        seq: { product: 21, user: 7, activity: 100, notif: 10, order: 1050 },
        settings: {
            storeName: "UMKM Kita Shop",
            email: "info@umkmkita.id",
            phone: "0812-3456-7890",
            address: "Jl. Raya Darmo No. 88, Surabaya",
            hours: "Senin–Sabtu, 08.00–17.00",
            notif: { order: true, stock: true, daily: false, review: true },
            twoFactor: false,
            density: "nyaman",
        },
        profile: { name: "Admin Utama", email: "admin@umkmkita.id", phone: "0812-3456-7890", role: "Super Admin" },
    };
}
