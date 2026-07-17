"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** Returns true once the viewport is >= the given breakpoint px (default 768 = md) */
function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isDesktop;
}

/**
 * ParallaxSection
 *
 * Wraps any section and gives scroll-driven parallax to two independent layers:
 *  - bgY      — a background layer (slower movement, deeper feel)
 *  - contentY — the content layer (slight upward drift)
 *
 * Parallax is disabled on mobile (< md) to prevent overflow / jank.
 */
export function ParallaxSection({
  as: Tag = "section",
  className,
  bgClassName,
  bgRange = ["6%", "-6%"],
  contentRange = ["3%", "-3%"],
  children,
}) {
  const ref = useRef(null);
  const isDesktop = useIsDesktop();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // On mobile pass zero ranges so there is no translate at all
  const activeBgRange      = isDesktop ? bgRange      : ["0%", "0%"];
  const activeContentRange = isDesktop ? contentRange : ["0%", "0%"];

  const bgY      = useTransform(scrollYProgress, [0, 1], activeBgRange);
  const contentY = useTransform(scrollYProgress, [0, 1], activeContentRange);

  return (
    <Tag ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* Optional background layer — moves at bg speed */}
      {bgClassName && (
        <motion.div
          aria-hidden
          style={{ y: bgY }}
          className={cn("absolute inset-[-8%] pointer-events-none", bgClassName)}
        />
      )}

      {/* Content layer — subtle drift */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </Tag>
  );
}

/**
 * ParallaxElement
 *
 * Lightweight inline parallax for any single element (heading, image, card…).
 * Tracks its own scroll progress independently.
 * Parallax is disabled on mobile (< md) to prevent layout issues.
 */
export function ParallaxElement({
  range = ["30px", "-30px"],
  className,
  children,
}) {
  const ref = useRef(null);
  const isDesktop = useIsDesktop();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // On mobile: no translate
  const activeRange = isDesktop ? range : ["0px", "0px"];
  const y = useTransform(scrollYProgress, [0, 1], activeRange);

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
