'use client'

import { useState } from 'react'

type Preview = {
  id: string
  text: string | null
  status: string
  template_type: string | null
  normalized_data: Record<string, unknown> | null
  error: string | null
  created_at: string
  completed_at: string | null
  content: Record<string, unknown> | null
  completeness: string | null
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    uploading: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  )
}

export default function PreviewTable({
  previews,
}: {
  previews: Preview[]
}) {
  const [selected, setSelected] = useState<Preview | null>(null)

  return (
    <div className="flex min-w-0 gap-5">
      <section className="min-w-0 flex-1 overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h1 className="text-xl font-bold">Previews</h1>
          <p className="mt-1 text-sm text-gray-500">
            Klik salah satu preview untuk melihat rinciannya.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">Preview</th>
                <th className="p-4">Template</th>
                <th className="p-4">Status</th>
                <th className="p-4">Dibuat</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {previews.map((preview) => (
                <tr
                  key={preview.id}
                  tabIndex={0}
                  onClick={() => setSelected(preview)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelected(preview)
                    }
                  }}
                  className={`cursor-pointer transition hover:bg-blue-50 focus:bg-blue-50 ${
                    selected?.id === preview.id
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <td className="max-w-xs p-4">
                    <p className="truncate font-medium text-gray-900">
                      {preview.text || '(Tanpa teks)'}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-400">
                      {preview.id}
                    </p>
                  </td>

                  <td className="p-4">
                    {preview.template_type || '-'}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={preview.status} />
                  </td>

                  <td className="whitespace-nowrap p-4 text-gray-500">
                    {formatDate(preview.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {previews.length === 0 && (
            <p className="p-8 text-center text-gray-500">
              Belum ada data preview.
            </p>
          )}
        </div>
      </section>

      {selected && (
        <aside className="w-full shrink-0 rounded-xl border bg-white shadow-sm lg:w-[400px]">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="text-lg font-bold">Detail Preview</h2>

            <button
              onClick={() => setSelected(null)}
              className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
              aria-label="Tutup detail"
            >
              ×
            </button>
          </div>

          <div className="max-h-[80vh] space-y-5 overflow-y-auto p-5">
            <div>
              <StatusBadge status={selected.status} />
              <p className="mt-2 break-all text-xs text-gray-500">
                ID: {selected.id}
              </p>
            </div>

            <Detail label="Teks" value={selected.text} />

            <Detail
              label="Template Type"
              value={selected.template_type}
            />

            <Detail
              label="Completeness"
              value={selected.completeness}
            />

            <Detail
              label="Created At"
              value={formatDate(selected.created_at)}
            />

            <Detail
              label="Completed At"
              value={formatDate(selected.completed_at)}
            />

            <JsonSection
              title="Normalized Data"
              value={selected.normalized_data}
            />

            <JsonSection
              title="Content"
              value={selected.content}
            />

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                Error
              </h3>
              <pre className="whitespace-pre-wrap break-words rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {selected.error || '-'}
              </pre>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-gray-700">
        {label}
      </h3>
      <p className="break-words text-sm text-gray-600">
        {value || '-'}
      </p>
    </div>
  )
}

function JsonSection({
  title,
  value,
}: {
  title: string
  value: Record<string, unknown> | null
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">
        {title}
      </h3>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-700">
        {value ? JSON.stringify(value, null, 2) : '-'}
      </pre>
    </div>
  )
}
