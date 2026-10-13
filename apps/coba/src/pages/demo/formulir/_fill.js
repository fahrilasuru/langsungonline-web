// Tampilan responden: formulir bertahap, validasi, tinjauan, dan layar sukses.
// Semua jawaban hanya hidup di memori halaman. Tidak ada request jaringan.

import { h, icon, domId, fmtTime, randomCode, copyText, toast, showView, onViewChange, getView } from "./_ui.js";
import { getForm, subscribeForm, addResponse, getResponses, allQuestions } from "./_data.js";
import { buildQuestion, validateQuestion, formatValue, cleanValue, isVisible, isEmpty, typeOf } from "./_fields.js";

const $ = (id) => document.getElementById(id);
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const CONSENT = Object.freeze({
    id: "consent",
    type: "agree",
    label: "Saya setuju RuangRapi Interior menghubungi saya terkait permintaan ini.",
    help: "Data Anda hanya dipakai untuk menjawab permintaan ini. Anda bisa berhenti dihubungi kapan saja.",
    required: true,
});

/** @type {Map<string, any>} */
const answers = new Map();
/** @type {Map<string, {el: HTMLElement, setError: (m: string | null) => void, focus: () => void}>} */
const built = new Map();
const touched = new Set(); // pertanyaan yang pernah disentuh responden
const shown = new Set(); // pertanyaan yang sedang menampilkan error
let step = 0;
let reached = 0;
let done = false;
let sending = false;
let stale = false;
let honeypot = null;
let lastRef = "";
let lastName = "";

const sections = () => getForm().sections;
const lastStep = () => sections().length; // indeks langkah "Tinjau"

export function initFill() {
    const formEl = $("fillForm");
    if (!formEl) return;
    formEl.addEventListener("submit", (e) => {
        e.preventDefault(); // tidak ada pengiriman nyata: ini mockup
        if (!done) advance();
    });
    subscribeForm(() => {
        stale = true;
        if (getView() === "isi") renderAll();
    });
    onViewChange((name) => {
        if (name === "isi" && stale) renderAll();
    });
    renderAll();
}

function announce(text) {
    const el = $("fillStatus");
    if (!el) return;
    el.textContent = "";
    setTimeout(() => (el.textContent = text), 30);
}

// ---------- Render keseluruhan ----------

function renderAll() {
    stale = false;
    const form = getForm();
    if (step > lastStep()) step = lastStep();
    if (reached > lastStep()) reached = lastStep();
    $("fillTitle").textContent = form.title;
    $("fillDesc").textContent = form.description;
    $("fillStepper").hidden = done;
    renderStepper();
    renderStep();
    renderActions();
    updateAside();
}

function renderStepper() {
    const nav = $("fillStepper");
    nav.replaceChildren();
    const secs = sections();
    const total = secs.length + 1;
    const names = [...secs.map((s) => s.title), "Tinjau"];
    const items = names.map((name, i) => {
        const btn = h("button", { type: "button", class: "stp-item", disabled: i > reached, "aria-current": i === step ? "step" : false },
            h("span", { class: "stp-dot", "aria-hidden": "true" }, i < step ? icon("check", { size: 14 }) : String(i + 1)),
            h("span", { class: "stp-name" }, name));
        btn.addEventListener("click", () => go(i));
        return h("li", { class: "stp-li" + (i < step ? " is-done" : i === step ? " is-current" : "") }, btn);
    });
    nav.append(
        h("p", { class: "stp-line" }, `Langkah ${step + 1} dari ${total}: `, h("strong", null, names[step])),
        h("div", { class: "stp-bar", "aria-hidden": "true" }, h("i", { vars: { w: `${((step + 1) / total) * 100}%` } })),
        h("ol", { class: "stp" }, items),
    );
}

