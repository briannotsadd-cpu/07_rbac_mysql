import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { canEditNews } from "@/lib/rbac";

// GET /api/news/{id} — ต้องมีสิทธิ์ news:read
export async function GET(request, { params }) {
  const { error } = await requirePermission(request, "news:read");
  if (error) return error;

  const { id } = await params;
  const [rows] = await pool.query("SELECT * FROM news WHERE id = ?", [id]);

  if (rows.length === 0) {
    return NextResponse.json(
      { status: "error", message: "News not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(rows[0]);
}

// PUT /api/news/{id} — ต้องมีสิทธิ์ news:update และเป็นเจ้าของข่าว (หรือมี news:update:any)
export async function PUT(request, { params }) {
  const { user, error } = await requirePermission(request, "news:update");
  if (error) return error;

  const { id } = await params;
  const [rows] = await pool.query("SELECT author_id FROM news WHERE id = ?", [id]);

  if (rows.length === 0) {
    return NextResponse.json(
      { status: "error", message: "News not found" },
      { status: 404 }
    );
  }

  // ตรวจความเป็นเจ้าของข้อมูล ซึ่ง RBAC อย่างเดียวทำไม่ได้
  if (!canEditNews(user, rows[0])) {
    return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
  }

  const { title, content, category } = await request.json();

  if (!title || !content) {
    return NextResponse.json(
      { status: "error", message: "title and content are required" },
      { status: 400 }
    );
  }

  await pool.query(
    "UPDATE news SET title = ?, content = ?, category = ? WHERE id = ?",
    [title, content, category, id]
  );

  return NextResponse.json({ status: "ok" });
}

// DELETE /api/news/{id} — ต้องมีสิทธิ์ news:delete
export async function DELETE(request, { params }) {
  const { error } = await requirePermission(request, "news:delete");
  if (error) return error;

  const { id } = await params;
  await pool.query("DELETE FROM news WHERE id = ?", [id]);
  return NextResponse.json({ status: "ok" });
}
