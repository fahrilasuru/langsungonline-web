import { google } from "googleapis";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

export async function GET() {
  const state = randomBytes(32).toString("hex");

  const oauth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const url = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
    state,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Set-Cookie": [
        `google_oauth_state=${state}`,
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Path=/api/google",
        "Max-Age=600",
      ].join("; "),
      "Cache-Control": "no-store",
    },
  });
}
