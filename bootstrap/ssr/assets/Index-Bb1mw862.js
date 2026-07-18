import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { S as StatusBadge, D as Drawer } from "./Elements-EbyZDnT_.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { P as ProviderLogo } from "./ProviderLogo-1eHVtujo.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import { Code2, Search, Plug, CheckCircle2, Database, RefreshCw, Settings2, ExternalLink, Loader2, Unplug, Link2 } from "lucide-react";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
const baseCategories = [
  { id: "all", label: "All" },
  { id: "connected", label: "Connected" }
];
function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}
function healthStatus(health) {
  if (!health) return null;
  if (typeof health === "object") {
    return health.status || "configured";
  }
  return health;
}
function stageLabel(stage) {
  if (stage === "roadmap") return "Roadmap";
  if (stage === "beta") return "Beta";
  return "Live";
}
function stageTone(stage) {
  if (stage === "roadmap") return "muted";
  if (stage === "beta") return "warning";
  return "success";
}
function initialForm(item) {
  const values = {
    sync_direction: "import",
    auto_sync: true
  };
  item?.fields.forEach((field) => {
    const value = item.config?.[field.name];
    values[field.name] = typeof value === "boolean" ? value : String(value ?? (field.type === "boolean" ? true : field.type === "select" ? field.options?.[0]?.value || "" : ""));
  });
  return values;
}
function IntegrationDrawer({
  item,
  open,
  onClose
}) {
  const [form, setForm] = useState({});
  const [processing, setProcessing] = useState(null);
  const [resources, setResources] = useState([]);
  const [resourceError, setResourceError] = useState(null);
  useEffect(() => {
    setForm(initialForm(item));
    setProcessing(null);
    setResources([]);
    setResourceError(null);
  }, [item]);
  if (!item) return null;
  const postAction = (routeName, method = "post") => {
    setProcessing(routeName);
    const options = {
      preserveScroll: true,
      onFinish: () => setProcessing(null),
      onSuccess: () => {
        if (method === "delete") onClose();
      }
    };
    if (routeName === "app.integrations.oauth") {
      window.location.assign(route(routeName, item.id));
    } else if (method === "patch") {
      router.patch(route(routeName, item.id), form, options);
    } else if (method === "delete") {
      router.delete(route(routeName, item.id), options);
    } else {
      router.post(route(routeName, item.id), {}, options);
    }
  };
  const loadGoogleResources = async () => {
    setProcessing("app.integrations.resources");
    setResourceError(null);
    try {
      const response = await fetch(route("app.integrations.resources", item.id), {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to load resources.");
      }
      setResources(payload.items || []);
    } catch (error) {
      setResourceError(error instanceof Error ? error.message : "Unable to load resources.");
    } finally {
      setProcessing(null);
    }
  };
  const chooseResource = (resource) => {
    if (item.id === "google-sheets") {
      setForm((current) => ({ ...current, spreadsheet_id: resource.id, sheet_name: resource.defaultSheet || String(current.sheet_name || "") }));
    } else if (item.id === "google-calendar") {
      setForm((current) => ({ ...current, calendar_id: resource.id }));
    } else if (item.id === "meta-leads") {
      setForm((current) => ({ ...current, form_id: resource.id, form_name: resource.name }));
    } else if (item.id === "meta-catalog") {
      setForm((current) => ({ ...current, catalog_id: resource.id, catalog_name: resource.name, business_id: resource.businessId || String(current.business_id || "") }));
    }
  };
  const isSelectedResource = (resource) => {
    if (item.id === "google-sheets") return String(form.spreadsheet_id || "") === resource.id;
    if (item.id === "google-calendar") return String(form.calendar_id || "") === resource.id;
    if (item.id === "meta-leads") return String(form.form_id || "") === resource.id;
    if (item.id === "meta-catalog") return String(form.catalog_id || "") === resource.id;
    return false;
  };
  const manageHref = item.id === "google-sheets" ? route("app.contacts.index") : item.id === "google-calendar" ? route("app.appointments.index") : item.id === "meta-leads" ? route("app.meta-leads.index") : item.id === "meta-catalog" ? route("app.catalog.index") : null;
  const visibleFields = item.fields.filter((field) => {
    if (!field.visible_when) return true;
    return Object.entries(field.visible_when).every(([key, value]) => form[key] === value);
  });
  const canManage = item.canManageCredentials !== false;
  const itemHealth = healthStatus(item.health);
  const isRoadmap = item.stage === "roadmap";
  const footer = isRoadmap ? /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Close" }) }) : item.systemManaged ? /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsx(Link, { href: route(item.route || "app.whatsapp.connections.index"), children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
    /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4" }),
    "Open settings"
  ] }) }) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
    item.connected && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => postAction("app.integrations.sync"), disabled: !!processing || !canManage, children: [
        processing === "app.integrations.sync" ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
        ["workspace-ai", "razorpay-payments"].includes(item.id) ? "Test connection" : "Sync now"
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "danger", onClick: () => postAction("app.integrations.disconnect", "delete"), disabled: !!processing || !canManage, children: [
        /* @__PURE__ */ jsx(Unplug, { className: "h-4 w-4" }),
        "Disconnect"
      ] })
    ] }),
    !item.connected && item.oauth && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => postAction("app.integrations.oauth"), disabled: !!processing, children: [
      processing === "app.integrations.oauth" ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Link2, { className: "h-4 w-4" }),
      "Connect ",
      item.oauth === "facebook" ? "Facebook" : "Google"
    ] }),
    /* @__PURE__ */ jsxs(
      Button,
      {
        type: "button",
        onClick: () => postAction("app.integrations.update", "patch"),
        disabled: !!processing || !canManage,
        children: [
          processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
          item.connected ? "Save settings" : item.oauth ? "Save IDs" : "Connect"
        ]
      }
    )
  ] });
  return /* @__PURE__ */ jsx(Drawer, { open, onClose, title: item.name, description: item.desc, className: "sm:max-w-xl", footer, children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(ProviderLogo, { id: item.id, name: item.name, className: "h-12 w-12" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx(StatusBadge, { tone: stageTone(item.stage), children: stageLabel(item.stage) }),
          !isRoadmap && /* @__PURE__ */ jsx(StatusBadge, { tone: item.connected ? "success" : "muted", dot: true, children: item.connected ? "Connected" : "Not connected" }),
          item.popular && /* @__PURE__ */ jsx(StatusBadge, { tone: "warning", children: "Popular" }),
          itemHealth && /* @__PURE__ */ jsx(StatusBadge, { tone: itemHealth === "healthy" ? "success" : "warning", children: itemHealth })
        ] }),
        item.lastSync && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          "Last sync ",
          item.lastSync
        ] })
      ] })
    ] }),
    item.systemManaged && /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Managed in Zyptos", children: "This integration is already implemented elsewhere in Zyptos. Use its dedicated settings page instead of creating a duplicate connection here." }),
    item.stage === "beta" && /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Beta capability", children: "This capability is usable, but some advanced workflow or analytics depth is still being expanded." }),
    isRoadmap && /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Planned capability", children: "This is shown as a market gap Zyptos plans to address. It is not available for workspace configuration yet." }),
    item.lastError && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Last error", children: item.lastError }),
    !canManage && /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Restricted credentials", children: "Only workspace owners and admins can change, test, or disconnect integrations with credentials." }),
    item.id === "meta-leads" && /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Facebook Login", children: "Meta Lead Ads webhooks are handled by the Zyptos provider app. Connect Facebook here, select the page/form, and Zyptos will route incoming leads to this workspace." }),
    item.id === "meta-catalog" && /* @__PURE__ */ jsx(Alert, { variant: "info", title: "Facebook Login", children: "Connect Facebook to list commerce catalogs from your Meta Business account, select the catalog, then sync products for WhatsApp product messages." }),
    item.webhookUrl && /* @__PURE__ */ jsxs(Alert, { variant: "info", title: "Provider webhook URL", children: [
      "Use this URL in ",
      item.name,
      " for real-time sync events: ",
      /* @__PURE__ */ jsx("span", { className: "font-mono", children: item.webhookUrl })
    ] }),
    item.connected && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-3 gap-3 p-4 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Events 24h" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold text-waify-text dark:text-waify-dark-text", children: formatNumber(item.events24h) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Status" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold capitalize text-waify-text dark:text-waify-dark-text", children: item.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Category" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold capitalize text-waify-text dark:text-waify-dark-text", children: item.category })
      ] })
    ] }) }),
    item.connected && item.healthDetails && item.healthDetails.length > 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 p-4 text-sm", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Health details" }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: item.healthDetails.map((detail) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 px-3 py-2 dark:bg-waify-dark-surface-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: detail.label }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 break-words text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: detail.value || "Not available" })
      ] }, `${detail.label}-${detail.value}`)) })
    ] }) }),
    !isRoadmap && visibleFields.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Configuration" }),
      visibleFields.map((field) => /* @__PURE__ */ jsx("div", { children: field.type === "boolean" ? /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-btn border border-gray-100 p-3 text-sm dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("span", { className: "block font-medium text-waify-text dark:text-waify-dark-text", children: field.label }),
          field.description && /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: field.description })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: Boolean(form[field.name]),
            onChange: (event) => setForm((current) => ({ ...current, [field.name]: event.target.checked })),
            className: "h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green"
          }
        )
      ] }) : field.type === "select" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: field.label }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: String(form[field.name] ?? "import"),
            onChange: (event) => setForm((current) => ({ ...current, [field.name]: event.target.value })),
            className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
            children: (field.options || [
              { value: "import", label: "Import into Zyptos" },
              { value: "export", label: "Export from Zyptos" },
              { value: "bidirectional", label: "Bi-directional" }
            ]).map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
          }
        ),
        field.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: field.description })
      ] }) : field.type === "textarea" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: field.label }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: String(form[field.name] ?? ""),
            onChange: (event) => setForm((current) => ({ ...current, [field.name]: event.target.value })),
            rows: 3,
            className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
          }
        )
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: field.label }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: field.secret ? "password" : field.type === "number" ? "number" : "text",
            value: String(form[field.name] ?? ""),
            onChange: (event) => setForm((current) => ({ ...current, [field.name]: event.target.value })),
            placeholder: field.placeholder || field.label,
            className: "w-full"
          }
        )
      ] }) }, field.name))
    ] }),
    (item.oauth === "google" || item.oauth === "facebook") && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: item.id === "meta-catalog" ? "Meta catalogs" : item.oauth === "facebook" ? "Facebook lead forms" : "Google picker helper" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.id === "meta-catalog" ? "Connect Facebook, then load available commerce catalogs and pick one without copying IDs manually." : item.oauth === "facebook" ? "Connect Facebook, then load available lead forms and pick one without copying IDs manually." : `Connect Google, then load available ${item.id === "google-sheets" ? "spreadsheets" : "calendars"} and pick one without copying IDs manually.` })
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: loadGoogleResources, disabled: !!processing || !item.connected, children: [
          processing === "app.integrations.resources" ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Database, { className: "h-4 w-4" }),
          item.id === "meta-catalog" ? "Load catalogs" : item.oauth === "facebook" ? "Load forms" : "Load"
        ] })
      ] }),
      resourceError && /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-red-600 dark:text-red-300", children: resourceError }),
      resources.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 waify-scrollbar", children: resources.map((resource) => /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "rounded-btn border bg-white p-3 transition dark:bg-waify-dark-surface",
            isSelectedResource(resource) ? "border-waify-green ring-2 ring-waify-green/15 dark:border-emerald-400" : "border-gray-100 hover:border-waify-green/50 dark:border-waify-dark-border"
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => chooseResource(resource), className: "min-w-0 flex-1 text-left", children: [
              /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium text-waify-text dark:text-waify-dark-text", children: resource.name }),
              /* @__PURE__ */ jsxs("span", { className: "mt-1 block truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                resource.id,
                resource.meta ? ` · ${resource.meta}` : ""
              ] }),
              resource.defaultSheet && /* @__PURE__ */ jsxs("span", { className: "mt-1 inline-flex rounded-full bg-waify-green/10 px-2 py-0.5 text-[10px] font-semibold text-waify-green-dark dark:text-emerald-300", children: [
                "Default tab: ",
                resource.defaultSheet
              ] })
            ] }),
            resource.url && /* @__PURE__ */ jsx(
              "a",
              {
                href: resource.url,
                target: "_blank",
                rel: "noreferrer",
                onClick: (event) => event.stopPropagation(),
                className: "rounded-md p-1.5 text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text",
                title: "Open in provider",
                children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" })
              }
            )
          ] })
        },
        resource.id
      )) }),
      manageHref && /* @__PURE__ */ jsx("div", { className: "mt-3 flex justify-end", children: /* @__PURE__ */ jsx(Link, { href: manageHref, children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
        "Open synced data"
      ] }) }) })
    ] }),
    item.recentLogs && item.recentLogs.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Recent activity" }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-2", children: item.recentLogs.map((log) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn border border-gray-100 p-3 text-xs dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsx(StatusBadge, { tone: log.status === "success" ? "success" : log.status === "failed" ? "danger" : "warning", children: log.status }),
          /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: log.started_at ? new Date(log.started_at).toLocaleString() : "Queued" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          log.trigger,
          " · ",
          log.created_count,
          " created · ",
          log.updated_count,
          " updated · ",
          log.skipped_count,
          " skipped"
        ] }),
        log.summary && /* @__PURE__ */ jsx("p", { className: "mt-1 truncate text-waify-text-muted dark:text-waify-dark-text-muted", children: Object.entries(log.summary).slice(0, 3).map(([key, value]) => `${key}: ${String(value)}`).join(" · ") }),
        log.error_message && /* @__PURE__ */ jsx("p", { className: "mt-1 text-red-600 dark:text-red-300", children: log.error_message })
      ] }, log.id)) })
    ] })
  ] }) });
}
function Index({ integrations, summary, sync_logs }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const filtered = useMemo(() => integrations.filter((integration) => {
    const q = query.trim().toLowerCase();
    const matchesCategory = category === "all" || (category === "connected" ? integration.connected : integration.category === category);
    const matchesSearch = !q || integration.name.toLowerCase().includes(q) || integration.desc.toLowerCase().includes(q) || integration.features.some((feature) => feature.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  }), [category, integrations, query]);
  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(integrations.map((integration) => integration.category))).map((id) => ({ id, label: id.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) }));
    return [...baseCategories, ...dynamic];
  }, [integrations]);
  const quickConnect = (integration) => {
    if (integration.systemManaged) {
      router.visit(route(integration.route || "app.whatsapp.connections.index"));
      return;
    }
    setDetail(integration);
  };
  const unhealthy = integrations.filter((integration) => integration.connected && !["healthy", "configured", "ok", "connected"].includes(String(healthStatus(integration.health) || integration.status).toLowerCase()));
  const latestError = integrations.find((integration) => integration.lastError);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Integrations" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text md:text-3xl", children: "Integrations" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Connect workspace-owned tools for payments, AI, commerce, webhooks, and external workflows." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsx(Link, { href: route("app.developer.index"), children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
          /* @__PURE__ */ jsx(Code2, { className: "h-4 w-4" }),
          "Developer hub"
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: query,
              onChange: (event) => setQuery(event.target.value),
              placeholder: "Search integrations...",
              className: "w-full pl-9"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 overflow-x-auto waify-scrollbar", children: categories.map((item) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setCategory(item.id),
            className: cn(
              "h-10 whitespace-nowrap rounded-btn px-3 text-xs font-medium transition",
              category === item.id ? "bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg" : "bg-gray-100 text-waify-text-muted hover:text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"
            ),
            children: item.label
          },
          item.id
        )) })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [
        { label: "Connected", value: summary.connected, note: `${integrations.length} available`, icon: Plug, tone: "text-waify-green-dark bg-waify-green-soft dark:bg-waify-green/10 dark:text-waify-green" },
        { label: "Healthy", value: summary.healthy, note: unhealthy.length ? `${unhealthy.length} need attention` : "No active issues", icon: CheckCircle2, tone: unhealthy.length ? "text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-200" : "text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-200" },
        { label: "Events today", value: summary.events_today, note: "Across connected apps", icon: Database, tone: "text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-200" },
        { label: "Sync logs", value: sync_logs.length, note: latestError?.lastError ? "Last error available" : "Latest activity", icon: RefreshCw, tone: latestError ? "text-red-700 bg-red-50 dark:bg-red-500/10 dark:text-red-200" : "text-purple-700 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-200" }
      ].map((item) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`, children: /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.label }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(item.value) }),
          /* @__PURE__ */ jsx("p", { className: "truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: item.note })
        ] })
      ] }) }, item.label)) }),
      unhealthy.length > 0 && /* @__PURE__ */ jsxs(Alert, { variant: "warning", title: "Integration health needs attention", children: [
        unhealthy.slice(0, 3).map((integration) => integration.name).join(", "),
        " ",
        unhealthy.length > 3 ? `and ${unhealthy.length - 3} more ` : "",
        "reported errors or incomplete health checks. Open a card to inspect credentials, logs, and last error."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: filtered.map((integration) => /* @__PURE__ */ jsx(
        Card,
        {
          className: "flex cursor-pointer flex-col transition hover:-translate-y-0.5 hover:shadow-card-lg",
          onClick: () => setDetail(integration),
          children: /* @__PURE__ */ jsxs(CardContent, { className: "flex h-full flex-col p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
                /* @__PURE__ */ jsx(ProviderLogo, { id: integration.id, name: integration.name }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: integration.name }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-wrap gap-1.5", children: [
                    /* @__PURE__ */ jsx(StatusBadge, { tone: stageTone(integration.stage), children: stageLabel(integration.stage) }),
                    integration.popular && /* @__PURE__ */ jsx(StatusBadge, { tone: "warning", children: "Popular" }),
                    integration.connected && /* @__PURE__ */ jsx(StatusBadge, { tone: "success", dot: true, children: "Connected" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  type: "button",
                  size: "sm",
                  variant: integration.connected || integration.stage === "roadmap" ? "secondary" : "primary",
                  onClick: (event) => {
                    event.stopPropagation();
                    quickConnect(integration);
                  },
                  children: [
                    integration.connected ? /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4" }) : integration.stage === "roadmap" ? /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Plug, { className: "h-4 w-4" }),
                    integration.connected ? "Manage" : integration.stage === "roadmap" ? "View plan" : "Configure"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 flex-1 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: integration.desc }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: integration.features.slice(0, 3).map((feature) => /* @__PURE__ */ jsx("span", { className: "rounded-md bg-gray-50 px-2 py-1 text-[11px] font-medium text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: feature }, feature)) }),
            integration.connected && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-between border-t border-gray-100 pt-3 text-[11px] text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Sync ",
                integration.lastSync || "not run"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: healthStatus(integration.health) || integration.status })
            ] })
          ] })
        },
        integration.id
      )) }),
      /* @__PURE__ */ jsx(IntegrationDrawer, { item: detail, open: !!detail, onClose: () => setDetail(null) })
    ] })
  ] });
}
export {
  Index as default
};
