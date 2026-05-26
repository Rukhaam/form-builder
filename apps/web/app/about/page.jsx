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
    tone: 'text-blue-700 bg-blue-100 border-blue-200',
  },
  {
    icon: Zap,
    title: 'Fast workflows',
    description: 'Designed to keep creation, sharing, and analysis moving without friction.',
    tone: 'text-amber-700 bg-amber-100 border-amber-200',
  },
  {
    icon: Code,
    title: 'No-code power',
    description: 'Built for advanced logic and flexible layouts without the complexity.',
    tone: 'text-violet-700 bg-violet-100 border-violet-200',
  },
  {
    icon: Globe,
    title: 'Ready everywhere',
    description: 'A polished experience that feels consistent across devices and teams.',
    tone: 'text-emerald-700 bg-emerald-100 border-emerald-200',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dff7ef,transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] pt-32 pb-20 text-slate-950">
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* HERO SECTION */}
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center animate-rise-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/60 px-4 py-1.5 text-sm font-bold text-violet-700 shadow-sm backdrop-blur-xl">
              <Sparkles className="size-4" />
              <span>Our Story</span>
            </div>

            <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Beautiful forms
              <span className="block text-black">
                for modern teams.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-500 sm:text-lg">
              FormBuilder turns collecting responses into a cleaner workflow, with design-led forms, faster publishing, and analytics that are easy to trust.
            </p>

            {/* STATS */}
            <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[2rem] border border-white/70 bg-white/65 p-8 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1"
                >
                  <div className="text-4xl font-black tracking-tight text-slate-950">{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <div className="mb-8 flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Why teams choose FormBuilder</span>
              <div className="h-px flex-1 bg-slate-200/60"></div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch animate-rise-in" style={{ animationDelay: '100ms' }}>
              
              {/* MAIN MISSION CARD */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/65 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-xl lg:col-span-7 md:p-10">
                <div className="relative z-10">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
                    <Target className="size-6" />
                  </div>

                  <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Our mission is to make form building feel effortless.
                  </h2>

                  <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600">
                    We believe gathering information should feel seamless for the creator and clear for the respondent. FormBuilder brings enterprise-grade capability into a clean, approachable experience without the clutter.
                  </p>

                  <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                    <Rocket className="size-4 text-emerald-600" />
                    Designed to help teams launch faster.
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {['Design first', 'Fast setup', 'Reliable data'].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-white/80 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PILLARS GRID */}
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="group flex flex-col rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300"
                      style={{ animationDelay: `${140 + index * 70}ms` }}
                    >
                      <div
                        className={cn(
                          'mb-5 flex size-12 items-center justify-center rounded-xl border shadow-sm transition-transform duration-500 group-hover:scale-105',
                          pillar.tone
                        )}
                      >
                        <Icon className="size-6" />
                      </div>

                      <h3 className="text-lg font-black tracking-tight text-slate-950">{pillar.title}</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA SECTION */}
          <div className="mt-24 animate-rise-in" style={{ animationDelay: '220ms' }}>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-16 text-center shadow-2xl sm:px-12 lg:px-16">
              
              {/* Subtle background glow for the dark card */}
              <div className="absolute -top-24 -right-24 size-64 rounded-full bg-violet-500/10 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-emerald-500/10 blur-3xl"></div>

              <div className="relative z-10">
                <Heart className="mx-auto mb-5 size-10 text-emerald-400" />
                <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                  Ready to build something clearer?
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-400">
                  Join creators who use FormBuilder to collect feedback, run campaigns, and ship forms that feel polished from the first click.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'h-12 rounded-xl bg-white px-8 font-bold text-slate-950 hover:bg-slate-100'
                    )}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 size-5" />
                  </Link>

                  <Link
                    href="/pricing"
                    className={cn(
                      buttonVariants({ size: 'lg', variant: 'outline' }),
                      'h-12 rounded-xl border-slate-700 bg-transparent px-8 font-bold text-white hover:bg-slate-800 hover:text-white'
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