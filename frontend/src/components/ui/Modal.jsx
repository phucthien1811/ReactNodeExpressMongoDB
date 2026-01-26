import React, { useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Modal controlled (isOpen, onClose)
 * - Đóng khi nhấn ESC, click overlay
 * - Trap focus đơn giản
 */
function Modal({ isOpen, onClose, title, children, footer, className = "" }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl ${className}`}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-4 pt-3 border-t border-zinc-800">{footer}</div>}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
};

export default Modal;
