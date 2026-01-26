import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * Icon trái tim toggle (UI-only).
 * - defaultChecked: trạng thái ban đầu
 * - onToggle(checked): callback
 */
function WishlistIcon({ defaultChecked = false, onToggle = () => {}, className = "" }) {
  const [checked, setChecked] = useState(defaultChecked);

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onToggle(next);
  };

  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={toggle}
      className={`rounded-full p-2 transition hover:bg-zinc-800/70 ${className}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={checked ? "#34d399" : "none"}
        stroke={checked ? "#34d399" : "currentColor"}
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

WishlistIcon.propTypes = {
  defaultChecked: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string,
};

export default WishlistIcon;
