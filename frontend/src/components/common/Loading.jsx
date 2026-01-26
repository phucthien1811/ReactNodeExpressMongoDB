import React from "react";
import "./Loading.css";

export const Spinner = ({ label = "Loading…" }) => (
  <div className="flex items-center gap-3 text-zinc-300" role="status" aria-live="polite">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
    <span className="text-sm">{label}</span>
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-zinc-800/80 ${className}`} />
);

export default Spinner;
