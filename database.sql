-- สร้างฐานข้อมูลใหม่สำหรับบทความนี้
CREATE DATABASE IF NOT EXISTS dit205_rbac_db;
USE dit205_rbac_db;

-- ตาราง users มีคอลัมน์ role ตั้งแต่แรก ผู้สมัครใหม่ได้ role student
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  role ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง news เก็บข่าวสารคณะ
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('general', 'exam', 'event') NOT NULL DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ข่าวตัวอย่าง 3 รายการ
INSERT INTO news (title, content, category) VALUES
('Welcome to Semester 2/2026', 'Classes start on 9 November 2026. Check the faculty timetable for room changes.', 'general'),
('Midterm Exam Schedule Released', 'The midterm exam schedule is now available on the faculty notice board.', 'exam'),
('Faculty Open House', 'Join the faculty open house on 20 November 2026 at Building 2, 9:00-16:00.', 'event');
