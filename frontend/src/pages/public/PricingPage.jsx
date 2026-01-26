import React from "react";
import Button from "../../components/common/Button";
import "./PricingPage.css";


const plans = [
  {
    name: "CƠ BẢN",
    price: 100,
    features: ["Kế hoạch tập luyện thông minh", "Tập tại nhà"],
  },
  {
    name: "CHUYÊN NGHIỆP",
    price: 150,
    features: ["Phòng tập Pro", "Kế hoạch tập luyện thông minh", "Tập tại nhà"],
  },
  {
    name: "CAO CẤP",
    price: 300,
    features: [
      "Phòng tập & Lớp học ELITE",
      "Phòng tập Pro",
      "Kế hoạch tập luyện thông minh",
      "Tập tại nhà",
      "Huấn luyện cá nhân",
    ],
  },
];

export default function PricingPage() {
  return (
    <section id="pricing" className="section pricing">
      <div className="container">
        <h1 className="pricing__title">
          Gói Tập Của Chúng Tôi
        </h1>

        <div className="pricing__grid">
          {plans.map((p) => (
            <article className="plan" key={p.name}>
              <header className="plan__header">
                <h4 className="plan__name">{p.name}</h4>
                <div className="plan__price">
                  ${p.price}
                  <span className="plan__price--unit">/Tháng</span>
                </div>
              </header>

              <ul className="plan__features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <footer className="plan__footer">
                <Button as="a" href="#join-section" variant="ghost">
                  Tham Gia Ngay →
                </Button>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
