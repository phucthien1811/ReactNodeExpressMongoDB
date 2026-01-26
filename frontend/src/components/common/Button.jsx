import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import "./Button.css";

const VARIANT = {
  primary: "btn btn--primary",
  outline: "btn btn--outline",
  secondary: "btn btn--secondary",
  ghost: "btn btn--ghost",
};

const SIZE = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

const Button = forwardRef(function Button(
  {
    as: Comp = "button",
    children,
    className = "",
    variant = "primary",
    size = "md",
    ...rest
  },
  ref
) {
  const cls = [VARIANT[variant] || VARIANT.primary, SIZE[size] || SIZE.md, className]
    .filter(Boolean)
    .join(" ");
  return (
    <Comp ref={ref} className={cls} {...rest}>
      {children}
    </Comp>
  );
});

Button.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "outline", "secondary", "ghost"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export default Button;
