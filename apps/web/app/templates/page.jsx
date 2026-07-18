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

// ── Cover images keyed by template title (Unsplash – free & open-source) ──
const TEMPLATE_IMAGES = {
  // Feedback
  'Customer Feedback':       'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=500&fit=crop&q=80',
  'Product Review':          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop&q=80',
  'Website Feedback':        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80',
  // HR & Recruiting
  'Job Application':         'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop&q=80',
  'Employee Satisfaction Survey': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&q=80',
  // Education
  'Course Evaluation':       'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&h=500&fit=crop&q=80',
  'Student Registration':    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop&q=80',
  // Events
  'Event Registration':      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&q=80',
  'Event Feedback':          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=500&fit=crop&q=80',
  // Marketing
  'Newsletter Signup':       'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&h=500&fit=crop&q=80',
  'Lead Generation':         'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=80',
  // Customer Support
  'Bug Report':              'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop&q=80',
  'Contact Us':              'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=500&fit=crop&q=80',
  // Healthcare
  'Patient Intake Form':     'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop&q=80',
};

const CATEGORY_FALLBACK_IMAGES = {
  'Feedback':          'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=500&fit=crop&q=80',
  'HR & Recruiting':   'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop&q=80',
  'Education':         'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop&q=80',
  'Events':            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&q=80',
  'Marketing':         'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=80',
  'Customer Support':  'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=500&fit=crop&q=80',
  'Healthcare':        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop&q=80';

function getTemplateImage(title, category) {
  return TEMPLATE_IMAGES[title] || CATEGORY_FALLBACK_IMAGES[category] || DEFAULT_IMAGE;
}

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
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-slate-200/60"></div>
            ))
          ) : (
            dynamicCategories.map(cat => (
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
            ))
          )}
        </div>
      </section>

      {/* TEMPLATES GRID */}
      <section className="mx-auto max-w-7xl px-4 pb-32">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="flex flex-col justify-between rounded-[2rem] border border-slate-100 bg-white/40 p-2 shadow-sm"
              >
                <div className="h-48 w-full animate-pulse rounded-[1.5rem] bg-slate-200/60"></div>
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200/60"></div>
                    <div className="h-4 w-12 animate-pulse rounded bg-slate-200/60"></div>
                  </div>
                  <div className="mb-3 h-6 w-3/4 animate-pulse rounded-lg bg-slate-200/60"></div>
                  <div className="mb-2 h-4 w-full animate-pulse rounded bg-slate-200/60"></div>
                  <div className="mb-6 h-4 w-5/6 animate-pulse rounded bg-slate-200/60"></div>
                  <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/60"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template, i) => (
              <div 
                key={template.id} 
                className="group relative flex flex-col justify-between rounded-[2rem] border border-white/60 bg-white/40 p-2 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-500 active:-translate-y-2 active:shadow-2xl active:shadow-violet-200/40 animate-rise-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Template Cover Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-[1.5rem]">
                  <img
                    src={template.coverImageUrl || getTemplateImage(template.title, template.category)}
                    alt={template.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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
