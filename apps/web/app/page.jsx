"use client";

import { useEffect, useState } from "react";
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
import { AnimatedBuilder, GridMeteors } from "@/utils/homePageComps";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-950 selection:bg-violet-200 selection:text-violet-900">
      <Navbar />

      {/* 🚀 FOCUSED CENTERED HERO SECTION WITH GRID & METEORS */}
      <section className="relative w-full flex flex-col items-center justify-start pt-10   overflow-hidden mt-20">
        <GridMeteors />

        {/* Hero Content Layer */}
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 text-center mt-12">
          <div className="animate-rise-in flex flex-col items-center">
            {/* 🚀 INTEGRATED SPLIT TEXT COMPONENT */}
            <SplitText
              tag="h1"
              text="Build forms that feel like magic."
              className="max-w-4xl text-5xl font-medium tracking-tight leading-[1.15] text-slate-950 md:text-7xl lg:text-[4.5rem] font-medium p-10"
              delay={40}
              duration={0.8}
              ease="power3.out"
              splitType="words, chars"
              from={{
                opacity: 0,
                y: 40,
                rotationX: -90,
                transformOrigin: "0% 50% -50",
              }}
              to={{ opacity: 1, y: 0, rotationX: 0 }}
            />

            <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-wrap text-slate-600  md:text-xl">
              A slick workspace for creating beautiful public forms, collecting
              answers, and analyzing data—without the mess of a cluttered admin
              panel.
            </p>

            {/* Centered Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              {/* AUTH AWARE CTA BUTTON */}
              <Link
                href={user ? "/dashboard" : "/register"}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto h-14 rounded-full bg-slate-950 px-10 text-lg font-medium text-white shadow-xl shadow-slate-900/20 active:scale-105 active:bg-slate-800 transition-all duration-300",
                )}
              >
                Get Started
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </div>
          </div>
        </div>

        <AnimatedBuilder />
      </section>

      {/* The Large, Dense Shadow Stat Cards */}
      <section className="relative z-20 mx-auto max-w-7xl px-4 mt-10 mb-24 overflow-hidden">
        {/* The Masking Container: Fades out the left and right edges */}
        <div className="mx-auto w-full max-w-5xl [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            // Increased the gap to give the pure text room to breathe
            className="flex w-max items-center gap-16 py-8"
            animate={{ x: ["0%", "-50%"] }}
            // Slightly slowed down the duration so the text is easily readable
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          >
            {[
              ["7+", "field types"],
              ["1 link", "to share"],
              ["Live", "analytics"],
              ["AI", "assistant"],
              ["100%", "type-safe"],
              ["Webhooks", "integrated"],

              // 🔄 DUPLICATED EXACTLY for the seamless infinite loop
              ["7+", "field types"],
              ["1 link", "to share"],
              ["Live", "analytics"],
              ["AI", "assistant"],
              ["100%", "type-safe"],
              ["Webhooks", "integrated"],
            ].map(([value, label], index) => (
              <div
                key={index}
                className="flex flex-shrink-0 items-center gap-3"
              >
                {/* Stark, medium typography for the value */}
                <span className="text-2xl font-semibold tracking-tight text-slate-900">
                  {value}
                </span>
                {/* Softer, muted text for the label */}
                <span className="text-2xl font-medium text-slate-400">
                  {label}
                </span>

                {/* Subtle separator to create the classic 'ticker tape' rhythm */}
                <span className="ml-16 text-slate-200">✦</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative mx-auto max-w-6xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-4xl font-medium tracking-tight text-slate-950 md:text-5xl lg:text-6xl text-balance">
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
          <p className="mt-5 text-lg text-slate-500 font-medium leading-relaxed">
            Three focused tools. Infinite possibilities.
          </p>
        </motion.div>

        {/* Card grid — bento-style */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* ① BUILDER — wide card spanning 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0 }}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2 flex flex-col"
          >
            {/* Visual area */}
            <div className="relative flex-1 min-h-[260px] bg-slate-50 p-6 overflow-hidden border-b border-slate-100">
              {/* Subtle grid */}
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)]"
                style={{ backgroundSize: "28px 28px" }}
              />
              {/* Floating field cards */}
              <div className="relative z-10 flex flex-col gap-2.5 max-w-sm mx-auto pt-2">
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
                        className={cn("h-2 rounded-full bg-slate-100", f.width)}
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
            <div className="p-7">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Builder
              </span>
              <h3 className="mt-2 text-2xl font-medium tracking-tight text-slate-950">
                Fast, intuitive form builder.
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                Compose clean forms with field controls, choice options, drafts,
                and publishing in one focused workspace.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {[
                  "Drag-and-drop ordering",
                  "7+ field types",
                  "Auto-save drafts",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
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
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col"
          >
            <div className="relative flex-1 min-h-[260px] bg-slate-50 p-6 overflow-hidden border-b border-slate-100 flex flex-col justify-end">
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)]"
                style={{ backgroundSize: "28px 28px" }}
              />
              {/* Bar chart */}
              <div className="relative z-10 flex items-end gap-2 h-36 px-2">
                {[55, 80, 42, 95, 68, 100, 73].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 origin-bottom"
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
                className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-700">
                  Live
                </span>
              </motion.div>
            </div>
            <div className="p-7">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Insights
              </span>
              <h3 className="mt-2 text-2xl font-medium tracking-tight text-slate-950">
                Live analytics &amp; reporting.
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                Track responses and understand completion rates at a
                glance—without leaving the dashboard.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {[
                  "Real-time tracking",
                  "Visual charts",
                  "Submission views",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
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
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col"
          >
            <div className="relative flex-1 min-h-[260px] bg-slate-50 p-6 overflow-hidden border-b border-slate-100 flex flex-col items-center justify-center gap-5">
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)]"
                style={{ backgroundSize: "28px 28px" }}
              />
              {/* Published badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex items-center gap-2 rounded-full bg-white border border-slate-200 shadow-sm px-4 py-2"
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
                className="relative z-10 flex w-full max-w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-white shadow-sm px-3 py-2.5"
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
                  "bg-amber-200",
                  "bg-violet-200",
                  "bg-teal-200",
                  "bg-rose-200",
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
            <div className="p-7">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Distribution
              </span>
              <h3 className="mt-2 text-2xl font-medium tracking-tight text-slate-950">
                Seamless public sharing.
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                Publish to a public gallery or send a secure link. One click,
                instantly live.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {["One-click publish", "Password lock", "Gallery listing"].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
                    >
                      <CheckCircle2 className="size-3 text-slate-400" />
                      {item}
                    </li>
                  ),
                )}
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
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2 flex flex-col md:flex-row"
          >
            <div className="relative flex-1 min-h-[220px] bg-slate-50 p-7 overflow-hidden border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-end gap-3">
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)]"
                style={{ backgroundSize: "28px 28px" }}
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
                    "relative z-10 max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed",
                    msg.role === "user"
                      ? "self-end bg-slate-900 text-white rounded-br-sm"
                      : "self-start bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm",
                  )}
                >
                  {msg.text}
                </motion.div>
              ))}
            </div>
            <div className="p-7 md:max-w-xs flex flex-col justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                AI
              </span>
              <h3 className="mt-2 text-2xl font-medium tracking-tight text-slate-950">
                Built-in AI assistant.
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                Describe what you need. The AI generates your form structure
                instantly — no config required.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {[
                  "Natural language input",
                  "Auto field types",
                  "Instant preview",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
                  >
                    <CheckCircle2 className="size-3 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Gallery Section */}

      <section className="relative border-t border-slate-200/60 bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="text-4xl font-medium tracking-tight text-slate-950 md:text-5xl font-medium">
              Don't start from scratch.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
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
                <div className="flex flex-1 flex-col p-8">
                  <span className="mb-4 w-fit rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {tpl.category}
                  </span>
                  <h3 className="mb-3 text-2xl font-medium text-slate-950 font-medium ">
                    {tpl.title}
                  </h3>
                  <p className="mb-8 text-sm font-medium leading-relaxed text-slate-600">
                    {tpl.description}
                  </p>

                  <div className="mt-auto">
                    <Link
                      href={user ? "/templates" : "/register"}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full rounded-xl transition-all duration-300",
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
              className="group flex items-center text-sm font-medium text-violet-600 active:text-violet-700"
            >
              View all templates
              <ArrowRight className="ml-1 size-4 transition-transform group-active:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-24">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-600">
            FAQ
          </div>
          <h2 className="mt-4 text-4xl font-medium tracking-tight text-slate-950 md:text-5xl font-medium">
            Common questions.
          </h2>
        </div>
        <div className="grid gap-6">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-md shadow-slate-200/30 transition-all open:bg-slate-50 open:shadow-none"
            >
              <summary className="cursor-pointer list-none text-xl font-medium text-slate-950 outline-none">
                <span className="flex items-center justify-between gap-4 font-medium text-slate-700">
                  {faq.question}
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform group-open:rotate-45 group-open:bg-slate-950 group-open:text-white">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-6 text-lg font-medium leading-relaxed text-slate-600 animate-rise-in">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
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
              <h2 className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl text-balance">
                Answer forms from the community.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-500 font-medium text-balance">
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

            <div className="grid gap-4">
              {["Customer research", "Workshop signup", "Product feedback"].map(
                (name, index) => (
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
                ),
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
