// Fungsi render: menerima state, mengembalikan string HTML. Tidak menyentuh DOM.
// Semua teks dari pengguna WAJIB lewat esc().

import {
    CATEGORIES,
    ORDER_STATUS,
    ORDER_FLOW,
    LOW_STOCK,
    esc,
    rupiah,
    compactRp,
    num,
    relTime,
    fmtDate,
    fmtTime,
    dayGroup,
    initials,
    stockState,
} from "./_data.js";

export const CAT_COLOR = {
    Makanan: "#d9892b",
    Minuman: "#2f7fc1",
    Fashion: "#8a4fb0",
    Kecantikan: "#d2578a",
    Kerajinan: "#1b9a8a",
};

export const CAT_ICON = {
    Makanan: "bakery_dining",
    Minuman: "local_cafe",
    Fashion: "checkroom",
    Kecantikan: "spa",
    Kerajinan: "handyman",
};

const DAY = 24 * 60 * 60 * 1000;
const hueOf = (name) => [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 5;
const avatar = (name, cls = "") =>
    `<span class="avatar ${cls}" ${hueOf(name) ? `data-hue="${hueOf(name)}"` : ""}>${esc(initials(name))}</span>`;
const badge = (tone, label) => `<span class="badge b-${tone}">${esc(label)}</span>`;
const statusBadge = (s) => badge(ORDER_STATUS[s].tone === "ok" ? "ok" : ORDER_STATUS[s].tone, ORDER_STATUS[s].label);
const icon = (n) => `<span class="material-icons">${n}</span>`;
const pct = (n) => (n >= 0 ? "+" : "−") + Math.abs(n).toFixed(1).replace(".", ",") + "%";

const empty = (ic, title, text, action = "") =>
    `<div class="empty">${icon(ic)}<strong>${esc(title)}</strong><p>${esc(text)}</p>${action}</div>`;

/* ================= Selector / hitung ================= */
export const activeProducts = (S) => S.products.filter((p) => p.status === "aktif");
export const lowStock = (S) => activeProducts(S).filter((p) => p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock);
export const newOrders = (S) => S.orders.filter((o) => o.status === "baru");
export const byDate = (S) => [...S.orders].sort((a, b) => b.created - a.created);

export function periodData(S, period) {
    const s = S.series;
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    if (period === "7") {
        const v = s.daily.slice(-7);
        const prev = s.daily.slice(-14, -7);
        return { labels: s.dailyDow.slice(-7), values: v, total: sum(v), delta: ((sum(v) - sum(prev)) / sum(prev)) * 100, label: "7 hari", sub: "Total pendapatan per hari" };
    }
    if (period === "30") {
        const v = s.daily;
        const prev = s.monthlyRevenue[10];
        return { labels: s.dailyLabels, values: v, total: sum(v), delta: ((sum(v) - prev) / prev) * 100, label: "30 hari", sub: "Total pendapatan per hari" };
    }
    const v = s.monthlyRevenue.slice(-6);
    const prev = s.monthlyRevenue.slice(-12, -6);
    return { labels: s.monthlyLabels.slice(-6), values: v, total: sum(v), delta: ((sum(v) - sum(prev)) / sum(prev)) * 100, label: "6 bulan", sub: "Total pendapatan per bulan" };
}

export function reportData(S, months) {
    const s = S.series;
    const take = (a) => a.slice(-months);
    const prevTake = (a) => (months <= 6 ? a.slice(-months * 2, -months) : null);
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const rev = take(s.monthlyRevenue);
    const profit = take(s.monthlyProfit);
    const orders = take(s.monthlyOrders);
    const pr = prevTake(s.monthlyRevenue);
    const pp = prevTake(s.monthlyProfit);
    const po = prevTake(s.monthlyOrders);
    const d = (cur, prev) => (prev ? ((cur - sum(prev)) / sum(prev)) * 100 : null);
    return {
        labels: take(s.monthlyLabels),
        rev,
        profit,
        orders,
        totalRev: sum(rev),
        totalProfit: sum(profit),
        totalOrders: sum(orders),
        dRev: d(sum(rev), pr),
        dProfit: d(sum(profit), pp),
        dOrders: d(sum(orders), po),
        dAvg: pr ? (sum(rev) / sum(orders) / (sum(pr) / sum(po)) - 1) * 100 : null,
    };
}

export function categoryData(S) {
    const map = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    S.products.forEach((p) => (map[p.category] += p.sold * p.price));
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return CATEGORIES.map((c) => ({ name: c, value: map[c], share: (map[c] / total) * 100, color: CAT_COLOR[c] })).sort((a, b) => b.value - a.value);
}

/* ================= Filter ================= */
export function filterProducts(S, f) {
    const q = f.q.trim().toLowerCase();
    let list = S.products.filter((p) => {
        if (q && !(p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))) return false;
        if (f.cat !== "all" && p.category !== f.cat) return false;
        if (f.status !== "all" && stockState(p).key !== f.status) return false;
        return true;
    });
    const sorters = {
        terbaru: (a, b) => b.id - a.id,
        terlaris: (a, b) => b.sold - a.sold,
        "stok-asc": (a, b) => a.stock - b.stock,
        "harga-desc": (a, b) => b.price - a.price,
        "harga-asc": (a, b) => a.price - b.price,
        nama: (a, b) => a.name.localeCompare(b.name, "id"),
    };
    return list.sort(sorters[f.sort] || sorters.terbaru);
}

