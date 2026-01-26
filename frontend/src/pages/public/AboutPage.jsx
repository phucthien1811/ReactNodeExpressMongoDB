import React from "react";
import Button from "../../components/common/Button";
import "./AboutPage.css";

export default function AboutPage() {
  return (
    <section id="about" className="section about">
      <div className="container about__inner">
        <figure className="about__media">
          <img
            src="https://ty-gym-website.vercel.app/assets/about.jpg"
            alt="Treadmills at Royal Fitness"
          />
        </figure>

        <div className="about__content">
          <h2 className="section__eyebrow">Tại Sao Chọn</h2>
          <h3 className="section__title">Chúng Tôi?</h3>

          <ul className="about__bullets">
            <li>Cộng đồng thân thiện, hỗ trợ để giữ bạn luôn có động lực.</li>
            <li>Mở khóa tiềm năng của bạn với Huấn Luyện Viên chuyên nghiệp.</li>
            <li>Nâng cao thể lực với các buổi tập luyện thực hành.</li>
            <li>Quản lý hỗ trợ cho sự thành công của bạn.</li>
          </ul>

          <Button as="a" href="#pricing" variant="primary" size="md">
            Đặt Lớp Học Miễn Phí
          </Button>
        </div>
      </div>
    </section>
  );
}
