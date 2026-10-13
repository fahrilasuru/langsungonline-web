let tt = 0;
export const toast = (root: Element, text: string) => {
  const e = root.querySelector<HTMLElement>(".toast");
  if (!e) return;
  e.textContent = text; e.classList.add("on");
  clearTimeout(tt); tt = window.setTimeout(() => e.classList.remove("on"), 2000);
};
export async function share(root: Element, title: string) {
  try {
    if (navigator.share) await navigator.share({ title, url: location.href });
    else { await navigator.clipboard.writeText(location.href); toast(root, "Tautan disalin"); }
  } catch { /* dibatalkan */ }
}
/** Tab sederhana: tombol [data-tab] menampilkan panel [data-pane] yang namanya sama. */
export function bindTabs(m: HTMLElement) {
  const tabs = [...m.querySelectorAll<HTMLElement>("[data-tab]")];
  const panes = [...m.querySelectorAll<HTMLElement>("[data-pane]")];
  const show = (n: string) => {
    tabs.forEach((t) => { const on = t.dataset.tab === n; t.classList.toggle("on", on); t.setAttribute("aria-selected", String(on)); });
    panes.forEach((p) => (p.hidden = p.dataset.pane !== n));
  };
  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab!)));
  return show;
}