export function filterOrders(S, f) {
    const q = f.q.trim().toLowerCase();
    const now = Date.now();
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    let list = S.orders.filter((o) => {
        if (f.tab !== "semua" && o.status !== f.tab) return false;
        if (q && !(o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q))) return false;
        if (f.pay !== "all" && o.payment !== f.pay) return false;
        if (f.range === "1" && o.created < startToday.getTime()) return false;
        if (f.range === "7" && o.created < now - 7 * DAY) return false;
        if (f.range === "30" && o.created < now - 30 * DAY) return false;
        return true;
    });
    const sorters = {
        terbaru: (a, b) => b.created - a.created,
        terlama: (a, b) => a.created - b.created,
        "total-desc": (a, b) => b.total - a.total,
        "total-asc": (a, b) => a.total - b.total,
    };
    return list.sort(sorters[f.sort] || sorters.terbaru);
}

export function filterUsers(S, f) {
    const q = f.q.trim().toLowerCase();
    return S.users.filter((u) => {
        if (q && !(u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))) return false;
        if (f.role !== "all" && u.role !== f.role) return false;
        if (f.status !== "all" && u.status !== f.status) return false;
        return true;
    });
}

export function filterActivity(S, f) {
    const q = f.q.trim().toLowerCase();
    return [...S.activity]
        .sort((a, b) => b.ts - a.ts)
        .filter((a) => {
            if (f.type !== "all" && a.type !== f.type) return false;
            if (q && !a.text.replace(/<[^>]+>/g, "").toLowerCase().includes(q)) return false;
            return true;
        });
}

