'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard, LogIn, Sparkles } from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-300">
            FB
          </span>
          <span className="text-lg font-bold text-slate-950">FormBuilder</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/forms" className="transition hover:text-slate-950">Browse forms</Link>
          <Link href="/pricing" className="transition hover:text-slate-950">Pricing</Link>
          <a href="/#features" className="transition hover:text-slate-950">Features</a>
          <a href="/#faq" className="transition hover:text-slate-950">FAQ</a>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[180px] truncate text-sm font-semibold text-slate-600 sm:block">
                {user.email}
              </span>
              <Link href="/dashboard" className={cn(buttonVariants({ size: 'sm' }), 'bg-slate-950 text-white hover:bg-slate-800')}>
                <LayoutDashboard className="mr-2 size-4" />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex')}>
                <LogIn className="mr-2 size-4" />
                Sign in
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: 'sm' }), 'bg-slate-950 text-white hover:bg-slate-800')}>
                <Sparkles className="mr-2 size-4" />
                Start
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
