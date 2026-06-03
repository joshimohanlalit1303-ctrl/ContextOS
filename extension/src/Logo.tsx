import React from "react";

export function Logo({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Left Brain Lobe */}
      <path d="M10.5 20.5c-3.5 0-6.5-2-6.5-6 0-1.5.5-3 1.5-4.5-.5-2.5 1-4.5 3-4.5 1.5 0 2.5 1 3 2.5" />
      {/* Right Brain Lobe */}
      <path d="M13.5 20.5c3.5 0 6.5-2 6.5-6 0-1.5-.5-3-1.5-4.5.5-2.5-1-4.5-3-4.5-1.5 0-2.5 1-3 2.5" />
      {/* Center Arrow */}
      <path d="M12 21V8" />
      <path d="M9 11l3-3 3 3" />
    </svg>
  );
}
