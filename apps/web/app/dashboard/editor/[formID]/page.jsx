"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ListChecks,
  Mail,
  Plus,
  Save,
  Send,
  Sparkles,
  TextCursorInput,
  Trash2,
  Lock,
  Palette,
  BarChart3,
  Eye,
  Pencil // 🚀 Added Pencil icon for toggling back to edit mode
} from "lucide-react"; 
import Link from "next/link";
import { format } from "date-fns";

import { trpc } from "@/utils/trpc";
import {
  addField,
  loadForm,
  removeField,
  reorderFields,
  resetForm,
  setActiveField,
  updateField,
  updateMetadata,
} from "@/store/slices/formEditorSlice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const FIELD_TYPES = [
  { value: "short_text", label: "Short text", icon: TextCursorInput },
  { value: "long_text", label: "Paragraph", icon: TextCursorInput },
  { value: "email", label: "Email", icon: Mail },
  { value: "number", label: "Number", icon: TextCursorInput },
  { value: "single_select", label: "Single select", icon: ListChecks },
  { value: "multi_select", label: "Multi select", icon: ListChecks },
  { value: "checkbox", label: "Checkboxes", icon: ListChecks },
];

const OPTION_FIELD_TYPES = new Set([
  "single_select",
  "multi_select",
  "checkbox",
]);

function fieldTypeLabel(type) {
  return (
    FIELD_TYPES.find((fieldType) => fieldType.value === type)?.label || type
  );
}

function emptyOptionsForType(type) {
  return OPTION_FIELD_TYPES.has(type) ? ["Option 1", "Option 2"] : null;
}

function normalizeFields(fields) {
  return fields.map((field, index) => ({
    id: field.id,
    type: field.type,
    label: field.label.trim(),
    required: Boolean(field.required),
    order: index,
    options: OPTION_FIELD_TYPES.has(field.type)
      ? (field.options || []).map((option) => option.trim()).filter(Boolean)
      : null,
  }));
}

