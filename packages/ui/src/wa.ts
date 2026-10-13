export const wa = (n: string, t: string) => `https://wa.me/${n}?text=${encodeURIComponent(t)}`;
export const consult = (b: { whatsapp: string; name: string }, id: string) =>
  wa(b.whatsapp, `Halo Langsung Online, saya ingin konsultasi soal preview ${b.name} (ref: ${id}).`);
