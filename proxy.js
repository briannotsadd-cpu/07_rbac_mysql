import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { can } from "@/lib/rbac";

// หน้าที่ต้องมี permission เฉพาะ: path ที่ตรงกับ pattern ต้องมี permission ที่ระบุ
const PAGE_RULES = [
  { pattern: /^\/admin/, permission: "user:manage" },
  { pattern: /^\/news\/\d+\/edit/, permission: "news:update" },
];

// ทำงานก่อนทุก request ที่ตรงกับ config.matcher
export async function proxy(request) {
  const user = await verifyToken(request.cookies.get("token")?.value);

  if (!user) {
    // ยังไม่ Login หรือ token หมดอายุ: ส่งไปหน้า login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Login แล้วแต่ role ไม่มีสิทธิ์เปิดหน้านี้: ส่งกลับไปหน้า dashboard
  const rule = PAGE_RULES.find((rule) => rule.pattern.test(request.nextUrl.pathname));
  if (rule && !can(user.role, rule.permission)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// ให้ proxy ทำงานเฉพาะพื้นที่สมาชิก
export const config = {
  matcher: ["/dashboard/:path*", "/news/:path*", "/admin/:path*"],
};
