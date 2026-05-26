'use client';

import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, BarChart3, CheckCircle2, FileText, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';

import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    cadence: 'forever',
    description: 'For trying ideas, sharing simple forms, and collecting early responses.',
    cta: 'Start free',
    href: '/register',
    featured: false,
    features: [
      '3 published forms',
      '100 responses per month',
      'Basic analytics',
      'Public form gallery',
      'Draft and publish workflow',
    ],
  },
  {
    name: 'Pro',
    price: '$12',
    cadence: 'per month',
    description: 'For creators and teams who need more forms, richer analytics, and faster iteration.',
    cta: 'Go Pro',
    href: '/register',
    featured: true,
    features: [
      'Unlimited forms',
      '10,000 responses per month',
      'Advanced response analytics',
      'Custom visibility controls',
      'Priority form loading',
    ],
  },
  {
    name: 'Studio',
    price: '$39',
    cadence: 'per month',
    description: 'For growing teams managing many campaigns, signups, surveys, and client intakes.',
    cta: 'Choose Studio',
    href: '/register',
    featured: false,
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Higher response limits',
      'Export-ready response views',
      'Priority support',
    ],
  },
];

const comparison = [
  { label: 'Published forms', starter: '3', pro: 'Unlimited', studio: 'Unlimited' },
  { label: 'Monthly responses', starter: '100', pro: '10,000', studio: '50,000' },
  { label: 'Analytics dashboard', starter: 'Basic', pro: 'Advanced', studio: 'Advanced' },
  { label: 'Public gallery listing', starter: 'Included', pro: 'Included', studio: 'Included' },
  { label: 'Team collaboration', starter: 'Not included', pro: 'Not included', studio: 'Included' },
];

const faqs = [
  {
    question: 'Can I start without paying?',
    answer: 'Yes. Starter is designed for testing the product and publishing a few lightweight forms.',
  },
  {
    question: 'What happens if I exceed response limits?',
    answer: 'You can still access existing data. Upgrading raises the response ceiling for new submissions.',
  },
  {
    question: 'Can public visitors answer forms for free?',
    answer: 'Yes. Respondents do not need an account or paid plan to submit public forms.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes. The pricing model is built so small projects can grow without migrating forms.',
  },
];

