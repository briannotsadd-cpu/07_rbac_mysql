import { NextResponse } from "next/server";

// POST /api/logout — ลบ cookie token
export async function POST() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.delete("token");
  return response;
}
