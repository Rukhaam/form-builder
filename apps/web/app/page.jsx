"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  Globe,
  Palette,
} from "lucide-react";
import SplitText from "@/components/ui/SplitText";

import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth";
import { faqs, templatesPreview } from "@/utils/homePageUtils";
import { AnimatedBuilder } from "@/utils/homePageComps";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ParallaxSection,
  ParallaxElement,
} from "@/components/ui/ParallaxSection";

export default function Home() {
  const [user, setUser] = useState(null);
  const heroRef = useRef(null);

  // Parallax: track scroll progress within the hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-950 selection:bg-violet-200 selection:text-violet-900">
      <Navbar />

      {/* 🌅 FULL-COVER HERO — bg-cover image with parallax + bottom mask */}
      <section ref={heroRef} className="relative w-full overflow-hidden">
        {/* ── Container: sets h-screen, clips overflow, applies bottom mask ── */}
        <div
          className="relative w-full h-screen min-h-[680px] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 90%, transparent 100%)",
          }}
        >
          {/* ── Parallax image layer — oversized so it has room to translate ── */}
          <motion.div
            style={{ y: bgY }}
            className="absolute inset-[-15%] bg-[url('/bg-hero.png')] bg-cover bg-center will-change-transform"
          />

          {/* Scrim — full-width on mobile, left-faded on lg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          {/* Extra left-fade scrim on larger screens */}
          <div
            className="absolute inset-0 pointer-events-none hidden lg:block"
            style={{
              background:
                "linear-gradient(105deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 36%, transparent 60%)",
            }}
          />

          {/* ── Text layer — parallax drifts up gently on scroll ── */}
          <motion.div
            style={{ y: textY }}
            className="absolute inset-0 flex items-center will-change-transform"
          >
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 pt-20">
              {/* On mobile: full-width centered. On lg: left-aligned max-w-[580px] */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-[580px]">
                {/* Eye-brow badge */}
                <motion.div
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75"
                >
                  <Sparkles className="size-3 text-amber-400" />
                  Form Builder · Redefined
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-xl sm:text-[2.75rem] lg:text-[4.5rem] font-semibold tracking-tight leading-[1.2] text-white mb-6"
                  style={{ textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
                >
                  Build forms that feel like magic.
                </motion.h1>

                {/* Divider line */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-8 h-px w-12 origin-left bg-white/40"
                />

                {/* Sub-copy */}
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-6 text-xs sm:text-base font-normal leading-relaxed tracking-wide text-white/70 max-w-[480px]"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
                >
                  A focused workspace for creating beautiful public forms,
                  collecting responses, and understanding data — all without the
                  clutter of a heavy admin panel.
                </motion.p>

                {/* CTA row */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.72,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
                >
                  <Link
                    href={user ? "/dashboard" : "/register"}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-13 w-full sm:w-auto justify-center rounded-full bg-white px-9 text-[15px] font-bold text-slate-950 shadow-2xl shadow-black/30 active:scale-[0.97] transition-all duration-300",
                    )}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                  <Link
                    href="/forms"
                    className="h-13 w-full sm:w-auto justify-center inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-7 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-white/20"
                  >
                    Browse forms
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatedBuilder />
      </section>

      {/* Stat ticker — below the hero image */}
      <section className="relative z-20 mx-auto mt-8 mb-20 w-full max-w-7xl overflow-hidden px-4 sm:mt-10 sm:mb-24">
        <div className="mx-auto w-full max-w-6xl border-y border-slate-200/80">
          <div className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <motion.div
              className="flex w-max items-center py-5 sm:py-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 25, repeat: Infinity }}
            >
              {[
                ["7+", "field types"],
                ["1 link", "to share"],
                ["Live", "analytics"],
                ["AI", "assistant"],
                ["100%", "type-safe"],
                ["Webhooks", "integrated"],
                ["7+", "field types"],
                ["1 link", "to share"],
                ["Live", "analytics"],
                ["AI", "assistant"],
                ["100%", "type-safe"],
                ["Webhooks", "integrated"],
              ].map(([value, label], index) => (
                <div
                  key={index}
                  className="flex flex-shrink-0 items-baseline gap-2.5 border-r border-slate-200/70 px-7 sm:px-10"
                >
                  <span className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    {value}
                  </span>
                  <span className="text-sm font-medium text-slate-400 sm:text-[15px]">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32"
      >
        <ParallaxElement range={["24px", "-24px"]} className="mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-2xl flex-col items-center text-center"
          >
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Built for focus
            </p>
            <h2 className="text-balance text-xl md:text-5xl lg:text-[3.5rem] font-medium tracking-tight text-slate-950">
              Everything you need.
              <br />
              Nothing you don't.
            </h2>
            <p className="mt-4 max-w-md text-xs sm:text-lg font-medium leading-relaxed text-slate-500">
              Three focused tools. Infinite possibilities.
            </p>
          </motion.div>
        </ParallaxElement>

        {/* Card grid — bento-style, cards parallax at a deeper range */}
        <ParallaxElement range={["40px", "-40px"]}>
          <div className="grid gap-4 md:grid-cols-2 lg:gap-5 lg:grid-cols-3">
            {/* ① BUILDER — wide card spanning 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
                delay: 0,
              }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-colors duration-300 hover:border-slate-300 lg:col-span-2"
            >
              {/* Visual area */}
              <div className="relative min-h-[230px] flex-1 overflow-hidden border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                {/* Subtle grid */}
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)]"
                  style={{ backgroundSize: "32px 32px" }}
                />
                {/* Floating field cards */}
                <div className="relative z-10 mx-auto flex max-w-sm flex-col gap-2.5 pt-2">
                  {[
                    { label: "Full name", width: "w-3/4", active: true },
                    { label: "Work email", width: "w-1/2", active: false },
                    { label: "Message", width: "w-2/3", active: false },
                  ].map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.15 + i * 0.1,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 bg-white shadow-sm transition-all duration-500",
                        f.active
                          ? "border-slate-900 shadow-slate-200"
                          : "border-slate-200",
                      )}
                    >
                      {f.active && (
                        <span className="block w-1 h-5 rounded-full bg-slate-900 shrink-0" />
                      )}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-2 w-16 rounded-full bg-slate-300" />
                        <div
                          className={cn(
                            "h-2 rounded-full bg-slate-100",
                            f.width,
                          )}
                        />
                      </div>
                      {f.active && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
                          Text
                        </span>
                      )}
                    </motion.div>
                  ))}
                  {/* Add field button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-400 cursor-default"
                  >
                    <span className="text-slate-300">+</span> Add field
                  </motion.div>
                </div>
              </div>
              {/* Text area */}
              <div className="p-6 sm:p-7">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Builder
                </span>
                <h3 className="mt-2 text-xl font-medium tracking-tight text-slate-950 sm:text-2xl">
                  Fast, intuitive form builder.
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-500">
                  Compose clean forms with field controls, choice options,
                  drafts, and publishing in one focused workspace.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {[
                    "Drag-and-drop ordering",
                    "7+ field types",
                    "Auto-save drafts",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 rounded-md bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      <CheckCircle2 className="size-3 text-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* ② ANALYTICS — tall single col */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-colors duration-300 hover:border-slate-300"
            >
              <div className="relative flex min-h-[230px] flex-1 flex-col justify-end overflow-hidden border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)]"
                  style={{ backgroundSize: "32px 32px" }}
                />
                {/* Bar chart */}
                <div className="relative z-10 flex items-end gap-2 h-36 px-2">
                  {[55, 80, 42, 95, 68, 100, 73].map((h, i) => (
                    <motion.div
                      key={i}
                      className="origin-bottom flex-1 rounded-t-md bg-slate-800"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.2 + i * 0.07,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* Live badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5"
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-slate-900" />
                  <span className="text-[11px] font-semibold text-slate-700">
                    Live
                  </span>
                </motion.div>
              </div>
              <div className="p-6 sm:p-7">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Insights
                </span>
                <h3 className="mt-2 text-xl font-medium tracking-tight text-slate-950 sm:text-2xl">
                  Live analytics &amp; reporting.
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-500">
                  Track responses and understand completion rates at a
                  glance—without leaving the dashboard.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {[
                    "Real-time tracking",
                    "Visual charts",
                    "Submission views",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 rounded-md bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      <CheckCircle2 className="size-3 text-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* ③ DISTRIBUTION — single col */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2,
              }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-colors duration-300 hover:border-slate-300"
            >
              <div className="relative flex min-h-[230px] flex-1 flex-col items-center justify-center gap-4 overflow-hidden border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)]"
                  style={{ backgroundSize: "32px 32px" }}
                />
                {/* Published badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2"
                >
                  <CheckCircle2 className="size-4 text-slate-900" />
                  <span className="text-sm font-semibold text-slate-900">
                    Published
                  </span>
                </motion.div>
                {/* Link copy row */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="relative z-10 flex w-full max-w-[220px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                >
                  <Globe className="size-3.5 text-slate-400 shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-1">
                    Copy
                  </span>
                </motion.div>
                {/* Avatar row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="relative z-10 flex -space-x-2"
                >
                  {[
                    "bg-slate-200",
                    "bg-slate-300",
                    "bg-slate-400",
                    "bg-slate-500",
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={cn(
                        "size-8 rounded-full border-2 border-white shadow-sm",
                        c,
                      )}
                    />
                  ))}
                  <div className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500 shadow-sm">
                    +9
                  </div>
                </motion.div>
              </div>
              <div className="p-6 sm:p-7">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Distribution
                </span>
                <h3 className="mt-2 text-xl font-medium tracking-tight text-slate-950 sm:text-2xl">
                  Seamless public sharing.
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-500">
                  Publish to a public gallery or send a secure link. One click,
                  instantly live.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {[
                    "One-click publish",
                    "Password lock",
                    "Gallery listing",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 rounded-md bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      <CheckCircle2 className="size-3 text-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* ④ AI ASSISTANT — wide card spanning 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.25,
              }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-colors duration-300 hover:border-slate-300 md:flex-row lg:col-span-2"
            >
              <div className="relative flex min-h-[220px] flex-1 flex-col justify-end gap-3 overflow-hidden border-b border-slate-100 bg-slate-50/70 p-6 md:border-r md:border-b-0 sm:p-7">
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)]"
                  style={{ backgroundSize: "32px 32px" }}
                />
                {/* Chat bubbles */}
                {[
                  {
                    text: "Create a 3-field contact form with email required",
                    role: "user",
                  },
                  {
                    text: "Done — 3 fields added: Name, Email (required), and Message.",
                    role: "ai",
                  },
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.18 }}
                    className={cn(
                      "relative z-10 max-w-[85%] rounded-xl px-4 py-3 text-sm font-medium leading-relaxed",
                      msg.role === "user"
                        ? "self-end bg-slate-900 text-white rounded-br-sm"
                        : "self-start bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm",
                    )}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-7 md:max-w-xs">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  AI
                </span>
                <h3 className="mt-2 text-xl font-medium tracking-tight text-slate-950 sm:text-2xl">
                  Built-in AI assistant.
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-500">
                  Describe what you need. The AI generates your form structure
                  instantly — no config required.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {[
                    "Natural language input",
                    "Auto field types",
                    "Instant preview",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 rounded-md bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      <CheckCircle2 className="size-3 text-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </ParallaxElement>
      </section>

      {/* Community Gallery Section */}
      <ParallaxSection
        as="section"
        className="border-t border-slate-200/60 bg-slate-50 py-24"
        bgClassName="bg-slate-100"
        bgRange={["8%", "-8%"]}
        contentRange={["3%", "-3%"]}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="text-xl md:text-5xl font-medium tracking-tight text-slate-950">
              Don't start from scratch.
            </h2>
            <p className="mt-3 max-w-2xl text-xs sm:text-lg text-slate-600">
              Choose from dozens of beautiful, pre-built templates and themes
              designed for conversion.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {templatesPreview.map((tpl, i) => (
              <div
                key={i}
                className="group flex flex-col justify-between rounded-[2rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 transition-all duration-500 active:-translate-y-2 active:shadow-2xl"
              >
                {/* Visual Mockup */}
                <div className="relative h-56 w-full overflow-hidden rounded-t-[2rem] bg-slate-100 transition-colors">
                  <img
                    src={tpl.imageUrl}
                    alt={tpl.title}
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                {/* Content & CTA */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <span className="mb-3 w-fit rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {tpl.category}
                  </span>
                  <h3 className="mb-2 text-base sm:text-lg font-medium text-slate-950">
                    {tpl.title}
                  </h3>
                  <p className="mb-5 text-xs sm:text-xs font-medium leading-relaxed text-slate-500">
                    {tpl.description}
                  </p>

                  <div className="mt-auto">
                    <Link
                      href={user ? "/templates" : "/register"}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full rounded-xl transition-all duration-300 text-xs sm:text-sm h-11",
                        user
                          ? "bg-slate-950 text-white active:bg-slate-800"
                          : "bg-white text-black active:bg-black active:text-white shadow-md active:shadow-lg",
                      )}
                    >
                      {user ? "Use template" : "Sign up to use"}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/templates"
              className="group flex items-center text-xs sm:text-sm font-medium text-violet-600 active:text-violet-700"
            >
              View all templates
              <ArrowRight className="ml-1 size-4 transition-transform group-active:translate-x-1" />
            </Link>
          </div>
        </div>
      </ParallaxSection>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-20">
        <ParallaxElement range={["20px", "-20px"]}>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-600">
              FAQ
            </div>
            <h2 className="mt-3 text-lg md:text-3xl font-medium tracking-tight text-slate-950">
              Common questions.
            </h2>
          </div>
          <div className="grid gap-4 sm:gap-5">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all open:bg-slate-50 open:shadow-none"
              >
                <summary className="cursor-pointer list-none text-sm sm:text-base font-medium text-slate-950 outline-none">
                  <span className="flex items-center justify-between gap-4 font-medium text-slate-800">
                    {faq.question}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform group-open:rotate-45 group-open:bg-slate-950 group-open:text-white text-sm">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm font-normal leading-relaxed text-slate-500 animate-rise-in">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </ParallaxElement>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="relative overflow-hidden rounded-[3rem] bg-white p-8 text-slate-950 border border-slate-200 shadow-sm md:p-16">
          {/* Subtle noise for texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-multiply"></div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-600 border border-slate-200 shadow-sm">
                <FileText className="size-4" />
                Public gallery
              </div>
              <h2 className="text-xl md:text-5xl lg:text-6xl font-medium tracking-tight text-balance">
                Answer forms from the community.
              </h2>
              <p className="mt-4 text-xs sm:text-lg leading-relaxed text-slate-500 font-medium text-balance">
                Published forms show up in one clean place, ready for visitors
                to open and submit without needing an account.
              </p>
              <Link
                href="/forms"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 h-14 rounded-xl bg-slate-950 px-8 text-lg font-medium text-white",
                )}
              >
                Explore forms
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </div>

            {/* Right: form cards with deeper parallax */}
            <ParallaxElement range={["50px", "-50px"]}>
              <div className="grid gap-4">
                {[
                  "Customer research",
                  "Workshop signup",
                  "Product feedback",
                ].map((name, index) => (
                  <div
                    key={name}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 active:scale-[1.02] active:border-black/60"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-medium">{name}</div>
                        <div className="mt-2 text-sm font-medium text-slate-500">
                          {index + 4} fields ready to answer
                        </div>
                      </div>
                      <div className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                        <ArrowRight className="size-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ParallaxElement>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
