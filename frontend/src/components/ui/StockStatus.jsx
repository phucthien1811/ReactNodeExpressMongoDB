import React from "react";
import PropTypes from "prop-types";

/**
 * Hiển thị trạng thái tồn kho: in | low | out
 */
const map = {
  in: { text: "In stock", cls: "bg-emerald-600/15 text-emerald-400" },
  low: { text: "Low stock", cls: "bg-amber-600/15 text-amber-400" },
  out: { text: "Out of stock", cls: "bg-rose-600/15 text-rose-400" },
};

function StockStatus({ status = "in", className = "" }) {
  const info = map[status] || map.in;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${info.cls} ${className}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {info.text}
    </span>
  );
}

StockStatus.propTypes = {
  status: PropTypes.oneOf(["in", "low", "out"]),
  className: PropTypes.string,
};

export default StockStatus;
