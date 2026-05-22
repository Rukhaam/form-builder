'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Activity, ArrowRight, BarChart3, Clock, FileText, Inbox, Users } from 'lucide-react';

import { trpc } from '@/utils/trpc';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function formatDate(value) {
  if (!value) return 'No responses yet';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AnalyticsOverviewPage() {
  const { data: forms = [], isLoading } = trpc.form.getAnalyticsOverview.useQuery();

  const totals = useMemo(() => {
    return forms.reduce(
      (acc, form) => ({
        responses: acc.responses + Number(form.submissionCount || 0),
        fields: acc.fields + Number(form.fieldCount || 0),
        active: acc.active + (form.isExpired ? 0 : 1),
      }),
      { responses: 0, fields: 0, active: 0 },
    );
  }, [forms]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7,transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff_52%,#fff7ed)] p-8 text-slate-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-white/70 bg-white/65 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <BarChart3 className="size-4" />
                Analytics
              </div>
              <h1 className="text-3xl font-bold text-slate-950">Response overview</h1>
              <p className="mt-1 text-sm text-slate-500">Track every form from one clean command center.</p>
            </div>
            <Link href="/dashboard/editor/new" className={cn(buttonVariants({ size: 'lg' }), 'bg-slate-950 text-white hover:bg-slate-800')}>
              New form
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total responses', value: totals.responses, icon: Users, tone: 'text-blue-700 bg-blue-100' },
            { label: 'Fields tracked', value: totals.fields, icon: Activity, tone: 'text-emerald-700 bg-emerald-100' },
            { label: 'Active forms', value: totals.active, icon: FileText, tone: 'text-amber-700 bg-amber-100' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/65 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                  <div className={cn('flex size-10 items-center justify-center rounded-xl', stat.tone)}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <div className="mt-4 text-3xl font-bold text-slate-950">{stat.value}</div>
              </div>
            );
          })}
        </section>

        {forms.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center shadow-xl shadow-slate-200/50 backdrop-blur-xl">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Inbox className="size-7" />
            </div>
            <h2 className="text-xl font-semibold text-slate-950">No analytics yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create a form and collect a response to see charts, counts, and individual submissions here.
            </p>
            <Link href="/dashboard/editor/new" className={cn(buttonVariants({ size: 'lg' }), 'mt-6 bg-slate-950 text-white hover:bg-slate-800')}>
              Create form
            </Link>
          </section>
        ) : (
          <section className="grid gap-4">
            {forms.map((form) => (
              <article
                key={form.id}
                className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
                        {form.status}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {form.visibility}
                      </span>
                    </div>
                    <h2 className="truncate text-xl font-semibold text-slate-950">{form.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {form.description || 'No description provided.'}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/analytics/${form.id}`}
                    className={cn(buttonVariants({ variant: 'outline' }), 'bg-white/80')}
                  >
                    Open
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-white/70 bg-white/60 p-3">
                    <div className="text-xs font-medium text-slate-500">Responses</div>
                    <div className="mt-1 text-2xl font-bold text-slate-950">{form.submissionCount}</div>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white/60 p-3">
                    <div className="text-xs font-medium text-slate-500">Fields</div>
                    <div className="mt-1 text-2xl font-bold text-slate-950">{form.fieldCount}</div>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white/60 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Clock className="size-3.5" />
                      Latest response
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-800">{formatDate(form.latestSubmittedAt)}</div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
