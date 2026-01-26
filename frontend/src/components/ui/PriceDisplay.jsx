import React from "react";
import PropTypes from "prop-types";

/**
 * Hiển thị giá + giá gốc + % giảm (UI-only)
 * Nếu bạn có utils/formatPrice, có thể import; dưới đây dùng toLocaleString fallback.
 */
const format = (n, currency = "USD") =>
  (typeof n === "number"
    ? n
    : Number(n ?? 0)
  ).toLocaleString(undefined, { style: "currency", currency });

function PriceDisplay({
  price,
  originalPrice,
  currency = "USD",
  className = "",
  align = "start",
  size = "md",
}) {
  const hasDiscount = originalPrice && Number(originalPrice) > Number(price);
  const percent =
    hasDiscount && Math.round(((originalPrice - price) / originalPrice) * 100);

  const sizeCls = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";

  return (
    <div className={`flex items-baseline gap-3 ${className}`} style={{ justifyContent: align }}>
      <span className={`${sizeCls} font-semibold text-white`}>
        {format(price, currency)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-zinc-400 line-through">
            {format(originalPrice, currency)}
          </span>
          <span className="rounded-md bg-emerald-600/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
            -{percent}%
          </span>
        </>
      )}
    </div>
  );
}

PriceDisplay.propTypes = {
  price: PropTypes.number.isRequired,
  originalPrice: PropTypes.number,
  currency: PropTypes.string,
  className: PropTypes.string,
  align: PropTypes.oneOf(["start", "center", "end"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export default PriceDisplay;
