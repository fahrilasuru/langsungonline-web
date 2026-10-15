// Titik masuk skrip halaman. Diimpor dari index.astro.
import { initViews, initDialogs, openDialog, copyText, toast } from "./_ui.js";
import { initFill } from "./_fill.js";
import { initBuilder } from "./_builder.js";
import { initResponses } from "./_responses.js";

const SHARE_URL = "https://isian.example/f/konsultasi-proyek"; // domain .example: tidak pernah resolve
const EMBED = `<iframe src="${SHARE_URL}" title="Konsultasi proyek interior" width="100%" height="720" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-forms allow-scripts allow-same-origin"></iframe>`;

// ===== HEADER SCROLL =====
const top = document.getElementById("appTop");
if (top) {
    const onScroll = () => top.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}

// ===== DIALOG BAGIKAN =====
const shareDlg = document.getElementById("shareDlg");
const shareLink = document.getElementById("shareLink");
const embedPre = document.getElementById("embedPre");
if (shareLink) shareLink.value = SHARE_URL;
if (embedPre) embedPre.textContent = EMBED;
document.querySelectorAll("[data-open-share]").forEach((b) => b.addEventListener("click", () => openDialog(shareDlg)));
document.getElementById("btnCopyLink")?.addEventListener("click", async () => {
    toast((await copyText(SHARE_URL)) ? "Tautan disalin." : "Tidak bisa menyalin otomatis. Salin manual dari kolom.");
});
document.getElementById("btnCopyEmbed")?.addEventListener("click", async () => {
    toast((await copyText(EMBED)) ? "Kode embed disalin." : "Tidak bisa menyalin otomatis.");
});

initDialogs();
initViews();
initFill();
initBuilder();
initResponses();
