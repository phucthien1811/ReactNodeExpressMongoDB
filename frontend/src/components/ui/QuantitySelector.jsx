import React from "react";
import PropTypes from "prop-types";

/**
 * Selector +/-
 * - Controlled: value, onChange
 * - min/max, step
 */
function QuantitySelector({
  value = 1,
  onChange = () => {},
  min = 1,
  max = 99,
  step = 1,
  className = "",
}) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <div className={`inline-flex items-center rounded-lg border border-zinc-700 ${className}`}>
      <button
        type="button"
        aria-label="Decrease"
        className="px-3 py-2 text-lg text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        onClick={dec}
        disabled={value <= min}
      >
        −
      </button>
      <input
        aria-label="Quantity"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, "")) || min;
          onChange(Math.max(min, Math.min(max, n)));
        }}
        className="w-12 bg-transparent text-center text-white outline-none"
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <button
        type="button"
        aria-label="Increase"
        className="px-3 py-2 text-lg text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        onClick={inc}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

QuantitySelector.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  className: PropTypes.string,
};

export default QuantitySelector;
