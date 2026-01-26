import React from "react";
import PropTypes from "prop-types";

/**
 * Hiển thị sao 0..5 (cho phép half .5)
 * UI-only
 */
function Star({ filled = 0, size = 18 }) {
  // filled: 0 empty, 0.5 half, 1 full
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block">
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.172L12 18.896 4.664 23.17l1.402-8.172L.132 9.21l8.2-1.192L12 .587z"
        fill={filled === 1 ? "#34d399" : filled === 0.5 ? "url(#half)" : "none"}
        stroke="#34d399"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ProductRating({ rating = 0, count, size = 18, className = "" }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="leading-none">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f-${i}`} filled={1} size={size} />
        ))}
        {half ? <Star filled={0.5} size={size} /> : null}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e-${i}`} filled={0} size={size} />
        ))}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-zinc-400">({count})</span>
      )}
    </div>
  );
}

ProductRating.propTypes = {
  rating: PropTypes.number,
  count: PropTypes.number,
  size: PropTypes.number,
  className: PropTypes.string,
};

export default ProductRating;
