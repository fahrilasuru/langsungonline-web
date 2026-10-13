// Pembuat formulir: mengedit skema yang sama dengan yang dirender di tab "Isi formulir".
// Semua teks buatan pengguna hanya masuk lewat value/textContent, tidak pernah sebagai HTML.
// Id internal dibuat oleh kode ini (bukan dari input), dan jumlah item dibatasi (LIMITS).

import { h, icon, cleanLine, clampInt, toast, openDialog, copyText, showView } from "./_ui.js";
import { getForm, replaceForm, touchForm, seedForm, allQuestions, LIMITS, subscribeForm } from "./_data.js";
import { TYPES, TYPE_ORDER, GROUPS, typeOf } from "./_fields.js";

const $ = (id) => document.getElementById(id);
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let expanded = null; // id pertanyaan yang sedang dibuka
let activeSection = null; // id bagian tujuan "tambah pertanyaan"
let counter = 0;

const form = () => getForm();
const snapshot = () => structuredClone(getForm());
const findLoc = (id) => {
    for (const s of form().sections) {
        const i = s.questions.findIndex((q) => q.id === id);
        if (i >= 0) return { sec: s, i };
    }
    return null;
};

function nextId(prefix) {
    const used = new Set([...allQuestions().map((q) => q.id), ...form().sections.map((s) => s.id)]);
    let id;
    do id = `${prefix}_n${++counter}`; while (used.has(id));
    return id;
}

function nextItemId(list, prefix) {
    const max = list.reduce((m, o) => Math.max(m, Number(String(o.id).slice(prefix.length)) || 0), 0);
    return `${prefix}${max + 1}`;
}

export function initBuilder() {
    if (!$("builderCanvas")) return;
    buildPalette();
    $("bTitle").addEventListener("input", (e) => {
        form().title = cleanLine(e.target.value, LIMITS.formTitle) || "Formulir tanpa judul";
        touchForm();
    });
    $("bDesc").addEventListener("input", (e) => {
        form().description = cleanLine(e.target.value, LIMITS.formDesc);
        touchForm();
    });
    $("btnAddSection").addEventListener("click", addSection);
    $("btnJson").addEventListener("click", showJson);
    $("btnJsonCopy").addEventListener("click", async () => toast((await copyText($("jsonPre").textContent || "")) ? "JSON disalin." : "Tidak bisa menyalin otomatis."));
    $("btnPreview").addEventListener("click", () => showView("isi"));
    $("btnResetForm").addEventListener("click", () => {
        const before = snapshot();
        replaceForm(seedForm());
        expanded = null;
        activeSection = null;
        syncHeader();
        render();
        toast("Formulir dikembalikan ke contoh awal.", { label: "Urungkan", run: () => (replaceForm(before), syncHeader(), render()) });
    });
    const mq = matchMedia("(min-width: 900px)");
    const sync = () => ($("palette").open = mq.matches);
    mq.addEventListener("change", sync);
    sync();
    subscribeForm(updateStats);
    syncHeader();
    render();
}

function syncHeader() {
    $("bTitle").value = form().title;
    $("bDesc").value = form().description;
}

// ---------- Palet ----------

function buildPalette() {
    const host = $("paletteList");
    host.replaceChildren();
    for (const g of GROUPS) {
        const types = TYPE_ORDER.filter((k) => TYPES[k].group === g);
        host.appendChild(h("div", { class: "pal-group" }, h("p", { class: "pal-title" }, g),
            h("div", { class: "pal-grid" }, types.map((k) => {
                const b = h("button", { type: "button", class: "pal-btn" }, h("span", { class: "pal-badge", "aria-hidden": "true" }, TYPES[k].badge), h("span", { class: "pal-name" }, TYPES[k].label));
                b.addEventListener("click", () => addQuestion(k));
                return b;
            }))));
    }
}

// ---------- Aksi ----------