function renderStep() {
    const mount = $("fillMount");
    mount.replaceChildren();
    built.clear();
    honeypot = null;
    if (done) return mount.appendChild(renderDone());
    if (step < lastStep()) {
        const sec = sections()[step];
        const wrap = h("section", { class: "step", "aria-labelledby": "stepTitle" },
            h("h2", { class: "step-title", id: "stepTitle", tabindex: "-1" }, sec.title),
            sec.desc ? h("p", { class: "step-desc" }, sec.desc) : null);
        if (!sec.questions.length) wrap.appendChild(h("p", { class: "empty" }, "Bagian ini belum punya pertanyaan. Tambahkan lewat tab Pembuat."));
        for (const q of sec.questions) wrap.appendChild(mountQuestion(q));
        mount.appendChild(wrap);
    } else {
        mount.appendChild(renderReview());
    }
}

function mountQuestion(q) {
    const b = buildQuestion(q, { value: answers.get(q.id), set: (v) => onAnswer(q, v) });
    b.el.hidden = !isVisible(q, answers);
    b.el.addEventListener("focusout", (e) => {
        if (!b.el.contains(e.relatedTarget) && touched.has(q.id)) validateOne(q);
    });
    built.set(q.id, b);
    return b.el;
}

function onAnswer(q, value) {
    answers.set(q.id, value);
    touched.add(q.id);
    if (shown.has(q.id)) validateOne(q);
    if (q.id !== CONSENT.id) {
        for (const other of allQuestions()) {
            if (other.showIf?.q === q.id) {
                const b = built.get(other.id);
                if (b) b.el.hidden = !isVisible(other, answers);
            }
        }
    }
    updateAside();
}

function validateOne(q) {
    const b = built.get(q.id);
    if (!b) return null;
    const msg = validateQuestion(q, answers.get(q.id));
    b.setError(msg);
    if (msg) shown.add(q.id); else shown.delete(q.id);
    return msg;
}

/** Validasi satu bagian; menampilkan error dan mengembalikan jumlah serta elemen pertama yang salah. */
function validateSection(sec) {
    let count = 0, first = null;
    for (const q of sec.questions) {
        if (!isVisible(q, answers)) continue;
        if (validateOne(q)) {
            count++;
            first ??= built.get(q.id);
        }
    }
    return { count, first };
}

const sectionErrors = (sec) => sec.questions.filter((q) => isVisible(q, answers) && validateQuestion(q, answers.get(q.id))).length;

// ---------- Navigasi ----------

function go(i) {
    if (i < 0 || i > lastStep() || i > reached) return;
    step = i;
    renderAll();
    const title = $("stepTitle") || document.querySelector(".review-title");
    $("fillPaper")?.scrollIntoView({ block: "start", behavior: reduceMotion() ? "auto" : "smooth" });
    title?.focus({ preventScroll: true });
}

function advance() {
    if (sending) return;
    if (step < lastStep()) {
        const { count, first } = validateSection(sections()[step]);
        if (count) {
            announce(`${count} pertanyaan perlu diperbaiki sebelum lanjut.`);
            first?.focus();
            return;
        }
        reached = Math.max(reached, step + 1);
        go(step + 1);
    } else {
        submit();
    }
}

function renderActions() {
    const bar = $("fillActions");
    bar.replaceChildren();
    bar.hidden = done;
    if (done) return;
    const onReview = step === lastStep();
    const back = h("button", { type: "button", class: "btn btn-ghost", "aria-label": "Kembali ke langkah sebelumnya", on: { click: () => go(step - 1) } }, icon("left", { size: 18 }), h("span", { class: "back-txt" }, "Kembali"));
    if (step === 0) back.hidden = true;
    const label = onReview ? "Kirim formulir" : step === lastStep() - 1 ? "Tinjau jawaban" : "Lanjut";
    const next = h("button", { type: "submit", class: "btn btn-primary", id: "fillNext" }, label, onReview ? icon("check", { size: 18 }) : icon("right", { size: 18 }));
    bar.append(back, next);
}

// ---------- Tinjau & kirim ----------

