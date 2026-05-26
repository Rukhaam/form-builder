'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Send, Lock } from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/StarRating'; // Make sure you created this component!
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';

// Maps your exact database ENUMS
const OPTION_FIELD_TYPES = new Set(['SINGLE_SELECT', 'MULTI_SELECT', 'CHECKBOX', 'MULTIPLE_CHOICE']);

// 🚀 Dynamic Styling Engine based on Form Theme
const getThemeStyles = (theme) => {
  switch (theme) {
    case 'dark':
      return {
        main: "bg-slate-950 text-slate-50",
        card: "bg-slate-900/60 border-slate-800 text-slate-50 shadow-2xl shadow-black/50 backdrop-blur-xl",
        input: "bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20",
        choiceLabel: "bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-200",
        badge: "bg-slate-800 text-slate-300 border border-slate-700",
        text: "text-slate-50",
        muted: "text-slate-400",
        button: "bg-violet-600 text-white hover:bg-violet-500"
      };
    case 'neon':
      return {
        main: "bg-fuchsia-950 text-fuchsia-50 selection:bg-cyan-400 selection:text-black",
        card: "bg-fuchsia-900/20 border-fuchsia-500/20 text-fuchsia-50 shadow-[0_0_30px_rgba(217,70,239,0.1)] backdrop-blur-xl",
        input: "bg-fuchsia-950/50 border-fuchsia-500/30 text-white placeholder:text-fuchsia-300/50 focus:border-fuchsia-400 focus:ring-fuchsia-400/20",
        choiceLabel: "bg-fuchsia-900/30 hover:bg-fuchsia-800/40 border-fuchsia-500/30 text-fuchsia-100",
        badge: "bg-fuchsia-900/50 text-fuchsia-200 border border-fuchsia-500/30",
        text: "text-fuchsia-50",
        muted: "text-fuchsia-200/70",
        button: "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
      };
    case 'light':
    default:
      return {
        main: "bg-[radial-gradient(circle_at_top_right,#dcfce7,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff_50%,#fff7ed)] text-slate-950",
        card: "bg-white/70 border-white/70 text-slate-950 shadow-xl shadow-slate-200/60 backdrop-blur-xl",
        input: "bg-white/80 border-white/80 text-slate-800 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100",
        choiceLabel: "bg-white/75 hover:bg-emerald-50 border-white/70 text-slate-700",
        badge: "bg-emerald-100 text-emerald-700",
        text: "text-slate-950",
        muted: "text-slate-500",
        button: "bg-slate-950 text-white hover:bg-slate-800"
      };
  }
};

function isEmptyAnswer(field, value) {
  if (!field.required) return false;
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || String(value).trim() === '';
}

