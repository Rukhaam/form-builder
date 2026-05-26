'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { buttonVariants } from '@/components/ui/button';
import { getSessionUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';
import { billingOptions, comparisonRows, faqs, getCurrentPlanLabel, planCards } from '@/utils/pricingUtils';

export default function PricingPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [sessionUser, setSessionUser] = useState(null);
  
  // 🚀 Initialized to false, but we will catch it in useEffect
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [paymentScriptFailed, setPaymentScriptFailed] = useState(false);
  const [activePlanId, setActivePlanId] = useState('');

  const createSubscription = trpc.billing.createCheckoutSubscription.useMutation();
  const confirmSubscription = trpc.billing.confirmCheckoutSubscription.useMutation();
  const subscriptionQuery = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: Boolean(sessionUser),
    retry: false,
  });

  useEffect(() => {
    setSessionUser(getSessionUser());
    if (typeof window !== 'undefined' && window.Razorpay) {
      setPaymentEnabled(true);
      setPaymentScriptFailed(false);
    }
  }, []);

  const currentPlanId = subscriptionQuery.data?.planId || 'FREE';
  const visiblePlans = useMemo(
    () => planCards.map((plan) => ({ ...plan, selectedPrice: plan.prices[billingCycle] })),
    [billingCycle],
  );

  const redirectToAuth = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (token) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.error('Your session expired. Please sign in again.');
      router.push('/login');
      return;
    }

    toast.error('Create an account to choose a paid plan.');
    router.push('/register');
  };

  const handleCheckoutError = (error) => {
    if (error?.data?.code === 'UNAUTHORIZED') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.error('Please sign in to continue checkout.');
      router.push('/login');
      return;
    }

    toast.error(error?.message || 'Unable to start checkout.');
  };

  const confirmCheckout = async ({ planId, response }) => {
    try {
      await confirmSubscription.mutateAsync({
        planId,
        razorpaySubscriptionId: response.razorpay_subscription_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });

      await Promise.all([
        utils.billing.getSubscription.invalidate(),
        utils.billing.getUsage.invalidate(),
      ]);

      toast.success('Payment verified. Your plan is active.');
      router.push('/dashboard');
    } catch (error) {
      handleCheckoutError(error);
    } finally {
      setActivePlanId('');
    }
  };

  const handlePlanAction = async (plan) => {
    const selectedPlan = plan.selectedPrice;

    if (selectedPlan.id === 'FREE') {
      router.push(sessionUser ? '/dashboard' : '/register');
      return;
    }

    const currentSession = getSessionUser();
    if (!currentSession) {
      redirectToAuth();
      return;
    }

    if (!paymentEnabled || !window.Razorpay) {
      toast.error(paymentScriptFailed ? 'Checkout failed to load. Refresh and try again.' : 'Checkout is still loading.');
      return;
    }

    setActivePlanId(selectedPlan.id);

    try {
      const checkout = await createSubscription.mutateAsync({ planId: selectedPlan.id });

      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: 'FormBuilder',
        description: `${checkout.plan.name} ${checkout.plan.billingCycle} subscription`,
        prefill: { email: currentSession.email },
        notes: {
          planId: selectedPlan.id,
          billingCycle,
        },
        theme: { color: '#064e3b' },
        modal: {
          ondismiss: () => setActivePlanId(''),
        },
        handler: (response) => confirmCheckout({ planId: selectedPlan.id, response }),
      });

      razorpay.on('payment.failed', (response) => {
        setActivePlanId('');
        toast.error(response?.error?.description || 'Payment failed. No plan was activated.');
      });

      razorpay.open();
    } catch (error) {
      setActivePlanId('');
      handleCheckoutError(error);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc,#eefdf7_46%,#fff7ed)] text-slate-950">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={() => {
          setPaymentEnabled(true);
          setPaymentScriptFailed(false);
        }}
        onError={() => {
          setPaymentEnabled(false);
          setPaymentScriptFailed(true);
        }}
      />
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-28">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-emerald-700 shadow-sm">
              <CreditCard className="size-4" />
              Razorpay subscriptions
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              Pricing built for real form volume.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Start free, then upgrade to Pro or Business with verified recurring billing in Indian Rupees.
            </p>
          </div>

          <div className="rounded-lg border border-white bg-white/80 p-4 shadow-xl shadow-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-500">Billing cycle</div>
                <div className="mt-1 text-lg font-black text-slate-950">
                  {billingCycle === 'yearly' ? 'Annual plans' : 'Monthly plans'}
                </div>
              </div>
              <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                {billingOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setBillingCycle(option.id)}
                    className={cn(
                      'h-10 rounded-md px-4 text-sm font-bold transition',
                      billingCycle === option.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-950',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ['Active plan', getCurrentPlanLabel(currentPlanId), BadgeCheck],
                ['Payments', paymentScriptFailed ? 'Unavailable' : paymentEnabled ? 'Ready' : 'Loading', ShieldCheck],
                ['Renewal', billingCycle === 'yearly' ? 'Every year' : 'Every month', RefreshCw],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <Icon className="mb-2 size-4 text-emerald-700" />
                  <div className="text-xs font-bold uppercase text-slate-500">{label}</div>
                  <div className="mt-1 text-sm font-black text-slate-950">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {visiblePlans.map((plan) => {
            const selectedPlan = plan.selectedPrice;
            const isCurrentPlan = Boolean(sessionUser)
              && (currentPlanId === selectedPlan.id || (selectedPlan.id === 'FREE' && currentPlanId === 'FREE'));
            const isBusy = activePlanId === selectedPlan.id;
            const paidPlanBlocked = Boolean(sessionUser) && (paymentScriptFailed || !paymentEnabled);
            const disabled = isCurrentPlan || Boolean(activePlanId) || (selectedPlan.id !== 'FREE' && paidPlanBlocked);

            return (
              <article
                key={plan.tier}
                className={cn(
                  'flex min-h-[34rem] flex-col rounded-lg border bg-white/82 p-5 shadow-xl shadow-slate-200/70',
                  plan.featured ? 'border-emerald-700 ring-2 ring-emerald-100' : 'border-white',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-black text-slate-950">{plan.name}</h2>
                  {plan.featured && (
                    <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                      Popular
                    </span>
                  )}
                </div>

                <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">{plan.description}</p>

                <div className="mt-6">
                  {selectedPlan.note && (
                    <div className="mb-2 inline-flex rounded-md bg-amber-100 px-2 py-1 text-xs font-black text-amber-800">
                      {selectedPlan.note}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-slate-950">{selectedPlan.price}</span>
                    <span className="pb-1 text-sm font-bold text-slate-500">{selectedPlan.cadence}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlanAction(plan)}
                  disabled={disabled}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'mt-6 h-12 w-full disabled:cursor-not-allowed disabled:opacity-60',
                    plan.featured ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-slate-950 text-white hover:bg-slate-800',
                  )}
                >
                  {isCurrentPlan ? 'Current plan' : isBusy ? 'Starting checkout...' : selectedPlan.cta}
                  {!isCurrentPlan && <ArrowRight className="ml-2 size-4" />}
                </button>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-bold uppercase text-emerald-700">Compare</div>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Plan limits</h2>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm">
            <Users className="size-4 text-emerald-700" />
            Respondents never need accounts
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white bg-white/82 shadow-xl shadow-slate-200/70">
          <div className="grid grid-cols-4 bg-slate-950 px-4 py-3 text-sm font-bold text-white">
            <div>Feature</div>
            <div>Starter</div>
            <div>Pro</div>
            <div>Business</div>
          </div>
          {comparisonRows.map((row) => (
            <div key={row.label} className="grid grid-cols-4 border-t border-slate-200 px-4 py-4 text-sm">
              <div className="font-bold text-slate-950">{row.label}</div>
              <div className="font-medium text-slate-600">{row.starter}</div>
              <div className="font-medium text-slate-600">{row.pro}</div>
              <div className="font-medium text-slate-600">{row.business}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Checkout', 'Subscription IDs are created on the server before Razorpay opens.', CreditCard],
            ['Verification', 'Payment signatures are checked server-side before activation.', ShieldCheck],
            ['Access', 'Usage limits read from the active subscription plan.', BarChart3],
          ].map(([title, copy, Icon]) => (
            <div key={title} className="rounded-lg border border-white bg-white/82 p-5 shadow-lg shadow-slate-200/60">
              <Icon className="mb-4 size-5 text-emerald-700" />
              <div className="font-black text-slate-950">{title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-emerald-700">
            <Sparkles className="size-4" />
            FAQ
          </div>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Pricing questions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-lg border border-white bg-white/82 p-5 shadow-lg shadow-slate-200/60">
              <summary className="cursor-pointer list-none text-base font-bold text-slate-950">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-6 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <div className="rounded-lg border border-emerald-200 bg-emerald-950 p-6 text-white shadow-xl shadow-emerald-200/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-bold text-emerald-200">Ready to build?</div>
              <h2 className="mt-1 text-2xl font-black">Create your first form or upgrade when the workload grows.</h2>
            </div>
            <Link href="/dashboard" className={cn(buttonVariants({ size: 'lg' }), 'h-12 bg-white text-black hover:bg-emerald-50 hover:text-white')}>
              Open dashboard
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}