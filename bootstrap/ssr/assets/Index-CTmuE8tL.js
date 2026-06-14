import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { T as ThemedIconTile, M as Modal } from "./Elements-EbyZDnT_.js";
import { Code2, BookOpen, KeyRound, Webhook, ArrowLeftRight, FileText, Terminal, Package, ExternalLink, Activity, Zap, Gauge, Copy, Plus, Trash2, Loader2, Check, RefreshCw, Download } from "lucide-react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "axios";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
const tabs = [
  { id: "overview", label: "Overview", icon: Code2, desc: "Quick start & status" },
  { id: "docs", label: "API Reference", icon: BookOpen, desc: "Endpoints & examples" },
  { id: "keys", label: "API Keys", icon: KeyRound, desc: "Authentication tokens" },
  { id: "webhooks", label: "Webhooks", icon: Webhook, desc: "Events & deliveries" },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight, desc: "Credits & usage ledger" },
  { id: "invoices", label: "Invoices", icon: FileText, desc: "Billing documents" },
  { id: "logs", label: "Request Logs", icon: Terminal, desc: "API traffic inspector" },
  { id: "sdks", label: "SDKs & Tools", icon: Package, desc: "Libraries & Postman" }
];
const methodClass = {
  GET: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
  POST: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  PUT: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  PATCH: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  DELETE: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"
};
function formatMoneyMinor(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(Number(value || 0) / 100);
}
function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function MethodBadge({ method }) {
  return /* @__PURE__ */ jsx("span", { className: `inline-flex min-w-[52px] justify-center rounded px-2 py-0.5 font-mono text-[10px] font-bold ${methodClass[method] || methodClass.GET}`, children: method });
}
function CodeBlock({ code }) {
  const { toast } = useToast();
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-btn bg-slate-950 ring-1 ring-slate-700", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-slate-400", children: "Example" }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
        navigator.clipboard?.writeText(code);
        toast.success("Copied");
      }, className: "inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white", children: [
        /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
        "Copy"
      ] })
    ] }),
    /* @__PURE__ */ jsx("pre", { className: "overflow-x-auto whitespace-pre-wrap p-4 font-mono text-xs leading-6 text-slate-100", children: code })
  ] });
}
function OverviewTab({ stats, setTab, api }) {
  const items = [
    { label: "API requests 24h", value: stats.api_requests_24h.toLocaleString("en-IN"), icon: Activity, tone: "blue" },
    { label: "Credits remaining", value: formatMoneyMinor(stats.credits_remaining), icon: Zap, tone: "green" },
    { label: "Webhook success", value: stats.webhook_success_rate, icon: Webhook, tone: "purple" },
    { label: "Avg latency", value: `${stats.avg_latency_ms}ms`, icon: Gauge, tone: "amber" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4", children: items.map((item) => {
      const Icon = item.icon;
      return /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsx(ThemedIconTile, { tone: item.tone, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.label }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text", children: item.value })
      ] }) }, item.label);
    }) }),
    /* @__PURE__ */ jsx("div", { className: "rounded-card bg-[#101827] p-5 text-white shadow-card", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Quick start" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-2xl text-sm leading-6 text-white/70", children: "Authenticate with a workspace key, send a message, and subscribe to webhooks from the same developer hub." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setTab("keys"), className: "!bg-white !text-slate-900", children: "Get API key" }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setTab("docs"), className: "!text-white hover:!bg-white/10", children: "Read docs" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Alert, { variant: "info", title: "Base URL", children: [
      "All API requests use ",
      /* @__PURE__ */ jsx("span", { className: "font-mono", children: api.base_url }),
      ". Current workspace rate limit: ",
      api.rate_limit,
      "."
    ] })
  ] });
}
function DocsTab({ api }) {
  const [groupId, setGroupId] = useState(api.endpoints[0]?.id || "");
  const group = api.endpoints.find((item) => item.id === groupId) || api.endpoints[0];
  const [endpointId, setEndpointId] = useState(group?.endpoints[0]?.id || "");
  const endpoint = group?.endpoints.find((item) => item.id === endpointId) || group?.endpoints[0];
  if (!endpoint || !group) return null;
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-[480px] flex-col gap-6 lg:flex-row", children: [
    /* @__PURE__ */ jsx("aside", { className: "lg:w-64", children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: api.endpoints.map((endpointGroup) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: endpointGroup.label }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1", children: endpointGroup.endpoints.map((item) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
        setGroupId(endpointGroup.id);
        setEndpointId(item.id);
      }, className: `flex w-full items-center gap-2 rounded-btn px-2 py-2 text-left text-xs transition ${endpointId === item.id ? "bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-200" : "text-waify-text-muted hover:bg-gray-50 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2"}`, children: [
        /* @__PURE__ */ jsx(MethodBadge, { method: item.method }),
        /* @__PURE__ */ jsx("span", { className: "truncate font-mono", children: item.path })
      ] }, item.id)) })
    ] }, endpointGroup.id)) }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx(MethodBadge, { method: endpoint.method }),
          /* @__PURE__ */ jsx("code", { className: "rounded bg-gray-100 px-2 py-1 font-mono text-sm text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: endpoint.path })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "mt-3 text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: endpoint.summary }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: endpoint.description })
      ] }),
      endpoint.params.length > 0 && /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "Parameters" }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsx("tbody", { children: endpoint.params.map((param) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-100 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2 font-mono text-xs", children: param.name }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: param.type }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: param.required ? /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-red-600", children: "Required" }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted", children: "Optional" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: param.desc })
        ] }, param.name)) }) }) })
      ] }),
      /* @__PURE__ */ jsx(CodeBlock, { code: endpoint.example }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs font-semibold uppercase text-waify-text-muted dark:text-waify-dark-text-muted", children: "Response" }),
        /* @__PURE__ */ jsx("pre", { className: "overflow-x-auto rounded-btn bg-gray-50 p-3 font-mono text-xs text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: endpoint.response })
      ] })
    ] })
  ] });
}
function KeysTab({ keys, availableScopes, newApiKey, canManageKeys }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ name: "Workspace API key", scopes: ["connections:read", "templates:read", "conversations:read", "messages:write"] });
  const createKey = () => {
    if (!canManageKeys) return;
    setProcessing(true);
    router.post(route("app.developer.keys.store"), form, {
      preserveScroll: true,
      onSuccess: () => setOpen(false),
      onFinish: () => setProcessing(false)
    });
  };
  const revokeKey = async (id) => {
    if (!canManageKeys) return;
    const confirmed = await confirm({
      title: "Revoke API key",
      message: "Revoke this API key? Existing integrations using it will stop working.",
      confirmText: "Revoke key",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("app.developer.keys.destroy", id), { preserveScroll: true });
  };
  const toggleScope = (scope) => {
    setForm((current) => {
      const hasScope = current.scopes.includes(scope);
      const nextScopes = hasScope ? current.scopes.filter((item) => item !== scope) : [...current.scopes, scope];
      return { ...current, scopes: scope === "*" && !hasScope ? ["*"] : nextScopes.filter((item) => scope === "*" || item !== "*") };
    });
  };
  const copyNewKey = () => {
    if (!newApiKey) return;
    navigator.clipboard?.writeText(newApiKey);
    toast.success("API key copied");
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    newApiKey && /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Copy your new API key now", children: /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col gap-2 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsx("code", { className: "min-w-0 flex-1 break-all rounded-btn bg-white/80 px-3 py-2 text-xs text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: newApiKey }),
      /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", onClick: copyNewKey, children: [
        /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
        " Copy"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Alert, { variant: "warning", title: "Keep keys secret", children: "Never expose live keys in client-side code or public repositories. Rotate immediately if compromised." }),
    !canManageKeys && /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Owner only", children: "Only workspace owners can create, revoke, or view credential controls." }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => setOpen(true), disabled: !canManageKeys, title: canManageKeys ? "Create API key" : "Requires workspace owner", children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Create API key"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      keys.map((key) => /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: key.name }),
            key.revokedAt && /* @__PURE__ */ jsx(Badge, { variant: "danger", children: "revoked" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            key.prefix,
            "****************"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: key.scopes.map((scope) => /* @__PURE__ */ jsx("span", { className: "rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: scope }, scope)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted sm:text-right", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "Last used ",
            formatDate(key.lastUsed)
          ] }),
          key.lastUsedIp && /* @__PURE__ */ jsxs("div", { children: [
            "IP ",
            key.lastUsedIp
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Created ",
            formatDate(key.created)
          ] }),
          !key.revokedAt && /* @__PURE__ */ jsxs(Button, { type: "button", size: "xs", variant: "danger", onClick: () => revokeKey(key.id), disabled: !canManageKeys, title: canManageKeys ? "Revoke key" : "Requires workspace owner", children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
            " Revoke"
          ] })
        ] })
      ] }) }) }, key.name)),
      keys.length === 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No API keys yet. Create one to start using the public API." }) })
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "Create API key",
        description: "Keys are scoped to this workspace and can be revoked any time.",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: createKey, disabled: processing || form.scopes.length === 0, children: [
            processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
            "Create key"
          ] })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Key name" }),
            /* @__PURE__ */ jsx("input", { value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Scopes" }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: availableScopes.map((scope) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 rounded-btn border border-gray-100 p-3 text-sm dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.scopes.includes(scope.id), onChange: () => toggleScope(scope.id), className: "h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" }),
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx("span", { className: "block font-medium text-waify-text dark:text-waify-dark-text", children: scope.label }),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: scope.id })
              ] })
            ] }, scope.id)) })
          ] })
        ] })
      }
    )
  ] });
}
function WebhooksTab({ webhooks, canManageKeys }) {
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ url: "", secret: "", events: ["message.received", "message.delivered"], is_enabled: true });
  const openEditor = (endpoint) => {
    setEditing(endpoint || null);
    setForm(endpoint ? {
      url: endpoint.url,
      secret: "",
      events: endpoint.events.length ? endpoint.events : ["message.received"],
      is_enabled: endpoint.is_enabled
    } : { url: "", secret: "", events: ["message.received", "message.delivered"], is_enabled: true });
    setOpen(true);
  };
  const saveEndpoint = () => {
    if (!canManageKeys) return;
    setProcessing(true);
    const options = {
      preserveScroll: true,
      onSuccess: () => setOpen(false),
      onFinish: () => setProcessing(false)
    };
    editing ? router.patch(route("app.developer.webhooks.update", editing.id), form, options) : router.post(route("app.developer.webhooks.store"), form, options);
  };
  const deleteEndpoint = async (id) => {
    if (!canManageKeys) return;
    const confirmed = await confirm({
      title: "Remove webhook endpoint",
      message: "Remove this webhook endpoint? Deliveries to this URL will stop.",
      confirmText: "Remove endpoint",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("app.developer.webhooks.destroy", id), { preserveScroll: true });
  };
  const testEndpoint = (id) => {
    router.post(route("app.developer.webhooks.test", id), {}, { preserveScroll: true });
  };
  const toggleEvent = (eventId) => {
    setForm((current) => ({
      ...current,
      events: current.events.includes(eventId) ? current.events.filter((item) => item !== eventId) : [...current.events, eventId]
    }));
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Central webhook endpoint" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Platform-managed Meta webhook endpoint for embedded signup accounts." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-btn bg-gray-50 p-3 font-mono text-xs text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: webhooks.central_url }),
      /* @__PURE__ */ jsx("div", { className: "rounded-btn bg-gray-50 p-3 font-mono text-xs text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: webhooks.verify_url })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Workspace webhook endpoints" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Send Zyptos events to your CRM, automation tool, or backend." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => openEditor(), disabled: !canManageKeys, title: canManageKeys ? "Add endpoint" : "Requires workspace owner", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Add endpoint"
      ] })
    ] }),
    !canManageKeys && /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Owner only", children: "Webhook endpoint changes are restricted to workspace owners." }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      webhooks.endpoints.map((endpoint) => /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "break-all font-mono text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: endpoint.url }),
            /* @__PURE__ */ jsx(Badge, { variant: endpoint.is_enabled ? "success" : "secondary", children: endpoint.is_enabled ? "enabled" : "disabled" }),
            endpoint.has_secret && /* @__PURE__ */ jsx(Badge, { variant: "info", children: "signed" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: endpoint.events.map((event) => /* @__PURE__ */ jsx("span", { className: "rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: event }, event)) }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            "Last test ",
            formatDate(endpoint.last_tested_at),
            " ",
            endpoint.last_status ? `· ${endpoint.last_status}` : ""
          ] }),
          endpoint.last_error && /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-xs text-red-600 dark:text-red-300", children: endpoint.last_error })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => testEndpoint(endpoint.id), children: "Test" }),
          /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => openEditor(endpoint), disabled: !canManageKeys, children: "Edit" }),
          /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "danger", onClick: () => deleteEndpoint(endpoint.id), disabled: !canManageKeys, children: "Delete" })
        ] })
      ] }) }) }, endpoint.id)),
      webhooks.endpoints.length === 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No outbound webhook endpoints configured." }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: webhooks.events.map((event) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn border border-gray-100 p-3 dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsx("p", { className: "font-mono text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: event.label }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: event.desc })
    ] }, event.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Recent deliveries" }),
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 text-waify-text-muted" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsxs("tbody", { children: [
        webhooks.deliveries.map((delivery) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-100 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono text-xs", children: delivery.event }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: delivery.status === 200 ? /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-emerald-600", children: "200" }) : /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-red-600", children: "Failed" }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-waify-text-muted", children: [
            delivery.attempts,
            " attempts"
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-waify-text-muted", children: delivery.duration ? `${delivery.duration}ms` : "-" }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-waify-text-muted", children: formatDate(delivery.time) })
        ] }, delivery.id)),
        webhooks.deliveries.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-4 py-8 text-center text-sm text-waify-text-muted", colSpan: 5, children: "No webhook deliveries yet." }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: editing ? "Edit webhook endpoint" : "Add webhook endpoint",
        description: "Zyptos signs test deliveries with X-Zyptos-Signature when a secret is present.",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: saveEndpoint, disabled: !canManageKeys || processing || form.events.length === 0 || !form.url, children: [
            processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
            "Save endpoint"
          ] })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Endpoint URL" }),
            /* @__PURE__ */ jsx("input", { value: form.url, onChange: (event) => setForm((current) => ({ ...current, url: event.target.value })), placeholder: "https://example.com/webhooks/waify", className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Signing secret" }),
            /* @__PURE__ */ jsx("input", { value: form.secret, onChange: (event) => setForm((current) => ({ ...current, secret: event.target.value })), placeholder: editing?.has_secret ? "Leave blank to keep current secret" : "Optional", className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-waify-text dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.is_enabled, onChange: (event) => setForm((current) => ({ ...current, is_enabled: event.target.checked })), className: "h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" }),
            "Endpoint enabled"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Events" }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: webhooks.events.map((event) => /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 rounded-btn border border-gray-100 p-3 text-sm dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.events.includes(event.id), onChange: () => toggleEvent(event.id), className: "mt-0.5 h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" }),
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx("span", { className: "block font-mono text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: event.label }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: event.desc })
              ] })
            ] }, event.id)) })
          ] })
        ] })
      }
    )
  ] });
}
function TransactionsTab({ transactions }) {
  const [filter, setFilter] = useState("all");
  const filtered = transactions.filter((transaction) => filter === "all" || transaction.type === filter);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2", children: ["all", "credit", "debit"].map((item) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setFilter(item), className: `rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === item ? "bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg" : "bg-white text-waify-text-muted ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text-muted dark:ring-waify-dark-border"}`, children: item }, item)) }),
    /* @__PURE__ */ jsx(DataTable, { empty: "No ledger entries yet.", children: filtered.map((transaction) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-100 dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: transaction.description }),
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] text-waify-text-muted", children: transaction.id })
      ] }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 capitalize text-waify-text-muted", children: transaction.category }),
      /* @__PURE__ */ jsxs("td", { className: `px-4 py-3 text-right font-semibold ${transaction.amount > 0 ? "text-emerald-600" : "text-waify-text dark:text-waify-dark-text"}`, children: [
        transaction.amount > 0 ? "+" : "",
        formatMoneyMinor(transaction.amount, transaction.unit)
      ] }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: formatMoneyMinor(transaction.balance, transaction.unit) }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: transaction.status }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-waify-text-muted", children: formatDate(transaction.createdAt) })
    ] }, transaction.id)) })
  ] });
}
function DataTable({ children, empty }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsx("tbody", { children: hasChildren ? children : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-4 py-8 text-center text-sm text-waify-text-muted", children: empty }) }) }) }) }) });
}
function InvoicesTab({ invoices }) {
  const [preview, setPreview] = useState(null);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(DataTable, { empty: "No invoices yet.", children: invoices.map((invoice) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-100 dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono text-xs font-semibold", children: invoice.id }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: invoice.plan }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-waify-text-muted", children: formatDate(invoice.date) }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right font-semibold", children: formatMoneyMinor(invoice.amount, invoice.currency) }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: invoice.status === "paid" ? "success" : invoice.status === "failed" ? "danger" : "warning", children: invoice.status }) }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setPreview(invoice), className: "text-xs font-semibold text-waify-green-dark hover:underline dark:text-emerald-300", children: "View" }) })
    ] }, invoice.id)) }),
    /* @__PURE__ */ jsx(Modal, { open: Boolean(preview), onClose: () => setPreview(null), title: preview?.id || "Invoice", description: "Billing document preview", className: "max-w-2xl", children: preview && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted", children: "Plan" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: preview.plan })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted", children: "Amount" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: formatMoneyMinor(preview.amount, preview.currency) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 text-sm sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "Provider: ",
            preview.provider
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Status: ",
            preview.status
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Order: ",
            preview.provider_order_id || "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Payment: ",
            preview.provider_payment_id || "-"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        "Download PDF"
      ] })
    ] }) })
  ] });
}
function LogsTab({ logs }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = logs.filter((log) => {
    if (statusFilter === "2xx") return log.status >= 200 && log.status < 300;
    if (statusFilter === "4xx") return log.status >= 400 && log.status < 500;
    if (statusFilter === "5xx") return log.status >= 500;
    return true;
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["all", "2xx", "4xx", "5xx"].map((item) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setStatusFilter(item), className: `rounded-full px-3 py-1.5 text-xs font-semibold ${statusFilter === item ? "bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg" : "bg-white text-waify-text-muted ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text-muted dark:ring-waify-dark-border"}`, children: item }, item)) }),
    /* @__PURE__ */ jsx(DataTable, { empty: "No API request logs yet.", children: filtered.map((log) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-100 font-mono text-xs dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(MethodBadge, { method: log.method }) }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: log.path }),
      /* @__PURE__ */ jsx("td", { className: `px-4 py-3 font-bold ${log.status >= 400 ? "text-red-600" : "text-emerald-600"}`, children: log.status }),
      /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-waify-text-muted", children: [
        log.duration,
        "ms"
      ] }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-waify-text-muted", children: log.ip }),
      /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-waify-text-muted", children: formatDate(log.time) })
    ] }, log.id)) })
  ] });
}
function SdksTab() {
  const sdks = [
    ["Node.js", "npm install @waify/sdk"],
    ["Python", "pip install waify"],
    ["PHP", "composer require waify/sdk"],
    ["Postman", "Download OpenAPI collection"]
  ];
  return /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: sdks.map(([name, command]) => /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: name }),
    /* @__PURE__ */ jsx("code", { className: "mt-3 block rounded-btn bg-gray-50 p-2 font-mono text-xs dark:bg-waify-dark-surface-2", children: command })
  ] }) }, name)) });
}
function DeveloperIndex(props) {
  const { workspace_permissions } = usePage().props;
  const [tab, setTab] = useState("overview");
  const active = useMemo(() => tabs.find((item) => item.id === tab) || tabs[0], [tab]);
  const canManageKeys = Boolean(workspace_permissions?.["api_keys.owner"]);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Developer" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page max-w-[1400px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300", children: "Developer" }),
          /* @__PURE__ */ jsx("h1", { className: "module-heading", children: "Developer" }),
          /* @__PURE__ */ jsx("p", { className: "module-subheading", children: "API reference, webhooks, usage ledger, and billing documents." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
          "Full docs site"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-start", children: [
        /* @__PURE__ */ jsx("nav", { className: "w-full lg:w-[250px]", children: /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80 lg:sticky lg:top-6", children: /* @__PURE__ */ jsx(CardContent, { className: "flex gap-1 overflow-x-auto p-2 lg:max-h-[72vh] lg:flex-col lg:overflow-y-auto", children: tabs.map((item) => {
          const Icon = item.icon;
          const selected = tab === item.id;
          return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setTab(item.id), className: `flex shrink-0 items-center gap-3 rounded-btn px-3 py-2.5 text-left transition lg:w-full ${selected ? "bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-200" : "text-waify-text-muted hover:bg-gray-50 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text"}`, children: [
            /* @__PURE__ */ jsx("span", { className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-white/80 dark:bg-waify-dark-surface" : "bg-gray-100 dark:bg-waify-dark-surface-2"}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("span", { className: "hidden min-w-0 sm:block", children: [
              /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-semibold", children: item.label }),
              /* @__PURE__ */ jsx("span", { className: "block truncate text-[11px] opacity-80", children: item.desc })
            ] })
          ] }, item.id);
        }) }) }) }),
        /* @__PURE__ */ jsxs(Card, { className: "min-w-0 flex-1 overflow-hidden border-transparent dark:border-slate-700/80", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: active.label }),
            /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: active.desc })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
            tab === "overview" && /* @__PURE__ */ jsx(OverviewTab, { stats: props.stats, setTab, api: props.api }),
            tab === "docs" && /* @__PURE__ */ jsx(DocsTab, { api: props.api }),
            tab === "keys" && /* @__PURE__ */ jsx(KeysTab, { keys: props.keys, availableScopes: props.availableScopes, newApiKey: props.newApiKey, canManageKeys }),
            tab === "webhooks" && /* @__PURE__ */ jsx(WebhooksTab, { webhooks: props.webhooks, canManageKeys }),
            tab === "transactions" && /* @__PURE__ */ jsx(TransactionsTab, { transactions: props.transactions }),
            tab === "invoices" && /* @__PURE__ */ jsx(InvoicesTab, { invoices: props.invoices }),
            tab === "logs" && /* @__PURE__ */ jsx(LogsTab, { logs: props.requestLogs }),
            tab === "sdks" && /* @__PURE__ */ jsx(SdksTab, {})
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  DeveloperIndex as default
};
