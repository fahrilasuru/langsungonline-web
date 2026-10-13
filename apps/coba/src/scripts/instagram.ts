import { bindTabs, share } from "./util";
import { wireSheet } from "./sheet";
import { enhance, enhanceWhenVisible } from "./sharpen";

document.querySelectorAll<HTMLElement>("[data-mock=instagram]").forEach((m) => {
  bindTabs(m);
  enhanceWhenVisible(m, ".pzt img.pz");
  const follow = m.querySelector<HTMLElement>("[data-act=follow]")!;
  follow.addEventListener("click", () => { follow.textContent = follow.classList.toggle("on") ? "Mengikuti" : "Ikuti"; });

  // Sorotan (story): maju otomatis, ketuk kiri/kanan untuk pindah.
  const sd = m.querySelector<HTMLDialogElement>("dialog[data-stories]")!;
  const slides = [...sd.querySelectorAll<HTMLElement>(".slide")];
  const bars = [...sd.querySelectorAll<HTMLElement>(".stbars span")];
  let i = 0, t = 0;
  let fromRing: HTMLElement | null = null; // cincin foto profil yang memulai story
  const go = (n: number) => {
    clearTimeout(t);
    if (n < 0) n = 0;
    if (n >= slides.length) { fromRing?.classList.add("seen"); fromRing = null; return sd.close(); } // seen hanya bila tuntas
    i = n;
    slides.forEach((s, k) => (s.hidden = k !== n));
    bars.forEach((b, k) => (b.className = k < n ? "d" : ""));
    void sd.offsetWidth; // mulai ulang animasi progres
    bars[n].className = "a";
    t = window.setTimeout(() => go(n + 1), 4500);
  };
  const openStory = wireSheet(sd, () => { clearTimeout(t); fromRing = null; });
  m.querySelectorAll<HTMLElement>("[data-story]").forEach((b) =>
    b.addEventListener("click", () => { fromRing = b.classList.contains("ring") ? b : null; openStory(); go(+b.dataset.story!); }));
  sd.querySelectorAll<HTMLElement>("[data-step]").forEach((b) => b.addEventListener("click", () => go(i + +b.dataset.step!)));

  // Feed postingan: dibuka tepat di postingan yang diketuk.
  const fd = m.querySelector<HTMLDialogElement>("dialog[data-feed]")!;
  const openFeed = wireSheet(fd);
  m.querySelectorAll<HTMLElement>("[data-post]").forEach((b) =>
    b.addEventListener("click", () => {
      openFeed();
      enhance(fd.querySelectorAll<HTMLImageElement>("img.pz"));
      fd.querySelector<HTMLElement>(".pfeed")!.scrollTop = fd.querySelector<HTMLElement>(`[data-post-id="${b.dataset.post}"]`)!.offsetTop;
    }));
  fd.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-like],[data-save],[data-share]");
    if (!b) return;
    if (b.hasAttribute("data-share")) return void share(fd, document.title);
    const on = b.classList.toggle("on"), ic = b.querySelector("i")!;
    ic.classList.toggle("fa-solid", on); ic.classList.toggle("fa-regular", !on);
  });
});