/* ================= Dashboard ================= */
export function statCards(S, ui) {
    const pd = periodData(S, ui.period);
    const low = lowStock(S).length;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const today = S.orders.filter((o) => o.created >= todayStart.getTime()).length;
    const weekCustomers = new Set(S.orders.filter((o) => o.created >= Date.now() - 7 * DAY).map((o) => o.customer)).size;
    const up = pd.delta >= 0;
    const card = (ic, tone, label, value, delta) =>
        `<div class="stat"><span class="stat-icon ${tone}">${icon(ic)}</span><div><p class="stat-label">${label}</p><p class="stat-value">${value}</p>${delta}</div></div>`;
    return [
        card("trending_up", "", `Pendapatan ${pd.label}`, compactRp(pd.total),
            `<p class="stat-delta ${up ? "up" : "down"}">${icon(up ? "arrow_upward" : "arrow_downward")}${pct(pd.delta)} dari periode lalu</p>`),
        card("shopping_bag", "blue", "Pesanan baru", num(newOrders(S).length),
            `<p class="stat-delta">${today} pesanan masuk hari ini</p>`),
        card("inventory_2", "warn", "Produk aktif", num(activeProducts(S).length),
            `<p class="stat-delta ${low ? "down" : "up"}">${icon(low ? "warning" : "check_circle")}${low ? low + " stok menipis" : "Stok aman"}</p>`),
        card("groups", "info", "Pelanggan", num(S.customerBase + S.customers.length),
            `<p class="stat-delta up">${icon("arrow_upward")}${weekCustomers} aktif minggu ini</p>`),
    ].join("");
}

export function dashOrders(S) {
    const list = byDate(S).slice(0, 5);
    return list
        .map(
            (o) => `<div class="row clickable" data-action="open-order" data-id="${o.id}" tabindex="0" role="button">
            ${avatar(o.customer)}
            <div class="row-main"><p class="row-title">${esc(o.customer)}</p><p class="row-sub">#${o.id} · ${relTime(o.created)}</p></div>
            <div class="row-end"><span>${rupiah(o.total)}</span>${statusBadge(o.status)}</div></div>`,
        )
        .join("");
}

export function dashLow(S) {
    const list = lowStock(S).slice(0, 5);
    if (!list.length) return empty("check_circle", "Semua stok aman", "Tidak ada produk yang perlu diisi ulang.");
    return list
        .map(
            (p) => `<div class="row">
            <span class="ptile" data-cat="${p.category}">${icon(p.icon)}</span>
            <div class="row-main"><p class="row-title">${esc(p.name)}</p><p class="row-sub">Sisa ${p.stock} · batas ${LOW_STOCK}</p></div>
            <div class="row-end">${badge(p.stock <= 0 ? "danger" : "warn", p.stock <= 0 ? "Habis" : "Menipis")}
            <button class="btn btn-soft btn-sm" data-action="stock" data-id="${p.id}">Isi stok</button></div></div>`,
        )
        .join("");
}

export function dashUsers(S) {
    return S.users
        .filter((u) => u.status === "aktif")
        .slice(0, 4)
        .map(
            (u) => `<div class="row">
            ${avatar(u.name)}
            <div class="row-main"><p class="row-title">${esc(u.name)}</p><p class="row-sub">${esc(u.email)}</p></div>
            <div class="row-end"><span>${esc(u.role)}</span></div></div>`,
        )
        .join("");
}

const feedItem = (a, isNew = false) =>
    `<div class="feed-item ${isNew ? "is-new" : ""}"><span class="feed-icon ${a.type}">${icon(a.icon)}</span>
    <div class="feed-text">${a.text}</div><span class="feed-time">${relTime(a.ts)}</span></div>`;

export function dashActivity(S) {
    return [...S.activity].sort((a, b) => b.ts - a.ts).slice(0, 5).map((a) => feedItem(a)).join("");
}

/* ================= Produk ================= */
export function productChips(S, f) {
    const defs = [["all", "Semua"], ["tersedia", "Tersedia"], ["menipis", "Menipis"], ["habis", "Habis"], ["arsip", "Diarsipkan"]];
    return defs
        .map(([k, label]) => {
            const n = k === "all" ? S.products.length : S.products.filter((p) => stockState(p).key === k).length;
            return `<button class="chip ${f.status === k ? "active" : ""}" role="tab" aria-selected="${f.status === k}" data-action="set" data-bind="products.status" data-value="${k}">${label}<span class="count">${n}</span></button>`;
        })
        .join("");
}

