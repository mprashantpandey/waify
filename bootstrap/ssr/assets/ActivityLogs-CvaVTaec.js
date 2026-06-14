import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { P as PlatformShell } from "./PlatformShell-BDgjSKtX.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { P as PageHeader, a as Toolbar, T as ThemedIconTile, S as StatusBadge, D as Drawer } from "./Elements-EbyZDnT_.js";
import { Download, Activity, Webhook, ShieldAlert, ServerCrash, Filter, Clock, Building2, UserRound, FileWarning, XCircle, CheckCircle2, AlertCircle } from "lucide-react";
import "axios";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./Badge-C65MHc2S.js";
import "@headlessui/react";
function typeLabel(type) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function typeTone(type) {
  if (type.includes("error") || type.includes("failed")) return "danger";
  if (type.includes("success")) return "success";
  if (type.includes("account")) return "warning";
  if (type.includes("api") || type.includes("webhook")) return "info";
  return "default";
}
function typeIcon(type) {
  if (type.includes("webhook")) return Webhook;
  if (type.includes("error") || type.includes("failed")) return XCircle;
  if (type.includes("success")) return CheckCircle2;
  if (type.includes("account")) return Building2;
  return AlertCircle;
}
function StatCard({ label, value, icon: Icon, tone = "green" }) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: value })
    ] }),
    /* @__PURE__ */ jsx(ThemedIconTile, { tone, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) })
  ] }) }) });
}
function ActivityLogs({
  logs,
  filters,
  filter_options,
  audit_stats
}) {
  const { auth } = usePage().props;
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [selectedLog, setSelectedLog] = useState(null);
  const stats = useMemo(() => {
    const errors = logs.data.filter((log) => typeTone(log.type) === "danger").length;
    const webhooks = logs.data.filter((log) => log.type.includes("webhook")).length;
    const accountEvents = logs.data.filter((log) => log.account_id).length;
    return { errors, webhooks, accountEvents };
  }, [logs.data]);
  const applyFilters = () => {
    router.get(route("platform.activity-logs"), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const clearFilters = () => {
    setLocalFilters({});
    router.get(route("platform.activity-logs"), {}, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const goToPage = (page) => {
    router.get(route("platform.activity-logs"), { ...localFilters, page }, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const setScope = (scope) => {
    const next = { ...localFilters, scope };
    setLocalFilters(next);
    router.get(route("platform.activity-logs"), next, { preserveState: true, preserveScroll: true });
  };
  const exportHref = route("platform.activity-logs", { ...localFilters, export: "csv" });
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Activity Logs" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Activity logs",
          description: "Operational events from workspace connections, failed jobs, and platform account status changes.",
          actions: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx("a", { href: exportHref, children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
              /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
              "Export CSV"
            ] }) }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: clearFilters, children: "Reset filters" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Visible events", value: logs.total, icon: Activity }),
        /* @__PURE__ */ jsx(StatCard, { label: "Webhook events", value: stats.webhooks, icon: Webhook, tone: "blue" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Destructive actions", value: audit_stats?.destructive ?? 0, icon: ShieldAlert, tone: "amber" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Errors on page", value: stats.errors, icon: ServerCrash, tone: "red" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: [
        ["all", "All events"],
        ["destructive", "Destructive audit"],
        ["billing", "Billing"],
        ["webhook", "Webhooks"],
        ["system", "System"]
      ].map(([scope, label]) => /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: (localFilters.scope || "all") === scope ? "primary" : "secondary", onClick: () => setScope(scope), children: label }, scope)) }),
      /* @__PURE__ */ jsx(
        Toolbar,
        {
          filters: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.scope || "all",
                onChange: (event) => setLocalFilters({ ...localFilters, scope: event.target.value || void 0 }),
                className: "waify-input min-w-36",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All scopes" }),
                  /* @__PURE__ */ jsx("option", { value: "destructive", children: "Destructive" }),
                  /* @__PURE__ */ jsx("option", { value: "billing", children: "Billing" }),
                  /* @__PURE__ */ jsx("option", { value: "webhook", children: "Webhook" }),
                  /* @__PURE__ */ jsx("option", { value: "system", children: "System" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.type || "",
                onChange: (event) => setLocalFilters({ ...localFilters, type: event.target.value || void 0 }),
                className: "waify-input min-w-44",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All types" }),
                  filter_options.types.map((type) => /* @__PURE__ */ jsx("option", { value: type, children: typeLabel(type) }, type))
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.action || "",
                onChange: (event) => setLocalFilters({ ...localFilters, action: event.target.value || void 0 }),
                className: "waify-input min-w-44",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All actions" }),
                  filter_options.actions.map((action) => /* @__PURE__ */ jsx("option", { value: action, children: typeLabel(action) }, action))
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.account_id || "",
                onChange: (event) => setLocalFilters({ ...localFilters, account_id: event.target.value || void 0 }),
                className: "waify-input min-w-44",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All workspaces" }),
                  filter_options.accounts.map((account) => /* @__PURE__ */ jsx("option", { value: account.id, children: account.name }, account.id))
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.actor_id || "",
                onChange: (event) => setLocalFilters({ ...localFilters, actor_id: event.target.value || void 0 }),
                className: "waify-input min-w-44",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All actors" }),
                  filter_options.actors.map((actor) => /* @__PURE__ */ jsx("option", { value: actor.id, children: actor.name || actor.email }, actor.id))
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: localFilters.date_from || "",
                onChange: (event) => setLocalFilters({ ...localFilters, date_from: event.target.value || void 0 }),
                className: "waify-input"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: localFilters.date_to || "",
                onChange: (event) => setLocalFilters({ ...localFilters, date_to: event.target.value || void 0 }),
                className: "waify-input"
              }
            )
          ] }),
          actions: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: applyFilters, children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
            "Apply"
          ] })
        }
      ),
      logs.data.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsx(ThemedIconTile, { tone: "gray", size: "lg", children: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "No activity logs found" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Try changing filters or check again after new system events arrive." })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: logs.data.map((log) => {
        const Icon = typeIcon(log.type);
        return /* @__PURE__ */ jsx(Card, { className: "transition hover:border-waify-green/40", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
            /* @__PURE__ */ jsx(ThemedIconTile, { tone: typeTone(log.type) === "danger" ? "red" : typeTone(log.type) === "warning" ? "amber" : typeTone(log.type) === "success" ? "green" : "blue", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsx(StatusBadge, { tone: typeTone(log.type), dot: true, children: typeLabel(log.type) }),
                log.scope === "destructive" && /* @__PURE__ */ jsx(StatusBadge, { tone: "warning", children: "Destructive" }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
                  new Date(log.created_at).toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: log.description }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                log.account_id ? /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: route("platform.accounts.show", { account: log.account_id }),
                    className: "inline-flex items-center gap-1 font-medium text-waify-green-dark hover:underline dark:text-emerald-300",
                    children: [
                      /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }),
                      "Workspace #",
                      log.account_id
                    ]
                  }
                ) : /* @__PURE__ */ jsx("span", { children: "Platform event" }),
                log.actor_id && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(UserRound, { className: "h-3.5 w-3.5" }),
                  "Actor #",
                  log.actor_id
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => setSelectedLog(log), children: [
            /* @__PURE__ */ jsx(FileWarning, { className: "h-4 w-4" }),
            "Details"
          ] })
        ] }) }) }, log.id);
      }) }),
      logs.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          "Showing ",
          logs.per_page * (logs.current_page - 1) + 1,
          " to ",
          Math.min(logs.per_page * logs.current_page, logs.total),
          " of ",
          logs.total
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: Array.from({ length: logs.last_page }, (_, index) => index + 1).map((page) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => goToPage(page),
            className: `h-9 min-w-9 rounded-btn px-3 text-sm font-semibold transition ${page === logs.current_page ? "bg-waify-green text-waify-ink" : "border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2"}`,
            children: page
          },
          page
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: Boolean(selectedLog),
        onClose: () => setSelectedLog(null),
        title: selectedLog ? typeLabel(selectedLog.type) : "Activity details",
        description: selectedLog?.description,
        className: "sm:max-w-xl",
        children: /* @__PURE__ */ jsx("pre", { className: "max-h-[70vh] overflow-auto rounded-card border border-gray-100 bg-gray-950 p-4 text-xs leading-relaxed text-gray-100 dark:border-waify-dark-border", children: JSON.stringify(selectedLog?.metadata || {}, null, 2) })
      }
    )
  ] });
}
export {
  ActivityLogs as default
};
