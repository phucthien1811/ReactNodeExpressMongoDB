import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import "./Navigation.css";

function Navigation({ links = [], className = "", onNavigate }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash || "#home" : "#home"
  );

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Function to check if link is active
  const isLinkActive = (link) => {
    if (link.isRoute) {
      return location.pathname === link.href;
    } else {
      // For hash links, only consider active if we're on home page and hash matches
      return location.pathname === "/" && hash === link.href;
    }
  };

  return (
    <nav className={`nav ${className}`}>
      <div className="nav__bar">
        <ul className="nav__links">
          {links.map((l) => (
            <li key={l.href}>
              {l.isRoute ? (
                <Link
                  className={`nav-link ${isLinkActive(l) ? "nav-link--active" : ""}`}
                  to={l.href}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  className={`nav-link ${isLinkActive(l) ? "nav-link--active" : ""}`}
                  href={l.href}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(l.href);
                    }
                  }}
                >
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="nav__toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <span className="nav__toggle-line" />
          <span className="nav__toggle-line" />
          <span className="nav__toggle-line" />
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="nav__sheet" onClick={() => setOpen(false)}>
          <div className="nav__sheet-panel" onClick={(e) => e.stopPropagation()}>
            {links.map((l) => (
              l.isRoute ? (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`nav-link nav-link--block ${
                    isLinkActive(l) ? "nav-link--active" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className={`nav-link nav-link--block ${
                    isLinkActive(l) ? "nav-link--active" : ""
                  }`}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(l.href);
                    }
                    setOpen(false);
                  }}
                >
                  {l.label}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

Navigation.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, href: PropTypes.string })
  ),
  className: PropTypes.string,
  onNavigate: PropTypes.func,
};

export default Navigation;
