import Link from "next/link";

// NewsCard — แสดงข่าวหนึ่งรายการ พร้อมปุ่ม Edit และ Delete ตามสิทธิ์ที่หน้ารายการส่งมา
export default function NewsCard({ item, canEdit, canDelete, onDelete }) {
  return (
    <div className="news-card">
      <img
        src={`/news/${item.id}.png`}
        alt={item.title}
        // ซ่อนรูปหากไม่มีไฟล์ของ id นี้ เช่น ข่าวที่เพิ่งโพสต์
        onError={(event) => (event.currentTarget.style.display = "none")}
      />
      <div>
        <h2>{item.title}</h2>
        <p>
          <span className="category">{item.category}</span>{" "}
          {new Date(item.created_at).toLocaleDateString("en-GB")}
        </p>
        <p>{item.content}</p>
        {canEdit && <Link href={`/news/${item.id}/edit`}>Edit</Link>}{" "}
        {canDelete && <button onClick={() => onDelete(item.id)}>Delete</button>}
      </div>
    </div>
  );
}
