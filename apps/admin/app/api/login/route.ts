import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const expectedPassword = process.env.LOGIN_PASSWORD;

  if (!expectedPassword) {
    console.error("LOGIN_PASSWORD belum dikonfigurasi.");

    return NextResponse.json(
      { message: "Terjadi kesalahan pada konfigurasi server." },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request tidak valid." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("password" in body) ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json(
      { message: "Password wajib diisi." },
      { status: 400 },
    );
  }

  if (body.password !== expectedPassword) {
    return NextResponse.json(
      { message: "Password salah." },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true });
}
