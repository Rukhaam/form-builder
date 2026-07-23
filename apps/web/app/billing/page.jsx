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
   Billing Navbar — Flat Minimalist Monochromatic
   ───────────────────────────────────────────────────────────── */
function BillingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex size-8 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles className="size-4 text-amber-400" />
            </div>
            <span className="text-base font-bold text-slate-950">FormBuilder</span>
          </Link>

          <ChevronRight className="size-4 text-slate-300" />

          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-800">
            <CreditCard className="size-3.5" />
            Billing
          </span>
        </div>

        {/* Back to dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
        >
          Dashboard
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   Cancel Confirmation Modal — Minimalist B&W
   ───────────────────────────────────────────────────────────── */
function CancelModal({ isOpen, onClose, onConfirm, isCanceling, planName, accessEndDate }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && !isCanceling) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-950">
              <Ban className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-950">Cancel Subscription</h2>
              <p className="text-xs text-slate-500 font-medium">{planName} plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isCanceling}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Info list */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <CalendarClock className="size-4 shrink-0 text-slate-950 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-950">Access retained until billing cycle ends</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Pro features remain active until {formattedAccessDate(accessEndDate)}. No further charges will occur.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <AlertTriangle className="size-4 shrink-0 text-slate-950 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-950">Non-refundable payment</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Per our{' '}
                <Link href="/refund-policy" className="underline underline-offset-2 font-medium text-slate-950" target="_blank">
                  refund policy
                </Link>
                , payments already processed are final.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <ShieldAlert className="size-4 shrink-0 text-slate-950 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-950">Account reverts to Free tier</p>
              <p className="text-xs text-slate-500 mt-0.5">
                After your access period finishes, your plan limits revert automatically to the Free plan.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <button
            onClick={onClose}
            disabled={isCanceling}
            className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-950 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Keep subscription
          </button>
          <button
            id="confirm-cancel-subscription"
            onClick={onConfirm}
            disabled={isCanceling}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isCanceling ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Canceling…
              </>
            ) : (
              'Confirm cancellation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function formattedAccessDate(accessEndDate) {
  return accessEndDate ? accessEndDate : 'the end of your current cycle';
}

/* ─────────────────────────────────────────────────────────────
   Main Billing Page — Monochromatic Minimalist UI
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
      toast.success('Subscription canceled. Access remains until cycle ends.');
      await utils.billing.getSubscription.invalidate();
      setShowCancelModal(false);
    } catch (error) {
      toast.error(error.message || 'Could not cancel subscription.');
    } finally {
      setIsCanceling(false);
    }
  };

  /* ── Skeleton state ── */
  if (isLoading || !subData || !usageData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <BillingNavbar />
        <div className="mx-auto max-w-5xl space-y-6 p-4 pt-8 sm:p-6 lg:p-8">
          <Skeleton className="h-32 w-full rounded-2xl bg-white border border-slate-200" />
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl bg-white border border-slate-200" />
            <Skeleton className="h-64 rounded-2xl bg-white border border-slate-200" />
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
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => !isCanceling && setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        isCanceling={isCanceling}
        planName={plan.name}
        accessEndDate={formattedEndDate}
      />

      <div className="min-h-screen bg-slate-50 text-slate-950">
        {/* Navbar */}
        <BillingNavbar />

        <div className="mx-auto max-w-5xl space-y-6 p-4 pt-6 sm:p-6 sm:pt-8 lg:p-8">

          {/* Page Header Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-800">
                  <CreditCard className="size-3.5" />
                  Account &amp; Subscriptions
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Billing &amp; Limits</h1>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                  Manage your subscription tier, track active usage, and review account capacity.
                </p>
              </div>

              {isFree && (
                <Link
                  href="/pricing"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-semibold text-white transition hover:bg-slate-800 self-start sm:self-auto"
                >
                  Upgrade to Pro
                  <Zap className="size-3.5" />
                </Link>
              )}
            </div>
          </section>

          {/* Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:items-start">

            {/* Current Plan Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
              <h2 className="text-base font-bold text-slate-950 mb-6 flex items-center gap-2">
                <Sparkles className="size-4 text-slate-950" /> Current Plan
              </h2>

              {/* Plan name + badge */}
              <div className="flex items-end justify-between border-b border-slate-100 pb-5 mb-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Active Tier</div>
                  <div className="text-3xl font-bold text-slate-950">{plan.name}</div>
                </div>
                <span className={cn(
                  'inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider border shrink-0',
                  isFree
                    ? 'border-slate-200 bg-slate-100 text-slate-700'
                    : isCancelingAtEnd
                      ? 'border-slate-400 bg-slate-900 text-slate-100'
                      : 'border-slate-950 bg-slate-950 text-white',
                )}>
                  {isFree ? 'Free Tier' : isCancelingAtEnd ? 'Cancels Soon' : 'Active'}
                </span>
              </div>

              {/* Plan Details List */}
              <div className="space-y-3 mb-6 text-xs">
                {!isFree && formattedEndDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{isCancelingAtEnd ? 'Access ends' : 'Renewal date'}</span>
                    <span className="text-slate-950 font-semibold">{formattedEndDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Monthly cost</span>
                  <span className="text-slate-950 font-semibold">₹{plan.priceMonthly} / month</span>
                </div>
              </div>

              {/* Action Button / State Banner */}
              {isFree ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-600 leading-relaxed text-center">
                  You are currently on the Free plan.{' '}
                  <Link href="/pricing" className="font-bold text-slate-950 underline underline-offset-2">
                    Upgrade to Pro
                  </Link>{' '}
                  for expanded limits.
                </div>
              ) : isCancelingAtEnd ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5 text-slate-950" />
                  <p>
                    Your plan cancels at cycle end. Access remains active until <strong>{formattedEndDate}</strong>.
                  </p>
                </div>
              ) : (
                <button
                  id="open-cancel-subscription-modal"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300"
                >
                  <Ban className="size-3.5" />
                  Cancel Subscription
                </button>
              )}
            </section>

            {/* Usage & Limits Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
              <h2 className="text-base font-bold text-slate-950 mb-6 flex items-center gap-2">
                <BarChart3 className="size-4 text-slate-950" /> Usage &amp; Capacity
              </h2>

              <div className="space-y-6">
                {/* Forms Usage */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-950">Forms Created</span>
                    <span className="text-slate-600">
                      {usageData.forms.used} / {usageData.forms.isUnlimited ? '∞' : usageData.forms.limit}
                    </span>
                  </div>
                  {!usageData.forms.isUnlimited && (
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-slate-950 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(usageData.forms.percentage, 100)}%` }}
                      />
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-slate-400 mt-2">Active forms count towards account plan limits.</p>
                </div>

                {/* Responses Usage */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-950">Monthly Responses</span>
                    <span className="text-slate-600">
                      {usageData.responses.used} / {usageData.responses.isUnlimited ? '∞' : usageData.responses.limit}
                    </span>
                  </div>
                  {!usageData.responses.isUnlimited && (
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-slate-950 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(usageData.responses.percentage, 100)}%` }}
                      />
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-slate-400 mt-2">Resets automatically at the beginning of each billing cycle.</p>
                </div>
              </div>

              {isFree && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <Link
                    href="/pricing"
                    className="group flex items-center justify-between rounded-xl bg-slate-950 p-4 text-white transition hover:bg-slate-800"
                  >
                    <div>
                      <div className="text-xs font-bold">Need more responses?</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Upgrade for higher monthly limits.</div>
                    </div>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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