function productCard(p) {
    const st = stockState(p);
    const width = Math.min(100, Math.round((p.stock / 60) * 100));
    return `<article class="pcard ${p.status === "arsip" ? "is-archived" : ""}">
        <div class="pcard-top"><span class="ptile" data-cat="${p.category}">${icon(p.icon)}</span>
            <div><h3 class="pcard-name">${esc(p.name)}</h3><p class="pcard-sku">${esc(p.sku)} · ${esc(p.category)}</p></div></div>
        <div class="pcard-price">${rupiah(p.price)}</div>
        <div class="stock"><div class="stock-line"><span>Stok <strong>${num(p.stock)}</strong></span>${badge(st.tone, st.label)}</div>
            <div class="stock-bar ${st.tone === "danger" ? "danger" : st.tone === "warn" ? "warn" : ""}"><i style="width:${p.stock > 0 ? Math.max(width, 4) : 0}%"></i></div></div>
        <div class="pcard-foot"><span class="row-sub">${num(p.sold)} terjual</span>
            <div class="pcard-actions">
                <button class="btn-icon" data-action="stock" data-id="${p.id}" aria-label="Tambah stok ${esc(p.name)}" title="Tambah stok">${icon("add_box")}</button>
                <button class="btn-icon" data-action="edit-product" data-id="${p.id}" aria-label="Ubah ${esc(p.name)}" title="Ubah">${icon("edit")}</button>
                <button class="btn-icon" data-action="archive-product" data-id="${p.id}" aria-label="${p.status === "arsip" ? "Aktifkan" : "Arsipkan"} ${esc(p.name)}" title="${p.status === "arsip" ? "Aktifkan" : "Arsipkan"}">${icon(p.status === "arsip" ? "unarchive" : "archive")}</button>
                <button class="btn-icon danger" data-action="delete-product" data-id="${p.id}" aria-label="Hapus ${esc(p.name)}" title="Hapus">${icon("delete_outline")}</button>
            </div></div></article>`;
}

function productRow(p) {
    const st = stockState(p);
    return `<tr>
        <td><div class="cell-user"><span class="ptile" data-cat="${p.category}">${icon(p.icon)}</span><div><strong>${esc(p.name)}</strong><small>${esc(p.sku)}</small></div></div></td>
        <td>${esc(p.category)}</td><td class="num">${rupiah(p.price)}</td><td class="num">${num(p.stock)}</td><td>${badge(st.tone, st.label)}</td>
        <td class="actions">
            <button class="btn-icon" data-action="stock" data-id="${p.id}" aria-label="Tambah stok" title="Tambah stok">${icon("add_box")}</button>
            <button class="btn-icon" data-action="edit-product" data-id="${p.id}" aria-label="Ubah" title="Ubah">${icon("edit")}</button>
            <button class="btn-icon" data-action="archive-product" data-id="${p.id}" aria-label="Arsipkan atau aktifkan" title="${p.status === "arsip" ? "Aktifkan" : "Arsipkan"}">${icon(p.status === "arsip" ? "unarchive" : "archive")}</button>
            <button class="btn-icon danger" data-action="delete-product" data-id="${p.id}" aria-label="Hapus" title="Hapus">${icon("delete_outline")}</button>
        </td></tr>`;
}

export function productList(S, f) {
    const list = filterProducts(S, f);
    if (!list.length)
        return empty("search_off", "Produk tidak ditemukan", "Coba ubah kata kunci atau hapus filter yang aktif.",
            `<button class="btn btn-ghost btn-sm" data-action="clear-product-filters">Hapus filter</button>`);
    if (f.layout === "list")
        return `<div class="panel panel-flush"><div class="table-wrap"><table class="table table-cards tc-products"><thead><tr><th>Produk</th><th>Kategori</th><th class="num">Harga</th><th class="num">Stok</th><th>Status</th><th></th></tr></thead><tbody>${list.map(productRow).join("")}</tbody></table></div></div>`;
    return `<div class="product-grid">${list.map(productCard).join("")}</div>`;
}