function addQuestion(type) {
    if (!Object.hasOwn(TYPES, type)) return;
    if (allQuestions().length >= LIMITS.questions) return toast(`Demo ini dibatasi ${LIMITS.questions} pertanyaan.`);
    const sec = form().sections.find((s) => s.id === activeSection) || form().sections[form().sections.length - 1];
    const q = { id: nextId("q"), type, required: false, ...structuredClone(TYPES[type].defaults()) };
    sec.questions.push(q);
    expanded = q.id;
    activeSection = sec.id;
    touchForm();
    render();
    if (!matchMedia("(min-width: 900px)").matches) $("palette").open = false;
    focusCard(q.id, true);
    toast(`${TYPES[type].label} ditambahkan ke bagian ${sec.title}.`);
}

function removeQuestion(q) {
    const loc = findLoc(q.id);
    if (!loc) return;
    const before = snapshot();
    loc.sec.questions.splice(loc.i, 1);
    for (const o of allQuestions()) if (o.showIf?.q === q.id) delete o.showIf;
    if (expanded === q.id) expanded = null;
    touchForm();
    render();
    toast("Pertanyaan dihapus.", { label: "Urungkan", run: () => (replaceForm(before), render()) });
}

function moveQuestion(q, dir) {
    const loc = findLoc(q.id);
    if (!loc) return;
    const j = loc.i + dir;
    if (j < 0 || j >= loc.sec.questions.length) return;
    [loc.sec.questions[loc.i], loc.sec.questions[j]] = [loc.sec.questions[j], loc.sec.questions[loc.i]];
    touchForm();
    render();
    focusCard(q.id, false, dir < 0 ? "up" : "down");
}

function duplicateQuestion(q) {
    if (allQuestions().length >= LIMITS.questions) return toast(`Demo ini dibatasi ${LIMITS.questions} pertanyaan.`);
    const loc = findLoc(q.id);
    if (!loc) return;
    const copy = structuredClone(q);
    copy.id = nextId("q");
    copy.label = cleanLine(`${q.label} (salinan)`, LIMITS.label);
    delete copy.showIf;
    loc.sec.questions.splice(loc.i + 1, 0, copy);
    expanded = copy.id;
    touchForm();
    render();
    focusCard(copy.id, false);
}

function addSection() {
    if (form().sections.length >= LIMITS.sections) return toast(`Maksimal ${LIMITS.sections} bagian pada demo ini.`);
    const s = { id: nextId("s"), title: `Bagian ${form().sections.length + 1}`, desc: "", questions: [] };
    form().sections.push(s);
    activeSection = s.id;
    touchForm();
    render();
    const el = [...document.querySelectorAll(".bs")].find((x) => x.dataset.sid === s.id);
    el?.querySelector("input")?.focus();
    el?.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
}

function removeSection(sec) {
    if (form().sections.length <= 1) return;
    const before = snapshot();
    const ids = new Set(sec.questions.map((q) => q.id));
    form().sections = form().sections.filter((s) => s !== sec);
    for (const o of allQuestions()) if (o.showIf && ids.has(o.showIf.q)) delete o.showIf;
    if (activeSection === sec.id) activeSection = null;
    touchForm();
    render();
    toast(`Bagian "${sec.title}" dihapus.`, { label: "Urungkan", run: () => (replaceForm(before), render()) });
}

function focusCard(id, scroll, dir) {
    const el = [...document.querySelectorAll(".qc")].find((x) => x.dataset.qid === id);
    if (!el) return;
    if (dir) (el.querySelector(`[data-act="${dir}"]:not(:disabled)`) || el.querySelector(".qc-act:not(:disabled)"))?.focus();
    else if (scroll) el.querySelector(".qc-edit input")?.focus({ preventScroll: true });
    if (scroll || !dir) el.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
}

function showJson() {
    $("jsonPre").textContent = JSON.stringify(form(), null, 2);
    openDialog($("jsonDlg"));
}

// ---------- Render kanvas ----------

function updateStats() {
    const n = allQuestions().length;
    $("bStats").textContent = `${n} pertanyaan di ${form().sections.length} bagian, sekitar ${Math.max(1, Math.round(n * 0.22))} menit untuk diisi`;
    const sec = form().sections.find((s) => s.id === activeSection) || form().sections[form().sections.length - 1];
    $("bActive").textContent = sec ? `Pertanyaan baru masuk ke bagian: ${sec.title}` : "";
}

