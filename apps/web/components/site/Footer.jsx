'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, LayoutDashboard, Mail, Sparkles } from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Footer() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return (
    <footer className="border-t border-white/70 bg-white/60 px-4 py-10 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
              FB
            </span>
            <span className="text-lg font-bold text-slate-950">FormBuilder</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Beautiful form creation, publishing, and response analytics for tiny teams and solo builders.
          </p>
          <div className="mt-5">
            {user ? (
              <Link href="/dashboard" className={cn(buttonVariants({ size: 'sm' }), 'bg-slate-950 text-white hover:bg-slate-800')}>
                <LayoutDashboard className="mr-2 size-4" />
                Return to dashboard
              </Link>
            ) : (
              <Link href="/register" className={cn(buttonVariants({ size: 'sm' }), 'bg-slate-950 text-white hover:bg-slate-800')}>
                <Sparkles className="mr-2 size-4" />
                Build your first form
                <ArrowRight className="ml-2 size-4" />
              </Link>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase text-slate-950">Explore</h2>
          <div className="mt-4 grid gap-3 text-sm font-medium text-slate-600">
            <Link href="/forms" className="hover:text-slate-950">Public forms</Link>
            <Link href="/pricing" className="hover:text-slate-950">Pricing</Link>
            <Link href="/dashboard/analytics" className="hover:text-slate-950">Analytics</Link>
            <Link href="/dashboard/editor/new" className="hover:text-slate-950">Create form</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase text-slate-950">Connect</h2>
          <div className="mt-4 grid gap-3 text-sm font-medium text-slate-600">
            <a href="mailto:hello@formbuilder.local" className="flex items-center gap-2 hover:text-slate-950">
              <Mail className="size-4" />
              hello@formbuilder.local
            </a>
            <a href="https://github.com" className="flex items-center gap-2 hover:text-slate-950">
              <ExternalLink className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-5 text-xs font-medium text-slate-500">
        <span>© 2026 FormBuilder. Crafted for clean collection.</span>
        <span>{user ? `Signed in as ${user.email}` : 'Create, publish, collect.'}</span>
      </div>
    </footer>
  );
}
