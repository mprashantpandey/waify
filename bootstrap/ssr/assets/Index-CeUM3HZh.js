import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, router, useForm } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { RefreshCw, Eye, Sparkles, FileText, Filter, Search, X, Tag, Check, Copy, Globe, Send, MoreVertical, Edit, Archive, Trash2, Plus, ExternalLink, Phone, Reply, ArrowLeft, Video, Image, CheckCheck, Upload, MessageSquareText, User } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import { M as Modal, D as Drawer } from "./Elements-EbyZDnT_.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
const categoryTone = (category) => {
  const normalized = category.toLowerCase();
  if (normalized.includes("marketing")) return "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300";
  if (normalized.includes("utility")) return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
  if (normalized.includes("authentication")) return "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300";
  return "bg-gray-50 text-gray-700 dark:bg-slate-700 dark:text-slate-200";
};
const variableNumbersFromText = (text) => {
  const numbers = (text.match(/\{\{(\d+)\}\}/g) || []).map((value) => Number(value.match(/\d+/)?.[0] || 0)).filter(Boolean);
  return Array.from(new Set(numbers)).sort((a, b) => a - b);
};
const mediaAcceptForHeader = (type) => {
  if (type === "IMAGE") return "image/jpeg,image/jpg,image/png";
  if (type === "VIDEO") return "video/mp4";
  if (type === "DOCUMENT") return "application/pdf";
  return "";
};
function TemplatePhonePreview({ template }) {
  const body = template.body_text || "Template message";
  const parts = body.split(/(\{\{\d+\}\})/g);
  return /* @__PURE__ */ jsxs("div", { className: "relative mx-auto w-[260px] origin-top", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-[28px] bg-[#1A1A2E] p-2 shadow-pop ring-1 ring-black/10 dark:ring-white/10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex h-9 items-center gap-2 rounded-[20px] bg-[#075E54] px-3 text-white", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("div", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold", children: "W" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold leading-tight", children: "Zyptos Business" }),
          /* @__PURE__ */ jsx("div", { className: "text-[9px] text-white/70", children: "online" })
        ] }),
        /* @__PURE__ */ jsx(Video, { className: "h-3 w-3" }),
        /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "chat-bg min-h-[280px] rounded-b-[20px] p-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative max-w-[88%] rounded-bl-lg rounded-br-lg rounded-tl-md rounded-tr-lg bg-white p-2.5 text-waify-text shadow-sm dark:bg-[#202C33] dark:text-[#E9EDEF]", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-2 -mx-1 -mt-1 flex aspect-[16/9] items-center justify-center rounded-md bg-gradient-to-br from-waify-green to-waify-green-dark text-white", children: /* @__PURE__ */ jsx(Image, { className: "h-5 w-5 opacity-80" }) }),
          /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap text-[12px] leading-snug", children: parts.map((part, index) => /^\{\{\d+\}\}$/.test(part) ? /* @__PURE__ */ jsx("span", { className: "rounded bg-blue-100 px-1 font-mono text-[11px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300", children: part }, `${part}-${index}`) : /* @__PURE__ */ jsx("span", { children: part }, `${part}-${index}`)) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center justify-end gap-0.5 text-[9px] text-gray-400 dark:text-[#8696A0]", children: [
            "10:24 AM ",
            /* @__PURE__ */ jsx(CheckCheck, { className: "h-2.5 w-2.5 text-blue-500" })
          ] })
        ] }),
        template.has_buttons && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex w-[88%] items-center justify-center gap-1 rounded-md bg-white py-1.5 text-[11px] font-medium text-blue-600 shadow-sm dark:bg-[#2A3942] dark:text-[#53BDEB]", children: [
            /* @__PURE__ */ jsx(Reply, { className: "h-2.5 w-2.5" }),
            "Quick reply"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex w-[88%] items-center justify-center gap-1 rounded-md bg-white py-1.5 text-[11px] font-medium text-blue-600 shadow-sm dark:bg-[#2A3942] dark:text-[#53BDEB]", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }),
            "Visit website"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-1 h-1 w-12 -translate-x-1/2 rounded-full bg-white/20" })
  ] });
}
function TemplateBuilderDrawer({
  open,
  onClose,
  template,
  connections
}) {
  const { toast } = useToast();
  const editing = Boolean(template && template.id > 0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef(null);
  const { data, setData, errors, reset } = useForm({
    whatsapp_connection_id: template?.connection?.id?.toString() || connections?.[0]?.id?.toString() || "",
    name: template?.name || "",
    language: template?.language || "en_US",
    category: template?.category || "UTILITY",
    header_type: template?.header_type || "NONE",
    header_text: template?.header_text || "",
    header_media_url: template?.header_media_url || "",
    body_text: template?.body_text || "Hi {{1}}, ",
    body_examples: [],
    footer_text: template?.footer_text || "",
    buttons: template?.buttons || []
  });
  const previewTemplate = useMemo(() => ({
    id: template?.id || 0,
    slug: template?.slug || "preview",
    name: data.name || "new_template",
    language: data.language,
    category: data.category,
    status: template?.status || "pending",
    body_text: data.body_text,
    header_type: data.header_type,
    header_text: data.header_text,
    header_media_url: data.header_media_url,
    footer_text: data.footer_text,
    buttons: data.buttons,
    has_buttons: data.buttons.length > 0,
    variable_count: (data.body_text.match(/\{\{\d+\}\}/g) || []).length,
    connection: template?.connection || { id: Number(data.whatsapp_connection_id || connections?.[0]?.id || 0), name: connections?.find((connection) => connection.id.toString() === data.whatsapp_connection_id)?.name || "Zyptos Business" },
    last_synced_at: template?.last_synced_at || null
  }), [connections, data, template]);
  const bodyVariables = useMemo(() => variableNumbersFromText(data.body_text), [data.body_text]);
  const insertVariable = () => {
    const used = (data.body_text.match(/\{\{(\d+)\}\}/g) || []).map((value) => Number(value.match(/\d+/)?.[0] || 0));
    const next = used.length ? Math.max(...used) + 1 : 1;
    setData("body_text", `${data.body_text}{{${next}}}`);
  };
  const updateBodyExample = (variableNumber, value) => {
    const next = [...data.body_examples];
    next[variableNumber - 1] = value;
    setData("body_examples", next);
  };
  const uploadHeaderMedia = async (file) => {
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", data.header_type);
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
      const response = await fetch(route("app.whatsapp.templates.upload-media", {}), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf
        },
        body: formData
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to upload file.");
      }
      setData("header_media_url", result.url);
      toast.success("File uploaded", "Header sample attached to this template.");
    } catch (error) {
      toast.error("Upload failed", error.message || "Failed to upload file.");
    } finally {
      setUploadingMedia(false);
    }
  };
  const handleMediaFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadHeaderMedia(file);
    }
    event.target.value = "";
  };
  const addButton = (type) => {
    if (data.buttons.length >= 3) {
      toast.error("Maximum 3 buttons allowed");
      return;
    }
    setData("buttons", [
      ...data.buttons,
      { type, text: type === "URL" ? "Visit Website" : type === "PHONE_NUMBER" ? "Call us" : "Reply" }
    ]);
  };
  const updateButton = (index, field, value) => {
    const next = [...data.buttons];
    next[index] = { ...next[index], [field]: value };
    setData("buttons", next);
  };
  const removeButton = (index) => {
    setData("buttons", data.buttons.filter((_, buttonIndex) => buttonIndex !== index));
  };
  const firstError = Object.values(errors)[0];
  const closeDrawer = () => {
    reset();
    onClose();
  };
  const submit = () => {
    if (submitting) {
      return;
    }
    const cleanedButtons = data.buttons.filter((button) => button.text.trim());
    const cleanedExamples = bodyVariables.map((variableNumber) => data.body_examples[variableNumber - 1] || "").filter((example) => example.trim());
    const payload = {
      ...data,
      name: data.name.trim(),
      body_text: data.body_text.trim(),
      footer_text: data.footer_text.trim(),
      header_text: data.header_text.trim(),
      header_media_url: data.header_media_url.trim(),
      body_examples: cleanedExamples,
      buttons: cleanedButtons
    };
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(editing ? "Template updated" : "Template submitted for approval");
        closeDrawer();
      },
      onError: (serverErrors) => {
        const message = Object.values(serverErrors || {}).filter(Boolean)[0];
        toast.error(
          editing ? "Failed to update template" : "Failed to create template",
          message || "Check the highlighted fields and try again."
        );
      },
      onFinish: () => setSubmitting(false)
    };
    setSubmitting(true);
    if (editing && template) {
      router.put(route("app.whatsapp.templates.update", { template: template.slug }), payload, options);
    } else {
      router.post(route("app.whatsapp.templates.store", {}), payload, options);
    }
  };
  return /* @__PURE__ */ jsxs(
    Drawer,
    {
      open,
      onClose: closeDrawer,
      title: editing ? "Edit template" : "Create new template",
      description: "Build a reusable WhatsApp template with live preview.",
      className: "max-w-6xl",
      footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Status remains pending until Meta approval." }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 sm:flex", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: closeDrawer, className: "w-full sm:w-auto", children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: submit, disabled: submitting, className: "w-full sm:w-auto", children: [
            /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
            editing ? "Submit update" : "Submit"
          ] })
        ] })
      ] }),
      children: [
        firstError && /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200", children: firstError }),
        /* @__PURE__ */ jsxs("div", { className: "grid min-h-full min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Template name" }),
                /* @__PURE__ */ jsx(TextInput, { value: data.name, onChange: (event) => setData("name", event.target.value), placeholder: "diwali_sale_2026", className: "h-10 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface-2" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: "Letters, numbers, and underscores only." }),
                errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-300", children: errors.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Language" }),
                /* @__PURE__ */ jsxs("select", { value: data.language, onChange: (event) => setData("language", event.target.value), className: "h-10 w-full rounded-btn border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: [
                  /* @__PURE__ */ jsx("option", { value: "en_US", children: "English (US)" }),
                  /* @__PURE__ */ jsx("option", { value: "en_GB", children: "English (UK)" }),
                  /* @__PURE__ */ jsx("option", { value: "hi_IN", children: "Hindi" }),
                  /* @__PURE__ */ jsx("option", { value: "mr_IN", children: "Marathi" }),
                  /* @__PURE__ */ jsx("option", { value: "ta_IN", children: "Tamil" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-2 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Category" }),
              /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-3", children: [
                { id: "MARKETING", label: "Marketing", desc: "Promotions & offers" },
                { id: "UTILITY", label: "Utility", desc: "Order and account updates" },
                { id: "AUTHENTICATION", label: "Authentication", desc: "OTP and login codes" }
              ].map((category) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setData("category", category.id),
                  className: `rounded-btn p-3 text-left ring-1 transition ${data.category === category.id ? "bg-waify-green-soft ring-waify-green dark:bg-waify-dark-green-soft" : "bg-white ring-gray-200 hover:ring-gray-300 dark:bg-waify-dark-surface-2 dark:ring-waify-dark-border"}`,
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: category.label }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: category.desc })
                  ]
                },
                category.id
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-100 pt-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Header" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1", children: ["NONE", "TEXT", "IMAGE", "VIDEO", "DOCUMENT"].map((type) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setData("header_type", type),
                    className: `h-7 rounded-md px-2 text-[11px] font-medium transition ${data.header_type === type ? "bg-waify-green text-white" : "bg-gray-100 text-waify-text-muted hover:text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
                    children: type === "NONE" ? "None" : type
                  },
                  type
                )) })
              ] }),
              data.header_type === "TEXT" && /* @__PURE__ */ jsx(TextInput, { value: data.header_text, onChange: (event) => setData("header_text", event.target.value), placeholder: "Header text", maxLength: 60, className: "h-10 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface-2" }),
              ["IMAGE", "VIDEO", "DOCUMENT"].includes(data.header_type) && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    ref: fileInputRef,
                    type: "file",
                    accept: mediaAcceptForHeader(data.header_type),
                    onChange: handleMediaFileChange,
                    className: "hidden",
                    disabled: uploadingMedia
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]", children: [
                  /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => fileInputRef.current?.click(), disabled: uploadingMedia, className: "w-full sm:w-auto", children: [
                    /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
                    uploadingMedia ? "Uploading..." : "Upload sample"
                  ] }),
                  /* @__PURE__ */ jsx(TextInput, { value: data.header_media_url, onChange: (event) => setData("header_media_url", event.target.value), placeholder: "Or paste a public Meta-accessible sample URL", className: "h-10 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface-2" })
                ] }),
                data.header_media_url && /* @__PURE__ */ jsxs("div", { className: "rounded-btn border border-gray-100 bg-gray-50 p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Header sample attached" }),
                    /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setData("header_media_url", ""), className: "text-red-600 hover:underline dark:text-red-300", children: "Remove" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "break-all", children: data.header_media_url }),
                  data.header_type === "IMAGE" && /* @__PURE__ */ jsx("img", { src: data.header_media_url, alt: "Header sample", className: "mt-3 max-h-40 rounded-card object-contain" })
                ] }),
                errors.header_media_url && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 dark:text-red-300", children: errors.header_media_url })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Body" }),
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: insertVariable, className: "inline-flex items-center gap-1 text-[11px] font-medium text-waify-green-dark hover:underline dark:text-emerald-300", children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
                  "Insert variable"
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  rows: 6,
                  value: data.body_text,
                  onChange: (event) => setData("body_text", event.target.value),
                  maxLength: 1024,
                  className: "w-full resize-none rounded-btn border border-gray-200 bg-white p-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text",
                  placeholder: "Enter message body. Use {{1}}, {{2}} for variables."
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 flex justify-between text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx("span", { children: "Use variables for personalized values." }),
                /* @__PURE__ */ jsxs("span", { children: [
                  data.body_text.length,
                  "/1024"
                ] })
              ] }),
              errors.body_text && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-300", children: errors.body_text }),
              bodyVariables.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-btn border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Sample values for Meta approval" }),
                /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: bodyVariables.map((variableNumber) => /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: data.body_examples[variableNumber - 1] || "",
                    onChange: (event) => updateBodyExample(variableNumber, event.target.value),
                    placeholder: `Example for {{${variableNumber}}}`,
                    className: "h-9 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface"
                  },
                  variableNumber
                )) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Footer" }),
              /* @__PURE__ */ jsx(TextInput, { value: data.footer_text, onChange: (event) => setData("footer_text", event.target.value), placeholder: "e.g. Reply STOP to unsubscribe", maxLength: 60, className: "h-10 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Buttons" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "xs", onClick: () => addButton("QUICK_REPLY"), disabled: data.buttons.length >= 3, children: "+ Quick reply" }),
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "xs", onClick: () => addButton("URL"), disabled: data.buttons.length >= 3, children: "+ CTA" }),
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "xs", onClick: () => addButton("PHONE_NUMBER"), disabled: data.buttons.length >= 3, children: "+ Call" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                data.buttons.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-btn border border-dashed border-gray-200 py-3 text-center text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "No buttons yet." }),
                data.buttons.map((button, index) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-2 dark:bg-waify-dark-surface-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("input", { value: button.text, onChange: (event) => updateButton(index, "text", event.target.value), className: "h-9 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" }),
                    /* @__PURE__ */ jsx("button", { type: "button", onClick: () => removeButton(index), className: "rounded-md p-2 text-waify-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-200", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
                  ] }),
                  button.type === "URL" && /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 sm:grid-cols-2", children: [
                    /* @__PURE__ */ jsx("input", { value: button.url || "", onChange: (event) => updateButton(index, "url", event.target.value), placeholder: "https://example.com", className: "h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" }),
                    /* @__PURE__ */ jsx("input", { value: button.url_example || "", onChange: (event) => updateButton(index, "url_example", event.target.value), placeholder: "Dynamic URL example", className: "h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" })
                  ] }),
                  button.type === "PHONE_NUMBER" && /* @__PURE__ */ jsx("input", { value: button.phone_number || "", onChange: (event) => updateButton(index, "phone_number", event.target.value), placeholder: "+919988776655", className: "mt-2 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" })
                ] }, index))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("aside", { className: "rounded-card border border-gray-100 bg-gray-50/70 p-5 dark:border-waify-dark-border dark:bg-slate-950", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-3 text-[11px] font-bold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Live Preview" }),
            /* @__PURE__ */ jsx(TemplatePhonePreview, { template: previewTemplate }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-card border border-gray-100 bg-white p-3 text-[11px] leading-relaxed text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text-muted", children: "Templates require Meta approval before use in campaigns." })
          ] })
        ] })
      ]
    }
  );
}
function SendTemplateModal({
  template,
  contacts,
  conversations,
  onClose
}) {
  const { toast } = useToast();
  const [recipientType, setRecipientType] = useState("conversation");
  const [contactSearch, setContactSearch] = useState("");
  const variableNumbers = useMemo(() => {
    if (!template) return [];
    const buttonText = (template.buttons || []).map((button) => `${button.url || ""} ${button.url_example || ""}`).join(" ");
    return variableNumbersFromText(`${template.header_text || ""}
${template.body_text || ""}
${buttonText}`);
  }, [template]);
  const { data, setData, post, processing, errors, reset } = useForm({
    to_wa_id: "",
    variables: []
  });
  useEffect(() => {
    setData("variables", variableNumbers.map(() => ""));
  }, [template?.id, variableNumbers.length]);
  const filteredContacts = useMemo(() => {
    const search = contactSearch.trim().toLowerCase();
    if (!search) return contacts.slice(0, 60);
    return contacts.filter((contact) => `${contact.name || ""} ${contact.wa_id}`.toLowerCase().includes(search)).slice(0, 60);
  }, [contactSearch, contacts]);
  const previewBody = useMemo(() => {
    if (!template) return "";
    let body = [template.header_text, template.body_text, template.footer_text].filter(Boolean).join("\n\n");
    variableNumbers.forEach((variableNumber, index) => {
      body = body.replaceAll(`{{${variableNumber}}}`, data.variables[index] || `{{${variableNumber}}}`);
    });
    return body;
  }, [data.variables, template, variableNumbers]);
  const close = () => {
    reset();
    setRecipientType("conversation");
    setContactSearch("");
    onClose();
  };
  const submit = (event) => {
    event.preventDefault();
    if (!template) return;
    post(route("app.whatsapp.templates.send.store", { template: template.slug }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Template sent");
        close();
      },
      onError: () => toast.error("Failed to send template")
    });
  };
  return /* @__PURE__ */ jsx(Modal, { open: Boolean(template), onClose: close, title: template ? `Use ${template.name}` : "Use template", description: "Send an approved template without leaving the template library.", className: "max-w-5xl", children: template && /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 space-y-4", children: [
      template.status.toLowerCase() !== "approved" && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200", children: "Only approved templates can be sent through Meta." }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Recipient" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 grid gap-2 sm:grid-cols-3", children: [
          ["conversation", "Conversation", MessageSquareText],
          ["contact", "Contact", User],
          ["manual", "Manual", Phone]
        ].map(([value, label, Icon]) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setRecipientType(value);
              setData("to_wa_id", "");
            },
            className: `flex items-center justify-center gap-2 rounded-btn border px-3 py-2 text-sm font-medium transition ${recipientType === value ? "border-waify-green bg-waify-green/10 text-waify-green-dark dark:text-emerald-300" : "border-gray-200 text-waify-text-muted hover:text-waify-text dark:border-waify-dark-border dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
              label
            ]
          },
          value
        )) }),
        recipientType === "conversation" && /* @__PURE__ */ jsxs("select", { value: data.to_wa_id, onChange: (event) => setData("to_wa_id", event.target.value), className: "mt-3 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Select conversation..." }),
          conversations.map((conversation) => /* @__PURE__ */ jsxs("option", { value: conversation.contact.wa_id, children: [
            conversation.contact.name || conversation.contact.wa_id,
            " (",
            conversation.contact.wa_id,
            ")"
          ] }, conversation.id))
        ] }),
        recipientType === "contact" && /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
          /* @__PURE__ */ jsx(TextInput, { value: contactSearch, onChange: (event) => setContactSearch(event.target.value), placeholder: "Search contacts...", className: "w-full" }),
          /* @__PURE__ */ jsxs("select", { value: data.to_wa_id, onChange: (event) => setData("to_wa_id", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select contact..." }),
            filteredContacts.map((contact) => /* @__PURE__ */ jsxs("option", { value: contact.wa_id, children: [
              contact.name || contact.wa_id,
              " (",
              contact.wa_id,
              ")"
            ] }, contact.id))
          ] })
        ] }),
        recipientType === "manual" && /* @__PURE__ */ jsx(TextInput, { value: data.to_wa_id, onChange: (event) => setData("to_wa_id", event.target.value), placeholder: "Enter WhatsApp number with country code", className: "mt-3 w-full" }),
        errors.to_wa_id && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: errors.to_wa_id })
      ] }),
      variableNumbers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Variables" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 grid gap-3 sm:grid-cols-2", children: variableNumbers.map((variableNumber, index) => /* @__PURE__ */ jsx(TextInput, { value: data.variables[index] || "", onChange: (event) => {
          const next = [...data.variables];
          next[index] = event.target.value;
          setData("variables", next);
        }, placeholder: `Value for {{${variableNumber}}}`, className: "w-full" }, variableNumber)) }),
        errors.variables && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: errors.variables })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: close, children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: processing || template.status.toLowerCase() !== "approved", children: [
          /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
          processing ? "Sending..." : "Send template"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx(TemplatePhonePreview, { template }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Personalized preview" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed text-waify-text dark:text-waify-dark-text", children: previewBody || "No preview content." })
      ] })
    ] })
  ] }) });
}
function TemplatesIndex({
  account,
  templates,
  connections,
  filters,
  contacts,
  conversations,
  selected_template,
  sync_report,
  library_templates = []
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [showSyncReport, setShowSyncReport] = useState(Boolean(sync_report));
  const [copied, setCopied] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [builderTemplate, setBuilderTemplate] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [viewTemplate, setViewTemplate] = useState(null);
  const [sendTemplate, setSendTemplate] = useState(null);
  const hasSyncReport = Boolean(sync_report || connections.some((connection) => connection.last_synced_at || connection.last_sync_error));
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sendSlug = params.get("use_template");
    const templateSlug = params.get("template");
    const panel = params.get("panel");
    if (panel === "create" && !builderOpen) {
      setBuilderTemplate(null);
      setBuilderOpen(true);
      return;
    }
    if (panel === "library" && !libraryOpen) {
      setLibraryOpen(true);
    }
    const matchSlug = sendSlug || templateSlug;
    if (!matchSlug) return;
    const match = selected_template || templates.data.find((template) => template.slug === matchSlug);
    if (!match) return;
    if ((panel === "send" || sendSlug) && !sendTemplate) {
      setSendTemplate(match);
    } else if (panel === "edit" && !builderOpen) {
      setBuilderTemplate(match);
      setBuilderOpen(true);
    } else if (!viewTemplate) {
      setViewTemplate(match);
    }
  }, [selected_template, sendTemplate, templates.data, builderOpen, libraryOpen, viewTemplate]);
  const filteredLibraryTemplates = useMemo(() => {
    const search = librarySearch.trim().toLowerCase();
    if (!search) return library_templates;
    return library_templates.filter((template) => [
      template.title,
      template.name,
      template.category,
      template.body_text,
      template.use_case
    ].join(" ").toLowerCase().includes(search));
  }, [library_templates, librarySearch]);
  const applyLibraryTemplate = (preset) => {
    setBuilderTemplate({
      id: 0,
      slug: `library-${preset.id}`,
      name: preset.name,
      language: preset.language,
      category: preset.category,
      status: "draft",
      body_text: preset.body_text,
      header_type: preset.header_type || "NONE",
      header_text: preset.header_text || null,
      header_media_url: null,
      footer_text: preset.footer_text || null,
      buttons: preset.buttons || [],
      has_buttons: Boolean(preset.buttons?.length),
      variable_count: variableNumbersFromText(preset.body_text).length,
      connection: { id: connections[0]?.id || 0, name: connections[0]?.name || "Zyptos Business" },
      last_synced_at: null
    });
    setLibraryOpen(false);
    setBuilderOpen(true);
  };
  const applyFilters = () => {
    router.get(route("app.whatsapp.templates.index", {}), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const clearFilters = () => {
    const emptyFilters = {
      connection: "",
      status: "",
      category: "",
      language: "",
      search: ""
    };
    setLocalFilters(emptyFilters);
    router.get(route("app.whatsapp.templates.index", {}), emptyFilters);
  };
  const copyTemplateName = (name, language) => {
    const fullName = `${name}:${language}`;
    navigator.clipboard.writeText(fullName);
    setCopied(fullName);
    toast.success("Template name copied");
    setTimeout(() => setCopied(null), 2e3);
  };
  const syncTemplates = () => {
    router.post(route("app.whatsapp.templates.sync", {}), {
      connection_id: localFilters.connection || connections[0]?.id
    }, {
      onSuccess: () => {
        toast.success("Templates synced successfully");
        setShowSyncReport(true);
      },
      onError: () => {
        toast.error("Failed to sync templates");
      }
    });
  };
  const setQuickFilter = (type, value = "") => {
    const nextFilters = type === "all" ? { ...localFilters, category: "", status: "" } : { ...localFilters, [type]: value };
    setLocalFilters(nextFilters);
    router.get(route("app.whatsapp.templates.index", {}), nextFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const handleArchive = async (template) => {
    const confirmed = await confirm({
      title: "Archive Template",
      message: `Are you sure you want to archive "${template.name}"? You can restore it later.`,
      variant: "warning"
    });
    if (!confirmed) return;
    setArchiving(template.slug);
    router.post(
      route("app.whatsapp.templates.archive", {
        template: template.slug
      }),
      {},
      {
        onSuccess: () => {
          toast.success("Template archived successfully");
          router.reload({ only: ["templates"] });
        },
        onError: () => {
          toast.error("Failed to archive template");
        },
        onFinish: () => setArchiving(null)
      }
    );
  };
  const handleDelete = async (template) => {
    const confirmed = await confirm({
      title: "Delete Template",
      message: `Are you sure you want to permanently delete "${template.name}"? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Delete"
    });
    if (!confirmed) return;
    setDeleting(template.slug);
    router.delete(
      route("app.whatsapp.templates.destroy", {
        template: template.slug
      }),
      {
        onSuccess: () => {
          toast.success("Template deleted successfully");
          router.reload({ only: ["templates"] });
        },
        onError: () => {
          toast.error("Failed to delete template");
        },
        onFinish: () => setDeleting(null)
      }
    );
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { variant: "success", label: "Approved" },
      pending: { variant: "warning", label: "Pending" },
      rejected: { variant: "danger", label: "Rejected" },
      paused: { variant: "default", label: "Paused" },
      disabled: { variant: "default", label: "Disabled" }
    };
    const config = statusMap[status.toLowerCase()] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, className: "px-3 py-1", children: config.label });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Message Templates" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1600px] space-y-5 p-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: "Message Templates" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Pre-approved WhatsApp templates ready to use in any campaign." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: syncTemplates,
              variant: "secondary",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
                "Sync from Meta"
              ]
            }
          ),
          hasSyncReport && /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              onClick: () => setShowSyncReport(true),
              variant: "secondary",
              children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
                "Sync report"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => setLibraryOpen(true), children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
            "Template Library"
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              onClick: () => {
                setBuilderTemplate(null);
                setBuilderOpen(true);
              },
              children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 mr-2" }),
                "New Template"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        [
          { id: "all", label: "All", type: "all", value: "" },
          { id: "marketing", label: "Marketing", type: "category", value: "MARKETING" },
          { id: "utility", label: "Utility", type: "category", value: "UTILITY" },
          { id: "authentication", label: "Authentication", type: "category", value: "AUTHENTICATION" },
          { id: "approved", label: "Approved", type: "status", value: "approved" },
          { id: "pending", label: "Pending", type: "status", value: "pending" },
          { id: "rejected", label: "Rejected", type: "status", value: "rejected" }
        ].map((filter) => {
          const active = filter.type === "all" ? !localFilters.category && !localFilters.status : localFilters[filter.type] === filter.value;
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setQuickFilter(filter.type, filter.value),
              className: `h-8 rounded-full px-3 text-xs font-medium transition ${active ? "bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg" : "bg-white text-waify-text-muted ring-1 ring-gray-200 hover:text-waify-text dark:bg-slate-900 dark:text-waify-dark-text-muted dark:ring-waify-dark-border dark:hover:text-waify-dark-text"}`,
              children: filter.label
            },
            filter.id
          );
        }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowFilters(!showFilters),
            className: "ml-auto inline-flex h-8 items-center gap-1 rounded-full bg-white px-3 text-xs font-medium text-waify-text-muted ring-1 ring-gray-200 hover:text-waify-text dark:bg-slate-900 dark:text-waify-dark-text-muted dark:ring-waify-dark-border",
            children: [
              /* @__PURE__ */ jsx(Filter, { className: "h-3.5 w-3.5" }),
              "Advanced"
            ]
          }
        )
      ] }),
      showFilters && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Search" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  type: "text",
                  value: localFilters.search,
                  onChange: (e) => setLocalFilters({ ...localFilters, search: e.target.value }),
                  onKeyDown: (e) => e.key === "Enter" && applyFilters(),
                  className: "pl-10",
                  placeholder: "Search templates..."
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Connection" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.connection,
                onChange: (e) => setLocalFilters({ ...localFilters, connection: e.target.value }),
                className: "w-full rounded-btn border-gray-200 px-4 py-2.5 shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-gray-700 dark:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All Connections" }),
                  connections.map((conn) => /* @__PURE__ */ jsx("option", { value: conn.id.toString(), children: conn.name }, conn.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Status" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.status,
                onChange: (e) => setLocalFilters({ ...localFilters, status: e.target.value }),
                className: "w-full rounded-btn border-gray-200 px-4 py-2.5 shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-gray-700 dark:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
                  /* @__PURE__ */ jsx("option", { value: "approved", children: "Approved" }),
                  /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                  /* @__PURE__ */ jsx("option", { value: "rejected", children: "Rejected" }),
                  /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" }),
                  /* @__PURE__ */ jsx("option", { value: "disabled", children: "Disabled" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Category" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.category,
                onChange: (e) => setLocalFilters({ ...localFilters, category: e.target.value }),
                className: "w-full rounded-btn border-gray-200 px-4 py-2.5 shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-gray-700 dark:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All Categories" }),
                  /* @__PURE__ */ jsx("option", { value: "MARKETING", children: "Marketing" }),
                  /* @__PURE__ */ jsx("option", { value: "UTILITY", children: "Utility" }),
                  /* @__PURE__ */ jsx("option", { value: "AUTHENTICATION", children: "Authentication" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Button, { onClick: applyFilters, children: "Apply Filters" }),
          /* @__PURE__ */ jsxs(Button, { onClick: clearFilters, variant: "secondary", children: [
            /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mr-2" }),
            "Clear"
          ] })
        ] })
      ] }) }),
      hasSyncReport && /* @__PURE__ */ jsx(
        Modal,
        {
          open: showSyncReport,
          onClose: () => setShowSyncReport(false),
          title: "Sync Status Report",
          description: "Latest sync summary and per-connection status",
          className: "max-w-2xl",
          footer: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowSyncReport(false), children: "Close" }),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
            sync_report ? /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50/80 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Last run" }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-1 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    sync_report.total,
                    " total, ",
                    sync_report.created,
                    " created, ",
                    sync_report.updated,
                    " updated, ",
                    sync_report.errors_count,
                    " errors."
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Badge, { variant: sync_report.errors_count > 0 ? "warning" : "success", children: sync_report.errors_count > 0 ? "Needs review" : "Synced" })
              ] }),
              Array.isArray(sync_report.errors) && sync_report.errors.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-card border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-200", children: "Errors" }),
                /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-xs text-red-700 dark:text-red-200", children: sync_report.errors.map((err, idx) => /* @__PURE__ */ jsxs("li", { children: [
                  err.template,
                  ": ",
                  err.error
                ] }, idx)) })
              ] })
            ] }) : /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 bg-gray-50/80 p-4 text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70 dark:text-waify-dark-text-muted", children: "No sync run summary is available yet." }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-2", children: connections.map((connection) => /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-4 shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: connection.name }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    "Last sync: ",
                    connection.last_synced_at ? new Date(connection.last_synced_at).toLocaleString() : "Never"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Badge, { variant: connection.last_sync_error ? "danger" : connection.last_synced_at ? "success" : "secondary", children: connection.last_sync_error ? "Error" : connection.last_synced_at ? "Synced" : "Never" })
              ] }),
              connection.last_sync_error && /* @__PURE__ */ jsxs("p", { className: "mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-200", children: [
                "Last error: ",
                connection.last_sync_error
              ] })
            ] }, connection.id)) })
          ] })
        }
      ),
      templates.data.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: FileText,
          title: "No templates found",
          description: "Sync templates from Meta to import your WhatsApp message templates.",
          action: /* @__PURE__ */ jsxs(Button, { onClick: syncTemplates, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
            "Sync Templates"
          ] })
        }
      ) }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: templates.data.map((template) => /* @__PURE__ */ jsxs("div", { className: "surface group overflow-hidden rounded-card border border-transparent bg-white shadow-card transition-all hover:shadow-card-lg dark:border-slate-700/80 dark:bg-slate-800", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative bg-gradient-to-br from-gray-50 to-gray-100 px-4 pb-3 pt-4 dark:from-slate-800 dark:to-slate-900", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryTone(template.category)}`, children: [
              /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3" }),
              template.category
            ] }),
            getStatusBadge(template.status)
          ] }),
          /* @__PURE__ */ jsx("div", { className: "-mb-12 scale-[0.78]", children: /* @__PURE__ */ jsx(TemplatePhonePreview, { template }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-100 px-4 py-4 dark:border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setViewTemplate(template),
                className: "min-w-0 flex-1 truncate text-left font-mono text-[12px] font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-waify-green",
                children: template.name
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => copyTemplateName(template.name, template.language),
                className: "rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-waify-text dark:hover:bg-slate-700 dark:hover:text-waify-dark-text",
                title: "Copy template name",
                children: copied === `${template.name}:${template.language}` ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { children: template.language }),
            /* @__PURE__ */ jsx("span", { children: "·" }),
            /* @__PURE__ */ jsx("span", { children: template.has_buttons ? "Buttons" : "No buttons" }),
            template.variable_count > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { children: "·" }),
              /* @__PURE__ */ jsxs("span", { children: [
                template.variable_count,
                " vars"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 line-clamp-2 min-h-[34px] text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: template.body_text || "No body text available." }),
          template.status.toLowerCase() === "rejected" && template.rejection_reason && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-btn border border-red-100 bg-red-50 p-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200", children: template.rejection_reason }),
          template.stats && /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-4 gap-1 text-center text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              template.stats.sent,
              " sent"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              template.stats.delivered,
              " del."
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              template.stats.read,
              " read"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              template.stats.failed,
              " fail"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", className: "flex-1", disabled: template.status.toLowerCase() !== "approved", onClick: () => setSendTemplate(template), children: [
              /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
              "Use"
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", className: "flex-1", onClick: () => setViewTemplate(template), children: "View" }),
            /* @__PURE__ */ jsxs("div", { className: "group/menu relative", children: [
              /* @__PURE__ */ jsx("button", { type: "button", className: "flex h-8 w-8 items-center justify-center rounded-btn bg-gray-50 text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:bg-slate-900 dark:text-waify-dark-text-muted dark:hover:bg-slate-700 dark:hover:text-waify-dark-text", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { className: "invisible absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-card bg-white py-1 opacity-0 shadow-pop ring-1 ring-gray-100 transition group-hover/menu:visible group-hover/menu:opacity-100 dark:bg-slate-900 dark:ring-slate-700", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setBuilderTemplate(template);
                      setBuilderOpen(true);
                    },
                    className: "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2",
                    children: [
                      /* @__PURE__ */ jsx(Edit, { className: "h-3.5 w-3.5" }),
                      template.status.toLowerCase() === "rejected" ? "Edit & resubmit" : "Edit"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => handleArchive(template), disabled: archiving === template.slug, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-orange-600 hover:bg-orange-50 disabled:opacity-50 dark:hover:bg-orange-500/10", children: [
                  /* @__PURE__ */ jsx(Archive, { className: "h-3.5 w-3.5" }),
                  "Archive"
                ] }),
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => handleDelete(template), disabled: deleting === template.slug, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10", children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  "Delete"
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }, template.id)) }),
      /* @__PURE__ */ jsx(
        Modal,
        {
          open: libraryOpen,
          onClose: () => setLibraryOpen(false),
          title: "Template Library",
          description: "Start from a pre-approved structure and submit it from the same page.",
          className: "max-w-6xl",
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: librarySearch,
                  onChange: (event) => setLibrarySearch(event.target.value),
                  placeholder: "Search use case, category, or content",
                  className: "h-11 rounded-btn border-gray-200 pl-9 dark:border-waify-dark-border dark:bg-waify-dark-surface-2"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid max-h-[68vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2", children: [
              filteredLibraryTemplates.map((preset) => /* @__PURE__ */ jsx(Card, { className: "border-gray-200/80 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: preset.title }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: preset.use_case })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryTone(preset.category)}`, children: preset.category })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: preset.body_text }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-waify-text-muted dark:text-waify-dark-text-muted", children: preset.language }),
                  /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", onClick: () => applyLibraryTemplate(preset), children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
                    "Use preset"
                  ] })
                ] })
              ] }) }, preset.id)),
              filteredLibraryTemplates.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-dashed border-gray-200 p-8 text-center text-sm text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted md:col-span-2", children: "No presets match this search." })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        TemplateBuilderDrawer,
        {
          open: builderOpen,
          onClose: () => setBuilderOpen(false),
          template: builderTemplate,
          connections
        },
        builderTemplate?.slug ?? "new-template"
      ),
      /* @__PURE__ */ jsx(
        Modal,
        {
          open: Boolean(viewTemplate),
          onClose: () => setViewTemplate(null),
          title: viewTemplate?.name ?? "Template preview",
          description: "Review content, status, variables, and buttons without leaving templates.",
          className: "max-w-4xl",
          footer: /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setViewTemplate(null), children: "Close" }),
            viewTemplate && /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                onClick: () => {
                  setSendTemplate(viewTemplate);
                  setViewTemplate(null);
                },
                disabled: viewTemplate.status.toLowerCase() !== "approved",
                children: [
                  /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
                  "Use template"
                ]
              }
            )
          ] }),
          children: viewTemplate && /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-[320px_1fr]", children: [
            /* @__PURE__ */ jsx(TemplatePhonePreview, { template: viewTemplate }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Status" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2", children: getStatusBadge(viewTemplate.status) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Language" }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-2 flex items-center gap-2 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
                    /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4 text-waify-green" }),
                    viewTemplate.language
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Category" }),
                  /* @__PURE__ */ jsxs("span", { className: `mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryTone(viewTemplate.category)}`, children: [
                    /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3" }),
                    viewTemplate.category
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Variables" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: viewTemplate.variable_count })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Body" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed text-waify-text dark:text-waify-dark-text", children: viewTemplate.body_text || "No body content available." })
              ] }),
              viewTemplate.status.toLowerCase() === "rejected" && viewTemplate.rejection_reason && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-red-100 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide", children: "Rejection reason" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2", children: viewTemplate.rejection_reason })
              ] }),
              viewTemplate.stats && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-3", children: Object.entries(viewTemplate.stats).map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 text-center dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-waify-text dark:text-waify-dark-text", children: value }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: label })
              ] }, label)) }),
              viewTemplate.footer_text && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Footer" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-waify-text dark:text-waify-dark-text", children: viewTemplate.footer_text })
              ] }),
              viewTemplate.buttons?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Buttons" }),
                /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: viewTemplate.buttons.map((button, index) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-waify-text dark:border-waify-dark-border dark:text-waify-dark-text", children: [
                  button.type === "URL" ? /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" }) : button.type === "PHONE_NUMBER" ? /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Reply, { className: "h-3.5 w-3.5" }),
                  button.text
                ] }, `${button.text}-${index}`)) })
              ] })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SendTemplateModal,
        {
          template: sendTemplate,
          contacts,
          conversations,
          onClose: () => setSendTemplate(null)
        }
      )
    ] })
  ] });
}
export {
  TemplatesIndex as default
};
