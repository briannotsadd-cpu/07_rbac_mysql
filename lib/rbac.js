// permission ของแต่ละ role — แก้สิทธิ์ทั้งระบบได้จากไฟล์นี้ที่เดียว
// news:update = แก้ไขได้เฉพาะข่าวของตนเอง, news:update:any = แก้ไขข่าวของทุกคน
export const PERMISSIONS = {
  student: ["news:read"],
  teacher: ["news:read", "news:create"],
  staff: ["news:read", "news:create", "news:update"],
  admin: ["news:read", "news:create", "news:update", "news:update:any", "news:delete", "user:manage"],
};

// ตรวจว่า role นี้มี permission ที่ระบุหรือไม่
export function can(role, permission) {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

// ตรวจสิทธิ์แก้ไขข่าวหนึ่งรายการ: แก้ได้ทุกข่าว หรือแก้ได้เฉพาะข่าวที่ตนเองโพสต์ (ownership)
export function canEditNews(user, news) {
  return can(user.role, "news:update:any") ||
    (can(user.role, "news:update") && news.author_id === user.id);
}
