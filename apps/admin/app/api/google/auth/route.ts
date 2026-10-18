import { google } from "googleapis";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !redirectUri
  ) {
    return new Response("Konfigurasi Google OAuth belum lengkap.", {
      status: 500,
    });
  }

  // Pastikan login dimulai dari hostname callback yang sama.
  const requestUrl = new URL(request.url);

  if (requestUrl.host !== new URL(redirectUri).host) {
    return new Response(
      `Buka halaman OAuth dari domain ini: ${new URL(redirectUri).origin}/api/google/auth`,
      { status: 400 }
    );
  }

  const state = randomBytes(32).toString("hex");

  const oauth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const url = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
    state,
  });

  const response = NextResponse.redirect(url);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  response.headers.set("Cache-Control", "no-store");

  return response;
}
