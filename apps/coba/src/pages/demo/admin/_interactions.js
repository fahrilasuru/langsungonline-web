// Logika interaksi demo Admin UMKM Kita.
// Semua data hidup di memori (tanpa server). Aksi memakai satu pendengar klik berbasis atribut `data-action`.

import Chart from "chart.js/auto";
import { createSeed, esc, rupiah, todayLabel, initials, LOW_STOCK, ORDER_FLOW, ORDER_STATUS, stockState, fmtDate } from "./_data.js";
import * as R from "./_render.js";
import {
    toast,
    openOverlay,
    closeOverlay,
    topOverlay,
    confirmDialog,
    resolveConfirm,
    isConfirmOpen,
    closeDropdowns,
    toggleDropdown,
    downloadCsv,
} from "./_ui.js";

const root = document.querySelector(".body");

const VIEWS = {
    dashboard: "Dashboard",
    pesanan: "Pesanan",
    produk: "Produk",
    laporan: "Laporan",
    pengguna: "Pengguna",
    aktivitas: "Log aktivitas",
    pengaturan: "Pengaturan",
};

const defaultUi = () => ({
    view: "dashboard",
    period: "7",
    products: { q: "", cat: "all", status: "all", sort: "terbaru", layout: "grid" },
    orders: { tab: "semua", q: "", pay: "all", range: "all", sort: "terbaru", page: 1 },
    users: { q: "", role: "all", status: "all" },
    activity: { type: "all", q: "", limit: 10 },
    report: { months: 6 },
    editingProduct: null,
    editingUser: null,
    stockId: null,
    drawerId: null,
    orderRows: [{ pid: "", qty: 1 }],
    theme: "light",
});

let S = createSeed();
let ui = defaultUi();
let charts = {};

const $ = (sel, el = root) => el.querySelector(sel);
const $$ = (sel, el = root) => [...el.querySelectorAll(sel)];
const fe = (form, name) => form.elements.namedItem(name);
const val = (form, name) => fe(form, name)?.value ?? "";
const stripHtml = (s) => s.replace(/<[^>]+>/g, "");

/* =====================================================================
   Boot
   ===================================================================== */
function boot() {
    try {
        const saved = localStorage.getItem("umkm-demo-theme");
        if (saved === "dark" || saved === "light") ui.theme = saved;
    } catch {}

    Chart.defaults.font.family = '"Plus Jakarta Sans", sans-serif';
    Chart.defaults.font.size = 12;
    applyTheme(ui.theme, false);
    fillSettings();
    syncTexts();
    syncBindInputs();
    renderAll();

    const hash = location.hash.slice(1);
    go(VIEWS[hash] ? hash : "dashboard", false);

    bindEvents();
    scheduleSimulation();
    setInterval(renderLive, 60000);
}

/* =====================================================================
   Pembantu umum
   ===================================================================== */
const cssVar = (n) => getComputedStyle(root).getPropertyValue(n).trim();

function log(type, text, icon) {
    const entry = { id: S.seq.activity++, type, text, ts: Date.now(), icon };
    S.activity.unshift(entry);
    return entry;
}

function notify(kind, icon, text, view, ref = "") {
    if (kind && S.settings.notif[kind] === false) return;
    S.notifications.unshift({ id: S.seq.notif++, icon, text, ts: Date.now(), read: false, view, ref });
}

function bumpRevenue(total, sign) {
    const s = S.series;
    s.daily[s.daily.length - 1] += sign * total;
    s.monthlyRevenue[11] += sign * total;
    s.monthlyProfit[11] += sign * Math.round(total * 0.58);
    s.monthlyOrders[11] += sign;
}

function syncTexts() {
    $$("[data-text=storeName]").forEach((e) => (e.textContent = S.settings.storeName));
    $$("[data-text=profileName]").forEach((e) => (e.textContent = S.profile.name));
    $$("[data-text=profileInitials]").forEach((e) => (e.textContent = initials(S.profile.name)));
}

function setErrors(form, errs) {
    $$(".field", form).forEach((f) => f.classList.remove("invalid"));
    $$("[data-error]", form).forEach((p) => (p.textContent = ""));
    Object.entries(errs).forEach(([k, msg]) => {
        const p = $(`[data-error="${k}"]`, form);
        if (!p) return;
        p.textContent = msg;
        p.closest(".field")?.classList.add("invalid");
    });
    const first = $(".field.invalid .input, .field.invalid .select, .field.invalid .textarea", form);
    first?.focus();
    return Object.keys(errs).length === 0;
}

/* =====================================================================
   Render
   ===================================================================== */
function renderBadges() {
    const n = R.newOrders(S).length;
    const low = R.lowStock(S).length;
    const set = (key, v) => {
        const el = $(`[data-badge="${key}"]`);
        if (!el) return;
        el.textContent = v;
        el.hidden = !v;
    };
    set("orders", n);
    set("stock", low);
    const unread = S.notifications.filter((x) => !x.read).length;
    const dot = $("#bellDot");
    dot.textContent = unread > 9 ? "9+" : unread;
    dot.hidden = !unread;
}

function renderDashboard() {
    $("#statGrid").innerHTML = R.statCards(S, ui);
    $("#dashOrders").innerHTML = R.dashOrders(S);
    $("#dashLow").innerHTML = R.dashLow(S);
    $("#dashUsers").innerHTML = R.dashUsers(S);
    $("#dashActivity").innerHTML = R.dashActivity(S);
}

function renderProducts() {
    const f = ui.products;
    $("#productChips").innerHTML = R.productChips(S, f);
    $("#productList").innerHTML = R.productList(S, f);
    const shown = R.filterProducts(S, f).length;
    $("#productSub").textContent =
        `${S.products.length} produk · ${R.activeProducts(S).length} aktif · ${R.lowStock(S).length} perlu isi stok` +
        (shown !== S.products.length ? ` · menampilkan ${shown}` : "");
}

function renderOrders() {
    const f = ui.orders;
    const pages = Math.max(1, Math.ceil(R.filterOrders(S, f).length / R.ORDER_PAGE_SIZE));
    f.page = Math.min(f.page, pages);
    $("#orderTabs").innerHTML = R.orderTabs(S, f);
    $("#orderTable").innerHTML = R.orderTable(S, f);
    $("#orderPager").innerHTML = R.orderPager(S, f);
    $("#orderSub").textContent = `${S.orders.length} pesanan · ${R.newOrders(S).length} menunggu diproses`;
}

