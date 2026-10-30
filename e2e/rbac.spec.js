import { test, expect } from "@playwright/test";

// บัญชีทดสอบจากหัวข้อ 2.2 (teacher สร้างใหม่ในแบบฝึกหัด)
const PASSWORD = "password1234";
const ADMIN = "karnyong@me.com";
const STAFF = "somchai@me.com";
const STUDENT = "somsri@me.com";
const TEACHER = "teacher@me.com";

// Login ผ่านหน้าเว็บจริง
async function login(page, email) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.beforeAll(async ({ request }) => {
  // สร้างบัญชี teacher (สมัครซ้ำได้ 409 ก็ไม่เป็นไร) แล้วให้ admin ตั้ง role
  await request.post("/api/register", {
    data: { fullname: "Teacher Test", email: TEACHER, password: PASSWORD },
  });
  await request.post("/api/login", { data: { email: ADMIN, password: PASSWORD } });
  const users = await (await request.get("/api/users")).json();
  const teacher = users.find((user) => user.email === TEACHER);
  const res = await request.put(`/api/users/${teacher.id}`, { data: { role: "teacher" } });
  expect(res.ok()).toBeTruthy();
});

test("ยังไม่ Login: API ตอบ 401 และหน้าสมาชิก redirect ไป /login", async ({ page, request }) => {
  expect((await request.get("/api/news")).status()).toBe(401);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("student: อ่านอย่างเดียว และเลี่ยงสิทธิ์ไม่ได้", async ({ page }) => {
  await login(page, STUDENT);
  await expect(page.getByText("student", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Manage users" })).toHaveCount(0);

  await page.goto("/news");
  await expect(page.getByRole("heading", { name: "Faculty Open House" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Post" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);

  // 8.1 เปิด API โดยตรง
  expect((await page.request.get("/api/users")).status()).toBe(403);
  // 8.2 ส่ง DELETE เอง
  const status = await page.evaluate(async () =>
    (await fetch("/api/news/1", { method: "DELETE" })).status
  );
  expect(status).toBe(403);
  expect((await page.request.get("/api/news/1")).status()).toBe(200);

  // 7.2 proxy กันหน้าที่ไม่มีสิทธิ์
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto("/news/1/edit");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("8.4 แก้ role ใน token เองไม่ได้", async ({ page, context }) => {
  await login(page, STUDENT);
  const token = (await context.cookies()).find((c) => c.name === "token").value;
  const [header, payload, signature] = token.split(".");
  const forged = Buffer.from(
    Buffer.from(payload, "base64url").toString().replace('"student"', '"admin"')
  ).toString("base64url");
  const res = await page.request.delete("/api/news/1", {
    headers: { cookie: `token=${header}.${forged}.${signature}` },
  });
  expect(res.status()).toBe(401);
});

test("teacher: โพสต์ได้ แต่แก้ไขและลบไม่ได้", async ({ page }) => {
  await login(page, TEACHER);
  await page.goto("/news");
  await page.getByPlaceholder("Title").fill("Teacher post");
  await page.getByPlaceholder("Content").fill("Posted by teacher");
  await page.getByRole("button", { name: "Post" }).click();
  await expect(page.getByRole("heading", { name: "Teacher post" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);

  const created = (await (await page.request.get("/api/news")).json())
    .find((n) => n.title === "Teacher post");
  const res = await page.request.put(`/api/news/${created.id}`, {
    data: { title: "x", content: "x", category: "general" },
  });
  expect(res.status()).toBe(403);
});

test("staff: แก้ไขได้เฉพาะข่าวของตนเอง และไม่มีปุ่มลบ", async ({ page }) => {
  await login(page, STAFF);
  await page.goto("/news");
  await page.getByPlaceholder("Title").fill("Staff post");
  await page.getByPlaceholder("Content").fill("Posted by staff");
  await page.getByRole("button", { name: "Post" }).click();

  const own = page.locator(".news-card", { hasText: "Staff post" });
  const other = page.locator(".news-card", { hasText: "Faculty Open House" });
  await expect(own.getByRole("link", { name: "Edit" })).toBeVisible();
  await expect(other.getByRole("link", { name: "Edit" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);

  // แก้ข่าวของคนอื่นผ่าน API ตรง: 403
  const res = await page.request.put("/api/news/1", {
    data: { title: "hacked", content: "hacked", category: "general" },
  });
  expect(res.status()).toBe(403);

  // แก้ข่าวของตนเองผ่านหน้าเว็บ
  await own.getByRole("link", { name: "Edit" }).click();
  await expect(page.getByRole("heading", { name: "Edit News" })).toBeVisible();
  await expect(page.locator("input")).toHaveValue("Staff post");
  await page.locator("input").fill("Staff post (edited)");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/\/news$/);
  await expect(page.getByRole("heading", { name: "Staff post (edited)" })).toBeVisible();

  // เปิดหน้าแก้ไขข่าวของคนอื่นทาง URL แล้วกด Save: เห็นข้อความ Forbidden
  await page.goto("/news/1/edit");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Forbidden")).toBeVisible();
});

test("admin: เห็นทุกปุ่ม ลบข่าวได้ และจัดการ role ได้", async ({ page }) => {
  await login(page, ADMIN);
  await page.getByRole("link", { name: "Manage users" }).click();
  await expect(page.getByRole("heading", { name: "Manage Users" })).toBeVisible();

  // เปลี่ยน role ของตัวเองไม่ได้
  const selfRow = page.locator("tr", { hasText: ADMIN });
  await selfRow.locator("select").selectOption("student");
  await expect(page.getByText("You cannot change your own role")).toBeVisible();
  await expect(selfRow.locator("select")).toHaveValue("admin");

  // เปลี่ยน role ของ Somsri เป็น staff แล้วกลับเป็น student
  const somsri = page.locator("tr", { hasText: STUDENT });
  await somsri.locator("select").selectOption("staff");
  await expect(page.getByText("Role updated")).toBeVisible();
  await expect(somsri.locator("select")).toHaveValue("staff");
  await somsri.locator("select").selectOption("student");
  await expect(somsri.locator("select")).toHaveValue("student");

  // ลบข่าวที่สร้างจาก test ก่อนหน้า (ทดสอบปุ่ม Delete และเก็บกวาดข้อมูล)
  await page.goto("/news");
  await expect(page.getByRole("button", { name: "Post" })).toBeVisible();
  page.on("dialog", (dialog) => dialog.accept());
  for (const title of ["Staff post (edited)", "Teacher post"]) {
    const card = page.locator(".news-card", { hasText: title });
    await expect(card.getByRole("link", { name: "Edit" })).toBeVisible();
    await card.getByRole("button", { name: "Delete" }).click();
    await expect(card).toHaveCount(0);
  }
});

test("8.3 role ใน token เก่าไม่เปลี่ยนจนกว่าจะ Login ใหม่", async ({ browser }) => {
  const studentCtx = await browser.newContext();
  const adminCtx = await browser.newContext();
  const studentPage = await studentCtx.newPage();
  const adminPage = await adminCtx.newPage();

  await login(studentPage, STUDENT);
  await login(adminPage, ADMIN);

  const users = await (await adminPage.request.get("/api/users")).json();
  const somsri = users.find((user) => user.email === STUDENT);
  await adminPage.request.put(`/api/users/${somsri.id}`, { data: { role: "staff" } });

  try {
    // token เดิมยังเป็น student
    await studentPage.goto("/news");
    await expect(studentPage.getByText("student", { exact: true })).toBeVisible();
    await expect(studentPage.getByRole("button", { name: "Post" })).toHaveCount(0);

    // Login ใหม่จึงได้ role staff
    await login(studentPage, STUDENT);
    await studentPage.goto("/news");
    await expect(studentPage.getByRole("button", { name: "Post" })).toBeVisible();
  } finally {
    await adminPage.request.put(`/api/users/${somsri.id}`, { data: { role: "student" } });
    await studentCtx.close();
    await adminCtx.close();
  }
});
