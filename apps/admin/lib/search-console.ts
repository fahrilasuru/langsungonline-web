import { google } from "googleapis";

const siteUrl = process.env.GSC_SITE_URL;

function getSearchConsoleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken || !siteUrl) {
    throw new Error("Konfigurasi Google Search Console belum lengkap");
  }

  const auth = new google.auth.OAuth2(
    clientId,
    clientSecret
  );

  auth.setCredentials({
    refresh_token: refreshToken,
  });

  return google.searchconsole({
    version: "v1",
    auth,
  });
}

export async function querySearchConsole({
  startDate,
  endDate,
  dimensions,
  rowLimit = 100,
}: {
  startDate: string;
  endDate: string;
  dimensions: string[];
  rowLimit?: number;
}) {
  const client = getSearchConsoleClient();

  const response = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit,
      type: "web",
    },
  });

  return response.data.rows ?? [];
}