function renderReview() {
    const wrap = h("section", { class: "step review" },
        h("h2", { class: "step-title review-title", tabindex: "-1" }, "Tinjau jawaban Anda"),
        h("p", { class: "step-desc" }, "Periksa sekali lagi. Anda bisa mengubah jawaban kapan saja sebelum mengirim."));
    sections().forEach((sec, i) => {
        const rows = sec.questions.filter((q) => isVisible(q, answers) && typeOf(q));
        const dl = h("dl", { class: "rv-list" });
        for (const q of rows) {
            const text = formatValue(q, answers.get(q.id));
            dl.append(h("dt", null, q.label), h("dd", { class: text ? "" : "is-empty" }, text || "Belum diisi"));
        }
        if (!rows.length) dl.append(h("dd", { class: "is-empty" }, "Tidak ada pertanyaan."));
        const edit = h("button", { type: "button", class: "link-btn", "aria-label": `Ubah jawaban bagian ${sec.title}` }, icon("edit", { size: 14 }), "Ubah");
        edit.addEventListener("click", () => go(i));
        wrap.appendChild(h("div", { class: "rv-sec" }, h("div", { class: "rv-head" }, h("h3", null, sec.title), edit), dl));
    });
    const consent = buildQuestion(CONSENT, { value: answers.get(CONSENT.id), set: (v) => onAnswer(CONSENT, v) });
    built.set(CONSENT.id, consent);
    wrap.appendChild(consent.el);
    // Honeypot antispam: tersembunyi dan tidak bisa difokus. Manusia tidak pernah mengisinya.
    honeypot = h("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off" });
    wrap.appendChild(h("div", { class: "hp", inert: true }, h("label", null, "Kosongkan kolom ini", honeypot)));
    return wrap;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function submit() {
    if (sending) return;
    // Validasi ulang seluruh bagian: jawaban tidak dipercaya hanya karena langkahnya sudah dilewati.
    for (let i = 0; i < sections().length; i++) {
        if (sectionErrors(sections()[i])) {
            step = i;
            reached = Math.max(reached, i);
            renderAll();
            const { count, first } = validateSection(sections()[i]);
            announce(`${count} pertanyaan perlu diperbaiki.`);
            first?.focus();
            return;
        }
    }
    const consentMsg = validateQuestion(CONSENT, answers.get(CONSENT.id));
    if (consentMsg) {
        built.get(CONSENT.id)?.setError(consentMsg);
        shown.add(CONSENT.id);
        announce(consentMsg);
        built.get(CONSENT.id)?.focus();
        return;
    }
    const spam = Boolean(honeypot && honeypot.value.trim() !== "");
    sending = true;
    const btn = $("fillNext");
    if (btn) {
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
        btn.replaceChildren(h("span", { class: "spin", "aria-hidden": "true" }), "Mengirim…");
    }
    await sleep(1100);
    const resp = buildResponse();
    lastRef = resp.id;
    lastName = resp.name;
    if (!spam) addResponse(resp); // bot yang mengisi honeypot melihat sukses palsu, tanpa efek apa pun
    sending = false;
    done = true;
    renderAll();
    $("fillPaper")?.scrollIntoView({ block: "start", behavior: reduceMotion() ? "auto" : "smooth" });
    document.querySelector(".done-title")?.focus({ preventScroll: true });
}

function firstAnswer(types, preferId) {
    const qs = allQuestions().filter((q) => isVisible(q, answers) && types.includes(q.type) && !isEmpty(cleanValue(q, answers.get(q.id))));
    return qs.find((q) => q.id === preferId) || qs[0] || null;
}

function buildResponse() {
    const text = (types, preferId) => {
        const q = firstAnswer(types, preferId);
        return q ? formatValue(q, answers.get(q.id)) : "";
    };
    const num = (types, preferId) => {
        const q = firstAnswer(types, preferId);
        return q ? cleanValue(q, answers.get(q.id)) : null;
    };
    const used = new Set(getResponses().map((r) => r.id));
    let id;
    do id = "RR-" + randomCode(6); while (used.has(id));
    return {
        id,
        at: new Date(),
        name: text(["short"], "q_name") || "Responden baru",
        email: text(["email"], "q_email"),
        wa: text(["phone"], "q_wa"),
        city: text(["select"], "q_city") || "—",
        type: text(["radio"], "q_type") || "—",
        budget: num(["slider"], "q_budget"),
        rating: num(["rating"], "q_rate"),
        nps: num(["nps"], "q_nps"),
        status: "Baru",
        fresh: true,
        answers: allQuestions()
            .filter((q) => isVisible(q, answers) && typeOf(q) && !isEmpty(cleanValue(q, answers.get(q.id))))
            .map((q) => ({ q: q.label, a: formatValue(q, answers.get(q.id)) })),
    };
}