/* ================= Pesanan ================= */
export function orderTabs(S, f) {
    const keys = ["semua", ...Object.keys(ORDER_STATUS)];
    return keys
        .map((k) => {
            const n = k === "semua" ? S.orders.length : S.orders.filter((o) => o.status === k).length;
            const label = k === "semua" ? "Semua" : ORDER_STATUS[k].label;
            return `<button class="tab ${f.tab === k ? "active" : ""}" role="tab" aria-selected="${f.tab === k}" data-action="set" data-bind="orders.tab" data-value="${k}">${label}<span class="count">${n}</span></button>`;
        })
        .join("");
}

export const ORDER_PAGE_SIZE = 8;

export function orderTable(S, f) {
    const list = filterOrders(S, f);
    if (!list.length)
        return empty("receipt_long", "Belum ada pesanan yang cocok", "Ubah filter atau buat pesanan baru.",
            `<button class="btn btn-primary btn-sm" data-action="new-order">${icon("add")}Buat pesanan</button>`);
    const pages = Math.ceil(list.length / ORDER_PAGE_SIZE);
    const page = Math.min(f.page, pages);
    const rows = list.slice((page - 1) * ORDER_PAGE_SIZE, page * ORDER_PAGE_SIZE);
    return `<div class="table-wrap"><table class="table table-cards tc-orders"><thead><tr><th>Invoice</th><th>Pelanggan</th><th>Pembayaran</th><th class="num">Total</th><th>Status</th><th></th></tr></thead><tbody>${rows
        .map(
            (o) => `<tr class="clickable" data-action="open-order" data-id="${o.id}">
            <td><strong>#${o.id}</strong><br><small class="row-sub">${fmtDate(o.created)} · ${fmtTime(o.created)}</small></td>
            <td><div class="cell-user">${avatar(o.customer)}<div><strong>${esc(o.customer)}</strong><small>${o.items.reduce((a, i) => a + i.qty, 0)} barang</small></div></div></td>
            <td>${esc(o.payment)}</td><td class="num"><strong>${rupiah(o.total)}</strong></td><td>${statusBadge(o.status)}</td>
            <td class="actions"><button class="btn-icon" data-action="open-order" data-id="${o.id}" aria-label="Lihat detail ${o.id}">${icon("chevron_right")}</button></td></tr>`,
        )
        .join("")}</tbody></table></div>`;
}

export function orderPager(S, f) {
    const list = filterOrders(S, f);
    if (list.length <= ORDER_PAGE_SIZE) return list.length ? `<span>Menampilkan ${list.length} pesanan</span>` : "";
    const pages = Math.ceil(list.length / ORDER_PAGE_SIZE);
    const page = Math.min(f.page, pages);
    const from = (page - 1) * ORDER_PAGE_SIZE + 1;
    const to = Math.min(list.length, page * ORDER_PAGE_SIZE);
    const btn = (p, label, extra = "") => `<button class="pager-btn ${p === page && !extra ? "active" : ""}" data-action="page" data-page="${p}" ${extra}>${label}</button>`;
    let nums = "";
    for (let i = 1; i <= pages; i++) nums += btn(i, i);
    return `<span>Menampilkan ${from}–${to} dari ${list.length} pesanan</span>
        <div class="pager-btns">${btn(page - 1, icon("chevron_left"), page === 1 ? "disabled aria-label=\"Sebelumnya\"" : "aria-label=\"Sebelumnya\"")}${nums}${btn(page + 1, icon("chevron_right"), page === pages ? "disabled aria-label=\"Berikutnya\"" : "aria-label=\"Berikutnya\"")}</div>`;
}

