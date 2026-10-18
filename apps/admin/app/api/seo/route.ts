import { NextRequest, NextResponse } from "next/server";
import { querySearchConsole } from "@/lib/search-console";

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    if (sessionStorage.getItem("loggedIn") !== "true")
        return;

    const params = request.nextUrl.searchParams;
    const days = Math.min(
      90,
      Math.max(1, Number(params.get("days") || 28))
    );

    if (!Number.isFinite(days)) {
      return NextResponse.json(
        { error: "Parameter days tidak valid" },
        { status: 400 }
      );
    }

    // Lewati 3 hari terakhir untuk mengurangi
    // risiko membaca data yang belum final.
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 3);

    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const startDate = dateString(start);
    const endDate = dateString(end);

    const [daily, queries, pages] = await Promise.all([
      querySearchConsole({
        startDate,
        endDate,
        dimensions: ["date"],
        rowLimit: 90,
      }),
      querySearchConsole({
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 10,
      }),
      querySearchConsole({
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit: 10,
      }),
    ]);

    const summary = daily.reduce(
      (acc, row) => ({
        clicks: acc.clicks + (row.clicks ?? 0),
        impressions: acc.impressions + (row.impressions ?? 0),
        weightedPosition:
          acc.weightedPosition +
          (row.position ?? 0) * (row.impressions ?? 0),
      }),
      { clicks: 0, impressions: 0, weightedPosition: 0 }
    );

    return NextResponse.json({
      period: { startDate, endDate },
      summary: {
        clicks: summary.clicks,
        impressions: summary.impressions,
        ctr:
          summary.impressions > 0
            ? summary.clicks / summary.impressions
            : 0,
        position:
          summary.impressions > 0
            ? summary.weightedPosition / summary.impressions
            : 0,
      },
      daily,
      queries,
      pages,
    });
  } catch (error) {
    console.error("Search Console API error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data Search Console" },
      { status: 502 }
    );
  }
}
