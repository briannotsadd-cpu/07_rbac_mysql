import { defineConfig } from "@playwright/test";

// ใช้ dev server ที่รันอยู่ (npm run dev) หรือเปิดให้เองถ้ายังไม่ได้รัน
export default defineConfig({
  testDir: "./e2e",
  workers: 1, // ทุก test ใช้ฐานข้อมูลเดียวกัน จึงรันทีละตัว
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
