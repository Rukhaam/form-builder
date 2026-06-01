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
  },
  {
    icon: Zap,
    title: 'Fast workflows',
    description: 'Designed to keep creation, sharing, and analysis moving without friction.',
  },
  {
    icon: Code,
    title: 'No-code power',
    description: 'Built for advanced logic and flexible layouts without the complexity.',
  },
  {
    icon: Globe,
    title: 'Ready everywhere',
    description: 'A polished experience that feels consistent across devices and teams.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-white pt-32 pb-20 text-slate-950">
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* HERO SECTION */}
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center animate-rise-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-600 shadow-sm">
              <Sparkles className="size-4" />
              <span>Our Story</span>
            </div>

            <h1 className="text-5xl font-medium leading-[1.1] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl text-balance">
              Beautiful forms
              <span className="block text-slate-950">
                for modern teams.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-500 text-balance">
              FormBuilder turns collecting responses into a cleaner workflow, with design-led forms, faster publishing, and analytics that are easy to trust.
            </p>

            {/* STATS */}
            <div className="mt-12 grid w-full gap-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm transition-transform duration-300 active:scale-[1.02]"
                >
                  <div className="text-4xl font-semibold tracking-tight text-slate-950">{stat.value}</div>
                  <div className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <div className="mb-8 flex items-center gap-4">
              <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Why teams choose FormBuilder</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch animate-rise-in" style={{ animationDelay: '100ms' }}>
              
              {/* MAIN MISSION CARD */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm lg:col-span-7 md:p-10 transition-transform duration-300 active:scale-[1.01]">
                <div className="relative z-10">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-950 shadow-sm">
                    <Target className="size-6" />
                  </div>

                  <h2 className="mt-6 text-3xl font-medium tracking-tight text-slate-950 sm:text-4xl text-balance">
                    Our mission is to make form building feel effortless.
                  </h2>

                  <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500">
                    We believe gathering information should feel seamless for the creator and clear for the respondent. FormBuilder brings enterprise-grade capability into a clean, approachable experience without the clutter.
                  </p>

                  <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-600 shadow-sm">
                    <Rocket className="size-4 text-slate-400" />
                    Designed to help teams launch faster
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {['Design first', 'Fast setup', 'Reliable data'].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm text-center"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PILLARS GRID */}
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="group flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 active:scale-[1.02] active:border-slate-300 active:shadow-md"
                      style={{ animationDelay: `${140 + index * 70}ms` }}
                    >
                      <div className="mb-5 flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-950 shadow-sm transition-colors duration-300 group-active:bg-slate-950 group-active:text-white">
                        <Icon className="size-5" />
                      </div>

                      <h3 className="text-lg font-medium tracking-tight text-slate-950">{pillar.title}</h3>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA SECTION */}
          <div className="mt-24 animate-rise-in" style={{ animationDelay: '220ms' }}>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] border border-slate-950 bg-slate-950 px-8 py-16 text-center shadow-xl md:p-20">
              <div className="relative z-10 flex flex-col items-center">
                <Heart className="mb-6 size-10 text-white" />
                <h2 className="max-w-3xl text-4xl font-medium leading-tight tracking-tight text-white sm:text-5xl text-balance">
                  Ready to build something clearer?
                </h2>
                <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 text-balance">
                  Join creators who use FormBuilder to collect feedback, run campaigns, and ship forms that feel polished from the first click.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'h-14 w-full sm:w-auto rounded-xl border border-white bg-white px-8 text-lg font-medium text-slate-950 transition-all active:bg-slate-950 active:text-white'
                    )}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 size-5" />
                  </Link>

                  <Link
                    href="/pricing"
                    className={cn(
                      buttonVariants({ size: 'lg', variant: 'outline' }),
                      'h-14 w-full sm:w-auto rounded-xl border border-slate-700 bg-transparent px-8 text-lg font-medium text-white transition-all active:bg-white active:text-slate-950'
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
