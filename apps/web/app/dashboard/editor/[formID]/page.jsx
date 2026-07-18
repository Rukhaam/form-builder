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
  Brush,
  Eye,
  Type,
  Pencil,
  UserCheck,
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

const THEME_COLOR_PRESETS = [
  {
    id: "paper",
    label: "Paper",
    swatch: "bg-[#f7f5ef]",
    page: "bg-[#f7f5ef]",
    panel: "bg-white",
    canvas: "bg-white",
    field: "bg-white",
    soft: "bg-[#f1eee6]",
    border: "border-stone-200",
    softBorder: "border-stone-100",
    text: "text-stone-950",
    muted: "text-stone-500",
    input: "border-stone-200 bg-white focus:border-stone-400",
    choice: "border-stone-200 bg-white",
    accent: "bg-stone-950",
    accentText: "text-white",
    accentBorder: "border-stone-950",
    button: "bg-stone-950 text-white hover:bg-stone-800",
  },
  {
    id: "sage",
    label: "Sage",
    swatch: "bg-[#dfe8dc]",
    page: "bg-[#f3f6f1]",
    panel: "bg-white",
    canvas: "bg-[#f8faf6]",
    field: "bg-white",
    soft: "bg-[#e7eee3]",
    border: "border-[#d4dfce]",
    softBorder: "border-[#e7eee3]",
    text: "text-[#172014]",
    muted: "text-[#687462]",
    input: "border-[#d4dfce] bg-white focus:border-[#7d9272]",
    choice: "border-[#d4dfce] bg-white",
    accent: "bg-[#24351e]",
    accentText: "text-white",
    accentBorder: "border-[#24351e]",
    button: "bg-[#24351e] text-white hover:bg-[#304928]",
  },
  {
    id: "blueprint",
    label: "Blue",
    swatch: "bg-[#dce7f5]",
    page: "bg-[#f2f6fb]",
    panel: "bg-white",
    canvas: "bg-[#f8fbff]",
    field: "bg-white",
    soft: "bg-[#e8f0f8]",
    border: "border-[#d4e1ef]",
    softBorder: "border-[#e7eef6]",
    text: "text-[#101d2d]",
    muted: "text-[#607086]",
    input: "border-[#d4e1ef] bg-white focus:border-[#647c9b]",
    choice: "border-[#d4e1ef] bg-white",
    accent: "bg-[#18314f]",
    accentText: "text-white",
    accentBorder: "border-[#18314f]",
    button: "bg-[#18314f] text-white hover:bg-[#24496f]",
  },
  {
    id: "rose",
    label: "Rose",
    swatch: "bg-[#f2dedb]",
    page: "bg-[#fbf3f1]",
    panel: "bg-white",
    canvas: "bg-[#fff8f6]",
    field: "bg-white",
    soft: "bg-[#f5e7e4]",
    border: "border-[#ead4d0]",
    softBorder: "border-[#f0e0dd]",
    text: "text-[#2b1715]",
    muted: "text-[#806964]",
    input: "border-[#ead4d0] bg-white focus:border-[#a9766d]",
    choice: "border-[#ead4d0] bg-white",
    accent: "bg-[#4a231d]",
    accentText: "text-white",
    accentBorder: "border-[#4a231d]",
    button: "bg-[#4a231d] text-white hover:bg-[#65342c]",
  },
  {
    id: "ink",
    label: "Ink",
    swatch: "bg-[#111111]",
    page: "bg-[#f5f5f3]",
    panel: "bg-white",
    canvas: "bg-[#fafafa]",
    field: "bg-white",
    soft: "bg-neutral-100",
    border: "border-neutral-200",
    softBorder: "border-neutral-100",
    text: "text-neutral-950",
    muted: "text-neutral-500",
    input: "border-neutral-200 bg-white focus:border-neutral-600",
    choice: "border-neutral-200 bg-white",
    accent: "bg-neutral-950",
    accentText: "text-white",
    accentBorder: "border-neutral-950",
    button: "bg-neutral-950 text-white hover:bg-neutral-800",
  },
];

const THEME_FONT_PRESETS = [
  { id: "sans", label: "Sans", className: "font-sans" },
  { id: "serif", label: "Serif", className: "font-serif" },
  { id: "mono", label: "Mono", className: "font-mono" },
];