export function orderDrawer(o) {
    const next = { baru: "Terima & proses", diproses: "Tandai dikirim", dikirim: "Tandai selesai" }[o.status];
    const canCancel = o.status === "baru" || o.status === "diproses";
    const done = Object.fromEntries(o.history.map((h) => [h.status, h.ts]));
    let steps;
    if (o.status === "dibatalkan") {
        steps = o.history.map((h) => ({ k: h.status, ts: h.ts, cls: h.status === "dibatalkan" ? "cancel" : "done" }));
    } else {
        steps = ORDER_FLOW.map((k) => ({ k, ts: done[k], cls: done[k] ? "done" : "todo" }));
    }
    const stepLabel = { baru: "Pesanan dibuat", diproses: "Sedang diproses", dikirim: "Dikirim ke kurir", selesai: "Pesanan selesai", dibatalkan: "Pesanan dibatalkan" };
    return `<header class="drawer-head"><div><h2>#${o.id}</h2><p>${fmtDate(o.created, true)}</p><div style="margin-top:8px">${statusBadge(o.status)}</div></div>
        <button class="btn-icon" data-action="close-overlay" aria-label="Tutup" data-autofocus>${icon("close")}</button></header>
    <div class="drawer-body">
        <section class="d-section"><h3>Pelanggan</h3><dl class="kv">
            <dt>Nama</dt><dd>${esc(o.customer)}</dd><dt>WhatsApp</dt><dd>${esc(o.phone || "—")}</dd><dt>Alamat</dt><dd>${esc(o.address)}</dd></dl></section>
        <section class="d-section"><h3>Pembayaran & pengiriman</h3><dl class="kv">
            <dt>Pembayaran</dt><dd>${esc(o.payment)}</dd><dt>Kurir</dt><dd>${esc(o.courier)}</dd>${o.note ? `<dt>Catatan</dt><dd>${esc(o.note)}</dd>` : ""}</dl></section>
        <section class="d-section"><h3>Item pesanan</h3><div class="items">
            ${o.items.map((i) => `<div class="items-row"><div>${esc(i.name)}<small>${i.qty} × ${rupiah(i.price)}</small></div><b>${rupiah(i.qty * i.price)}</b></div>`).join("")}
            <div class="items-total"><span>Total</span><span>${rupiah(o.total)}</span></div></div></section>
        <section class="d-section"><h3>Riwayat status</h3><ol class="timeline">
            ${steps.map((s) => `<li class="${s.cls}"><span class="tl-dot"></span>${stepLabel[s.k]}<small>${s.ts ? fmtDate(s.ts, true) : "Menunggu"}</small></li>`).join("")}</ol></section>
    </div>
    <footer class="drawer-foot">
        ${next ? `<button class="btn btn-primary" data-action="order-next" data-id="${o.id}">${next}</button>` : ""}
        ${canCancel ? `<button class="btn btn-danger-ghost" data-action="order-cancel" data-id="${o.id}">Batalkan</button>` : ""}
        <button class="btn btn-ghost" data-action="print-invoice" data-id="${o.id}">${icon("print")}Cetak invoice</button>
    </footer>`;
}

export function orderRows(S, rows) {
    const opts = S.products.filter((p) => p.status === "aktif");
    return rows
        .map((r, i) => {
            const p = S.products.find((x) => x.id === Number(r.pid));
            return `<div class="order-row" data-row="${i}">
            <select class="select" data-row-field="pid" aria-label="Produk item ${i + 1}">
                <option value="">Pilih produk</option>
                ${opts.map((o) => `<option value="${o.id}" ${Number(r.pid) === o.id ? "selected" : ""} ${o.stock <= 0 ? "disabled" : ""}>${esc(o.name)} — ${rupiah(o.price)} (stok ${o.stock})</option>`).join("")}
            </select>
            <input class="input" type="number" min="1" value="${r.qty}" data-row-field="qty" aria-label="Jumlah item ${i + 1}" inputmode="numeric" />
            <span class="sub" data-row-sub>${p ? rupiah(p.price * (Number(r.qty) || 0)) : "—"}</span>
            <button type="button" class="btn-icon danger" data-action="remove-order-row" data-index="${i}" aria-label="Hapus item ${i + 1}" ${rows.length === 1 ? "disabled" : ""}>${icon("close")}</button></div>`;
        })
        .join("");
}

