'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CreditCard, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, Zap, Loader2, AlertTriangle, BarChart3 } from 'lucide-react';

import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function BillingPage() {
  const utils = trpc.useUtils();
  const [isCanceling, setIsCanceling] = useState(false);

  // Fetch data
  const { data: subData, isLoading: subLoading } = trpc.billing.getSubscription.useQuery();
  const { data: usageData, isLoading: usageLoading } = trpc.billing.getUsageOverview.useQuery();
  const cancelMutation = trpc.billing.cancelSubscription.useMutation();

  const isLoading = subLoading || usageLoading;

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel? You will lose access to Pro features at the end of your billing cycle.")) {
      return;
    }

    try {
      setIsCanceling(true);
      await cancelMutation.mutateAsync();
      toast.success("Subscription canceled successfully.");
      await utils.billing.getSubscription.invalidate();
    } catch (error) {
      toast.error(error.message || "Could not cancel subscription.");
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading || !subData || !usageData) {
    return (
      <div className="-m-8 min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,#ede9fe,transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff_52%,#fff7ed)] p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-40 w-full rounded-[2rem]" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 rounded-[2rem]" />
            <Skeleton className="h-64 rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  const { plan, subscription } = subData;
  const isFree = plan.id === 'FREE';
  const isCancelingAtEnd = subscription?.cancelAtPeriodEnd;

  // Date formatter
  const formattedEndDate = subscription?.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="-m-8 min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,#ede9fe,transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff_52%,#fff7ed)] p-4 md:p-8 text-slate-950">
      <div className="mx-auto max-w-4xl space-y-8 pt-4">
        
        {/* HEADER SECTION */}
        <section className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-bold text-violet-700">
                <CreditCard className="size-4" />
                Billing & Limits
              </div>
              <h1 className="text-3xl font-black text-slate-950 md:text-4xl">Plan Management</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Manage your subscription, view your current usage, and adjust your limits.
              </p>
            </div>
            {isFree && (
              <Link href="/pricing" className={cn(buttonVariants({ size: 'lg' }), 'bg-violet-600 text-white hover:bg-violet-700 shadow-md rounded-xl')}>
                Upgrade to Pro
                <Zap className="ml-2 size-4" />
              </Link>
            )}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:items-start">
          
          {/* CURRENT PLAN CARD */}
          <section className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-xl md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="size-5 text-amber-500" /> Current Plan
            </h2>
            
            <div className="flex items-end justify-between border-b border-slate-200 pb-6 mb-6">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Your Tier</div>
                <div className="text-4xl font-black text-slate-950">{plan.name}</div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                  isFree ? "bg-slate-200 text-slate-700" : isCancelingAtEnd ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {isFree ? 'Free Forever' : isCancelingAtEnd ? 'Cancels Soon' : 'Active'}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {!isFree && formattedEndDate && (
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500">{isCancelingAtEnd ? 'Access ends on' : 'Next billing date'}</span>
                  <span className="text-slate-900 font-bold">{formattedEndDate}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">Plan price</span>
                <span className="text-slate-900 font-bold">₹{plan.priceMonthly} / mo</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {isFree ? (
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-sm font-medium text-slate-600 text-center">
                You are currently on the free plan. Upgrade to unlock unlimited potential.
              </div>
            ) : isCancelingAtEnd ? (
              <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-sm font-semibold text-amber-800 flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0" />
                <p>Your subscription will automatically cancel at the end of the current billing cycle. You will keep access to Pro features until then.</p>
              </div>
            ) : (
              <button
                onClick={handleCancel}
                disabled={isCanceling}
                className="w-full h-11 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {isCanceling ? <Loader2 className="size-4 animate-spin mr-2" /> : <ShieldAlert className="size-4 mr-2" />}
                Cancel Subscription
              </button>
            )}
          </section>

          {/* USAGE LIMITS CARD */}
          <section className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-xl md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="size-5 text-blue-500" /> Usage & Limits
            </h2>

            <div className="space-y-8">
              {/* Forms Limit */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-700">Forms Created</span>
                  <span className={usageData.forms.percentage >= 100 ? "text-red-600" : "text-slate-500"}>
                    {usageData.forms.used} / {usageData.forms.isUnlimited ? '∞' : usageData.forms.limit}
                  </span>
                </div>
                {!usageData.forms.isUnlimited && (
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-500 rounded-full", usageData.forms.percentage >= 100 ? "bg-red-500" : "bg-blue-500")}
                      style={{ width: `${usageData.forms.percentage}%` }}
                    />
                  </div>
                )}
                <p className="text-xs font-medium text-slate-400 mt-2">Lifetime limit based on your active plan.</p>
              </div>

              {/* Responses Limit */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-700">Responses Collected</span>
                  <span className={usageData.responses.percentage >= 100 ? "text-red-600" : "text-slate-500"}>
                    {usageData.responses.used} / {usageData.responses.isUnlimited ? '∞' : usageData.responses.limit}
                  </span>
                </div>
                {!usageData.responses.isUnlimited && (
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-500 rounded-full", usageData.responses.percentage >= 100 ? "bg-red-500" : "bg-emerald-500")}
                      style={{ width: `${usageData.responses.percentage}%` }}
                    />
                  </div>
                )}
                <p className="text-xs font-medium text-slate-400 mt-2">Resets automatically at the start of next month.</p>
              </div>
            </div>

            {isFree && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <Link href="/pricing" className="group flex items-center justify-between rounded-xl bg-slate-950 p-4 text-white hover:bg-slate-800 transition">
                  <div>
                    <div className="text-sm font-bold">Hit a limit?</div>
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
  );
}