import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    images: [
      {
        id: "placeholder-1",
        url: "/placeholder.svg",
        title: "Starter Image",
      },
    ],
  });
}