// ---------- Layar sukses ----------

function renderDone() {
    const first = lastName.split(" ")[0] || "";
    const copy = h("button", { type: "button", class: "link-btn" }, icon("copy", { size: 14 }), "Salin");
    copy.addEventListener("click", async () => toast((await copyText(lastRef)) ? "Nomor referensi disalin." : "Tidak bisa menyalin otomatis. Salin manual dari layar."));
    const steps = [
        ["Tim meninjau permintaan", "Paling lambat 1×24 jam kerja."],
        ["Kami menghubungi Anda", "Lewat WhatsApp di nomor yang Anda isi."],
        ["Survei lokasi dijadwalkan", "Disepakati bersama sesuai waktu Anda."],
    ];
    const toResp = h("button", { type: "button", class: "btn btn-primary" }, "Lihat di tab Respons", icon("right", { size: 18 }));
    toResp.addEventListener("click", () => showView("respons"));
    const again = h("button", { type: "button", class: "btn btn-ghost" }, icon("reset", { size: 18 }), "Isi formulir lagi");
    again.addEventListener("click", resetFlow);
    return h("section", { class: "done step" },
        h("div", { class: "done-badge", "aria-hidden": "true" }, icon("check", { size: 34 })),
        h("h2", { class: "done-title", tabindex: "-1" }, first ? `Terima kasih, ${first}!` : "Terima kasih!"),
        h("p", { class: "step-desc" }, "Formulir Anda sudah kami terima. Simpan nomor referensi ini jika perlu menanyakan statusnya."),
        h("div", { class: "ref" }, h("span", { class: "ref-label" }, "Nomor referensi"), h("code", { class: "ref-code" }, lastRef), copy),
        h("ol", { class: "next-list" }, steps.map(([t, d]) => h("li", null, h("strong", null, t), h("span", null, d)))),
        h("p", { class: "demo-note" }, icon("info", { size: 16 }), "Ini demo: jawaban Anda tidak dikirim ke server. Respons yang baru masuk bisa dilihat di tab Respons."),
        h("div", { class: "done-actions" }, toResp, again));
}

function resetFlow() {
    answers.clear();
    touched.clear();
    shown.clear();
    step = 0;
    reached = 0;
    done = false;
    renderAll();
    $("fillPaper")?.scrollIntoView({ block: "start", behavior: reduceMotion() ? "auto" : "smooth" });
}

// ---------- Panel ringkasan ----------

function updateAside() {
    const qs = allQuestions().filter((q) => typeOf(q) && isVisible(q, answers));
    const answered = qs.filter((q) => !isEmpty(cleanValue(q, answers.get(q.id)))).length;
    const reqLeft = qs.filter((q) => q.required && !typeOf(q).noRequired && isEmpty(cleanValue(q, answers.get(q.id)))).length;
    const pct = qs.length ? Math.round((answered / qs.length) * 100) : 0;
    $("sumCount").textContent = `${answered} dari ${qs.length}`;
    $("sumBar").style.setProperty("--w", pct + "%");
    $("sumBarWrap").setAttribute("aria-valuenow", String(pct));
    $("sumReq").textContent = reqLeft ? `${reqLeft} pertanyaan wajib belum diisi` : "Semua pertanyaan wajib sudah terisi";
    $("sumReq").classList.toggle("is-ok", reqLeft === 0);
    $("sumTime").textContent = `Sekitar ${Math.max(1, Math.round(qs.length * 0.22))} menit`;
    if (touched.size) $("sumSaved").textContent = `Tersimpan sementara di halaman ini pukul ${fmtTime(new Date())}`;
    else $("sumSaved").textContent = "Belum ada perubahan";
}
