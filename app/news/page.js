"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NewsCard from "@/app/components/NewsCard";
import { can, canEditNews } from "@/lib/rbac";

// หมวดหมู่ข่าว ต้องตรงกับ ENUM ของคอลัมน์ category
const CATEGORIES = ["general", "exam", "event"];

export default function NewsPage() {
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");

  // โหลดรายการข่าวจาก API
  const loadNews = () => {
    fetch("/api/news")
      .then((response) => response.json())
      .then((data) => setNews(data));
  };

  // โหลดผู้ใช้ (เพื่อรู้ role) และรายการข่าวเมื่อเปิดหน้า
  useEffect(() => {
    fetch("/api/me")
      .then((response) => response.json())
      .then((data) => setUser(data));
    loadNews();
  }, []);

  // ส่ง POST เพื่อเพิ่มข่าว แล้วโหลดรายการใหม่
  const handleCreate = async (event) => {
    event.preventDefault();
    await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, content }),
    });
    setTitle("");
    setCategory("general");
    setContent("");
    loadNews();
  };

  // ส่ง DELETE แล้วโหลดรายการใหม่
  const handleDelete = async (id) => {
    if (!confirm("Delete this news?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    loadNews();
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="page">
      <Link href="/dashboard">← Dashboard</Link>
      <h1>Faculty News</h1>
      <p>
        Logged in as {user.fullname} <span className="role">{user.role}</span>
      </p>

      {/* ฟอร์มเพิ่มข่าว แสดงเฉพาะ role ที่มีสิทธิ์ news:create */}
      {can(user.role, "news:create") && (
        <form onSubmit={handleCreate} className="news-form">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            required
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Content"
            rows={3}
            required
          />
          <button type="submit">Post</button>
        </form>
      )}

      <div className="news-list">
        {news.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            canEdit={canEditNews(user, item)}
            canDelete={can(user.role, "news:delete")}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
