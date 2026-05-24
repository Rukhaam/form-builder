import Link from 'next/link';
import { ArrowRight, Code, Globe, Heart, Rocket, Sparkles, Target, Users, Zap } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';

export const metadata = {
  title: 'About Us | FormBuilder',
  description: 'Learn more about FormBuilder and our mission.',
};

const stats = [
  { value: '10k+', label: 'Active users' },
  { value: '1M+', label: 'Forms created' },
  { value: '4.9/5', label: 'Creator rating' },
];

const pillars = [
  {
    icon: Users,
    title: 'Community first',
    description: 'Shaped with feedback from teams that need forms to feel simple and reliable.',
    cardClass: 'border-cyan-200/80 bg-cyan-50/70 shadow-cyan-200/30',
    iconClass: 'border-cyan-200 bg-cyan-100 text-cyan-700',
  },
  {
    icon: Zap,
    title: 'Fast workflows',
    description: 'Designed to keep creation, sharing, and analysis moving without friction.',
    cardClass: 'border-amber-200/80 bg-amber-50/70 shadow-amber-200/30',
    iconClass: 'border-amber-200 bg-amber-100 text-amber-700',
  },
  {
    icon: Code,
    title: 'No-code power',
    description: 'Built for advanced logic and flexible layouts without the complexity.',
    cardClass: 'border-violet-200/80 bg-violet-50/70 shadow-violet-200/30',
    iconClass: 'border-violet-200 bg-violet-100 text-violet-700',
  },
  {
    icon: Globe,
    title: 'Ready everywhere',
    description: 'A polished experience that feels consistent across devices and teams.',
    cardClass: 'border-emerald-200/80 bg-emerald-50/70 shadow-emerald-200/30',
    iconClass: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-[#f4f7fb] pt-32 pb-20 selection:bg-cyan-200 selection:text-cyan-950">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(129,140,248,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_34%)]"></div>
        <div className="absolute -left-32 -top-32 -z-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"></div>
        <div className="absolute -right-24 top-28 -z-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl"></div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-size-[72px_72px] opacity-20"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center animate-rise-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/70 px-5 py-2 text-sm font-semibold text-cyan-800 shadow-lg shadow-cyan-200/30 backdrop-blur-2xl">
              <Sparkles className="size-4 text-cyan-500" />
              <span>Our Story</span>
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.92] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl xl:text-8xl">
              Beautiful forms
              <span className="block bg-linear-to-r from-cyan-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                for modern teams.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg md:text-xl">
              FormBuilder turns collecting responses into a cleaner workflow, with design-led forms, faster publishing, and analytics that are easy to trust.
            </p>

            <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/80 bg-white/70 px-6 py-6 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
                >
                  <div className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{stat.value}</div>
                  <div className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <div className="mb-8 flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">Why teams choose FormBuilder</span>
              <div className="h-px flex-1 bg-linear-to-r from-cyan-300/70 via-slate-200 to-transparent"></div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch animate-rise-in" style={{ animationDelay: '100ms' }}>
              <div className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/70 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur-3xl lg:col-span-7 md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.12),transparent_36%)]"></div>
                <div className="relative z-10">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-lg shadow-cyan-200/30">
                    <Target className="size-6" />
                  </div>

                  <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Our mission is to make form building feel effortless.
                  </h2>

                  <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                    We believe gathering information should feel seamless for the creator and clear for the respondent. FormBuilder brings enterprise-grade capability into a clean, approachable experience.
                  </p>

                  <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl">
                    <Rocket className="size-4 text-cyan-600" />
                    Designed to help teams launch faster without losing polish.
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {['Design first', 'Fast setup', 'Reliable data'].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon;

                  return (
                    <div
                      key={pillar.title}
                      className={cn(
                        'group relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]',
                        pillar.cardClass
                      )}
                      style={{ animationDelay: `${140 + index * 70}ms` }}
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-white/55 via-transparent to-transparent opacity-90"></div>
                      <div className="relative z-10">
                        <div
                          className={cn(
                            'mb-5 inline-flex size-12 items-center justify-center rounded-2xl border shadow-lg shadow-white/20 transition-transform duration-500 group-hover:scale-110',
                            pillar.iconClass
                          )}
                        >
                          <Icon className="size-6" />
                        </div>

                        <h3 className="text-lg font-black tracking-tight text-slate-950">{pillar.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-24 animate-rise-in" style={{ animationDelay: '220ms' }}>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-8 py-16 text-center shadow-[0_30px_120px_rgba(15,23,42,0.28)] sm:px-12 lg:px-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.18),transparent_30%)]"></div>
              <div className="absolute -top-24 -right-24 size-64 rounded-full bg-cyan-400/20 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-violet-400/20 blur-3xl"></div>

              <div className="relative z-10">
                <Heart className="mx-auto mb-5 size-10 text-cyan-300" />
                <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                  Ready to build something clearer?
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Join creators who use FormBuilder to collect feedback, run campaigns, and ship forms that feel polished from the first click.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'rounded-2xl border border-cyan-200/30 bg-linear-to-r from-cyan-400 to-indigo-400 px-8 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/40'
                    )}
                  >
                    <Sparkles className="mr-2 size-5" />
                    Get Started Free
                    <ArrowRight className="ml-2 size-5" />
                  </Link>

                  <Link
                    href="/pricing"
                    className={cn(
                      buttonVariants({ size: 'lg', variant: 'outline' }),
                      'rounded-2xl border-white/15 bg-white/5 px-8 text-white backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}