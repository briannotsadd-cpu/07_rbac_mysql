"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { can } from "@/lib/rbac";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json();
      })
      .then((data) => setUser(data))
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="auth-box">
      <h1>Dashboard</h1>
      <p>Welcome, {user.fullname}</p>
      <p>Email: {user.email}</p>
      <p>
        Role: <span className="role">{user.role}</span>
      </p>
      <ul>
        <li><Link href="/news">News</Link></li>
        {/* แสดงลิงก์หน้า Admin เฉพาะ role ที่มีสิทธิ์ user:manage */}
        {can(user.role, "user:manage") && (
          <li><Link href="/admin/users">Manage users</Link></li>
        )}
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
