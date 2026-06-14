import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useForm, Head } from "@inertiajs/react";
import { RefreshCw, Save, PhoneCall, CheckCircle2, XCircle } from "lucide-react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-BtIXZ0GS.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { S as Switch } from "./Switch-D6_sQewh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "./useToast-BN7qsQL3.js";
import "axios";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
const statusVariant = (status) => {
  if (["completed", "answered", "granted", "eligible", "enabled"].includes(status || "")) return "success";
  if (["failed", "missed", "rejected", "revoked", "not_eligible"].includes(status || "")) return "danger";
  if (["ringing", "in_progress", "queued", "received", "expired", "not_enabled"].includes(status || "")) return "warning";
  return "secondary";
};
const formatDate = (value) => {
  if (!value) return "Not checked";
  return new Intl.DateTimeFormat(void 0, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};
const formatDuration = (seconds) => {
  if (!seconds) return "0 sec";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
};
function FieldSelect({
  id,
  value,
  disabled,
  children,
  onChange
}) {
  return /* @__PURE__ */ jsx(
    "select",
    {
      id,
      value,
      disabled,
      onChange: (event) => onChange(event.target.value),
      className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 disabled:opacity-60 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
      children
    }
  );
}
function WhatsAppCallingIndex({
  settings,
  agents = [],
  connections = [],
  diagnostics,
  calls = [],
  canManage,
  webhookUrl
}) {
  const form = useForm({
    ...settings,
    whatsapp_connection_id: settings.whatsapp_connection_id ? Number(settings.whatsapp_connection_id) : connections[0]?.id ?? null,
    default_agent_id: settings.default_agent_id ? Number(settings.default_agent_id) : null,
    phone_number_id: settings.phone_number_id || connections[0]?.phone_number_id || "",
    business_phone: settings.business_phone || connections[0]?.business_phone || "",
    outbound_enabled: Boolean(settings.outbound_enabled ?? true),
    outbound_requires_consent: false,
    record_calls: Boolean(settings.record_calls),
    business_hours_only: Boolean(settings.business_hours_only),
    whatsapp_call_button_enabled: Boolean(settings.whatsapp_call_button_enabled),
    max_call_minutes: Number(settings.max_call_minutes || 10),
    silence_timeout_seconds: Number(settings.silence_timeout_seconds || 20)
  });
  const actionForm = useForm({});
  const selectedConnection = connections.find((connection) => connection.id === form.data.whatsapp_connection_id) || connections[0];
  const [callSearch, setCallSearch] = useState("");
  const [callStatusFilter, setCallStatusFilter] = useState("all");
  const [callDirectionFilter, setCallDirectionFilter] = useState("all");
  const [callPage, setCallPage] = useState(1);
  const callPageSize = 10;
  const runConnectionAction = (action) => {
    if (!selectedConnection) return;
    actionForm.post(route(`app.whatsapp-calls.connections.${action}`, selectedConnection.slug), {
      preserveScroll: true
    });
  };
  const saveSettings = () => {
    form.post(route("app.whatsapp-calls.settings"), {
      preserveScroll: true
    });
  };
  const connectionStatus = selectedConnection?.calling_enabled ? "enabled" : selectedConnection?.calling_status || form.data.calling_eligibility_status || "unknown";
  const callingReady = Boolean(selectedConnection?.calling_enabled || form.data.calling_eligibility_status === "eligible");
  const webhookReady = Boolean(selectedConnection?.calling_webhook_subscribed || selectedConnection?.webhook_subscribed);
  const callStatuses = useMemo(() => Array.from(new Set(calls.map((call) => call.status).filter(Boolean))).sort(), [calls]);
  const callDirections = useMemo(() => Array.from(new Set(calls.map((call) => call.direction).filter(Boolean))).sort(), [calls]);
  const filteredCalls = useMemo(() => {
    const query = callSearch.trim().toLowerCase();
    return calls.filter((call) => {
      const matchesSearch = !query || [
        call.contact_name,
        call.phone_number,
        call.status,
        call.direction,
        call.route_mode,
        call.routed_to,
        call.agent?.name
      ].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesStatus = callStatusFilter === "all" || call.status === callStatusFilter;
      const matchesDirection = callDirectionFilter === "all" || call.direction === callDirectionFilter;
      return matchesSearch && matchesStatus && matchesDirection;
    });
  }, [calls, callDirectionFilter, callSearch, callStatusFilter]);
  const totalCallPages = Math.max(1, Math.ceil(filteredCalls.length / callPageSize));
  const currentCallPage = Math.min(callPage, totalCallPages);
  const paginatedCalls = filteredCalls.slice((currentCallPage - 1) * callPageSize, currentCallPage * callPageSize);
  const resetCallPage = () => setCallPage(1);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "WhatsApp Calling" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text", children: "WhatsApp Calling" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Enable calling on a connected WABA number and route inbound calls to an AI agent or human team." })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: diagnostics?.eligible ? "success" : "warning", children: diagnostics?.label || "Not ready" })
      ] }),
      !canManage && /* @__PURE__ */ jsx(Alert, { variant: "warning", title: "Read-only access", children: "Only workspace owners and admins can change WhatsApp calling settings." }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(CardTitle, { children: "Connected Number" }),
                /* @__PURE__ */ jsx(CardDescription, { children: "WhatsApp Calling uses the WABA number connected to this workspace." })
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: statusVariant(connectionStatus), children: connectionStatus.replaceAll("_", " ") })
            ] }) }),
            /* @__PURE__ */ jsx(CardContent, { className: "space-y-5", children: selectedConnection ? /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-card border border-gray-100 bg-gray-50 p-4 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: selectedConnection.meta_verified_name || selectedConnection.name }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: selectedConnection.business_phone || "Business phone not synced" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  /* @__PURE__ */ jsx(Badge, { variant: callingReady ? "success" : "warning", children: callingReady ? "Calling ready" : "Needs setup" }),
                  /* @__PURE__ */ jsx(Badge, { variant: webhookReady ? "success" : "warning", children: webhookReady ? "Webhook ready" : "Webhook pending" })
                ] })
              ] }),
              selectedConnection.calling_last_error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Meta check failed", children: selectedConnection.calling_last_error }),
              canManage && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", disabled: actionForm.processing, onClick: () => runConnectionAction("check"), children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
                  "Refresh status"
                ] }),
                !webhookReady && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", disabled: actionForm.processing, onClick: () => runConnectionAction("subscribe-calls"), children: "Fix webhook" }),
                !callingReady && /* @__PURE__ */ jsx(Button, { type: "button", variant: "success", size: "sm", disabled: actionForm.processing, onClick: () => runConnectionAction("enable"), children: "Enable calling" })
              ] })
            ] }) : /* @__PURE__ */ jsx("div", { className: "rounded-card border border-dashed border-gray-200 p-5 text-sm text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "Connect a WhatsApp Business number first, then select it here." }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Call Routing" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Choose who answers inbound calls and whether agents can place outbound calls." })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Use WhatsApp Calling" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Turn on routing for inbound WhatsApp calls." })
                ] }),
                /* @__PURE__ */ jsx(Switch, { checked: form.data.enabled, disabled: !canManage, onCheckedChange: (checked) => form.setData("enabled", checked) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Allow outbound WhatsApp calls" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Show call controls in inbox when Meta calling is ready." })
                ] }),
                /* @__PURE__ */ jsx(Switch, { checked: form.data.outbound_enabled, disabled: !canManage, onCheckedChange: (checked) => form.setData("outbound_enabled", checked) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "routing_mode", children: "Route inbound calls" }),
                  /* @__PURE__ */ jsxs(
                    FieldSelect,
                    {
                      id: "routing_mode",
                      value: form.data.routing_mode,
                      disabled: !canManage,
                      onChange: (value) => form.setData("routing_mode", value),
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "ai_first", children: "AI first, human fallback" }),
                        /* @__PURE__ */ jsx("option", { value: "human_first", children: "Human first, AI fallback" }),
                        /* @__PURE__ */ jsx("option", { value: "ai_only", children: "AI only" }),
                        /* @__PURE__ */ jsx("option", { value: "human_only", children: "Human only" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "agent", children: "AI agent" }),
                  /* @__PURE__ */ jsxs(
                    FieldSelect,
                    {
                      id: "agent",
                      value: form.data.default_agent_id ?? "",
                      disabled: !canManage,
                      onChange: (value) => form.setData("default_agent_id", value ? Number(value) : null),
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: "No agent selected" }),
                        agents.map((agent) => /* @__PURE__ */ jsx("option", { value: agent.id, children: agent.name }, agent.id))
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "transfer_number", children: "Human handoff number" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "transfer_number",
                      value: form.data.transfer_number || "",
                      disabled: !canManage,
                      onChange: (event) => form.setData("transfer_number", event.target.value),
                      placeholder: "+91...",
                      className: "mt-1"
                    }
                  )
                ] })
              ] }),
              canManage && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: saveSettings, disabled: form.processing, children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                "Save settings"
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Call History" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Latest WhatsApp call webhook events recorded in Zyptos." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { children: calls.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-dashed border-gray-200 p-6 text-center dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx(PhoneCall, { className: "mx-auto h-8 w-8 text-waify-text-muted dark:text-waify-dark-text-muted" }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "No calls received yet" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Call events will appear after Meta sends WhatsApp calling webhooks." })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 border-b border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 md:grid-cols-[minmax(0,1fr)_160px_160px]", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: callSearch,
                    onChange: (event) => {
                      setCallSearch(event.target.value);
                      resetCallPage();
                    },
                    placeholder: "Search contact, number, route...",
                    className: "h-9 bg-white dark:bg-waify-dark-surface"
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: callStatusFilter,
                    onChange: (event) => {
                      setCallStatusFilter(event.target.value);
                      resetCallPage();
                    },
                    className: "h-9 rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "all", children: "All statuses" }),
                      callStatuses.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status.replaceAll("_", " ") }, status))
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: callDirectionFilter,
                    onChange: (event) => {
                      setCallDirectionFilter(event.target.value);
                      resetCallPage();
                    },
                    className: "h-9 rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "all", children: "All directions" }),
                      callDirections.map((direction) => /* @__PURE__ */ jsx("option", { value: direction, children: direction }, direction))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "max-h-[420px] overflow-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full table-fixed text-left", children: [
                /* @__PURE__ */ jsx("thead", { className: "sticky top-0 z-10 border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { className: "w-[30%] px-4 py-2", children: "Contact" }),
                  /* @__PURE__ */ jsx("th", { className: "w-[18%] px-4 py-2", children: "Direction" }),
                  /* @__PURE__ */ jsx("th", { className: "w-[22%] px-4 py-2", children: "Route" }),
                  /* @__PURE__ */ jsx("th", { className: "w-[18%] px-4 py-2", children: "Status" }),
                  /* @__PURE__ */ jsx("th", { className: "w-[12%] px-4 py-2 text-right", children: "Time" })
                ] }) }),
                /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: [
                  paginatedCalls.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No calls match the selected filters." }) }),
                  paginatedCalls.map((call) => /* @__PURE__ */ jsxs("tr", { className: "align-top", children: [
                    /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                      /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-waify-text dark:text-waify-dark-text", children: call.contact_name || call.phone_number || "Unknown caller" }),
                      /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: call.created_at ? formatDate(call.created_at) : "-" })
                    ] }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm capitalize text-waify-text-muted dark:text-waify-dark-text-muted", children: call.direction || "-" }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("p", { className: "truncate text-sm text-waify-text-muted dark:text-waify-dark-text-muted", title: call.agent?.name || call.routed_to || call.route_mode || "Not routed", children: call.agent?.name || call.routed_to || call.route_mode || "Not routed" }) }),
                    /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1", children: [
                        /* @__PURE__ */ jsx(Badge, { variant: statusVariant(call.status), children: call.status }),
                        call.route_mode?.includes("ai") && call.status === "completed" && !call.transcript && /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "No transcript" })
                      ] }),
                      call.summary && /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: call.summary })
                    ] }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: formatDuration(call.duration_seconds || 0) })
                  ] }, call.id))
                ] })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "Showing ",
                  filteredCalls.length === 0 ? 0 : (currentCallPage - 1) * callPageSize + 1,
                  "-",
                  Math.min(currentCallPage * callPageSize, filteredCalls.length),
                  " of ",
                  filteredCalls.length,
                  " call",
                  filteredCalls.length === 1 ? "" : "s",
                  "."
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", disabled: currentCallPage <= 1, onClick: () => setCallPage((page) => Math.max(1, page - 1)), children: "Prev" }),
                  /* @__PURE__ */ jsxs("span", { className: "px-2 font-medium text-waify-text dark:text-waify-dark-text", children: [
                    currentCallPage,
                    " / ",
                    totalCallPages
                  ] }),
                  /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", disabled: currentCallPage >= totalCallPages, onClick: () => setCallPage((page) => Math.min(totalCallPages, page + 1)), children: "Next" })
                ] })
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Readiness" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Only the checks that affect real calls." })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: (diagnostics?.checks || []).filter((check) => ["module_enabled", "connection", "webhook", "meta_calling", "routing"].includes(check.key)).map((check) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
            check.ok ? /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-waify-green" }) : /* @__PURE__ */ jsx(XCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-red-500" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: check.label }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: check.message })
            ] })
          ] }, check.key)) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  WhatsAppCallingIndex as default
};
