// Data statis brosur acara. Dirender Astro (teks otomatis di-escape). Berkas berawalan "_" bukan route.

export const WA_NUMBER = "6281234567890";
export const EMAIL = "panitia@naikkelas.id";

export const EVENT = {
    name: "Naik Kelas",
    subtitle: "Seminar Usaha Kuliner Lokal 2026",
    tagline: "Satu hari bersama pelaku usaha kuliner yang sudah melewatinya: dari hitungan modal, menu, sampai cara membuat pelanggan kembali.",
    dateISO: "2026-11-28",
    dateLong: "Sabtu, 28 November 2026",
    dateDay: "28",
    dateMonth: "NOV",
    dateYear: "2026",
    start: "09.00",
    end: "15.30",
    icsStart: "20261128T020000Z", // 09.00 WIB
    icsEnd: "20261128T083000Z", // 15.30 WIB
    venue: "Aula Graha Serbaguna",
    address: "Jl. Veteran No. 21, Lowokwaru, Kota Malang",
    price: 75000,
    quota: 150,
    left: 38,
} as const;

export const MAPS_URL =
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Jl. Veteran No. 21, Lowokwaru, Malang");

export const waLink = (text: string): string => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

export interface Speaker {
    name: string;
    role: string;
    topic: string;
    initials: string;
    tone: 1 | 2 | 3 | 4;
}

export const speakers: Speaker[] = [
    { name: "Dinda Maharani", role: "Pendiri Dapur Dinda", topic: "Dari dapur rumah ke 40 gerai", initials: "DM", tone: 1 },
    { name: "Rizky Hartono", role: "Praktisi pemasaran digital F&B", topic: "Konten yang membuat orang datang", initials: "RH", tone: 2 },
    { name: "Laras Wibisono", role: "Konsultan keuangan UMKM", topic: "Menghitung HPP dan margin dengan benar", initials: "LW", tone: 3 },
    { name: "Chef Arman Siregar", role: "Chef dan pemilik restoran", topic: "Menu konsisten di skala besar", initials: "AS", tone: 4 },
];

export interface Slot {
    time: string;
    title: string;
    by?: string;
    kind: "sesi" | "umum" | "rehat";
}

export const rundown: Slot[] = [
    { time: "08.30", title: "Registrasi ulang dan sambutan", kind: "umum" },
    { time: "09.00", title: "Pembukaan", kind: "umum" },
    { time: "09.30", title: "Dari dapur rumah ke 40 gerai", by: "Dinda Maharani", kind: "sesi" },
    { time: "10.45", title: "Konten yang membuat orang datang", by: "Rizky Hartono", kind: "sesi" },
    { time: "12.00", title: "Makan siang dan networking", kind: "rehat" },
    { time: "13.00", title: "Menghitung HPP dan margin dengan benar", by: "Laras Wibisono", kind: "sesi" },
    { time: "14.00", title: "Menu konsisten di skala besar", by: "Chef Arman Siregar", kind: "sesi" },
    { time: "15.00", title: "Tanya jawab dan penutup", kind: "umum" },
];

export const includes = ["Tempat duduk dan materi digital", "Makan siang dan coffee break", "Sertifikat peserta", "Akses grup alumni peserta"];

export const rupiah = (n: number): string => "Rp" + n.toLocaleString("id-ID");
