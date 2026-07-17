"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  Bot,
  FilePlus2,
  History,
  LoaderCircle,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";

const promptIdeas = [
  "Create a customer discovery survey for a new budgeting app.",
  "Build a workshop registration form with dietary requirements.",
  "Make a project intake form for a freelance design studio.",
];

function formatResetDate(value) {
  if (!value) return "next week";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export default function FormAssistantPage() {
  const utils = trpc.useUtils();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const conversationsQuery = trpc.formAssistant.listConversations.useQuery();
  const usageQuery = trpc.formAssistant.getUsage.useQuery();
  const conversationQuery = trpc.formAssistant.getConversation.useQuery(
    { conversationId: activeConversationId },
    { enabled: Boolean(activeConversationId) },
  );

  useEffect(() => {
    if (!activeConversationId && conversationsQuery.data?.length) {
      setActiveConversationId(conversationsQuery.data[0].id);
    }
  }, [activeConversationId, conversationsQuery.data]);

  const generateMutation = trpc.formAssistant.generate.useMutation({
    onSuccess: async (data) => {
      setActiveConversationId(data.conversationId);
      setPendingPrompt("");
      await Promise.all([
        utils.formAssistant.listConversations.invalidate(),
        utils.formAssistant.getConversation.invalidate(),
        utils.formAssistant.getUsage.invalidate(),
      ]);
    },
    onError: (error) => {
      setPendingPrompt("");
      toast.error(error.message || "Unable to create a form right now.");
    },
  });

  const messages = conversationQuery.data?.messages ?? [];
  const quota = usageQuery.data;
  const isSending = generateMutation.isPending;

  const startNewChat = () => {
    setActiveConversationId(null);
    setPrompt("");
    setPendingPrompt("");
    setIsHistoryOpen(false);
  };

  const submitPrompt = () => {
    const value = prompt.trim();
    if (!value || isSending) return;

    setPendingPrompt(value);
    setPrompt("");
    generateMutation.mutate({
      conversationId: activeConversationId || undefined,
      prompt: value,
    });
  };

  return (
    <div className="mx-auto flex min-h-[680px] max-w-[1440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.45)]">
      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-20 flex w-[280px] shrink-0 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 lg:relative lg:translate-x-0",
          isHistoryOpen ? "translate-x-0 shadow-2xl shadow-slate-950/10" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Sparkles className="size-3.5" />
            </span>
            Form assistant
          </div>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(false)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 lg:hidden"
            aria-label="Close conversation history"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            type="button"
            onClick={startNewChat}
            className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            <Plus className="size-4" />
            New form chat
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            <History className="size-3" />
            History
          </div>
          <div className="space-y-1">
            {conversationsQuery.isLoading && (
              <div className="px-2 py-3 text-sm text-slate-400">Loading conversations…</div>
            )}
            {!conversationsQuery.isLoading && !conversationsQuery.data?.length && (
              <div className="px-2 py-3 text-sm leading-relaxed text-slate-400">
                Your generated forms will appear here.
              </div>
            )}
            {conversationsQuery.data?.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setActiveConversationId(conversation.id);
                  setIsHistoryOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition",
                  activeConversationId === conversation.id
                    ? "bg-white text-slate-950 ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )}
              >
                <MessageSquare className="size-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{conversation.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
              <span>{quota?.plan?.name || "Current"} plan</span>
              <span>{quota ? `${quota.remaining}/${quota.limit} left` : "…"}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-300"
                style={{ width: `${quota ? (quota.used / quota.limit) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Weekly prompts reset {formatResetDate(quota?.resetsAt)}.
            </p>
          </div>
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Open conversation history"
          >
            <Menu className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {conversationQuery.data?.conversation?.title || "New form"}
            </p>
            <p className="text-xs text-slate-400">Describe the need. Get an editable draft.</p>
          </div>
          <button
            type="button"
            onClick={startNewChat}
            className="ml-auto hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          >
            <Plus className="size-3.5" />
            New chat
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          {!activeConversationId && !pendingPrompt && !messages.length ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center pt-12 text-center sm:pt-20">
              <span className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Bot className="size-5" />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                What form can I create for you?
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
                Tell me who it is for, what you need to learn, and any fields that matter. I’ll create a private draft you can edit immediately.
              </p>
              <div className="mt-8 grid w-full gap-2 text-left sm:grid-cols-3">
                {promptIdeas.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="rounded-xl border border-slate-200 p-3 text-left text-xs leading-relaxed text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <Sparkles className="size-3.5" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      message.role === "user"
                        ? "rounded-tr-sm bg-slate-900 text-white"
                        : "rounded-tl-sm border border-slate-200 bg-white text-slate-700",
                    )}
                  >
                    <p>{message.content}</p>
                    {message.role === "assistant" && message.formSnapshot && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{message.formSnapshot.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                              {message.formSnapshot.description}
                            </p>
                          </div>
                          <FilePlus2 className="mt-0.5 size-4 shrink-0 text-slate-400" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {message.formSnapshot.fields?.slice(0, 4).map((field, index) => (
                            <span key={`${field.label}-${index}`} className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                              {field.label}
                            </span>
                          ))}
                          {message.formSnapshot.fields?.length > 4 && (
                            <span className="px-1 py-1 text-[11px] font-medium text-slate-400">
                              +{message.formSnapshot.fields.length - 4} more
                            </span>
                          )}
                        </div>
                        {message.formId && (
                          <Link
                            href={`/dashboard/editor/${message.formId}`}
                            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600"
                          >
                            Open draft in editor
                            <ArrowUpRight className="size-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {pendingPrompt && (
                <>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-3 text-sm leading-relaxed text-white">
                      {pendingPrompt}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <Sparkles className="size-3.5" />
                    </span>
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <LoaderCircle className="size-4 animate-spin" />
                      Creating your form draft…
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.5)] transition focus-within:border-slate-400">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitPrompt();
                  }
                }}
                rows={2}
                placeholder="Describe the form you need…"
                className="block w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
                disabled={isSending}
              />
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="pl-2 text-[11px] text-slate-400">Enter to send · Shift + Enter for a new line</span>
                <button
                  type="button"
                  onClick={submitPrompt}
                  disabled={!prompt.trim() || isSending || quota?.remaining === 0}
                  className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200"
                  aria-label="Create form"
                >
                  {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </div>
            </div>
            {quota?.remaining === 0 && (
              <p className="mt-2 text-center text-xs text-slate-500">
                You’ve used this week’s form-assistant prompts. Your allowance resets {formatResetDate(quota.resetsAt)}.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
