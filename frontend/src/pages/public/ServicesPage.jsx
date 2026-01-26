import React from "react";
import "./ServicesPage.css";

const services = [
  {
    title: "Yoga",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXAetnGZ6oTT8xxcVLXE-0CM3AW-A23WCC7A&s",
  },
  {
    title: "Tăng Cân",
    img: "https://ty-gym-website.vercel.app/assets/image2.jpg",
  },
  {
    title: "Tập Sức Mạnh",
    img: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Chương Trình Cardio",
    img: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Giảm Mỡ",
    img: "https://ty-gym-website.vercel.app/assets/image4.jpg",
  },
  {
    title: "Huấn Luyện Cá Nhân",
    img: "https://ty-gym-website.vercel.app/assets/image1.jpg",
  },
];

export default function ServicesPage() {
  return (
    <section id="services" className="section services">
      <div className="container">
        <h1 className="services__title">
          Dịch Vụ Của Chúng Tôi
        </h1>

        <div className="services__grid">
          {services.map((s) => (
            <article className="service-card" key={s.title}>
              <figure className="service-card__media">
                <img src={s.img} alt={s.title} />
              </figure>
              <h4 className="service-card__title">{s.title}</h4>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