function renderUsers() {
    $("#userTable").innerHTML = R.userTable(S, ui.users);
    $("#userSub").textContent = `${S.users.length} pengguna · ${S.users.filter((u) => u.status === "aktif").length} aktif`;
}

function renderReports() {
    $("#reportKpis").innerHTML = R.reportKpis(S, ui.report.months);
    $("#categoryLegend").innerHTML = R.categoryLegend(S);
    $("#topProducts").innerHTML = R.topProducts(S);
    $("#reportSub").textContent = `Ringkasan ${ui.report.months} bulan terakhir`;
    renderMonthlyChart();
    renderCategoryChart();
}

function renderActivity(newId = null) {
    $("#activityChips").innerHTML = R.activityChips(S, ui.activity);
    $("#activityFeed").innerHTML = R.activityFeed(S, ui.activity, newId);
    const total = R.filterActivity(S, ui.activity).length;
    $("#moreLogBtn").hidden = total <= ui.activity.limit;
    $("#activitySub").textContent = `${total} aktivitas tercatat`;
}

function renderNotifs() {
    $("#notifList").innerHTML = R.notifList(S);
    renderBadges();
}

function renderDrawer() {
    const o = S.orders.find((x) => x.id === ui.drawerId);
    if (!o) return;
    $("#drawerContent").innerHTML = R.orderDrawer(o);
}

function renderAll() {
    renderBadges();
    renderDashboard();
    renderProducts();
    renderOrders();
    renderUsers();
    renderReports();
    renderActivity();
    renderNotifs();
    if (ui.drawerId && !$("#orderDrawer").hidden) renderDrawer();
}

/** Render ulang setelah data berubah (termasuk grafik yang sedang tampil). */
function refreshData(newLogId = null) {
    renderAll();
    if (newLogId) renderActivity(newLogId);
    renderSalesChart();
}

function renderLive() {
    renderDashboard();
    renderNotifs();
    renderActivity();
    renderUsers();
}

/* =====================================================================
   Grafik
   ===================================================================== */
const compactTick = (v) =>
    v >= 1e6 ? (v / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt" : v >= 1e3 ? Math.round(v / 1e3) + " rb" : v;

function baseOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: cssVar("--ink"),
                titleColor: cssVar("--surface"),
                bodyColor: cssVar("--surface"),
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                callbacks: { label: (c) => rupiah(c.parsed.y ?? c.parsed) },
            },
        },
        scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: cssVar("--muted"), maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
            y: { beginAtZero: true, border: { display: false }, grid: { color: cssVar("--border") }, ticks: { color: cssVar("--muted"), callback: compactTick, maxTicksLimit: 6 } },
        },
    };
}

function renderSalesChart() {
    const pd = R.periodData(S, ui.period);
    $("#salesSub").textContent = pd.sub;
    const canvas = $("#salesChart");
    if (!canvas || !canvas.offsetParent) return;
    if (charts.sales) {
        charts.sales.data.labels = pd.labels;
        charts.sales.data.datasets[0].data = pd.values;
        charts.sales.update();
        return;
    }
    charts.sales = new Chart(canvas, {
        type: "line",
        data: {
            labels: pd.labels,
            datasets: [
                {
                    data: pd.values,
                    borderColor: cssVar("--primary"),
                    borderWidth: 2.5,
                    tension: 0.38,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: cssVar("--primary"),
                    backgroundColor: (c) => {
                        const { ctx, chartArea } = c.chart;
                        if (!chartArea) return "transparent";
                        const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        g.addColorStop(0, cssVar("--tint"));
                        g.addColorStop(1, "transparent");
                        return g;
                    },
                },
            ],
        },
        options: baseOptions(),
    });
}

function renderMonthlyChart() {
    const canvas = $("#monthlyChart");
    if (!canvas || !canvas.offsetParent) return;
    const r = R.reportData(S, ui.report.months);
    if (charts.monthly) {
        charts.monthly.data.labels = r.labels;
        charts.monthly.data.datasets[0].data = r.rev;
        charts.monthly.data.datasets[1].data = r.profit;
        charts.monthly.update();
        return;
    }
    const opts = baseOptions();
    opts.plugins.legend = { display: true, position: "bottom", labels: { usePointStyle: true, boxWidth: 8, color: cssVar("--muted") } };
    opts.plugins.tooltip.displayColors = true;
    opts.plugins.tooltip.callbacks.label = (c) => `${c.dataset.label}: ${rupiah(c.parsed.y)}`;
    charts.monthly = new Chart(canvas, {
        type: "bar",
        data: {
            labels: r.labels,
            datasets: [
                { label: "Pendapatan", data: r.rev, backgroundColor: cssVar("--primary"), borderRadius: 6, maxBarThickness: 28 },
                { label: "Laba", data: r.profit, backgroundColor: cssVar("--side-accent"), borderRadius: 6, maxBarThickness: 28 },
            ],
        },
        options: opts,
    });
}

function renderCategoryChart() {
    const canvas = $("#categoryChart");
    if (!canvas || !canvas.offsetParent) return;
    const data = R.categoryData(S);
    if (charts.category) {
        charts.category.data.labels = data.map((d) => d.name);
        charts.category.data.datasets[0].data = data.map((d) => d.value);
        charts.category.data.datasets[0].backgroundColor = data.map((d) => d.color);
        charts.category.update();
        return;
    }
    charts.category = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: data.map((d) => d.name),
            datasets: [{ data: data.map((d) => d.value), backgroundColor: data.map((d) => d.color), borderColor: cssVar("--surface"), borderWidth: 3 }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (c) => `${c.label}: ${rupiah(c.parsed)}` } },
            },
        },
    });
}

function ensureCharts() {
    if (ui.view === "dashboard") renderSalesChart();
    if (ui.view === "laporan") {
        renderMonthlyChart();
        renderCategoryChart();
    }
    Object.values(charts).forEach((c) => c.resize());
}

function rebuildCharts() {
    Object.values(charts).forEach((c) => c.destroy());
    charts = {};
    ensureCharts();
}

/* =====================================================================
   Navigasi
   ===================================================================== */
