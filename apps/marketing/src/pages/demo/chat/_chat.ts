/* Logika demo chat RuangRapi.
 *
 * Catatan keamanan:
 * - Tidak ada innerHTML/outerHTML/insertAdjacentHTML. Semua teks (pesan, nama berkas, nama kontak) masuk
 *   lewat textContent, sehingga input pengguna tidak pernah ditafsirkan sebagai HTML (anti-XSS).
 * - Lampiran divalidasi: ekstensi daftar putih, ukuran maksimal 5 MB, dan tanda tangan byte (magic bytes)
 *   harus cocok dengan formatnya. SVG sengaja tidak diizinkan. Berkas tidak pernah diunggah ke mana pun.
 * - Pratinjau gambar memakai blob: URL buatan sendiri, dilepas saat halaman ditutup.
 * - Panjang pesan dibatasi, ada jeda antar-kirim, dan jumlah lampiran dibatasi agar tidak membanjiri UI.
 * - Tidak ada tautan keluar, tidak ada request jaringan, tidak ada penyimpanan permanen. */

import {
    CONVERSATIONS,
    QUICK_REPLIES,
    STAGES,
    nextId,
    type Attachment,
    type Conversation,
    type Message,
    type Status,
} from "./_data";
import { ICONS, type IconName } from "./_icons";

const SVG_NS = "http://www.w3.org/2000/svg";
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_TEXT = 1000;
const MAX_PENDING = 5;
const MAX_MESSAGES = 200;
const SEND_COOLDOWN_MS = 250;

/* ================== helper DOM aman ================== */

type Kid = Node | null | undefined | false;
interface ElProps {
    class?: string;
    text?: string;
    attrs?: Record<string, string>;
}

/** Atribut yang bisa memuat kode/URL tidak pernah boleh lewat helper ini. */
const FORBIDDEN_ATTR = /^(on|src|href|srcdoc|style|formaction|xlink)/i;

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: ElProps = {},
    ...kids: Kid[]
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (props.class) node.className = props.class;
    if (props.text !== undefined) node.textContent = props.text;
    if (props.attrs) {
        for (const [k, v] of Object.entries(props.attrs)) {
            if (!FORBIDDEN_ATTR.test(k)) node.setAttribute(k, v);
        }
    }
    for (const kid of kids) if (kid) node.append(kid);
    return node;
}

function icon(name: IconName, size = 18): SVGSVGElement {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    for (const d of ICONS[name]) {
        const p = document.createElementNS(SVG_NS, "path");
        p.setAttribute("d", d);
        svg.append(p);
    }
    return svg;
}

function query<T extends Element>(root: ParentNode, selector: string): T {
    const node = root.querySelector<T>(selector);
    if (!node) throw new Error(`Elemen tidak ditemukan: ${selector}`);
    return node;
}

/* ================== format waktu & teks ================== */

const timeFmt = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

const fmtTime = (ms: number) => timeFmt.format(ms).replace(":", ".");

