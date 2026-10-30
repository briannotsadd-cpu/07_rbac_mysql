import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

// POST /api/register — สมัครสมาชิก (role เป็น student ตามค่าเริ่มต้นของฐานข้อมูล)
export async function POST(request) {
  const { email, password, fullname } = await request.json();

  if (!email || !password || !fullname) {
    return NextResponse.json(
      { status: "error", message: "email, password and fullname are required" },
      { status: 400 }
    );
  }

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    return NextResponse.json(
      { status: "error", message: "Email already registered" },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (email, password, fullname) VALUES (?, ?, ?)",
    [email, hash, fullname]
  );

  return NextResponse.json({ status: "ok" }, { status: 201 });
}
