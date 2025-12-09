import { NextRequest, NextResponse } from "next/server";

// Redirect favicon.ico requests to the app icon SVG.
export function GET(request: NextRequest) {
  const target = new URL("/icon.svg", request.url);
  return NextResponse.redirect(target, 302);
}
