import React from "react";
import "./JoinSection.css";

export default function JoinSection() {
  return (
    <>
      <section id="join-section" className="section join-section">
        <div className="container">
          <h3 className="section__title">
            <span className="text-brand">Tham Gia</span> Royal Fitness
          </h3>
          <p className="join-section__subtitle">
            Để lại email của bạn và chúng tôi sẽ liên hệ để bạn được tham gia lớp học dùng thử miễn phí.
          </p>
          <form
            className="join-form"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Đã gửi (Chỉ giao diện).");
            }}
          >
            <input
              type="email"
              required
              placeholder="Email của bạn"
              className="join-input"
              aria-label="Email của bạn"
            />
            <button type="submit" className="btn btn--primary btn-md">
              Bắt Đầu
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
