// Interaksi Brosur Acara.
//
// Catatan keamanan:
//  - Tanpa innerHTML / eval / document.write; teks hanya lewat textContent.
//  - Tanpa permintaan jaringan. Tautan dibagikan lewat Web Share / clipboard, kalender lewat berkas .ics lokal (Blob).
//  - Nilai data-* divalidasi (regex ketat) dan dibersihkan sebelum masuk ke berkas .ics atau pesan.

const root = document.querySelector(".body");
if (root) root.classList.add("js");

const TZ = "Asia/Jakarta";

/** Bersihkan teks: normalisasi, buang karakter kontrol/format (termasuk bidi dan CR/LF), batasi panjang. */
/** @param {string | null | undefined} v @param {number} max */
const clean = (v, max) =>
    String(v || "")
        .normalize("NFKC")
        .replace(/[\p{C}]/gu, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);

// ===== HEADER =====
const header = document.getElementById("header");
if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}

// ===== REVEAL =====
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    revealEls.forEach((el) => io.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add("visible"));
}

// ===== TOAST =====
const toastEl = document.querySelector("[data-toast]");
/** @type {number | undefined} */
let toastTimer;
/** @param {string} msg */
function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 3200);
}

// ===== HITUNG MUNDUR (tanggal WIB) =====
document.querySelectorAll("[data-countdown]").forEach((el) => {
    const iso = el.getAttribute("data-date") || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
    try {
        const p = {};
        new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
            .formatToParts(new Date())
            .forEach((x) => (p[x.type] = x.value));
        const toDay = (/** @type {string} */ s) => {
            const [y, m, d] = s.split("-").map(Number);
            return Date.UTC(y, m - 1, d) / 86400000;
        };
        const diff = toDay(iso) - toDay(`${p.year}-${p.month}-${p.day}`);
        el.textContent =
            diff > 1 ? `H-${diff} • Pendaftaran dibuka` : diff === 1 ? "Besok! Pendaftaran terakhir" : diff === 0 ? "Hari ini!" : "Acara telah selesai";
    } catch {
        /* biarkan teks bawaan */
    }
});

// ===== BAGIKAN =====
document.querySelectorAll("[data-share]").forEach((btn) => {
    btn.addEventListener("click", async () => {
        // Tanpa hash/query agar tautan bersih.
        const url = location.href.split("#")[0].split("?")[0];
        const title = clean(btn.getAttribute("data-title"), 120);
        const text = clean(btn.getAttribute("data-text"), 200);
        try {
            if (navigator.share) {
                await navigator.share({ title, text, url });
                return;
            }
        } catch (e) {
            if (e && /** @type {Error} */ (e).name === "AbortError") return; // pengguna membatalkan
        }
        try {
            await navigator.clipboard.writeText(url);
            toast("Tautan acara disalin");
        } catch {
            toast("Salin manual dari kolom alamat browser");
        }
    });
});

// ===== SIMPAN KE KALENDER (.ics lokal) =====
const icsDate = /^\d{8}T\d{6}Z$/;
/** Escape teks sesuai RFC 5545. */
/** @param {string} s */
const icsEsc = (s) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");

document.querySelectorAll("[data-ics]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const start = btn.getAttribute("data-start") || "";
        const end = btn.getAttribute("data-end") || "";
        if (!icsDate.test(start) || !icsDate.test(end)) {
            toast("Data kalender tidak valid");
            return;
        }
        const title = icsEsc(clean(btn.getAttribute("data-title"), 120));
        const loc = icsEsc(clean(btn.getAttribute("data-loc"), 200));
        const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        const ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Brosur Acara//ID",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            `UID:${start}-${Math.abs(title.length * 7919)}@brosur-acara`,
            `DTSTAMP:${stamp}`,
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${title}`,
            `LOCATION:${loc}`,
            "END:VEVENT",
            "END:VCALENDAR",
        ].join("\r\n");

        const blobUrl = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "naik-kelas-2026.ics";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        toast("Berkas kalender diunduh");
    });
});
