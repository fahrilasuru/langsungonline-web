export const BASE = "/demo/tutoring/";
export const WA = "6281234567890";
export const wa = (t = "Halo Rumah Pintar, saya ingin konsultasi program belajar. Nama anak: ___, kelas: ___.") =>
    `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
export const img = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
export const nav = [
    ["Beranda", BASE], ["Program", BASE + "program/"], ["Tutor", BASE + "tutor/"],
    ["Harga", BASE + "harga/"], ["Kontak", BASE + "kontak/"],
];
export const programs = [
    { icon: "fa-calculator", name: "Matematika & IPA", lvl: "SD • SMP • SMA", img: "1503676260728-1c00da094a0b", desc: "Konsep dijelaskan dari dasar, lalu dilatih lewat soal bertahap sampai anak berani mengerjakan sendiri.", pts: ["Latihan soal sesuai kurikulum sekolah", "Pendalaman konsep yang belum paham", "Laporan perkembangan tiap bulan"] },
    { icon: "fa-spell-check", name: "Calistung & Pendampingan SD", lvl: "TK B • Kelas 1–6", img: "1509062522246-3755977927d7", desc: "Belajar membaca, menulis, dan berhitung dengan cara santai, plus bantuan mengerjakan PR.", pts: ["Metode bermain sambil belajar", "Bantu PR dan persiapan ulangan", "Kebiasaan belajar yang konsisten"] },
    { icon: "fa-language", name: "Bahasa Inggris", lvl: "SD • SMP • SMA • Umum", img: "1456513080510-7bf3a84b82f8", desc: "Speaking, grammar, dan persiapan tes dengan topik yang dekat dengan keseharian siswa.", pts: ["Percakapan langsung dengan tutor", "Persiapan TOEFL dan IELTS dasar", "Kosakata yang dipakai nyata"] },
    { icon: "fa-graduation-cap", name: "Persiapan UTBK & Ujian", lvl: "Kelas 11–12 • Alumni", img: "1523240795612-9a054b0db644", desc: "Strategi mengerjakan soal, tryout berkala, dan pembahasan yang menunjukkan di mana poin hilang.", pts: ["Tryout bulanan dengan analisis hasil", "Pemetaan target jurusan dan kampus", "Latihan manajemen waktu"] },
    { icon: "fa-laptop-code", name: "Coding untuk Pelajar", lvl: "SMP • SMA", img: "1513258496099-48168024aec0", desc: "Mulai dari logika pemrograman sampai membuat proyek kecil, tanpa perlu pengalaman sebelumnya.", pts: ["Python dan web dasar", "Proyek akhir yang bisa dipamerkan", "Pendampingan lomba sekolah"] },
    { icon: "fa-pen-nib", name: "Menulis & Bahasa Indonesia", lvl: "SMP • SMA", img: "1434030216411-0b793f4b4173", desc: "Melatih menulis esai, memahami bacaan, dan menyusun argumen dengan rapi.", pts: ["Umpan balik tertulis tiap tugas", "Latihan literasi dan esai", "Persiapan seleksi beasiswa"] },
];
export const tutors = [
    { n: "Rina Kusuma, S.Pd.", s: "Matematika", e: "9 tahun mengajar • Lulusan Unesa", i: "1573496359142-b8d87734a5a2" },
    { n: "Dimas Prakoso, S.Si.", s: "Fisika & Kimia", e: "7 tahun mengajar • Lulusan ITS", i: "1560250097-0b93528c311a" },
    { n: "Nadia Putri, M.Pd.", s: "Bahasa Inggris", e: "IELTS 8.0 • 6 tahun mengajar", i: "1494790108377-be9c29b29330" },
    { n: "Fajar Hidayat, S.T.", s: "Coding & UTBK Saintek", e: "5 tahun mengajar • Lulusan ITS", i: "1507003211169-0a1dd7228f2d" },
    { n: "Sari Wulandari, S.Pd.", s: "Calistung & SD", e: "10 tahun mengajar • Guru SD", i: "1438761681033-6461ffad8d80" },
    { n: "Bagas Setiawan, S.Hum.", s: "Bahasa Indonesia", e: "6 tahun mengajar • Lulusan Unair", i: "1500648767791-00dcc994a43e" },
];
export const testi = [
    { q: "Nilai matematika anak saya naik dari 62 ke 85 dalam satu semester. Yang paling terasa, dia tidak lagi takut angka.", w: "Ibu Maya", r: "Orang tua siswa kelas 8, Rungkut", i: "1580489944761-15a19d654956" },
    { q: "Tutornya sabar dan laporan bulanannya jelas. Saya jadi tahu bagian mana yang masih perlu dilatih di rumah.", w: "Bapak Hendra", r: "Orang tua siswa kelas 4, Gubeng", i: "1472099645785-5658abf4ff4e" },
    { q: "Tryout dan pembahasannya membantu banget. Saya diterima di jurusan yang saya incar lewat jalur UTBK.", w: "Kevin", r: "Alumni, kelas 12", i: "1544005313-94ddf0286df2" },
];
export const faqs = [
    ["Apakah ada kelas percobaan?", "Ada. Kelas percobaan pertama gratis 60 menit, supaya anak dan tutor bisa saling mengenal sebelum Anda memutuskan."],
    ["Belajarnya di mana?", "Bisa di rumah siswa (Surabaya, Sidoarjo, Gresik), di pusat belajar kami, atau online lewat Zoom."],
    ["Bagaimana kalau jadwal berubah?", "Jadwal bisa digeser maksimal 3 jam sebelum kelas tanpa mengurangi sesi. Sesi yang batal dari pihak tutor selalu diganti."],
    ["Bisakah ganti tutor?", "Bisa, tanpa biaya tambahan. Kami akan mencarikan tutor lain yang lebih cocok dengan gaya belajar anak."],
    ["Apakah ada laporan perkembangan?", "Ya. Orang tua menerima catatan setelah tiap sesi lewat WhatsApp dan laporan lengkap setiap bulan."],
    ["Bagaimana cara pembayaran?", "Pembayaran dilakukan per paket (bulanan), via transfer atau e-wallet. Tidak ada biaya pendaftaran tersembunyi."],
];
