import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";

// PUT /api/users/{id} — เปลี่ยน role ของผู้ใช้ ต้องมีสิทธิ์ user:manage
export async function PUT(request, { params }) {
  const { user, error } = await requirePermission(request, "user:manage");
  if (error) return error;

  const { id } = await params;
  const { role } = await request.json();

  // รับเฉพาะ role ที่มีอยู่ใน PERMISSIONS
  if (!Object.keys(PERMISSIONS).includes(role)) {
    return NextResponse.json(
      { status: "error", message: "Invalid role" },
      { status: 400 }
    );
  }

  // กัน admin ลดสิทธิ์ตัวเองจนไม่มี admin เหลือในระบบ
  if (Number(id) === user.id) {
    return NextResponse.json(
      { status: "error", message: "You cannot change your own role" },
      { status: 400 }
    );
  }

  await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  return NextResponse.json({ status: "ok" });
}
