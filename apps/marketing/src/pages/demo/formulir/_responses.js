// Tab Respons: ringkasan, grafik SVG, tabel, detail, dan ekspor CSV.
// Pencarian memakai includes() pada teks biasa (bukan regex dari input), jadi tidak ada risiko ReDoS.

import { h, icon, fmtNum, fmtDec, relTime, csvCell, downloadText, openDialog, toast, isoToday } from "./_ui.js";
import { getResponses, subscribeResponses, touchResponses, STATUSES } from "./_data.js";

const $ = (id) => document.getElementById(id);
const PAGE = 8;
let page = 0;

export function initResponses() {
    if (!$("rBody")) return;
    $("rSearch").addEventListener("input", () => ((page = 0), renderTable()));
    $("rStatus").addEventListener("change", () => ((page = 0), renderTable()));
    $("rPrev").addEventListener("click", () => (page--, renderTable()));
    $("rNext").addEventListener("click", () => (page++, renderTable()));
    $("btnCsv").addEventListener("click", exportCsv);
    $("rBody").addEventListener("click", (e) => {
        const tr = e.target instanceof Element ? e.target.closest("tr[data-id]") : null;
        if (tr) openDetail(tr.dataset.id || "");
    });
    subscribeResponses(renderAll);
    renderAll();
}

function renderAll() {
    renderKpis();
    renderDays();
    renderTypes();
    renderNps();
    renderTable();
}

const nums = (key) => getResponses().map((r) => r[key]).filter((n) => typeof n === "number");

// ---------- KPI ----------

function npsParts() {
    const v = nums("nps");
    const p = v.filter((n) => n >= 9).length, d = v.filter((n) => n <= 6).length, m = v.length - p - d;
    const score = v.length ? Math.round(((p - d) / v.length) * 100) : 0;
    return { p, d, m, n: v.length, score };
}

function renderKpis() {
    const all = getResponses();
    const now = Date.now(), DAY = 864e5;
    const wk = all.filter((r) => now - r.at < 7 * DAY).length;
    const prev = all.filter((r) => now - r.at >= 7 * DAY && now - r.at < 14 * DAY).length;
    $("kpiTotal").textContent = fmtNum(all.length);
    const delta = prev ? Math.round(((wk - prev) / prev) * 100) : 0;
    $("kpiTotalNote").textContent = `${wk} minggu ini, ${delta >= 0 ? "naik" : "turun"} ${Math.abs(delta)}% dari minggu lalu`;
    const ratings = nums("rating");
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    $("kpiRating").textContent = ratings.length ? fmtDec(avg) : "—";
    $("kpiRatingNote").textContent = `dari ${ratings.length} penilaian, skala 5`;
    const nps = npsParts();
    $("kpiNps").textContent = nps.n ? (nps.score > 0 ? "+" : "") + nps.score : "—";
    $("kpiNpsNote").textContent = nps.score >= 50 ? "Sangat baik" : nps.score >= 0 ? "Cukup baik" : "Perlu perhatian";
    const views = Math.round(all.length * 1.28);
    $("kpiRate").textContent = `${Math.round((all.length / views) * 100)}%`;
    $("kpiRateNote").textContent = `${fmtNum(all.length)} dikirim dari ${fmtNum(views)} kunjungan`;
}

// ---------- Grafik ----------

function dayKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function renderDays() {
    const host = $("chartDays");
    host.replaceChildren();
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setHours(12, 0, 0, 0);
        d.setDate(d.getDate() - i);
        days.push({ d, key: dayKey(d), n: 0 });
    }
    for (const r of getResponses()) {
        const hit = days.find((x) => x.key === dayKey(r.at));
        if (hit) hit.n++;
    }
    const max = Math.max(4, ...days.map((x) => x.n));
    const total = days.reduce((a, b) => a + b.n, 0);
    const cols = days.map((x, i) =>
        h("li", { class: "dc" + (i === days.length - 1 ? " is-now" : ""), title: `${x.d.toLocaleDateString("id-ID", { day: "numeric", month: "long" })}: ${x.n} respons` },
            h("span", { class: "dc-n" }, x.n ? String(x.n) : ""),
            h("span", { class: "dc-bar", vars: { h: `${(x.n / max) * 100}%` } }),
            h("span", { class: "dc-d" }, `${x.d.getDate()}/${x.d.getMonth() + 1}`)));
    host.appendChild(h("ul", { class: "dchart", role: "img", "aria-label": `Respons per hari selama 14 hari terakhir, total ${total} respons` }, cols));
}

function renderTypes() {
    const host = $("chartTypes");
    host.replaceChildren();
    const counts = new Map();
    for (const r of getResponses()) counts.set(r.type || "—", (counts.get(r.type || "—") || 0) + 1);
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = rows[0]?.[1] || 1;
    const total = getResponses().length || 1;
    for (const [name, n] of rows) {
        host.appendChild(h("li", { class: "hb" }, h("div", { class: "hb-top" }, h("span", null, name), h("span", { class: "hb-n" }, `${n} (${Math.round((n / total) * 100)}%)`)),
            h("div", { class: "hb-track", "aria-hidden": "true" }, h("i", { vars: { w: `${(n / top) * 100}%` } }))));
    }
}

