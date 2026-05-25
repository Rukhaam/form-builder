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
      toast.error(error.message || "Could not save this form");
    },
  });

  // 🚀 Derived state to handle both tRPC v4 and v5 syntax safely
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
          category: existingForm.form.category,
          theme: existingForm.form.theme,
          maxResponses: existingForm.form.maxResponses,
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
  };

  const handleFieldTypeChange = (field, type) => {
    dispatch(
      updateField({
        id: field.id,
        updates: {
          type,
          options: emptyOptionsForType(type),
        },
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
      <div className="mx-auto max-w-6xl space-y-5">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-[520px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="-m-0 min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,#dff7ef,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] text-slate-950">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/50 bg-white/70 px-8 shadow-sm backdrop-blur-xl">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/75 text-slate-500 shadow-sm transition hover:text-slate-950 hover:bg-white"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>{isNew ? "New form" : "Editing form"}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                {status}
              </span>
            </div>
            <h1 className="truncate text-lg font-semibold leading-tight text-slate-950">
              {title || "Untitled Form"}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 pl-4">
          {!isNew && (
            <Link
              href={`/dashboard/analytics/${formIdParam}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "bg-white/80 shadow-sm",
                isSaving && "pointer-events-none opacity-50",
              )}
            >
              Analytics
            </Link>
          )}
          {/* 🚀 Save Buttons Disabled during Save */}
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 shadow-sm"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving}
          >
            <Save className="mr-2 size-4" />
            {isSaving && status === "DRAFT" ? "Saving..." : "Save draft"}
          </Button>
          <Button
            size="sm"
            className="bg-slate-950 text-white shadow-sm hover:bg-slate-800"
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
          "grid gap-8 p-6 lg:grid-cols-[260px_minmax(0,1fr)_320px] transition-opacity duration-300",
          isSaving && "pointer-events-none opacity-60",
        )}
      >
        <aside className="h-fit rounded-2xl border border-white/70 bg-white/65 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="size-4 text-emerald-600" />
            Field toolbox
          </div>
          <div className="grid gap-2">
            {FIELD_TYPES.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <button
                  key={fieldType.value}
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleAddField(fieldType.value)}
                  className="flex h-11 items-center gap-3 rounded-xl border border-white/70 bg-white/70 px-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Icon className="size-4 text-slate-500" />
                  {fieldType.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="space-y-5">
          <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-[1fr_180px_180px]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Title
                </span>
                <Input
                  disabled={isSaving}
                  value={title}
                  onChange={(event) =>
                    dispatch(updateMetadata({ title: event.target.value }))
                  }
                  className="h-11 border-white/80 bg-white/80 text-lg font-semibold"
                  placeholder="Form title"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Category (Template)
                </span>
                <select
                  disabled={isSaving}
                  value={category || ""}
                  onChange={(event) =>
                    dispatch(updateMetadata({ category: event.target.value }))
                  }
                  className="h-11 w-full rounded-lg border border-white/80 bg-white/80 px-3 text-sm font-medium outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:opacity-50"
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
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Visibility
                </span>
                <select
                  disabled={isSaving}
                  value={visibility}
                  onChange={(event) =>
                    dispatch(updateMetadata({ visibility: event.target.value }))
                  }
                  className="h-11 w-full rounded-lg border border-white/80 bg-white/80 px-3 text-sm font-medium outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:opacity-50"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="UNLISTED">Unlisted</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Description
              </span>
              <textarea
                disabled={isSaving}
                value={description}
                onChange={(event) =>
                  dispatch(updateMetadata({ description: event.target.value }))
                }
                className="min-h-20 w-full resize-none rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:opacity-50"
                placeholder="A short note for people filling out this form"
              />
            </label>

            <div className="mt-4 grid gap-4 border-t border-slate-200/60 pt-4 md:grid-cols-4">
              <label className="space-y-2 flex flex-col">
                <span className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1">
                  <Palette className="size-3" /> Theme
                </span>
                <select
                  disabled={isSaving}
                  value={theme || "light"}
                  onChange={(event) =>
                    dispatch(updateMetadata({ theme: event.target.value }))
                  }
                  className="h-11 w-full rounded-lg border border-white/80 bg-white/80 px-3 text-sm font-medium outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:opacity-50"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="neon">Neon Cyberpunk</option>
                </select>
              </label>

              <div className="space-y-2 flex flex-col">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Expire form on date
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={isSaving}
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start text-left font-normal border-white/80 bg-white/80 hover:bg-white/90",
                        !editorState.expiresAt && "text-slate-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editorState.expiresAt ? (
                        format(new Date(editorState.expiresAt), "PPP")
                      ) : (
                        <span>No expiration</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        editorState.expiresAt
                          ? new Date(editorState.expiresAt)
                          : undefined
                      }
                      onSelect={(date) =>
                        dispatch(
                          updateMetadata({
                            expiresAt: date ? date.toISOString() : null,
                          }),
                        )
                      }
                      initialFocus
                    />
                    {editorState.expiresAt && (
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-slate-500 hover:text-slate-900"
                          onClick={() =>
                            dispatch(updateMetadata({ expiresAt: null }))
                          }
                        >
                          Clear expiration
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <label className="space-y-2 flex flex-col">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Max responses
                </span>
                <Input
                  disabled={isSaving}
                  type="number"
                  min="1"
                  value={editorState.maxResponses || ""}
                  onChange={(event) =>
                    dispatch(
                      updateMetadata({
                        maxResponses: event.target.value
                          ? parseInt(event.target.value, 10)
                          : null,
                      }),
                    )
                  }
                  className="h-11 w-full border-white/80 bg-white/80"
                  placeholder="Unlimited"
                />
              </label>

              <label className="space-y-2 flex flex-col">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Password
                </span>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    disabled={isSaving}
                    type="password"
                    value={password || ""}
                    onChange={(event) =>
                      dispatch(updateMetadata({ password: event.target.value }))
                    }
                    className="h-11 w-full pl-9 border-white/80 bg-white/80"
                    placeholder="Leave blank for none"
                  />
                </div>
              </label>
            </div>
          </section>
          {!isNew && (
            <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
              <div className="mb-2 text-sm font-semibold text-slate-900">
                Share form
              </div>
              <p className="mb-4 text-xs text-slate-500">
                {visibility === "UNLISTED"
                  ? "Unlisted forms are accessible only through this direct link or QR code."
                  : "Public forms appear in discovery and are also accessible through this direct link or QR code."}
              </p>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="h-11 border-white/80 bg-white/80 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 bg-white/80"
                  onClick={handleCopyShareLink}
                >
                  {copiedShareLink ? "Copied" : "Copy"}
                </Button>
              </div>
              {status !== "PUBLISHED" && (
                <p className="mt-2 text-xs text-amber-600">
                  Publish the form to activate this link.
                </p>
              )}
              {qrCodeUrl && (
                <div className="mt-4 rounded-xl border border-white/70 bg-white/80 p-3">
                  <img
                    src={qrCodeUrl}
                    alt="Form QR code"
                    className="mx-auto size-44 rounded-lg"
                  />
                </div>
              )}
            </section>
          )}

          <section className="space-y-3">
            {fields.map((field, index) => (
              <article
                key={field.id}
                onClick={() => dispatch(setActiveField(field.id))}
                className={cn(
                  "group rounded-2xl border bg-white/72 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl transition",
                  activeField?.id === field.id
                    ? "border-emerald-300 ring-4 ring-emerald-100"
                    : "border-white/70 hover:border-slate-200",
                )}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex h-10 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                      <Input
                        disabled={isSaving}
                        value={field.label}
                        onChange={(event) =>
                          dispatch(
                            updateField({
                              id: field.id,
                              updates: { label: event.target.value },
                            }),
                          )
                        }
                        className="h-10 border-white/80 bg-white/80 font-medium"
                        placeholder="Question label"
                      />
                      <select
                        disabled={isSaving}
                        value={field.type}
                        onChange={(event) =>
                          handleFieldTypeChange(field, event.target.value)
                        }
                        className="h-10 rounded-lg border border-white/80 bg-white/80 px-3 text-sm font-medium outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:opacity-50"
                      >
                        {FIELD_TYPES.map((fieldType) => (
                          <option key={fieldType.value} value={fieldType.value}>
                            {fieldType.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {OPTION_FIELD_TYPES.has(field.type) && (
                      <div className="space-y-2 rounded-xl border border-white/70 bg-white/55 p-3">
                        {(field.options || []).map((option, optionIndex) => (
                          <div
                            key={`${field.id}-${optionIndex}`}
                            className="flex items-center gap-2"
                          >
                            <Input
                              disabled={isSaving}
                              value={option}
                              onChange={(event) =>
                                handleOptionChange(
                                  field,
                                  optionIndex,
                                  event.target.value,
                                )
                              }
                              className="h-9 border-white/80 bg-white/80"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <Button
                              disabled={isSaving}
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                handleRemoveOption(field, optionIndex)
                              }
                            >
                              <Trash2 className="size-4 text-slate-500" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          disabled={isSaving}
                          variant="outline"
                          size="sm"
                          className="bg-white/70"
                          onClick={() => handleAddOption(field)}
                        >
                          <Plus className="mr-2 size-4" />
                          Add option
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      disabled={isSaving || index === 0}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveField(index, -1)}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      disabled={isSaving || index === fields.length - 1}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveField(index, 1)}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      disabled={isSaving}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => dispatch(removeField(field.id))}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <GripVertical className="size-4" />
                    {fieldTypeLabel(field.type)}
                  </div>
                  <label
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium text-slate-700",
                      isSaving
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer",
                    )}
                  >
                    <input
                      disabled={isSaving}
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) =>
                        dispatch(
                          updateField({
                            id: field.id,
                            updates: { required: event.target.checked },
                          }),
                        )
                      }
                      className="size-4 rounded border-slate-300 accent-slate-950"
                    />
                    Required
                  </label>
                </div>
              </article>
            ))}

            {fields.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/55 p-12 text-center shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Plus className="size-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Start with a field
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a field type from the toolbox to build the form.
                </p>
              </div>
            )}
          </section>
        </main>

        <aside className="h-fit rounded-2xl border border-white/70 bg-white/65 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">Preview</h2>
              <p className="text-sm text-slate-500">Current respondent view</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {fields.length} fields
            </span>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
            <h3 className="text-xl font-bold text-slate-950">
              {title || "Untitled Form"}
            </h3>
            {description && (
              <p className="mt-2 text-sm text-slate-500">{description}</p>
            )}
            <div className="mt-5 space-y-4">
              {fields.slice(0, 4).map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="text-sm font-medium text-slate-800">
                    {field.label || "New Question"}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </div>
                  {OPTION_FIELD_TYPES.has(field.type) ? (
                    <div className="space-y-2">
                      {(field.options || ["Option 1"])
                        .slice(0, 3)
                        .map((option, index) => (
                          <div
                            key={`${field.id}-preview-${index}`}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                          >
                            <span className="size-3 rounded-full border border-slate-300" />
                            {option}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="h-10 rounded-lg border border-slate-200 bg-white" />
                  )}
                </div>
              ))}
              {fields.length > 4 && (
                <div className="text-center text-xs font-medium text-slate-500">
                  +{fields.length - 4} more fields
                </div>
              )}
              {fields.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                  Preview appears as you add fields.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
