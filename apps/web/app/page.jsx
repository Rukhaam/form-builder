import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, FileText, ListChecks, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';

import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Wand2,
    title: 'Fast builder',
    copy: 'Compose clean forms with field controls, choice options, drafts, and publishing in one focused workspace.',
  },
  {
    icon: BarChart3,
    title: 'Live analytics',
    copy: 'Track responses, fields, and individual submissions without leaving the dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Public sharing',
    copy: 'Publish forms to a browsable public gallery while keeping private work inside your dashboard.',
  },
];

const faqs = [
  {
    question: 'Can people answer forms without an account?',
    answer: 'Yes. Published public forms can be opened from the forms gallery and submitted without signing in.',
  },
  {
    question: 'Can I keep a form as a draft?',
    answer: 'Yes. Save as draft while editing, then publish when the form is ready for responses.',
  },
  {
    question: 'Where do responses appear?',
    answer: 'Responses appear in the analytics area for each form, with totals and individual answer rows.',
  },
  {
    question: 'Can I edit fields after creating a form?',
    answer: 'Yes. You can edit labels, types, options, required state, and ordering in the editor.',
  },
];

function HeroScene() {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 p-4 shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.08),rgba(16,185,129,0.12),rgba(245,158,11,0.10))]" />
      <div className="relative grid h-full gap-4">
        <div className="animate-rise-in rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-300/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-emerald-700">Published</div>
              <div className="mt-1 text-xl font-bold text-slate-950">Client intake</div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">84 responses</span>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="h-11 rounded-xl border border-slate-200 bg-white" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-11 rounded-xl border border-slate-200 bg-white" />
              <div className="h-11 rounded-xl border border-slate-200 bg-white" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_0.86fr]">
          <div className="animate-float-slow rounded-2xl border border-white/80 bg-slate-950 p-4 text-white shadow-xl shadow-slate-400/40">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">Response curve</span>
              <BarChart3 className="size-5 text-emerald-300" />
            </div>
            <div className="mt-6 flex h-36 items-end gap-2">
              {[42, 68, 52, 94, 76, 112, 88].map((height, index) => (
                <div
                  key={height}
                  className="flex-1 rounded-t-xl bg-gradient-to-t from-emerald-500 to-sky-300"
                  style={{ height: `${height}px`, animationDelay: `${index * 90}ms` }}
                />
              ))}
            </div>
          </div>

          <div className="animate-rise-in rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-300/40 [animation-delay:160ms]">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-950">
              <ListChecks className="size-4 text-amber-600" />
              Form fields
            </div>
            {['Email', 'Budget', 'Timeline', 'Project type'].map((item) => (
              <div key={item} className="mb-2 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span>{item}</span>
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
            ))}
          </div>
        </div>

        <div className="animate-rise-in rounded-2xl border border-white/80 bg-white/75 p-4 shadow-lg shadow-slate-300/40 [animation-delay:260ms]">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Sparkles className="size-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-slate-950">Ready to share</div>
              <div className="text-xs font-medium text-slate-500">Public form link generated automatically.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dff7ef,transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] text-slate-950">
      <Navbar />

      <section className="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 px-4 pb-14 pt-32 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="animate-rise-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 text-sm font-bold text-emerald-700 shadow-sm backdrop-blur-xl">
            <Sparkles className="size-4" />
            Build, publish, collect, understand
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] text-slate-950 md:text-7xl">
            FormBuilder
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            A slick form workspace for creating beautiful public forms, collecting answers, and reading analytics without a messy admin panel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/editor/new" className={cn(buttonVariants({ size: 'lg' }), 'h-12 bg-slate-950 px-5 text-white hover:bg-slate-800')}>
              Create a form
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link href="/forms" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 border-white/80 bg-white/70 px-5')}>
              Browse public forms
            </Link>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {[
              ['7+', 'field types'],
              ['1 link', 'to share'],
              ['Live', 'analytics'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                <div className="text-2xl font-black text-slate-950">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <HeroScene />
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-bold uppercase text-emerald-700">Features</div>
            <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">Everything feels close at hand</h2>
          </div>
          <Link href="/forms" className="text-sm font-bold text-slate-700 hover:text-slate-950">
            View public forms
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="animate-rise-in rounded-2xl border border-white/70 bg-white/65 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/70 md:p-10">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-300">
                <FileText className="size-4" />
                Public gallery
              </div>
              <h2 className="text-3xl font-black md:text-4xl">Answer forms from the community</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Published forms show up in one clean place, ready for visitors to open and submit.
              </p>
              <Link href="/forms" className={cn(buttonVariants({ size: 'lg' }), 'mt-6 bg-white text-slate-950 hover:bg-slate-100')}>
                Explore forms
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
            <div className="grid gap-3">
              {['Customer research', 'Workshop signup', 'Product feedback'].map((name, index) => (
                <div key={name} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{name}</div>
                      <div className="mt-1 text-sm text-slate-300">{index + 4} fields ready to answer</div>
                    </div>
                    <ArrowRight className="size-5 text-emerald-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <div className="text-sm font-bold uppercase text-emerald-700">FAQ</div>
          <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">A few crisp answers</h2>
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
