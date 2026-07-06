"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const VB = 400;
const GRADIENT_R = 350;
const DEFAULT_C = 200;

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// ── Minimalist "WF" Monogram paths ──────────────────────────────────
// Clean, geometric lines with parallel angles for a tech aesthetic.
const W_PATH = "M 95 140 L 125 260 L 155 170 L 185 260 L 215 140";
const F_PATH = "M 235 260 L 265 140 L 310 140 M 250 200 L 290 200";

const PATHS_BASE = [W_PATH, F_PATH];

export function LogoAnimation() {
  const containerRef = useRef(null);
  const pointerX = useMotionValue(DEFAULT_C);
  const pointerY = useMotionValue(DEFAULT_C);

  const spring = { damping: 30, stiffness: 150 };
  const cx = useSpring(
    useTransform(pointerX, (v) => clamp(v, 0, VB)),
    spring,
  );
  const cy = useSpring(
    useTransform(pointerY, (v) => clamp(v, 0, VB)),
    spring,
  );

  useEffect(() => {
    const onMove = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pointerX.set(((e.clientX - r.left) / r.width) * VB);
      pointerY.set(((e.clientY - r.top) / r.height) * VB);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [pointerX, pointerY]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 h-full w-full bg-slate-950 items-center justify-center rounded-[2.5rem] overflow-hidden"
    >
      {/* SVG with dual-layer rendering: white base + gradient-stroked overlay */}
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-[70%] max-w-[300px] h-auto"
      >
        <defs>
          <motion.radialGradient
            id="glow"
            cx={cx}
            cy={cy}
            r={GRADIENT_R}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#7c3aed" stopOpacity="0.5" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </motion.radialGradient>
        </defs>

        {/* White base layer */}
        {PATHS_BASE.map((d, i) => (
          <path
            key={`base-${i}`}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Gradient-stroked overlay — follows mouse */}
        {PATHS_BASE.map((d, i) => (
          <path
            key={`glow-${i}`}
            d={d}
            fill="none"
            stroke="url(#glow)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
