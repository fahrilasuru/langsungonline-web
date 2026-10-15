// Ubah BASE jika folder halaman berbeda (src/pages/toko-kopi/ => /toko-kopi)
export const BASE = "/demo/toko-kopi";
export const WA = "62881036209010";
export const fmt = (n) => "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
export const IMG = {
  hero: U("1554118811-1e0d58224f24", 1600),
  shop: U("1554118811-1e0d58224f24", 900),
  team: U("1600880292203-757bb62b4baf", 900),
  pour: U("1442512595331-e89e73853f31", 900),
  latte: U("1495474472287-4d71bcdd2085", 900),
  beans: U("1447933601403-0c6688de566e", 900),
  cafe: U("1497935586351-b67a49e012bf", 900),
  work: U("1521017432531-fbd92d768814", 900),
  cup: U("1509042239860-f550ce710b93", 900),
  v60: U("1514432324607-a09d9b4aefdd", 900),
  art: U("1461023058943-07fcbe16d735", 900),
  mug: U("1507133750040-4a8f57021571", 900),
};
export const categories = [
  { id: "biji", label: "Biji Kopi", icon: "fa-seedling", img: IMG.beans, desc: "Single origin, disangrai segar" },
  { id: "alat", label: "Alat Seduh", icon: "fa-mug-hot", img: IMG.v60, desc: "Dripper, kettle, grinder" },
  { id: "paket", label: "Paket Hemat", icon: "fa-gift", img: IMG.pour, desc: "Starter kit & hampers" },
  { id: "merch", label: "Merchandise", icon: "fa-bag-shopping", img: IMG.mug, desc: "Tumbler & tote bag" },
];
const sz = [{ label: "250 g", add: 0 }, { label: "500 g", add: 90000 }, { label: "1 kg", add: 180000 }];
export const products = [
  { slug: "aceh-gayo-single-origin", name: "Aceh Gayo Single Origin", cat: "biji", price: 98000, old: 115000, rating: 4.9, reviews: 312, sold: 1280, badge: "Sale", bg: "#d9c3a5", img: IMG.beans, imgs: [IMG.beans, IMG.cup, IMG.art],
    short: "Cokelat gelap, rempah manis, body tebal.", desc: "Dipetik dari dataran tinggi Takengon dan diproses full washed. Medium roast dengan body tebal dan after taste cokelat yang bersih. Cocok untuk espresso, V60, maupun tubruk.",
    notes: ["Cokelat gelap", "Rempah", "Karamel"], roast: 3, specs: [["Asal", "Takengon, Aceh"], ["Ketinggian", "1.200 - 1.500 mdpl"], ["Proses", "Full washed"], ["Varietas", "Ateng, Gayo 1"]], variants: sz },
  { slug: "toraja-sapan-medium", name: "Toraja Sapan Medium", cat: "biji", price: 105000, rating: 4.8, reviews: 244, sold: 940, bg: "#b9cdb5", img: IMG.cup, imgs: [IMG.cup, IMG.beans, IMG.pour],
    short: "Herbal, asam lembut, manis panjang.", desc: "Kopi dari desa Sapan, Tana Toraja. Aroma herbal dengan keasaman lembut dan manis yang bertahan lama. Favorit para penyeduh V60 dan Aeropress.",
    notes: ["Herbal", "Gula aren", "Teh hitam"], roast: 3, specs: [["Asal", "Sapan, Toraja"], ["Ketinggian", "1.400 - 1.700 mdpl"], ["Proses", "Semi washed"], ["Varietas", "Typica, S795"]], variants: sz },
  { slug: "bali-kintamani-natural", name: "Bali Kintamani Natural", cat: "biji", price: 112000, rating: 4.7, reviews: 98, sold: 410, badge: "Baru", bg: "#f2c9a0", img: IMG.art, imgs: [IMG.art, IMG.beans, IMG.latte],
    short: "Buah tropis dan jeruk, light roast.", desc: "Dijemur natural di bawah sinar matahari Kintamani. Karakter buah tropis dan jeruk yang cerah, dengan body ringan. Disarankan diseduh manual tanpa susu.",
    notes: ["Jeruk", "Mangga", "Madu"], roast: 2, specs: [["Asal", "Kintamani, Bali"], ["Ketinggian", "1.200 - 1.600 mdpl"], ["Proses", "Natural"], ["Varietas", "Arabika Kintamani"]], variants: sz.slice(0, 2) },
  { slug: "flores-bajawa-honey", name: "Flores Bajawa Honey", cat: "biji", price: 108000, rating: 4.8, reviews: 76, sold: 305, bg: "#e6d5a8", img: IMG.latte, imgs: [IMG.latte, IMG.beans, IMG.cup],
    short: "Manis madu, kacang, tekstur lembut.", desc: "Proses honey dari lereng Gunung Inerie. Rasa manis seperti madu, kacang panggang dan tekstur lembut. Enak untuk latte maupun diseduh hitam.",
    notes: ["Madu", "Kacang", "Vanila"], roast: 3, specs: [["Asal", "Bajawa, Flores"], ["Ketinggian", "1.300 - 1.600 mdpl"], ["Proses", "Honey"], ["Varietas", "Typica, Catimor"]], variants: sz.slice(0, 2) },
  { slug: "v60-dripper-keramik", name: "V60 Dripper Keramik", cat: "alat", price: 145000, old: 175000, rating: 4.8, reviews: 402, sold: 2010, badge: "Sale", bg: "#cfd8d2", img: IMG.v60, imgs: [IMG.v60, IMG.pour, IMG.cup],
    short: "Ukuran 02, tahan panas, mudah dibersihkan.", desc: "Dripper keramik ukuran 02 untuk 1 sampai 4 cangkir. Alur spiral membantu aliran air merata sehingga ekstraksi lebih konsisten.",
    notes: [], specs: [["Bahan", "Keramik glazur"], ["Ukuran", "02 (1-4 cup)"], ["Berat", "380 g"], ["Garansi", "7 hari tukar"]], variants: [{ label: "Putih", add: 0 }, { label: "Hitam", add: 10000 }, { label: "Hijau lumut", add: 15000 }] },
  { slug: "gooseneck-kettle-600", name: "Gooseneck Kettle 600 ml", cat: "alat", price: 289000, rating: 4.9, reviews: 187, sold: 760, bg: "#c8d4e0", img: IMG.pour, imgs: [IMG.pour, IMG.v60, IMG.cafe],
    short: "Tuangan presisi, gagang anti panas.", desc: "Kettle stainless dengan leher angsa untuk kontrol tuangan yang halus. Gagang anti panas dan alas datar yang cocok untuk semua jenis kompor.",
    notes: [], specs: [["Bahan", "Stainless 304"], ["Kapasitas", "600 ml"], ["Kompor", "Gas, listrik, induksi"], ["Garansi", "1 tahun"]], variants: [{ label: "Hitam doff", add: 0 }, { label: "Silver", add: 0 }] },
  { slug: "grinder-manual-stainless", name: "Grinder Manual Stainless", cat: "alat", price: 425000, old: 499000, rating: 4.8, reviews: 133, sold: 530, badge: "Sale", bg: "#d5d0e0", img: IMG.cafe, imgs: [IMG.cafe, IMG.beans, IMG.work],
    short: "Burr baja 38 mm, 30 tingkat kehalusan.", desc: "Grinder manual dengan burr baja 38 mm dan 30 tingkat kehalusan. Hasil gilingan seragam dari espresso sampai french press.",
    notes: [], specs: [["Burr", "Baja 38 mm"], ["Kapasitas", "25 g biji"], ["Pengaturan", "30 klik"], ["Garansi", "1 tahun"]], variants: [{ label: "Standar", add: 0 }] },
  { slug: "timbangan-kopi-digital", name: "Timbangan Kopi Digital", cat: "alat", price: 215000, rating: 4.7, reviews: 91, sold: 340, bg: "#d8dcc8", img: IMG.work, imgs: [IMG.work, IMG.v60, IMG.cup],
    short: "Akurasi 0,1 g dengan timer bawaan.", desc: "Timbangan dengan timer terintegrasi, akurasi 0,1 g dan kapasitas 2 kg. Permukaan tahan air untuk dipakai saat menyeduh.",
    notes: [], specs: [["Akurasi", "0,1 g"], ["Kapasitas", "2 kg"], ["Daya", "USB-C"], ["Garansi", "6 bulan"]], variants: [{ label: "Hitam", add: 0 }, { label: "Putih", add: 0 }] },
  { slug: "paket-starter-seduh-rumah", name: "Paket Starter Seduh Rumah", cat: "paket", price: 349000, old: 430000, rating: 5, reviews: 164, sold: 620, badge: "Sale", bg: "#f0dc9a", img: IMG.pour, imgs: [IMG.pour, IMG.v60, IMG.beans],
    short: "Kopi 250 g, V60, filter, dan scoop kayu.", desc: "Semua yang dibutuhkan untuk mulai menyeduh di rumah: 1 pack kopi 250 g, V60 dripper keramik, 40 filter kertas, dan scoop kayu. Dikemas rapi dalam box.",
    notes: [], specs: [["Isi", "Kopi, dripper, filter, scoop"], ["Berat", "1,1 kg"], ["Kemasan", "Gift box"], ["Garansi", "7 hari tukar"]], variants: [{ label: "Gayo", add: 0 }, { label: "Toraja", add: 7000 }, { label: "Kintamani", add: 14000 }] },
  { slug: "hampers-kopi-premium", name: "Hampers Kopi Premium", cat: "paket", price: 495000, rating: 4.9, reviews: 58, sold: 190, badge: "Baru", bg: "#e4d3c0", img: IMG.latte, imgs: [IMG.latte, IMG.cup, IMG.beans],
    short: "3 kopi origin, tumbler, dan kartu ucapan.", desc: "Hampers untuk hadiah: 3 kopi single origin masing-masing 100 g, 1 tumbler Teduh, dan kartu ucapan yang bisa ditulis sesuai pesan Anda.",
    notes: [], specs: [["Isi", "3 kopi, tumbler, kartu"], ["Berat", "1,2 kg"], ["Kemasan", "Box premium"], ["Kartu ucapan", "Gratis"]], variants: [{ label: "Tema hijau", add: 0 }, { label: "Tema hitam", add: 0 }] },
  { slug: "tumbler-teduh-450", name: "Tumbler Teduh 450 ml", cat: "merch", price: 129000, rating: 4.6, reviews: 120, sold: 380, bg: "#bfd8cc", img: IMG.mug, imgs: [IMG.mug, IMG.cup, IMG.work],
    short: "Panas 8 jam, dingin 12 jam.", desc: "Tumbler vakum stainless dengan logo Teduh. Menjaga minuman panas selama 8 jam dan dingin 12 jam. Tutup anti bocor.",
    notes: [], specs: [["Bahan", "Stainless 304"], ["Kapasitas", "450 ml"], ["Tahan panas", "8 jam"], ["Tahan dingin", "12 jam"]], variants: [{ label: "Hijau", add: 0 }, { label: "Hitam", add: 0 }, { label: "Putih", add: 0 }] },
  { slug: "tote-bag-kanvas", name: "Tote Bag Kanvas Teduh", cat: "merch", price: 79000, rating: 4.7, reviews: 64, sold: 215, bg: "#e8e2d4", img: IMG.cafe, imgs: [IMG.cafe, IMG.shop, IMG.work],
    short: "Kanvas tebal dengan sablon logo.", desc: "Tote bag kanvas tebal dengan sablon logo Teduh. Muat laptop 14 inci dan cukup kuat untuk membawa beberapa pack kopi.",
    notes: [], specs: [["Bahan", "Kanvas 12 oz"], ["Ukuran", "38 x 40 cm"], ["Sablon", "Plastisol"], ["Cuci", "Boleh mesin cuci"]], variants: [{ label: "Natural", add: 0 }, { label: "Hijau tua", add: 0 }] },
];
export const reviews = [
  { name: "Rina W.", city: "Surabaya", text: "Aromanya langsung terasa begitu kantong dibuka. Tanggal sangrainya baru, packing rapi.", stars: 5 },
  { name: "Dimas P.", city: "Malang", text: "Pengiriman cepat dan hasil seduhan konsisten. Sudah repeat order tiga kali.", stars: 5 },
  { name: "Sari A.", city: "Sidoarjo", text: "Sesuai deskripsi. Admin juga membantu saya memilih kopi untuk espresso rumahan.", stars: 4 },
];
