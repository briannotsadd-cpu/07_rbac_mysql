"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PERMISSIONS } from "@/lib/rbac";

// รายชื่อ role ทั้งหมด ดึงจาก PERMISSIONS เพื่อไม่ต้องเขียนซ้ำ
const ROLES = Object.keys(PERMISSIONS);

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  // โหลดรายชื่อผู้ใช้จาก API
  const loadUsers = () => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ส่ง PUT เพื่อเปลี่ยน role แล้วโหลดรายชื่อใหม่
  const handleRoleChange = async (id, role) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Role updated" : data.message);
    loadUsers();
  };

  return (
    <div className="page">
      <Link href="/dashboard">← Dashboard</Link>
      <h1>Manage Users</h1>
      {/* ตารางเลื่อนแนวนอนได้ในจอแคบ ไม่ทำให้ทั้งหน้าล้น */}
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fullname}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
