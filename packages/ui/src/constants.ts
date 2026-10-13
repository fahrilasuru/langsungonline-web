// Satu-satunya sumber URL antar-app dan nomor WhatsApp tim.
// Header/Footer dipakai bersama oleh marketing dan coba, jadi tautan antar-app harus absolut.
// Bisa ditimpa lewat PUBLIC_MARKETING_URL / PUBLIC_COBA_URL (ditanam saat build).
const dev = import.meta.env.DEV;
const trimSlash = (u: string) => u.replace(/\/$/, "");
export const MARKETING_URL: string = trimSlash(
    (import.meta.env.PUBLIC_MARKETING_URL as string | undefined) || (dev ? "http://localhost:4321" : "https://langsung.online"),
);
export const COBA_URL: string = trimSlash(
    (import.meta.env.PUBLIC_COBA_URL as string | undefined) || (dev ? "http://localhost:4322" : "https://coba.langsung.online"),
);

// Nomor WhatsApp tim: format internasional tanpa + (wa.me menolak awalan 0). Bisa ditimpa lewat PUBLIC_WA_NUMBER.
export const WA_NUMBER: string = (import.meta.env.PUBLIC_WA_NUMBER as string | undefined) || "62881036209010";
const phoneNumber = WA_NUMBER;
export const LINK_KONSULTASI = `https://wa.me/${phoneNumber}?text=Halo%20Admin%20Langsung.Online,%20saya%20ingin%20konsultasi%20terkait%20layanan%20yang%20tersedia.`;
export const TEKS_KONSULTASI = "Konsultasi"
export const LINK_STARTER = `https://wa.me/${phoneNumber}?text=Halo%20Admin%20Langsung.Online,%20saya%20ingin%20memesan%20paket%20Starter.`;
export const LINK_BASIC = `https://wa.me/${phoneNumber}?text=Halo%20Admin%20Langsung.Online,%20saya%20ingin%20memesan%20paket%20Basic.`;
export const LINK_GROWTH = `https://wa.me/${phoneNumber}?text=Halo%20Admin%20Langsung.Online,%20saya%20ingin%20memesan%20paket%20Growth.`;
export const LINK_CUSTOM = `https://wa.me/${phoneNumber}?text=Halo%20Admin%20Langsung.Online,%20saya%20ingin%20memesan%20paket%20Custom.`;
export const SERVICE_WEBSITE = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://langsung.online/layanan/#website",
    "name": "Layanan Pembuatan Website",
    "description": "Jasa pembuatan website dari yang gratis hingga premium untuk UMKM dan bisnis.",
    "provider": {
        "@type": "Organization",
        "@id": "https://langsung.online/#organization",
        "name": "Langsung.Online",
        "url": "https://langsung.online/"
    },
    "areaServed": "ID",
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Jasa Pembuatan Website",
        "itemListElement": [
            {
                "@type": "Product",
                "name": "Paket Starter",
                "description": "Punya situs sederhana dulu, upgrade kapan saja. Cocok untuk yang baru memulai.",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "IDR",
                    "priceValidUntil": "2026-12-31",
                    "availability": "https://schema.org/InStock"
                }
            },
            {
                "@type": "Product",
                "name": "Paket Basic",
                "description": "1 halaman utama, alamat .com/.id (tahun pertama), form kontak & peta, keamanan SSL gratis",
                "offers": {
                    "@type": "Offer",
                    "price": "499000",
                    "priceCurrency": "IDR",
                    "priceValidUntil": "2026-12-31",
                    "availability": "https://schema.org/InStock"
                }
            },
            {
                "@type": "Product",
                "name": "Paket Growth",
                "description": "Semua fitur Paket Basic + 5-7 halaman website, email perusahaan (1 akun), desain sesuai merek, statistik pengunjung, muncul di pencarian Google",
                "offers": {
                    "@type": "Offer",
                    "price": "999000",
                    "priceCurrency": "IDR",
                    "priceValidUntil": "2026-12-31",
                    "availability": "https://schema.org/InStock"
                }
            },
            {
                "@type": "Product",
                "name": "Paket Custom",
                "description": "Semua fitur Paket Growth + email perusahaan (5 akun), fitur sesuai permintaan, dukungan prioritas, konsultasi tanpa batas",
                "offers": {
                    "@type": "Offer",
                    "price": "2000000",
                    "priceCurrency": "IDR",
                    "priceValidUntil": "2026-12-31",
                    "availability": "https://schema.org/InStock"
                }
            }
        ]
    }
};