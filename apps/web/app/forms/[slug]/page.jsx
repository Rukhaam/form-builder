'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Send, Lock } from 'lucide-react';

import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';

// Updated to match uppercase Database ENUMs
const OPTION_FIELD_TYPES = new Set(['SINGLE_SELECT', 'MULTI_SELECT', 'CHECKBOX', 'MULTIPLE_CHOICE']);
const themeClasses = {
  light: "bg-slate-50 text-slate-900",
  dark: "bg-slate-950 text-white border-slate-800",
  neon: "bg-fuchsia-950 text-fuchsia-50 border-fuchsia-800 shadow-[0_0_50px_rgba(217,70,239,0.3)]",
};
function isEmptyAnswer(field, value) {
  if (!field.required) return false;
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || String(value).trim() === '';
}

function FieldInput({ field, value, onChange }) {
  // Normalize the type to handle both 'LONG_TEXT' and 'long_text' gracefully
  const normalizedType = field.type?.toUpperCase() || '';

  if (normalizedType === 'LONG_TEXT') {
    return (
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full resize-none rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
        placeholder="Write your answer"
      />
    );
  }

  // Maps to your standard MULTIPLE_CHOICE or custom single_select enums
  if (normalizedType === 'SINGLE_SELECT' || normalizedType === 'MULTIPLE_CHOICE') {
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

  if (normalizedType === 'MULTI_SELECT' || normalizedType === 'CHECKBOX') {
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

  // Default fallback for SHORT_TEXT, EMAIL, NUMBER, etc.
  return (
    <Input
      type={normalizedType === 'EMAIL' ? 'email' : normalizedType === 'NUMBER' ? 'number' : 'text'}
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
  const [formPassword, setFormPassword] = useState('');
  const [unlockedFields, setUnlockedFields] = useState(null);

  // Using your new custom public route
  const { data, isLoading, isError } = trpc.form.getPublicFormBySlug.useQuery(
    { slug: slug || '' },
    { enabled: Boolean(slug) },
  );

  const unlockMutation = trpc.form.verifyFormPassword.useMutation({
    onSuccess: (result) => {
      setUnlockedFields(result.fields);
      toast.success('Form unlocked');
    },
    onError: (error) => {
      toast.error(error.message || 'Incorrect password');
    },
  });

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

  const fieldsToRender = unlockedFields || data?.fields;

  const firstMissingField = useMemo(() => {
    if (!fieldsToRender) return null;
    return fieldsToRender.find((field) => isEmptyAnswer(field, answers[field.id]));
  }, [answers, fieldsToRender]);

  const handleAnswerChange = (fieldId, value) => {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  };

  const handleUnlock = (event) => {
    event.preventDefault();
    if (!formPassword) return;
    unlockMutation.mutate({ formId: data.form.id, password: formPassword });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!data?.form) return;
    
    // Client-side validation interceptor
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
   <main className={cn("min-h-screen", themeClasses[data.form.theme || 'light'])}>
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
        ) : data.isProtected && !unlockedFields ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-10 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl max-w-md mx-auto mt-12">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Lock className="size-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-950">{data.form.title}</h1>
            <p className="mt-2 mb-6 text-sm text-slate-600">This form is password protected. Enter the password to access.</p>
            
            <form onSubmit={handleUnlock} className="space-y-4 max-w-xs mx-auto">
              <Input 
                type="password"
                placeholder="Enter password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required
                className="h-12 text-center text-lg border-white/80 bg-white/80"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800" 
                disabled={unlockMutation.isLoading}
              >
                {unlockMutation.isLoading ? 'Unlocking...' : 'Access form'}
              </Button>
            </form>
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

            {fieldsToRender.map((field, index) => {
              const normalizedType = field.type?.toUpperCase() || '';
              return (
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
                  {OPTION_FIELD_TYPES.has(normalizedType) && (!field.options || field.options.length === 0) && (
                    <p className="mt-2 text-xs font-medium text-slate-500">This choice field has no options yet.</p>
                  )}
                </section>
              );
            })}

            {fieldsToRender.length === 0 && (
              <section className="rounded-2xl border border-white/70 bg-white/70 p-8 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl">
                <p className="text-sm font-medium text-slate-600">This form has no questions yet.</p>
              </section>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800" 
              disabled={submitMutation.isLoading}
            >
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