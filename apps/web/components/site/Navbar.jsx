'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, LayoutDashboard, LogIn, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getSessionUser } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Browse forms', href: '/forms' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Features', href: '/#features' },
  { label: 'About Us', href: '/about' },
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/40 bg-white/70 px-4 py-3 shadow-lg shadow-slate-200/20 backdrop-blur-xl">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-sm font-black text-white shadow-md transition-transform hover:scale-105">
            FB
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-950">FormBuilder</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-6 rounded-full bg-white/40 px-6 py-2 shadow-inner shadow-white/50 ring-1 ring-black/5 backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-violet-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* DESKTOP AUTH / ACTIONS */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="max-w-[160px] truncate px-2 text-sm font-semibold text-slate-500">
                {user.email}
              </span>
              <Link href="/dashboard" className={cn(buttonVariants({ size: 'sm' }), 'rounded-full bg-slate-950 px-5 text-white shadow-md transition-transform hover:scale-105 hover:bg-slate-800')}>
                <LayoutDashboard className="mr-2 size-4" />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'rounded-full font-semibold text-slate-600 hover:text-slate-950')}>
                <LogIn className="mr-2 size-4" />
                Sign in
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: 'sm' }), 'rounded-full bg-slate-950 px-5 text-white shadow-md transition-transform hover:scale-105 hover:bg-slate-800')}>
                <Sparkles className="mr-2 size-4 text-violet-300" />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="flex size-10 items-center justify-center rounded-full bg-white/50 text-slate-900 ring-1 ring-black/5 backdrop-blur-md transition-colors hover:bg-white md:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </nav>

      {/* MOBILE SIDEBAR (Framer Motion) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm md:hidden"
            />

            {/* Sliding Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[85%] max-w-[320px] flex-col border-l border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-2xl md:hidden"
            >
              <div className="flex items-center justify-between pb-6">
                <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white shadow-md">
                    FB
                  </span>
                  <span className="text-lg font-bold text-slate-950">FormBuilder</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="flex flex-col gap-2 py-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-violet-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth/Actions */}
              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-200/50">
                {user ? (
                  <>
                    <div className="px-2 pb-2 text-sm font-semibold text-slate-500 truncate">
                      Signed in as <br/>
                      <span className="text-slate-900">{user.email}</span>
                    </div>
                    <Link href="/dashboard" className={cn(buttonVariants({ size: 'lg' }), 'w-full rounded-xl bg-slate-950 text-white')}>
                      <LayoutDashboard className="mr-2 size-5" />
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full rounded-xl border-slate-200 bg-white')}>
                      <LogIn className="mr-2 size-5" />
                      Sign in
                    </Link>
                    <Link href="/register" className={cn(buttonVariants({ size: 'lg' }), 'w-full rounded-xl bg-slate-950 text-white')}>
                      <Sparkles className="mr-2 size-5 text-violet-300" />
                      Get Started Free
                      <ArrowRight className="ml-auto size-5" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}