function go(view, scroll = true) {
    if (!VIEWS[view]) view = "dashboard";
    ui.view = view;
    $$(".view").forEach((v) => {
        const on = v.dataset.view === view;
        v.classList.toggle("active", on);
        v.hidden = !on;
    });
    $$(".nav-item[data-view]").forEach((n) => {
        const on = n.dataset.view === view;
        n.classList.toggle("active", on);
        if (on) n.setAttribute("aria-current", "page");
        else n.removeAttribute("aria-current");
    });
    $("#pageTitle").textContent = VIEWS[view];
    $("#pageSub").textContent = `${S.settings.storeName} · ${todayLabel()}`;
    closeSidebar();
    closeDropdowns();
    if (scroll) {
        try {
            history.replaceState(null, "", "#" + view);
        } catch {}
        window.scrollTo({ top: 0 });
    }
    ensureCharts();
}

function openSidebar() {
    $("#sidebar").classList.add("open");
    $(".scrim").classList.add("show");
}

function closeSidebar() {
    $("#sidebar")?.classList.remove("open");
    $(".scrim")?.classList.remove("show");
}

/* =====================================================================
   Binding filter
   ===================================================================== */
function applyBind(path, raw) {
    const [a, b] = path.split(".");
    const v = path === "report.months" ? Number(raw) : raw;
    if (b === undefined) ui[a] = v;
    else ui[a][b] = v;
    if (a === "orders" && b !== "page") ui.orders.page = 1;
    if (a === "activity" && b !== "limit") ui.activity.limit = 10;

    if (a === "products") renderProducts();
    else if (a === "orders") renderOrders();
    else if (a === "users") renderUsers();
    else if (a === "activity") renderActivity();
    else if (a === "report") renderReports();
    else if (a === "period") {
        renderDashboard();
        renderSalesChart();
    }
    syncBindButtons(path);
}

function syncBindButtons(path) {
    const [a, b] = path.split(".");
    const cur = b === undefined ? ui[a] : ui[a][b];
    $$(`button[data-bind="${path}"]`).forEach((btn) => btn.classList.toggle("active", btn.dataset.value === String(cur)));
}

function syncBindInputs() {
    $$("[data-bind]").forEach((el) => {
        const [a, b] = el.dataset.bind.split(".");
        const cur = b === undefined ? ui[a] : ui[a][b];
        if (el.matches("input, select")) el.value = cur;
        else el.classList.toggle("active", el.dataset.value === String(cur));
    });
}

/* =====================================================================
   Produk
   ===================================================================== */
function openProductModal(id = null) {
    const f = $("#productForm");
    f.reset();
    setErrors(f, {});
    ui.editingProduct = id;
    const p = id ? S.products.find((x) => x.id === id) : null;
    $("#productModalTitle").textContent = p ? "Ubah produk" : "Tambah produk";
    $("#productSubmit").textContent = p ? "Simpan perubahan" : "Simpan produk";
    if (p) {
        fe(f, "name").value = p.name;
        fe(f, "sku").value = p.sku;
        fe(f, "category").value = p.category;
        fe(f, "price").value = p.price;
        fe(f, "stock").value = p.stock;
        fe(f, "status").value = p.status;
        fe(f, "desc").value = p.desc || "";
    }
    openOverlay("productModal");
}

function submitProduct(f) {
    const name = val(f, "name").trim();
    const sku = val(f, "sku").trim().toUpperCase();
    const category = val(f, "category");
    const price = Number(val(f, "price"));
    const stockRaw = val(f, "stock");
    const stock = Number(stockRaw);
    const status = val(f, "status");
    const desc = val(f, "desc").trim();
    const editing = ui.editingProduct;
    const errs = {};

    if (name.length < 3) errs.name = "Nama produk minimal 3 karakter.";
    else if (S.products.some((p) => p.id !== editing && p.name.toLowerCase() === name.toLowerCase())) errs.name = "Nama produk ini sudah ada.";
    if (sku && S.products.some((p) => p.id !== editing && p.sku === sku)) errs.sku = "SKU sudah dipakai produk lain.";
    if (!val(f, "price") || !(price > 0)) errs.price = "Isi harga lebih dari 0.";
    if (stockRaw === "" || !Number.isInteger(stock) || stock < 0) errs.stock = "Isi stok dengan angka bulat 0 atau lebih.";
    if (!setErrors(f, errs)) return;

    let entryId;
    if (editing) {
        const p = S.products.find((x) => x.id === editing);
        const priceChanged = p.price !== price;
        const wasOk = p.stock > LOW_STOCK;
        Object.assign(p, { name, sku: sku || p.sku, category, price, stock, status, desc, icon: p.category === category ? p.icon : R.CAT_ICON[category] });
        entryId = log("produk", priceChanged ? `Harga <strong>${esc(name)}</strong> diubah ke ${rupiah(price)}` : `Produk <strong>${esc(name)}</strong> diperbarui`, priceChanged ? "sell" : "edit").id;
        if (wasOk && stock <= LOW_STOCK && status === "aktif") notify("stock", "warning", `Stok <strong>${esc(name)}</strong> tinggal ${stock}`, "produk", "menipis");
        toast(`Produk “${name}” diperbarui`);
    } else {
        const id = S.seq.product++;
        const code = sku || `${name.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X")}-${String(id).padStart(3, "0")}`;
        S.products.push({ id, name, sku: code, category, price, stock, sold: 0, icon: R.CAT_ICON[category], status, desc });
        entryId = log("produk", `Produk baru <strong>${esc(name)}</strong> ditambahkan`, "add_box").id;
        // tampilkan produk baru: bersihkan filter yang menyembunyikannya
        Object.assign(ui.products, { q: "", cat: "all", status: "all", sort: "terbaru" });
        syncBindInputs();
        toast(`Produk “${name}” ditambahkan`);
    }
    closeOverlay("productModal");
    refreshData(entryId);
}

function openStockModal(id) {
    const p = S.products.find((x) => x.id === id);
    if (!p) return;
    ui.stockId = id;
    const f = $("#stockForm");
    f.reset();
    setErrors(f, {});
    $("#stockProduct").innerHTML = `${esc(p.name)}<small>Stok saat ini ${p.stock} · ${esc(p.sku)}</small>`;
    fe(f, "qty").value = Math.max(10, LOW_STOCK * 2 - p.stock);
    updateStockPreview();
    openOverlay("stockModal");
}

function updateStockPreview() {
    const p = S.products.find((x) => x.id === ui.stockId);
    const q = Number(fe($("#stockForm"), "qty").value) || 0;
    $("#stockPreview").innerHTML = p && q > 0 ? `Stok menjadi <strong>${p.stock + q}</strong>` : "";
}

