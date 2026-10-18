import { google } from "googleapis";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const cookies = Object.fromEntries(
  (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part: string) => part.trim())
    .filter((part: string) => Boolean(part))
    .map((part: string) => {
      const index = part.indexOf("=");

      return [
        part.slice(0, index),
        decodeURIComponent(part.slice(index + 1)),
      ];
    })
);

  const clearCookie = [
    "google_oauth_state=",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/api/google",
    "Max-Age=0",
  ].join("; ");

  const respond = (message: string, status = 200) =>
  new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": clearCookie,
    },
  });

  if (oauthError) {
    return respond("Persetujuan OAuth dibatalkan.", 400);
  }

  if (
    !code ||
    !returnedState ||
    !cookies.google_oauth_state ||
    returnedState !== cookies.google_oauth_state
  ) {
    return respond("Callback OAuth tidak valid.", 400);
  }

  const oauth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth.getToken(code);

    if (!tokens.refresh_token) {
      return respond(
        "Refresh token tidak diberikan Google. Coba otorisasi ulang dengan consent.",
        400
      );
    }

    // Simpan tokens.refresh_token ke secret manager
    // atau database production yang aksesnya dibatasi.
    // Jangan mengirim token ke browser atau mencatatnya ke log.

    return respond(
      "OAuth berhasil. Refresh token sudah diterima server. Hubungkan fungsi penyimpanan token sebelum digunakan untuk dashboard."
    );
  } catch (error) {
    console.error("Google OAuth token exchange failed.");
    return respond("Gagal menukar authorization code.", 500);
  }
}
