import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, Link as Link$1 } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, d as CardDescription } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { Link, Plus, Sparkles, Search, Filter, Phone, CheckCircle2, XCircle, Activity, Check, Copy, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "axios";
import "laravel-echo";
import "pusher-js";
function ConnectionsIndex({
  workspace,
  connections,
  canCreate
}) {
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredConnections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return connections.filter((connection) => {
      if (statusFilter === "active" && !connection.is_active) return false;
      if (statusFilter === "inactive" && connection.is_active) return false;
      if (!normalizedQuery) return true;
      return connection.name.toLowerCase().includes(normalizedQuery) || connection.phone_number_id.toLowerCase().includes(normalizedQuery) || (connection.business_phone || "").toLowerCase().includes(normalizedQuery);
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [connections, query, statusFilter]);
  const activeCount = connections.filter((connection) => connection.is_active).length;
  const subscribedCount = connections.filter((connection) => connection.webhook_subscribed).length;
  const copyToClipboard = (text, connectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(connectionId);
    setTimeout(() => setCopiedUrl(null), 2e3);
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "WhatsApp Connections" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-blue-50/60 dark:from-gray-900 dark:to-blue-900/20 p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200", children: [
              /* @__PURE__ */ jsx(Link, { className: "h-3.5 w-3.5" }),
              "WhatsApp Cloud API"
            ] }),
            /* @__PURE__ */ jsx("h1", { className: "mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100", children: "Connections" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Keep your API credentials, webhook, and phone numbers in sync." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
            canCreate && /* @__PURE__ */ jsx(Link$1, { href: route("app.whatsapp.connections.create", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/40", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
              "Add Connection"
            ] }) }),
            /* @__PURE__ */ jsx(Link$1, { href: route("app.whatsapp.connections.wizard", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "border-blue-200/60 text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:text-blue-200 dark:hover:bg-blue-900/30", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
              "Guided Setup"
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Total Connections" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100", children: connections.length })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Active" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400", children: activeCount })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Webhook Subscribed" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400", children: subscribedCount })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-md", children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-full md:max-w-md", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: query,
              onChange: (event) => setQuery(event.target.value),
              placeholder: "Search by name, phone, or number ID",
              className: "pl-9"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400", children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-3.5 w-3.5" }),
            "Status"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex rounded-full border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900", children: ["all", "active", "inactive"].map((status) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setStatusFilter(status),
              className: `px-3 py-1 text-xs font-semibold capitalize rounded-full transition-colors ${statusFilter === status ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`,
              children: status
            },
            status
          )) })
        ] })
      ] }) }) }),
      filteredConnections.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 mb-6", children: /* @__PURE__ */ jsx(Link, { className: "h-10 w-10 text-blue-600 dark:text-blue-400" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "No matching connections" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto", children: "Try a different search or add a new WhatsApp connection." }),
        canCreate && /* @__PURE__ */ jsx(Link$1, { href: route("app.whatsapp.connections.create", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Create Connection"
        ] }) })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", children: filteredConnections.map((connection) => /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: connection.name }),
            /* @__PURE__ */ jsxs(CardDescription, { className: "mt-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
              connection.business_phone || connection.phone_number_id
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx(
              Badge,
              {
                variant: connection.is_active ? "success" : "default",
                className: "flex items-center gap-1.5 px-3 py-1",
                children: connection.is_active ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                  "Active"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5" }),
                  "Inactive"
                ] })
              }
            ),
            connection.webhook_subscribed && /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "flex items-center gap-1.5 px-3 py-1", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
              "Subscribed"
            ] }),
            !connection.webhook_subscribed && /* @__PURE__ */ jsxs(Badge, { variant: "warning", className: "flex items-center gap-1.5 px-3 py-1", children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5" }),
              "Webhook idle"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Phone Number ID" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700", children: [
                /* @__PURE__ */ jsx("code", { className: "text-xs font-mono text-gray-900 dark:text-gray-100 flex-1 truncate", children: connection.phone_number_id }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => copyToClipboard(connection.phone_number_id, connection.id),
                    className: "p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                    children: copiedUrl === connection.id ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 text-gray-500 dark:text-gray-400" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Webhook URL" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700", children: [
                /* @__PURE__ */ jsx("code", { className: "text-xs font-mono text-gray-900 dark:text-gray-100 flex-1 truncate", children: connection.webhook_url }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => copyToClipboard(connection.webhook_url, connection.id),
                    className: "p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                    children: copiedUrl === connection.id ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 text-gray-500 dark:text-gray-400" })
                  }
                )
              ] })
            ] }),
            connection.webhook_last_received_at && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
              "Last webhook: ",
              new Date(connection.webhook_last_received_at).toLocaleString()
            ] }),
            !connection.webhook_last_received_at && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "No webhook events received yet." }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Created: ",
              new Date(connection.created_at).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(
              Link$1,
              {
                href: route("app.whatsapp.connections.edit", {
                  workspace: workspace.slug,
                  connection: connection.slug ?? connection.id
                }),
                className: "block",
                children: /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors", children: "Manage" })
              }
            ),
            /* @__PURE__ */ jsx(
              Link$1,
              {
                href: route("app.whatsapp.connections.health", {
                  workspace: workspace.slug,
                  connection: connection.slug ?? connection.id
                }),
                className: "block",
                children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full border border-transparent hover:border-blue-200 dark:hover:border-blue-800", children: "Health Check" })
              }
            )
          ] })
        ] })
      ] }, connection.id)) })
    ] })
  ] });
}
export {
  ConnectionsIndex as default
};
