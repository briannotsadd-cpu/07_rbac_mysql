-- แบบฝึกหัดท้ายบทความ (รันต่อจาก database.sql)
USE dit205_rbac_db;

-- ฝึกต่อข้อ 2: role ใหม่ teacher (โพสต์ข่าวได้ แต่แก้ไขไม่ได้)
ALTER TABLE users
  MODIFY role ENUM('student', 'teacher', 'staff', 'admin') NOT NULL DEFAULT 'student';

-- ฝึกต่อข้อ 3: เก็บผู้โพสต์ข่าว เพื่อให้ staff แก้ไขได้เฉพาะข่าวของตนเอง
ALTER TABLE news
  ADD COLUMN author_id INT NULL,
  ADD CONSTRAINT fk_news_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;
