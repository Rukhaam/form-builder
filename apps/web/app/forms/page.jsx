'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Inbox, Search, Users } from 'lucide-react';

import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';

function formatDate(value) {
  if (!value) return 'Recently published';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PublicFormsPage() {
  const { data: forms = [], isLoading } = trpc.form.getPublicForms.useQuery();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff7ef,transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-32">
        <div className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700">
                <Search className="size-4" />
                Public directory
              </div>
              <h1 className="text-4xl font-black text-slate-950 md:text-6xl">View forms</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Browse published forms from creators and answer the ones that matter to you.
              </p>
            </div>
            <Link href="/dashboard/editor/new" className={cn(buttonVariants({ size: 'lg' }), 'bg-slate-950 text-white hover:bg-slate-800')}>
              Publish yours
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-12 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Inbox className="size-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-950">No public forms yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Publish a form from the dashboard and it will appear here for anyone to answer.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form, index) => (
              <article
                key={form.id}
                className="animate-rise-in rounded-2xl border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-200"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <FileText className="size-5" />
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">
                    {formatDate(form.createdAt)}
                  </span>
                </div>

                <h2 className="line-clamp-2 text-xl font-black text-slate-950">{form.title}</h2>
                <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
                  {form.description || 'No description provided.'}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/70 p-3">
                    <div className="text-xs font-bold uppercase text-slate-400">Fields</div>
                    <div className="mt-1 text-xl font-black text-slate-950">{form.fieldCount}</div>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
                      <Users className="size-3" />
                      Answers
                    </div>
                    <div className="mt-1 text-xl font-black text-slate-950">{form.submissionCount}</div>
                  </div>
                </div>

                <Link href={`/forms/${form.slug}`} className={cn(buttonVariants({ size: 'lg' }), 'mt-5 w-full bg-slate-950 text-white hover:bg-slate-800')}>
                  Answer form
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