function render() {
    const canvas = $("builderCanvas");
    canvas.replaceChildren();
    form().sections.forEach((sec, si) => {
        const isActive = (activeSection ?? form().sections[form().sections.length - 1].id) === sec.id;
        const title = h("input", { class: "inp inp-sm", type: "text", maxlength: LIMITS.sectionTitle, "aria-label": `Judul bagian ${si + 1}` });
        title.value = sec.title;
        title.addEventListener("input", () => {
            sec.title = cleanLine(title.value, LIMITS.sectionTitle) || `Bagian ${si + 1}`;
            touchForm();
        });
        const desc = h("input", { class: "inp inp-sm", type: "text", maxlength: LIMITS.formDesc, placeholder: "Deskripsi bagian (opsional)", "aria-label": `Deskripsi bagian ${si + 1}` });
        desc.value = sec.desc || "";
        desc.addEventListener("input", () => {
            sec.desc = cleanLine(desc.value, LIMITS.formDesc);
            touchForm();
        });
        const pick = h("button", { type: "button", class: "link-btn", "aria-pressed": String(isActive) }, isActive ? "Tujuan pertanyaan baru" : "Jadikan tujuan");
        pick.addEventListener("click", () => {
            activeSection = sec.id;
            render();
        });
        const del = h("button", { type: "button", class: "icon-btn danger", "aria-label": `Hapus bagian ${sec.title}`, disabled: form().sections.length <= 1 }, icon("trash", { size: 16 }));
        del.addEventListener("click", () => removeSection(sec));
        const box = h("section", { class: "bs" + (isActive ? " is-active" : ""), "aria-label": `Bagian ${si + 1}` },
            h("div", { class: "bs-head" }, h("span", { class: "bs-n", "aria-hidden": "true" }, String(si + 1)), h("div", { class: "bs-fields" }, title, desc), pick, del),
            h("div", { class: "bs-list" }, sec.questions.length ? sec.questions.map((q, qi) => card(q, sec, qi)) : h("p", { class: "empty" }, "Belum ada pertanyaan. Pilih tipe jawaban di palet untuk menambahkannya.")));
        box.dataset.sid = sec.id;
        canvas.appendChild(box);
    });
    $("btnAddSection").disabled = form().sections.length >= LIMITS.sections;
    updateStats();
}

function card(q, sec, qi) {
    const t = typeOf(q);
    const open = expanded === q.id;
    const label = h("span", { class: "qc-label" }, q.label);
    const head = h("button", { type: "button", class: "qc-head", "aria-expanded": String(open) },
        h("span", { class: "pal-badge", "aria-hidden": "true" }, t?.badge ?? "?"),
        h("span", { class: "qc-main" }, label, h("span", { class: "qc-meta" }, `${t?.label ?? "Tidak dikenal"}${q.required && !t?.noRequired ? ", wajib" : ""}${q.showIf ? ", bersyarat" : ""}`)),
        icon(open ? "up" : "down", { size: 18, cls: "qc-chev" }));
    head.addEventListener("click", () => {
        expanded = expanded === q.id ? null : q.id;
        render();
        if (expanded) focusCard(q.id, false);
    });
    const act = (name, ic, text, fn, disabled = false) => {
        const b = h("button", { type: "button", class: "icon-btn qc-act" + (name === "del" ? " danger" : ""), "aria-label": `${text}: ${q.label}`, disabled, "data-act": name }, icon(ic, { size: 16 }));
        b.addEventListener("click", fn);
        return b;
    };
    const el = h("article", { class: "qc" + (open ? " is-open" : "") }, h("div", { class: "qc-bar" }, head,
        h("div", { class: "qc-acts" },
            act("up", "up", "Naikkan", () => moveQuestion(q, -1), qi === 0), act("down", "down", "Turunkan", () => moveQuestion(q, 1), qi === sec.questions.length - 1),
            act("dup", "copy", "Gandakan", () => duplicateQuestion(q)), act("del", "trash", "Hapus", () => removeQuestion(q)))));
    el.dataset.qid = q.id;
    if (open) el.appendChild(editor(q, label, head));
    return el;
}

