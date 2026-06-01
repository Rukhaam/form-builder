'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';



import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSessionUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { authFail, authStart, setCredentials } from '@/store/slices/authSlice';
import { trpc } from '@/utils/trpc';
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://form-builder-7vyq.onrender.com').replace(/\/+$/, '');

const OAUTH_ERROR_MESSAGES = {
  manual_account_exists: 'This email already uses password sign-in. Sign in with your password instead.',
  oauth_account_mismatch: 'This Google account does not match the account linked to that email.',
  oauth_not_configured: 'Google OAuth is not configured yet.',
  oauth_missing_code: 'Google did not return a sign-in code. Please try again.',
  oauth_failed: 'Google sign-in failed. Please try again.',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oauthError, setOauthError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (getSessionUser()) {
      router.replace('/dashboard');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      const message = OAUTH_ERROR_MESSAGES[error] || OAUTH_ERROR_MESSAGES.oauth_failed;
      setOauthError(message);
      toast.error(message);
    }
  }, [router]);

  const loginMutation = trpc.auth.login.useMutation({
    onMutate: () => dispatch(authStart()),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      dispatch(setCredentials({ user: data.user }));
      toast.success('Welcome back');
      router.push('/dashboard');
    },
    onError: (error) => {
      dispatch(authFail(error.message));
      toast.error(error.message || 'Failed to login');
    },
  });

  const loading = isLoading || loginMutation.isLoading || loginMutation.isPending;

  const googleHref = useMemo(() => `${API_URL}/api/auth/google`, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff7ef,transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] text-slate-950">
      <Navbar />

      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 pb-16 pt-32 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="animate-rise-in hidden lg:block">
          <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/70">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
              <ShieldCheck className="size-4" />
              Secure workspace
            </div>
            <h1 className="text-5xl font-medium leading-tight">Welcome back to your form command center.</h1>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Continue building, publishing, and reading responses from one polished dashboard.
            </p>
            <div className="mt-8 grid gap-3">
              {['OAuth and password sign-in', 'Draft and publish workflow', 'Response analytics ready'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <Sparkles className="size-5 text-emerald-300" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="animate-rise-in rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur-xl md:p-8">
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
              <LockKeyhole className="size-4" />
              Sign in
            </div>
            <h2 className="text-4xl font-medium text-slate-950">Access your dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">Use your password account or continue with Google.</p>
          </div>

          {oauthError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {oauthError}
            </div>
          )}

          <a
            href={googleHref}
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 w-full border-white/80 bg-white/80 text-slate-900 shadow-sm active:bg-white')}
          >
            <span className="mr-3 flex size-6 items-center justify-center rounded-full bg-white text-sm font-medium shadow-sm">G</span>
            Continue with Google
          </a>

          <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 border-white/80 bg-white/80 pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              {/* 🚀 ADDED: Flex container to align label and Forgot Password link */}
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-medium text-emerald-700 transition active:text-emerald-800 active:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 border-white/80 bg-white/80 pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="h-12 w-full bg-slate-950 text-white active:bg-slate-800" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-slate-950 active:underline">
              Create one
            </Link>
          </p>
        </section>
      </section>

      <Footer />
    </main>
  );
}
