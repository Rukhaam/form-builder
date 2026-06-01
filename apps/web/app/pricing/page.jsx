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
        notes: { planId: selectedPlan.id, billingCycle },
        theme: { color: '#020617' }, // Changed to Slate 950
        modal: { ondismiss: () => setActivePlanId('') },
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
    <main className="min-h-screen bg-white text-slate-950">
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-600 shadow-sm">
              <CreditCard className="size-4" />
              Razorpay subscriptions
            </div>
            <h1 className="max-w-2xl text-4xl font-medium leading-tight text-slate-950 md:text-6xl">
              Pricing built for real form volume.
            </h1>
            <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-500">
              Start free, then upgrade to Pro or Business with verified recurring billing in Indian Rupees.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-500">Billing cycle</div>
                <div className="mt-1 text-lg font-medium text-slate-950">
                  {billingCycle === 'yearly' ? 'Annual plans' : 'Monthly plans'}
                </div>
              </div>
              <div className="grid grid-cols-2 rounded-lg bg-slate-50 p-1 border border-slate-200">
                {billingOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setBillingCycle(option.id)}
                    className={cn(
                      'h-10 rounded-md px-4 text-sm font-medium transition-all',
                      billingCycle === option.id 
                        ? 'bg-white text-slate-950 shadow-sm border border-slate-200' 
                        : 'text-slate-500 active:text-slate-900',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Active plan', getCurrentPlanLabel(currentPlanId), BadgeCheck],
                ['Payments', paymentScriptFailed ? 'Unavailable' : paymentEnabled ? 'Ready' : 'Loading', ShieldCheck],
                ['Renewal', billingCycle === 'yearly' ? 'Every year' : 'Every month', RefreshCw],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Icon className="mb-2 size-5 text-slate-400" />
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
                  <div className="mt-1 text-sm font-medium text-slate-950">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
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
                  'flex min-h-[34rem] flex-col rounded-[2rem] bg-white p-8 transition-all duration-300 active:scale-[1.02]',
                  plan.featured 
                    ? 'border-2 border-slate-950 shadow-md relative' 
                    : 'border border-slate-200 shadow-sm',
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-4 py-1 text-xs font-medium uppercase tracking-wider text-white">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-medium text-slate-950">{plan.name}</h2>
                </div>

                <p className="mt-4 min-h-[3.5rem] text-sm font-medium leading-relaxed text-slate-500">{plan.description}</p>

                <div className="mt-6">
                  {selectedPlan.note && (
                    <div className="mb-3 inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                      {selectedPlan.note}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-medium tracking-tight text-slate-950">{selectedPlan.price}</span>
                    <span className="pb-1.5 text-sm font-medium text-slate-500">{selectedPlan.cadence}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlanAction(plan)}
                  disabled={disabled}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'mt-8 h-12 w-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60',
                    // 🚀 EXACT BUTTON HOVER INVERSION LOGIC
                    plan.featured 
                      ? 'bg-slate-950 text-white border border-slate-950 active:bg-white active:text-slate-950' 
                      : 'bg-white text-slate-950 border border-slate-200 active:border-slate-950 active:bg-slate-950 active:text-white',
                  )}
                >
                  {isCurrentPlan ? 'Current plan' : isBusy ? 'Starting checkout...' : selectedPlan.cta}
                  {!isCurrentPlan && <ArrowRight className="ml-2 size-4" />}
                </button>

                <div className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-slate-400" />
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
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-wider text-slate-500">Compare</div>
            <h2 className="mt-2 text-3xl font-medium tracking-tight text-slate-950">Plan limits</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <Users className="size-4 text-slate-400" />
            Respondents never need accounts
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-4 bg-slate-950 px-6 py-4 text-sm font-medium text-white">
            <div>Feature</div>
            <div>Starter</div>
            <div>Pro</div>
            <div>Business</div>
          </div>
          {comparisonRows.map((row) => (
            <div key={row.label} className="grid grid-cols-4 border-t border-slate-200 px-6 py-4 text-sm active:bg-slate-50 transition-colors">
              <div className="font-medium text-slate-950">{row.label}</div>
              <div className="font-medium text-slate-500">{row.starter}</div>
              <div className="font-medium text-slate-500">{row.pro}</div>
              <div className="font-medium text-slate-500">{row.business}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Checkout', 'Subscription IDs are created on the server before Razorpay opens.', CreditCard],
            ['Verification', 'Payment signatures are checked server-side before activation.', ShieldCheck],
            ['Access', 'Usage limits read from the active subscription plan.', BarChart3],
          ].map(([title, copy, Icon]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-300 active:scale-[1.02]">
              <Icon className="mb-4 size-6 text-slate-950" />
              <div className="font-medium text-slate-950 text-lg">{title}</div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-slate-500">
            <Sparkles className="size-4" />
            FAQ
          </div>
          <h2 className="mt-2 text-3xl font-medium tracking-tight text-slate-950">Pricing questions</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all active:shadow-md">
              <summary className="cursor-pointer list-none text-base font-medium text-slate-950">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-all group-active:bg-slate-950 group-active:text-white group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="rounded-[3rem] border border-slate-950 bg-white p-10 text-slate-950 shadow-xl md:p-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-wider text-slate-400">Ready to build?</div>
              <h2 className="mt-2 text-3xl font-medium tracking-tight text-balance md:text-4xl">
                Create your first form or upgrade when the workload grows.
              </h2>
            </div>
            <Link 
              href="/dashboard" 
              className={cn(
                buttonVariants({ size: 'lg' }), 
                'h-14 shrink-0 rounded-xl bg-white text-slate-950 border border-slate-950 px-8 text-lg font-medium transition-all active:bg-black active:text-white'
              )}
            >
              Open dashboard
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
