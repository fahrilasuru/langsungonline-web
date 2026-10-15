// Utilitas bersama.
//
// Aturan keamanan di seluruh demo ini:
//  - DOM dibangun lewat h()/svg() di bawah. Teks selalu masuk sebagai text node, tidak pernah sebagai
//    HTML, jadi judul pertanyaan, nama berkas, atau jawaban responden tidak bisa menyuntikkan markup.
//  - Atribut dibatasi daftar putih; atribut on* dan javascript: tidak pernah lolos.
//  - Tidak ada innerHTML, outerHTML, insertAdjacentHTML, document.write, eval, atau new Function.
//  - Tidak ada data yang dikirim ke server: ini mockup, semuanya hidup di memori halaman.

const SAFE_ATTR =
    /^(class|id|for|type|name|value|min|max|step|maxlength|placeholder|rows|role|accept|autocomplete|inputmode|tabindex|title|colspan|scope|multiple|hidden|disabled|checked|selected|readonly|required|open|inert|pattern|spellcheck|aria-[a-z]+|data-[a-z-]+)$/;
const BOOL_ATTR = new Set(["multiple", "hidden", "disabled", "readonly", "required", "open", "inert"]);
const PROP_ATTR = new Set(["value", "checked", "selected"]);
const SAFE_VAR = /^[a-z][a-z0-9-]*$/;

/**
 * Membuat elemen HTML. `on` = {event: fungsi}; `vars` = CSS custom property (tanpa awalan --).
 * @param {string} tag
 * @param {Record<string, any> | null} [props]
 * @param {...any} kids
 * @returns {HTMLElement}
 */
export function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) {
        for (const [k, v] of Object.entries(props)) {
            if (v === false || v === null || v === undefined) continue;
            if (k === "on") {
                for (const [evt, fn] of Object.entries(v)) {
                    if (typeof fn !== "function") throw new TypeError("Handler harus berupa fungsi");
                    el.addEventListener(evt, fn);
                }
                continue;
            }
            if (k === "vars") {
                for (const [name, val] of Object.entries(v)) {
                    if (!SAFE_VAR.test(name)) throw new Error("Nama variabel CSS tidak valid");
                    el.style.setProperty("--" + name, String(val));
                }
                continue;
            }
            if (!SAFE_ATTR.test(k)) throw new Error("Atribut tidak diizinkan: " + k);
            if (PROP_ATTR.has(k)) {
                el[k] = k === "value" ? String(v) : Boolean(v);
            } else if (BOOL_ATTR.has(k)) {
                el.setAttribute(k, "");
            } else {
                el.setAttribute(k, String(v));
            }
        }
    }
    append(el, kids);
    return el;
}

function append(el, kids) {
    for (const k of kids) {
        if (k === null || k === undefined || k === false) continue;
        if (Array.isArray(k)) append(el, k);
        else if (k instanceof Node) el.appendChild(k);
        else el.appendChild(document.createTextNode(String(k)));
    }
}

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_ATTR =
    /^(viewBox|d|cx|cy|r|x|y|x1|x2|y1|y2|width|height|rx|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|class|role|focusable|points|transform|opacity|text-anchor|aria-[a-z]+)$/;

/** Membuat elemen SVG dengan aturan atribut yang sama ketatnya. */
export function svg(tag, attrs, ...kids) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
            if (v === false || v === null || v === undefined) continue;
            if (!SVG_ATTR.test(k)) throw new Error("Atribut SVG tidak diizinkan: " + k);
            el.setAttribute(k, String(v));
        }
    }
    append(el, kids);
    return el;
}