function submitStock(f) {
    const q = Number(val(f, "qty"));
    if (!setErrors(f, !Number.isInteger(q) || q < 1 ? { qty: "Isi jumlah dengan angka bulat 1 atau lebih." } : {})) return;
    const p = S.products.find((x) => x.id === ui.stockId);
    p.stock += q;
    const entry = log("produk", `<strong>${esc(S.profile.name)}</strong> menambah stok ${esc(p.name)} (+${q})`, "add_box");
    closeOverlay("stockModal");
    toast(`Stok ${p.name} bertambah ${q} menjadi ${p.stock}`);
    refreshData(entry.id);
}

async function deleteProduct(id) {
    const p = S.products.find((x) => x.id === id);
    if (!p) return;
    const ok = await confirmDialog({ title: "Hapus produk?", message: `“${p.name}” akan dihapus dari daftar produk. Riwayat pesanan tidak ikut terhapus.`, confirmLabel: "Hapus produk", danger: true });
    if (!ok) return;
    S.products = S.products.filter((x) => x.id !== id);
    const entry = log("produk", `Produk <strong>${esc(p.name)}</strong> dihapus`, "delete_outline");
    toast(`Produk “${p.name}” dihapus`, "info");
    refreshData(entry.id);
}

function toggleArchive(id) {
    const p = S.products.find((x) => x.id === id);
    if (!p) return;
    p.status = p.status === "arsip" ? "aktif" : "arsip";
    const entry = log("produk", `Produk <strong>${esc(p.name)}</strong> ${p.status === "arsip" ? "diarsipkan" : "diaktifkan kembali"}`, p.status === "arsip" ? "archive" : "unarchive");
    toast(p.status === "arsip" ? `“${p.name}” diarsipkan` : `“${p.name}” aktif kembali`, "info");
    refreshData(entry.id);
}

/* =====================================================================
   Pesanan
   ===================================================================== */
function openOrderModal() {
    const f = $("#orderForm");
    f.reset();
    setErrors(f, {});
    $("#customerList").innerHTML = S.customers.map((c) => `<option value="${esc(c.name)}"></option>`).join("");
    ui.orderRows = [{ pid: "", qty: 1 }];
    renderOrderRows();
    openOverlay("orderModal");
}

function renderOrderRows() {
    $("#orderItems").innerHTML = R.orderRows(S, ui.orderRows);
    updateOrderTotal();
}

function updateOrderTotal() {
    const total = ui.orderRows.reduce((sum, r) => {
        const p = S.products.find((x) => x.id === Number(r.pid));
        return sum + (p ? p.price * (Number(r.qty) || 0) : 0);
    }, 0);
    $("#orderTotal").textContent = rupiah(total);
}

function onOrderRowChange(el) {
    const row = el.closest(".order-row");
    const i = Number(row.dataset.row);
    ui.orderRows[i][el.dataset.rowField] = el.value;
    const r = ui.orderRows[i];
    const p = S.products.find((x) => x.id === Number(r.pid));
    $("[data-row-sub]", row).textContent = p ? rupiah(p.price * (Number(r.qty) || 0)) : "—";
    updateOrderTotal();
}

function createOrder({ customer, phone, address, payment, courier, note, lines }) {
    const items = lines.map(({ pid, qty }) => {
        const p = S.products.find((x) => x.id === pid);
        p.stock -= qty;
        p.sold += qty;
        return { pid, name: p.name, price: p.price, qty };
    });
    const total = items.reduce((a, i) => a + i.price * i.qty, 0);
    const now = Date.now();
    const order = {
        id: "INV-" + S.seq.order++,
        customer, phone, address, items, total, payment, courier, note,
        status: "baru",
        created: now,
        history: [{ status: "baru", ts: now }],
    };
    S.orders.unshift(order);
    if (!S.customers.some((c) => c.name.toLowerCase() === customer.toLowerCase())) S.customers.push({ name: customer, phone, address });
    bumpRevenue(total, 1);
    const entry = log("pesanan", `Pesanan baru <strong>#${order.id}</strong> dari ${esc(customer)}`, "shopping_cart");
    notify("order", "shopping_cart", `Pesanan baru <strong>#${order.id}</strong> dari ${esc(customer)}`, "pesanan", order.id);
    items.forEach((i) => {
        const p = S.products.find((x) => x.id === i.pid);
        if (p.stock <= LOW_STOCK && p.stock + i.qty > LOW_STOCK) notify("stock", "warning", `Stok <strong>${esc(p.name)}</strong> tinggal ${p.stock}`, "produk", "menipis");
    });
    return { order, entry };
}

function submitOrder(f) {
    const customer = val(f, "customer").trim();
    const address = val(f, "address").trim();
    const errs = {};
    if (customer.length < 2) errs.customer = "Isi nama pelanggan.";
    if (address.length < 5) errs.address = "Isi alamat pengiriman.";

    const picked = ui.orderRows.filter((r) => r.pid);
    const merged = new Map();
    let badQty = false;
    picked.forEach((r) => {
        const q = Number(r.qty);
        if (!Number.isInteger(q) || q < 1) badQty = true;
        merged.set(Number(r.pid), (merged.get(Number(r.pid)) || 0) + q);
    });
    if (!picked.length) errs.items = "Tambahkan minimal satu produk.";
    else if (badQty) errs.items = "Jumlah tiap item harus angka bulat 1 atau lebih.";
    else {
        for (const [pid, q] of merged) {
            const p = S.products.find((x) => x.id === pid);
            if (q > p.stock) {
                errs.items = `Stok ${p.name} hanya tersisa ${p.stock}.`;
                break;
            }
        }
    }
    if (!setErrors(f, errs)) return;

    const { order, entry } = createOrder({
        customer, address,
        phone: val(f, "phone").trim(),
        payment: val(f, "payment"),
        courier: val(f, "courier"),
        note: val(f, "note").trim(),
        lines: [...merged].map(([pid, qty]) => ({ pid, qty })),
    });
    closeOverlay("orderModal");
    toast(`Pesanan #${order.id} dibuat untuk ${customer}`);
    ui.orders.page = 1;
    refreshData(entry.id);
    if (ui.view === "pesanan") setTimeout(() => openOrder(order.id), 220);
}

function openOrder(id) {
    if (!S.orders.some((o) => o.id === id)) return;
    ui.drawerId = id;
    renderDrawer();
    openOverlay("orderDrawer");
}

