"use client";

import { useEffect, useState } from "react";

type Preview = {
  id: string;
  text: string | null;
  status: string;
  template_type: string | null;
  normalized_data: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
  content: Record<string, unknown> | null;
  completeness: string | null;
};

export default function Previews() {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Preview | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPreviews() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/previews");

        if (!response.ok) {
          throw new Error("Gagal mengambil data preview");
        }

        const result = await response.json();

        if (!cancelled) {
          setPreviews(
            Array.isArray(result.data) ? result.data : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPreviews();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Memuat preview...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
        <button
          className="ml-3 underline"
          onClick={() => window.location.reload()}
        >
          Muat ulang
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:flex-row">
      <section className="min-w-0 flex-1 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Preview</th>
              <th className="p-4">Template</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tanggal</th>
            </tr>
          </thead>

          <tbody>
            {previews.map((preview) => (
              <tr
                key={preview.id}
                onClick={() => setSelected(preview)}
                className={`cursor-pointer border-t hover:bg-blue-50 ${
                  selected?.id === preview.id ? "bg-blue-50" : ""
                }`}
              >
                <td className="max-w-xs truncate p-4">
                  {preview.text || "(Tanpa teks)"}
                </td>
                <td className="p-4">
                  {preview.template_type || "-"}
                </td>
                <td className="p-4">{preview.status}</td>
                <td className="whitespace-nowrap p-4">
                  {new Date(preview.created_at).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}

            {previews.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Belum ada data preview.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {selected && (
        <aside className="w-full min-w-0 rounded-xl border bg-white p-5 lg:w-[400px] lg:shrink-0">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Detail Preview</h2>
            <button onClick={() => setSelected(null)}>
              Tutup ✕
            </button>
          </div>

          <div className="max-h-[75vh] space-y-4 overflow-y-auto">
            <Detail label="ID" value={selected.id} />
            <Detail label="Status" value={selected.status} />
            <Detail label="Teks" value={selected.text} />
            <Detail label="Template" value={selected.template_type} />
            <Detail label="Kelengkapan" value={selected.completeness} />
            <Detail label="Dibuat" value={selected.created_at} />
            <Detail label="Selesai" value={selected.completed_at} />
            <Detail label="Error" value={selected.error} />

            <JsonDetail
              label="Normalized Data"
              value={selected.normalized_data}
            />
            <JsonDetail
              label="Content"
              value={selected.content}
            />
          </div>
        </aside>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-gray-500">
        {label}
      </p>
      <p className="break-words text-sm">{value || "-"}</p>
    </div>
  );
}

function JsonDetail({
  label,
  value,
}: {
  label: string;
  value: Record<string, unknown> | null;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-500">
        {label}
      </p>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-xs">
        {value ? JSON.stringify(value, null, 2) : "-"}
      </pre>
    </div>
  );
}
