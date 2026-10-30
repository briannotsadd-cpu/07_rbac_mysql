import Link from "next/link";

// หน้าแรก: ลิงก์ไปยังทุกหน้าในโปรเจกต์
export default function Home() {
  return (
    <div className="auth-box">
      <h1>RBAC Demo</h1>
      <ul>
        <li><Link href="/register">Register</Link></li>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/dashboard">Dashboard (members only)</Link></li>
      </ul>
    </div>
  );
}
