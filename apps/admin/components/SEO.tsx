"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Row = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type DashboardData = {
  period: { startDate: string; endDate: string };
  summary: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  daily: Row[];
  queries: Row[];
  pages: Row[];
};

const numberFormat = new Intl.NumberFormat("id-ID");

export default function SeoDashboard() {
  const [days, setDays] = useState(28);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/seo?days=${days}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Data SEO gagal dimuat");
        }

        setData(await response.json());
      } catch (err) {
        if (err instanceof Error &&
            err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [days]);

  if (loading) return <main>Memuat data SEO...</main>;
  if (error) return <main>{error}</main>;
  if (!data) return <main>Data belum tersedia.</main>;

  const metrics = [
    ["Total klik", numberFormat.format(data.summary.clicks)],
    ["Impression", numberFormat.format(data.summary.impressions)],
    ["CTR", `${(data.summary.ctr * 100).toFixed(2)}%`],
    ["Posisi rata-rata", data.summary.position.toFixed(1)],
  ];

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">SEO Dashboard</h1>
          <p className="text-sm text-gray-500">
            {data.period.startDate} — {data.period.endDate}
          </p>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded border p-2"
        >
          <option value={7}>7 hari</option>
          <option value={28}>28 hari</option>
          <option value={90}>90 hari</option>
        </select>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article
            key={label}
            className="rounded-xl border p-5"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="mb-5 text-lg font-semibold">
          Klik organik per hari
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.daily.map((row) => ({
                date: row.keys?.[0] ?? "",
                clicks: row.clicks ?? 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="clicks"
                name="Klik"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <DataTable title="Keyword teratas" rows={data.queries} />
        <DataTable title="Halaman teratas" rows={data.pages} />
      </section>
    </section>
  );
}

function DataTable({
  title,
  rows,
}: {
  title: string;
  rows: Row[];
}) {
  return (
    <section className="overflow-x-auto rounded-xl border p-5">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Query / URL</th>
            <th className="p-2">Klik</th>
            <th className="p-2">Impression</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.keys?.[0]}-${i}`} className="border-b">
              <td className="max-w-xs break-all p-2">
                {row.keys?.[0] ?? "—"}
              </td>
              <td className="p-2">
                {numberFormat.format(row.clicks ?? 0)}
              </td>
              <td className="p-2">
                {numberFormat.format(row.impressions ?? 0)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="p-3 text-gray-500">
                Belum ada data untuk periode ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
