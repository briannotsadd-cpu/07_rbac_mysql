import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { can } from "@/lib/rbac";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// สร้าง token อายุ 1 ชั่วโมง
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

// ตรวจ token: ถูกต้องคืน payload, ไม่ถูกต้องคืน null
export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// ใช้ใน API route: ตรวจ token แล้วตรวจ permission
// ผ่าน: คืน { user }  ไม่ผ่าน: คืน { error } ที่เป็น response 401 หรือ 403
export async function requirePermission(request, permission) {
  const user = await verifyToken(request.cookies.get("token")?.value);

  if (!user) {
    return {
      error: NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!can(user.role, permission)) {
    return {
      error: NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 }),
    };
  }

  return { user };
}
