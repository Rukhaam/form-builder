"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  LayoutDashboard,
  LogIn,
  Sparkles,
  Menu,
  X,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getSessionUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse forms", href: "/forms" },
  { label: "Pricing", href: "/pricing" },
  { label: "Templates", href: "/templates" },
  { label: "About Us", href: "/about" },
];

export function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* DESKTOP NAV — hidden on mobile */}
      <header className="sticky top-0 z-50 hidden md:block">
        <nav className="mx-auto flex w-full items-center justify-center gap-x-40 py-3.5 text-[15px] font-medium text-slate-800/90 tracking-tight bg-white/95">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-60 gap-3"
          >
            <img
              src="https://pub-749dd85c25e04947af34140aef9172fc.r2.dev/form-builder/ChatGPT%20Image%20Jun%2030%2C%202026%2C%2011_22_18%20PM.png"
              alt="FormBuilder Logo"
              className="size-[30px] object-contain opacity-90 "
            />
            <span className="text-lg font-medium text-slate-950">
              FormBuilder
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-opacity hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}

          {/* DESKTOP AUTH / ACTIONS */}
          {user ? (
            <Link
              href="/dashboard"
              className="transition-opacity hover:opacity-60 flex items-center"
            >
              <LayoutDashboard
                className="size-[15px] opacity-90"
                strokeWidth={2}
              />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="transition-opacity hover:opacity-60"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="transition-opacity hover:opacity-60"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* MOBILE: Floating hamburger icon only — no bar */}
      <button
        className="fixed top-5 right-5 z-50 flex size-11 items-center justify-center rounded-full bg-white/60 text-slate-900 ring-1 ring-black/10 backdrop-blur-md shadow-lg transition-all active:scale-95 active:bg-white md:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* MOBILE: Logo on left */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-50 flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-2 rounded-full ring-1 ring-black/10 shadow-lg md:hidden transition-all active:scale-95 active:bg-white"
      >
        <img
          src="https://pub-749dd85c25e04947af34140aef9172fc.r2.dev/form-builder/ChatGPT%20Image%20Jun%2030%2C%202026%2C%2011_22_18%20PM.png"
          alt="Logo"
          className="size-6 object-contain"
        />
        <span className="text-sm font-medium text-slate-950 pr-1">
          FormBuilder
        </span>
      </Link>

      {/* MOBILE: Full-screen circular reveal overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 1.75rem) 1.75rem)" }}
            animate={{
              clipPath: "circle(150% at calc(100% - 1.75rem) 1.75rem)",
            }}
            exit={{ clipPath: "circle(0% at calc(100% - 1.75rem) 1.75rem)" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed inset-0 z-[80] flex flex-col bg-white md:hidden"
          >
            {/* Close button — top right, matching hamburger position */}
            <div className="flex justify-end px-5 pt-5">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all active:scale-95 active:bg-slate-200"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Nav links — centered, staggered entrance */}
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{
                    delay: 0.08 * i,
                    type: "spring",
                    damping: 20,
                    stiffness: 180,
                  }}
                >
                  <Link
                    href={link.href}
                    className="block rounded-2xl px-6 py-4 text-center text-3xl font-semibold text-slate-800 transition-colors active:text-violet-600"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Auth actions — bottom */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{
                delay: 0.3,
                type: "spring",
                damping: 22,
                stiffness: 170,
              }}
              className="flex flex-col gap-3 px-8 pb-12"
            >
              {user ? (
                <>
                  <div className="px-2 pb-2 text-center text-sm font-medium text-slate-500 truncate">
                    Signed in as{" "}
                    <span className="text-slate-900">{user.email}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full rounded-2xl bg-slate-950 text-white",
                    )}
                  >
                    <LayoutDashboard className="mr-2 size-5" />
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full rounded-2xl border-slate-200 bg-white",
                    )}
                  >
                    <LogIn className="mr-2 size-5" />
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full rounded-2xl bg-slate-950 text-white",
                    )}
                  >
                    <Sparkles className="mr-2 size-5 text-violet-300" />
                    Get Started Free
                    <ArrowRight className="ml-auto size-5" />
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
