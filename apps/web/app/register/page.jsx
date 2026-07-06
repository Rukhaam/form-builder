'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSessionUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { authFail, authStart, setCredentials } from '@/store/slices/authSlice';
import { trpc } from '@/utils/trpc';
import { LogoAnimation } from '@/components/site/LogoAnimation';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://form-builder-7vyq.onrender.com').replace(/\/+$/, '');

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (getSessionUser()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const googleHref = useMemo(() => `${API_URL}/api/auth/google`, []);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success('Check your email for the OTP');
      setStep(2);
    },
    onError: (error) => toast.error(error.message || 'Registration failed'),
  });

  const verifyMutation = trpc.auth.verifyOtp.useMutation({
    onMutate: () => dispatch(authStart()),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      dispatch(setCredentials({ user: data.user }));
      toast.success('Account verified successfully');
      router.push('/dashboard');
    },
    onError: (error) => {
      dispatch(authFail(error.message));
      toast.error(error.message || 'Invalid OTP');
    },
  });

  const registerLoading = registerMutation.isLoading || registerMutation.isPending;
  const verifyLoading = verifyMutation.isLoading || verifyMutation.isPending;

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    registerMutation.mutate({ email, password });
  };

  const handleVerifySubmit = (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      toast.error('OTP must be exactly 6 digits');
      return;
    }
    verifyMutation.mutate({ email, otp });
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT — Logo Animation */}
      <div className="hidden lg:flex lg:w-1/2 p-4">
        <LogoAnimation />
      </div>

      {/* RIGHT — Register Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-[420px]">
          {/* Back to home */}
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {step === 1 ? 'Create your account' : 'Verify your email'}
            </h1>
            <p className="mt-2 text-base text-slate-500">
              {step === 1
                ? 'Start building beautiful forms in minutes.'
                : `We sent a six-digit code to ${email}.`}
            </p>
          </div>

          {step === 1 ? (
            <>
              {/* Google OAuth */}
              <a
                href={googleHref}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:scale-[0.98]"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </a>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">or</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm transition-colors focus:bg-white focus:border-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm transition-colors focus:bg-white focus:border-slate-400"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-slate-950 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
                  disabled={registerLoading}
                >
                  {registerLoading ? 'Sending code...' : 'Continue'}
                  {!registerLoading && <ArrowRight className="ml-2 size-4" />}
                </Button>
              </form>

              {/* Footer */}
              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-slate-950 transition hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              {/* Success banner */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="mr-2 inline size-4" />
                Registration started. Verify your email to unlock the dashboard.
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-slate-700">One-time password</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  className="h-14 rounded-xl border-slate-200 bg-slate-50 text-center text-2xl tracking-[0.4em] transition-colors focus:bg-white focus:border-slate-400"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-slate-950 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
                disabled={verifyLoading}
              >
                {verifyLoading ? 'Verifying...' : 'Complete registration'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full rounded-xl text-sm"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 size-4" />
                Wrong email? Go back
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