function advanceOrder(id) {
    const o = S.orders.find((x) => x.id === id);
    if (!o) return;
    const next = ORDER_FLOW[ORDER_FLOW.indexOf(o.status) + 1];
    if (!next) return;
    o.status = next;
    o.history.push({ status: next, ts: Date.now() });
    const verbs = { diproses: "diubah menjadi Diproses", dikirim: `dikirim via ${esc(o.courier)}`, selesai: "selesai" };
    const icons = { diproses: "sync_alt", dikirim: "local_shipping", selesai: "task_alt" };
    const entry = log("pesanan", `Pesanan <strong>#${o.id}</strong> ${verbs[next]}`, icons[next]);
    toast(`Pesanan #${o.id} ${next === "selesai" ? "selesai" : next === "dikirim" ? "ditandai dikirim" : "sedang diproses"}`);
    refreshData(entry.id);
    renderDrawer();
    $("#drawerContent [data-autofocus]")?.focus();
}

async function cancelOrder(id) {
    const o = S.orders.find((x) => x.id === id);
    if (!o) return;
    const ok = await confirmDialog({ title: `Batalkan pesanan #${o.id}?`, message: `Stok barang akan dikembalikan dan pesanan ${o.customer} tidak bisa diproses lagi.`, confirmLabel: "Batalkan pesanan", danger: true });
    if (!ok) return;
    o.status = "dibatalkan";
    o.history.push({ status: "dibatalkan", ts: Date.now() });
    o.items.forEach((i) => {
        const p = S.products.find((x) => x.id === i.pid);
        if (p) {
            p.stock += i.qty;
            p.sold = Math.max(0, p.sold - i.qty);
        }
    });
    bumpRevenue(o.total, -1);
    const entry = log("pesanan", `Pesanan <strong>#${o.id}</strong> dibatalkan`, "cancel");
    toast(`Pesanan #${o.id} dibatalkan`, "info");
    refreshData(entry.id);
    renderDrawer();
}

/* ---- Simulasi pesanan masuk (agar dashboard terasa hidup) ---- */
const INCOMING = [
    { customer: "Anisa Putri", phone: "0813-5521-7788", address: "Jl. Raya Gubeng No. 21, Surabaya", payment: "QRIS", courier: "JNE Reguler", lines: [{ pid: 1, qty: 1 }, { pid: 3, qty: 2 }] },
    { customer: "Kevin Halim", phone: "0857-1180-4421", address: "Jl. Tunjungan No. 5, Surabaya", payment: "GoPay", courier: "J&T Express", lines: [{ pid: 11, qty: 1 }] },
    { customer: "Wulan Sari", phone: "0822-6099-1735", address: "Jl. Pemuda No. 14, Malang", payment: "Transfer BCA", courier: "SiCepat", lines: [{ pid: 9, qty: 1 }, { pid: 10, qty: 4 }] },
];
let simIndex = 0;

function scheduleSimulation() {
    if (simIndex >= INCOMING.length) return;
    setTimeout(() => {
        if (topOverlay() || isConfirmOpen() || document.hidden) return scheduleSimulation();
        const d = INCOMING[simIndex++];
        const ok = d.lines.every((l) => (S.products.find((p) => p.id === l.pid)?.stock || 0) >= l.qty);
        if (ok) {
            const { order, entry } = createOrder({ ...d, note: "" });
            toast(`Pesanan baru #${order.id} dari ${d.customer}`, "info");
            refreshData(entry.id);
        }
        scheduleSimulation();
    }, simIndex === 0 ? 30000 : 75000);
}

/* =====================================================================
   Pengguna
   ===================================================================== */
const ROLE_OPTIONS = ["Admin", "Staff Gudang", "Kasir", "Marketing"];

function openUserModal(id = null) {
    const f = $("#userForm");
    f.reset();
    setErrors(f, {});
    ui.editingUser = id;
    const u = id ? S.users.find((x) => x.id === id) : null;
    const roleSel = fe(f, "role");
    const isRoot = u?.role === "Super Admin";
    roleSel.innerHTML = (isRoot ? ["Super Admin"] : ROLE_OPTIONS).map((r) => `<option>${r}</option>`).join("");
    roleSel.disabled = isRoot;
    $("#userModalTitle").textContent = u ? "Ubah pengguna" : "Tambah pengguna";
    $("#userSubmit").textContent = u ? "Simpan perubahan" : "Kirim undangan";
    $("#userHint").hidden = !!u;
    if (u) {
        fe(f, "name").value = u.name;
        fe(f, "email").value = u.email;
        roleSel.value = u.role;
    } else roleSel.value = "Staff Gudang";
    openOverlay("userModal");
}

function submitUser(f) {
    const name = val(f, "name").trim();
    const email = val(f, "email").trim().toLowerCase();
    const role = val(f, "role");
    const editing = ui.editingUser;
    const errs = {};
    if (name.length < 3) errs.name = "Nama minimal 3 karakter.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = "Format email belum benar. Contoh: nama@umkmkita.id";
    else if (S.users.some((u) => u.id !== editing && u.email === email)) errs.email = "Email ini sudah terdaftar.";
    if (!setErrors(f, errs)) return;

    let entry;
    if (editing) {
        const u = S.users.find((x) => x.id === editing);
        Object.assign(u, { name, email, role: u.role === "Super Admin" ? u.role : role });
        if (u.id === 1) {
            S.profile.name = name;
            syncTexts();
        }
        entry = log("pengguna", `Data pengguna <strong>${esc(name)}</strong> diperbarui`, "manage_accounts");
        toast(`Data ${name} diperbarui`);
    } else {
        S.users.push({ id: S.seq.user++, name, email, role, status: "aktif", lastLogin: null });
        entry = log("pengguna", `Pengguna baru <strong>${esc(name)}</strong> ditambahkan sebagai ${esc(role)}`, "person_add");
        toast(`Undangan dikirim ke ${email}`);
    }
    closeOverlay("userModal");
    refreshData(entry.id);
}

function toggleUser(id, checked) {
    const u = S.users.find((x) => x.id === id);
    if (!u) return;
    u.status = checked ? "aktif" : "nonaktif";
    const entry = log("pengguna", `<strong>${esc(u.name)}</strong> ${checked ? "diaktifkan kembali" : "dinonaktifkan"}`, checked ? "how_to_reg" : "person_off");
    toast(`${u.name} ${checked ? "diaktifkan" : "dinonaktifkan"}`, checked ? "ok" : "info");
    refreshData(entry.id);
}

