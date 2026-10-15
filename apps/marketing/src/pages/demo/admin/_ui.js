// Helper UI umum: toast, modal, dialog konfirmasi, dropdown.
// Tidak menyimpan data bisnis; hanya mengatur tampilan dan fokus.

import { esc } from "./_data.js";

const root = () => document.querySelector(".body");

/* ---------- Toast ---------- */
const TOAST_ICON = { ok: "check_circle", error: "error", info: "info", warn: "warning" };

export function toast(message, tone = "ok") {
    const box = document.getElementById("toasts");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast toast-" + tone;
    el.setAttribute("role", tone === "error" ? "alert" : "status");
    el.innerHTML = `<span class="material-icons">${TOAST_ICON[tone] || "info"}</span><span>${esc(message)}</span>`;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 250);
    }, 3200);
    while (box.children.length > 3) box.firstElementChild.remove();
}

/* ---------- Modal & drawer ---------- */
const openStack = [];

export function openOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    el._returnFocus = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("open"));
    openStack.push(el);
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => {
        const target = el.querySelector("[data-autofocus]") || el.querySelector("input:not([type=hidden]), select, textarea, button");
        target?.focus({ preventScroll: true });
    }, 60);
    return el;
}

export function closeOverlay(target) {
    const el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el || el.hidden) return;
    el.classList.remove("open");
    const i = openStack.indexOf(el);
    if (i >= 0) openStack.splice(i, 1);
    setTimeout(() => {
        el.hidden = true;
        if (!openStack.length) document.documentElement.style.overflow = "";
        el._returnFocus?.focus?.({ preventScroll: true });
    }, 200);
}

export const topOverlay = () => openStack[openStack.length - 1] || null;

/* ---------- Dialog konfirmasi (promise) ---------- */
let confirmResolve = null;

export function confirmDialog({ title, message, confirmLabel = "Ya, lanjutkan", danger = false, icon = "help" }) {
    const el = document.getElementById("confirmModal");
    el.querySelector("[data-confirm-title]").textContent = title;
    el.querySelector("[data-confirm-message]").textContent = message;
    const ok = el.querySelector("[data-confirm-ok]");
    ok.textContent = confirmLabel;
    ok.className = "btn " + (danger ? "btn-danger" : "btn-primary");
    const ic = el.querySelector("[data-confirm-icon]");
    ic.className = "confirm-icon " + (danger ? "is-danger" : "");
    ic.firstElementChild.textContent = danger ? "delete_outline" : icon;
    openOverlay("confirmModal");
    return new Promise((resolve) => {
        confirmResolve = resolve;
    });
}

export function resolveConfirm(value) {
    if (!confirmResolve) return;
    const fn = confirmResolve;
    confirmResolve = null;
    closeOverlay("confirmModal");
    fn(value);
}

export const isConfirmOpen = () => !!confirmResolve;

/* ---------- Dropdown ---------- */
export function closeDropdowns(except = null) {
    root()
        ?.querySelectorAll(".dropdown.open")
        .forEach((d) => {
            if (d !== except) {
                d.classList.remove("open");
                d.querySelector("[data-dropdown-toggle]")?.setAttribute("aria-expanded", "false");
            }
        });
}

export function toggleDropdown(dropdown) {
    const willOpen = !dropdown.classList.contains("open");
    closeDropdowns(dropdown);
    dropdown.classList.toggle("open", willOpen);
    dropdown.querySelector("[data-dropdown-toggle]")?.setAttribute("aria-expanded", String(willOpen));
}

/* ---------- Unduh berkas (CSV) ---------- */
export function downloadCsv(filename, rows) {
    const csv = rows
        .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
