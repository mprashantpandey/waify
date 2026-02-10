import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, AlertCircle, Sparkles, Info, XCircle, FileText, Upload, Image, Video, File, X, Plus, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./Select-CAnRTAG0.js";
import { T as Textarea } from "./Textarea-x8GTiAvG.js";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import axios from "axios";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
const LANGUAGE_CODES = [
  { code: "en_US", name: "English (US)" },
  { code: "en_GB", name: "English (UK)" },
  { code: "es_ES", name: "Spanish (Spain)" },
  { code: "es_MX", name: "Spanish (Mexico)" },
  { code: "pt_BR", name: "Portuguese (Brazil)" },
  { code: "fr_FR", name: "French" },
  { code: "de_DE", name: "German" },
  { code: "it_IT", name: "Italian" },
  { code: "hi_IN", name: "Hindi" },
  { code: "ja_JP", name: "Japanese" },
  { code: "ko_KR", name: "Korean" },
  { code: "zh_CN", name: "Chinese (Simplified)" },
  { code: "ar_SA", name: "Arabic" },
  { code: "tr_TR", name: "Turkish" },
  { code: "ru_RU", name: "Russian" }
];
function TemplatesCreate({
  account,
  connections = []
}) {
  const { toast } = useToast();
  const [variableCount, setVariableCount] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { data, setData, post, processing, errors, reset } = useForm({
    whatsapp_connection_id: connections?.[0]?.id?.toString() || "",
    name: "",
    language: "en_US",
    category: "UTILITY",
    header_type: "NONE",
    header_text: "",
    header_media_url: "",
    body_text: "",
    body_examples: [],
    footer_text: "",
    buttons: []
  });
  const updateVariableCount = (text) => {
    const matches = text.match(/\{\{(\d+)\}\}/g);
    const numbers = matches ? matches.map((m) => parseInt(m.match(/\d+/)?.[0] || "0")) : [];
    const maxVar = numbers.length > 0 ? Math.max(...numbers) : 0;
    setVariableCount(maxVar);
  };
  const handleBodyTextChange = (value) => {
    setData("body_text", value);
    updateVariableCount(value);
  };
  const addButton = () => {
    if ((data.buttons?.length || 0) >= 3) {
      toast.error("Maximum 3 buttons allowed");
      return;
    }
    setData("buttons", [
      ...data.buttons || [],
      { type: "QUICK_REPLY", text: "" }
    ]);
  };
  const removeButton = (index) => {
    const buttons = [...data.buttons || []];
    buttons.splice(index, 1);
    setData("buttons", buttons);
  };
  const updateButton = (index, field, value) => {
    const buttons = [...data.buttons || []];
    buttons[index] = { ...buttons[index], [field]: value };
    setData("buttons", buttons);
  };
  const handleMediaUpload = async (file) => {
    if (!file) return;
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", data.header_type);
      const response = await axios.post(
        route("app.whatsapp.templates.upload-media", {}),
        formData
      );
      setData("header_media_url", response.data.url);
      setMediaPreview(response.data.url);
      toast.success("File uploaded", "Media file uploaded successfully.");
    } catch (error) {
      toast.error("Upload failed", error.response?.data?.error || error.message || "Failed to upload file.");
    } finally {
      setUploadingMedia(false);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleMediaUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const updateBodyExample = (index, value) => {
    const examples = [...data.body_examples || []];
    examples[index] = value;
    setData("body_examples", examples);
  };
  const submit = (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!data.whatsapp_connection_id) {
      toast.error("Please select a WhatsApp connection");
      return;
    }
    if (!data.name || data.name.trim() === "") {
      toast.error("Template name is required");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(data.name)) {
      toast.error("Template name can only contain letters, numbers, and underscores");
      return;
    }
    if (!data.body_text || data.body_text.trim() === "") {
      toast.error("Body text is required");
      return;
    }
    setSubmitting(true);
    const cleanedButtons = data.buttons?.filter((btn) => btn.text.trim() !== "") || [];
    const cleanedExamples = data.body_examples?.filter((ex) => ex.trim() !== "") || [];
    const submitData = {
      whatsapp_connection_id: data.whatsapp_connection_id,
      name: data.name.trim(),
      language: data.language,
      category: data.category,
      header_type: data.header_type || "NONE",
      body_text: data.body_text.trim()
    };
    if (data.header_type === "TEXT" && data.header_text?.trim()) {
      submitData.header_text = data.header_text.trim();
    } else if (["IMAGE", "VIDEO", "DOCUMENT"].includes(data.header_type || "") && data.header_media_url) {
      submitData.header_media_url = data.header_media_url;
    }
    if (data.footer_text?.trim()) {
      submitData.footer_text = data.footer_text.trim();
    }
    if (cleanedButtons.length > 0) {
      submitData.buttons = cleanedButtons;
    }
    if (cleanedExamples.length > 0) {
      submitData.body_examples = cleanedExamples;
    }
    console.log("Submitting template data:", submitData);
    router.post(route("app.whatsapp.templates.store", {}), submitData, {
      onSuccess: () => {
        toast.success("Template created successfully! It will be reviewed by Meta.");
        setSubmitting(false);
      },
      onError: (errors2) => {
        console.error("Template creation errors:", errors2);
        setSubmitting(false);
        if (errors2.create) {
          toast.error(errors2.create);
        } else if (Object.keys(errors2).length > 0) {
          const firstError = Object.values(errors2)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          toast.error(errorMessage || "Failed to create template. Please check the form for errors.");
        } else {
          toast.error("Failed to create template. Please check the form for errors.");
        }
      },
      onFinish: () => {
        setSubmitting(false);
      }
    });
  };
  const renderPreview = () => {
    let bodyPreview = data.body_text || "";
    for (let i = 1; i <= variableCount; i++) {
      const example = data.body_examples?.[i - 1] || `Example ${i}`;
      bodyPreview = bodyPreview.replace(new RegExp(`\\{\\{${i}\\}\\}`, "g"), example);
    }
    return /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700", children: [
      data.header_type !== "NONE" && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2", children: "HEADER" }),
        data.header_type === "TEXT" && data.header_text && /* @__PURE__ */ jsx("div", { className: "text-base font-semibold text-gray-900 dark:text-gray-100", children: data.header_text }),
        ["IMAGE", "VIDEO", "DOCUMENT"].includes(data.header_type) && data.header_media_url && /* @__PURE__ */ jsx("div", { className: "text-sm text-blue-600 dark:text-blue-400 break-all", children: data.header_media_url })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2", children: "BODY" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap", children: bodyPreview || "Body text will appear here..." })
      ] }),
      data.footer_text && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2", children: "FOOTER" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: data.footer_text })
      ] }),
      data.buttons && data.buttons.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: data.buttons.map((button, index) => button.text && /* @__PURE__ */ jsx(
        "div",
        {
          className: "p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center",
          children: /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-blue-900 dark:text-blue-100", children: button.text })
        },
        index
      )) })
    ] });
  };
  if (!connections || connections.length === 0) {
    return /* @__PURE__ */ jsxs(AppShell, { children: [
      /* @__PURE__ */ jsx(Head, { title: "Create Template" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.whatsapp.templates.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Templates"
            ]
          }
        ),
        /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900/20 dark:via-gray-900 dark:to-red-900/20 overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 pointer-events-none" }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-8 relative", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-6", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-white", strokeWidth: 2.5 }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "No Active Connections" }),
                /* @__PURE__ */ jsx("div", { className: "h-1 w-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-4" }),
                /* @__PURE__ */ jsx("p", { className: "text-base text-gray-700 dark:text-gray-300 leading-relaxed", children: "You need at least one active WhatsApp connection to create message templates. Create a connection to get started with template management." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 mt-6", children: [
                /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.connections.index", {}), children: /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: "primary",
                    className: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200",
                    children: [
                      /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
                      "Create WhatsApp Connection"
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.templates.index", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", children: "View Templates" }) })
              ] })
            ] })
          ] }) })
        ] }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Template" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.whatsapp.templates.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Templates"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Create Template" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Create a new WhatsApp message template following Meta's latest guidelines" })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              onClick: () => setPreviewMode(!previewMode),
              children: previewMode ? "Edit Mode" : "Preview Mode"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Alert, { variant: "info", className: "border-blue-200 dark:border-blue-800", children: [
        /* @__PURE__ */ jsx(Info, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-800 dark:text-blue-200 mb-1", children: "Template Guidelines" }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside", children: [
            /* @__PURE__ */ jsx("li", { children: "Template name: Alphanumeric and underscores only, max 512 characters" }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Body text: Max 1024 characters, use ",
              "{{1}}",
              ", ",
              "{{2}}",
              " for variables"
            ] }),
            /* @__PURE__ */ jsx("li", { children: "Header: Max 60 characters (TEXT) or media URL (IMAGE/VIDEO/DOCUMENT)" }),
            /* @__PURE__ */ jsx("li", { children: "Footer: Max 60 characters" }),
            /* @__PURE__ */ jsx("li", { children: "Buttons: Maximum 3 buttons (QUICK_REPLY, URL, or PHONE_NUMBER)" }),
            /* @__PURE__ */ jsx("li", { children: "Templates require Meta approval before use" })
          ] })
        ] })
      ] }),
      errors.create && /* @__PURE__ */ jsx(Card, { className: "border-2 border-red-200 dark:border-red-800/50 shadow-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 overflow-hidden", children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md", children: /* @__PURE__ */ jsx(XCircle, { className: "h-6 w-6 text-white", strokeWidth: 2.5 }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-red-900 dark:text-red-100 mb-2", children: "Error Creating Template" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700 dark:text-red-300 leading-relaxed", children: errors.create })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        previewMode ? /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Template Preview" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "How your template will appear to recipients" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: renderPreview() })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
              "Basic Information"
            ] }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 pt-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "connection", children: "WhatsApp Connection *" }),
                /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: data.whatsapp_connection_id,
                    onValueChange: (value) => setData("whatsapp_connection_id", value),
                    children: [
                      /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsx(SelectValue, { children: connections.find((c) => c.id.toString() === data.whatsapp_connection_id)?.name || "Select connection" }) }),
                      /* @__PURE__ */ jsx(SelectContent, { children: connections.map((conn) => /* @__PURE__ */ jsxs(SelectItem, { value: conn.id.toString(), children: [
                        conn.name,
                        " ",
                        !conn.waba_id && "(No WABA ID)"
                      ] }, conn.id)) })
                    ]
                  }
                ),
                errors.whatsapp_connection_id && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.whatsapp_connection_id })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Template Name *" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "name",
                      value: data.name,
                      onChange: (e) => setData("name", e.target.value),
                      placeholder: "my_template_name",
                      className: "font-mono",
                      maxLength: 512
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Alphanumeric and underscores only" }),
                  errors.name && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.name })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "language", children: "Language *" }),
                  /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: data.language,
                      onValueChange: (value) => setData("language", value),
                      children: [
                        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                        /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGE_CODES.map((lang) => /* @__PURE__ */ jsx(SelectItem, { value: lang.code, children: lang.name }, lang.code)) })
                      ]
                    }
                  ),
                  errors.language && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.language })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "category", children: "Category *" }),
                /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: data.category,
                    onValueChange: (value) => setData("category", value),
                    children: [
                      /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { children: data.category === "MARKETING" ? "Marketing" : data.category === "UTILITY" ? "Utility" : data.category === "AUTHENTICATION" ? "Authentication" : "Select category" }) }),
                      /* @__PURE__ */ jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsx(SelectItem, { value: "MARKETING", children: "Marketing" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "UTILITY", children: "Utility" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "AUTHENTICATION", children: "Authentication" })
                      ] })
                    ]
                  }
                ),
                errors.category && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.category })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20", children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Header (Optional)" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Add a header to your template" })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 pt-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "header_type", children: "Header Type" }),
                /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: data.header_type,
                    onValueChange: (value) => {
                      setData("header_type", value);
                      if (value === "NONE" || value === "TEXT") {
                        setData("header_media_url", "");
                        setMediaPreview(null);
                      }
                    },
                    children: [
                      /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { children: data.header_type === "NONE" ? "None" : data.header_type === "TEXT" ? "Text" : data.header_type === "IMAGE" ? "Image" : data.header_type === "VIDEO" ? "Video" : data.header_type === "DOCUMENT" ? "Document" : "Select header type" }) }),
                      /* @__PURE__ */ jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsx(SelectItem, { value: "NONE", children: "None" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "TEXT", children: "Text" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "IMAGE", children: "Image" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "VIDEO", children: "Video" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "DOCUMENT", children: "Document" })
                      ] })
                    ]
                  }
                )
              ] }),
              data.header_type === "TEXT" && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "header_text", children: "Header Text *" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    id: "header_text",
                    value: data.header_text || "",
                    onChange: (e) => setData("header_text", e.target.value),
                    placeholder: "Header text (max 60 characters)",
                    maxLength: 60
                  }
                ),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                  (data.header_text || "").length,
                  "/60 characters"
                ] }),
                errors.header_text && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.header_text })
              ] }),
              ["IMAGE", "VIDEO", "DOCUMENT"].includes(data.header_type) && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "header_media_file", children: "Upload Media *" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        ref: fileInputRef,
                        type: "file",
                        id: "header_media_file",
                        accept: data.header_type === "IMAGE" ? "image/jpeg,image/jpg,image/png,image/gif" : data.header_type === "VIDEO" ? "video/mp4,video/mov,video/avi" : "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        onChange: handleFileChange,
                        className: "hidden",
                        disabled: uploadingMedia
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "secondary",
                        onClick: () => fileInputRef.current?.click(),
                        disabled: uploadingMedia,
                        className: "w-full",
                        children: [
                          /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
                          uploadingMedia ? "Uploading..." : "Choose File"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: [
                    data.header_type === "IMAGE" && "Supported: JPEG, PNG, GIF (max 10MB)",
                    data.header_type === "VIDEO" && "Supported: MP4, MOV, AVI (max 10MB)",
                    data.header_type === "DOCUMENT" && "Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 10MB)"
                  ] }),
                  errors.header_media_url && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.header_media_url })
                ] }),
                (mediaPreview || data.header_media_url) && /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      data.header_type === "IMAGE" && /* @__PURE__ */ jsx(Image, { className: "h-5 w-5 text-blue-600" }),
                      data.header_type === "VIDEO" && /* @__PURE__ */ jsx(Video, { className: "h-5 w-5 text-blue-600" }),
                      data.header_type === "DOCUMENT" && /* @__PURE__ */ jsx(File, { className: "h-5 w-5 text-blue-600" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Media uploaded" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        onClick: () => {
                          setData("header_media_url", "");
                          setMediaPreview(null);
                        },
                        children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
                      }
                    )
                  ] }),
                  data.header_type === "IMAGE" && (mediaPreview || data.header_media_url) && /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: mediaPreview || data.header_media_url,
                      alt: "Preview",
                      className: "max-w-full h-auto max-h-48 rounded-lg"
                    }
                  ),
                  (data.header_type === "VIDEO" || data.header_type === "DOCUMENT") && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400 break-all", children: mediaPreview || data.header_media_url })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20", children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Body *" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Main message content with optional variables" })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 pt-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "body_text", children: "Body Text *" }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    id: "body_text",
                    value: data.body_text,
                    onChange: (e) => handleBodyTextChange(e.target.value),
                    placeholder: `Hello! Your order {{1}} is ready. Pickup time: {{2}}`,
                    rows: 6,
                    maxLength: 1024,
                    className: "font-mono"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                    data.body_text.length,
                    "/1024 characters"
                  ] }),
                  variableCount > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "text-xs", children: [
                    variableCount,
                    " variable",
                    variableCount > 1 ? "s" : "",
                    " detected"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                  "Use ",
                  "{{1}}",
                  ", ",
                  "{{2}}",
                  ", etc. for variables"
                ] }),
                errors.body_text && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.body_text })
              ] }),
              variableCount > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Variable Examples (Optional)" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-2", children: "Provide example values for preview and testing" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Array.from({ length: variableCount }, (_, i) => i + 1).map((varNum) => /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: data.body_examples?.[varNum - 1] || "",
                    onChange: (e) => updateBodyExample(varNum - 1, e.target.value),
                    placeholder: `Example for variable {{${varNum}}}`,
                    className: "flex-1"
                  }
                ) }, varNum)) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20", children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Footer (Optional)" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Add a footer to your template" })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "footer_text", children: "Footer Text" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "footer_text",
                  value: data.footer_text || "",
                  onChange: (e) => setData("footer_text", e.target.value),
                  placeholder: "Footer text (max 60 characters)",
                  maxLength: 60
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                (data.footer_text || "").length,
                "/60 characters"
              ] }),
              errors.footer_text && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.footer_text })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(CardTitle, { children: "Buttons (Optional)" }),
                /* @__PURE__ */ jsx(CardDescription, { children: "Add up to 3 buttons to your template" })
              ] }),
              (data.buttons?.length || 0) < 3 && /* @__PURE__ */ jsxs(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  size: "sm",
                  onClick: addButton,
                  children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
                    "Add Button"
                  ]
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx(CardContent, { className: "space-y-4 pt-6", children: data.buttons && data.buttons.length > 0 ? data.buttons.map((button, index) => /* @__PURE__ */ jsx(Card, { className: "border border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs(Label, { children: [
                  "Button ",
                  index + 1
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    onClick: () => removeButton(index),
                    children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-red-600" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Button Type *" }),
                /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: button.type,
                    onValueChange: (value) => updateButton(index, "type", value),
                    children: [
                      /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { children: button.type === "QUICK_REPLY" ? "Quick Reply" : button.type === "URL" ? "URL" : button.type === "PHONE_NUMBER" ? "Phone Number" : "Select button type" }) }),
                      /* @__PURE__ */ jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsx(SelectItem, { value: "QUICK_REPLY", children: "Quick Reply" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "URL", children: "URL" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "PHONE_NUMBER", children: "Phone Number" })
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Button Text *" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: button.text,
                    onChange: (e) => updateButton(index, "text", e.target.value),
                    placeholder: "Button text (max 20 characters)",
                    maxLength: 20
                  }
                ),
                errors[`buttons.${index}.text`] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors[`buttons.${index}.text`] })
              ] }),
              button.type === "URL" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { children: "URL *" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      type: "url",
                      value: button.url || "",
                      onChange: (e) => updateButton(index, "url", e.target.value),
                      placeholder: "https://example.com"
                    }
                  ),
                  errors[`buttons.${index}.url`] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors[`buttons.${index}.url`] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { children: "URL Example (Optional)" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      value: button.url_example || "",
                      onChange: (e) => updateButton(index, "url_example", e.target.value),
                      placeholder: `https://example.com/{{1}}`
                    }
                  )
                ] })
              ] }),
              button.type === "PHONE_NUMBER" && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Phone Number *" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: button.phone_number || "",
                    onChange: (e) => updateButton(index, "phone_number", e.target.value),
                    placeholder: "+1234567890"
                  }
                ),
                errors[`buttons.${index}.phone_number`] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors[`buttons.${index}.phone_number`] })
              ] })
            ] }) }, index)) : /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: /* @__PURE__ */ jsx("p", { children: 'No buttons added. Click "Add Button" to add one.' }) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-6", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("app.whatsapp.templates.index", {}),
              children: /* @__PURE__ */ jsx(Button, { variant: "secondary", children: "Cancel" })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              disabled: submitting || processing,
              className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50",
              children: submitting || processing ? "Creating..." : "Create Template"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  TemplatesCreate as default
};
