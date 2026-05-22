'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';

import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';

const OPTION_FIELD_TYPES = new Set(['single_select', 'multi_select', 'checkbox']);

function isEmptyAnswer(field, value) {
  if (!field.required) return false;
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || String(value).trim() === '';
}

function FieldInput({ field, value, onChange }) {
  if (field.type === 'long_text') {
    return (
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full resize-none rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
        placeholder="Write your answer"
      />
    );
  }

  if (field.type === 'single_select') {
    return (
      <div className="grid gap-2">
        {(field.options || []).map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/70 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50">
            <input
              type="radio"
              name={field.id}
              checked={value === option}
              onChange={() => onChange(option)}
              className="size-4 accent-slate-950"
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === 'multi_select' || field.type === 'checkbox') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="grid gap-2">
        {(field.options || []).map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/70 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) => {
                onChange(
                  event.target.checked
                    ? [...selected, option]
                    : selected.filter((item) => item !== option),
                );
              }}
              className="size-4 rounded accent-slate-950"
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  return (
    <Input
      type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 border-white/80 bg-white/80"
      placeholder="Your answer"
    />
  );
}

export default function PublicFormResponsePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, isError } = trpc.form.getPublicFormBySlug.useQuery(
    { slug: slug || '' },
    { enabled: Boolean(slug) },
  );
  const submitMutation = trpc.form.submitResponse.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setAnswers({});
      toast.success('Response submitted');
    },
    onError: (error) => {
      toast.error(error.message || 'Could not submit this response');
    },
  });

  const firstMissingField = useMemo(() => {
    if (!data?.fields) return null;
    return data.fields.find((field) => isEmptyAnswer(field, answers[field.id]));
  }, [answers, data?.fields]);

  const handleAnswerChange = (fieldId, value) => {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!data?.form) return;
    if (firstMissingField) {
      toast.error(`Answer "${firstMissingField.label}" before submitting`);
      return;
    }

    const cleanedAnswers = Object.fromEntries(
      Object.entries(answers).filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && String(value).trim() !== '';
      }),
    );

    submitMutation.mutate({
      formId: data.form.id,
      answers: cleanedAnswers,
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dcfce7,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff_50%,#fff7ed)] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 pb-20 pt-32">
        <Link href="/forms" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mb-5 border-white/80 bg-white/70')}>
          <ArrowLeft className="mr-2 size-4" />
          Back to forms
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : isError || !data?.form ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-10 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl">
            <h1 className="text-2xl font-black text-slate-950">Form unavailable</h1>
            <p className="mt-2 text-sm text-slate-600">This form may be private, expired, or unpublished.</p>
          </div>
        ) : submitted ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-10 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-950">Thanks for responding</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Your answer has been saved.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => setSubmitted(false)} className="bg-slate-950 text-white hover:bg-slate-800">
                Submit another response
              </Button>
              <Link href="/forms" className={buttonVariants({ variant: 'outline' })}>
                Browse more forms
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <section className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
              <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                Public form
              </div>
              <h1 className="text-4xl font-black text-slate-950">{data.form.title}</h1>
              {data.form.description && (
                <p className="mt-3 text-base leading-7 text-slate-600">{data.form.description}</p>
              )}
            </section>

            {data.fields.map((field, index) => (
              <section key={field.id} className="animate-rise-in rounded-2xl border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
                <label className="mb-3 block text-sm font-bold text-slate-950">
                  {index + 1}. {field.label}
                  {field.required && <span className="ml-1 text-red-500">*</span>}
                </label>
                <FieldInput
                  field={field}
                  value={answers[field.id]}
                  onChange={(value) => handleAnswerChange(field.id, value)}
                />
                {OPTION_FIELD_TYPES.has(field.type) && (!field.options || field.options.length === 0) && (
                  <p className="mt-2 text-xs font-medium text-slate-500">This choice field has no options yet.</p>
                )}
              </section>
            ))}

            {data.fields.length === 0 && (
              <section className="rounded-2xl border border-white/70 bg-white/70 p-8 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl">
                <p className="text-sm font-medium text-slate-600">This form has no questions yet.</p>
              </section>
            )}

            <Button type="submit" size="lg" className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800" disabled={submitMutation.isLoading}>
              <Send className="mr-2 size-4" />
              {submitMutation.isLoading ? 'Submitting...' : 'Submit response'}
            </Button>
          </form>
        )}
      </section>

      <Footer />
    </main>
  );
}
