'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, MessageSquare, Briefcase, GraduationCap, Sparkles, Palette, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { buttonVariants, Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';

export default function TemplatesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch templates from your new tRPC route
const { data, isLoading } = trpc.form.getTemplates.useQuery();
  const templates = data?.templates || [];

const dynamicCategories = ['All', ...new Set((templates || []).map(t => t.category || 'General'))];

  // Mutation to clone the template
const cloneMutation = trpc.form.createFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success('Template cloned successfully!');
      router.push(`/dashboard/editor/${data.formId}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Please log in to use templates');
      if (err.data?.code === 'UNAUTHORIZED') router.push('/login');
    }
  });

const filteredTemplates = templates.filter(t => 
    activeCategory === 'All' ? true : (t.category || 'General') === activeCategory
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 selection:bg-violet-200 selection:text-violet-900">
      <Navbar />

      {/* HEADER SECTION */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#ede9fe,transparent_40%),radial-gradient(circle_at_top_left,#e0e7ff,transparent_40%)]"></div>
        
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-xl">
            <Palette className="size-4" />
            Template Gallery
          </div>
          <h1 className="text-4xl font-medium tracking-tight text-slate-950 md:text-6xl text-balance">
            Don't start from scratch.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 text-balance">
            Choose from dozens of beautiful, pre-built templates and themes designed for conversion. Clone them into your workspace in one click.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {dynamicCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                activeCategory === cat 
                  ? "bg-slate-950 text-white shadow-md" 
                  : "bg-white border border-slate-200 text-slate-600 active:border-violet-300 active:text-violet-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* TEMPLATES GRID */}
      <section className="mx-auto max-w-7xl px-4 pb-32">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template, i) => (
              <div 
                key={template.id} 
                className="group relative flex flex-col justify-between rounded-[2rem] border border-white/60 bg-white/40 p-2 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-500 active:-translate-y-2 active:shadow-2xl active:shadow-violet-200/40 animate-rise-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Simulated Form Preview Card */}
                <div className={cn(
                  "relative h-48 w-full overflow-hidden rounded-[1.5rem] p-6 transition-colors",
                  template.theme === 'dark' ? 'bg-slate-900' : 
                  template.theme === 'neon' ? 'bg-fuchsia-950' : 'bg-slate-100'
                )}>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                  
                  {/* Fake UI Elements */}
                  <div className={cn("h-4 w-1/3 rounded mb-4", template.theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-sm')}></div>
                  <div className={cn("h-8 w-3/4 rounded-lg mb-3", template.theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-sm')}></div>
                  <div className={cn("h-8 w-1/2 rounded-lg", template.theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-sm')}></div>
                </div>

                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-violet-600">
                      {template.category || 'General'}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 uppercase">
                      {template.theme} theme
                    </span>
                  </div>
                  <h3 className="text-xl font-medium text-slate-950 mb-2">{template.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-6">
                    {template.description || 'A beautiful starting point for your next form.'}
                  </p>
                  
                  <Button 
                    onClick={() => cloneMutation.mutate({ templateId: template.id })}
                    disabled={cloneMutation.isPending}
                    className="w-full rounded-xl bg-slate-950 text-white active:bg-slate-800 transition-all"
                  >
                    <Copy className="mr-2 size-4" />
                    Use this template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
