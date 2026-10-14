"use client";

import React from "react";

interface VehicleOsLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  withContainer?: boolean;
}

export default function VehicleOsLogo({
  size,
  className = "h-6 w-6",
  withContainer = false,
  ...props
}: VehicleOsLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        {/* Dark Obsidian & Cyber Emerald Glow */}
        <radialGradient id="vosBg" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#083324" />
          <stop offset="45%" stop-color="#041810" />
          <stop offset="100%" stop-color="#020805" />
        </radialGradient>

        {/* Emerald Hypercar Bodywork */}
        <linearGradient id="bodyFinish" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="25%" stopColor="#10b981" />
          <stop offset="75%" stopColor="#059669" />
          <stop offset="100%" stopColor="#044e36" />
        </linearGradient>

        {/* Speedometer HUD Halo */}
        <linearGradient id="hudHalo" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="75%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>

        {/* Cockpit Glass Canopy */}
        <linearGradient id="canopyGlass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#0284c7" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#032219" stopOpacity="0.98" />
        </linearGradient>

        {/* Glowing Cyber Lightbar */}
        <linearGradient id="cyberBeam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="20%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Aerodynamic Ground Splitter */}
        <linearGradient id="splitterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="lightGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {withContainer && (
        <>
          <rect width="128" height="128" rx="28" fill="url(#vosBg)" />
          <rect
            width="128"
            height="128"
            rx="28"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeOpacity="0.4"
          />
        </>
      )}

      {/* Speedometer HUD Sweeping Arc */}
      <path
        d="M 22 84 A 48 48 0 1 1 106 84"
        fill="none"
        stroke="url(#hudHalo)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Speed Needle / Peak Velocity Marker at Top */}
      <line
        x1="64"
        y1="14"
        x2="64"
        y2="21"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#lightGlow)"
      />

      {/* Hypercar Aerodynamic Cockpit & Windshield */}
      <path
        d="M 47 40 Q 64 34 81 40 L 89 53 Q 64 49 39 53 Z"
        fill="url(#canopyGlass)"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeOpacity="0.9"
      />

      {/* Hypercar Sculpted Body & Wide Fenders */}
      <path
        d="M 39 53 C 27 54, 18 60, 17 68 L 19 75 L 29 75 L 34 85 L 64 95 L 94 85 L 99 75 L 109 75 L 111 68 C 110 60, 101 54, 89 53 L 79 59 L 49 59 Z"
        fill="url(#bodyFinish)"
      />

      {/* Aerodynamic Hood Power S-Duct (Sharp 'V') */}
      <path
        d="M 48 55 L 64 77 L 80 55 L 72 55 L 64 67 L 56 55 Z"
        fill="#022117"
        stroke="#34d399"
        strokeWidth="1.5"
      />

      {/* Signature Continuous Cyberpunk / Hypercar Full-Width LED Lightbar */}
      <path
        d="M 22 67 L 44 67 L 54 71 L 64 71 L 74 71 L 84 67 L 106 67 L 104 70.5 L 83 70.5 L 73 73.5 L 64 73.5 L 55 73.5 L 45 70.5 L 24 70.5 Z"
        fill="url(#cyberBeam)"
        filter="url(#lightGlow)"
      />

      {/* Telemetry Center Origin Core */}
      <circle cx="64" cy="72.5" r="2.2" fill="#ffffff" />

      {/* Lower Aerodynamic Ground Splitter / Diffuser Wing */}
      <path
        d="M 28 89 L 64 102 L 100 89 L 93 93 L 64 106 L 35 93 Z"
        fill="url(#splitterGrad)"
      />
    </svg>
  );
}
