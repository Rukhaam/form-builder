'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import { usePagination } from '@/hooks/usePagination';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, Clock, ArrowLeft, ChevronLeft, ChevronRight, Star, BarChart3 } from 'lucide-react';
import Link from 'next/link';

// Recharts
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

export default function FormAnalyticsPage() {
  const params = useParams();
  const formId = Array.isArray(params.formID) ? params.formID[0] : params.formID;
  const { page, nextPage, prevPage } = usePagination(1);

  // 1. Fetch Form Analytics Data
  const { data, isLoading, isError } = trpc.form.getFormAnalytics.useQuery(
    {
      formId: formId || '',
      page,
      limit: 10,
    },
    { enabled: !!formId }
  );
  // console.log(data)

  // 2. Fetch Form Review Stats
  const { data: reviewStatsData } = trpc.review.getStats.useQuery(
    { formId: formId || '' },
    { enabled: !!formId }
  );

  const reviewStats = useMemo(() => {
    if (!reviewStatsData) return { average: 0, total: 0 };
    return {
      average: reviewStatsData.averageRating || 0,
      total: reviewStatsData.totalReviews || 0
    };
  }, [reviewStatsData]);



  // 4. Data Transformation: Submissions over time
  const timeSeriesData = useMemo(() => {
    if (!data?.allSubmissions) return [];
    
    const dateCounts = data.allSubmissions.reduce((acc, sub) => {
      const date = new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .reverse(); 
  }, [data?.allSubmissions]);

  // 5. Data Transformation: Field-specific Answer Distribution
  const fieldDistributionData = useMemo(() => {
    if (!data?.fields || !data?.allSubmissions) return [];

    // Only generate graphs for choice-based fields
    const choiceFields = data.fields.filter(f => 
      ['single_select', 'multi_select', 'checkbox'].includes(f.type) && f.options?.length > 0
    );

    return choiceFields.map(field => {
      // Initialize counts for all options to 0
      const counts = field.options.reduce((acc, opt) => {
        acc[opt] = 0;
        return acc;
      }, {});

      // Tally up the answers
      data.allSubmissions.forEach(sub => {
        const answer = sub.answers[field.id];
        if (Array.isArray(answer)) {
          answer.forEach(val => { if (counts[val] !== undefined) counts[val]++; });
        } else if (answer !== undefined && answer !== null) {
          if (counts[answer] !== undefined) counts[answer]++;
        }
      });

      // Format for Recharts BarChart
      const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
      
      return {
        id: field.id,
        label: field.label,
        data: chartData
      };
    });
  }, [data?.fields, data?.allSubmissions]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 pt-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data?.form) {
    return <div className="text-center mt-20 text-red-500 font-medium">Failed to load analytics or form not found.</div>;
  }

  const { form, fields, submissions, pagination } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-12 pt-8">
      
      {/* HEADER */}
      <div>
        <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-violet-600 flex items-center mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
        </Link>
        <h2 className="text-3xl font-medium tracking-tight text-slate-950">{form.title}</h2>
        <p className="text-slate-500 mt-1 font-medium">Real-time analytics and response data</p>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-[1.5rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Responses</CardTitle>
            <div className="p-2 bg-blue-50 rounded-xl"><Users className="h-4 w-4 text-blue-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-medium text-slate-900">{pagination.total}</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-[1.5rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Rating</CardTitle>
            <div className="p-2 bg-amber-50 rounded-xl"><Star className="h-4 w-4 text-amber-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-medium text-slate-900">{reviewStats.average}</div>
              <div className="text-sm font-medium text-slate-500">({reviewStats.total} reviews)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-[1.5rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Fields Tracked</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-xl"><Activity className="h-4 w-4 text-emerald-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-medium text-slate-900">{fields.length}</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-[1.5rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Latest Entry</CardTitle>
            <div className="p-2 bg-violet-50 rounded-xl"><Clock className="h-4 w-4 text-violet-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-medium text-slate-900 mt-2">
              {data.allSubmissions && data.allSubmissions.length > 0 
                ? new Date(data.allSubmissions[0].submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'No responses'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN TIME SERIES GRAPH */}
      <Card className="border border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] pt-6 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Response Volume</CardTitle>
          <CardDescription className="font-medium text-slate-500">Daily submission counts across the form's lifespan.</CardDescription>
        </CardHeader>
        <CardContent>
          {timeSeriesData.length > 0 ? (
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500 font-medium bg-slate-50 rounded-2xl">
              Not enough data to display timeline.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🚀 NEW: DYNAMIC FIELD DISTRIBUTION GRAPHS */}
      {fieldDistributionData.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 px-2">
            <BarChart3 className="size-5 text-slate-700" />
            <h3 className="text-xl font-medium text-slate-900">Answer Breakdown</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {fieldDistributionData.map((fieldData, index) => (
              <Card key={fieldData.id} className="border border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-[1.5rem] pt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium line-clamp-1" title={fieldData.label}>
                    {fieldData.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fieldData.data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                          {fieldData.data.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* RAW DATA TABLE */}
      <Card className="border border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden mt-8">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-medium">Individual Responses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[180px] font-medium text-slate-700 whitespace-nowrap">Date Submitted</TableHead>
                  {fields.map(field => (
                    <TableHead key={field.id} className="font-medium text-slate-700 whitespace-nowrap min-w-[150px]">
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={fields.length + 1} className="h-32 text-center font-medium text-slate-500">
                      No submissions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-600 whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </TableCell>
                      {fields.map(field => {
                        const answer = sub.answers[field.id];
                        const displayValue = Array.isArray(answer) ? answer.join(', ') : answer;
                        return (
                          <TableCell key={field.id} className="max-w-[250px] truncate text-slate-700 font-medium" title={displayValue}>
                            {displayValue || <span className="text-slate-300 italic">Empty</span>}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* PAGINATION CONTROLS */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Showing page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.totalPages}</span>
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50" onClick={prevPage} disabled={pagination.page === 1}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50" onClick={() => nextPage(pagination.totalPages)} disabled={pagination.page === pagination.totalPages}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}