export default function FormEditorPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const utils = trpc.useContext();

  const formIdParam = Array.isArray(params.formID)
    ? params.formID[0]
    : params.formID;
  const isNew = formIdParam === "new";
  const editorState = useSelector((state) => state.formEditor);

  const {
    title,
    description,
    visibility,
    status,
    fields,
    activeFieldId,
    password,
    category,
    theme,
  } = editorState;
  
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  
  const { data: existingForm, isLoading: isFetching } =
    trpc.form.getFormEditor.useQuery(
      { formId: formIdParam },
      { enabled: !isNew && !!formIdParam },
    );

  const saveMutation = trpc.form.saveEditor.useMutation({
    onSuccess: async (data) => {
      dispatch(
        loadForm({
          id: data.form.id,
          title: data.form.title,
          description: data.form.description,
          visibility: data.form.visibility,
          status: data.form.status,
          expiresAt: data.form.expiresAt,
          maxResponses: data.form.maxResponses,
          category: data.form.category,
          theme: data.form.theme,
          fields: data.fields,
        }),
      );

      await utils.form.getMyForms.invalidate();
      await utils.form.getAnalyticsOverview.invalidate();
      toast.success(data.message);

      if (isNew) {
        router.replace(`/dashboard/editor/${data.form.id}`);
      }
    },
    onError: (error) => {
      if (error.data?.code === 'PAYMENT_REQUIRED') {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-slate-900">{error.message}</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push('/pricing');
                }}
                className="w-fit rounded-lg bg-slate-950 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-slate-800"
              >
                Upgrade to Pro
              </button>
            </div>
          ),
          { duration: 8000, style: { background: '#fff', border: '1px solid #e2e8f0' } }
        );
      } else {
        toast.error(error.message || "Could not save this form");
      }
    },
  });

  const isSaving = saveMutation.isLoading || saveMutation.isPending;

  useEffect(() => {
    if (isNew) {
      dispatch(resetForm());
    } else if (existingForm?.form) {
      dispatch(
        loadForm({
          id: existingForm.form.id,
          title: existingForm.form.title,
          description: existingForm.form.description,
          visibility: existingForm.form.visibility,
          status: existingForm.form.status,
          expiresAt: existingForm.form.expiresAt,
          maxResponses: existingForm.form.maxResponses,
          category: existingForm.form.category,
          theme: existingForm.form.theme,
          fields: existingForm.fields,
        }),
      );
    }
  }, [dispatch, existingForm, isNew]);

  const activeField = useMemo(
    () => fields.find((field) => field.id === activeFieldId) || fields[0],
    [activeFieldId, fields],
  );

  const handleAddField = (type) => {
    const id = uuidv4();
    dispatch(addField({ id, type }));
    dispatch(setActiveField(id));
    
    // Ensure we switch back to editor view if we add a field while previewing on mobile
    setShowMobilePreview(false);
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleFieldTypeChange = (field, type) => {
    dispatch(
      updateField({
        id: field.id,
        updates: { type, options: emptyOptionsForType(type) },
      }),
    );
  };

  const handleOptionChange = (field, optionIndex, value) => {
    const nextOptions = [...(field.options || [])];
    nextOptions[optionIndex] = value;
    dispatch(updateField({ id: field.id, updates: { options: nextOptions } }));
  };

  const handleAddOption = (field) => {
    const nextOptions = [
      ...(field.options || []),
      `Option ${(field.options?.length || 0) + 1}`,
    ];
    dispatch(updateField({ id: field.id, updates: { options: nextOptions } }));
  };

  const handleRemoveOption = (field, optionIndex) => {
    const nextOptions = (field.options || []).filter(
      (_, index) => index !== optionIndex,
    );
    dispatch(
      updateField({
        id: field.id,
        updates: { options: nextOptions.length ? nextOptions : ["Option 1"] },
      }),
    );
  };

  const moveField = (fieldIndex, direction) => {
    const targetIndex = fieldIndex + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const nextFields = [...fields];
    const [field] = nextFields.splice(fieldIndex, 1);
    nextFields.splice(targetIndex, 0, field);
    dispatch(
      reorderFields(
        nextFields.map((item, index) => ({ ...item, order: index })),
      ),
    );
  };

  const handleSave = (nextStatus = "DRAFT") => {
    const cleanTitle = title.trim();
    const cleanFields = normalizeFields(fields);

    if (!cleanTitle) {
      toast.error("Add a form title before saving");
      return;
    }

    const invalidField = cleanFields.find((field) => !field.label);
    if (invalidField) {
      toast.error("Every field needs a label");
      return;
    }

    const invalidOptionsField = cleanFields.find(
      (field) =>
        OPTION_FIELD_TYPES.has(field.type) && field.options.length === 0,
    );
    if (invalidOptionsField) {
      toast.error("Choice fields need at least one option");
      return;
    }

    saveMutation.mutate({
      formId: isNew ? undefined : formIdParam,
      title: cleanTitle,
      description: description?.trim() || null,
      visibility,
      status: nextStatus,
      expiresAt: editorState.expiresAt?.toString() || null,
      maxResponses: editorState.maxResponses
        ? parseInt(editorState.maxResponses, 10)
        : null,
      password: password || undefined,
      category: category || undefined,
      theme: theme || "light",
      isTemplate: !!category,
      fields: cleanFields,
    });
  };
  
  const shareLink = useMemo(() => {
    if (isNew) return "";
    const formSlug = existingForm?.form?.slug;
    if (!formSlug) return "";
    if (typeof window === "undefined") return `/forms/${formSlug}`;
    return `${window.location.origin}/forms/${formSlug}`;
  }, [existingForm?.form?.slug, isNew]);

  const qrCodeUrl = useMemo(() => {
    if (!shareLink) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(shareLink)}`;
  }, [shareLink]);

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedShareLink(true);
      toast.success("Share link copied");
      setTimeout(() => setCopiedShareLink(false), 1800);
    } catch (error) {
      toast.error("Could not copy link");
    }
  };

  if (!isNew && isFetching) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 p-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-[520px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24 md:pb-0">
      
      {/* HEADER (Desktop & Mobile Top) */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shadow-sm">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition hover:text-slate-950 hover:bg-white"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>{isNew ? "New form" : "Editing"}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
                {status}
              </span>
            </div>
            <h1 className="truncate text-base font-medium leading-tight text-slate-950 md:text-lg">
              {title || "Untitled Form"}
            </h1>
          </div>
        </div>

        {/* DESKTOP ACTIONS (Hidden on mobile) */}
        <div className="hidden md:flex shrink-0 items-center gap-3 pl-4">
          {!isNew && (
            <Link
              href={`/dashboard/analytics/${formIdParam}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900",
                isSaving && "pointer-events-none opacity-50",
              )}
            >
              <BarChart3 className="mr-2 size-4" />
              Analytics
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving}
          >
            <Save className="mr-2 size-4" />
            {isSaving && status === "DRAFT" ? "Saving..." : "Save draft"}
          </Button>
          <Button
            size="sm"
            className="border border-slate-950 bg-slate-950 text-white shadow-sm transition-all hover:bg-white hover:text-slate-950"
            onClick={() => handleSave("PUBLISHED")}
            disabled={isSaving}
          >
            <Send className="mr-2 size-4" />
            {isSaving && status === "PUBLISHED" ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "mx-auto grid max-w-[1600px] gap-6 p-4 md:p-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] transition-opacity duration-300",
          isSaving && "pointer-events-none opacity-60",
        )}
      >
        
        {/* 🚀 LEFT TOOLBOX (Hidden on mobile if Preview is toggled) */}
        <aside className={cn(
          "h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm order-2 lg:order-1 lg:block",
          showMobilePreview ? "hidden" : "block"
        )}>
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="size-4" />
            Field toolbox
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {FIELD_TYPES.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <button
                  key={fieldType.value}
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleAddField(fieldType.value)}
                  className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white disabled:opacity-50"
                >
                  <Icon className="size-4 text-slate-400" />
                  {fieldType.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* 🚀 MAIN EDITOR AREA (Hidden on mobile if Preview is toggled) */}
        <main className={cn(
          "space-y-6 order-1 lg:order-2 lg:block",
          showMobilePreview ? "hidden" : "block"
        )}>
          
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_180px_180px]">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</span>
                <Input
                  disabled={isSaving}
                  value={title}
                  onChange={(event) => dispatch(updateMetadata({ title: event.target.value }))}
                  className="h-11 border-slate-200 bg-slate-50 text-lg font-medium focus:bg-white"
                  placeholder="Form title"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</span>
                <select
                  disabled={isSaving}
                  value={category || ""}
                  onChange={(event) => dispatch(updateMetadata({ category: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white disabled:opacity-50"
                >
                  <option value="">None</option>
                  <option value="Education">Education</option>
                  <option value="Feedback">Feedback</option>
                  <option value="HR & Recruiting">HR & Recruiting</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Visibility</span>
                <select
                  disabled={isSaving}
                  value={visibility}
                  onChange={(event) => dispatch(updateMetadata({ visibility: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white disabled:opacity-50"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="UNLISTED">Unlisted</option>
                </select>
              </label>
            </div>

            <label className="mt-6 block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</span>
              <textarea
                disabled={isSaving}
                value={description}
                onChange={(event) => dispatch(updateMetadata({ description: event.target.value }))}
                className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white disabled:opacity-50"
                placeholder="A short note for people filling out this form"
              />
            </label>

            <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 md:grid-cols-4">
              <label className="space-y-2 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Palette className="size-3" /> Theme
                </span>
                <select
                  disabled={isSaving}
                  value={theme || "light"}
                  onChange={(event) => dispatch(updateMetadata({ theme: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white disabled:opacity-50"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="neon">Neon Cyberpunk</option>
                </select>
              </label>

              <div className="space-y-2 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expire form</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={isSaving}
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start text-left font-medium border-slate-200 bg-slate-50 hover:bg-white",
                        !editorState.expiresAt && "text-slate-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {editorState.expiresAt ? format(new Date(editorState.expiresAt), "PPP") : "No expiration"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editorState.expiresAt ? new Date(editorState.expiresAt) : undefined}
                      onSelect={(date) => dispatch(updateMetadata({ expiresAt: date ? date.toISOString() : null }))}
                      initialFocus
                    />
                    {editorState.expiresAt && (
                      <div className="p-2 border-t border-slate-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-slate-500 hover:text-slate-900"
                          onClick={() => dispatch(updateMetadata({ expiresAt: null }))}
                        >
                          Clear expiration
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <label className="space-y-2 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Max responses</span>
                <Input
                  disabled={isSaving}
                  type="number"
                  min="1"
                  value={editorState.maxResponses || ""}
                  onChange={(event) => dispatch(updateMetadata({ maxResponses: event.target.value ? parseInt(event.target.value, 10) : null }))}
                  className="h-11 w-full border-slate-200 bg-slate-50 focus:bg-white"
                  placeholder="Unlimited"
                />
              </label>

              <label className="space-y-2 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</span>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    disabled={isSaving}
                    type="password"
                    value={password || ""}
                    onChange={(event) => dispatch(updateMetadata({ password: event.target.value }))}
                    className="h-11 w-full pl-9 border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="None"
                  />
                </div>
              </label>
            </div>
          </section>

          {!isNew && (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900">Share form</div>
              <p className="mb-4 text-sm font-medium text-slate-500">
                {visibility === "UNLISTED" ? "Unlisted forms are accessible only through this link." : "Public forms appear in discovery."}
              </p>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="h-11 border-slate-200 bg-slate-50 font-medium text-slate-600" />
                <Button type="button" variant="outline" className="h-11 border-slate-200 bg-white" onClick={handleCopyShareLink}>
                  {copiedShareLink ? "Copied" : "Copy"}
                </Button>
              </div>
              {status !== "PUBLISHED" && (
                <p className="mt-3 text-xs font-medium text-amber-600">Publish the form to activate this link.</p>
              )}
            </section>
          )}

          <section className="space-y-4">
            {fields.map((field, index) => (
              <article
                key={field.id}
                onClick={() => dispatch(setActiveField(field.id))}
                className={cn(
                  "group rounded-[2rem] border bg-white p-6 shadow-sm transition-all duration-300",
                  activeField?.id === field.id
                    ? "border-slate-950 ring-1 ring-slate-950 scale-[1.01]"
                    : "border-slate-200 hover:border-slate-400",
                )}
              >
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-950 border border-slate-200">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-4 w-full">
                    <div className="grid gap-4 md:grid-cols-[1fr_200px]">
                      <Input
                        disabled={isSaving}
                        value={field.label}
                        onChange={(event) => dispatch(updateField({ id: field.id, updates: { label: event.target.value } }))}
                        className="h-11 border-slate-200 bg-slate-50 font-medium focus:bg-white"
                        placeholder="Question label"
                      />
                      <select
                        disabled={isSaving}
                        value={field.type}
                        onChange={(event) => handleFieldTypeChange(field, event.target.value)}
                        className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white disabled:opacity-50"
                      >
                        {FIELD_TYPES.map((fieldType) => (
                          <option key={fieldType.value} value={fieldType.value}>{fieldType.label}</option>
                        ))}
                      </select>
                    </div>

                    {OPTION_FIELD_TYPES.has(field.type) && (
                      <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                        {(field.options || []).map((option, optionIndex) => (
                          <div key={`${field.id}-${optionIndex}`} className="flex items-center gap-2">
                            <Input
                              disabled={isSaving}
                              value={option}
                              onChange={(event) => handleOptionChange(field, optionIndex, event.target.value)}
                              className="h-10 border-slate-200 bg-white"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <Button
                              disabled={isSaving}
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(field, optionIndex)}
                            >
                              <Trash2 className="size-4 text-slate-400 hover:text-red-500 transition-colors" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          disabled={isSaving}
                          variant="outline"
                          size="sm"
                          className="bg-white border-slate-200"
                          onClick={() => handleAddOption(field)}
                        >
                          <Plus className="mr-2 size-4 text-slate-400" />
                          Add option
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 w-full md:w-auto justify-end border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                    <Button disabled={isSaving || index === 0} variant="ghost" size="icon" onClick={() => moveField(index, -1)}>
                      <ChevronUp className="size-5 text-slate-400" />
                    </Button>
                    <Button disabled={isSaving || index === fields.length - 1} variant="ghost" size="icon" onClick={() => moveField(index, 1)}>
                      <ChevronDown className="size-5 text-slate-400" />
                    </Button>
                    <Button disabled={isSaving} variant="ghost" size="icon" onClick={() => dispatch(removeField(field.id))}>
                      <Trash2 className="size-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <GripVertical className="size-4" />
                    {fieldTypeLabel(field.type)}
                  </div>
                  <label className={cn("flex items-center gap-2 text-sm font-medium text-slate-700", isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
                    <input
                      disabled={isSaving}
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) => dispatch(updateField({ id: field.id, updates: { required: event.target.checked } }))}
                      className="size-4 rounded border-slate-300 accent-slate-950"
                    />
                    Required
                  </label>
                </div>
              </article>
            ))}

            {fields.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-950">
                  <Plus className="size-6" />
                </div>
                <h2 className="text-lg font-medium text-slate-950">Start with a field</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">Choose a field type from the toolbox to build the form.</p>
              </div>
            )}
          </section>
        </main>

        {/* 🚀 RIGHT PREVIEW SIDEBAR (Takes over the screen on mobile if toggled) */}
        <aside className={cn(
          "h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm order-3 lg:order-3 lg:block",
          showMobilePreview ? "block" : "hidden"
        )}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950 text-sm uppercase tracking-wider">Preview</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">Current respondent view</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">
              {fields.length} fields
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <h3 className="text-lg font-medium text-slate-950">{title || "Untitled Form"}</h3>
            {description && <p className="mt-2 text-sm font-medium text-slate-500">{description}</p>}
            
            <div className="mt-6 space-y-6">
              {fields.slice(0, 4).map((field) => (
                <div key={field.id} className="space-y-3">
                  <div className="text-sm font-medium text-slate-800">
                    {field.label || "New Question"} {field.required && <span className="text-red-500">*</span>}
                  </div>
                  {OPTION_FIELD_TYPES.has(field.type) ? (
                    <div className="space-y-2">
                      {(field.options || ["Option 1"]).slice(0, 3).map((option, index) => (
                        <div key={`${field.id}-preview-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
                          <span className="size-3.5 rounded-full border border-slate-300" />
                          {option}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-11 rounded-lg border border-slate-200 bg-white shadow-sm" />
                  )}
                </div>
              ))}
              {fields.length > 4 && (
                <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 pt-4 border-t border-slate-200">
                  +{fields.length - 4} more fields
                </div>
              )}
              {fields.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm font-medium text-slate-400 bg-white">
                  Preview appears as you add fields.
                </div>
              )}
            </div>
          </div>
        </aside>

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-slate-200 bg-white px-4 pb-2 pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
        <button
          onClick={() => {
            setShowMobilePreview(!showMobilePreview);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
            showMobilePreview ? "text-slate-950" : "text-slate-500 hover:text-slate-900"
          )}
        >
          {/* 🚀 Swaps icon and text so the user knows they can switch back to the Editor */}
          {showMobilePreview ? <Pencil className="size-5" /> : <Eye className="size-5" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {showMobilePreview ? "Editor" : "Preview"}
          </span>
        </button>

        <button
          onClick={() => handleSave("DRAFT")}
          disabled={isSaving}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50"
        >
          <Save className="size-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Draft</span>
        </button>
          
        <button
          onClick={() => handleSave("PUBLISHED")}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-6 py-2.5 text-white shadow-sm transition-colors hover:bg-white hover:text-slate-950 disabled:opacity-50"
        >
          <Send className="size-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Publish</span>
        </button>
      </nav>

    </div>
  );
}