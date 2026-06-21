'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import { usePagination } from '@/hooks/usePagination';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, Clock, ArrowLeft, ChevronLeft, ChevronRight, Star, BarChart3, X, Filter } from 'lucide-react';
import Link from 'next/link';
import AiInsightsCard from '@/components/AiInsightsCard';

// Recharts
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#e5e5e5'];

export default function FormAnalyticsPage() {
  const params = useParams();
  const formId = Array.isArray(params.formID) ? params.formID[0] : params.formID;
  const { page, nextPage, prevPage, resetPage } = usePagination(1);

  // Cross-tabulation filter state
  // Shape: { fieldId: string, fieldLabel: string, value: string } | null
  const [crossFilter, setCrossFilter] = useState(null);

  // 1. Fetch Form Analytics Data
  const { data, isLoading, isError } = trpc.form.getFormAnalytics.useQuery(
    {
      formId: formId || '',
      page,
      limit: 10,
    },
    { enabled: !!formId }
  );

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

  // 3. Cross-tab filtered submissions
  const filteredSubmissions = useMemo(() => {
    if (!data?.allSubmissions) return [];
    if (!crossFilter) return data.allSubmissions;

    return data.allSubmissions.filter(sub => {
      const answer = sub.answers[crossFilter.fieldId];
      if (Array.isArray(answer)) return answer.includes(crossFilter.value);
      return answer === crossFilter.value;
    });
  }, [data?.allSubmissions, crossFilter]);

  const isFiltered = crossFilter !== null;
  const totalCount = data?.allSubmissions?.length ?? 0;
  const filteredCount = filteredSubmissions.length;

  // 4. Data Transformation: Submissions over time (uses filteredSubmissions)
  const timeSeriesData = useMemo(() => {
    if (!filteredSubmissions.length) return [];
    
    const dateCounts = filteredSubmissions.reduce((acc, sub) => {
      const date = new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .reverse(); 
  }, [filteredSubmissions]);

  // 5. Data Transformation: Field-specific Answer Distribution (uses filteredSubmissions)
  const fieldDistributionData = useMemo(() => {
    if (!data?.fields || !filteredSubmissions.length) return [];

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
      filteredSubmissions.forEach(sub => {
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
        type: field.type,
        data: chartData
      };
    });
  }, [data?.fields, filteredSubmissions]);

  // 6. Paginate filtered submissions for table display
  const paginatedTableData = useMemo(() => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const paginatedItems = filteredSubmissions.slice(offset, offset + limit);
    const totalPages = Math.ceil(filteredSubmissions.length / limit);
    return {
      submissions: paginatedItems,
      pagination: {
        total: filteredSubmissions.length,
        page,
        limit,
        totalPages,
      }
    };
  }, [filteredSubmissions, page]);

  // Handle bar click for cross-tabulation
  const handleBarClick = useCallback((fieldId, fieldLabel, value) => {
    setCrossFilter(prev => {
      // Toggle off if clicking the same filter
      if (prev && prev.fieldId === fieldId && prev.value === value) {
        return null;
      }
      return { fieldId, fieldLabel, value };
    });
    resetPage();
  }, [resetPage]);

  const clearFilter = useCallback(() => {
    setCrossFilter(null);
    resetPage();
  }, [resetPage]);

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

  const { form, fields } = data;
  const { submissions: tableSubmissions, pagination: tablePagination } = paginatedTableData;

  return (
    <div className="-m-8 min-h-screen bg-[#f5f5f7] px-4 md:px-8 pb-12 pt-8 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div>
        <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
        </Link>
        <h2 className="text-3xl font-medium tracking-tight text-slate-950">{form.title}</h2>
        <p className="text-slate-500 mt-1 font-medium">Real-time analytics and response data</p>
      </div>

      {/* CROSS-TAB FILTER BANNER */}
      {isFiltered && (
        <div className="animate-slide-down">
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Filter className="size-3.5 text-slate-900" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cross-tab filter active</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {crossFilter.fieldLabel} = <span className="font-semibold text-slate-900">"{crossFilter.value}"</span>
                  <span className="ml-2 text-xs text-slate-400">
                    ({filteredCount} of {totalCount} responses)
                  </span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-xl border-slate-200 text-slate-900 hover:bg-slate-100 font-semibold"
              onClick={clearFilter}
            >
              <X className="size-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* MAIN BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <Card className="col-span-1 border border-slate-200 shadow-none rounded-3xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Responses</CardTitle>
            <div className="p-2 bg-slate-100 rounded-xl"><Users className="h-4 w-4 text-slate-900" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-medium text-slate-900">
              {filteredCount}
              {isFiltered && (
                <span className="text-lg font-normal text-slate-400 ml-2">/ {totalCount}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border border-slate-200 shadow-none rounded-3xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Rating</CardTitle>
            <div className="p-2 bg-slate-100 rounded-xl"><Star className="h-4 w-4 text-slate-900" /></div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-medium text-slate-900">{reviewStats.average}</div>
              <div className="text-sm font-medium text-slate-500">({reviewStats.total} reviews)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border border-slate-200 shadow-none rounded-3xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Fields Tracked</CardTitle>
            <div className="p-2 bg-slate-100 rounded-xl"><Activity className="h-4 w-4 text-slate-900" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-medium text-slate-900">{fields.length}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border border-slate-200 shadow-none rounded-3xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Latest Entry</CardTitle>
            <div className="p-2 bg-slate-100 rounded-xl"><Clock className="h-4 w-4 text-slate-900" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-medium text-slate-900 mt-2">
              {filteredSubmissions.length > 0 
                ? new Date(filteredSubmissions[0].submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'No responses'}
            </div>
          </CardContent>
        </Card>

        {/* MAIN TIME SERIES GRAPH */}
        <Card className="md:col-span-2 lg:col-span-3 border border-slate-200 shadow-none rounded-3xl bg-white pt-6 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-medium">Response Volume</CardTitle>
                <CardDescription className="font-medium text-slate-500">Daily submission counts across the form's lifespan.</CardDescription>
              </div>
              {isFiltered && (
                <span className="text-xs font-semibold text-slate-900 bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
                  {filteredCount} of {totalCount} responses
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {timeSeriesData.length > 0 ? (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#000000" strokeWidth={3} fillOpacity={0.05} fill="#000000" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 font-medium bg-slate-50 rounded-2xl">
                {isFiltered ? 'No matching submissions for this filter.' : 'Not enough data to display timeline.'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI TEXT INSIGHTS */}
        <div className="md:col-span-2 lg:col-span-1 h-full">
          <AiInsightsCard formId={formId} />
        </div>

        {/* 🚀 DYNAMIC FIELD DISTRIBUTION GRAPHS */}
        {fieldDistributionData.length > 0 && fieldDistributionData.map((fieldData) => {
          const isFilterSource = isFiltered && crossFilter.fieldId === fieldData.id;

          return (
            <Card key={fieldData.id} className="md:col-span-2 border border-slate-200 shadow-none rounded-3xl bg-white pt-6 transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium line-clamp-1" title={fieldData.label}>
                    {fieldData.label}
                  </CardTitle>
                  {isFiltered && (
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0 ml-2">
                      {filteredCount} of {totalCount}
                    </span>
                  )}
                </div>
                {isFilterSource && (
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    ✦ Filter source — click selected bar to clear
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={fieldData.data} 
                      layout="vertical" 
                      margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                      style={{ cursor: 'pointer' }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 6, 6, 0]} 
                        barSize={24}
                        onClick={(barData) => {
                          if (barData && barData.name) {
                            handleBarClick(fieldData.id, fieldData.label, barData.name);
                          }
                        }}
                      >
                        {fieldData.data.map((entry, i) => {
                          const baseColor = CHART_COLORS[i % CHART_COLORS.length];
                          const isActiveBar = isFilterSource && crossFilter.value === entry.name;
                          const isDimmed = isFilterSource && !isActiveBar;

                          return (
                            <Cell 
                              key={`cell-${i}`} 
                              fill={baseColor} 
                              fillOpacity={isDimmed ? 0.25 : 1}
                              stroke={isActiveBar ? baseColor : 'none'}
                              strokeWidth={isActiveBar ? 3 : 0}
                              style={{ cursor: 'pointer', transition: 'fill-opacity 300ms ease' }}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* RAW DATA TABLE */}
        <Card className="md:col-span-4 border border-slate-200 shadow-none rounded-3xl overflow-hidden mt-4 bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium">Individual Responses</CardTitle>
              {isFiltered && (
                <span className="text-xs font-semibold text-slate-900 bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
                  Showing {filteredCount} filtered
                </span>
              )}
            </div>
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
                  {tableSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={fields.length + 1} className="h-32 text-center font-medium text-slate-500">
                        {isFiltered ? 'No matching submissions.' : 'No submissions recorded yet.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableSubmissions.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <TableCell className="font-medium text-slate-600 whitespace-nowrap">
                          {new Date(sub.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </TableCell>
                        {fields.map(field => {
                          const answer = sub.answers[field.id];
                          const displayValue = Array.isArray(answer) ? answer.join(', ') : answer;
                          const isHighlighted = isFiltered && crossFilter.fieldId === field.id;
                          return (
                            <TableCell 
                              key={field.id} 
                              className={`max-w-[250px] truncate font-medium ${isHighlighted ? 'text-slate-900 bg-slate-100' : 'text-slate-700'}`} 
                              title={displayValue}
                            >
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
        {tablePagination.totalPages > 1 && (
          <div className="md:col-span-4 flex items-center justify-between bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-none">
            <p className="text-sm font-medium text-slate-500">
              Showing page <span className="text-slate-900">{tablePagination.page}</span> of <span className="text-slate-900">{tablePagination.totalPages}</span>
              {isFiltered && <span className="text-slate-900 ml-2">({filteredCount} filtered results)</span>}
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50" onClick={prevPage} disabled={tablePagination.page === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50" onClick={() => nextPage(tablePagination.totalPages)} disabled={tablePagination.page === tablePagination.totalPages}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

      </div>
      </div>
    </div>
  );
}