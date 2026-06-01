'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Activity, ArrowRight, BarChart3, Clock, FileText, Inbox, Star, Users } from 'lucide-react';

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

function FormRating({ formId }) {
  const { data: reviewStats } = trpc.review.getStats.useQuery({ formId });
  
  if (reviewStats && reviewStats.totalReviews > 0) {
    return (
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-medium text-slate-950">{reviewStats.averageRating}</span>
        <span className="text-sm font-medium text-slate-500">({reviewStats.totalReviews})</span>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-baseline gap-1.5">
      <span className="text-lg font-medium text-slate-400 pt-1">No reviews</span>
    </div>
  );
}

export default function AnalyticsOverviewPage() {
  const { data: forms = [], isLoading } = trpc.form.getAnalyticsOverview.useQuery();


  const totals = useMemo(() => {
    return forms.reduce(
      (acc, form) => {
        let latest = acc.latest;
        if (form.latestSubmittedAt) {
          const formDate = new Date(form.latestSubmittedAt);
          if (!latest || formDate > latest) {
            latest = formDate;
          }
        }
        return {
          responses: acc.responses + Number(form.submissionCount || 0),
          fields: acc.fields + Number(form.fieldCount || 0),
          active: acc.active + (form.isExpired || form.status !== 'PUBLISHED' ? 0 : 1),
          latest,
        };
      },
      { responses: 0, fields: 0, active: 0, latest: null },
    );
  }, [forms]);

  if (isLoading) {
    return (
      <div className="-m-8 min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7,transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff_52%,#fff7ed)] p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-28 w-full rounded-[2rem]" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 rounded-[1.5rem]" />
            <Skeleton className="h-32 rounded-[1.5rem]" />
            <Skeleton className="h-32 rounded-[1.5rem]" />
          </div>
          <Skeleton className="h-96 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7,transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff_52%,#fff7ed)] p-4 md:p-8 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 pt-4">
        
        {/* HEADER SECTION */}
        <section className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
                <BarChart3 className="size-4" />
                Analytics Command Center
              </div>
              <h1 className="text-3xl font-medium text-slate-950 md:text-5xl">Response overview</h1>
              <p className="mt-3 text-sm md:text-base font-medium text-slate-500 max-w-xl">
                Track conversion rates, review scores, and submission volume across all your forms from one unified dashboard.
              </p>
            </div>
            <Link href="/dashboard/editor/new" className={cn(buttonVariants({ size: 'lg' }), 'bg-slate-950 text-white active:bg-slate-800 rounded-xl')}>
              New form
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </section>

        {/* AGGREGATE KPI STATS */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Total Responses', value: totals.responses, icon: Users, tone: 'text-blue-700 bg-blue-100 border-blue-200' },
            { label: 'Data Points Tracked', value: totals.fields, icon: Activity, tone: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
            { label: 'Active Live Forms', value: totals.active, icon: FileText, tone: 'text-amber-700 bg-amber-100 border-amber-200' },

          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="animate-rise-in rounded-[1.5rem] border border-white/70 bg-white/65 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-transform active:-translate-y-1" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium uppercase tracking-wider text-slate-500">{stat.label}</div>
                  <div className={cn('flex size-10 items-center justify-center rounded-xl border', stat.tone)}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <div className="mt-4 text-2xl md:text-4xl font-medium text-slate-950 truncate" title={String(stat.value)}>{stat.value}</div>
              </div>
            );
          })}
        </section>

        {/* FORMS LIST */}
        {forms.length === 0 ? (
          <section className="animate-rise-in rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-12 text-center shadow-xl shadow-slate-200/50 backdrop-blur-xl" style={{ animationDelay: '300ms' }}>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-[1.5rem] bg-emerald-100 text-emerald-700 shadow-inner">
              <Inbox className="size-8" />
            </div>
            <h2 className="text-2xl font-medium text-slate-950">No analytics yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-500">
              Create a form and collect a response to see charts, data breakdowns, and individual submissions here.
            </p>
            <Link href="/dashboard/editor/new" className={cn(buttonVariants({ size: 'lg' }), 'mt-8 bg-slate-950 text-white active:bg-slate-800 rounded-xl')}>
              Create your first form
            </Link>
          </section>
        ) : (
          <section className="grid gap-5">
            <h2 className="text-xl font-medium text-slate-900 px-2 mt-4">Your Forms</h2>
            {forms.map((form, index) => (
              <article
                key={form.id}
                className="animate-rise-in rounded-[1.5rem] border border-white/70 bg-white/70 p-5 md:p-6 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all active:-translate-y-1 active:border-emerald-200 active:shadow-emerald-200/40"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider shadow-sm",
                        form.status === 'PUBLISHED' ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                      )}>
                        {form.status}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-500 shadow-sm border border-slate-100">
                        {form.visibility}
                      </span>
                      {form.isExpired && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-red-700 shadow-sm">
                          Closed
                        </span>
                      )}
                    </div>
                    <h2 className="truncate text-2xl font-medium text-slate-950">{form.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500 max-w-3xl">
                      {form.description || 'No description provided.'}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/analytics/${form.id}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full md:w-auto bg-white/80 shadow-sm rounded-xl font-medium border-slate-200 active:bg-slate-50')}
                  >
                    View Analytics
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-white/70 bg-white/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      <Users className="size-3.5" /> Responses
                    </div>
                    <div className="mt-2 text-3xl font-medium text-slate-950">{form.submissionCount}</div>
                  </div>
                  
                  <div className="rounded-xl border border-white/70 bg-white/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      <Activity className="size-3.5" /> Fields
                    </div>
                    <div className="mt-2 text-3xl font-medium text-slate-950">{form.fieldCount}</div>
                  </div>
                  
                  <div className="rounded-xl border border-white/70 bg-white/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      <Star className="size-3.5 text-amber-500" /> Avg Rating
                    </div>
                    <FormRating formId={form.id} />
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