function startOfDay(ms: number): number {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
const dayDiff = (ms: number) => Math.round((startOfDay(Date.now()) - startOfDay(ms)) / 86_400_000);
const sameDay = (a: number, b: number) => startOfDay(a) === startOfDay(b);

function dayLabel(ms: number): string {
    const diff = dayDiff(ms);
    if (diff === 0) return "Hari ini";
    if (diff === 1) return "Kemarin";
    return dateFmt.format(ms);
}

function listTime(ms: number): string {
    const diff = dayDiff(ms);
    if (diff === 0) return fmtTime(ms);
    if (diff === 1) return "Kemarin";
    return shortDateFmt.format(ms);
}

function lastSeen(ms: number): string {
    const diff = dayDiff(ms);
    if (diff === 0) return `Terakhir dilihat pukul ${fmtTime(ms)}`;
    if (diff === 1) return "Terakhir dilihat kemarin";
    return `Terakhir dilihat ${dateFmt.format(ms)}`;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB`;
}

function hashTone(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return h % 6;
}

/* ================== validasi berkas ================== */

type Sig = (b: Uint8Array) => boolean;
const starts = (b: Uint8Array, ...bytes: number[]) => bytes.every((v, i) => b[i] === v);

const ALLOWED = new Map<string, { kind: Attachment["kind"]; sig: Sig }>([
    ["png", { kind: "image", sig: (b) => starts(b, 0x89, 0x50, 0x4e, 0x47) }],
    ["jpg", { kind: "image", sig: (b) => starts(b, 0xff, 0xd8, 0xff) }],
    ["jpeg", { kind: "image", sig: (b) => starts(b, 0xff, 0xd8, 0xff) }],
    ["gif", { kind: "image", sig: (b) => starts(b, 0x47, 0x49, 0x46, 0x38) }],
    [
        "webp",
        {
            kind: "image",
            sig: (b) =>
                starts(b, 0x52, 0x49, 0x46, 0x46) &&
                b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
        },
    ],
    ["pdf", { kind: "doc", sig: (b) => starts(b, 0x25, 0x50, 0x44, 0x46) }],
    ["docx", { kind: "doc", sig: (b) => starts(b, 0x50, 0x4b, 0x03, 0x04) }],
    ["doc", { kind: "doc", sig: (b) => starts(b, 0xd0, 0xcf, 0x11, 0xe0) }],
]);

/** Buang karakter kontrol, pemisah path, dan karakter pembalik arah teks (spoofing nama berkas). */
function sanitizeName(raw: string): string {
    const cleaned = raw
        .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069\/\\]/g, "")
        .trim();
    const dot = cleaned.lastIndexOf(".");
    const base = dot > 0 ? cleaned.slice(0, dot) : cleaned;
    const ext = dot > 0 ? cleaned.slice(dot) : "";
    const shortBase = base.length > 40 ? `${base.slice(0, 40)}…` : base;
    return (shortBase || "berkas") + ext.slice(0, 8);
}

interface Pending {
    id: string;
    att: Attachment;
}

type Validation = { ok: true; pending: Pending } | { ok: false; reason: string };

async function validateFile(file: File): Promise<Validation> {
    const dot = file.name.lastIndexOf(".");
    const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "";
    const rule = ALLOWED.get(ext);
    const shownExt = ext.replace(/[^a-z0-9]/g, "").slice(0, 8);

    if (!rule) {
        return {
            ok: false,
            reason: shownExt
                ? `Format .${shownExt} tidak didukung. Gunakan gambar, PDF, atau Word.`
                : "Format berkas tidak dikenali. Gunakan gambar, PDF, atau Word.",
        };
    }
    if (file.size === 0) return { ok: false, reason: "Berkas kosong tidak bisa dikirim." };
    if (file.size > MAX_BYTES) {
        return { ok: false, reason: `Berkas terlalu besar (${formatSize(file.size)}). Maksimal 5 MB.` };
    }

    let head: Uint8Array;
    try {
        head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    } catch {
        return { ok: false, reason: "Berkas tidak bisa dibaca. Coba pilih ulang." };
    }
    if (!rule.sig(head)) {
        return { ok: false, reason: "Isi berkas tidak sesuai dengan formatnya, jadi tidak dilampirkan." };
    }

    const att: Attachment = { kind: rule.kind, name: sanitizeName(file.name), size: formatSize(file.size) };
    if (rule.kind === "image") {
        att.url = URL.createObjectURL(file);
        blobUrls.add(att.url);
    }
    return { ok: true, pending: { id: nextId(), att } };
}

const blobUrls = new Set<string>();

/* ================== aplikasi ================== */

function init(): void {
    const root = document.querySelector<HTMLElement>("[data-chat]");
    if (!root) return;

    const app = query<HTMLElement>(root, "[data-app]");
    const listEl = query<HTMLUListElement>(root, "[data-list]");
    const searchEl = query<HTMLInputElement>(root, "[data-search]");
    const tabAll = query<HTMLButtonElement>(root, '[data-tab="all"]');
    const tabUnread = query<HTMLButtonElement>(root, '[data-tab="unread"]');
    const countAll = query<HTMLElement>(root, "[data-count-all]");
    const countUnread = query<HTMLElement>(root, "[data-count-unread]");
    const mainEl = query<HTMLElement>(root, "[data-main]");
    const headAvatar = query<HTMLElement>(root, "[data-head-avatar]");
    const headName = query<HTMLElement>(root, "[data-head-name]");
    const headStatus = query<HTMLElement>(root, "[data-head-status]");
    const backBtn = query<HTMLButtonElement>(root, "[data-back]");
    const infoToggle = query<HTMLButtonElement>(root, "[data-info-toggle]");
    const infoClose = query<HTMLButtonElement>(root, "[data-info-close]");
    const infoBody = query<HTMLElement>(root, "[data-info-body]");
    const scrim = query<HTMLElement>(root, "[data-scrim]");
    const messagesEl = query<HTMLElement>(root, "[data-messages]");
    const toBottom = query<HTMLButtonElement>(root, "[data-to-bottom]");
    const newCountEl = query<HTMLElement>(root, "[data-new-count]");
    const quickEl = query<HTMLElement>(root, "[data-quick]");
    const pendingEl = query<HTMLElement>(root, "[data-pending]");
    const attachBtn = query<HTMLButtonElement>(root, "[data-attach]");
    const fileInput = query<HTMLInputElement>(root, "[data-file]");
    const input = query<HTMLTextAreaElement>(root, "[data-input]");
    const sendBtn = query<HTMLButtonElement>(root, "[data-send]");
    const toasts = query<HTMLElement>(root, "[data-toasts]");
    const lightbox = query<HTMLDialogElement>(root, "[data-lightbox]");
    const lightboxImg = query<HTMLImageElement>(root, "[data-lightbox-img]");
    const lightboxClose = query<HTMLButtonElement>(root, "[data-lightbox-close]");

    const mqMobile = window.matchMedia("(max-width: 820px)");
    const mqWide = window.matchMedia("(min-width: 1180px)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const conversations = CONVERSATIONS;
    const state = { activeId: "hendra", filter: "all" as "all" | "unread", query: "" };
    const pending = new Map<string, Pending[]>();
    const typing = new Set<string>();
    const replyPlan = new Map<string, number[]>();
    const timers = new Set<number>();
    let lastSendAt = 0;
    let newCount = 0;

    const active = (): Conversation => conversations.find((c) => c.id === state.activeId) ?? conversations[0];

    function later(fn: () => void, ms: number): number {
        const id = window.setTimeout(() => {
            timers.delete(id);
            fn();
        }, ms);
        timers.add(id);
        return id;
    }

    /* ---------- tinggi aplikasi: setinggi layar; demo bar ikut ter-scroll seperti halaman admin ---------- */
    function fitHeight(): void {
        const vh = window.visualViewport?.height ?? window.innerHeight;
        root!.style.setProperty("--app-h", `${Math.max(420, Math.round(vh))}px`);
    }

    /* ---------- toast ---------- */
    function toast(message: string, error = false): void {
        const t = el("div", { class: `toast${error ? " is-error" : ""}`, text: message });
        toasts.append(t);
        while (toasts.children.length > 3) toasts.firstElementChild?.remove();
        later(() => t.remove(), 4200);
    }

    /* ---------- avatar ---------- */
    function avatar(c: Conversation, large = false, dot = false): HTMLElement {
        return el(
            "div",
            { class: `avatar tone-${c.tone}${large ? " avatar-lg" : ""}` },
            el("span", { text: c.initials, attrs: { "aria-hidden": "true" } }),
            dot && c.online ? el("span", { class: "dot", attrs: { "aria-hidden": "true" } }) : null,
        );
    }

    /* ---------- daftar percakapan ---------- */
    const lastMsg = (c: Conversation): Message | undefined => c.messages[c.messages.length - 1];

    function previewOf(c: Conversation): { text: string; file: boolean } {
        const m = lastMsg(c);
        if (!m) return { text: "Belum ada pesan", file: false };
        const prefix = m.from === "out" ? "Anda: " : c.group && m.author ? `${m.author}: ` : "";
        if (m.attachment) return { text: prefix + (m.text || m.attachment.name), file: true };
        return { text: prefix + (m.text ?? ""), file: false };
    }

    function renderList(): void {
        const focusedId = (document.activeElement as HTMLElement | null)
            ?.closest<HTMLElement>("[data-conv-id]")?.dataset.convId;
        const q = state.query.trim().toLowerCase();

        const items = conversations
            .filter((c) => (state.filter === "unread" ? c.unread > 0 : true))
            .filter((c) => !q || `${c.name} ${c.role} ${previewOf(c).text}`.toLowerCase().includes(q))
            .sort((a, b) => (lastMsg(b)?.at ?? 0) - (lastMsg(a)?.at ?? 0));

        listEl.replaceChildren();

        if (items.length === 0) {
            const hasFilter = q !== "" || state.filter === "unread";
            const box = el(
                "li",
                { class: "list-empty" },
                el("strong", { text: hasFilter ? "Tidak ada percakapan yang cocok" : "Belum ada percakapan" }),
                el("span", {
                    text: hasFilter ? "Coba kata kunci lain atau tampilkan semua percakapan." : "Pesan pelanggan akan muncul di sini.",
                }),
            );
            if (hasFilter) {
                const reset = el("button", { text: "Tampilkan semua", attrs: { type: "button" } });
                reset.addEventListener("click", () => {
                    state.query = "";
                    state.filter = "all";
                    searchEl.value = "";
                    syncTabs();
                    renderList();
                });
                box.append(reset);
            }
            listEl.append(box);
        }

        for (const c of items) {
            const pv = previewOf(c);
            const isTyping = typing.has(c.id);
            const previewNode = el(
                "div",
                { class: `conv-preview${isTyping ? " is-typing" : ""}` },
                !isTyping && pv.file ? icon("paperclip", 13) : null,
                el("span", { text: isTyping ? "sedang mengetik…" : pv.text }),
            );
            const last = lastMsg(c);
            const btn = el(
                "button",
                {
                    class: `conv${c.unread > 0 ? " has-unread" : ""}`,
                    attrs: {
                        type: "button",
                        "data-conv-id": c.id,
                        "aria-current": c.id === state.activeId ? "true" : "false",
                        "aria-label": `${c.name}${c.unread ? `, ${c.unread} pesan belum dibaca` : ""}`,
                    },
                },
                avatar(c, false, true),
                el(
                    "div",
                    { class: "conv-body" },
                    el(
                        "div",
                        { class: "conv-top" },
                        el("span", { class: "conv-name", text: c.name }),
                        el("span", { class: "conv-time", text: last ? listTime(last.at) : "" }),
                    ),
                    el(
                        "div",
                        { class: "conv-bottom" },
                        previewNode,
                        c.unread > 0 ? el("span", { class: "badge", text: String(c.unread) }) : null,
                    ),
                ),
            );
            listEl.append(el("li", {}, btn));
        }

        const totalUnread = conversations.reduce((n, c) => n + c.unread, 0);
        countAll.textContent = String(conversations.length);
        countUnread.textContent = String(totalUnread);

        if (focusedId) {
            listEl.querySelector<HTMLElement>(`[data-conv-id="${CSS.escape(focusedId)}"]`)?.focus({ preventScroll: true });
        }
    }

    function syncTabs(): void {
        tabAll.setAttribute("aria-pressed", String(state.filter === "all"));
        tabUnread.setAttribute("aria-pressed", String(state.filter === "unread"));
    }

    /* ---------- header chat ---------- */
    function renderHead(): void {
        const c = active();
        headAvatar.className = `avatar tone-${c.tone}`;
        headAvatar.replaceChildren(el("span", { text: c.initials, attrs: { "aria-hidden": "true" } }));
        if (c.online) headAvatar.append(el("span", { class: "dot", attrs: { "aria-hidden": "true" } }));
        headName.textContent = c.name;

        let text: string;
        let cls = "";
        if (typing.has(c.id)) {
            text = c.group ? "ada yang sedang mengetik…" : "sedang mengetik…";
            cls = "is-typing";
        } else if (c.group) {
            text = c.subtitle ?? "";
        } else if (c.online) {
            text = "Online";
            cls = "is-online";
        } else {
            text = lastSeen(c.seenAt);
        }
        headStatus.textContent = text;
        headStatus.className = `status${cls ? ` ${cls}` : ""}`;
    }

    /* ---------- pesan ---------- */
    function buildTick(status: Status): HTMLElement {
        const label = status === "sent" ? "Terkirim" : status === "delivered" ? "Diterima" : "Dibaca";
        return el(
            "span",
            { class: "tick", attrs: { "data-status": status } },
            icon(status === "sent" ? "check" : "check-check", 15),
            el("span", { class: "sr-only", text: label }),
        );
    }

    function buildAttachment(a: Attachment): HTMLElement {
        if (a.kind === "image" && a.url && a.url.startsWith("blob:")) {
            const img = el("img", { attrs: { alt: a.name, loading: "lazy", decoding: "async" } });
            img.src = a.url;
            const photo = el("button", {
                class: "att-photo",
                attrs: { type: "button", "aria-label": `Lihat gambar ${a.name}` },
            }, img);
            const url = a.url;
            photo.addEventListener("click", () => openLightbox(url, a.name));
            return photo;
        }
        const card = el(
            "button",
            { class: "att", attrs: { type: "button", "aria-label": `Berkas ${a.name}, ${a.size}` } },
            el("span", { class: "att-icon" }, icon(a.kind === "image" ? "image" : "file-text", 20)),
            el(
                "span",
                { class: "att-text" },
                el("span", { class: "att-name", text: a.name }),
                el("span", { class: "att-size", text: a.size }),
            ),
        );
        card.addEventListener("click", () => toast("Ini hanya demo, berkas tidak benar-benar tersimpan dan tidak bisa dibuka."));
        return card;
    }

    function buildMessage(m: Message, prev: Message | undefined, c: Conversation, isNew: boolean): HTMLElement {
        const grouped =
            !!prev && prev.from === m.from && prev.author === m.author && sameDay(prev.at, m.at) && m.at - prev.at < 5 * 60_000;

        const bubble = el("div", { class: `bubble${isNew ? " is-new" : ""}` });
        if (c.group && m.from === "in" && m.author && !grouped) {
            bubble.append(el("span", { class: `author tone-${hashTone(m.author)}`, text: m.author }));
        }
        if (m.attachment) bubble.append(buildAttachment(m.attachment));
        if (m.text) bubble.append(el("p", { class: "text", text: m.text }));
        bubble.append(
            el(
                "span",
                { class: "meta" },
                el("time", { text: fmtTime(m.at) }),
                m.from === "out" ? buildTick(m.status ?? "sent") : null,
            ),
        );
        return el("div", { class: `msg msg-${m.from}${grouped ? " is-grouped" : ""}`, attrs: { "data-id": m.id } }, bubble);
    }

    function insertBeforeTyping(node: Node): void {
        messagesEl.insertBefore(node, messagesEl.querySelector("[data-typing]"));
    }

    function appendMessageNode(m: Message, prev: Message | undefined, c: Conversation, isNew: boolean): void {
        if (!prev || !sameDay(prev.at, m.at)) {
            insertBeforeTyping(el("div", { class: "day", text: dayLabel(m.at) }));
        }
        insertBeforeTyping(buildMessage(m, prev, c, isNew));
    }

    const nearBottom = (): boolean =>
        messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 80;

    function updateToBottom(): void {
        const show = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight > 140;
        toBottom.hidden = !show;
        newCountEl.textContent = newCount > 0 ? `${newCount} pesan baru` : "";
    }

    function scrollToBottom(smooth: boolean): void {
        messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: smooth && !mqReduce.matches ? "smooth" : "auto" });
        newCount = 0;
        updateToBottom();
    }

    function renderMessages(): void {
        const c = active();
        messagesEl.setAttribute("aria-live", "off");
        messagesEl.replaceChildren();
        let prev: Message | undefined;
        for (const m of c.messages) {
            appendMessageNode(m, prev, c, false);
            prev = m;
        }
        syncTyping(false);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        newCount = 0;
        updateToBottom();
        later(() => messagesEl.setAttribute("aria-live", "polite"), 50);
    }

    function syncTyping(scroll: boolean): void {
        const stick = nearBottom();
        messagesEl.querySelector("[data-typing]")?.remove();
        if (!typing.has(state.activeId)) return;
        messagesEl.append(
            el(
                "div",
                { class: "msg msg-in is-typing-row", attrs: { "data-typing": "", "aria-hidden": "true" } },
                el("div", { class: "bubble" }, el("span", { class: "dots" }, el("i"), el("i"), el("i"))),
            ),
        );
        if (scroll && stick) scrollToBottom(true);
    }

    function pushMessage(c: Conversation, m: Message, fromMe: boolean): void {
        const prev = lastMsg(c);
        c.messages.push(m);
        const trimmed = c.messages.length > MAX_MESSAGES;
        if (trimmed) c.messages.splice(0, c.messages.length - MAX_MESSAGES);

        if (c.id !== state.activeId) return;
        if (trimmed) {
            renderMessages();
            return;
        }
        const stick = fromMe || nearBottom();
        appendMessageNode(m, prev, c, true);
        if (stick) scrollToBottom(true);
        else {
            newCount++;
            updateToBottom();
        }
    }

    function setStatus(c: Conversation, id: string, status: Status): void {
        const rank: Record<Status, number> = { sent: 0, delivered: 1, read: 2 };
        for (const m of c.messages) {
            if (m.from !== "out" || !m.status) continue;
            const isTarget = m.id === id;
            const earlierRead = status === "read" && m.at <= (c.messages.find((x) => x.id === id)?.at ?? 0);
            if ((isTarget || earlierRead) && rank[m.status] < rank[status]) {
                m.status = status;
                if (c.id === state.activeId) {
                    const node = messagesEl.querySelector(`[data-id="${CSS.escape(m.id)}"] .tick`);
                    node?.replaceWith(buildTick(status));
                }
            }
        }
    }

    /* ---------- lightbox ---------- */
    function openLightbox(url: string, alt: string): void {
        if (!url.startsWith("blob:") || typeof lightbox.showModal !== "function") return;
        lightboxImg.src = url;
        lightboxImg.alt = alt;
        lightbox.showModal();
    }
    lightboxClose.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("close", () => lightboxImg.removeAttribute("src"));

    /* ---------- balasan cepat & komposer ---------- */
    function fillComposer(text: string): void {
        const cur = input.value.trim();
        input.value = (cur ? `${cur} ${text}` : text).slice(0, MAX_TEXT);
        active().draft = input.value;
        autosize();
        updateSendState();
        input.focus({ preventScroll: true });
    }

    function renderQuick(): void {
        quickEl.replaceChildren();
        if (active().group) return;
        for (const q of QUICK_REPLIES) {
            const chip = el("button", { class: "chip", text: q.label, attrs: { type: "button" } });
            chip.addEventListener("click", () => fillComposer(q.text));
            quickEl.append(chip);
        }
    }

    function autosize(): void {
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
    }

    function updateSendState(): void {
        const hasFiles = (pending.get(state.activeId)?.length ?? 0) > 0;
        sendBtn.disabled = input.value.trim() === "" && !hasFiles;
    }

    function removePending(id: string): void {
        const list = pending.get(state.activeId) ?? [];
        const target = list.find((p) => p.id === id);
        if (target?.att.url) {
            URL.revokeObjectURL(target.att.url);
            blobUrls.delete(target.att.url);
        }
        pending.set(state.activeId, list.filter((p) => p.id !== id));
        renderPending();
        updateSendState();
    }

    function renderPending(): void {
        const list = pending.get(state.activeId) ?? [];
        pendingEl.hidden = list.length === 0;
        pendingEl.replaceChildren();
        for (const p of list) {
            let thumb: HTMLElement;
            if (p.att.kind === "image" && p.att.url) {
                const img = el("img", { attrs: { alt: "" } });
                img.src = p.att.url;
                thumb = el("span", { class: "pthumb" }, img);
            } else {
                thumb = el("span", { class: "pthumb" }, icon("file-text", 18));
            }
            const remove = el(
                "button",
                { class: "premove", attrs: { type: "button", "aria-label": `Hapus lampiran ${p.att.name}` } },
                icon("x", 14),
            );
            remove.addEventListener("click", () => removePending(p.id));
            pendingEl.append(
                el(
                    "div",
                    { class: "pchip" },
                    thumb,
                    el(
                        "span",
                        { class: "pinfo" },
                        el("span", { class: "pname", text: p.att.name }),
                        el("span", { class: "psize", text: p.att.size }),
                    ),
                    remove,
                ),
            );
        }
    }

    async function addFiles(files: FileList | File[]): Promise<void> {
        const convId = state.activeId;
        const list = pending.get(convId) ?? [];
        for (const f of Array.from(files)) {
            if (list.length >= MAX_PENDING) {
                toast(`Maksimal ${MAX_PENDING} lampiran sekali kirim.`, true);
                break;
            }
            const res = await validateFile(f);
            if (!res.ok) {
                toast(res.reason, true);
                continue;
            }
            list.push(res.pending);
        }
        pending.set(convId, list);
        if (convId === state.activeId) {
            renderPending();
            updateSendState();
        }
    }

    /* ---------- kirim & balasan simulasi ---------- */
    function send(): void {
        const c = active();
        const now = Date.now();
        if (now - lastSendAt < SEND_COOLDOWN_MS) return;

        const body = input.value.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_TEXT);
        const files = pending.get(c.id) ?? [];
        if (!body && files.length === 0) return;
        lastSendAt = now;

        const out: Message[] = [];
        if (files.length === 0) {
            out.push({ id: nextId(), from: "out", text: body, at: Date.now(), status: "sent" });
        } else {
            files.forEach((p, i) => {
                out.push({
                    id: nextId(),
                    from: "out",
                    attachment: p.att,
                    at: Date.now(),
                    status: "sent",
                    ...(i === 0 && body ? { text: body } : {}),
                });
            });
        }

        pending.delete(c.id);
        input.value = "";
        c.draft = "";
        autosize();
        for (const m of out) pushMessage(c, m, true);
        renderPending();
        updateSendState();
        renderList();
        if (files.length > 0) renderInfo();

        for (const m of out) {
            later(() => setStatus(c, m.id, "delivered"), 600);
            later(() => setStatus(c, m.id, "read"), 1700);
        }
        scheduleReply(c, files.length > 0);
        if (!mqCoarse.matches) input.focus({ preventScroll: true });
    }

    function cancelReply(id: string): void {
        for (const t of replyPlan.get(id) ?? []) {
            window.clearTimeout(t);
            timers.delete(t);
        }
        replyPlan.delete(id);
        if (typing.delete(id)) refreshTyping(id);
    }

    function refreshTyping(id: string): void {
        renderList();
        if (id === state.activeId) {
            renderHead();
            syncTyping(true);
        }
    }

    function scheduleReply(c: Conversation, hadFile: boolean): void {
        cancelReply(c.id);
        const startTyping = 1900;
        const typingFor = 1300 + Math.random() * 1100;
        const ids = [
            later(() => {
                typing.add(c.id);
                refreshTyping(c.id);
            }, startTyping),
            later(() => {
                typing.delete(c.id);
                replyPlan.delete(c.id);
                deliverReply(c, hadFile);
            }, startTyping + typingFor),
        ];
        replyPlan.set(c.id, ids);
    }

    function isViewing(c: Conversation): boolean {
        return c.id === state.activeId && !document.hidden && (!mqMobile.matches || app.dataset.view === "chat");
    }

    function deliverReply(c: Conversation, hadFile: boolean): void {
        const r = hadFile ? c.fileReply : c.replies[c.replyIndex++ % c.replies.length];
        c.online = true;
        c.seenAt = Date.now();
        const viewing = isViewing(c);
        pushMessage(
            c,
            { id: nextId(), from: "in", text: r.text, at: Date.now(), ...(r.author ? { author: r.author } : {}) },
            false,
        );
        if (!viewing) c.unread++;
        renderList();
        if (c.id === state.activeId) {
            renderHead();
            syncTyping(false);
        }
    }

    /* ---------- panel info ---------- */
    function section(title: string, ...kids: Kid[]): HTMLElement {
        return el("section", { class: "info-section" }, el("h4", { text: title }), ...kids);
    }

    function renderInfo(): void {
        const c = active();
        infoBody.replaceChildren();

        infoBody.append(
            el(
                "div",
                { class: "profile" },
                avatar(c, true, true),
                el("h3", { text: c.name }),
                el("p", { text: c.role }),
                el("span", { class: "label-chip", text: c.label }),
            ),
        );

        const rows: [string, string | undefined][] = [
            ["Lokasi", c.location],
            ["Perkiraan anggaran", c.budget],
            ["Kontak", c.phone],
        ];
        const dl = el("dl", { class: "rows" });
        for (const [k, v] of rows) {
            if (!v) continue;
            dl.append(el("div", {}, el("dt", { text: k }), el("dd", { text: v })));
        }
        if (dl.children.length > 0) infoBody.append(section("Detail", dl));

        if (c.stage !== null) {
            const ol = el("ol", { class: "stages" });
            STAGES.forEach((s, i) => {
                const cls = i < c.stage! ? "is-done" : i === c.stage ? "is-current" : "";
                ol.append(
                    el("li", {
                        class: cls,
                        text: s,
                        attrs: i === c.stage ? { "aria-current": "step" } : {},
                    }),
                );
            });
            infoBody.append(section("Tahap proyek", ol));
        }

        const shared = c.messages.filter((m) => m.attachment).slice(-4).reverse();
        const files = el("div", { class: "files" });
        if (shared.length === 0) {
            files.append(el("p", { class: "muted", text: "Belum ada berkas dalam percakapan ini." }));
        }
        for (const m of shared) files.append(buildAttachment(m.attachment!));
        infoBody.append(section("Berkas dibagikan", files));

        if (!c.group) {
            const actions = el("div", { class: "actions" });
            const items: { label: string; text: string; primary?: boolean }[] = [
                { label: "Jadwalkan survei", text: QUICK_REPLIES[0].text, primary: true },
                { label: "Minta foto ruangan", text: QUICK_REPLIES[1].text },
                { label: "Kirim info harga", text: QUICK_REPLIES[2].text },
            ];
            for (const a of items) {
                const b = el("button", {
                    class: `btn${a.primary ? " btn-primary" : ""}`,
                    text: a.label,
                    attrs: { type: "button" },
                });
                b.addEventListener("click", () => {
                    fillComposer(a.text);
                    if (!mqWide.matches) setInfo(false);
                });
                actions.append(b);
            }
            infoBody.append(section("Tindakan cepat", actions));
        }
    }

    function setInfo(open: boolean): void {
        app.dataset.info = open ? "open" : "closed";
        infoToggle.setAttribute("aria-pressed", String(open));
        if (open && !mqWide.matches) infoClose.focus({ preventScroll: true });
    }

    /* ---------- navigasi ---------- */
    function setView(v: "list" | "chat"): void {
        app.dataset.view = v;
    }

    function activate(id: string, openView: boolean): void {
        const prev = active();
        prev.draft = input.value;
        state.activeId = id;
        const c = active();
        c.unread = 0;
        input.value = c.draft;
        autosize();
        renderHead();
        renderMessages();
        renderPending();
        renderQuick();
        renderInfo();
        renderList();
        updateSendState();
        if (openView) {
            if (mqMobile.matches && app.dataset.view !== "chat") {
                try {
                    history.pushState({ chatView: true }, "");
                } catch {
                    /* iframe/sandbox bisa menolak; tidak masalah */
                }
            }
            setView("chat");
        }
    }

    /* ---------- event ---------- */
    listEl.addEventListener("click", (e) => {
        const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-conv-id]");
        if (!btn?.dataset.convId) return;
        if (btn.dataset.convId === state.activeId) {
            const c = active();
            c.unread = 0;
            renderList();
            setView("chat");
            if (mqMobile.matches && !history.state?.chatView) {
                try {
                    history.pushState({ chatView: true }, "");
                } catch {
                    /* abaikan */
                }
            }
            return;
        }
        activate(btn.dataset.convId, true);
    });

    searchEl.addEventListener("input", () => {
        state.query = searchEl.value.slice(0, 60);
        renderList();
    });
    tabAll.addEventListener("click", () => {
        state.filter = "all";
        syncTabs();
        renderList();
    });
    tabUnread.addEventListener("click", () => {
        state.filter = "unread";
        syncTabs();
        renderList();
    });

    backBtn.addEventListener("click", () => {
        if (history.state?.chatView) history.back();
        else setView("list");
    });
    window.addEventListener("popstate", () => {
        if (mqMobile.matches && app.dataset.view === "chat") {
            setView("list");
            setInfo(false);
        }
    });

    infoToggle.addEventListener("click", () => {
        const open = app.dataset.info !== "open";
        setInfo(open);
        if (!open && !mqWide.matches) infoToggle.focus({ preventScroll: true });
    });
    infoClose.addEventListener("click", () => {
        setInfo(false);
        infoToggle.focus({ preventScroll: true });
    });
    scrim.addEventListener("click", () => setInfo(false));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && app.dataset.info === "open" && !mqWide.matches && !lightbox.open) {
            setInfo(false);
            infoToggle.focus({ preventScroll: true });
        }
    });
    mqWide.addEventListener("change", () => setInfo(mqWide.matches));

    input.addEventListener("input", () => {
        active().draft = input.value;
        autosize();
        updateSendState();
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !mqCoarse.matches) {
            e.preventDefault();
            send();
        }
    });
    sendBtn.addEventListener("click", send);

    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        const files = fileInput.files ? Array.from(fileInput.files) : [];
        fileInput.value = "";
        if (files.length > 0) void addFiles(files);
    });

    let dragDepth = 0;
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    mainEl.addEventListener("dragenter", (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        dragDepth++;
        mainEl.classList.add("is-drop");
    });
    mainEl.addEventListener("dragover", (e) => {
        if (hasFiles(e)) e.preventDefault();
    });
    mainEl.addEventListener("dragleave", () => {
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) mainEl.classList.remove("is-drop");
    });
    mainEl.addEventListener("drop", (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        dragDepth = 0;
        mainEl.classList.remove("is-drop");
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) void addFiles(files);
    });

    messagesEl.addEventListener("scroll", () => {
        if (nearBottom()) newCount = 0;
        updateToBottom();
    }, { passive: true });
    toBottom.addEventListener("click", () => scrollToBottom(true));

    document.addEventListener("visibilitychange", () => {
        const c = active();
        if (!document.hidden && isViewing(c) && c.unread > 0) {
            c.unread = 0;
            renderList();
        }
    });

    window.addEventListener("resize", fitHeight, { passive: true });
    window.visualViewport?.addEventListener("resize", fitHeight);
    window.addEventListener("load", fitHeight);

    window.addEventListener("pagehide", () => {
        timers.forEach((t) => window.clearTimeout(t));
        timers.clear();
        blobUrls.forEach((u) => URL.revokeObjectURL(u));
        blobUrls.clear();
    });

    /* ---------- mulai ---------- */
    fitHeight();
    syncTabs();
    setInfo(mqWide.matches);
    setView("list");
    const first = active();
    input.value = first.draft;
    renderHead();
    renderMessages();
    renderQuick();
    renderInfo();
    renderList();
    updateSendState();
    requestAnimationFrame(fitHeight);
}

init();
