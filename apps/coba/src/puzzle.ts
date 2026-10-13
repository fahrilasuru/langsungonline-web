// Potongan acak dari satu gambar: tiap kotak diberi zoom dan titik fokus sendiri, deterministik menurut seed (handle),
// supaya server dan browser selalu menampilkan potongan yang sama.
export type Crop = { z: number; fx: number; fy: number };

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Fokus disebar di grid 3x3 (acak urutannya) agar kotak berdekatan tidak menampilkan bagian gambar yang sama. */
export function puzzleCrops(seed: string, n = 9): Crop[] {
  const r = rng(seed || "x");
  const cells = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  return cells.map((c) => ({
    z: 1.45 + r() * 0.75,
    fx: Math.min(1, ((c % 3) + 0.15 + r() * 0.7) / 3),
    fy: Math.min(1, (Math.floor(c / 3) + 0.15 + r() * 0.7) / 3),
  }));
}

export const cropStyle = ({ z, fx, fy }: Crop) =>
  `width:${(z * 100).toFixed(1)}%;height:${(z * 100).toFixed(1)}%;left:${(-fx * (z - 1) * 100).toFixed(1)}%;top:${(-fy * (z - 1) * 100).toFixed(1)}%`;