// ---------- Editor pertanyaan ----------

let fieldSeq = 0;
function field(labelText, control, hint) {
    const id = `bf${++fieldSeq}`;
    control.id = id;
    return h("div", { class: "fld" }, h("label", { class: "fld-label", for: id }, labelText), control, hint ? h("p", { class: "fld-hint" }, hint) : null);
}

function textInput(value, max, onInput, placeholder) {
    const el = h("input", { class: "inp inp-sm", type: "text", maxlength: max, placeholder: placeholder || false });
    el.value = value ?? "";
    el.addEventListener("input", () => onInput(cleanLine(el.value, max)));
    return el;
}

function numberInput(value, min, max, onChange) {
    const el = h("input", { class: "inp inp-sm", type: "number", inputmode: "numeric", min, max });
    el.value = value === undefined || value === null ? "" : String(value);
    el.addEventListener("change", () => {
        const n = clampInt(el.value, min, max, value ?? min);
        el.value = String(n);
        onChange(n);
    });
    return el;
}

function switchRow(text, checked, onChange) {
    const cb = h("input", { type: "checkbox", role: "switch", class: "sw-in", checked });
    cb.addEventListener("change", () => onChange(cb.checked));
    return h("label", { class: "sw sw-sm" }, cb, h("span", { class: "sw-track", "aria-hidden": "true" }, h("span", { class: "sw-thumb" })), h("span", { class: "sw-text" }, text));
}

function listEditor({ title, items, min, max, prefix, addLabel }) {
    const host = h("div", { class: "lst" });
    const draw = (focusIndex) => {
        host.replaceChildren(h("p", { class: "fld-label" }, title));
        items.forEach((it, i) => {
            const inp = h("input", { class: "inp inp-sm", type: "text", maxlength: LIMITS.option, "aria-label": `${title} ${i + 1}` });
            inp.value = it.label;
            inp.addEventListener("input", () => {
                it.label = cleanLine(inp.value, LIMITS.option) || `Opsi ${i + 1}`;
                touchForm();
            });
            const rm = h("button", { type: "button", class: "icon-btn danger", "aria-label": `Hapus ${title.toLowerCase()} ${i + 1}`, disabled: items.length <= min }, icon("x", { size: 16 }));
            rm.addEventListener("click", () => {
                items.splice(i, 1);
                touchForm();
                draw(Math.max(0, i - 1));
            });
            host.appendChild(h("div", { class: "lst-row" }, inp, rm));
        });
        const add = h("button", { type: "button", class: "link-btn", disabled: items.length >= max }, icon("plus", { size: 14 }), addLabel);
        add.addEventListener("click", () => {
            items.push({ id: nextItemId(items, prefix), label: `${addLabel.replace(/^Tambah /, "").replace(/^./, (c) => c.toUpperCase())} ${items.length + 1}` });
            touchForm();
            draw(items.length - 1);
        });
        host.appendChild(add);
        if (focusIndex !== undefined) host.querySelectorAll(".lst-row input")[focusIndex]?.focus();
    };
    draw();
    return host;
}

