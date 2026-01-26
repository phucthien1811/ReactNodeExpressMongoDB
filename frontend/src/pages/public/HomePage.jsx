import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button.jsx";
import "./HomePage.css";

const words = [
  "Tập luyện đúng cách", 
  "Rèn Luyện Sức Khỏe Bền Bỉ", 
  "Chinh phục giới hạn của bản thân"
];

export default function HomePage() {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[wordIndex];
    
    if (charIndex < currentWord.length) {
      // Đang gõ chữ
      const timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Đã gõ xong, chờ 2 giây rồi chuyển sang từ tiếp theo
      const timer = setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setCharIndex(0);
        setDisplayText("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [charIndex, wordIndex]);

  const scrollToJoin = () => {
    const el = document.getElementById("join-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="home" className="section hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <h1 className="hero__title">
            Nâng Tầm Thể Chất, Kiến Tạo Phong Độ
          </h1>

          <h2 className="hero__subtitle">
            {displayText}
            <span className="typing-cursor">|</span>
          </h2>

          <p className="hero__desc">
            Với Royal Fitness, bạn được thoải mái trải nghiệm trải nghiệm hệ thống phòng tập hiện đạt đạt đẳng cấp quốc tế, huấn luyện viên chuyên nghiệp có thể giúp bạn chinh phục mọi giới hạn, mục tiêu sức khỏe, và thể hình .
          </p>

          <div className="hero__actions">
            <Button as="a" href="#pricing" variant="outline" size="lg">
              Xem Gói Tập
            </Button>

            {/* 👉 Giống Header: click là scroll mượt tới #join-section */}
            <Button variant="primary" size="lg" onClick={scrollToJoin}>
              Tham Gia Ngay
            </Button>
          </div>
        </div>

        <div className="hero__media" aria-hidden="true">
          <img
            className="hero__image"
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1400&auto=format&fit=crop"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
