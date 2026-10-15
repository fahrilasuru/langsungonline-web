// Registri tipe jawaban. Setiap tipe mendefinisikan:
//   control()  membangun input (DOM aman, tanpa innerHTML)
//   sanitize() memastikan nilai tersimpan masih sah terhadap definisi pertanyaan saat ini
//   check()    validasi isi (di luar "wajib diisi")
//   format()   teks untuk ringkasan, detail respons, dan ekspor
// Nilai dari DOM tidak pernah dipercaya begitu saja: semuanya melewati sanitize() dan check().

import { h, svg, icon, cleanLine, cleanText, clampInt, fmtNum, fmtIsoDate, isoToday, domId } from "./_ui.js";

const AUTOCOMPLETE_OK = new Set(["name", "email", "tel", "off"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
const ICON_OK = new Set(["home", "building", "briefcase", "coffee"]);
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const FILE_EXT = ["pdf", "jpg", "jpeg", "png", "webp"];
const FILE_MIME = /^(application\/pdf|image\/(jpeg|png|webp))$/;
const RATING_WORDS = ["Buruk", "Kurang", "Cukup", "Baik", "Sangat baik"];
const EMOJI_WORDS = ["Sangat buruk", "Buruk", "Biasa saja", "Bagus", "Sangat bagus"];

const opts = (q) => (Array.isArray(q.options) ? q.options : []);
const optById = (q, id) => opts(q).find((o) => o.id === id) || null;
const optLabel = (q, id) => optById(q, id)?.label ?? "";
const fmtSlider = (q, n) => `${q.prefix || ""}${fmtNum(n)}${q.suffix || ""}`;

export const isEmpty = (v) =>
    v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0) ||
    (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

/** Dapatkan nilai dari <input> bergaya radio/checkbox tanpa mengandalkan selector dinamis. */
function radioItem({ name, value, checked, cls, children }) {
    const input = h("input", { type: "radio", name, value, checked, class: "opt-in" });
    const label = h("label", { class: cls }, input, children);
    return { input, label };
}

// ---------- Definisi tipe ----------

/** @type {Record<string, any>} */
export const TYPES = {
    short: {
        label: "Teks singkat", group: "Teks", badge: "Aa", editor: ["placeholder", "maxLength"],
        defaults: () => ({ label: "Pertanyaan teks singkat", maxLength: 80 }),
        control({ q, value, set, id, desc }) {
            const max = clampInt(q.maxLength, 1, 200, 80);
            const inp = h("input", {
                class: "inp", type: "text", id, name: id, maxlength: max, placeholder: q.placeholder || false,
                autocomplete: AUTOCOMPLETE_OK.has(q.autocomplete) ? q.autocomplete : "off", "aria-describedby": desc,
            });
            inp.value = value ?? "";
            inp.addEventListener("input", () => set(cleanLine(inp.value, max) || null));
            return inp;
        },
        sanitize: (q, v) => (typeof v === "string" && v ? cleanLine(v, 200) || null : null),
        check: () => null,
        format: (q, v) => v,
    },
    long: {
        label: "Paragraf", group: "Teks", badge: "¶", editor: ["placeholder", "maxLength"],
        defaults: () => ({ label: "Pertanyaan paragraf", maxLength: 500 }),
        control({ q, value, set, id, desc }) {
            const max = clampInt(q.maxLength, 1, 2000, 500);
            const ta = h("textarea", {
                class: "inp ta", id, name: id, rows: 4, maxlength: max, placeholder: q.placeholder || false, "aria-describedby": desc,
            });
            ta.value = value ?? "";
            const cnt = h("span", { class: "ta-count", "aria-hidden": "true" }, `${ta.value.length}/${max}`);
            ta.addEventListener("input", () => {
                set(cleanText(ta.value, max) || null);
                cnt.textContent = `${ta.value.length}/${max}`;
            });
            return h("div", { class: "ta-wrap" }, ta, cnt);
        },
        sanitize: (q, v) => (typeof v === "string" && v ? cleanText(v, 2000) || null : null),
        check: () => null,
        format: (q, v) => v,
    },
    email: {
        label: "Email", group: "Teks", badge: "@", editor: ["placeholder"],
        defaults: () => ({ label: "Alamat email", placeholder: "nama@email.com" }),
        control({ q, value, set, id, desc }) {
            const inp = h("input", {
                class: "inp", type: "email", id, name: id, maxlength: 254, inputmode: "email", autocomplete: "email",
                placeholder: q.placeholder || false, spellcheck: "false", "aria-describedby": desc,
            });
            inp.value = value ?? "";
            inp.addEventListener("input", () => set(cleanLine(inp.value, 254) || null));
            return inp;
        },
        sanitize: (q, v) => (typeof v === "string" && v ? cleanLine(v, 254) || null : null),
        check: (q, v) => (v.length <= 254 && EMAIL_RE.test(v) ? null : "Format email belum benar. Contoh: nama@email.com"),
        format: (q, v) => v,
    },
    phone: {
        label: "Nomor telepon", group: "Teks", badge: "08", editor: ["placeholder"],
        defaults: () => ({ label: "Nomor WhatsApp", placeholder: "0812 3456 7890" }),
        control({ q, value, set, id, desc }) {
            const inp = h("input", {
                class: "inp", type: "tel", id, name: id, maxlength: 20, inputmode: "tel", autocomplete: "tel",
                placeholder: q.placeholder || false, "aria-describedby": desc,
            });
            inp.value = value ?? "";
            inp.addEventListener("input", () => {
                const clean = inp.value.replace(/[^\d+\s().-]/g, "");
                if (clean !== inp.value) inp.value = clean;
                set(cleanLine(clean, 20) || null);
            });
            return inp;
        },
        sanitize: (q, v) => (typeof v === "string" && v ? cleanLine(v, 20) || null : null),
        check: (q, v) => (PHONE_RE.test(v.replace(/[\s().-]/g, "")) ? null : "Nomor belum benar. Contoh: 0812 3456 7890"),
        format: (q, v) => v,
    },
    number: {
        label: "Angka", group: "Angka dan skala", badge: "123", editor: ["range", "affix", "placeholder"],
        defaults: () => ({ label: "Pertanyaan angka", min: 0, max: 1000, suffix: "" }),
        control({ q, value, set, id, desc }) {
            const inp = h("input", {
                class: "inp", type: "text", id, name: id, inputmode: "numeric", pattern: "[0-9]*", maxlength: 9,
                autocomplete: "off", placeholder: q.placeholder || false, "aria-describedby": desc,
            });
            inp.value = value === null || value === undefined ? "" : String(value);
            inp.addEventListener("input", () => {
                const digits = inp.value.replace(/\D/g, "").slice(0, 9);
                if (digits !== inp.value) inp.value = digits;
                set(digits === "" ? null : Number(digits));
            });
            return h("div", { class: "inp-group" }, inp, q.suffix ? h("span", { class: "inp-addon", "aria-hidden": "true" }, cleanLine(q.suffix, 12)) : null);
        },
        sanitize: (q, v) => (typeof v === "number" && Number.isFinite(v) ? v : null),
        check(q, v) {
            const min = q.min ?? 0, max = q.max ?? 1e9;
            return v >= min && v <= max ? null : `Isi angka antara ${fmtNum(min)} dan ${fmtNum(max)}${q.suffix ? " " + q.suffix : ""}.`;
        },
        format: (q, v) => `${fmtNum(v)}${q.suffix ? " " + q.suffix : ""}`,
    },
    date: {
        label: "Tanggal", group: "Angka dan skala", badge: "Tgl", editor: [],
        defaults: () => ({ label: "Pilih tanggal", minToday: true }),
        control({ q, value, set, id, desc }) {
            const inp = h("input", {
                class: "inp", type: "date", id, name: id, min: q.minToday ? isoToday() : false, max: "2099-12-31", "aria-describedby": desc,
            });
            inp.value = value ?? "";
            inp.addEventListener("input", () => set(inp.value || null));
            return inp;
        },
        sanitize: (q, v) => (typeof v === "string" && fmtIsoDate(v) ? v : null),
        check(q, v) {
            if (!fmtIsoDate(v) || v > "2099-12-31") return "Tanggal belum valid.";
            return q.minToday && v < isoToday() ? "Pilih tanggal hari ini atau setelahnya." : null;
        },
        format: (q, v) => fmtIsoDate(v),
    },
    select: {
        label: "Dropdown", group: "Pilihan", badge: "Pil", editor: ["options"],
        defaults: () => ({ label: "Pilih salah satu", options: defaultOptions(3) }),
        control({ q, value, set, id, desc }) {
            const sel = h("select", { class: "inp sel", id, name: id, "aria-describedby": desc },
                h("option", { value: "" }, "Pilih salah satu"),
                opts(q).map((o) => h("option", { value: o.id }, o.label)));
            sel.value = value ?? "";
            sel.addEventListener("change", () => set(sel.value || null));
            return h("div", { class: "sel-wrap" }, sel, icon("down", { size: 18, cls: "sel-caret" }));
        },
        sanitize: (q, v) => (typeof v === "string" && optById(q, v) ? v : null),
        check: () => null,
        format: (q, v) => optLabel(q, v),
        requiredMsg: "Pilih salah satu.",
    },
    radio: {
        label: "Pilihan ganda", group: "Pilihan", badge: "( )", editor: ["options", "variant"], variants: [["list", "Daftar"], ["cards", "Kartu"]],
        defaults: () => ({ label: "Pilih salah satu", options: defaultOptions(3), variant: "list" }),
        control({ q, value, set, id }) {
            const cards = q.variant === "cards";
            const wrap = h("div", { class: cards ? "opts opts-cards" : "opts" });
            for (const o of opts(q)) {
                const ico = cards && ICON_OK.has(o.icon) ? h("span", { class: "opt-ico" }, icon(o.icon, { size: 22 })) : null;
                const { input, label } = radioItem({
                    name: id, value: o.id, checked: value === o.id, cls: cards ? "opt opt-card" : "opt",
                    children: [ico, h("span", { class: "opt-mark", "aria-hidden": "true" }), h("span", { class: "opt-text" }, o.label)],
                });
                input.addEventListener("change", () => input.checked && set(o.id));
                wrap.appendChild(label);
            }
            return wrap;
        },
        group_: true,
        sanitize: (q, v) => (typeof v === "string" && optById(q, v) ? v : null),
        check: () => null,
        format: (q, v) => optLabel(q, v),
        requiredMsg: "Pilih salah satu.",
    },
    checkbox: {
        label: "Kotak centang", group: "Pilihan", badge: "[x]", editor: ["options", "variant", "maxSel"], variants: [["list", "Daftar"], ["chips", "Label"]],
        defaults: () => ({ label: "Pilih semua yang sesuai", options: defaultOptions(4), variant: "list" }),
        control({ q, value, set, id }) {
            const chips = q.variant === "chips";
            const max = q.maxSel ? clampInt(q.maxSel, 1, 12, 12) : 0;
            const picked = new Set(Array.isArray(value) ? value : []);
            const inputs = [];
            const wrap = h("div", { class: chips ? "opts opts-chips" : "opts" });
            const sync = () => {
                const ordered = opts(q).filter((o) => picked.has(o.id)).map((o) => o.id);
                set(ordered.length ? ordered : null);
                if (max) inputs.forEach((i) => (i.disabled = !i.checked && picked.size >= max));
            };
            for (const o of opts(q)) {
                const input = h("input", { type: "checkbox", name: id, value: o.id, checked: picked.has(o.id), class: "opt-in" });
                input.addEventListener("change", () => {
                    if (input.checked) picked.add(o.id); else picked.delete(o.id);
                    sync();
                });
                inputs.push(input);
                wrap.appendChild(h("label", { class: chips ? "opt opt-chip" : "opt" }, input, h("span", { class: "opt-mark opt-mark-box", "aria-hidden": "true" }, icon("check", { size: 14 })), h("span", { class: "opt-text" }, o.label)));
            }
            if (max) inputs.forEach((i) => (i.disabled = !i.checked && picked.size >= max));
            return wrap;
        },
        group_: true,
        sanitize(q, v) {
            if (!Array.isArray(v)) return null;
            const ok = opts(q).filter((o) => v.includes(o.id)).map((o) => o.id);
            return ok.length ? ok : null;
        },
        check: (q, v) => (q.maxSel && v.length > q.maxSel ? `Pilih maksimal ${q.maxSel}.` : null),
        format: (q, v) => v.map((id) => optLabel(q, id)).join(", "),
        requiredMsg: "Pilih minimal satu.",
    },
    yesno: {
        label: "Ya atau tidak", group: "Pilihan", badge: "Y/T", editor: ["yesno"],
        defaults: () => ({ label: "Pertanyaan ya atau tidak", yesLabel: "Ya", noLabel: "Tidak" }),
        control({ q, value, set, id }) {
            const wrap = h("div", { class: "seg" });
            for (const [val, text, ic] of [["yes", cleanLine(q.yesLabel || "Ya", 20), "check"], ["no", cleanLine(q.noLabel || "Tidak", 20), "x"]]) {
                const { input, label } = radioItem({
                    name: id, value: val, checked: value === val, cls: "seg-opt",
                    children: [h("span", { class: "seg-face" }, icon(ic, { size: 16 }), text)],
                });
                label.dataset.v = val;
                input.addEventListener("change", () => input.checked && set(val));
                wrap.appendChild(label);
            }
            return wrap;
        },
        group_: true,
        sanitize: (q, v) => (v === "yes" || v === "no" ? v : null),
        check: () => null,
        format: (q, v) => cleanLine(v === "yes" ? q.yesLabel || "Ya" : q.noLabel || "Tidak", 20),
        requiredMsg: "Pilih salah satu.",
    },
    agree: {
        label: "Persetujuan", group: "Pilihan", badge: "OK", editor: [], inlineLabel: true,
        defaults: () => ({ label: "Saya setuju dengan syarat yang berlaku.", required: true }),
        control({ q, value, set, id, desc }) {
            const cb = h("input", { type: "checkbox", id, name: id, role: "switch", class: "sw-in", checked: value === true, "aria-describedby": desc });
            cb.addEventListener("change", () => set(cb.checked ? true : null));
            return h("label", { class: "sw", for: id }, cb, h("span", { class: "sw-track", "aria-hidden": "true" }, h("span", { class: "sw-thumb" })), h("span", { class: "sw-text" }, q.label));
        },
        sanitize: (q, v) => (v === true ? true : null),
        check: () => null,
        format: () => "Setuju",
        requiredMsg: "Aktifkan persetujuan ini untuk melanjutkan.",
    },
    slider: {
        label: "Slider", group: "Angka dan skala", badge: "-o-", editor: ["range", "affix"],
        defaults: () => ({ label: "Geser untuk memilih", min: 0, max: 100, step: 5, prefix: "", suffix: "" }),
        control({ q, value, set, id, desc }) {
            const min = q.min ?? 0, max = q.max ?? 100, step = q.step ?? 1;
            const span = Math.max(1, max - min);
            const mid = Math.min(max, Math.max(min, Math.round((min + span / 2) / step) * step));
            const rng = h("input", { class: "sld", type: "range", id, name: id, min, max, step, "aria-describedby": desc });
            const out = h("output", { class: "sld-out", for: id });
            const wrap = h("div", { class: "sld-wrap" }, h("div", { class: "sld-top" }, out), rng,
                h("div", { class: "sld-scale", "aria-hidden": "true" }, h("span", null, fmtSlider(q, min)), h("span", null, fmtSlider(q, max))));
            const paint = (n, touched) => {
                rng.value = String(n);
                rng.style.setProperty("--p", ((n - min) / span) * 100 + "%");
                out.textContent = touched ? fmtSlider(q, n) : "Geser untuk memilih";
                wrap.classList.toggle("is-untouched", !touched);
                rng.setAttribute("aria-valuetext", fmtSlider(q, n));
            };
            paint(value ?? mid, value !== null && value !== undefined);
            rng.addEventListener("input", () => {
                const n = Number(rng.value);
                paint(n, true);
                set(n);
            });
            return wrap;
        },
        sanitize: (q, v) => (typeof v === "number" && Number.isFinite(v) ? v : null),
        check: (q, v) => (v >= (q.min ?? 0) && v <= (q.max ?? 100) ? null : "Nilai di luar rentang."),
        format: (q, v) => fmtSlider(q, v),
        requiredMsg: "Geser slider untuk memilih nilai.",
    },
    rating: {
        label: "Rating bintang", group: "Angka dan skala", badge: "5*", editor: ["stars"],
        defaults: () => ({ label: "Beri nilai", stars: 5 }),
        control({ q, value, set, id }) {
            const n = clampInt(q.stars, 3, 10, 5);
            const row = h("div", { class: "rt" });
            const cap = h("span", { class: "rt-cap", "aria-live": "polite" });
            const labels = [];
            let current = value ?? 0;
            const paint = (upto) => labels.forEach((l, i) => l.classList.toggle("on", i < upto));
            const caption = () => (cap.textContent = current ? `${current} dari ${n}${n === 5 ? ", " + RATING_WORDS[current - 1].toLowerCase() : ""}` : "Ketuk bintang untuk menilai");
            for (let i = 1; i <= n; i++) {
                const { input, label } = radioItem({
                    name: id, value: String(i), checked: current === i, cls: "rt-star",
                    children: [icon("star", { size: 34 }), h("span", { class: "sr-only" }, `${i} dari ${n} bintang`)],
                });
                label.addEventListener("mouseenter", () => paint(i));
                input.addEventListener("change", () => {
                    current = i;
                    set(i);
                    paint(i);
                    caption();
                });
                labels.push(label);
                row.appendChild(label);
            }
            row.addEventListener("mouseleave", () => paint(current));
            paint(current);
            caption();
            return h("div", { class: "rt-wrap" }, row, cap);
        },
        group_: true,
        sanitize: (q, v) => (Number.isInteger(v) && v >= 1 && v <= clampInt(q.stars, 3, 10, 5) ? v : null),
        check: () => null,
        format: (q, v) => `${v} dari ${clampInt(q.stars, 3, 10, 5)} bintang`,
        requiredMsg: "Beri nilai dengan menekan bintang.",
    },
    nps: {
        label: "Skala 0 sampai 10", group: "Angka dan skala", badge: "0-10", editor: [],
        defaults: () => ({ label: "Seberapa besar kemungkinan Anda merekomendasikan kami?" }),
        control({ value, set, id }) {
            const row = h("div", { class: "nps" });
            for (let i = 0; i <= 10; i++) {
                const { input, label } = radioItem({
                    name: id, value: String(i), checked: value === i, cls: "nps-opt",
                    children: [h("span", { class: "nps-face" }, String(i))],
                });
                input.addEventListener("change", () => input.checked && set(i));
                row.appendChild(label);
            }
            return h("div", null, row, h("div", { class: "nps-anchors", "aria-hidden": "true" }, h("span", null, "Tidak mungkin"), h("span", null, "Sangat mungkin")));
        },
        group_: true,
        sanitize: (q, v) => (Number.isInteger(v) && v >= 0 && v <= 10 ? v : null),
        check: () => null,
        format: (q, v) => `${v} dari 10`,
        requiredMsg: "Pilih angka dari 0 sampai 10.",
    },
    emoji: {
        label: "Skala ekspresi", group: "Angka dan skala", badge: ":)", editor: [],
        defaults: () => ({ label: "Bagaimana kesan Anda?" }),
        control({ value, set, id }) {
            const MOUTH = ["M8 17c1.3-2.2 6.7-2.2 8 0", "M8.5 16.5c1.2-1.3 5.8-1.3 7 0", "M9 16h6", "M8.5 14.8c1.2 1.4 5.8 1.4 7 0", "M8 14c1.3 2.6 6.7 2.6 8 0"];
            const COLOR = ["#c92f4c", "#c76a1f", "#6b7390", "#2f8a5f", "#11805a"];
            const row = h("div", { class: "emo-row" });
            for (let i = 0; i < 5; i++) {
                const face = svg("svg", { viewBox: "0 0 24 24", width: 40, height: 40, fill: "none", stroke: "currentColor", "stroke-width": 1.7, "stroke-linecap": "round", "aria-hidden": "true", focusable: "false" },
                    svg("circle", { cx: 12, cy: 12, r: 9.5 }), svg("circle", { cx: 9, cy: 10, r: 0.9, fill: "currentColor", stroke: "none" }),
                    svg("circle", { cx: 15, cy: 10, r: 0.9, fill: "currentColor", stroke: "none" }), svg("path", { d: MOUTH[i] }));
                const { input, label } = radioItem({
                    name: id, value: String(i + 1), checked: value === i + 1, cls: "emo",
                    children: [h("span", { class: "emo-face" }, face), h("span", { class: "emo-cap" }, EMOJI_WORDS[i])],
                });
                label.style.setProperty("--emo", COLOR[i]);
                input.addEventListener("change", () => input.checked && set(i + 1));
                row.appendChild(label);
            }
            return row;
        },
        group_: true,
        sanitize: (q, v) => (Number.isInteger(v) && v >= 1 && v <= 5 ? v : null),
        check: () => null,
        format: (q, v) => EMOJI_WORDS[v - 1],
        requiredMsg: "Pilih salah satu ekspresi.",
    },
    ranking: {
        label: "Urutan prioritas", group: "Lainnya", badge: "1-2", editor: ["options"], noRequired: true,
        defaults: () => ({ label: "Urutkan dari yang paling penting", options: defaultOptions(4), required: false }),
        control({ q, value, set, desc }) {
            const all = opts(q);
            let order = Array.isArray(value) ? value.slice() : all.map((o) => o.id);
            const list = h("ol", { class: "rank", "aria-describedby": desc });
            const live = h("p", { class: "sr-only", role: "status", "aria-live": "polite" });
            const render = (focusId, focusDir) => {
                list.replaceChildren();
                order.forEach((oid, i) => {
                    const o = optById(q, oid);
                    if (!o) return;
                    const btn = (dir, ic, txt, disabled) => {
                        const b = h("button", { type: "button", class: "rk-btn", "aria-label": `${txt} ${o.label}`, disabled }, icon(ic, { size: 16 }));
                        b.addEventListener("click", () => move(oid, dir));
                        b.dataset.dir = dir;
                        return b;
                    };
                    const li = h("li", { class: "rk-item" }, h("span", { class: "rk-n", "aria-hidden": "true" }, String(i + 1)), h("span", { class: "rk-t" }, o.label),
                        h("span", { class: "rk-btns" }, btn("up", "up", "Naikkan", i === 0), btn("down", "down", "Turunkan", i === order.length - 1)));
                    li.dataset.o = oid;
                    list.appendChild(li);
                });
                if (focusId) {
                    const li = [...list.children].find((x) => x.dataset.o === focusId);
                    const btns = li ? [...li.querySelectorAll("button")] : [];
                    (btns.find((b) => b.dataset.dir === focusDir && !b.disabled) || btns.find((b) => !b.disabled))?.focus();
                }
            };
            const move = (oid, dir) => {
                const i = order.indexOf(oid), j = dir === "up" ? i - 1 : i + 1;
                if (i < 0 || j < 0 || j >= order.length) return;
                [order[i], order[j]] = [order[j], order[i]];
                render(oid, dir);
                set(order.slice());
                live.textContent = `${optLabel(q, oid)} sekarang di posisi ${j + 1} dari ${order.length}.`;
            };
            order = order.filter((id) => optById(q, id));
            for (const o of all) if (!order.includes(o.id)) order.push(o.id);
            render();
            return h("div", null, list, live);
        },
        group_: true,
        sanitize(q, v) {
            if (!Array.isArray(v)) return null;
            const ok = v.filter((id) => optById(q, id));
            for (const o of opts(q)) if (!ok.includes(o.id)) ok.push(o.id);
            return ok.length ? ok : null;
        },
        check: () => null,
        format: (q, v) => v.map((id, i) => `${i + 1}. ${optLabel(q, id)}`).join("\n"),
    },
    file: {
        label: "Unggah berkas", group: "Lainnya", badge: "pdf", editor: ["maxFiles"],
        defaults: () => ({ label: "Unggah berkas pendukung", maxFiles: 3 }),
        control({ q, value, set, id, desc }) {
            const maxFiles = clampInt(q.maxFiles, 1, 5, 3);
            let files = Array.isArray(value) ? value.map((f) => ({ ...f })) : [];
            const input = h("input", { type: "file", id, name: id, accept: ".pdf,.jpg,.jpeg,.png,.webp", multiple: true, class: "dz-in", "aria-describedby": desc });
            const dz = h("label", { class: "dz", for: id }, icon("upload", { size: 22 }),
                h("span", { class: "dz-t" }, h("strong", null, "Pilih berkas"), " atau tarik ke sini"),
                h("span", { class: "dz-s" }, `Maksimal ${maxFiles} berkas, 5 MB per berkas`));
            const list = h("ul", { class: "dz-list" });
            const err = h("p", { class: "dz-err", role: "alert", hidden: true });
            const note = h("p", { class: "dz-note" }, icon("lock", { size: 14 }), "Demo: berkas tidak diunggah ke mana pun, hanya nama dan ukurannya yang dicatat.");
            const draw = () => {
                list.replaceChildren();
                files.forEach((f, i) => {
                    const rm = h("button", { type: "button", class: "rk-btn", "aria-label": `Hapus ${f.name}` }, icon("x", { size: 16 }));
                    rm.addEventListener("click", () => {
                        files.splice(i, 1);
                        draw();
                        set(files.length ? files.map((x) => ({ ...x })) : null);
                    });
                    list.appendChild(h("li", { class: "dz-item" }, icon("file", { size: 18 }), h("span", { class: "dz-name" }, f.name), h("span", { class: "dz-size" }, fmtBytes(f.size)), rm));
                });
            };
            const ingest = (fileList) => {
                const problems = [];
                for (const f of Array.from(fileList || [])) {
                    const cleaned = cleanLine(String(f.name).split(/[\\/]/).pop() || "", 200);
                    const dot = cleaned.lastIndexOf(".");
                    const ext = dot > 0 ? cleaned.slice(dot + 1).toLowerCase() : "";
                    if (files.length >= maxFiles) { problems.push(`Maksimal ${maxFiles} berkas.`); break; }
                    if (!FILE_EXT.includes(ext) || (f.type && !FILE_MIME.test(f.type))) { problems.push(`${shortName(cleaned)}: jenis berkas tidak didukung.`); continue; }
                    if (f.size <= 0 || f.size > MAX_FILE_BYTES) { problems.push(`${shortName(cleaned)}: ukuran harus 1 byte sampai 5 MB.`); continue; }
                    if (files.some((x) => x.name === shortName(cleaned) && x.size === f.size)) continue;
                    files.push({ name: shortName(cleaned), size: f.size });
                }
                err.hidden = problems.length === 0;
                err.textContent = problems.join(" ");
                draw();
                set(files.length ? files.map((x) => ({ ...x })) : null);
            };
            input.addEventListener("change", () => {
                ingest(input.files);
                input.value = "";
            });
            dz.addEventListener("dragover", (e) => (e.preventDefault(), dz.classList.add("drag")));
            dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
            dz.addEventListener("drop", (e) => {
                e.preventDefault();
                dz.classList.remove("drag");
                ingest(e.dataTransfer?.files);
            });
            draw();
            return h("div", { class: "dz-wrap" }, input, dz, err, list, note);
        },
        group_: true,
        sanitize(q, v) {
            if (!Array.isArray(v)) return null;
            const ok = v.filter((f) => f && typeof f.name === "string" && Number.isFinite(f.size)).slice(0, clampInt(q.maxFiles, 1, 5, 3))
                .map((f) => ({ name: cleanLine(f.name, 64), size: Math.max(0, Math.trunc(f.size)) }));
            return ok.length ? ok : null;
        },
        check: () => null,
        format: (q, v) => v.map((f) => `${f.name} (${fmtBytes(f.size)})`).join("\n"),
    },
    matrix: {
        label: "Matriks penilaian", group: "Lainnya", badge: "3x3", editor: ["matrix"],
        defaults: () => ({
            label: "Nilai setiap aspek berikut",
            rows: [{ id: "r1", label: "Aspek pertama" }, { id: "r2", label: "Aspek kedua" }],
            cols: [{ id: "c1", label: "Kurang" }, { id: "c2", label: "Cukup" }, { id: "c3", label: "Baik" }],
        }),
        control({ q, value, set, id }) {
            const rows = Array.isArray(q.rows) ? q.rows : [], cols = Array.isArray(q.cols) ? q.cols : [];
            const state = new Map(Object.entries(value || {}));
            const wrap = h("div", { class: "mx", vars: { cols: cols.length } });
            wrap.appendChild(h("div", { class: "mx-head", "aria-hidden": "true" }, h("span"), cols.map((c) => h("span", null, c.label))));
            for (const r of rows) {
                const lab = domId("mxl");
                const grp = h("div", { class: "mx-row", role: "radiogroup", "aria-labelledby": lab });
                const colsEl = h("div", { class: "mx-cols" });
                for (const c of cols) {
                    const { input, label } = radioItem({
                        name: `${id}-${r.id}`, value: c.id, checked: state.get(r.id) === c.id, cls: "mx-opt",
                        children: [h("span", { class: "mx-dot", "aria-hidden": "true" }), h("span", { class: "mx-lab" }, c.label)],
                    });
                    input.addEventListener("change", () => {
                        if (!input.checked) return;
                        state.set(r.id, c.id);
                        set(Object.fromEntries(state));
                    });
                    colsEl.appendChild(label);
                }
                grp.append(h("span", { class: "mx-q", id: lab }, r.label), colsEl);
                wrap.appendChild(grp);
            }
            return wrap;
        },
        group_: true,
        sanitize(q, v) {
            if (!v || typeof v !== "object" || Array.isArray(v)) return null;
            const out = {};
            for (const r of q.rows || []) {
                const c = Object.hasOwn(v, r.id) ? v[r.id] : undefined;
                if ((q.cols || []).some((x) => x.id === c)) out[r.id] = c;
            }
            return Object.keys(out).length ? out : null;
        },
        check: (q, v) => (q.required && (q.rows || []).some((r) => !Object.hasOwn(v, r.id)) ? "Lengkapi penilaian di setiap baris." : null),
        format: (q, v) => (q.rows || []).filter((r) => Object.hasOwn(v, r.id)).map((r) => `${r.label}: ${(q.cols || []).find((c) => c.id === v[r.id])?.label ?? ""}`).join("\n"),
        requiredMsg: "Lengkapi penilaian di setiap baris.",
    },
};

export const TYPE_ORDER = ["short", "long", "email", "phone", "select", "radio", "checkbox", "yesno", "agree", "number", "slider", "rating", "nps", "emoji", "date", "ranking", "file", "matrix"];
export const GROUPS = ["Teks", "Pilihan", "Angka dan skala", "Lainnya"];

export function defaultOptions(n) {
    return Array.from({ length: n }, (_, i) => ({ id: `o${i + 1}`, label: `Opsi ${i + 1}` }));
}

function fmtBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

function shortName(name) {
    if (name.length <= 60) return name;
    const dot = name.lastIndexOf(".");
    const ext = dot > 0 && name.length - dot <= 8 ? name.slice(dot) : "";
    return name.slice(0, 58 - ext.length) + "…" + ext;
}

// ---------- API untuk pengisi formulir ----------

export const typeOf = (q) => (Object.hasOwn(TYPES, q.type) ? TYPES[q.type] : null);

/** Nilai yang sah terhadap definisi pertanyaan saat ini (atau null). */
export function cleanValue(q, v) {
    const t = typeOf(q);
    return t ? t.sanitize(q, v) : null;
}

/** @returns {string | null} pesan error, atau null bila valid */
export function validateQuestion(q, raw) {
    const t = typeOf(q);
    if (!t) return null;
    const v = cleanValue(q, raw);
    if (isEmpty(v)) return q.required && !t.noRequired ? t.requiredMsg || "Pertanyaan ini wajib diisi." : null;
    return t.check(q, v);
}

export function formatValue(q, raw) {
    const t = typeOf(q);
    const v = cleanValue(q, raw);
    if (!t || isEmpty(v)) return "";
    return t.format(q, v);
}

export function isVisible(q, answers) {
    if (!q.showIf) return true;
    return answers.get(q.showIf.q) === q.showIf.eq;
}

/**
 * Membuat satu blok pertanyaan lengkap (label, bantuan, kontrol, pesan error).
 * @returns {{el: HTMLElement, setError: (msg: string | null) => void, focus: () => void}}
 */
export function buildQuestion(q, { value, set }) {
    const t = typeOf(q);
    const id = domId("f");
    const helpId = id + "-h", errId = id + "-e";
    const desc = (q.help ? helpId + " " : "") + errId;
    const isGroup = Boolean(t?.group_);
    const isInline = Boolean(t?.inlineLabel);

    const cleaned = cleanValue(q, value);
    const control = t ? t.control({ q, value: cleaned, set, id, desc }) : h("p", null, "Tipe pertanyaan tidak dikenal.");
    const req = q.required && !t?.noRequired;
    const labelKids = [h("span", { class: "q-text" }, q.label), req ? h("span", { class: "q-req", "aria-hidden": "true" }, "*") : null,
        req ? h("span", { class: "sr-only" }, " (wajib diisi)") : !isInline && !t?.noRequired ? h("span", { class: "q-opt" }, "Opsional") : null];

    const errText = h("span", { class: "q-err-text" });
    const err = h("p", { class: "q-err", id: errId, role: "alert", hidden: true }, icon("alert", { size: 16 }), errText);
    const help = q.help ? h("p", { class: "q-help", id: helpId }, q.help) : null;

    let body;
    if (isGroup) {
        body = h("fieldset", { class: "q-body", "aria-describedby": desc }, h("legend", { class: "q-label" }, labelKids), help, control, err);
    } else if (isInline) {
        body = h("div", { class: "q-body" }, help, control, err);
    } else {
        body = h("div", { class: "q-body" }, h("label", { class: "q-label", for: id }, labelKids), help, control, err);
    }
    const el = h("div", { class: "q" + (isInline ? " q-inline" : "") }, body);
    el.dataset.q = q.id;

    return {
        el,
        setError(msg) {
            err.hidden = !msg;
            errText.textContent = msg || "";
            el.classList.toggle("has-error", Boolean(msg));
            const first = el.querySelector("input:not([type=hidden]), select, textarea");
            if (first && !isGroup) first.setAttribute("aria-invalid", msg ? "true" : "false");
        },
        focus() {
            const target = el.querySelector("input:not(:disabled), select, textarea, button:not(:disabled)");
            target?.focus({ preventScroll: true });
            el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        },
    };
}
