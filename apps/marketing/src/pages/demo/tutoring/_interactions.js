const hd = document.getElementById("hd"), nav = document.getElementById("nav"), bg = document.getElementById("burger");
addEventListener("scroll", () => hd?.classList.toggle("sc", scrollY > 20), { passive: true });
bg?.addEventListener("click", () => {
    const o = nav.classList.toggle("open");
    nav.style.top = hd.getBoundingClientRect().bottom + "px";
    bg.setAttribute("aria-expanded", String(o));
    bg.firstElementChild.className = o ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    document.body.style.overflow = o ? "hidden" : "";
});
document.querySelectorAll(".tt img").forEach((i) => {
    const bad = () => i.classList.add("noimg");
    i.addEventListener("error", bad);
    if (i.complete && i.naturalWidth === 0) bad();
});
document.getElementById("kform")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const t = `Halo Rumah Pintar, saya ${f.get("nama")} (WA ${f.get("hp")}). Anak kelas ${f.get("kelas")}, butuh les ${f.get("mapel")}. ${f.get("pesan") || ""}`;
    open(`https://wa.me/6281234567890?text=${encodeURIComponent(t)}`, "_blank", "noopener");
});