/* ================= Pengguna ================= */
export function userTable(S, f) {
    const list = filterUsers(S, f);
    if (!list.length) return empty("person_search", "Pengguna tidak ditemukan", "Coba kata kunci atau filter lain.");
    return `<div class="table-wrap"><table class="table table-cards tc-users"><thead><tr><th>Pengguna</th><th>Role</th><th>Login terakhir</th><th>Status</th><th></th></tr></thead><tbody>${list
        .map((u) => {
            const root = u.role === "Super Admin";
            return `<tr><td><div class="cell-user">${avatar(u.name)}<div><strong>${esc(u.name)}</strong><small>${esc(u.email)}</small></div></div></td>
            <td>${esc(u.role)}</td><td class="muted-cell">${u.lastLogin ? relTime(u.lastLogin) : "Belum pernah masuk"}</td>
            <td><label class="switch" title="${root ? "Super Admin selalu aktif" : u.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}"><input type="checkbox" data-change="toggle-user" data-id="${u.id}" ${u.status === "aktif" ? "checked" : ""} ${root ? "disabled" : ""} aria-label="Status aktif ${esc(u.name)}" /><i></i></label></td>
            <td class="actions"><button class="btn-icon" data-action="edit-user" data-id="${u.id}" aria-label="Ubah ${esc(u.name)}" title="Ubah">${icon("edit")}</button>
            <button class="btn-icon danger" data-action="delete-user" data-id="${u.id}" aria-label="Hapus ${esc(u.name)}" title="Hapus">${icon("delete_outline")}</button></td></tr>`;
        })
        .join("")}</tbody></table></div>`;
}

/* ================= Laporan ================= */
export function reportKpis(S, months) {
    const r = reportData(S, months);
    const delta = (v, label = "dari periode sebelumnya") =>
        v == null
            ? `<p class="stat-delta">Data ${months} bulan penuh</p>`
            : `<p class="stat-delta ${v >= 0 ? "up" : "down"}">${icon(v >= 0 ? "arrow_upward" : "arrow_downward")}${pct(v)} ${label}</p>`;
    const card = (ic, tone, label, value, d) =>
        `<div class="stat"><span class="stat-icon ${tone}">${icon(ic)}</span><div><p class="stat-label">${label}</p><p class="stat-value">${value}</p>${d}</div></div>`;
    return [
        card("payments", "", "Total pendapatan", compactRp(r.totalRev), delta(r.dRev)),
        card("savings", "blue", "Laba bersih", compactRp(r.totalProfit), `<p class="stat-delta">Margin ${((r.totalProfit / r.totalRev) * 100).toFixed(1).replace(".", ",")}%</p>`),
        card("receipt_long", "warn", "Jumlah pesanan", num(r.totalOrders), delta(r.dOrders)),
        card("shopping_basket", "info", "Rata-rata per pesanan", rupiah(r.totalRev / r.totalOrders), delta(r.dAvg)),
    ].join("");
}

export function categoryLegend(S) {
    return categoryData(S)
        .map((c) => `<div class="legend-item"><span class="dot" style="background:${c.color}"></span>${c.name}<b>${c.share.toFixed(0)}%</b></div>`)
        .join("");
}

export function topProducts(S) {
    const list = [...S.products].map((p) => ({ ...p, rev: p.sold * p.price })).sort((a, b) => b.rev - a.rev).slice(0, 6);
    const max = list[0].rev;
    return `<div class="table-wrap"><table class="table table-cards tc-top"><thead><tr><th>Produk</th><th class="num">Terjual</th><th class="num">Pendapatan</th><th>Kontribusi</th></tr></thead><tbody>${list
        .map(
            (p) => `<tr><td><div class="cell-user"><span class="ptile" data-cat="${p.category}">${icon(p.icon)}</span><div><strong>${esc(p.name)}</strong><small>${esc(p.category)}</small></div></div></td>
            <td class="num" data-label="Terjual">${num(p.sold)}</td><td class="num"><strong>${rupiah(p.rev)}</strong></td>
            <td><div class="bar-cell"><div class="stock-bar"><i style="width:${Math.round((p.rev / max) * 100)}%"></i></div></div></td></tr>`,
        )
        .join("")}</tbody></table></div>`;
}

