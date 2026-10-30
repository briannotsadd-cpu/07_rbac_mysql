import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

// GET /api/users — รายชื่อผู้ใช้ทั้งหมด ต้องมีสิทธิ์ user:manage
export async function GET(request) {
  const { error } = await requirePermission(request, "user:manage");
  if (error) return error;

  // เลือกเฉพาะคอลัมน์ที่จำเป็น ไม่ส่ง hash ของรหัสผ่านออกไป
  const [rows] = await pool.query("SELECT id, email, fullname, role FROM users ORDER BY id");
  return NextResponse.json(rows);
}
