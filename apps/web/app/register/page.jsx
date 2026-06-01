'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dcfce7,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff_50%,#fff7ed)] text-slate-950">
      <Navbar />

      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 pb-16 pt-32 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="animate-rise-in rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur-xl md:p-8">
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
              <Sparkles className="size-4" />
              {step === 1 ? 'Create account' : 'Verify email'}
            </div>
            <h1 className="text-4xl font-medium text-slate-950">
              {step === 1 ? 'Start building forms' : 'Enter your OTP'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {step === 1
                ? 'Sign up with email or use Google for a faster start.'
                : `We sent a six-digit code to ${email}.`}
            </p>
          </div>

          {step === 1 ? (
            <>
              <a
                href={googleHref}
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 w-full border-white/80 bg-white/80 text-slate-900 shadow-sm active:bg-white')}
              >
                <span className="mr-3 flex size-6 items-center justify-center rounded-full bg-white text-sm font-medium shadow-sm">G</span>
                Sign up with Google
              </a>

              <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 border-white/80 bg-white/80 pl-9"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="h-12 w-full bg-slate-950 text-white active:bg-slate-800" disabled={registerLoading}>
                  {registerLoading ? 'Sending code...' : 'Continue'}
                  {!registerLoading && <ArrowRight className="ml-2 size-4" />}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-slate-950 active:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="mr-2 inline size-4" />
                Registration started. Verify your email to unlock the dashboard.
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">One-time password</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  className="h-14 border-white/80 bg-white/80 text-center text-2xl"
                  placeholder="000000"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <Button type="submit" className="h-12 w-full bg-slate-950 text-white active:bg-slate-800" disabled={verifyLoading}>
                {verifyLoading ? 'Verifying...' : 'Complete registration'}
              </Button>
              <Button type="button" variant="ghost" className="h-11 w-full" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 size-4" />
                Wrong email? Go back
              </Button>
            </form>
          )}
        </section>

        <div className="animate-rise-in hidden lg:block">
          <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/70">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
              <ShieldCheck className="size-4" />
              Account rules
            </div>
            <h2 className="text-5xl font-medium leading-tight">One email, one sign-in method.</h2>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              If you created a password account first, Google OAuth will not take over that same email. Your account stays predictable and protected.
            </p>
            <div className="mt-8 grid gap-3">
              {['Password accounts stay password accounts', 'Google accounts sign in instantly', 'Tokens are stored after successful OAuth'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <CheckCircle2 className="size-5 text-emerald-300" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