async function deleteUser(id) {
    const u = S.users.find((x) => x.id === id);
    if (!u) return;
    if (u.role === "Super Admin") return toast("Akun Super Admin tidak bisa dihapus.", "error");
    const ok = await confirmDialog({ title: "Hapus pengguna?", message: `${u.name} tidak akan bisa masuk lagi ke dashboard ini.`, confirmLabel: "Hapus pengguna", danger: true });
    if (!ok) return;
    S.users = S.users.filter((x) => x.id !== id);
    const entry = log("pengguna", `Pengguna <strong>${esc(u.name)}</strong> dihapus`, "person_remove");
    toast(`${u.name} dihapus`, "info");
    refreshData(entry.id);
}

/* =====================================================================
   Profil & pengaturan
   ===================================================================== */
function openProfile() {
    const f = $("#profileForm");
    setErrors(f, {});
    fe(f, "name").value = S.profile.name;
    fe(f, "email").value = S.profile.email;
    fe(f, "phone").value = S.profile.phone;
    closeDropdowns();
    openOverlay("profileModal");
}

function submitProfile(f) {
    const name = val(f, "name").trim();
    if (!setErrors(f, name.length < 3 ? { name: "Nama minimal 3 karakter." } : {})) return;
    S.profile.name = name;
    S.profile.phone = val(f, "phone").trim();
    S.users[0].name = name;
    syncTexts();
    closeOverlay("profileModal");
    toast("Profil diperbarui");
    renderUsers();
    renderDashboard();
}

function applyTheme(theme, persist = true) {
    ui.theme = theme;
    root.dataset.theme = theme;
    $$('input[name="theme"]').forEach((r) => (r.checked = r.value === theme));
    if (persist) {
        try {
            localStorage.setItem("umkm-demo-theme", theme);
        } catch {}
        rebuildCharts();
    }
}

function applyDensity(d) {
    S.settings.density = d;
    root.dataset.density = d;
    $$('input[name="density"]').forEach((r) => (r.checked = r.value === d));
}

function fillSettings() {
    const st = S.settings;
    ["storeName", "email", "phone", "address", "hours"].forEach((n) => {
        const el = $(`.settings-panel [name="${n}"]`);
        if (el) el.value = st[n];
    });
    $$('.settings-panel input[type="checkbox"][name^="notif."]').forEach((c) => (c.checked = !!st.notif[c.name.slice(6)]));
    const tf = $('.settings-panel [name="twoFactor"]');
    if (tf) tf.checked = st.twoFactor;
    $$('input[name="theme"]').forEach((r) => (r.checked = r.value === ui.theme));
    $$('input[name="density"]').forEach((r) => (r.checked = r.value === st.density));
    $$(".settings-panel").forEach(clearDirty);
}

function markDirty(panel) {
    $("[data-dirty]", panel)?.removeAttribute("hidden");
    $$("[data-save-only]", panel).forEach((b) => (b.disabled = false));
}

function clearDirty(panel) {
    $("[data-dirty]", panel)?.setAttribute("hidden", "");
    $$("[data-save-only]", panel).forEach((b) => (b.disabled = true));
}

function showSettingsTab(tab) {
    $$(".settings-link").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    $$(".settings-panel").forEach((p) => {
        const on = p.dataset.panel === tab;
        p.classList.toggle("active", on);
        p.hidden = !on;
    });
}

function submitSettings(panel) {
    const name = panel.dataset.panel;
    if (name === "toko") {
        const g = (n) => fe(panel, n).value.trim();
        const errs = {};
        if (g("storeName").length < 3) errs.storeName = "Nama toko minimal 3 karakter.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(g("email"))) errs.email = "Format email belum benar.";
        if (!setErrors(panel, errs)) return;
        Object.assign(S.settings, { storeName: g("storeName"), email: g("email"), phone: g("phone"), address: g("address"), hours: g("hours") });
        syncTexts();
        $("#pageSub").textContent = `${S.settings.storeName} · ${todayLabel()}`;
        const entry = log("sistem", `Pengaturan toko diperbarui oleh <strong>${esc(S.profile.name)}</strong>`, "settings");
        renderActivity(entry.id);
        clearDirty(panel);
        toast("Pengaturan toko disimpan");
    } else if (name === "notifikasi") {
        $$('input[type="checkbox"]', panel).forEach((c) => (S.settings.notif[c.name.slice(6)] = c.checked));
        clearDirty(panel);
        toast("Preferensi notifikasi disimpan");
    } else if (name === "keamanan") {
        const old = fe(panel, "pwOld").value;
        const nw = fe(panel, "pwNew").value;
        const cf = fe(panel, "pwConfirm").value;
        const errs = {};
        if (!old) errs.pwOld = "Isi kata sandi saat ini.";
        if (nw.length < 8 || !/\d/.test(nw)) errs.pwNew = "Minimal 8 karakter dan mengandung angka.";
        if (cf !== nw) errs.pwConfirm = "Kata sandi tidak sama.";
        if (!setErrors(panel, errs)) return;
        ["pwOld", "pwNew", "pwConfirm"].forEach((n) => (fe(panel, n).value = ""));
        const entry = log("sistem", `Kata sandi <strong>${esc(S.profile.name)}</strong> diperbarui`, "lock_reset");
        renderActivity(entry.id);
        toast("Kata sandi diperbarui");
    }
}

/* =====================================================================
   Notifikasi & pencarian global
   ===================================================================== */
function openNotif(id) {
    const n = S.notifications.find((x) => x.id === id);
    if (!n) return;
    n.read = true;
    renderNotifs();
    closeDropdowns();
    if (n.view === "pesanan") {
        go("pesanan");
        openOrder(n.ref);
    } else if (n.view === "produk") {
        if (n.ref === "habis" || n.ref === "menipis") {
            applyBind("products.status", n.ref);
            syncBindInputs();
        }
        go("produk");
    } else go(n.view || "dashboard");
}

