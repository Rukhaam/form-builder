'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  RefreshCw,
  Lock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Hash,
  Brain,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

function SentimentBar({ positive, neutral, negative }) {
  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {positive > 0 && (
          <div
            className="h-full bg-slate-800 transition-all duration-700 ease-out"
            style={{ width: `${positive}%` }}
            title={`Positive: ${positive}%`}
          />
        )}
        {neutral > 0 && (
          <div
            className="h-full bg-slate-400 transition-all duration-700 ease-out"
            style={{ width: `${neutral}%` }}
            title={`Neutral: ${neutral}%`}
          />
        )}
        {negative > 0 && (
          <div
            className="h-full bg-slate-200 transition-all duration-700 ease-out"
            style={{ width: `${negative}%` }}
            title={`Negative: ${negative}%`}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="size-3.5 text-slate-800" />
          <span className="text-slate-800">{positive}% Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Minus className="size-3.5 text-slate-500" />
          <span className="text-slate-500">{neutral}% Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className="size-3.5 text-slate-400" />
          <span className="text-slate-500">{negative}% Negative</span>
        </div>
      </div>
    </div>
  );
}

function ThemePills({ themes }) {
  const colors = [
    'bg-slate-100 text-slate-800 border-slate-200',
    'bg-white text-slate-700 border-slate-300',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((theme, i) => (
        <span
          key={theme}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-transform hover:scale-105',
            colors[i % colors.length]
          )}
        >
          <Hash className="size-3" />
          {theme}
        </span>
      ))}
    </div>
  );
}

function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[2rem] bg-white/80 backdrop-blur-sm">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 shadow-inner">
        <Lock className="size-6 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">AI Insights Locked</h3>
      <p className="mt-1.5 max-w-xs text-center text-sm font-medium text-slate-500">
        Upgrade to Pro or Business to unlock AI-powered response analysis.
      </p>
      <Link
        href="/pricing"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
      >
        View Plans
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export default function AiInsightsCard({ formId }) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { data, isLoading, refetch } = trpc.ai.getTextInsights.useQuery(
    { formId },
    { enabled: !!formId, refetchOnWindowFocus: false }
  );

  const regenerateMutation = trpc.ai.regenerateInsights.useMutation({
    onSuccess: async () => {
      await refetch();
      setIsRegenerating(false);
    },
    onError: () => {
      setIsRegenerating(false);
    },
  });

  const handleRegenerate = () => {
    setIsRegenerating(true);
    regenerateMutation.mutate({ formId });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-none h-full flex flex-col justify-center">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Not available or no data
  if (!data || !data.available) {
    // Locked for free tier
    if (data?.locked) {
      return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-none h-full">
          {/* Blurred placeholder content */}
          <div className="pointer-events-none select-none blur-[6px]" aria-hidden="true">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900">
                <Sparkles className="size-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">AI Insights</h3>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              AI analysis would appear here showing summaries, themes, and sentiment breakdown of your text responses...
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Theme 1</span>
              <span className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">Theme 2</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Theme 3</span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-slate-100" />
          </div>
          <LockedOverlay />
        </div>
      );
    }

    // No text fields or no responses — show a subtle prompt
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 h-full flex flex-col justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
            <Brain className="size-5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-500">AI Insights</h3>
            <p className="text-sm font-medium text-slate-400">{data?.reason || 'Not available for this form.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Full insights view
  const { summary, themes, sentiment, generatedAt, submissionCount, fromCache } = data;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-none h-full flex flex-col justify-center p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 shadow-none">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">AI Insights</h3>
              <p className="text-xs font-medium text-slate-400">
                {fromCache ? 'Cached' : 'Fresh'} analysis · {submissionCount} response{submissionCount !== 1 ? 's' : ''} analyzed
                {generatedAt && (
                  <> · {new Date(generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</>
                )}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-900 hover:bg-slate-100 font-semibold"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={cn('size-3.5 mr-1.5', isRegenerating && 'animate-spin')} />
            {isRegenerating ? 'Analyzing...' : 'Regenerate'}
          </Button>
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 shadow-none">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            <Zap className="size-3.5" />
            Summary
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-700">{summary}</p>
        </div>

        {/* Themes */}
        {themes && themes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-1">
              <Hash className="size-3.5" />
              Common Themes
            </div>
            <ThemePills themes={themes} />
          </div>
        )}

        {/* Sentiment */}
        {sentiment && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-1">
              <TrendingUp className="size-3.5" />
              Sentiment Analysis
            </div>
            <SentimentBar
              positive={sentiment.positive}
              neutral={sentiment.neutral}
              negative={sentiment.negative}
            />
          </div>
        )}
      </div>
  );
}
