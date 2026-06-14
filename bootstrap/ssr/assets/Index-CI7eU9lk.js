import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { useForm, Head, router } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { Plus, Paperclip, Send } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { M as Modal, F as FileDropzone, U as UploadedFileRow } from "./Elements-EbyZDnT_.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import "./BrandingWrapper-CZn0jBQL.js";
import "./useToast-BN7qsQL3.js";
import "axios";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
const ticketStatus = {
  open: { label: "Open", variant: "warning" },
  in_progress: { label: "In progress", variant: "info" },
  pending: { label: "Waiting on you", variant: "secondary" },
  waiting: { label: "Waiting on you", variant: "secondary" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Resolved", variant: "success" }
};
const priorityClass = {
  urgent: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-100 dark:ring-red-400/25",
  high: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-400/25",
  normal: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-100 dark:ring-blue-400/25",
  low: "bg-gray-50 text-gray-700 ring-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
};
function relativeTime(value) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 6e4));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
function PriorityBadge({ priority = "normal" }) {
  return /* @__PURE__ */ jsx("span", { className: cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1", priorityClass[priority] ?? priorityClass.normal), children: priority });
}
function SupportIndex({
  threads,
  selectedThreadId,
  messages = []
}) {
  const [selectedId, setSelectedId] = useState(selectedThreadId ?? threads[0]?.id ?? null);
  const [filter, setFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  useEffect(() => {
    setSelectedId(selectedThreadId ?? threads[0]?.id ?? null);
  }, [selectedThreadId, threads]);
  const selected = useMemo(
    () => threads.find((thread) => thread.id === selectedId) ?? threads[0] ?? null,
    [selectedId, threads]
  );
  const filtered = useMemo(() => {
    if (filter === "all") return threads;
    if (filter === "resolved") return threads.filter((thread) => ["resolved", "closed"].includes(thread.status));
    return threads.filter((thread) => thread.status === filter);
  }, [filter, threads]);
  const createForm = useForm({
    subject: "",
    message: "",
    category: "Templates",
    tags: "",
    attachments: []
  });
  const replyForm = useForm({
    message: "",
    attachments: []
  });
  const submitTicket = (event) => {
    event.preventDefault();
    createForm.post(route("app.support.store", {}), {
      forceFormData: true,
      onSuccess: () => {
        createForm.reset();
        setNewOpen(false);
      }
    });
  };
  const submitReply = (event) => {
    event.preventDefault();
    if (!selected) return;
    replyForm.post(route("app.support.message", { thread: selected.slug ?? selected.id }), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => replyForm.reset()
    });
  };
  const openThread = (thread) => {
    setSelectedId(thread.id);
    router.get(
      route("app.support.index", { thread: thread.slug ?? thread.id }),
      {},
      {
        preserveScroll: true,
        preserveState: true,
        only: ["selectedThreadId", "messages"]
      }
    );
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Support" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] space-y-4 p-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text", children: "Support" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Tickets, help, and account assistance" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => setNewOpen(true), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " New ticket"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap gap-2", children: ["all", "open", "in_progress", "waiting", "resolved"].map((item) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setFilter(item),
          className: cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition",
            filter === item ? "bg-waify-green text-white dark:text-waify-ink" : "bg-gray-100 text-waify-text-muted hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          ),
          children: item === "all" ? "All" : ticketStatus[item]?.label || item
        },
        item
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "grid min-h-[480px] grid-cols-1 gap-4 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxs(Card, { className: "flex max-h-[640px] flex-col overflow-hidden p-0 lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 px-4 py-3 text-sm font-semibold text-waify-text dark:border-slate-700 dark:text-waify-dark-text", children: [
            filtered.length,
            " tickets"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "flex-1 divide-y divide-gray-100 overflow-y-auto dark:divide-slate-700", children: [
            filtered.length === 0 && /* @__PURE__ */ jsx("li", { className: "p-6 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No tickets found." }),
            filtered.map((thread) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => openThread(thread),
                className: cn(
                  "w-full px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-slate-800/50",
                  selected?.id === thread.id && "border-l-2 border-waify-green bg-waify-green/5"
                ),
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                      "TKT-",
                      thread.id
                    ] }),
                    /* @__PURE__ */ jsx(PriorityBadge, { priority: thread.priority ?? "normal" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: thread.subject }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Badge, { variant: ticketStatus[thread.status]?.variant || "secondary", children: ticketStatus[thread.status]?.label || thread.status }),
                    /* @__PURE__ */ jsx("span", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: relativeTime(thread.last_message_at ?? thread.created_at) })
                  ] })
                ]
              }
            ) }, thread.id))
          ] })
        ] }),
        /* @__PURE__ */ jsx(Card, { className: "flex max-h-[640px] flex-col overflow-hidden p-0 lg:col-span-3", children: selected ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-5 py-4 dark:border-slate-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: selected.subject }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                "TKT-",
                selected.id,
                " · ",
                selected.category || "General",
                " · Support inbox"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: ticketStatus[selected.status]?.variant || "secondary", children: ticketStatus[selected.status]?.label || selected.status })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-5 dark:bg-slate-950/30", children: [
            messages.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-dashed border-waify-border bg-white/70 p-4 text-sm text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70 dark:text-waify-dark-text-muted", children: "No messages yet. Add details using the reply box below." }),
            messages.map((message) => {
              const fromMe = message.sender_type === "user";
              return /* @__PURE__ */ jsx("div", { className: cn("flex", fromMe ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxs(
                "div",
                {
                  className: cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm",
                    fromMe ? "bg-waify-green/15 dark:bg-waify-green/20" : "border border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-800"
                  ),
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "text-waify-text dark:text-waify-dark-text", children: message.body }),
                    message.attachments && message.attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1", children: message.attachments.map((attachment) => /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: attachment.url,
                        target: "_blank",
                        rel: "noreferrer",
                        className: "block text-xs font-medium text-waify-green-dark underline-offset-2 hover:underline dark:text-emerald-200",
                        children: attachment.file_name
                      },
                      attachment.id
                    )) }),
                    /* @__PURE__ */ jsx("span", { className: "mt-1 block text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: relativeTime(message.created_at) })
                  ]
                }
              ) }, message.id);
            })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submitReply, className: "flex gap-2 border-t border-gray-100 p-4 dark:border-slate-700", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                value: replyForm.data.message,
                onChange: (event) => replyForm.setData("message", event.target.value),
                placeholder: "Reply to support...",
                className: "h-10 flex-1 rounded-btn border border-waify-border px-3 text-sm text-waify-text outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text"
              }
            ),
            /* @__PURE__ */ jsxs("label", { className: "inline-flex h-10 cursor-pointer items-center justify-center rounded-btn border border-waify-border px-3 text-waify-text-muted hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("input", { type: "file", multiple: true, className: "hidden", onChange: (event) => replyForm.setData("attachments", Array.from(event.target.files || [])) })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: replyForm.processing || replyForm.data.message.trim().length === 0 && replyForm.data.attachments.length === 0, children: "Send" })
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center p-8 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Select a ticket" }) })
      ] }),
      /* @__PURE__ */ jsx(Modal, { open: newOpen, onClose: () => setNewOpen(false), title: "Create support ticket", children: /* @__PURE__ */ jsxs("form", { onSubmit: submitTicket, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "subject", className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Subject" }),
          /* @__PURE__ */ jsx(TextInput, { id: "subject", value: createForm.data.subject, onChange: (event) => createForm.setData("subject", event.target.value), placeholder: "Brief summary of your issue", className: "w-full" }),
          /* @__PURE__ */ jsx(InputError, { message: createForm.errors.subject, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "category", className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Category" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "category",
              value: createForm.data.category,
              onChange: (event) => createForm.setData("category", event.target.value),
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm text-waify-text outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text",
              children: ["Templates", "Billing", "Developer", "Integrations", "Other"].map((category) => /* @__PURE__ */ jsx("option", { value: category, children: category }, category))
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: createForm.errors.category, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "message", className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "message",
              rows: 4,
              value: createForm.data.message,
              onChange: (event) => createForm.setData("message", event.target.value),
              className: "w-full rounded-btn border border-waify-border px-3 py-2 text-sm text-waify-text outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text",
              placeholder: "Describe what happened..."
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: createForm.errors.message, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsx(
          FileDropzone,
          {
            label: "Attach files",
            description: "Screenshots, PDFs, logs, or CSV samples.",
            onFile: (file) => createForm.setData("attachments", [...createForm.data.attachments, file])
          }
        ),
        createForm.data.attachments.map((file, index) => /* @__PURE__ */ jsx(
          UploadedFileRow,
          {
            name: file.name,
            meta: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            status: "done",
            onRemove: () => createForm.setData("attachments", createForm.data.attachments.filter((_, itemIndex) => itemIndex !== index))
          },
          `${file.name}-${index}`
        )),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setNewOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: createForm.processing, children: [
            /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
            " Submit"
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  SupportIndex as default
};
