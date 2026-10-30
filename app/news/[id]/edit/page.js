"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// หมวดหมู่ข่าว ต้องตรงกับ ENUM ของคอลัมน์ category
const CATEGORIES = ["general", "exam", "event"];

export default function EditNewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  // โหลดข่าวปัจจุบันมาใส่ฟอร์ม
  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setTitle(data.title);
        setCategory(data.category);
        setContent(data.content);
      });
  }, [id]);

  // ส่ง PUT เพื่อบันทึก แล้วกลับไปหน้ารายการ
  const handleUpdate = async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/news/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, content }),
    });
    // ไม่ผ่าน (เช่น 403 เพราะไม่ใช่เจ้าของข่าว): แสดงข้อความแทนการกลับหน้ารายการ
    if (!response.ok) {
      const data = await response.json();
      setMessage(data.message);
      return;
    }
    router.push("/news");
  };

  return (
    <div className="auth-box">
      <h1>Edit News</h1>
      <form onSubmit={handleUpdate}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
        />
        <button type="submit">Save</button>
      </form>
      {message && <p className="error">{message}</p>}
    </div>
  );
}
