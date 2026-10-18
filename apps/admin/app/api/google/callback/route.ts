import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  const savedState =
    request.cookies.get("google_oauth_state")?.value;

  const clearCookie = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  const respond = (message: string, status = 200) => {
    const response = new NextResponse(message, {
      status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });

    response.cookies.set("google_oauth_state", "", clearCookie);
    return response;
  };

  if (oauthError) {
    return respond(`Google OAuth error: ${oauthError}`, 400);
  }

  if (!code || !returnedState || !savedState) {
    return respond(
      "Cookie state tidak ditemukan. Pastikan login dan callback memakai hostname yang sama, lalu coba lagi.",
      400
    );
  }

  if (returnedState !== savedState) {
    return respond(
      "State berbeda. Mulai OAuth dari awal pada domain produksi yang sama.",
      400
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return respond("Konfigurasi Google OAuth belum lengkap.", 500);
  }

  const oauth = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  try {
    const { tokens } = await oauth.getToken(code);

    if (!tokens.refresh_token) {
      return respond(
        "Google tidak mengirim refresh token. Periksa consent dan otorisasi akun.",
        400
      );
    }

    // Sementara: salin token ini ke Vercel Environment Variables.
    // Hapus fitur penampilan token ini setelah selesai.
    return respond(
      `GOOGLE_REFRESH_TOKEN\n\n${tokens.refresh_token}\n\nSalin nilai token di atas ke Vercel Environment Variables. Jangan bagikan token ini.`
    );
  } catch {
    return respond("Gagal menukar authorization code.", 500);
  }
}
