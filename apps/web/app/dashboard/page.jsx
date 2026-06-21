'use client';

import Link from 'next/link';
import { trpc } from '@/utils/trpc';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Activity, Edit3 } from 'lucide-react'; // Optional: icons for the buttons

export default function DashboardPage() {
  // Fetch the logged-in user's forms!
  const { data: forms, isLoading } = trpc.form.getMyForms.useQuery();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* TOP ACTION BAR */}
      <div className="flex items-center justify-between flex-direction: column gap-4 md:flex-row">
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-slate-900">My Forms</h2>
          <p className="text-slate-500 mt-1">Manage and view analytics for your forms.</p>
        </div>
        <Link
          href="/dashboard/editor/new"
          className={cn(buttonVariants({ size: 'lg' }), 'font-medium')}
        >
          + Create New Form
        </Link>
      </div>

      {/* FORMS GRID */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse bg-slate-100 h-48 border-0 shadow-sm" />
          ))}
        </div>
      ) : forms?.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-slate-900">No forms created yet</h3>
          <p className="text-slate-500 mt-1 mb-6">Create your first form to start collecting data.</p>
          <Link
            href="/dashboard/editor/new"
            className={buttonVariants({ variant: 'outline' })}
          >
            Create your first form
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms?.map((form) => (
            <Card key={form.id} className="active:shadow-md transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="line-clamp-1" title={form.title}>
                    {form.title}
                  </CardTitle>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${form.visibility === 'PUBLIC' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {form.visibility}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                  {form.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex space-x-3 w-full">
                  <Link
                    href={`/dashboard/editor/${form.id}`}
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full flex-1')}
                  >
                    <Edit3 className="w-4 h-4 mr-2 text-slate-500" />
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/analytics/${form.id}`}
                    className={cn(buttonVariants({ variant: 'secondary' }), 'w-full flex-1')}
                  >
                    <Activity className="w-4 h-4 mr-2 text-blue-600" />
                    Analytics
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
