import { bindTabs, toast } from "./util";
import { wireSheet } from "./sheet";

document.querySelectorAll<HTMLElement>("[data-mock=marketplace]").forEach((m) => {
  const show = bindTabs(m);
  const tiles = [...m.querySelectorAll<HTMLElement>("[data-tiles] [data-pid]")];
  const empty = m.querySelector<HTMLElement>("[data-empty]")!, chip = m.querySelector<HTMLElement>("[data-chip]")!;
  const sortBtns = [...m.querySelectorAll<HTMLElement>("[data-sort]")];
  let q = "", cat = "", sort = "pop", asc = true, cart = 0, qty = 1;

  // Cari, urutkan, dan saring dilakukan pada tile yang sudah dirender server.
  const apply = () => {
    let n = 0;
    tiles.forEach((t) => {
      const ok = (!cat || t.dataset.cat === cat) && t.dataset.name!.includes(q.trim().toLowerCase());
      t.hidden = !ok; if (ok) n++;
      const price = +t.dataset.price!, idx = +t.dataset.idx!;
      t.style.order = String(sort === "price" ? (asc ? price : -price) : sort === "new" ? -idx : idx);
    });
    empty.hidden = n > 0; chip.hidden = !cat; chip.querySelector("span")!.textContent = cat;
    sortBtns.forEach((b) => {
      b.classList.toggle("on", b.dataset.sort === sort);
      if (b.dataset.sort === "price") b.querySelector("i")!.className = "fa-solid " + (sort !== "price" ? "fa-sort" : asc ? "fa-arrow-up" : "fa-arrow-down");
    });
  };
  m.querySelector<HTMLInputElement>("input")!.addEventListener("input", (e) => { q = (e.target as HTMLInputElement).value; show("produk"); apply(); });
  sortBtns.forEach((b) => b.addEventListener("click", () => { const s = b.dataset.sort!; asc = s === "price" && sort === "price" ? !asc : true; sort = s; apply(); }));
  m.querySelectorAll<HTMLElement>("[data-filter]").forEach((b) => b.addEventListener("click", () => { cat = b.dataset.filter!; show("produk"); apply(); }));
  chip.querySelector("button")!.addEventListener("click", () => { cat = ""; apply(); });
  const follow = m.querySelector<HTMLElement>("[data-act=follow]")!;
  follow.addEventListener("click", () => { follow.textContent = follow.classList.toggle("on") ? "Mengikuti" : "Ikuti"; });

  // Detail produk: satu <dialog> per produk, sudah dirender server.
  const badge = () => m.querySelectorAll<HTMLElement>("[data-cart] b").forEach((b) => { b.hidden = !cart; b.textContent = String(cart); });
  const opens = new Map<string, () => void>();
  m.querySelectorAll<HTMLDialogElement>("dialog[data-product]").forEach((d) => {
    opens.set(d.dataset.product!, wireSheet(d));
    d.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-q],[data-add],[data-buy]");
      if (!b) return;
      if (b.dataset.q) { qty = Math.max(1, Math.min(9, qty + +b.dataset.q)); d.querySelector(".qty b")!.textContent = String(qty); }
      else if (b.hasAttribute("data-add")) { cart += qty; badge(); toast(d, "Ditambahkan ke keranjang (contoh)"); }
      else toast(d, "Contoh: di toko asli, pelanggan lanjut ke pembayaran");
    });
  });
  m.querySelectorAll<HTMLElement>("[data-pid]").forEach((t) => t.addEventListener("click", () => {
    qty = 1;
    m.querySelector(`dialog[data-product="${t.dataset.pid}"] .qty b`)!.textContent = "1";
    badge(); opens.get(t.dataset.pid!)!();
  }));
  apply();
});