/* ================= Aktivitas ================= */
export function activityChips(S, f) {
    const defs = [["all", "Semua"], ["pesanan", "Pesanan"], ["produk", "Produk"], ["pengguna", "Pengguna"], ["sistem", "Sistem"]];
    return defs
        .map(([k, label]) => {
            const n = k === "all" ? S.activity.length : S.activity.filter((a) => a.type === k).length;
            return `<button class="chip ${f.type === k ? "active" : ""}" role="tab" aria-selected="${f.type === k}" data-action="set" data-bind="activity.type" data-value="${k}">${label}<span class="count">${n}</span></button>`;
        })
        .join("");
}

export function activityFeed(S, f, newId = null) {
    const all = filterActivity(S, f);
    if (!all.length) return empty("history", "Belum ada aktivitas", "Aktivitas yang cocok dengan filter akan muncul di sini.");
    const list = all.slice(0, f.limit);
    let html = "";
    let group = "";
    list.forEach((a) => {
        const g = dayGroup(a.ts);
        if (g !== group) {
            group = g;
            html += `<p class="feed-day">${esc(g)}</p>`;
        }
        html += feedItem(a, a.id === newId);
    });
    return html;
}

/* ================= Notifikasi & pencarian ================= */
export function notifList(S) {
    if (!S.notifications.length) return `<p class="notif-empty">Belum ada notifikasi.</p>`;
    return [...S.notifications]
        .sort((a, b) => b.ts - a.ts)
        .map(
            (n) => `<button class="notif-item ${n.read ? "" : "unread"}" data-action="open-notif" data-id="${n.id}">
            <span class="feed-icon ${n.icon === "warning" ? "produk" : ""}">${icon(n.icon)}</span>
            <span><p>${n.text}</p><small>${relTime(n.ts)}</small></span></button>`,
        )
        .join("");
}

export function searchResults(S, q) {
    q = q.trim().toLowerCase();
    if (!q) return { html: "", count: 0 };
    const prods = S.products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 4);
    const ords = S.orders.filter((o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)).sort((a, b) => b.created - a.created).slice(0, 4);
    const users = S.users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 3);
    const count = prods.length + ords.length + users.length;
    if (!count) return { html: `<p class="sr-empty">Tidak ada hasil untuk “${esc(q)}”.</p>`, count: 0 };
    let html = "";
    if (prods.length)
        html += `<p class="sr-group">Produk</p>` + prods.map((p) => `<button class="sr-item" data-action="goto-result" data-kind="product" data-id="${p.id}">${icon(p.icon)}<span>${esc(p.name)}<small>${esc(p.sku)} · stok ${p.stock}</small></span></button>`).join("");
    if (ords.length)
        html += `<p class="sr-group">Pesanan</p>` + ords.map((o) => `<button class="sr-item" data-action="goto-result" data-kind="order" data-id="${o.id}">${icon("receipt_long")}<span>#${o.id} · ${esc(o.customer)}<small>${rupiah(o.total)} · ${ORDER_STATUS[o.status].label}</small></span></button>`).join("");
    if (users.length)
        html += `<p class="sr-group">Pengguna</p>` + users.map((u) => `<button class="sr-item" data-action="goto-result" data-kind="user" data-id="${u.id}">${icon("person")}<span>${esc(u.name)}<small>${esc(u.role)}</small></span></button>`).join("");
    return { html, count };
}