const ICONS = {
    check: "M5 12.5l4.5 4.5L19 7.5",
    x: "M6 6l12 12M18 6L6 18",
    plus: "M12 5v14M5 12h14",
    up: "M6 14l6-6 6 6",
    down: "M6 10l6 6 6-6",
    left: "M15 6l-6 6 6 6",
    right: "M9 6l6 6-6 6",
    trash: "M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13",
    copy: "M9 9h10v11H9zM5 15V4h10",
    upload: "M12 16V4m0 0L8 8m4-4l4 4M4 20h16",
    download: "M12 4v12m0 0l-4-4m4 4l4-4M4 20h16",
    file: "M7 3h7l5 5v13H7zM14 3v5h5",
    link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
    share: "M12 4v11M8 8l4-4 4 4M5 13v7h14v-7",
    edit: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
    form: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h3",
    chart: "M5 20V10M12 20V4M19 20v-7",
    home: "M4 11l8-7 8 7v9H4zM10 20v-6h4v6",
    building: "M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3",
    briefcase: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
    coffee: "M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 10h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
    info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.01",
    alert: "M12 8v5M12 16.5v.01M10.3 4l-8 14a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z",
    star: "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4-4.7-4.4 6.4-.8z",
    eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    code: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
    reset: "M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5",
    lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
    clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
};

/** @param {keyof typeof ICONS} name */
export function icon(name, { size = 18, cls = "" } = {}) {
    return svg(
        "svg",
        {
            viewBox: "0 0 24 24",
            width: size,
            height: size,
            fill: "none",
            stroke: "currentColor",
            "stroke-width": 2,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "aria-hidden": "true",
            focusable: "false",
            class: cls || false,
        },
        svg("path", { d: ICONS[name] }),
    );
}

// ---------- Pembersihan & format ----------

// Karakter kontrol + karakter pengubah arah teks (dipakai untuk memalsukan nama berkas / tampilan).
const CTRL = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g;
const CTRL_KEEP_NL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g;