function gotoResult(kind, id) {
    const box = $("#globalSearch");
    if (kind === "order") {
        go("pesanan");
        openOrder(id);
    } else if (kind === "product") {
        const p = S.products.find((x) => x.id === Number(id));
        Object.assign(ui.products, { q: p.name, cat: "all", status: "all" });
        syncBindInputs();
        renderProducts();
        go("produk");
    } else {
        const u = S.users.find((x) => x.id === Number(id));
        Object.assign(ui.users, { q: u.name, role: "all", status: "all" });
        syncBindInputs();
        renderUsers();
        go("pengguna");
    }
    box.value = "";
    box.blur();
    $("#searchBox").classList.remove("open");
}

function runSearch() {
    const input = $("#globalSearch");
    const { html } = R.searchResults(S, input.value);
    $("#searchResults").innerHTML = html;
    $("#searchBox").classList.toggle("open", !!html);
}

function moveSearchFocus(dir) {
    const items = $$("#searchResults .sr-item");
    if (!items.length) return;
    let i = items.findIndex((x) => x.classList.contains("focus"));
    items.forEach((x) => x.classList.remove("focus"));
    i = (i + dir + items.length) % items.length;
    items[i].classList.add("focus");
    items[i].scrollIntoView({ block: "nearest" });
}

/* =====================================================================
   Ekspor
   ===================================================================== */
const stamp = () => new Date().toISOString().slice(0, 10);

function exportProducts() {
    const rows = [["SKU", "Nama", "Kategori", "Harga", "Stok", "Terjual", "Status"]];
    R.filterProducts(S, ui.products).forEach((p) => rows.push([p.sku, p.name, p.category, p.price, p.stock, p.sold, stockState(p).label]));
    downloadCsv(`produk-${stamp()}.csv`, rows);
    toast(`${rows.length - 1} produk diekspor ke CSV`);
}

function exportOrders() {
    const rows = [["Invoice", "Tanggal", "Pelanggan", "Pembayaran", "Kurir", "Item", "Total", "Status"]];
    R.filterOrders(S, ui.orders).forEach((o) =>
        rows.push([o.id, fmtDate(o.created, true), o.customer, o.payment, o.courier, o.items.map((i) => `${i.name} x${i.qty}`).join("; "), o.total, ORDER_STATUS[o.status].label]),
    );
    downloadCsv(`pesanan-${stamp()}.csv`, rows);
    toast(`${rows.length - 1} pesanan diekspor ke CSV`);
}

function exportReport() {
    const r = R.reportData(S, ui.report.months);
    const rows = [["Bulan", "Pendapatan", "Laba", "Jumlah pesanan"]];
    r.labels.forEach((l, i) => rows.push([l, r.rev[i], r.profit[i], r.orders[i]]));
    rows.push(["Total", r.totalRev, r.totalProfit, r.totalOrders]);
    downloadCsv(`laporan-${ui.report.months}-bulan-${stamp()}.csv`, rows);
    toast("Laporan diekspor ke CSV");
}

function exportActivity() {
    const rows = [["Waktu", "Jenis", "Aktivitas"]];
    R.filterActivity(S, ui.activity).forEach((a) => rows.push([fmtDate(a.ts, true), a.type, stripHtml(a.text)]));
    downloadCsv(`log-aktivitas-${stamp()}.csv`, rows);
    toast(`${rows.length - 1} aktivitas diekspor ke CSV`);
}

/* =====================================================================
   Aksi (data-action)
   ===================================================================== */
const actions = {
    nav: (el) => go(el.dataset.view),
    "open-sidebar": openSidebar,
    "close-sidebar": closeSidebar,
    set: (el) => applyBind(el.dataset.bind, el.dataset.value),
    "close-overlay": (el) => closeOverlay(el.closest(".overlay")),
    "confirm-ok": () => resolveConfirm(true),
    "confirm-cancel": () => resolveConfirm(false),

    logout: async () => {
        closeDropdowns();
        const ok = await confirmDialog({ title: "Keluar dari dashboard?", message: "Ini hanya contoh. Sesi Anda tidak benar-benar berakhir.", confirmLabel: "Keluar", icon: "logout" });
        if (ok) toast("Anda tetap masuk — ini hanya demo.", "info");
    },
    "open-profile": () => {
        closeSidebar();
        openProfile();
    },
    "toggle-theme": () => applyTheme(ui.theme === "dark" ? "light" : "dark"),
    "read-all": () => {
        S.notifications.forEach((n) => (n.read = true));
        renderNotifs();
    },
    "open-notif": (el) => openNotif(Number(el.dataset.id)),

    "new-order": () => {
        closeDropdowns();
        openOrderModal();
    },
    "new-product": () => {
        closeDropdowns();
        openProductModal();
    },
    "new-user": () => {
        closeDropdowns();
        openUserModal();
    },

    "edit-product": (el) => openProductModal(Number(el.dataset.id)),
    "delete-product": (el) => deleteProduct(Number(el.dataset.id)),
    "archive-product": (el) => toggleArchive(Number(el.dataset.id)),
    stock: (el) => openStockModal(Number(el.dataset.id)),
    "quick-qty": (el) => {
        const input = fe($("#stockForm"), "qty");
        input.value = (Number(input.value) || 0) + Number(el.dataset.qty);
        updateStockPreview();
    },
    "clear-product-filters": () => {
        Object.assign(ui.products, { q: "", cat: "all", status: "all" });
        syncBindInputs();
        renderProducts();
    },
    "goto-low-stock": () => {
        Object.assign(ui.products, { status: "menipis", q: "", cat: "all" });
        syncBindInputs();
        renderProducts();
        go("produk");
    },

    "open-order": (el) => openOrder(el.dataset.id),
    "order-next": (el) => advanceOrder(el.dataset.id),
    "order-cancel": (el) => cancelOrder(el.dataset.id),
    "print-invoice": (el) => toast(`Invoice #${el.dataset.id} dikirim ke printer (simulasi).`, "info"),
    "add-order-row": () => {
        ui.orderRows.push({ pid: "", qty: 1 });
        renderOrderRows();
        $$("#orderItems .order-row:last-child select")[0]?.focus();
    },
    "remove-order-row": (el) => {
        if (ui.orderRows.length === 1) return;
        ui.orderRows.splice(Number(el.dataset.index), 1);
        renderOrderRows();
    },
    page: (el) => {
        ui.orders.page = Number(el.dataset.page);
        renderOrders();
    },

    "edit-user": (el) => openUserModal(Number(el.dataset.id)),
    "delete-user": (el) => deleteUser(Number(el.dataset.id)),

    "goto-result": (el) => gotoResult(el.dataset.kind, el.dataset.id),

    "export-products": exportProducts,
    "export-orders": exportOrders,
    "export-report": exportReport,
    "export-activity": exportActivity,
    "print-report": () => window.print(),

    "refresh-log": () => {
        const btn = $("#refreshLogBtn");
        if (btn.disabled) return;
        btn.disabled = true;
        $(".material-icons", btn).classList.add("spin");
        setTimeout(() => {
            const entry = log("sistem", "Sinkronisasi data toko selesai", "sync");
            ui.activity.limit = Math.max(ui.activity.limit, 10);
            renderActivity(entry.id);
            renderDashboard();
            btn.disabled = false;
            $(".material-icons", btn).classList.remove("spin");
            toast("Log aktivitas diperbarui");
        }, 700);
    },
    "more-log": () => {
        ui.activity.limit += 10;
        renderActivity();
    },

    "settings-tab": (el) => showSettingsTab(el.dataset.tab),
    "settings-reset": (el) => {
        fillSettings();
        setErrors(el.closest("form"), {});
    },
    "revoke-session": async (el) => {
        const ok = await confirmDialog({ title: "Keluarkan perangkat ini?", message: "Perangkat tersebut harus masuk lagi untuk mengakses dashboard.", confirmLabel: "Keluarkan", danger: true });
        if (!ok) return;
        $(`[data-session="${el.dataset.id}"]`)?.remove();
        toast("Perangkat dikeluarkan");
    },
    "reset-demo": async () => {
        const ok = await confirmDialog({ title: "Reset data demo?", message: "Semua perubahan yang Anda buat akan dikembalikan ke data awal.", confirmLabel: "Reset data", icon: "restart_alt" });
        if (!ok) return;
        const theme = ui.theme;
        S = createSeed();
        ui = defaultUi();
        ui.theme = theme;
        applyDensity("nyaman");
        fillSettings();
        syncTexts();
        syncBindInputs();
        rebuildCharts();
        renderAll();
        go("dashboard");
        toast("Data demo dikembalikan ke awal", "info");
    },
};

