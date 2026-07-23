"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
  { label: "AI Assistant", href: "/dashboard/assistant", protected: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Templates", href: "/templates" },
  { label: "About Us", href: "/about" },
];

export function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleProtectedLinkClick = (e, link) => {
    if (link.protected) {
      e.preventDefault();
      const currentUser = getSessionUser();
      if (!currentUser) {
        toast.error("Please sign in to access AI Assistant.");
        router.push("/login");
      } else {
        router.push(link.href);
      }
    }
  };

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  const isHomePage = pathname === "/";

  // Switch navbar from transparent → white after scrolling past ~80px
  // Only applies on the homepage; other pages always use the solid style
  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll(); // check initial position
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

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
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 hidden md:block"
        animate={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "rgba(0,0,0,0)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
          borderBottomColor: scrolled ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0)",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4 text-[15px] font-medium tracking-tight">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-70"
          >
            <motion.div
              className="flex size-8 items-center justify-center rounded-xl shadow-sm"
              animate={{
                backgroundColor: scrolled
                  ? "#0f172a"
                  : "rgba(255, 255, 255, 0.15)",
                borderColor: scrolled
                  ? "rgba(15, 23, 42, 0.1)"
                  : "rgba(255, 255, 255, 0.3)",
              }}
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                backdropFilter: scrolled ? "none" : "blur(8px)",
              }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="size-4 text-amber-400" />
            </motion.div>
            <motion.span
              className="text-lg font-bold tracking-tight"
              animate={{ color: scrolled ? "#0f172a" : "#ffffff" }}
              transition={{ duration: 0.3 }}
            >
              FormBuilder
            </motion.span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="flex items-center gap-8">
            {NAV_LINKS.filter((l) => l.label !== "Home").map((link) => (
              <motion.div
                key={link.label}
                animate={{
                  color: scrolled ? "#475569" : "rgba(255,255,255,0.82)",
                }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={(e) => handleProtectedLinkClick(e, link)}
                  className="transition-opacity hover:opacity-70 text-[14px]"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* DESKTOP AUTH / ACTIONS */}
          <div className="flex items-center gap-5">
            {user ? (
              <Link
                href="/dashboard"
                className="transition-opacity hover:opacity-70 flex items-center"
              >
                <motion.div
                  animate={{ color: scrolled ? "#0f172a" : "#ffffff" }}
                  transition={{ duration: 0.3 }}
                >
                  <LayoutDashboard className="size-[18px]" strokeWidth={2} />
                </motion.div>
              </Link>
            ) : (
              <>
                <motion.div
                  animate={{
                    color: scrolled ? "#475569" : "rgba(255,255,255,0.85)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href="/login"
                    className="transition-opacity hover:opacity-70 text-[14px] font-medium"
                  >
                    Sign in
                  </Link>
                </motion.div>
                <Link
                  href="/register"
                  className={cn(
                    "h-9 rounded-full px-5 text-[13px] font-semibold transition-all duration-300 flex items-center justify-center",
                    scrolled
                      ? "bg-slate-950 text-white hover:bg-slate-800"
                      : "bg-white/15 text-white border border-white/30 backdrop-blur-sm hover:bg-white/25",
                  )}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </motion.header>

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
        className="fixed top-5 left-5 z-50 flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-full ring-1 ring-black/10 shadow-lg md:hidden transition-all active:scale-95 active:bg-white"
      >
        <div className="flex size-6 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Sparkles className="size-3.5 text-amber-400" />
        </div>
        <span className="text-sm font-bold text-slate-950 pr-1">
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
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      handleProtectedLinkClick(e, link);
                    }}
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
