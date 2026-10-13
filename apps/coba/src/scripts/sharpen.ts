// Menggambar ulang potongan gambar ke <canvas> pada resolusi layar, lalu mempertajamnya (unsharp 3x3).
// Gagal diam-diam (CORS, canvas tercemar): <img> asli tetap tampil.
function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number, a: number) {
  const src = ctx.getImageData(0, 0, w, h), out = ctx.createImageData(w, h), s = src.data, d = out.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      for (let k = 0; k < 3; k++) {
        const up = s[(Math.max(y - 1, 0) * w + x) * 4 + k], dn = s[(Math.min(y + 1, h - 1) * w + x) * 4 + k];
        const lf = s[(y * w + Math.max(x - 1, 0)) * 4 + k], rt = s[(y * w + Math.min(x + 1, w - 1)) * 4 + k];
        d[i + k] = s[i + k] * (1 + 4 * a) - a * (up + dn + lf + rt); // Uint8ClampedArray membatasi 0..255
      }
      d[i + 3] = s[i + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
}

function enhanceOne(img: HTMLImageElement) {
  if (img.dataset.done || !img.parentElement) return;
  const box = img.parentElement, r = box.getBoundingClientRect();
  if (!r.width || !r.height) return; // belum terlihat (mis. dialog tertutup): coba lagi nanti
  img.dataset.done = "1";
  const z = +img.dataset.z!, fx = +img.dataset.fx!, fy = +img.dataset.fy!;
  const src = new Image();
  src.crossOrigin = "anonymous"; // gambar terpisah: bila server tanpa CORS, <img> asli tidak terganggu
  src.onload = () => {
    try {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
      const c = document.createElement("canvas");
      c.width = W; c.height = H; c.className = "pz-c";
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      const nw = src.naturalWidth, nh = src.naturalHeight, s0 = Math.max(W / nw, H / nh);
      const bw = W / s0, bh = H / s0, bx = (nw - bw) / 2, by = (nh - bh) / 2; // area yang terlihat pada zoom 1 (cover)
      ctx.drawImage(src, bx + fx * (bw - bw / z), by + fy * (bh - bh / z), bw / z, bh / z, 0, 0, W, H);
      sharpen(ctx, W, H, 0.55);
      img.replaceWith(c);
    } catch { img.dataset.done = "x"; } // biarkan <img> asli
  };
  src.src = img.currentSrc || img.src;
}

export function enhance(imgs: Iterable<HTMLImageElement>) { for (const i of imgs) enhanceOne(i); }

/** Memproses saat mockup mendekati layar, supaya halaman tidak memuat gambar yang tidak pernah dilihat. */
export function enhanceWhenVisible(root: HTMLElement, selector: string) {
  const run = () => enhance(root.querySelectorAll<HTMLImageElement>(selector));
  if (!("IntersectionObserver" in window)) return run();
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { run(); io.disconnect(); } }, { rootMargin: "300px" });
  io.observe(root);
}
