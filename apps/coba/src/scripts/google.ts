import { bindTabs, toast, share } from "./util";

document.querySelectorAll<HTMLElement>("[data-mock=google]").forEach((m) => {
  const q = (s: string) => m.querySelector<HTMLElement>(s);
  const show = bindTabs(m);
  q("[data-act=reviews]")?.addEventListener("click", () => show("ulasan"));

  const car = q(".gcar"), cnt = q(".gcnt");
  if (car && cnt) {
    const step = () => (car.children[0] as HTMLElement).offsetWidth + 6;
    car.addEventListener("scroll", () => {
      const last = car.children.length - 1;
      const i = car.scrollLeft + car.clientWidth >= car.scrollWidth - 4 ? last : Math.round(car.scrollLeft / step());
      cnt.textContent = `${i + 1}/${last + 1}`;
    });
    q("[data-nav=prev]")?.addEventListener("click", () => car.scrollBy({ left: -step(), behavior: "smooth" }));
    q("[data-nav=next]")?.addEventListener("click", () => car.scrollBy({ left: step(), behavior: "smooth" }));
    m.querySelectorAll<HTMLElement>("[data-photo]").forEach((b) =>
      b.addEventListener("click", () => { show("ringkasan"); car.scrollTo({ left: +b.dataset.photo! * step() }); }));
  }

  const save = q("[data-act=save]");
  save?.addEventListener("click", () => {
    const on = save.classList.toggle("saved");
    save.querySelector(".l")!.textContent = on ? "Tersimpan" : "Simpan";
    toast(m, on ? "Disimpan ke daftar Anda" : "Dihapus dari daftar");
  });
  q("[data-act=share]")?.addEventListener("click", () => share(m, document.title));
  q("[data-act=hours]")?.addEventListener("click", () => { const h = q(".hrs")!; h.hidden = !h.hidden; });
});