// Passed dynamic styles into FieldInput
function FieldInput({ field, value, onChange, styles }) {
  const normalizedType = field.type?.toUpperCase() || '';

  if (normalizedType === 'LONG_TEXT') {
    return (
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className={cn("min-h-28 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none transition", styles.input)}
        placeholder="Write your answer"
      />
    );
  }

  if (normalizedType === 'SINGLE_SELECT' || normalizedType === 'MULTIPLE_CHOICE') {
    return (
      <div className="grid gap-2">
        {(field.options || []).map((option) => (
          <label key={option} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition", styles.choiceLabel)}>
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
          <label key={option} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition", styles.choiceLabel)}>
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
      type={normalizedType === 'EMAIL' ? 'email' : normalizedType === 'NUMBER' ? 'number' : 'text'}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      className={cn("h-11 border", styles.input)}
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

  // 🚀 Rating & Auth State
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [unlockToken, setUnlockToken] = useState(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  const { data, isLoading, isError } = trpc.form.getPublicFormBySlug.useQuery(
    { slug: slug || '' },
    { enabled: Boolean(slug) },
  );

  const unlockMutation = trpc.form.verifyFormPassword.useMutation({
    onSuccess: (result) => {
      setUnlockedFields(result.fields);
      setUnlockToken(result.unlockToken);
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

  // 🚀 Review Submission Mutation
  const submitReviewMutation = trpc.review.submit.useMutation({
    onSuccess: () => {
      setHasRated(true);
      toast.success('Thanks for your rating!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit rating');
    },
  });

  const fieldsToRender = unlockedFields || data?.fields;
  const currentTheme = data?.form?.theme || 'light';
  const styles = getThemeStyles(currentTheme); 

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
      unlockToken: unlockToken || undefined,
    });
  };

  // 🚀 Handle Rating Click
  const handleRate = (newRating) => {
    setRating(newRating);
    if (data?.form?.id) {
      submitReviewMutation.mutate({ formId: data.form.id, rating: newRating });
    }
  };

  return (
    <main className={cn("min-h-screen transition-colors duration-500", styles.main)}>
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 pb-20 pt-32">
        <Link href="/forms" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "mb-5", styles.card)}>
          <ArrowLeft className="mr-2 size-4" />
          Back to forms
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-2xl opacity-50" />
            <Skeleton className="h-28 rounded-2xl opacity-50" />
            <Skeleton className="h-28 rounded-2xl opacity-50" />
          </div>
        ) : isError || !data?.form ? (
          <div className={cn("rounded-[2rem] border p-10 text-center", styles.card)}>
            <h1 className={cn("text-2xl font-black", styles.text)}>Form unavailable</h1>
            <p className={cn("mt-2 text-sm", styles.muted)}>This form may be private, expired, or unpublished.</p>
          </div>
        ) : data.isProtected && !unlockedFields ? (
          <div className={cn("rounded-[2rem] border p-10 text-center max-w-md mx-auto mt-12", styles.card)}>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-500/20 text-slate-400">
              <Lock className="size-8" />
            </div>
            <h1 className={cn("text-2xl font-black", styles.text)}>{data.form.title}</h1>
            <p className={cn("mt-2 mb-6 text-sm", styles.muted)}>This form is password protected. Enter the password to access.</p>
            
            <form onSubmit={handleUnlock} className="space-y-4 max-w-xs mx-auto">
              <Input 
                type="password"
                placeholder="Enter password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required
                className={cn("h-12 text-center text-lg", styles.input)}
              />
              <Button 
                type="submit" 
                size="lg" 
                className={cn("w-full h-12 transition-all", styles.button)}
                disabled={unlockMutation.isLoading}
              >
                {unlockMutation.isLoading ? 'Unlocking...' : 'Access form'}
              </Button>
            </form>
          </div>
        ) : submitted ? (
          <div className={cn("rounded-[2rem] border p-10 text-center", styles.card)}>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className={cn("text-3xl font-black", styles.text)}>Thanks for responding</h1>
            <p className={cn("mt-3 text-sm leading-6", styles.muted)}>Your answer has been saved.</p>
            
            {/* 🚀 CONDITIONAL RATING UI */}
            {user ? (
              <div className="mt-8 pt-8 border-t border-current/10">
                <p className={cn("text-sm font-semibold mb-3", styles.text)}>
                  {hasRated ? "Thank you for your feedback!" : "How was your experience using this form?"}
                </p>
                <div className="flex justify-center">
                  <StarRating 
                    rating={rating} 
                    setRating={handleRate} 
                    readOnly={hasRated || submitReviewMutation.isPending} 
                    size="size-8"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-current/10">
                 <p className={cn("text-sm font-medium", styles.muted)}>
                   Sign in to FormBuilder to leave a rating.
                 </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={() => { setSubmitted(false); setRating(0); setHasRated(false); }} className={cn(styles.button)}>
                Submit another response
              </Button>
              <Link href="/forms" className={cn(buttonVariants({ variant: 'outline' }), styles.card)}>
                Browse more forms
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <section className={cn("rounded-[2rem] border p-6", styles.card)}>
              <div className={cn("mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase", styles.badge)}>
                Public form
              </div>
              <h1 className={cn("text-4xl font-black", styles.text)}>{data.form.title}</h1>
              {data.form.description && (
                <p className={cn("mt-3 text-base leading-7", styles.muted)}>{data.form.description}</p>
              )}
            </section>

            {fieldsToRender.map((field, index) => {
              const normalizedType = field.type?.toUpperCase() || '';
              return (
                <section key={field.id} className={cn("animate-rise-in rounded-2xl border p-5", styles.card)}>
                  <label className={cn("mb-3 block text-sm font-bold", styles.text)}>
                    {index + 1}. {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                  </label>
                  
                  <FieldInput
                    field={field}
                    value={answers[field.id]}
                    onChange={(value) => handleAnswerChange(field.id, value)}
                    styles={styles} 
                  />
                  
                  {OPTION_FIELD_TYPES.has(normalizedType) && (!field.options || field.options.length === 0) && (
                    <p className={cn("mt-2 text-xs font-medium", styles.muted)}>This choice field has no options yet.</p>
                  )}
                </section>
              );
            })}

            {fieldsToRender.length === 0 && (
              <section className={cn("rounded-2xl border p-8 text-center", styles.card)}>
                <p className={cn("text-sm font-medium", styles.muted)}>This form has no questions yet.</p>
              </section>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className={cn("h-12 w-full transition-all", styles.button)}
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