import React from "react";
import PropTypes from "prop-types";
import "./Card.css";

/**
 * Card layout đơn giản: Header/Media/Content/Footer
 * UI-only, cho ProductCard/ServiceCard… dùng lại.
 */
function Card({ className = "", children, padding = "md", clickable = false }) {
  const pad = padding === "none" ? "" : padding === "lg" ? "p-6" : "p-4";
  const hover = clickable ? "hover:-translate-y-0.5 hover:shadow-lg" : "";
  return (
    <div
      className={`card rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-md transition ${hover} ${className}`}
    >
      <div className={pad}>{children}</div>
    </div>
  );
}

export const CardMedia = ({ src, alt = "", ratio = "16/9", className = "" }) => (
  <div className={`overflow-hidden rounded-xl ${className}`} style={{ aspectRatio: ratio }}>
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  </div>
);

export const CardHeader = ({ title, subtitle, action, className = "" }) => (
  <div className={`mb-3 flex items-start justify-between gap-3 ${className}`}>
    <div>
      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
      {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-4 pt-3 border-t border-zinc-800 ${className}`}>{children}</div>
);

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  padding: PropTypes.oneOf(["none", "md", "lg"]),
  clickable: PropTypes.bool,
};

CardMedia.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  ratio: PropTypes.string,
  className: PropTypes.string,
};

CardHeader.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
};

CardContent.propTypes = CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Card;
