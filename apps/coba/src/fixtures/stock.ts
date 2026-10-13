// Foto stok (Unsplash). ID ditulis dari ingatan: VERIFIKASI semuanya sebelum dipakai.
// Di produksi, backend memilih dari pustaka aset yang sudah dicek dan mengirim {url, alt}.
const U = (id: string, alt: string, w = 900) => ({ url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`, alt });
export const coffee = {
  cup: U("photo-1495474472287-4d71bcdd2085", "Secangkir kopi di atas meja"),
  latte: U("photo-1511920170033-f8396924c348", "Kopi susu dalam gelas"),
  beans: U("photo-1447933601403-0c6688de566e", "Biji kopi sangrai"),
  cafe: U("photo-1554118811-1e0d58224f24", "Suasana kedai kopi"),
  bread: U("photo-1504754524776-8f4f37790ca0", "Sajian roti dan kopi"),
};
export const studio = {
  team: U("photo-1522202176988-66273c2fd55f", "Tim sedang berdiskusi"),
  laptop: U("photo-1498050108023-c5249f4df085", "Laptop di meja kerja"),
  desk: U("photo-1519389950473-47ba0277781c", "Rekan kerja di depan laptop"),
  meeting: U("photo-1542744173-8e7e53415bb0", "Rapat bersama klien"),
};
export const community = {
  group: U("photo-1529156069898-49953e39b3ac", "Sekelompok teman berkumpul"),
  chat: U("photo-1511632765486-a01980e01a18", "Teman-teman mengobrol bersama"),
  room: U("photo-1540575467063-178a50c2df87", "Peserta acara di ruang pertemuan"),
  learn: U("photo-1523580494863-6f3031224c94", "Peserta belajar bersama"),
};