const LEGACY_THEME_MAP = {
  light: { colorId: "paper", fontId: "sans" },
  dark: { colorId: "ink", fontId: "sans" },
  neon: { colorId: "blueprint", fontId: "mono" },
  default: { colorId: "paper", fontId: "sans" },
};

function hexToHSL(hex) {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function CustomThemeStyle({ hslString }) {
  if (!hslString || !hslString.startsWith("hsl(")) return null;
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  const l = parseInt(match[3], 10);

  const css = `
    .theme-custom-swatch { background-color: ${hslString} !important; }
    .theme-custom-page { background-color: hsl(${h},${s}%,96%) !important; }
    .theme-custom-panel { background-color: white !important; }
    .theme-custom-canvas { background-color: hsl(${h},${s}%,98%) !important; }
    .theme-custom-field { background-color: white !important; }
    .theme-custom-soft { background-color: hsl(${h},${s}%,92%) !important; }
    .theme-custom-border { border-color: hsl(${h},${s}%,85%) !important; }
    .theme-custom-softBorder { border-color: hsl(${h},${s}%,92%) !important; }
    .theme-custom-text { color: hsl(${h},${s}%,15%) !important; }
    .theme-custom-muted { color: hsl(${h},${s}%,40%) !important; }
    .theme-custom-input { border-color: hsl(${h},${s}%,85%) !important; background-color: white !important; }
    .theme-custom-input:focus { border-color: ${hslString} !important; }
    .theme-custom-choice { border-color: hsl(${h},${s}%,85%) !important; background-color: white !important; }
    .theme-custom-accent { background-color: ${hslString} !important; }
    .theme-custom-accentText { color: white !important; }
    .theme-custom-accentBorder { border-color: ${hslString} !important; }
    .theme-custom-button { background-color: ${hslString} !important; color: white !important; }
    .theme-custom-button:hover { opacity: 0.9 !important; }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function generateCustomTheme(hslString) {
  return {
    id: hslString,
    label: "Custom",
    swatch: "theme-custom-swatch",
    page: "theme-custom-page",
    panel: "theme-custom-panel",
    canvas: "theme-custom-canvas",
    field: "theme-custom-field",
    soft: "theme-custom-soft",
    border: "theme-custom-border",
    softBorder: "theme-custom-softBorder",
    text: "theme-custom-text",
    muted: "theme-custom-muted",
    input: "theme-custom-input",
    choice: "theme-custom-choice",
    accent: "theme-custom-accent",
    accentText: "theme-custom-accentText",
    accentBorder: "theme-custom-accentBorder",
    button: "theme-custom-button",
  };
}

function parseThemeValue(themeValue) {
  if (!themeValue) return { colorId: "paper", fontId: "sans" };
  if (LEGACY_THEME_MAP[themeValue]) return LEGACY_THEME_MAP[themeValue];

  const [colorId, fontId] = String(themeValue).split(":");
  const isValidColor =
    colorId.startsWith("hsl(") ||
    THEME_COLOR_PRESETS.some((preset) => preset.id === colorId);
  return {
    colorId: isValidColor ? colorId : "paper",
    fontId: THEME_FONT_PRESETS.some((preset) => preset.id === fontId)
      ? fontId
      : "sans",
  };
}

function serializeThemeValue(themeSelection) {
  return `${themeSelection.colorId}:${themeSelection.fontId}`;
}

function getThemeDesign(themeValue) {
  const selection = parseThemeValue(themeValue);
  let color;
  if (selection.colorId.startsWith("hsl(")) {
    color = generateCustomTheme(selection.colorId);
  } else {
    color =
      THEME_COLOR_PRESETS.find((preset) => preset.id === selection.colorId) ||
      THEME_COLOR_PRESETS[0];
  }

  return {
    selection,
    color,
    font:
      THEME_FONT_PRESETS.find((preset) => preset.id === selection.fontId) ||
      THEME_FONT_PRESETS[0],
  };
}

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

function PreviewFieldControl({ field, design }) {
  if (OPTION_FIELD_TYPES.has(field.type)) {
    return (
      <div className="grid gap-2">
        {(field.options || ["Option 1", "Option 2"])
          .slice(0, 3)
          .map((option) => (
            <div
              key={option}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium",
                design.color.choice,
                design.color.muted,
              )}
            >
              <span
                className={cn(
                  "size-3.5 shrink-0 border",
                  field.type === "checkbox" || field.type === "multi_select"
                    ? "rounded"
                    : "rounded-full",
                  design.color.border,
                )}
              />
              <span className="truncate">{option}</span>
            </div>
          ))}
      </div>
    );
  }

  if (field.type === "long_text") {
    return <div className={cn("h-20 rounded-lg border", design.color.input)} />;
  }

  return <div className={cn("h-11 rounded-lg border", design.color.input)} />;
}

function LiveFormPreview({ title, description, fields, design }) {
  return (
    <div
      className={cn(
        "min-h-[520px] rounded-lg border p-4 transition-colors duration-300",
        design.color.page,
        design.color.border,
        design.font.className,
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-sm rounded-lg border p-5 transition-colors duration-300",
          design.color.panel,
          design.color.border,
        )}
      >
        <div
          className={cn(
            "mb-4 inline-flex rounded-lg px-3 py-1 text-xs font-medium",
            design.color.soft,
            design.color.muted,
          )}
        >
          Public form
        </div>
        <h3
          className={cn(
            "text-2xl font-semibold leading-tight",
            design.color.text,
          )}
        >
          {title || "Untitled Form"}
        </h3>
        {description ? (
          <p className={cn("mt-3 text-sm leading-6", design.color.muted)}>
            {description}
          </p>
        ) : null}

        <div className="mt-7 space-y-5">
          {fields.slice(0, 5).map((field, index) => (
            <div key={field.id} className="space-y-2">
              <label
                className={cn("block text-sm font-medium", design.color.text)}
              >
                {index + 1}. {field.label || "New Question"}
                {field.required && <span className="ml-1 opacity-50">*</span>}
              </label>
              <PreviewFieldControl field={field} design={design} />
            </div>
          ))}

          {fields.length === 0 && (
            <div
              className={cn(
                "rounded-lg border border-dashed py-10 text-center text-sm font-medium",
                design.color.border,
                design.color.muted,
              )}
            >
              Preview appears as you add fields.
            </div>
          )}
        </div>

        <button
          type="button"
          className={cn(
            "mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors",
            design.color.button,
          )}
        >
          Submit response
        </button>
      </div>
    </div>
  );
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
    coverImageUrl,
    theme,
    oneResponsePerPerson,
  } = editorState;

  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const { data: existingForm, isLoading: isFetching } =
    trpc.form.getFormEditor.useQuery(
      { formId: formIdParam },
      { enabled: !isNew && !!formIdParam },
    );

  // 🚀 FETCH CURRENT USAGE & LIMITS
  const { data: usageData } = trpc.billing.getUsageOverview.useQuery();

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
          oneResponsePerPerson: data.form.oneResponsePerPerson,
          category: data.form.category,
          coverImageUrl: data.form.coverImageUrl,
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
      if (error.data?.code === "PAYMENT_REQUIRED") {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-slate-900">
                {error.message}
              </span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push("/pricing");
                }}
                className="w-fit rounded-lg bg-slate-950 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-slate-800"
              >
                Upgrade to Pro
              </button>
            </div>
          ),
          {
            duration: 8000,
            style: { background: "#fff", border: "1px solid #e2e8f0" },
          },
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
          oneResponsePerPerson: existingForm.form.oneResponsePerPerson,
          category: existingForm.form.category,
          coverImageUrl: existingForm.form.coverImageUrl,
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

  const themeDesign = useMemo(() => getThemeDesign(theme), [theme]);

  const handleThemeColorChange = (colorId) => {
    dispatch(
      updateMetadata({
        theme: serializeThemeValue({
          ...themeDesign.selection,
          colorId,
        }),
      }),
    );
  };

  const handleThemeFontChange = (fontId) => {
    dispatch(
      updateMetadata({
        theme: serializeThemeValue({
          ...themeDesign.selection,
          fontId,
        }),
      }),
    );
  };

  const handleAddField = (type) => {
    const id = uuidv4();
    dispatch(addField({ id, type }));
    dispatch(setActiveField(id));

    setShowMobilePreview(false);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
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
      coverImageUrl: coverImageUrl || null,
      oneResponsePerPerson: oneResponsePerPerson ?? false,
      theme: serializeThemeValue(themeDesign.selection),
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
      <div className="mx-auto max-w-6xl space-y-4 bg-[#f7f5ef] p-6">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-[520px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-white pb-24 text-black md:pb-0 overflow-y-auto z-[100]">
      <CustomThemeStyle hslString={themeDesign.selection.colorId} />
      {/* HEADER (Desktop & Mobile Top) */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-r-4 border-black/10 bg-white px-4 md:px-8 mb-10 ">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white text-slate-500 transition hover:border-black/20 hover:text-slate-950"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase text-slate-500">
              <span>{isNew ? "New form" : "Editing"}</span>
              <span className="rounded-lg border border-black/5 bg-white px-2 py-0.5 text-slate-600">
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
            <>
              <Link
                href={`/dashboard/analytics/${formIdParam}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-black/10 bg-white hover:bg-[#f6f5f1] hover:text-slate-900",
                  isSaving && "pointer-events-none opacity-50",
                )}
              >
                <BarChart3 className="mr-2 size-4" />
                Analytics
              </Link>
              <Link
                href={`/dashboard/webhooks/${formIdParam}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-black/10 bg-white hover:bg-[#f6f5f1] hover:text-slate-900",
                  isSaving && "pointer-events-none opacity-50",
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 size-4"
                >
                  <path d="m18 16 4-4-4-4" />
                  <path d="m6 8-4 4 4 4" />
                  <path d="m14.5 4-5 16" />
                </svg>
                Webhooks
              </Link>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-black/10 bg-white hover:bg-[#f6f5f1] hover:text-slate-900"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving}
          >
            <Save className="mr-2 size-4" />
            {isSaving && status === "DRAFT" ? "Saving..." : "Save draft"}
          </Button>
          <Button
            size="sm"
            className="border border-slate-950 bg-slate-950 text-white transition-all hover:bg-white hover:text-slate-950"
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
          "mx-auto grid max-w-[1720px] gap-4 p-4 transition-opacity duration-300 md:p-12 lg:grid-cols-[220px_minmax(0,1fr)_360px]",
          isSaving && "pointer-events-none opacity-60",
        )}
      >
        {/* LEFT TOOLBOX (Hidden on mobile if Preview is toggled) */}
        <aside
          className={cn(
            "order-2 h-fit rounded-lg border border-black/5 bg-slate-50 p-3 lg:order-1 lg:sticky lg:top-24 lg:block",
            showMobilePreview ? "hidden" : "block",
          )}
        >
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
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
                  className="flex h-11 items-center gap-3 rounded-lg border border-black/5 bg-white px-3 text-left text-sm font-medium text-slate-700 transition hover:border-black/10 hover:bg-white disabled:opacity-50"
                >
                  <Icon className="size-4 text-slate-400" />
                  {fieldType.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN EDITOR AREA (Hidden on mobile if Preview is toggled) */}
        <main
          className={cn(
            "order-1 space-y-4 lg:order-2 lg:block",
            showMobilePreview ? "hidden" : "block",
          )}
        >
          <section className="rounded-lg border border-black/5 bg-slate-50 p-5 md:p-6">
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
                  className="h-11 border-black/5 bg-white text-lg font-medium focus:bg-white"
                  placeholder="Form title"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Category
                </span>
                <select
                  disabled={isSaving}
                  value={category || ""}
                  onChange={(event) =>
                    dispatch(updateMetadata({ category: event.target.value }))
                  }
                  className="h-11 w-full rounded-lg border border-black/5 bg-white px-3 text-sm font-medium outline-none transition focus:border-black/20 focus:bg-white disabled:opacity-50"
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
                  className="h-11 w-full rounded-lg border border-black/5 bg-white px-3 text-sm font-medium outline-none transition focus:border-black/20 focus:bg-white disabled:opacity-50"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="UNLISTED">Unlisted</option>
                </select>
              </label>
            </div>

            {/* Cover Image URL */}
            <label className="mt-6 block space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Cover Image URL
              </span>
              <Input
                disabled={isSaving}
                value={coverImageUrl || ""}
                onChange={(event) =>
                  dispatch(updateMetadata({ coverImageUrl: event.target.value }))
                }
                className="h-11 border-black/5 bg-white text-sm focus:bg-white"
                placeholder="https://images.unsplash.com/..."
              />
              {coverImageUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-black/5">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="h-32 w-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </label>

            <label className="mt-6 block space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Description
              </span>
              <textarea
                disabled={isSaving}
                value={description}
                onChange={(event) =>
                  dispatch(updateMetadata({ description: event.target.value }))
                }
                className="min-h-20 w-full resize-none rounded-lg border border-black/5 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-black/20 focus:bg-white disabled:opacity-50"
                placeholder="A short note for people filling out this form"
              />
            </label>

            <div className="mt-6 grid gap-4 border-t border-black/5 pt-6 md:grid-cols-3">
              <div className="space-y-2 flex flex-col">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Expire form
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={isSaving}
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start border-black/5 bg-white text-left font-medium hover:bg-white",
                        !editorState.expiresAt && "text-slate-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {editorState.expiresAt
                        ? format(new Date(editorState.expiresAt), "PPP")
                        : "No expiration"}
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
                      <div className="p-2 border-t border-slate-100">
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

              {/* 🚀 UPDATED MAX RESPONSES INPUT */}
              <label className="space-y-2 flex flex-col">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Max responses
                </span>
                <Input
                  disabled={isSaving}
                  type="number"
                  min="1"
                  value={editorState.maxResponses || ""}
                  onChange={(event) => {
                    // 1. If they clear the input, set to unlimited (null)
                    if (!event.target.value) {
                      dispatch(updateMetadata({ maxResponses: null }));
                      return;
                    }

                    const requestedMax = parseInt(event.target.value, 10);

                    // 2. Safely grab their limit from the backend (Fallback to 100 for Starter)
                    const planLimit = usageData?.responses?.limit ?? 100;
                    const isUnlimited =
                      usageData?.responses?.isUnlimited ?? false;

                    // 3. The Front-End Guard
                    if (!isUnlimited && requestedMax > planLimit) {
                      toast.error(
                        `Your current plan limits you to ${planLimit} responses. Upgrade to increase this!`,
                        {
                          icon: "🛑",
                          style: {
                            background: "#fff",
                            color: "#0f172a",
                            border: "1px solid #e2e8f0",
                          },
                        },
                      );

                      // Auto-cap it to their max allowed limit
                      dispatch(updateMetadata({ maxResponses: planLimit }));
                    } else {
                      // Otherwise, allow the requested number
                      dispatch(updateMetadata({ maxResponses: requestedMax }));
                    }
                  }}
                  className="h-11 w-full border-black/5 bg-white focus:bg-white"
                  placeholder={
                    usageData?.responses?.isUnlimited
                      ? "Unlimited"
                      : `Unlimited (up to ${usageData?.responses?.limit ?? 100})`
                  }
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
                    className="h-11 w-full border-black/5 bg-white pl-9 focus:bg-white"
                    placeholder="None"
                  />
                </div>
              </label>
            </div>

            <div className="mt-6 border-t border-black/5 pt-6">
              <label
                className={cn(
                  "flex items-center justify-between rounded-lg border bg-white px-4 py-3 transition",
                  oneResponsePerPerson
                    ? "border-slate-950"
                    : "border-black/5 hover:border-black/10",
                  isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg transition",
                      oneResponsePerPerson
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <UserCheck className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-950">
                      One response per person
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      Limit to one submission per IP address
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    disabled={isSaving}
                    type="checkbox"
                    checked={oneResponsePerPerson}
                    onChange={(event) =>
                      dispatch(
                        updateMetadata({
                          oneResponsePerPerson: event.target.checked,
                        }),
                      )
                    }
                    className="peer sr-only"
                  />
                  <div
                    className={cn(
                      "h-6 w-11 rounded-full border transition-colors",
                      oneResponsePerPerson
                        ? "border-slate-950 bg-slate-950"
                        : "border-black/10 bg-slate-200",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                      oneResponsePerPerson && "translate-x-5",
                    )}
                  />
                </div>
              </label>
            </div>
          </section>

          {!isNew && (
            <section className="rounded-lg border border-black/5 bg-slate-50 p-5">
              <div className="mb-2 text-sm font-semibold uppercase text-slate-900">
                Share form
              </div>
              <p className="mb-4 text-sm font-medium text-slate-500">
                {visibility === "UNLISTED"
                  ? "Unlisted forms are accessible only through this link."
                  : "Public forms appear in discovery."}
              </p>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="h-11 border-black/5 bg-white font-medium text-slate-600"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-black/10 bg-white"
                  onClick={handleCopyShareLink}
                >
                  {copiedShareLink ? "Copied" : "Copy"}
                </Button>
              </div>
              {status !== "PUBLISHED" && (
                <p className="mt-3 text-xs font-medium text-amber-600">
                  Publish the form to activate this link.
                </p>
              )}
            </section>
          )}

          <section className="space-y-4">
            {fields.map((field, index) => (
              <article
                key={field.id}
                onClick={() => dispatch(setActiveField(field.id))}
                className={cn(
                  "group rounded-lg border bg-slate-50 p-5 transition-all duration-300",
                  activeField?.id === field.id
                    ? "border-slate-950 bg-white"
                    : "border-black/5 hover:border-black/15",
                )}
              >
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/5 bg-white text-sm font-semibold text-slate-950">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-4 w-full">
                    <div className="grid gap-4 md:grid-cols-[1fr_200px]">
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
                        className="h-11 border-black/5 bg-white font-medium focus:bg-white"
                        placeholder="Question label"
                      />
                      <select
                        disabled={isSaving}
                        value={field.type}
                        onChange={(event) =>
                          handleFieldTypeChange(field, event.target.value)
                        }
                        className="h-11 rounded-lg border border-black/5 bg-white px-3 text-sm font-medium outline-none transition focus:border-black/20 focus:bg-white disabled:opacity-50"
                      >
                        {FIELD_TYPES.map((fieldType) => (
                          <option key={fieldType.value} value={fieldType.value}>
                            {fieldType.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {OPTION_FIELD_TYPES.has(field.type) && (
                      <div className="space-y-3 rounded-lg border border-black/5 bg-white p-4">
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
                              className="h-10 border-black/5 bg-white"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <Button
                              disabled={isSaving}
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveOption(field, optionIndex)
                              }
                            >
                              <Trash2 className="size-4 text-slate-400 hover:text-red-500 transition-colors" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          disabled={isSaving}
                          variant="outline"
                          size="sm"
                          className="border-black/10 bg-white"
                          onClick={() => handleAddOption(field)}
                        >
                          <Plus className="mr-2 size-4 text-slate-400" />
                          Add option
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 w-full md:w-auto justify-end border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                    <Button
                      disabled={isSaving || index === 0}
                      variant="ghost"
                      size="icon"
                      onClick={() => moveField(index, -1)}
                    >
                      <ChevronUp className="size-5 text-slate-400" />
                    </Button>
                    <Button
                      disabled={isSaving || index === fields.length - 1}
                      variant="ghost"
                      size="icon"
                      onClick={() => moveField(index, 1)}
                    >
                      <ChevronDown className="size-5 text-slate-400" />
                    </Button>
                    <Button
                      disabled={isSaving}
                      variant="ghost"
                      size="icon"
                      onClick={() => dispatch(removeField(field.id))}
                    >
                      <Trash2 className="size-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
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
              <div className="rounded-lg border border-dashed border-black/10 bg-slate-50 p-12 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg border border-black/5 bg-white text-slate-950">
                  <Plus className="size-6" />
                </div>
                <h2 className="text-lg font-medium text-slate-950">
                  Start with a field
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Choose a field type from the toolbox to build the form.
                </p>
              </div>
            )}
          </section>
        </main>

        {/* RIGHT PREVIEW SIDEBAR (Takes over the screen on mobile if toggled) */}
        <aside
          className={cn(
            "order-3 h-fit space-y-4 lg:order-3 lg:sticky lg:top-24 lg:block",
            showMobilePreview ? "block" : "hidden",
          )}
        >
          <section className="rounded-lg border border-black/5 bg-slate-50 p-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase text-slate-950">
                  Design
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {themeDesign.color.label} / {themeDesign.font.label}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  themeDesign.color.soft,
                  themeDesign.color.text,
                )}
              >
                <Brush className="size-4" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                  <Palette className="size-3.5" />
                  Colors
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {THEME_COLOR_PRESETS.map((preset) => {
                    const isActive =
                      themeDesign.selection.colorId === preset.id;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleThemeColorChange(preset.id)}
                        className={cn(
                          "flex h-12 flex-col items-center justify-center rounded-lg border bg-white text-[10px] font-medium text-slate-600 transition",
                          isActive
                            ? "border-slate-950"
                            : "border-black/5 hover:border-black/20",
                        )}
                        aria-label={`Use ${preset.label} colors`}
                      >
                        <span
                          className={cn(
                            "mb-1 size-4 rounded-full border border-black/10",
                            preset.swatch,
                          )}
                        />
                        {preset.label}
                      </button>
                    );
                  })}
                  <div className="relative">
                    <button
                      type="button"
                      className={cn(
                        "flex h-12 w-full flex-col items-center justify-center rounded-lg border bg-white text-[10px] font-medium text-slate-600 transition overflow-hidden",
                        themeDesign.selection.colorId.startsWith("hsl(")
                          ? "border-slate-950"
                          : "border-black/5 hover:border-black/20",
                      )}
                    >
                      <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => {
                          const { h, s, l } = hexToHSL(e.target.value);
                          handleThemeColorChange(`hsl(${h}, ${s}%, ${l}%)`);
                        }}
                      />
                      <span
                        className="mb-1 size-4 rounded-full border border-black/10 shadow-inner"
                        style={{
                          background: themeDesign.selection.colorId.startsWith(
                            "hsl(",
                          )
                            ? themeDesign.selection.colorId
                            : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                        }}
                      />
                      Custom
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                  <Type className="size-3.5" />
                  Typeface
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_FONT_PRESETS.map((fontPreset) => {
                    const isActive =
                      themeDesign.selection.fontId === fontPreset.id;

                    return (
                      <button
                        key={fontPreset.id}
                        type="button"
                        onClick={() => handleThemeFontChange(fontPreset.id)}
                        className={cn(
                          "h-10 rounded-lg border bg-white text-sm font-medium transition",
                          fontPreset.className,
                          isActive
                            ? "border-slate-950 text-slate-950"
                            : "border-black/5 text-slate-500 hover:border-black/20",
                        )}
                      >
                        {fontPreset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-black/5 bg-white p-3">
                <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{fields.length} fields</span>
                  <span>{status}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    themeDesign.color.accent,
                    themeDesign.color.soft,
                    themeDesign.color.panel,
                    themeDesign.color.canvas,
                  ].map((colorClass, index) => (
                    <span
                      key={`${colorClass}-${index}`}
                      className={cn(
                        "h-6 rounded-md border border-black/5",
                        colorClass,
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-black/5 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase text-slate-950">
                  Live preview
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Respondent view
                </p>
              </div>
              <Eye className="size-4 text-slate-500" />
            </div>

            <LiveFormPreview
              title={title}
              description={description}
              fields={fields}
              design={themeDesign}
            />
          </section>
        </aside>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-black/5 bg-white px-4 pb-2 pt-2 md:hidden">
        <button
          onClick={() => {
            setShowMobilePreview(!showMobilePreview);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
            showMobilePreview
              ? "text-slate-950"
              : "text-slate-500 hover:text-slate-900",
          )}
        >
          {showMobilePreview ? (
            <Pencil className="size-5" />
          ) : (
            <Palette className="size-5" />
          )}
          <span className="text-[10px] font-semibold uppercase">
            {showMobilePreview ? "Editor" : "Design"}
          </span>
        </button>

        <button
          onClick={() => handleSave("DRAFT")}
          disabled={isSaving}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50"
        >
          <Save className="size-5" />
          <span className="text-[10px] font-semibold uppercase">Draft</span>
        </button>

        <button
          onClick={() => handleSave("PUBLISHED")}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-950 bg-slate-950 px-6 py-2.5 text-white transition-colors hover:bg-white hover:text-slate-950 disabled:opacity-50"
        >
          <Send className="size-4" />
          <span className="text-xs font-semibold uppercase">Publish</span>
        </button>
      </nav>
    </div>
  );
}
