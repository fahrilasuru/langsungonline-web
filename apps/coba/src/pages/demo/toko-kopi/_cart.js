// State keranjang (localStorage). Demo saja, tidak ada transaksi nyata.
const KEY = "teduh-cart-v1";
export const fmt = (n) => "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const meta = () => { try { return JSON.parse(document.getElementById("toko-data").textContent); } catch { return {}; } };
let state = { items: [], voucher: "" };
try { state = JSON.parse(localStorage.getItem(KEY)) || state; } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} document.dispatchEvent(new CustomEvent("cart:change")); };
export const Cart = {
  add(slug, v = 0, qty = 1) { const it = state.items.find((i) => i.slug === slug && i.v === v); it ? (it.qty += qty) : state.items.push({ slug, v, qty }); save(); },
  setQty(slug, v, qty) { const it = state.items.find((i) => i.slug === slug && i.v === v); if (!it) return; it.qty = qty; if (qty < 1) state.items = state.items.filter((i) => i !== it); save(); },
  remove(slug, v) { state.items = state.items.filter((i) => !(i.slug === slug && i.v === v)); save(); },
  clear() { state = { items: [], voucher: "" }; save(); },
  setVoucher(code) { if (code.trim().toUpperCase() === "TEDUH10") { state.voucher = "TEDUH10"; save(); return true; } return false; },
  get voucher() { return state.voucher; },
  totals() {
    const m = meta();
    const L = state.items.filter((i) => m[i.slug]).map((i) => { const p = m[i.slug], vr = p.variants[i.v] || p.variants[0]; const price = p.price + vr.add; return { ...i, name: p.name, img: p.img, url: p.url, label: vr.label, price, total: price * i.qty }; });
    const sub = L.reduce((a, l) => a + l.total, 0), count = L.reduce((a, l) => a + l.qty, 0);
    const disc = state.voucher ? Math.round(sub * 0.1) : 0;
    const ship = !sub || sub - disc >= 250000 ? 0 : 20000;
    return { L, sub, count, disc, ship, total: sub - disc + ship, left: Math.max(0, 250000 - (sub - disc)) };
  },
};
export function toast(msg) {
  const t = document.getElementById("toast"); if (!t) return;
  t.textContent = msg; t.classList.add("on"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2400);
}
export const wish = {
  get() { try { return JSON.parse(localStorage.getItem("teduh-wish")) || []; } catch { return []; } },
  toggle(s) { const w = this.get(), i = w.indexOf(s); i > -1 ? w.splice(i, 1) : w.push(s); try { localStorage.setItem("teduh-wish", JSON.stringify(w)); } catch {} return i === -1; },
};
