import React from "react";

interface LogoProps {
  className?: string;
  size?: number; // Height in pixels
  showTagline?: boolean;
  showText?: boolean;
  textSize?: string;
  variant?: "horizontal" | "mark" | "stacked";
}

export default function CloudFlipLogo({
  className = "",
  size = 36,
  showTagline = true,
  showText = true,
  variant = "horizontal",
}: LogoProps) {
  if (!showText || variant === "mark") {
    return (
      <img
        src="/logo-mark.png"
        alt="CloudFlip Icon"
        style={{ height: `${size}px`, width: "auto" }}
        className={`object-contain shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      />
    );
  }

  if (variant === "stacked") {
    return (
      <img
        src="/logo-full.png"
        alt="CloudFlip - Build • Automate • Grow"
        style={{ height: `${size * 1.5}px`, width: "auto" }}
        className={`object-contain shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      <img
        src={showTagline ? "/logo-horizontal.png" : "/logo-horizontal-compact.png"}
        alt="CloudFlip - Build • Automate • Grow"
        style={{ height: `${size}px`, width: "auto" }}
        className="object-contain shrink-0 transition-transform duration-200 hover:scale-105"
      />
    </div>
  );
}