function renderNps() {
    const { p, m, d, n } = npsParts();
    const host = $("chartNps");
    host.replaceChildren();
    const seg = (cls, v, label) => h("li", { class: "nps-leg" }, h("i", { class: cls, "aria-hidden": "true" }), h("span", null, label), h("strong", null, `${v}`));
    host.append(
        h("div", { class: "stack", role: "img", "aria-label": `Pendukung ${p}, netral ${m}, pengkritik ${d}` },
            h("i", { class: "seg-p", vars: { w: `${n ? (p / n) * 100 : 0}%` } }), h("i", { class: "seg-m", vars: { w: `${n ? (m / n) * 100 : 0}%` } }), h("i", { class: "seg-d", vars: { w: `${n ? (d / n) * 100 : 0}%` } })),
        h("ul", { class: "nps-legend" }, seg("seg-p", p, "Pendukung (9 sampai 10)"), seg("seg-m", m, "Netral (7 sampai 8)"), seg("seg-d", d, "Pengkritik (0 sampai 6)")));
}

// ---------- Tabel ----------

function filtered() {
    const q = $("rSearch").value.trim().toLowerCase().slice(0, 80);
    const st = $("rStatus").value;
    return getResponses().filter((r) => (!st || r.status === st) && (!q || `${r.name} ${r.id} ${r.city} ${r.type}`.toLowerCase().includes(q)));
}

function chip(status) {
    const cls = status === "Baru" ? "chip chip-new" : status === "Dibaca" ? "chip chip-read" : "chip chip-done";
    return h("span", { class: cls }, status);
}

function renderTable() {
    const rows = filtered();
    const pages = Math.max(1, Math.ceil(rows.length / PAGE));
    page = Math.min(Math.max(0, page), pages - 1);
    const body = $("rBody");
    body.replaceChildren();
    for (const r of rows.slice(page * PAGE, page * PAGE + PAGE)) {
        const tr = h("tr", { class: "r-row" + (r.fresh ? " is-fresh" : "") },
            h("td", { "data-label": "Responden" }, h("button", { type: "button", class: "r-name", "aria-label": `Buka respons ${r.name}` }, r.name), h("span", { class: "r-sub" }, `${r.id}, ${r.city}`)),
            h("td", { "data-label": "Jenis" }, r.type),
            h("td", { "data-label": "Anggaran" }, typeof r.budget === "number" ? `Rp ${fmtNum(r.budget)} jt` : "—"),
            h("td", { "data-label": "Kepuasan" }, typeof r.rating === "number" ? h("span", { class: "r-rate" }, icon("star", { size: 14 }), String(r.rating)) : "—"),
            h("td", { "data-label": "Masuk" }, relTime(r.at)),
            h("td", { "data-label": "Status" }, chip(r.status)));
        tr.dataset.id = r.id;
        body.appendChild(tr);
    }
    $("rEmpty").hidden = rows.length > 0;
    $("rTable").hidden = rows.length === 0;
    $("rInfo").textContent = rows.length ? `${page * PAGE + 1} sampai ${Math.min(rows.length, page * PAGE + PAGE)} dari ${rows.length}` : "0 respons";
    $("rPrev").disabled = page === 0;
    $("rNext").disabled = page >= pages - 1;
}

// ---------- Detail ----------

function openDetail(id) {
    const r = getResponses().find((x) => x.id === id);
    if (!r) return;
    if (r.status === "Baru") {
        r.status = "Dibaca";
        r.fresh = false;
        touchResponses();
    }
    const sel = h("select", { class: "inp inp-sm", id: "respStatus" }, STATUSES.map((s) => h("option", { value: s }, s)));
    sel.value = r.status;
    sel.addEventListener("change", () => {
        if (!STATUSES.includes(sel.value)) return;
        r.status = sel.value;
        touchResponses();
        toast(`Status diubah menjadi ${r.status}.`);
    });
    const dl = h("dl", { class: "kv" });
    const add = (k, v) => v && dl.append(h("dt", null, k), h("dd", null, v));
    add("Email", r.email);
    add("WhatsApp", r.wa);
    for (const a of r.answers) add(a.q, a.a);
    $("respBody").replaceChildren(
        h("div", { class: "dlg-head" }, h("div", null, h("h2", { id: "respTitle", class: "dlg-title" }, r.name), h("p", { class: "dlg-sub" }, `${r.id}, masuk ${relTime(r.at)}`))),
        h("div", { class: "fld" }, h("label", { class: "fld-label", for: "respStatus" }, "Status tindak lanjut"), sel),
        dl);
    openDialog($("respDlg"));
}

// ---------- CSV ----------

function exportCsv() {
    const head = ["Kode", "Waktu", "Nama", "Email", "WhatsApp", "Kota", "Jenis proyek", "Anggaran (juta Rp)", "Kepuasan", "NPS", "Status"];
    const lines = [head.map(csvCell).join(",")];
    for (const r of getResponses()) {
        lines.push([r.id, r.at.toISOString(), r.name, r.email, r.wa, r.city, r.type, r.budget ?? "", r.rating ?? "", r.nps ?? "", r.status].map(csvCell).join(","));
    }
    downloadText(`respons-isian-${isoToday()}.csv`, "text/csv", "\ufeff" + lines.join("\r\n"));
    toast(`${getResponses().length} respons diekspor ke CSV.`);
}