/** Satu baris: buang karakter kontrol, rapikan spasi, potong ke `max`. */
export function cleanLine(value, max = 200) {
    return String(value ?? "")
        .replace(CTRL, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}

/** Beberapa baris: pertahankan \n dan \t, buang sisanya. */
export function cleanText(value, max = 1000) {
    return String(value ?? "")
        .replace(/\r\n?/g, "\n")
        .replace(CTRL_KEEP_NL, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, max);
}

/** Bilangan bulat dalam rentang; nilai tak valid memakai `fallback`. */
export function clampInt(value, min, max, fallback) {
    const n = Math.trunc(Number(value));
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

const nf = new Intl.NumberFormat("id-ID");
export const fmtNum = (n) => nf.format(n);
export const fmtDec = (n, d = 1) =>
    new Intl.NumberFormat("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

/** "2026-10-12" -> "12 Oktober 2026". Mengembalikan "" jika tidak valid. */
export function fmtIsoDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
    if (!m) return "";
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (d.getMonth() !== Number(m[2]) - 1) return "";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function isoToday() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fmtTime(date) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
}

export function relTime(date, now = new Date()) {
    const s = Math.max(0, Math.round((now - date) / 1000));
    if (s < 60) return "baru saja";
    const m = Math.round(s / 60);
    if (m < 60) return `${m} menit lalu`;
    const hr = Math.round(m / 60);
    if (hr < 24) return `${hr} jam lalu`;
    const d = Math.round(hr / 24);
    if (d === 1) return "kemarin";
    if (d < 30) return `${d} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// ---------- Id & kode ----------

let seq = 0;
/** Id internal untuk elemen DOM (tidak pernah berasal dari input pengguna). */
export const domId = (prefix = "f") => `${prefix}${++seq}`;

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 31 karakter, tanpa 0/O/1/I/L
/** Kode acak dengan crypto (rejection sampling agar tidak bias). */
export function randomCode(len = 6) {
    let out = "";
    const buf = new Uint8Array(len * 2);
    while (out.length < len) {
        crypto.getRandomValues(buf);
        for (const b of buf) {
            if (b < 248 && out.length < len) out += CODE_ALPHABET[b % 31];
        }
    }
    return out;
}

// ---------- CSV & berkas ----------

/** Sel CSV aman: kutip RFC 4180 + penangkal formula injection (=, +, -, @, tab, CR). */
export function csvCell(value) {
    let s = value === null || value === undefined ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function downloadText(filename, mime, text) {
    const blob = new Blob([text], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = h("a", { class: "sr-only", title: "unduh" });
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

// ---------- Toast ----------

let toastHome = null;
/** Dialog modal berada di top layer: pindahkan toast ke dalamnya agar tetap terlihat. */
function placeToasts(host = document.getElementById("toasts")) {
    if (!host) return;
    toastHome ??= host.parentElement;
    const open = document.querySelector("dialog.dlg[open]");
    const target = open || toastHome;
    if (target && host.parentElement !== target) target.appendChild(host);
}

/**
 * @param {string} message
 * @param {{label: string, run: () => void} | null} [action]
 */
export function toast(message, action = null) {
    const host = document.getElementById("toasts");
    if (!host) return;
    placeToasts(host);
    const node = h("div", { class: "toast" }, h("span", { class: "toast-msg" }, message));
    let timer = 0;
    const remove = () => {
        clearTimeout(timer);
        node.classList.add("out");
        setTimeout(() => node.remove(), 180);
    };
    if (action) {
        node.appendChild(
            h("button", { type: "button", class: "toast-act", on: { click: () => (remove(), action.run()) } }, action.label),
        );
    }
    host.appendChild(node);
    while (host.children.length > 3) host.firstElementChild?.remove();
    timer = window.setTimeout(remove, action ? 7000 : 3800);
}

// ---------- Dialog ----------

export function openDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    document.documentElement.classList.add("dlg-open");
}

export function initDialogs() {
    document.querySelectorAll("dialog.dlg").forEach((dlg) => {
        dlg.addEventListener("click", (e) => {
            if (e.target === dlg) dlg.close();
        });
        dlg.addEventListener("close", () => {
            if (!document.querySelector("dialog.dlg[open]")) document.documentElement.classList.remove("dlg-open");
            placeToasts();
        });
        dlg.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => dlg.close()));
    });
}

// ---------- Tab tampilan ----------

const VIEWS = { isi: "view-isi", pembuat: "view-pembuat", respons: "view-respons" };
const viewListeners = new Set();
let currentView = "isi";

export const getView = () => currentView;
export const onViewChange = (fn) => viewListeners.add(fn);

export function showView(name, { scroll = true, hash = true } = {}) {
    if (!Object.hasOwn(VIEWS, name)) return;
    const changed = name !== currentView;
    currentView = name;
    for (const [key, id] of Object.entries(VIEWS)) {
        const panel = document.getElementById(id);
        if (panel) panel.hidden = key !== name;
    }
    document.querySelectorAll('[role="tab"][data-view]').forEach((tab) => {
        const on = tab.getAttribute("data-view") === name;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
    });
    if (hash && location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
    if (scroll && changed) window.scrollTo(0, 0);
    if (changed) viewListeners.forEach((fn) => fn(name));
}

export function initViews() {
    document.querySelectorAll('[role="tab"][data-view]').forEach((tab) => {
        tab.addEventListener("click", () => showView(tab.getAttribute("data-view") || "isi"));
    });
    document.querySelectorAll("[data-goto]").forEach((el) => {
        el.addEventListener("click", () => showView(el.getAttribute("data-goto") || "isi"));
    });
    document.querySelectorAll('[role="tablist"]').forEach((list) => {
        list.addEventListener("keydown", (e) => {
            const tabs = [...list.querySelectorAll('[role="tab"]')];
            const i = tabs.indexOf(document.activeElement);
            if (i < 0) return;
            let next = -1;
            if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
            else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
            else if (e.key === "Home") next = 0;
            else if (e.key === "End") next = tabs.length - 1;
            if (next < 0) return;
            e.preventDefault();
            tabs[next].focus();
            showView(tabs[next].getAttribute("data-view") || "isi", { scroll: false });
        });
    });
    const fromHash = () => {
        const n = location.hash.slice(1);
        if (Object.hasOwn(VIEWS, n)) showView(n, { scroll: false, hash: false });
    };
    window.addEventListener("hashchange", fromHash);
    fromHash();
    showView(currentView, { scroll: false, hash: false });
}
