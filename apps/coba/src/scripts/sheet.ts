/** Membungkus <dialog>: tutup lewat [data-close], klik latar, atau Esc; mengunci scroll halaman. */
export function wireSheet(d: HTMLDialogElement, onClose?: () => void) {
  d.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t === d || t.closest("[data-close]")) d.close();
  });
  d.addEventListener("close", () => { document.body.style.overflow = ""; onClose?.(); });
  return () => { d.showModal(); document.body.style.overflow = "hidden"; };
}
