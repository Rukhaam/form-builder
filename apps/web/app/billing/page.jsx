'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  CreditCard, ShieldAlert, Sparkles, ArrowRight, Zap,
  Loader2, AlertTriangle, BarChart3, X, Ban, CalendarClock,
  ChevronRight,
} from 'lucide-react';

import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/* ─────────────────────────────────────────────────────────────
   Billing Navbar
   ───────────────────────────────────────────────────────────── */
function BillingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70 shrink-0">
          <img
            src="https://pub-749dd85c25e04947af34140aef9172fc.r2.dev/form-builder/ChatGPT%20Image%20Jun%2030%2C%202026%2C%2011_22_18%20PM.png"
            alt="FormBuilder"
            className="size-7 object-contain"
          />
          <span className="text-base font-semibold text-slate-900 hidden sm:inline">FormBuilder</span>
        </Link>

        {/* Breadcrumb */}
        <ChevronRight className="size-4 text-slate-300 shrink-0" />
        <span className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-sm font-medium text-violet-700">
          <CreditCard className="size-3.5 shrink-0" />
          Billing
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Back to dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Dashboard
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   Cancel Confirmation Modal
   ───────────────────────────────────────────────────────────── */
function CancelModal({ isOpen, onClose, onConfirm, isCanceling, planName, accessEndDate }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isCanceling) onClose(); }}
    >
      {/* Modal card — slides up from bottom on mobile, scales in on desktop */}
      <div
        className="relative w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] border border-white/70 bg-white shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.4,0.64,1)' }}
      >
        {/* Red top stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-rose-500 to-red-600" />

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="p-5 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <Ban className="size-5 text-red-600" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">Cancel Subscription?</h2>
                <p className="text-xs sm:text-sm text-slate-500">{planName} plan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isCanceling}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 shrink-0"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Info items */}
          <div className="space-y-2.5 mb-6">
            {/* Access until period end */}
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
              <CalendarClock className="size-4 sm:size-5 shrink-0 text-violet-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-800">You keep access until your cycle ends</p>
                {accessEndDate ? (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pro features stay active until <strong>{accessEndDate}</strong>. No further charges after that.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pro features remain active until the end of the current billing cycle.
                  </p>
                )}
              </div>
            </div>

            {/* No refund */}
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5">
              <AlertTriangle className="size-4 sm:size-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">No refund will be issued</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Per our{' '}
                  <Link href="/refund-policy" className="underline underline-offset-2 hover:text-amber-900" target="_blank">
                    refund policy
                  </Link>
                  , payments already made are non-refundable.
                </p>
              </div>
            </div>

            {/* Downgrade note */}
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-3.5">
              <ShieldAlert className="size-4 sm:size-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Your account reverts to Free</p>
                <p className="text-xs text-red-700 mt-0.5">
                  After your cycle ends you&#39;ll lose Pro features and limits reset to the Free tier.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-3">
            <button
              onClick={onClose}
              disabled={isCanceling}
              className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Keep my subscription
            </button>
            <button
              id="confirm-cancel-subscription"
              onClick={onConfirm}
              disabled={isCanceling}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800 disabled:opacity-60"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Canceling…
                </>
              ) : (
                <>
                  <Ban className="size-4" />
                  Yes, cancel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
        @media (max-width: 639px) {
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(60px); }
            to   { opacity: 1; transform: translateY(0);    }
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Billing Page
   ───────────────────────────────────────────────────────────── */
export default function BillingPage() {
  const utils = trpc.useUtils();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const { data: subData, isLoading: subLoading } = trpc.billing.getSubscription.useQuery();
  const { data: usageData, isLoading: usageLoading } = trpc.billing.getUsageOverview.useQuery();
  const cancelMutation = trpc.billing.cancelSubscription.useMutation();

  const isLoading = subLoading || usageLoading;

  const handleConfirmCancel = async () => {
    try {
      setIsCanceling(true);
      await cancelMutation.mutateAsync();
      toast.success('Subscription canceled. You retain access until your billing cycle ends.');
      await utils.billing.getSubscription.invalidate();
      setShowCancelModal(false);
    } catch (error) {
      toast.error(error.message || 'Could not cancel subscription. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };

  /* ── Loading skeleton ── */
  if (isLoading || !subData || !usageData) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#ede9fe,transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff_52%,#fff7ed)]">
        <BillingNavbar />
        <div className="mx-auto max-w-5xl space-y-5 p-4 pt-6 sm:p-6 lg:p-8">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-72 rounded-[2rem]" />
            <Skeleton className="h-72 rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  const { plan, subscription } = subData;
  const isFree = plan.id === 'FREE';
  const isCancelingAtEnd = subscription?.cancelAtPeriodEnd;

  const formattedEndDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  return (
    <>
      {/* ── Cancel Modal ── */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => !isCanceling && setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        isCanceling={isCanceling}
        planName={plan.name}
        accessEndDate={formattedEndDate}
      />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#ede9fe,transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff_52%,#fff7ed)] text-slate-950">
        {/* ── NAVBAR ── */}
        <BillingNavbar />

        <div className="mx-auto max-w-5xl space-y-5 p-4 pt-6 sm:p-6 sm:pt-8 lg:p-8 lg:pt-10">

          {/* ── PAGE HEADER ── */}
          <section className="rounded-2xl sm:rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs sm:text-sm font-medium text-violet-700">
                  <CreditCard className="size-3.5 sm:size-4" />
                  Billing &amp; Limits
                </div>
                <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl md:text-4xl">Plan Management</h1>
                <p className="mt-1.5 text-sm font-medium text-slate-500 max-w-md">
                  Manage your subscription, view usage, and adjust your limits.
                </p>
              </div>
              {isFree && (
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ size: 'default' }),
                    'bg-violet-600 text-white hover:bg-violet-700 shadow-md rounded-xl self-start sm:self-auto whitespace-nowrap',
                  )}
                >
                  Upgrade to Pro
                  <Zap className="ml-2 size-4" />
                </Link>
              )}
            </div>
          </section>

          {/* ── CARDS GRID ── */}
          <div className="grid gap-5 sm:grid-cols-2 lg:items-start">

            {/* ── CURRENT PLAN CARD ── */}
            <section className="rounded-2xl sm:rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-xl sm:p-7">
              <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" /> Current Plan
              </h2>

              {/* Plan name + status badge */}
              <div className="flex items-end justify-between border-b border-slate-200 pb-5 mb-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Your Tier</div>
                  <div className="text-3xl sm:text-4xl font-semibold text-slate-950">{plan.name}</div>
                </div>
                <span className={cn(
                  'inline-block rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide shrink-0 ml-2',
                  isFree
                    ? 'bg-slate-200 text-slate-600'
                    : isCancelingAtEnd
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700',
                )}>
                  {isFree ? 'Free' : isCancelingAtEnd ? 'Cancels Soon' : 'Active'}
                </span>
              </div>

              {/* Plan details */}
              <div className="space-y-3 mb-7">
                {!isFree && formattedEndDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">{isCancelingAtEnd ? 'Access ends on' : 'Next billing date'}</span>
                    <span className="text-slate-900 font-semibold text-right ml-4">{formattedEndDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Plan price</span>
                  <span className="text-slate-900 font-semibold">₹{plan.priceMonthly} / mo</span>
                </div>
              </div>

              {/* Action area */}
              {isFree ? (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-sm font-medium text-slate-600 text-center leading-relaxed">
                  You&#39;re on the Free plan.{' '}
                  <Link href="/pricing" className="text-violet-600 underline underline-offset-2">Upgrade</Link>{' '}
                  to unlock unlimited potential.
                </div>
              ) : isCancelingAtEnd ? (
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-sm font-medium text-amber-800 flex items-start gap-3">
                  <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                  <p>
                    Your subscription cancels at the end of the current billing cycle.
                    {formattedEndDate && (
                      <> You retain Pro access until <strong>{formattedEndDate}</strong>.</>
                    )}
                  </p>
                </div>
              ) : (
                <button
                  id="open-cancel-subscription-modal"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 transition hover:bg-red-100 active:bg-red-200"
                >
                  <ShieldAlert className="size-4 shrink-0" />
                  Cancel Subscription
                </button>
              )}
            </section>

            {/* ── USAGE & LIMITS CARD ── */}
            <section className="rounded-2xl sm:rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-xl sm:p-7">
              <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <BarChart3 className="size-5 text-blue-500" /> Usage &amp; Limits
              </h2>

              <div className="space-y-7">
                {/* Forms */}
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-700">Forms Created</span>
                    <span className={usageData.forms.percentage >= 100 ? 'text-red-600 font-semibold' : 'text-slate-500'}>
                      {usageData.forms.used} / {usageData.forms.isUnlimited ? '∞' : usageData.forms.limit}
                    </span>
                  </div>
                  {!usageData.forms.isUnlimited && (
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full transition-all duration-700 rounded-full', usageData.forms.percentage >= 100 ? 'bg-red-500' : 'bg-blue-500')}
                        style={{ width: `${usageData.forms.percentage}%` }}
                      />
                    </div>
                  )}
                  <p className="text-xs font-medium text-slate-400 mt-2">Lifetime limit based on your active plan.</p>
                </div>

                {/* Responses */}
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-700">Responses Collected</span>
                    <span className={usageData.responses.percentage >= 100 ? 'text-red-600 font-semibold' : 'text-slate-500'}>
                      {usageData.responses.used} / {usageData.responses.isUnlimited ? '∞' : usageData.responses.limit}
                    </span>
                  </div>
                  {!usageData.responses.isUnlimited && (
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full transition-all duration-700 rounded-full', usageData.responses.percentage >= 100 ? 'bg-red-500' : 'bg-emerald-500')}
                        style={{ width: `${usageData.responses.percentage}%` }}
                      />
                    </div>
                  )}
                  <p className="text-xs font-medium text-slate-400 mt-2">Resets automatically at the start of next month.</p>
                </div>
              </div>

              {isFree && (
                <div className="mt-7 border-t border-slate-200 pt-6">
                  <Link href="/pricing" className="group flex items-center justify-between rounded-xl bg-slate-950 p-4 text-white transition hover:bg-slate-800 active:bg-slate-700">
                    <div>
                      <div className="text-sm font-semibold">Hit a limit?</div>
                      <div className="text-xs text-slate-400 mt-0.5">Upgrade to unlock unlimited forms.</div>
                    </div>
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
