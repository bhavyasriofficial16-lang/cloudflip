import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
}

export default function CloudFlipLogo({
  className = "",
  size = 28,
  showText = true,
  textSize = "text-[19px]",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 font-display font-bold ${textSize} text-slate-900 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="cfLogoGrad" x1="4" y1="6" x2="32" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="55%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        <path
          d="M10 26C7.23858 26 5 23.7614 5 21C5 18.4142 6.96301 16.2853 9.49884 16.029C10.1232 12.2623 13.4022 9.33334 17.3333 9.33334C20.8973 9.33334 23.9265 11.7364 24.8872 15.0032C27.3224 15.4023 29.1667 17.5287 29.1667 20.1667C29.1667 23.3883 26.555 26 23.3333 26H10Z"
          fill="url(#cfLogoGrad)"
        />

        <path
          d="M15 17.5L20 21L15 24.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M11 21H19.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="23" cy="21" r="1.3" fill="#A5F3FC" />
      </svg>
      {showText && <span>CloudFlip</span>}
    </div>
  );
}