export default function PricingPage() {
  const utils = trpc.useUtils();
  const [isPaying, setIsPaying] = useState('');
  const createOrder = trpc.billing.createCheckoutOrder.useMutation();
  const confirmPayment = trpc.billing.confirmPaymentAndActivatePlan.useMutation({
    onSuccess: async () => {
      await utils.billing.getSubscription.invalidate();
      await utils.billing.getUsage.invalidate();
      setIsPaying('');
      window.alert('Plan upgraded successfully.');
    },
    onError: (error) => {
      setIsPaying('');
      window.alert(error.message);
    },
  });

  const [paymentEnabled, setPaymentEnabled] = useState(false);

  const handlePlanAction = async (planName) => {
    if (planName === 'Starter') {
      window.location.href = '/register';
      return;
    }

    const planId = planName === 'Pro' ? 'PRO' : 'STUDIO';
    setIsPaying(planId);
    try {
      const order = await createOrder.mutateAsync({ planId });
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK is not loaded.');
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Form Builder',
        description: `${planName} monthly plan`,
        order_id: order.orderId,
        handler: async (response) => {
          await confirmPayment.mutateAsync({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            planId,
          });
        },
        prefill: {},
        theme: { color: '#0f172a' },
      });
      razorpay.on('payment.failed', () => setIsPaying(''));
      razorpay.open();
    } catch (error) {
      setIsPaying('');
      window.alert(error.message || 'Unable to start checkout');
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dff7ef,transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] text-slate-950">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onLoad={() => setPaymentEnabled(true)} />
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-32">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="animate-rise-in">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 text-sm font-bold text-emerald-700 shadow-sm backdrop-blur-xl">
              <Sparkles className="size-4" />
              Simple pricing for clean collection
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.02] text-slate-950 md:text-7xl">
              Pricing
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Start free, publish when you are ready, and upgrade only when your forms begin doing real work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className={cn(buttonVariants({ size: 'lg' }), 'h-12 bg-slate-950 px-5 text-white hover:bg-slate-800')}>
                Start free
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="/forms" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 border-white/80 bg-white/70 px-5')}>
                Browse forms
              </Link>
            </div>
          </div>

          <div className="animate-float-slow rounded-[2rem] border border-white/70 bg-white/60 p-5 shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-emerald-300">Most teams choose</div>
                  <div className="mt-2 text-4xl font-black">Pro</div>
                </div>
                <BarChart3 className="size-9 text-emerald-300" />
              </div>
              <div className="mt-8 grid gap-3">
                {['Unlimited forms', 'Advanced analytics', '10,000 responses'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                    <CheckCircle2 className="size-5 text-emerald-300" />
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl bg-white p-4 text-slate-950">
                <div className="text-sm font-bold text-slate-500">Monthly total</div>
                <div className="mt-1 text-4xl font-black">$12</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className={cn(
                'animate-rise-in flex flex-col rounded-[1.75rem] border p-5 shadow-xl backdrop-blur-xl',
                plan.featured
                  ? 'border-slate-950 bg-slate-950 text-white shadow-slate-400/60'
                  : 'border-white/70 bg-white/70 text-slate-950 shadow-slate-200/60',
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">{plan.name}</h2>
                {plan.featured && (
                  <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-slate-950">
                    Popular
                  </span>
                )}
              </div>
              <p className={cn('mt-3 min-h-[4.5rem] text-sm leading-6', plan.featured ? 'text-slate-300' : 'text-slate-600')}>
                {plan.description}
              </p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black">{plan.price}</span>
                <span className={cn('pb-2 text-sm font-semibold', plan.featured ? 'text-slate-300' : 'text-slate-500')}>
                  {plan.cadence}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handlePlanAction(plan.name)}
                disabled={(plan.name !== 'Starter' && (!paymentEnabled || isPaying.length > 0))}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-6 h-12 w-full disabled:cursor-not-allowed disabled:opacity-60',
                  plan.featured ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-800',
                )}
              >
                {isPaying === (plan.name === 'Pro' ? 'PRO' : plan.name === 'Studio' ? 'STUDIO' : '') ? 'Processing...' : plan.cta}
                <ArrowRight className="ml-2 size-4" />
              </button>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm font-semibold">
                    <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', plan.featured ? 'text-emerald-300' : 'text-emerald-600')} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-bold uppercase text-emerald-700">Compare</div>
            <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">Choose by workload</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-slate-600 shadow-sm backdrop-blur-xl">
            <ShieldCheck className="size-4 text-emerald-700" />
            No respondent accounts required
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="grid grid-cols-4 bg-slate-950 px-4 py-3 text-sm font-bold text-white">
            <div>Feature</div>
            <div>Starter</div>
            <div>Pro</div>
            <div>Studio</div>
          </div>
          {comparison.map((row) => (
            <div key={row.label} className="grid grid-cols-4 border-t border-slate-200/70 px-4 py-4 text-sm">
              <div className="font-bold text-slate-950">{row.label}</div>
              <div className="font-medium text-slate-600">{row.starter}</div>
              <div className="font-medium text-slate-600">{row.pro}</div>
              <div className="font-medium text-slate-600">{row.studio}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/70 md:p-10">
          <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-300">
                <FileText className="size-4" />
                From idea to answers
              </div>
              <h2 className="text-3xl font-black md:text-4xl">Every plan lets people answer public forms.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Pricing is based on creator workload, not respondent friction. Visitors can open a public form and submit without signing in.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Create', 'Build forms with fields and options'],
                ['Publish', 'Share public forms instantly'],
                ['Measure', 'Read responses and analytics'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <Users className="mb-4 size-5 text-emerald-300" />
                  <div className="font-black">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <div className="text-sm font-bold uppercase text-emerald-700">FAQ</div>
          <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">Pricing questions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-white/70 bg-white/65 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-xl">
              <summary className="cursor-pointer list-none text-base font-bold text-slate-950">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-6 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