/* =====================================================================
   Event
   ===================================================================== */
const submitHandlers = {
    productForm: submitProduct,
    stockForm: submitStock,
    orderForm: submitOrder,
    userForm: submitUser,
    profileForm: submitProfile,
};

function bindEvents() {
    root.addEventListener("click", (e) => {
        const toggle = e.target.closest("[data-dropdown-toggle]");
        if (toggle) {
            toggleDropdown(toggle.closest(".dropdown"));
            return;
        }
        const el = e.target.closest("[data-action]");
        if (el && root.contains(el)) {
            const name = el.dataset.action;
            const fn = actions[name];
            if (fn) {
                fn(el, e);
                if (el.closest(".menu") && name !== "read-all") closeDropdowns();
            }
            return;
        }
        if (!e.target.closest(".dropdown")) closeDropdowns();
    });

    root.addEventListener("input", (e) => {
        const el = e.target;
        if (el.matches("input[data-bind]")) applyBind(el.dataset.bind, el.value);
        if (el.matches("[data-row-field]")) onOrderRowChange(el);
        if (el.id === "stockQty") updateStockPreview();
        if (el.id === "oCustomer") {
            const c = S.customers.find((x) => x.name.toLowerCase() === el.value.trim().toLowerCase());
            const f = $("#orderForm");
            if (c) {
                if (!fe(f, "phone").value) fe(f, "phone").value = c.phone;
                if (!fe(f, "address").value) fe(f, "address").value = c.address;
            }
        }
        if (el.id === "globalSearch") runSearch();
        el.closest(".field")?.classList.remove("invalid");
        const panel = el.closest(".settings-panel");
        if (panel && !el.matches('[name^="pw"], [name="theme"], [name="density"], [data-instant]') && panel.dataset.panel !== "keamanan") markDirty(panel);
    });

    root.addEventListener("change", (e) => {
        const el = e.target;
        if (el.matches("select[data-bind]")) applyBind(el.dataset.bind, el.value);
        if (el.matches("[data-row-field]")) onOrderRowChange(el);
        if (el.dataset.change === "toggle-user") toggleUser(Number(el.dataset.id), el.checked);
        if (el.name === "theme") applyTheme(el.value);
        if (el.name === "density") {
            applyDensity(el.value);
            toast("Kepadatan tabel diperbarui", "info");
        }
        if (el.name === "twoFactor") {
            S.settings.twoFactor = el.checked;
            toast(el.checked ? "Verifikasi dua langkah aktif" : "Verifikasi dua langkah dimatikan", el.checked ? "ok" : "info");
        }
        const panel = el.closest(".settings-panel");
        if (panel && el.type === "checkbox" && el.name.startsWith("notif.")) markDirty(panel);
    });

    root.addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.target;
        if (submitHandlers[form.id]) submitHandlers[form.id](form);
        else if (form.dataset.panel) submitSettings(form);
    });

    root.addEventListener("focusin", (e) => {
        if (e.target.id === "globalSearch") {
            closeDropdowns($("#searchBox"));
            if (e.target.value) runSearch();
        }
    });

    document.addEventListener("keydown", (e) => {
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
        if (e.key === "/" && !typing && !topOverlay()) {
            e.preventDefault();
            $("#globalSearch").focus();
            return;
        }
        if (e.key === "Escape") {
            if (isConfirmOpen()) return resolveConfirm(false);
            const top = topOverlay();
            if (top) return closeOverlay(top);
            if (document.activeElement === $("#globalSearch")) {
                $("#globalSearch").blur();
            }
            closeDropdowns();
            closeSidebar();
            return;
        }
        if (document.activeElement === $("#globalSearch")) {
            if (e.key === "ArrowDown") (e.preventDefault(), moveSearchFocus(1));
            else if (e.key === "ArrowUp") (e.preventDefault(), moveSearchFocus(-1));
            else if (e.key === "Enter") {
                e.preventDefault();
                ($("#searchResults .sr-item.focus") || $("#searchResults .sr-item"))?.click();
            }
            return;
        }
        // Baris/kartu yang bisa diklik dan fokus keyboard
        if ((e.key === "Enter" || e.key === " ") && e.target.matches?.('[role="button"][data-action]')) {
            e.preventDefault();
            e.target.click();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) closeSidebar();
    });

    window.addEventListener("hashchange", () => {
        const h = location.hash.slice(1);
        if (VIEWS[h] && h !== ui.view) go(h, false);
    });
}

if (root) boot();
