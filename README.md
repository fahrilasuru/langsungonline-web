# Langsung.Online (monorepo)

Monorepo pnpm workspace dengan dua app Astro 5 dan satu paket UI bersama.

| Path | Domain | Isi |
|---|---|---|
| `apps/marketing` | `langsung.online` | Beranda, `/layanan`, `/kontak`. Statis penuh, tanpa adapter |
| `apps/coba` | `coba.langsung.online` | Formulir cerita, riwayat, `/preview/<id>` (SSR), `/demo/*`. Adapter Vercel |
| `packages/ui` | (paket `@langsungonline/ui`) | `Base` layout, Header, Footer, WhatsAppFAB, StoryForm, CTA, FAQ, Flow, PageHero, NotFound, `global.css`, `constants.ts`, `wa.ts` |

Satu app = satu host. Tidak ada middleware atau percabangan host; yang membedakan app hanyalah deploy-nya.

## Menjalankan lokal

Prasyarat: Node 24.x dan pnpm.

```bash
pnpm install
cp apps/marketing/.env.example apps/marketing/.env
cp apps/coba/.env.example apps/coba/.env
pnpm dev                 # marketing :4321 dan coba :4322 sekaligus
pnpm dev:marketing       # satu app saja
pnpm dev:coba
pnpm build               # build kedua app
pnpm gen:types           # regenerasi apps/coba/src/types.ts dari OpenAPI backend
```

## Tautan antar-app

Header, Footer, CTA, dan redirect setelah kirim formulir dipakai kedua app, jadi tautannya absolut,
bersumber dari `MARKETING_URL` dan `COBA_URL` di `packages/ui/src/constants.ts`.
Bawaannya `localhost:4321` / `localhost:4322` saat dev dan domain produksi saat build; bisa ditimpa
dengan `PUBLIC_MARKETING_URL` dan `PUBLIC_COBA_URL`.

## Aturan paket `packages/ui`

- Masuk ke `ui` hanya bila dipakai **kedua** app. Yang dipakai satu app tinggal di app itu.
- `ui` tidak boleh mengimpor dari `apps/*`.
- Impor dari app: `@langsungonline/ui/layouts/Base.astro`, `@langsungonline/ui/components/...`,
  `@langsungonline/ui/scripts/...`, `@langsungonline/ui/styles/...`, `@langsungonline/ui/constants`, `@langsungonline/ui/wa`.
- `styles/global.css` memuat `@source "../"` supaya Tailwind v4 ikut memindai class di komponen `ui`.
  Jangan dihapus.

## Environment

| Variabel | App | Dibaca | Keterangan |
|---|---|---|---|
| `API_URL` | coba | Server, runtime | URL API untuk `/preview/<id>`. Wajib di produksi |
| `PUBLIC_API_URL` | marketing, coba | Browser, saat build | URL API untuk formulir |
| `PUBLIC_MARKETING_URL`, `PUBLIC_COBA_URL` | keduanya | Saat build | Opsional, lihat di atas |
| `PUBLIC_WA_NUMBER` | keduanya | Saat build | Opsional, nomor WhatsApp tim |

## Deploy ke Vercel

Buat **dua project** dari repo yang sama:

| Project | Root Directory | Domain | Env |
|---|---|---|---|
| marketing | `apps/marketing` | `langsung.online` | `PUBLIC_API_URL` |
| coba | `apps/coba` | `coba.langsung.online` | `API_URL`, `PUBLIC_API_URL` |

Biarkan "Include source files outside of the Root Directory" aktif agar `packages/ui` ikut terbaca.
Install command bawaan (`pnpm install`) sudah cukup karena `pnpm-workspace.yaml` ada di root.

Setiap app punya `vercel.json` sendiri (header keamanan). `apps/marketing/vercel.json` juga meneruskan
`/demo/*` dan `/preview/*` dari `langsung.online` ke `coba.langsung.online` dengan redirect 301,
supaya URL lama tidak mati. CSP masih Report-Only; tambahkan domain API ke `connect-src` sebelum memblokir.

## Konvensi demo

- Satu demo = satu folder di `apps/coba/src/pages/demo/`. Berkas pendukung diawali `_` agar bukan rute.
- Menambah demo: buat rutenya, lalu tambahkan satu entri di `apps/coba/src/pages/demo/_demos.ts`.
- `_DemoWrapper.astro` adalah layout bersama semua demo; prop `bar` menampilkan bar "Contoh website ...".
