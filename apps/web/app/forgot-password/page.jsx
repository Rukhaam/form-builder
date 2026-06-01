'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, Mail, ShieldAlert } from 'lucide-react';

import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // State
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Mutations
  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || 'Reset code sent to your email.');
      setStep(2);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process request.');
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset successfully.');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password.');
    },
  });

  const isSending = forgotPasswordMutation.isLoading || forgotPasswordMutation.isPending;
  const isResetting = resetPasswordMutation.isLoading || resetPasswordMutation.isPending;

  // Handlers
  const handleRequestCode = (event) => {
    event.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    forgotPasswordMutation.mutate({ email });
  };

  const handleResetPassword = (event) => {
    event.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please enter both the reset code and your new password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    resetPasswordMutation.mutate({ email, otp, newPassword });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff7ef,transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] text-slate-950">
      <Navbar />

      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full animate-rise-in rounded-[2rem] border border-white/70 bg-white/72 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl md:p-10">
          
          {step === 1 ? (
            <>
              {/* STEP 1: REQUEST OTP */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner">
                  <ShieldAlert className="size-7" />
                </div>
                <h2 className="text-3xl font-medium text-slate-950">Forgot Password</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Enter the email associated with your account and we will send you a reset code.
                </p>
              </div>

              <form onSubmit={handleRequestCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 border-white/80 bg-white/80 pl-9 shadow-sm"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="h-12 w-full bg-slate-950 text-white active:bg-slate-800" 
                  disabled={isSending}
                >
                  {isSending ? 'Sending Code...' : 'Send Reset Code'}
                  {!isSending && <ArrowRight className="ml-2 size-4" />}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* STEP 2: VERIFY OTP & SET NEW PASSWORD */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
                  <KeyRound className="size-7" />
                </div>
                <h2 className="text-3xl font-medium text-slate-950">Set New Password</h2>
                <p className="mt-2 text-sm text-slate-600">
                  We sent a code to <span className="font-medium text-slate-900">{email}</span>
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp">Reset Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    className="h-12 border-white/80 bg-white/80 text-center text-lg font-medium tracking-widest shadow-sm"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="h-12 border-white/80 bg-white/80 pl-9 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="h-12 w-full bg-emerald-600 text-white active:bg-emerald-700" 
                  disabled={isResetting}
                >
                  {isResetting ? 'Updating...' : 'Update Password'}
                  {!isResetting && <ArrowRight className="ml-2 size-4" />}
                </Button>
              </form>
            </>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors active:text-slate-900"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