function editor(q, labelEl) {
    const t = typeOf(q);
    const kids = [];
    kids.push(field("Pertanyaan", textInput(q.label, LIMITS.label, (v) => {
        q.label = v || "Pertanyaan tanpa judul";
        labelEl.textContent = q.label;
        touchForm();
    })));
    if (!t?.inlineLabel) kids.push(field("Keterangan (opsional)", textInput(q.help, LIMITS.help, (v) => ((q.help = v), touchForm()))));
    const ed = t?.editor ?? [];
    if (ed.includes("placeholder")) kids.push(field("Teks contoh di dalam kolom", textInput(q.placeholder, 80, (v) => ((q.placeholder = v), touchForm()))));
    if (ed.includes("maxLength")) kids.push(field("Panjang maksimal (karakter)", numberInput(q.maxLength ?? 80, 1, q.type === "long" ? 2000 : 200, (n) => ((q.maxLength = n), touchForm()))));
    if (ed.includes("options")) kids.push(listEditor({ title: "Opsi", items: q.options, min: 2, max: LIMITS.options, prefix: "o", addLabel: "Tambah opsi" }));
    if (ed.includes("variant")) {
        const sel = h("select", { class: "inp inp-sm" }, t.variants.map(([v, text]) => h("option", { value: v }, text)));
        sel.value = q.variant || t.variants[0][0];
        sel.addEventListener("change", () => ((q.variant = Object.hasOwn(Object.fromEntries(t.variants), sel.value) ? sel.value : t.variants[0][0]), touchForm()));
        kids.push(field("Tampilan", sel));
    }
    if (ed.includes("maxSel")) kids.push(field("Batas pilihan (0 = tanpa batas)", numberInput(q.maxSel ?? 0, 0, q.options.length, (n) => ((q.maxSel = n || undefined), touchForm()))));
    if (ed.includes("range")) {
        const range = h("div", { class: "fld-row" });
        const lo = numberInput(q.min ?? 0, 0, 1000000, (n) => ((q.min = Math.min(n, (q.max ?? 100) - 1)), touchForm(), (lo.value = String(q.min))));
        const hi = numberInput(q.max ?? 100, 1, 1000000, (n) => ((q.max = Math.max(n, (q.min ?? 0) + 1)), touchForm(), (hi.value = String(q.max))));
        range.append(field("Nilai terkecil", lo), field("Nilai terbesar", hi));
        if (q.type === "slider") {
            const st = numberInput(q.step ?? 1, 1, 100000, (n) => {
                const span = (q.max ?? 100) - (q.min ?? 0);
                q.step = Math.min(Math.max(n, Math.ceil(span / 1000)), span);
                st.value = String(q.step);
                touchForm();
            });
            range.append(field("Kelipatan", st));
        }
        kids.push(range);
    }
    if (ed.includes("affix")) {
        const row = h("div", { class: "fld-row" });
        if (q.type === "slider") row.append(field("Awalan nilai", textInput(q.prefix, 12, (v) => ((q.prefix = v ? v + (v.endsWith(" ") ? "" : " ") : ""), touchForm()))));
        row.append(field("Satuan di belakang", textInput((q.suffix || "").trim(), 12, (v) => ((q.suffix = v ? (q.type === "slider" ? " " + v : v) : ""), touchForm()))));
        kids.push(row);
    }
    if (ed.includes("stars")) kids.push(field("Jumlah bintang", numberInput(q.stars ?? 5, 3, 10, (n) => ((q.stars = n), touchForm()))));
    if (ed.includes("maxFiles")) kids.push(field("Maksimal berkas", numberInput(q.maxFiles ?? 3, 1, 5, (n) => ((q.maxFiles = n), touchForm()))));
    if (ed.includes("yesno")) kids.push(h("div", { class: "fld-row" }, field("Label untuk Ya", textInput(q.yesLabel, 20, (v) => ((q.yesLabel = v || "Ya"), touchForm()))), field("Label untuk Tidak", textInput(q.noLabel, 20, (v) => ((q.noLabel = v || "Tidak"), touchForm())))));
    if (ed.includes("matrix")) {
        kids.push(listEditor({ title: "Baris", items: q.rows, min: 1, max: 8, prefix: "r", addLabel: "Tambah baris" }));
        kids.push(listEditor({ title: "Kolom", items: q.cols, min: 2, max: 6, prefix: "c", addLabel: "Tambah kolom" }));
    }
    if (!t?.noRequired) {
        kids.push(switchRow(t?.inlineLabel ? "Wajib disetujui" : "Wajib diisi", q.required === true, (on) => {
            q.required = on;
            touchForm();
            const meta = labelEl.closest(".qc")?.querySelector(".qc-meta");
            if (meta) meta.textContent = `${t.label}${on ? ", wajib" : ""}${q.showIf ? ", bersyarat" : ""}`;
        }));
    }
    if (q.showIf) kids.push(h("p", { class: "fld-hint" }, icon("info", { size: 14 }), "Pertanyaan ini hanya tampil jika jawaban sebelumnya cocok."));
    return h("div", { class: "qc-edit" }, kids);
}
