'use client'

import { useEffect, useMemo, useState } from 'react'

type Pesan = {
  id: number
  business_name: string
  business_field: string
  city: string
  social_ref: string | null
  goal: string
  whatsapp: string
  created_at: string
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
})

const formatDate = (date: string) => dateFormatter.format(new Date(date))

function waLink(number: string) {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  return `https://wa.me/${digits}`
}

function safeUrl(url: string | null) {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function WhatsAppButton({ number }: { number: string }) {
  return (
    <a
      href={waLink(number)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
    >
      Hubungi
    </a>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      {children}
    </span>
  )
}

export default function PesanLangsungPage() {
  const [data, setData] = useState<Pesan[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/pesan-langsung', { cache: 'no-store' })
        if (!res.ok) throw new Error('Gagal mengambil data')
        const result = await res.json()
        setData(result.data ?? [])
      } catch {
        setError('Data gagal dimuat. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((item) =>
      [
        item.business_name,
        item.business_field,
        item.city,
        item.goal,
        item.whatsapp,
      ].some((v) => v?.toLowerCase().includes(keyword))
    )
  }, [data, search])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Memuat data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-red-600">
        {error}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Pesan Langsung
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data calon pelanggan bisnis.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Stat label="Total data" value={data.length} />
          <Stat label="Hasil pencarian" value={filteredData.length} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama bisnis, kota, tujuan..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {filteredData.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500">
              Tidak ada data yang cocok.
            </p>
          ) : (
            <>
              {/* Mobile: kartu */}
              <ul className="divide-y divide-gray-200 md:hidden">
                {filteredData.map((item) => {
                  const social = safeUrl(item.social_ref)
                  return (
                    <li key={item.id} className="space-y-3 p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.business_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.business_field} · {item.city}
                        </p>
                      </div>
                      <Badge>{item.goal}</Badge>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                          {formatDate(item.created_at)}
                        </p>
                        <div className="flex items-center gap-3">
                          {social && (
                            <a
                              href={social}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Profil
                            </a>
                          )}
                          <WhatsAppButton number={item.whatsapp} />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* Desktop: tabel */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Bisnis</th>
                      <th className="px-4 py-3 font-medium">Kota</th>
                      <th className="px-4 py-3 font-medium">Tujuan</th>
                      <th className="px-4 py-3 font-medium">WhatsApp</th>
                      <th className="px-4 py-3 font-medium">Tanggal masuk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((item) => {
                      const social = safeUrl(item.social_ref)
                      return (
                        <tr key={item.id} className="align-top hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {item.business_name}
                            </p>
                            <p className="text-gray-500">
                              {item.business_field}
                            </p>
                            {social && (
                              <a
                                href={social}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Lihat profil
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.city}
                          </td>
                          <td className="px-4 py-3">
                            <Badge>{item.goal}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <WhatsAppButton number={item.whatsapp} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                            {formatDate(item.created_at)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
            Menampilkan {filteredData.length} dari {data.length} data
          </div>
        </div>
      </div>
    </main>
  )
}