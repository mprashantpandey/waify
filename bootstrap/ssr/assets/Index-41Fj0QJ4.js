import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { T as ThemedIconTile, S as StatusBadge, I as IconButton, M as Modal } from "./Elements-EbyZDnT_.js";
import { Zap, Plus, MessageSquareText, CheckCircle2, BarChart3, Search, Copy, Edit3, Power, Trash2 } from "lucide-react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
function shortcutFromLabel(label) {
  const shortcut = label.toLowerCase().replace(/[^a-z0-9\s_-]/g, "").replace(/[\s-]+/g, "_").replace(/^_+|_+$/g, "");
  return shortcut || "reply";
}
function formatNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? new Intl.NumberFormat("en-IN").format(numeric) : "0";
}
function QuickRepliesIndex({
  quickReplies,
  filters,
  stats
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState(filters.search || "");
  const [typeFilter, setTypeFilter] = useState(filters.type || "all");
  const [editingReply, setEditingReply] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data, setData, processing, errors, reset } = useForm({
    type: "reply",
    label: "",
    shortcut: "",
    message: "Hi {{name}}, ",
    is_active: true
  });
  const openCreate = (type = "reply") => {
    reset();
    setEditingReply(null);
    setData({
      type,
      label: "",
      shortcut: "",
      message: type === "button" ? "" : "Hi {{name}}, ",
      is_active: true
    });
    setModalOpen(true);
  };
  const openEdit = (reply) => {
    setEditingReply(reply);
    setData({
      type: reply.type || "reply",
      label: reply.label,
      shortcut: reply.shortcut,
      message: reply.message,
      is_active: reply.is_active
    });
    setModalOpen(true);
  };
  const submit = () => {
    const payload = {
      ...data,
      type: data.type,
      label: data.label.trim(),
      shortcut: (data.shortcut || shortcutFromLabel(data.label)).trim(),
      message: data.type === "button" ? data.label.trim() : data.message.trim()
    };
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(editingReply ? "Quick reply updated" : "Quick reply created");
        setModalOpen(false);
      },
      onError: () => toast.error(editingReply ? "Failed to update quick reply" : "Failed to create quick reply")
    };
    if (editingReply) {
      router.patch(route("app.quick-replies.update", { quickReply: editingReply.id }), payload, options);
      return;
    }
    router.post(route("app.quick-replies.store", {}), payload, options);
  };
  const toggleReply = (reply) => {
    router.post(route("app.quick-replies.toggle", { quickReply: reply.id }), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success(reply.is_active ? "Quick reply disabled" : "Quick reply enabled"),
      onError: () => toast.error("Failed to update quick reply")
    });
  };
  const deleteReply = async (reply) => {
    const confirmed = await confirm({
      title: "Delete quick reply?",
      message: `Agents will no longer see "/${reply.shortcut}" in the inbox.`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    router.delete(route("app.quick-replies.destroy", { quickReply: reply.id }), {
      preserveScroll: true,
      onSuccess: () => toast.success("Quick reply deleted"),
      onError: () => toast.error("Failed to delete quick reply")
    });
  };
  const applySearch = () => {
    router.get(route("app.quick-replies.index", {}), { search, type: typeFilter }, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const applyType = (type) => {
    setTypeFilter(type);
    router.get(route("app.quick-replies.index", {}), { search, type }, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const firstError = useMemo(() => Object.values(errors)[0], [errors]);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Quick Replies" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page max-w-[1200px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300", children: "Inbox tools" }),
          /* @__PURE__ */ jsx("h1", { className: "module-heading", children: "Quick replies & buttons" }),
          /* @__PURE__ */ jsx("p", { className: "module-subheading", children: "Manage text snippets and saved WhatsApp button labels used from the inbox composer." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => openCreate("button"), children: [
            /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
            "New button"
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => openCreate("reply"), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "New quick reply"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
        { label: "Text replies", value: stats.replies, icon: MessageSquareText, tone: "green" },
        { label: "Saved buttons", value: stats.buttons, icon: Zap, tone: "blue" },
        { label: "Active", value: stats.active, icon: CheckCircle2, tone: "blue" },
        { label: "Total uses", value: stats.uses, icon: BarChart3, tone: "amber" }
      ].map((item) => /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx(ThemedIconTile, { tone: item.tone, children: /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.label }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(item.value) })
        ] })
      ] }) }, item.label)) }),
      /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Use in Inbox", children: "Text replies appear under Quick replies. Saved buttons appear in Interactive → Buttons and can be sent as WhatsApp reply buttons. Keep button labels under 20 characters." }),
      /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-3 p-4 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex shrink-0 gap-1 rounded-btn bg-gray-100 p-1 dark:bg-slate-800", children: [
          ["all", "All"],
          ["reply", "Replies"],
          ["button", "Buttons"]
        ].map(([type, label]) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => applyType(type),
            className: `h-8 rounded-md px-3 text-xs font-semibold transition ${typeFilter === type ? "bg-white text-waify-green-dark shadow-sm dark:bg-slate-950 dark:text-waify-green" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
            children: label
          },
          type
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "relative min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: search,
              onChange: (event) => setSearch(event.target.value),
              onKeyDown: (event) => event.key === "Enter" && applySearch(),
              placeholder: "Search by label, shortcut, or message",
              className: "pl-10"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: applySearch, className: "w-full sm:w-auto", children: "Apply" })
      ] }) }),
      quickReplies.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: Zap,
          title: typeFilter === "button" ? "No saved buttons" : "No quick replies",
          description: typeFilter === "button" ? "Create reusable WhatsApp button labels for interactive messages." : "Create your first snippet for agents replying from the inbox.",
          action: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => openCreate(typeFilter === "button" ? "button" : "reply"), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            typeFilter === "button" ? "Create button" : "Create quick reply"
          ] })
        }
      ) }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: quickReplies.map((reply) => /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: reply.is_active ? reply.type === "button" ? "blue" : "green" : "gray", children: reply.type === "button" ? /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(MessageSquareText, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: reply.label }),
              /* @__PURE__ */ jsx(StatusBadge, { tone: reply.type === "button" ? "info" : "muted", children: reply.type === "button" ? "Button" : "Reply" }),
              /* @__PURE__ */ jsx(StatusBadge, { tone: reply.is_active ? "success" : "muted", dot: true, children: reply.is_active ? "Active" : "Disabled" }),
              reply.type !== "button" && /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: [
                "/",
                reply.shortcut
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 whitespace-pre-wrap text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted", children: reply.type === "button" ? `Button text: ${reply.label}` : reply.message }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              "Used ",
              formatNumber(reply.usage_count),
              " times"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-1 self-end md:self-start", children: [
          /* @__PURE__ */ jsx(IconButton, { "aria-label": "Copy", onClick: () => {
            navigator.clipboard?.writeText(reply.message);
            toast.success("Copied");
          }, children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(IconButton, { "aria-label": "Edit", variant: "outline", onClick: () => openEdit(reply), children: /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(IconButton, { "aria-label": reply.is_active ? "Disable" : "Enable", variant: "outline", onClick: () => toggleReply(reply), children: /* @__PURE__ */ jsx(Power, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(IconButton, { "aria-label": "Delete", variant: "danger", onClick: () => deleteReply(reply), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }) }, reply.id)) }),
      /* @__PURE__ */ jsx(
        Modal,
        {
          open: modalOpen,
          onClose: () => setModalOpen(false),
          title: editingReply ? data.type === "button" ? "Edit saved button" : "Edit quick reply" : data.type === "button" ? "New saved button" : "New quick reply",
          description: data.type === "button" ? "Saved buttons are used in Interactive → Buttons. WhatsApp allows up to 3 buttons per message." : "Keep snippets short, clear, and ready for inbox agents.",
          className: "max-w-xl",
          footer: /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setModalOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { type: "button", onClick: submit, disabled: processing, children: "Save" })
          ] }),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            firstError && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200", children: firstError }),
            !editingReply && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 rounded-card bg-gray-100 p-1 dark:bg-slate-800", children: [
              ["reply", "Quick reply", MessageSquareText],
              ["button", "Button", Zap]
            ].map(([type, label, Icon]) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setData({
                  ...data,
                  type,
                  message: type === "button" ? data.label : data.message || "Hi {{name}}, "
                }),
                className: `inline-flex h-9 items-center justify-center gap-2 rounded-md text-xs font-semibold transition ${data.type === type ? "bg-white text-waify-green-dark shadow-sm dark:bg-slate-950 dark:text-waify-green" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
                children: [
                  /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
                  label
                ]
              },
              type
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: data.type === "button" ? "Button text" : "Label" }),
                /* @__PURE__ */ jsx(TextInput, { value: data.label, onChange: (event) => {
                  const value = data.type === "button" ? event.target.value.slice(0, 20) : event.target.value;
                  setData("label", value);
                  if (!editingReply && !data.shortcut) {
                    setData("shortcut", shortcutFromLabel(value));
                  }
                }, placeholder: data.type === "button" ? "Talk to sales" : "Order status" }),
                data.type === "button" && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  data.label.length,
                  "/20 characters"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: data.type === "button" ? "hidden" : "", children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Shortcut" }),
                /* @__PURE__ */ jsx(TextInput, { value: data.shortcut, onChange: (event) => setData("shortcut", event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_")), placeholder: "order_status" })
              ] })
            ] }),
            data.type !== "button" && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Message" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  rows: 7,
                  value: data.message,
                  onChange: (event) => setData("message", event.target.value),
                  className: "w-full resize-none rounded-btn border border-gray-200 bg-white p-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text",
                  placeholder: "Hi {{name}}, your order is being checked now."
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                "Variables: ",
                "{{name}}",
                ", ",
                "{{order_id}}",
                ", ",
                "{{ticket_id}}"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.is_active, onChange: (event) => setData("is_active", event.target.checked), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: data.type === "button" ? "Show this button in Interactive messages" : "Show this reply in the inbox" })
            ] })
          ] })
        }
      )
    ] })
  ] });
}
export {
  QuickRepliesIndex as default
};
