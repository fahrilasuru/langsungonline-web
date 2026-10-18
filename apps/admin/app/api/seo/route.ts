import { NextRequest, NextResponse } from "next/server";
import { querySearchConsole } from "@/lib/search-console";

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

type Summary = {
  clicks: number;
  impressions: number;
  weightedPosition: number;
};

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const requestedDays = Number(params.get("days") || 28);

    if (!Number.isFinite(requestedDays)) {
      return NextResponse.json(
        { error: "Parameter days tidak valid" },
        { status: 400 }
      );
    }

    const days = Math.min(90, Math.max(1, Math.floor(requestedDays)));

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

    const summary = daily.reduce<Summary>(
      (acc, row) => {
        const clicks = Number(row.clicks ?? 0);
        const impressions = Number(row.impressions ?? 0);
        const position = Number(row.position ?? 0);

        return {
          clicks: acc.clicks + clicks,
          impressions: acc.impressions + impressions,
          weightedPosition:
            acc.weightedPosition + position * impressions,
        };
      },
      {
        clicks: 0,
        impressions: 0,
        weightedPosition: 0,
      }
    );

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Search Console API error:", {
        message: error.message,
        name: error.name,
      });
    } else {
      console.error("Search Console API error: unknown");
    }

    return NextResponse.json(
      { error: "Gagal mengambil data Search Console" },
      { status: 502 }
    );
  }
}
