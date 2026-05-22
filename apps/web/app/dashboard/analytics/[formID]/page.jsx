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
import { Activity, Users, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FormAnalyticsPage() {
  const params = useParams();
  const formId = params.formID;
  const { page, nextPage, prevPage } = usePagination(1);

  // 1. Fetch the data using our highly-optimized tRPC route
const { data, isLoading, isError } = trpc.form.getFormAnalytics.useQuery(
    {
      formId: formId || '', // Fallback to empty string while Next.js loads the URL
      page,
      limit: 10,
    },
    {
      // THE FIX: Do NOT fire the network request until the URL parameter is ready!
      enabled: !!formId, 
    }
  );

  // 2. Data Transformation for the Graph (Submissions over time)
  const chartData = useMemo(() => {
    if (!data?.submissions) return [];
    
    // Group submissions by Date
    const dateCounts = data.submissions.reduce((acc, sub) => {
      const date = new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Convert to Array for Recharts
    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .reverse(); // Show oldest to newest on graph
  }, [data?.submissions]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !data?.form) {
    return <div className="text-center mt-20 text-red-500 font-medium">Failed to load analytics or form not found.</div>;
  }

  const { form, fields, submissions, pagination } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* HEADER */}
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 flex items-center mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Forms
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{form.title}</h2>
        <p className="text-slate-500 mt-1">Analytics and responses overview</p>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pagination.total}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Fields Tracked</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{fields.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Status</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {form.isExpired ? 'Closed' : 'Active'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TIME SERIES GRAPH */}
      <Card className="border-0 shadow-sm pt-6">
        <CardHeader>
          <CardTitle>Response Volume</CardTitle>
          <CardDescription>Daily submission counts for this form.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              Not enough data to display graph.
            </div>
          )}
        </CardContent>
      </Card>

      {/* RAW DATA TABLE */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>Individual Responses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[180px]">Date Submitted</TableHead>
                {/* Dynamically render headers based on form fields */}
                {fields.map(field => (
                  <TableHead key={field.id}>{field.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={fields.length + 1} className="h-24 text-center text-slate-500">
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-slate-600">
                      {new Date(sub.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </TableCell>
                    {fields.map(field => {
                      const answer = sub.answers[field.id];
                      // Format arrays nicely if it's a multi-select
                      const displayValue = Array.isArray(answer) ? answer.join(', ') : answer;
                      return (
                        <TableCell key={field.id} className="max-w-[200px] truncate" title={displayValue}>
                          {displayValue || '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION CONTROLS */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={pagination.page === 1}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => nextPage(pagination.totalPages)} disabled={pagination.page === pagination.totalPages}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}