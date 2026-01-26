import React from "react";
import "./ReviewPage.css";

const reviews = [
  {
    name: "Nguyễn Văn An",
    text:
      "Huấn luyện viên tuyệt vời và cơ sở vật chất sạch sẽ. Tôi đã tăng sức mạnh và sự tự tin chỉ trong 3 tháng.",
    avatar:
      "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Trần Thị Minh",
    text:
      "Cộng đồng thân thiện và các lớp học đa dạng. Các gói tập thật sự xứng đáng với từng đồng!",
    avatar:
      "https://i.pravatar.cc/100?img=31",
  },
  {
    name: "Lê Hoàng Nam",
    text:
      "Các buổi tập cá nhân rất chuyên nghiệp. Chương trình cá nhân hóa đã giúp tôi giảm được 7kg.",
    avatar:
      "https://i.pravatar.cc/100?img=5",
  },
];

export default function ReviewPage() {
  return (
    <section id="review" className="section review">
      <div className="container">
        <h1 className="review__title">
          Đánh Giá
        </h1>

        <div className="review__grid">
          {reviews.map((r) => (
            <article className="testimonial" key={r.name}>
              <div className="testimonial__head">
                <img className="testimonial__avatar" src={r.avatar} alt={r.name} />
                <div>
                  <h4 className="testimonial__name">{r.name}</h4>
                  <p className="testimonial__meta">Thành Viên Royal Fitness</p>
                </div>
              </div>
              <p className="testimonial__text">{r.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
