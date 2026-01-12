import { NextResponse } from "next/server";

let storedAnnotations: unknown[] = [];

export async function GET() {
  return NextResponse.json({ annotations: storedAnnotations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body.annotations)) {
      storedAnnotations = body.annotations;
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true, count: storedAnnotations.length });
}
