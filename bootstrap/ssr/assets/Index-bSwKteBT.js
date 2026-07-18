import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { I as IconButton, D as Drawer, M as Modal } from "./Elements-EbyZDnT_.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Activity, Plus, AlertCircle, Bot, Workflow, Zap, Clock, Edit3, Trash2, Play } from "lucide-react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import { useState, useEffect } from "react";
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
function formatNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? new Intl.NumberFormat("en-IN").format(numeric) : "0";
}
function formatRelative(value) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function statusBadge(status) {
  const normalized = status.toLowerCase();
  if (normalized === "active") return /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Active" });
  if (normalized === "paused") return /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Paused" });
  return /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Draft" });
}
function actionLabel(actionType) {
  return String(actionType || "send_text").replace(/_/g, " ");
}
function AutomationCard({
  bot,
  onDelete
}) {
  return /* @__PURE__ */ jsx(Card, { className: "group overflow-hidden border-transparent transition hover:-translate-y-0.5 hover:shadow-card-lg dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-[#101827] to-[#172033] p-4 text-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15", children: /* @__PURE__ */ jsx(Workflow, { className: "h-5 w-5 text-emerald-300" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.index", { bot: bot.id }), className: "truncate text-base font-semibold hover:text-emerald-200", children: bot.name }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1.5 text-xs text-white/65", children: [
              /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3" }),
              bot.applies_to?.all_connections ? "All WABA accounts" : `${bot.applies_to?.connection_ids?.length || 0} selected WABA`
            ] })
          ] })
        ] }),
        statusBadge(bot.status)
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-2 text-sm leading-5 text-white/70", children: bot.description || "WhatsApp automation flow for inbound conversations." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 border-b border-gray-100 bg-white dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Flows" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(bot.flows_count) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-x border-gray-100 p-3 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Runs" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(bot.executions_count) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Runnable" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(bot.runnable_flows_count ?? 0) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-white p-3 dark:bg-waify-dark-surface", children: [
      bot.status === "active" && bot.is_runnable === false && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-btn border border-amber-200 bg-amber-50 p-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
        "Active but no runnable flow"
      ] }),
      bot.errors_count > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-btn border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
        formatNumber(bot.errors_count),
        " failed run",
        bot.errors_count === 1 ? "" : "s"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
          "Last run ",
          formatRelative(bot.last_run_at)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.builder", { bot: bot.id }), children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "h-8", children: [
            /* @__PURE__ */ jsx(Workflow, { className: "h-4 w-4" }),
            "Builder"
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.index", { bot: bot.id }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", className: "h-8", children: [
            /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
            "Details"
          ] }) }),
          /* @__PURE__ */ jsx(IconButton, { variant: "danger", size: "sm", onClick: () => onDelete(bot), "aria-label": "Delete automation", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] })
  ] }) });
}
function CreateBotDrawer({
  open,
  onClose,
  connections
}) {
  const form = useForm({
    name: "",
    description: "",
    status: "draft",
    applies_to: {
      all_connections: true,
      connection_ids: []
    },
    stop_on_first_flow: true,
    starter_flow_mode: "guided",
    starter_trigger_type: "inbound_message",
    starter_keywords: "",
    starter_reply_message: "Hi! Thanks for messaging us. A team member will get back to you shortly."
  });
  const submit = (event) => {
    event.preventDefault();
    form.post(route("app.chatbots.store", {}), {
      preserveScroll: true,
      onSuccess: onClose
    });
  };
  return /* @__PURE__ */ jsx(
    Drawer,
    {
      open,
      onClose,
      title: "Create automation",
      description: "Start with a simple inbound trigger, then open the flow builder from the automation card.",
      className: "sm:max-w-2xl",
      footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "submit", form: "bot-create-form", disabled: form.processing, children: form.processing ? "Creating..." : "Create automation" })
      ] }),
      children: /* @__PURE__ */ jsxs("form", { id: "bot-create-form", onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Name" }),
            /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: (event) => form.setData("name", event.target.value), placeholder: "Support Assistant" }),
            /* @__PURE__ */ jsx(InputError, { message: form.errors.name, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Status" }),
            /* @__PURE__ */ jsxs("select", { value: form.data.status, onChange: (event) => form.setData("status", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
              /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
              /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
          /* @__PURE__ */ jsx("textarea", { value: form.data.description, onChange: (event) => form.setData("description", event.target.value), rows: 2, className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-btn border border-gray-100 p-3 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "All WABA accounts" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Recommended for one-workspace-one-WABA setup." })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: form.data.applies_to.all_connections,
              onChange: (event) => form.setData("applies_to", { ...form.data.applies_to, all_connections: event.target.checked }),
              className: "rounded border-gray-300 text-waify-green focus:ring-waify-green/30"
            }
          )
        ] }),
        !form.data.applies_to.all_connections && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Connections" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              multiple: true,
              value: form.data.applies_to.connection_ids.map(String),
              onChange: (event) => form.setData("applies_to", {
                ...form.data.applies_to,
                connection_ids: Array.from(event.target.selectedOptions).map((option) => Number(option.value))
              }),
              className: "min-h-28 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
              children: connections.map((connection) => /* @__PURE__ */ jsx("option", { value: connection.id, children: connection.name }, connection.id))
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: form.errors["applies_to.connection_ids"], className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Starter trigger" }),
          /* @__PURE__ */ jsxs("select", { value: form.data.starter_trigger_type, onChange: (event) => form.setData("starter_trigger_type", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx("option", { value: "inbound_message", children: "Any inbound message" }),
            /* @__PURE__ */ jsx("option", { value: "keyword", children: "Keyword" })
          ] })
        ] }),
        form.data.starter_trigger_type === "keyword" && /* @__PURE__ */ jsx(TextInput, { value: form.data.starter_keywords, onChange: (event) => form.setData("starter_keywords", event.target.value), placeholder: "pricing, demo, help" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "First reply" }),
          /* @__PURE__ */ jsx("textarea", { value: form.data.starter_reply_message, onChange: (event) => form.setData("starter_reply_message", event.target.value), rows: 4, className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" })
        ] })
      ] })
    }
  );
}
function NodeConfigFields({
  editor,
  options,
  onChange
}) {
  const config = editor.config || {};
  const actionType = config.action_type || "send_text";
  const inputClass = "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none transition focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text";
  const textAreaClass = "mt-1 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none transition focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text";
  if (editor.type === "condition") {
    return /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Condition type",
        /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.type || "text_contains", onChange: (event) => onChange("type", event.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "text_contains", children: "Text contains" }),
          /* @__PURE__ */ jsx("option", { value: "text_equals", children: "Text equals" }),
          /* @__PURE__ */ jsx("option", { value: "text_starts_with", children: "Text starts with" }),
          /* @__PURE__ */ jsx("option", { value: "regex_match", children: "Regex match" }),
          /* @__PURE__ */ jsx("option", { value: "tags_contains", children: "Contact has tag" }),
          /* @__PURE__ */ jsx("option", { value: "conversation_status", children: "Conversation status" })
        ] })
      ] }),
      config.type === "regex_match" ? /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Pattern",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.pattern || "", onChange: (event) => onChange("pattern", event.target.value), placeholder: "/pricing|plans|price/i" })
      ] }) : /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Value",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.value || "", onChange: (event) => onChange("value", event.target.value) })
      ] })
    ] });
  }
  if (editor.type === "delay") {
    return /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
      "Delay seconds",
      /* @__PURE__ */ jsx(TextInput, { className: "mt-1", type: "number", min: "1", value: config.seconds || 60, onChange: (event) => onChange("seconds", Number(event.target.value)) })
    ] });
  }
  if (editor.type === "webhook") {
    return /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Webhook URL",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.url || "", onChange: (event) => onChange("url", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Method",
        /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.method || "POST", onChange: (event) => onChange("method", event.target.value), children: [
          /* @__PURE__ */ jsx("option", { children: "POST" }),
          /* @__PURE__ */ jsx("option", { children: "GET" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
    /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
      "Action",
      /* @__PURE__ */ jsxs("select", { className: inputClass, value: actionType, onChange: (event) => onChange("action_type", event.target.value), children: [
        /* @__PURE__ */ jsx("option", { value: "send_text", children: "Send text" }),
        /* @__PURE__ */ jsx("option", { value: "send_buttons", children: "Send buttons" }),
        /* @__PURE__ */ jsx("option", { value: "send_template", children: "Send template" }),
        /* @__PURE__ */ jsx("option", { value: "send_media", children: "Send media" }),
        /* @__PURE__ */ jsx("option", { value: "send_flow", children: "Send form flow" }),
        /* @__PURE__ */ jsx("option", { value: "send_list", children: "Send interactive list" }),
        /* @__PURE__ */ jsx("option", { value: "add_tag", children: "Add tag" }),
        /* @__PURE__ */ jsx("option", { value: "add_segment", children: "Add segment" }),
        /* @__PURE__ */ jsx("option", { value: "update_contact", children: "Update contact" }),
        /* @__PURE__ */ jsx("option", { value: "assign_agent", children: "Assign agent" }),
        /* @__PURE__ */ jsx("option", { value: "handoff", children: "Human handoff" }),
        /* @__PURE__ */ jsx("option", { value: "create_deal", children: "Create deal" }),
        /* @__PURE__ */ jsx("option", { value: "create_appointment", children: "Create appointment" }),
        /* @__PURE__ */ jsx("option", { value: "sync_integration", children: "Sync integration" }),
        /* @__PURE__ */ jsx("option", { value: "send_payment_link", children: "Send payment link" }),
        /* @__PURE__ */ jsx("option", { value: "ai_agent_reply", children: "AI agent reply" })
      ] })
    ] }),
    actionType === "send_text" && /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
      "Message",
      /* @__PURE__ */ jsx("textarea", { className: textAreaClass, rows: 5, value: config.message || "", onChange: (event) => onChange("message", event.target.value) })
    ] }),
    actionType === "send_buttons" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Header",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.header_text || "", onChange: (event) => onChange("header_text", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Body",
        /* @__PURE__ */ jsx("textarea", { className: textAreaClass, rows: 4, value: config.body_text || "", onChange: (event) => onChange("body_text", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Footer",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.footer_text || "", onChange: (event) => onChange("footer_text", event.target.value) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: [0, 1, 2].map((index) => {
        const buttons = Array.isArray(config.buttons) ? config.buttons : [];
        const button = buttons[index] || {};
        const setButton = (key, value) => {
          const next = [...buttons];
          next[index] = { ...next[index] || {}, [key]: value };
          onChange("buttons", next.filter((item) => item?.id || item?.text));
        };
        return /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(TextInput, { value: button.id || "", onChange: (event) => setButton("id", event.target.value), placeholder: `button_${index + 1}` }),
          /* @__PURE__ */ jsx(TextInput, { value: button.text || "", onChange: (event) => setButton("text", event.target.value), placeholder: `Button ${index + 1}` })
        ] }, index);
      }) })
    ] }),
    actionType === "send_template" && /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
      "Template",
      /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.template_id || "", onChange: (event) => onChange("template_id", Number(event.target.value)), children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Select template" }),
        options.templates.map((template) => /* @__PURE__ */ jsxs("option", { value: template.id, children: [
          template.name,
          " · ",
          template.language || "default",
          " · ",
          template.status || "unknown"
        ] }, template.id))
      ] })
    ] }),
    actionType === "send_list" && /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
      "Interactive list",
      /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.list_id || "", onChange: (event) => onChange("list_id", Number(event.target.value)), children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Select list" }),
        options.lists.map((list) => /* @__PURE__ */ jsx("option", { value: list.id, children: list.name }, list.id))
      ] })
    ] }),
    actionType === "send_flow" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "WhatsApp Flow",
          /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.flow_id || "", onChange: (event) => onChange("flow_id", Number(event.target.value)), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Use Meta flow ID" }),
            (options.flows || []).map((flow) => /* @__PURE__ */ jsxs("option", { value: flow.id, children: [
              flow.name,
              " · ",
              flow.status || "draft"
            ] }, flow.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Meta flow ID",
          /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.meta_flow_id || "", onChange: (event) => onChange("meta_flow_id", event.target.value), placeholder: "1234567890" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Body",
        /* @__PURE__ */ jsx("textarea", { className: textAreaClass, rows: 3, value: config.body_text || "", onChange: (event) => onChange("body_text", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "CTA",
          /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.cta || "Open form", onChange: (event) => onChange("cta", event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Start screen",
          /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.screen || "", onChange: (event) => onChange("screen", event.target.value), placeholder: "optional" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Header",
          /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.header_text || "", onChange: (event) => onChange("header_text", event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Footer",
          /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.footer_text || "", onChange: (event) => onChange("footer_text", event.target.value) })
        ] })
      ] })
    ] }),
    actionType === "send_media" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Media type",
          /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.media_type || "image", onChange: (event) => onChange("media_type", event.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "image", children: "Image" }),
            /* @__PURE__ */ jsx("option", { value: "document", children: "Document" }),
            /* @__PURE__ */ jsx("option", { value: "video", children: "Video" }),
            /* @__PURE__ */ jsx("option", { value: "audio", children: "Audio" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Filename",
          /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.filename || "", onChange: (event) => onChange("filename", event.target.value), placeholder: "zyptos-overview.pdf" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Public media URL",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.media_url || "", onChange: (event) => onChange("media_url", event.target.value), placeholder: "https://..." })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Caption",
        /* @__PURE__ */ jsx("textarea", { className: textAreaClass, rows: 3, value: config.caption || "", onChange: (event) => onChange("caption", event.target.value) })
      ] })
    ] }),
    actionType === "add_tag" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Existing tag",
        /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.tag_id || "", onChange: (event) => onChange("tag_id", Number(event.target.value)), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Create by name" }),
          options.tags.map((tag) => /* @__PURE__ */ jsx("option", { value: tag.id, children: tag.name }, tag.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "New tag name",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.tag_name || "", onChange: (event) => onChange("tag_name", event.target.value) })
      ] })
    ] }),
    actionType === "add_segment" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Existing segment",
        /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.segment_id || "", onChange: (event) => onChange("segment_id", Number(event.target.value)), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Create by name" }),
          (options.segments || []).map((segment) => /* @__PURE__ */ jsx("option", { value: segment.id, children: segment.name }, segment.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "New segment name",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.segment_name || "", onChange: (event) => onChange("segment_name", event.target.value) })
      ] })
    ] }),
    actionType === "update_contact" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Status",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.status || "", onChange: (event) => onChange("status", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Source",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.source || "", onChange: (event) => onChange("source", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Company",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.company || "", onChange: (event) => onChange("company", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Email",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.email || "", onChange: (event) => onChange("email", event.target.value) })
      ] })
    ] }),
    (actionType === "assign_agent" || actionType === "handoff") && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Agent",
        /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.agent_id || "", onChange: (event) => onChange("agent_id", Number(event.target.value)), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "No specific agent" }),
          options.agents.map((agent) => /* @__PURE__ */ jsx("option", { value: agent.id, children: agent.name }, agent.id))
        ] })
      ] }),
      actionType === "handoff" && /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Priority",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.priority || "high", onChange: (event) => onChange("priority", event.target.value) })
      ] }),
      actionType === "handoff" && /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text sm:col-span-2", children: [
        "Reason",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.reason || "", onChange: (event) => onChange("reason", event.target.value) })
      ] })
    ] }),
    actionType === "create_deal" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text sm:col-span-2", children: [
        "Deal title",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.title || "", onChange: (event) => onChange("title", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Stage",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.stage || "new", onChange: (event) => onChange("stage", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Value paise",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", type: "number", value: config.value || 0, onChange: (event) => onChange("value", Number(event.target.value)) })
      ] })
    ] }),
    actionType === "create_appointment" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text sm:col-span-2", children: [
        "Title",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.title || "WhatsApp appointment", onChange: (event) => onChange("title", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Minutes from now",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", type: "number", value: config.minutes_from_now || 60, onChange: (event) => onChange("minutes_from_now", Number(event.target.value)) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Duration minutes",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", type: "number", value: config.duration_minutes || 30, onChange: (event) => onChange("duration_minutes", Number(event.target.value)) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Staff",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.staff_name || "", onChange: (event) => onChange("staff_name", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Location",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.location || "", onChange: (event) => onChange("location", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text sm:col-span-2", children: [
        "Meeting URL",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.meeting_url || "", onChange: (event) => onChange("meeting_url", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text sm:col-span-2", children: [
        "Notes",
        /* @__PURE__ */ jsx("textarea", { className: textAreaClass, rows: 3, value: config.description || "", onChange: (event) => onChange("description", event.target.value) })
      ] })
    ] }),
    actionType === "sync_integration" && /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
      "Integration",
      /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.provider || "meta-leads", onChange: (event) => onChange("provider", event.target.value), children: [
        /* @__PURE__ */ jsx("option", { value: "meta-leads", children: "Meta Leads" }),
        /* @__PURE__ */ jsx("option", { value: "google-sheets", children: "Google Sheets" }),
        /* @__PURE__ */ jsx("option", { value: "google-calendar", children: "Google Calendar" }),
        /* @__PURE__ */ jsx("option", { value: "shopify", children: "Shopify" }),
        /* @__PURE__ */ jsx("option", { value: "woocommerce", children: "WooCommerce" })
      ] })
    ] }),
    actionType === "send_payment_link" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-btn border border-gray-100 p-3 text-sm font-medium text-waify-text dark:border-waify-dark-border dark:text-waify-dark-text", children: [
        "Create Razorpay link dynamically",
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: Boolean(config.create_razorpay_link), onChange: (event) => onChange("create_razorpay_link", event.target.checked), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green/30" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Amount paise",
          /* @__PURE__ */ jsx(TextInput, { className: "mt-1", type: "number", value: config.amount || 0, onChange: (event) => onChange("amount", Number(event.target.value)) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Currency",
          /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.currency || "INR", onChange: (event) => onChange("currency", event.target.value.toUpperCase()) })
        ] })
      ] }),
      !config.create_razorpay_link && /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Payment URL",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.payment_url || "", onChange: (event) => onChange("payment_url", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Description",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.description || "", onChange: (event) => onChange("description", event.target.value), placeholder: "Order payment" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Message",
        /* @__PURE__ */ jsx("textarea", { className: textAreaClass, rows: 3, value: config.message || "", onChange: (event) => onChange("message", event.target.value) })
      ] })
    ] }),
    actionType === "ai_agent_reply" && /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "AI agent",
          /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.agent_id || "", onChange: (event) => onChange("agent_id", Number(event.target.value)), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Auto by role" }),
            (options.ai_agents || []).map((agent) => /* @__PURE__ */ jsxs("option", { value: agent.id, children: [
              agent.name,
              " · ",
              agent.role || "agent"
            ] }, agent.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Fallback role",
          /* @__PURE__ */ jsxs("select", { className: inputClass, value: config.agent_role || "sales", onChange: (event) => onChange("agent_role", event.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "sales", children: "Sales" }),
            /* @__PURE__ */ jsx("option", { value: "support", children: "Support" }),
            /* @__PURE__ */ jsx("option", { value: "sales_support", children: "Sales + support" }),
            /* @__PURE__ */ jsx("option", { value: "custom", children: "Custom" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Max reply characters",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", type: "number", min: "120", max: "3000", value: config.max_chars || 1500, onChange: (event) => onChange("max_chars", Number(event.target.value)) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Instruction",
        /* @__PURE__ */ jsx("textarea", { className: textAreaClass, rows: 4, value: config.instruction || "", onChange: (event) => onChange("instruction", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
        "Handoff rule",
        /* @__PURE__ */ jsx(TextInput, { className: "mt-1", value: config.handoff_rule || "", onChange: (event) => onChange("handoff_rule", event.target.value), placeholder: "Handoff if customer asks for human, pricing exception, or unresolved issue" })
      ] })
    ] })
  ] });
}
function BotDetailDrawer({
  bot,
  connections,
  automationOptions,
  onClose
}) {
  const [tab, setTab] = useState("overview");
  const [activeFlowId, setActiveFlowId] = useState(bot?.flows?.[0]?.id ?? null);
  useConfirm();
  const [nodeEditor, setNodeEditor] = useState(null);
  const [edgeEditor, setEdgeEditor] = useState(null);
  const form = useForm({
    name: bot?.name || "",
    description: bot?.description || "",
    status: bot?.status || "draft",
    applies_to: bot?.applies_to || { all_connections: true, connection_ids: [] },
    stop_on_first_flow: bot?.stop_on_first_flow ?? true,
    session_timeout_minutes: bot?.session_timeout_minutes ?? 1440,
    session_resume_mode: bot?.session_resume_mode || "resume",
    session_expired_message: bot?.session_expired_message || ""
  });
  useEffect(() => {
    if (!bot) return;
    form.setData({
      name: bot.name || "",
      description: bot.description || "",
      status: bot.status || "draft",
      applies_to: bot.applies_to || { all_connections: true, connection_ids: [] },
      stop_on_first_flow: bot.stop_on_first_flow ?? true,
      session_timeout_minutes: bot.session_timeout_minutes ?? 1440,
      session_resume_mode: bot.session_resume_mode || "resume",
      session_expired_message: bot.session_expired_message || ""
    });
    setTab("overview");
    setActiveFlowId(bot.flows?.[0]?.id ?? null);
  }, [bot?.id]);
  const activeFlow = bot?.flows?.length ? bot.flows.find((flow) => flow.id === activeFlowId) ?? bot.flows[0] : null;
  if (!bot) return null;
  const close = () => {
    onClose();
    router.get(route("app.chatbots.index", {}), {}, {
      preserveScroll: true,
      preserveState: true,
      replace: true
    });
  };
  const save = (event) => {
    event.preventDefault();
    form.patch(route("app.chatbots.update", { bot: bot.id }), {
      preserveScroll: true,
      only: ["selectedBot", "bots", "flash", "errors"]
    });
  };
  const setNodeConfig = (key, value) => {
    setNodeEditor((current) => current ? { ...current, config: { ...current.config, [key]: value } } : current);
  };
  const saveNodeConfig = () => {
    if (!nodeEditor) return;
    const nodeType = ["condition", "delay", "webhook"].includes(nodeEditor.type) ? nodeEditor.type : "action";
    router.patch(route("app.chatbots.nodes.update", { node: nodeEditor.node.id }), {
      type: nodeType,
      config: nodeEditor.config
    }, {
      preserveScroll: true,
      only: ["selectedBot", "bots", "flash", "errors"],
      onSuccess: () => setNodeEditor(null)
    });
  };
  const saveEdgeLabel = () => {
    if (!edgeEditor) return;
    router.patch(route("app.chatbots.edges.update", { edge: edgeEditor.edge.id }), {
      label: edgeEditor.label
    }, {
      preserveScroll: true,
      only: ["selectedBot", "bots", "flash", "errors"],
      onSuccess: () => setEdgeEditor(null)
    });
  };
  const runTest = () => {
    router.post(route("app.chatbots.test", { bot: bot.id }), {}, {
      preserveScroll: true,
      only: ["selectedBot", "bots", "flash", "errors"]
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: Boolean(bot),
        onClose: close,
        title: bot.name,
        description: `Version ${bot.version} · ${bot.flows.length} flow${bot.flows.length === 1 ? "" : "s"}`,
        className: "sm:max-w-5xl",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
          bot.flows[0] && /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.builder", { bot: bot.id, flow: bot.flows[0].id }), children: /* @__PURE__ */ jsxs(Button, { type: "button", children: [
            /* @__PURE__ */ jsx(Workflow, { className: "h-4 w-4" }),
            "Open visual builder"
          ] }) }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: runTest, children: [
            /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
            "Run test"
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: close, children: "Close" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", form: "bot-detail-form", disabled: form.processing, children: form.processing ? "Saving..." : "Save automation" })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto border-b border-gray-100 dark:border-waify-dark-border", children: [
            ["overview", "Overview"],
            ["flows", "Flows"],
            ["runs", "Runs"]
          ].map(([value, label]) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setTab(value),
              className: `relative h-10 whitespace-nowrap px-3 text-sm font-semibold transition ${tab === value ? "text-waify-text dark:text-waify-dark-text" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
              children: [
                label,
                tab === value && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-waify-green" })
              ]
            },
            value
          )) }),
          tab === "overview" && /* @__PURE__ */ jsxs("form", { id: "bot-detail-form", onSubmit: save, className: "grid gap-5 lg:grid-cols-[1fr,340px]", children: [
            /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Name" }),
                  /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: (event) => form.setData("name", event.target.value) }),
                  /* @__PURE__ */ jsx(InputError, { message: form.errors.name, className: "mt-2" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Status" }),
                  /* @__PURE__ */ jsxs("select", { value: form.data.status, onChange: (event) => form.setData("status", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
                    /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                    /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
                /* @__PURE__ */ jsx("textarea", { value: form.data.description, onChange: (event) => form.setData("description", event.target.value), rows: 3, className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-btn border border-gray-100 p-3 dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Stop after first matching flow" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Prevents multiple automations from replying to the same inbound event." })
                ] }),
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.data.stop_on_first_flow, onChange: (event) => form.setData("stop_on_first_flow", event.target.checked), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green/30" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-btn border border-gray-100 p-3 dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
                  /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                    "Session timeout",
                    /* @__PURE__ */ jsxs("select", { value: form.data.session_timeout_minutes, onChange: (event) => form.setData("session_timeout_minutes", Number(event.target.value)), className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
                      /* @__PURE__ */ jsx("option", { value: 30, children: "30 minutes" }),
                      /* @__PURE__ */ jsx("option", { value: 120, children: "2 hours" }),
                      /* @__PURE__ */ jsx("option", { value: 480, children: "8 hours" }),
                      /* @__PURE__ */ jsx("option", { value: 1440, children: "24 hours" }),
                      /* @__PURE__ */ jsx("option", { value: 10080, children: "7 days" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                    "After timeout",
                    /* @__PURE__ */ jsxs("select", { value: form.data.session_resume_mode, onChange: (event) => form.setData("session_resume_mode", event.target.value), className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
                      /* @__PURE__ */ jsx("option", { value: "resume", children: "Resume until timeout" }),
                      /* @__PURE__ */ jsx("option", { value: "restart", children: "Restart matching flows" }),
                      /* @__PURE__ */ jsx("option", { value: "expire", children: "Expire waiting session" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "mt-3 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Expired session note",
                  /* @__PURE__ */ jsx("textarea", { value: form.data.session_expired_message, onChange: (event) => form.setData("session_expired_message", event.target.value), rows: 2, className: "mt-1 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", placeholder: "Optional internal note for expired sessions" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-btn border border-gray-100 p-3 dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "All WABA accounts" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "One workspace normally uses one WABA account, so this should stay enabled." })
                ] }),
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.data.applies_to.all_connections, onChange: (event) => form.setData("applies_to", { ...form.data.applies_to, all_connections: event.target.checked }), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green/30" })
              ] }),
              !form.data.applies_to.all_connections && /* @__PURE__ */ jsx(
                "select",
                {
                  multiple: true,
                  value: (form.data.applies_to.connection_ids || []).map(String),
                  onChange: (event) => form.setData("applies_to", {
                    ...form.data.applies_to,
                    connection_ids: Array.from(event.target.selectedOptions).map((option) => Number(option.value))
                  }),
                  className: "min-h-28 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
                  children: connections.map((connection) => /* @__PURE__ */ jsx("option", { value: connection.id, children: connection.name }, connection.id))
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "grid grid-cols-2 gap-3 p-5", children: [
                ["Flows", bot.flows.length],
                ["Runs", bot.executions_count],
                ["Failures", bot.failed_executions_count],
                ["Updated", formatRelative(bot.updated_at)]
              ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold text-waify-text dark:text-waify-dark-text", children: typeof value === "number" ? formatNumber(value) : value })
              ] }, String(label))) }) }),
              /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Scope" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: bot.applies_to?.all_connections ? "Runs for the workspace WABA account." : `Runs for ${bot.applies_to?.connection_ids?.length || 0} selected account(s).` })
              ] }) })
            ] })
          ] }),
          tab === "flows" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            bot.flows.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto", children: bot.flows.map((flow) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setActiveFlowId(flow.id),
                className: `rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeFlow?.id === flow.id ? "bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-gray-100 text-waify-text-muted hover:text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
                children: flow.name
              },
              flow.id
            )) }),
            bot.flows.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-2", children: bot.flows.map((flow) => /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: flow.name }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    flow.nodes.length,
                    " steps · ",
                    flow.edges.length,
                    " links · priority ",
                    flow.priority
                  ] })
                ] }),
                flow.health?.is_runnable ? /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Ready" }) : /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Needs steps" })
              ] }),
              /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.builder", { bot: bot.id, flow: flow.id }), children: /* @__PURE__ */ jsxs(Button, { className: "w-full", children: [
                /* @__PURE__ */ jsx(Workflow, { className: "h-4 w-4" }),
                "Open visual builder"
              ] }) })
            ] }) }, flow.id)) }) : /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No journeys have been created for this automation yet." }) })
          ] }),
          tab === "runs" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            bot.analytics && /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-4", children: [
              ["Runs", bot.analytics.runs],
              ["Success", bot.analytics.success],
              ["Failed", bot.analytics.failed],
              ["Skipped", bot.analytics.skipped]
            ].map(([label, value]) => /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                label,
                " · ",
                bot.analytics?.window_days || 30,
                "d"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(value) })
            ] }) }, label)) }),
            bot.analytics && bot.analytics.node_hits.length > 0 && /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Node activity" }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: bot.analytics.node_hits.slice(0, 8).map((node) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2 rounded-btn bg-gray-50 p-3 text-xs dark:bg-waify-dark-surface-2 md:grid-cols-[1fr,80px,80px,80px]", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Node #",
                  node.node_id,
                  " · ",
                  node.type
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  "Hits ",
                  node.total
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-emerald-700 dark:text-emerald-300", children: [
                  "OK ",
                  node.success
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-red-700 dark:text-red-300", children: [
                  "Fail ",
                  node.failed + node.skipped
                ] })
              ] }, node.node_id)) })
            ] }) }),
            /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: bot.executions.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No executions yet." }) : bot.executions.map((execution) => /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 px-5 py-3 text-sm last:border-0 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid gap-2 md:grid-cols-[1fr,120px,160px,1fr]", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: execution.flow_name || "Automation flow" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    "Execution #",
                    execution.id
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Badge, { variant: execution.status === "failed" ? "danger" : execution.status === "success" ? "success" : "default", className: "w-fit", children: execution.status }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: formatRelative(execution.started_at) }),
                /* @__PURE__ */ jsx("span", { className: "truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: execution.error_message || "No error" })
              ] }),
              (execution.logs || []).length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: (execution.logs || []).slice(0, 6).map((log, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx("span", { className: log.level === "warning" || log.result === "skipped" ? "font-semibold text-amber-700 dark:text-amber-300" : log.level === "error" || log.result === "failed" ? "font-semibold text-red-700 dark:text-red-300" : "font-semibold text-waify-text dark:text-waify-dark-text", children: log.level || log.result || "info" }),
                /* @__PURE__ */ jsx("span", { children: log.message || log.reason || (log.node_id ? `Node #${log.node_id} ${log.type || ""}` : JSON.stringify(log)) })
              ] }, `${execution.id}-log-${index}`)) })
            ] }, execution.id)) }) })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: Boolean(nodeEditor),
        onClose: () => setNodeEditor(null),
        title: `Edit ${nodeEditor?.type === "action" ? actionLabel(nodeEditor?.config?.action_type) : nodeEditor?.type || "node"}`,
        description: "Configure what this automation step should do.",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setNodeEditor(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: saveNodeConfig, children: "Save node" })
        ] }),
        children: nodeEditor && /* @__PURE__ */ jsx(
          NodeConfigFields,
          {
            editor: nodeEditor,
            options: automationOptions,
            onChange: setNodeConfig
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open: Boolean(edgeEditor),
        onClose: () => setEdgeEditor(null),
        title: "Edit branch label",
        description: "Name this connection so the flow is easier to scan.",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setEdgeEditor(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: saveEdgeLabel, children: "Save label" })
        ] }),
        children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Label" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: edgeEditor?.label || "",
              onChange: (event) => setEdgeEditor((current) => current ? { ...current, label: event.target.value } : current),
              placeholder: "next"
            }
          )
        ]
      }
    )
  ] });
}
function ChatbotsIndex({
  bots,
  connections = [],
  automationOptions = { agents: [], tags: [], templates: [], lists: [] },
  selectedBot
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const runnableCount = bots.reduce((sum, bot) => sum + Number(bot.runnable_flows_count || 0), 0);
  const errors = bots.reduce((sum, bot) => sum + Number(bot.errors_count || 0), 0);
  const hasAutomationAlert = bots.length > 0 && (runnableCount === 0 || errors > 0);
  const [createOpen, setCreateOpen] = useState(() => new URLSearchParams(window.location.search).get("panel") === "create");
  const [activeBot, setActiveBot] = useState(selectedBot || null);
  useEffect(() => {
    setActiveBot(selectedBot || null);
  }, [selectedBot]);
  const deleteBot = async (bot) => {
    const confirmed = await confirm({
      title: "Delete automation?",
      message: `"${bot.name}" and its flows will be removed permanently.`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    router.post(route("app.chatbots.destroy.post", { bot: bot.id }), { _method: "delete" }, {
      preserveScroll: true,
      onSuccess: () => toast.success("Automation deleted"),
      onError: () => toast.error("Failed to delete automation")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Automation" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page max-w-[1600px]", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 bg-white p-4 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300", children: "Automation" }),
          /* @__PURE__ */ jsx("h1", { className: "module-heading", children: "Automation flows" }),
          /* @__PURE__ */ jsx("p", { className: "module-subheading", children: "Build WhatsApp journeys for keywords, lead sources, tags, handoffs, and AI-assisted replies." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 sm:flex", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.executions.index", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "w-full sm:w-auto", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
            "Logs"
          ] }) }),
          /* @__PURE__ */ jsxs(Button, { className: "w-full sm:w-auto", onClick: () => setCreateOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Create flow"
          ] })
        ] })
      ] }) }),
      hasAutomationAlert && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-4 shadow-card dark:border-amber-500/30 dark:bg-amber-500/10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
            "Automation needs attention"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-100/80", children: [
            runnableCount === 0 && /* @__PURE__ */ jsx("p", { children: "Create or fix at least one runnable flow before relying on automation." }),
            errors > 0 && /* @__PURE__ */ jsxs("p", { children: [
              formatNumber(errors),
              " recent automation error",
              errors === 1 ? "" : "s",
              " need review."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.executions.index", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "w-full sm:w-auto", children: [
          /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
          "Review logs"
        ] }) })
      ] }) }),
      bots.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: Bot,
          title: "No automation flows yet",
          description: "Create the first automation to respond to WhatsApp conversations automatically.",
          action: /* @__PURE__ */ jsxs(Button, { onClick: () => setCreateOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Create flow"
          ] })
        }
      ) }) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3", children: [
        bots.map((bot) => /* @__PURE__ */ jsx(AutomationCard, { bot, onDelete: deleteBot }, bot.id)),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setCreateOpen(true),
            className: "flex min-h-[260px] flex-col items-center justify-center rounded-card border-2 border-dashed border-gray-200 bg-white/50 text-waify-text-muted transition hover:border-waify-green hover:bg-waify-green-soft/30 hover:text-waify-green-dark dark:border-waify-dark-border dark:bg-waify-dark-surface/40 dark:hover:border-emerald-400/60 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300",
            children: [
              /* @__PURE__ */ jsx("span", { className: "mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card dark:bg-waify-dark-surface", children: /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Create new flow" }),
              /* @__PURE__ */ jsx("span", { className: "mt-1 text-xs", children: "Start from scratch or a starter reply" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(CreateBotDrawer, { open: createOpen, onClose: () => setCreateOpen(false), connections }),
    /* @__PURE__ */ jsx(BotDetailDrawer, { bot: activeBot, connections, automationOptions, onClose: () => setActiveBot(null) })
  ] });
}
export {
  NodeConfigFields,
  ChatbotsIndex as default
};
