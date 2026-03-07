import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import "./Topbar-B0L72tZm.js";
import "lucide-react";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function OperationalAlertsIndex({
  filters,
  stats,
  events
}) {
  const { auth } = usePage().props;
  const rows = events?.data || [];
  const links = events?.links || [];
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkResolveNote, setBulkResolveNote] = useState("");
  const [detailEvent, setDetailEvent] = useState(null);
  const [detailResolveNote, setDetailResolveNote] = useState("");
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const toggleSelection = (id, checked) => {
    setSelectedIds((prev) => checked ? [.../* @__PURE__ */ new Set([...prev, id])] : prev.filter((item) => item !== id));
  };
  const toggleSelectPage = (checked) => {
    const pageIds = rows.map((row) => row.id);
    setSelectedIds((prev) => checked ? [.../* @__PURE__ */ new Set([...prev, ...pageIds])] : prev.filter((id) => !pageIds.includes(id)));
  };
  const bulkAcknowledge = () => {
    if (selectedIds.length === 0) return;
    router.post(route("platform.operational-alerts.acknowledge.bulk"), {
      ids: selectedIds,
      resolve_note: bulkResolveNote || null
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedIds([]);
        setBulkResolveNote("");
      }
    });
  };
  const exportCsv = () => {
    const params = new URLSearchParams({
      status: String(filters?.status || ""),
      severity: String(filters?.severity || ""),
      ack: String(filters?.ack || ""),
      q: String(filters?.q || "")
    });
    window.location.href = `${route("platform.operational-alerts.export")}?${params.toString()}`;
  };
  const openDetails = (row) => {
    setDetailEvent(row);
    setDetailResolveNote(row.resolve_note || "");
  };
  const acknowledgeFromDrawer = () => {
    if (!detailEvent) return;
    router.post(route("platform.operational-alerts.acknowledge", { event: detailEvent.id }), {
      resolve_note: detailResolveNote || null
    }, {
      preserveScroll: true,
      onSuccess: () => setDetailEvent(null)
    });
  };
  const onFilterSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    router.get(
      route("platform.operational-alerts.index"),
      {
        status: form.get("status") || "",
        severity: form.get("severity") || "",
        ack: form.get("ack") || "",
        q: form.get("q") || ""
      },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };
  const severityBadge = (severity) => {
    if (severity === "critical") return /* @__PURE__ */ jsx(Badge, { variant: "danger", children: "critical" });
    if (severity === "warning") return /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "warning" });
    return /* @__PURE__ */ jsx(Badge, { variant: "info", children: "info" });
  };
  const statusBadge = (status) => {
    if (status === "sent") return /* @__PURE__ */ jsx(Badge, { variant: "success", children: "sent" });
    if (status === "failed") return /* @__PURE__ */ jsx(Badge, { variant: "danger", children: "failed" });
    return /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "skipped" });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Operational Alerts" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Operational Alerts" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Queue failure and ops alert delivery history." })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => router.post(route("platform.operational-alerts.test")), children: "Send Test Alert" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Total" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats?.total || 0 })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Failed" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: stats?.failed || 0 })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Skipped" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-gray-700 dark:text-gray-300", children: stats?.skipped || 0 })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Critical (24h)" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-amber-600 dark:text-amber-400", children: stats?.critical_24h || 0 })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Filters" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: onFilterSubmit, className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "status",
              defaultValue: filters?.status || "",
              className: "rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All status" }),
                /* @__PURE__ */ jsx("option", { value: "sent", children: "sent" }),
                /* @__PURE__ */ jsx("option", { value: "skipped", children: "skipped" }),
                /* @__PURE__ */ jsx("option", { value: "failed", children: "failed" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "severity",
              defaultValue: filters?.severity || "",
              className: "rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All severity" }),
                /* @__PURE__ */ jsx("option", { value: "info", children: "info" }),
                /* @__PURE__ */ jsx("option", { value: "warning", children: "warning" }),
                /* @__PURE__ */ jsx("option", { value: "critical", children: "critical" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(TextInput, { name: "q", defaultValue: filters?.q || "", placeholder: "Search event/scope/error..." }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "ack",
              defaultValue: filters?.ack || "",
              className: "rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All acknowledgement" }),
                /* @__PURE__ */ jsx("option", { value: "no", children: "unacknowledged" }),
                /* @__PURE__ */ jsx("option", { value: "yes", children: "acknowledged" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "submit", children: "Apply" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                onClick: () => router.get(route("platform.operational-alerts.index")),
                children: "Clear"
              }
            )
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Recent Events" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              TextInput,
              {
                value: bulkResolveNote,
                onChange: (e) => setBulkResolveNote(e.target.value),
                placeholder: "Resolve note for selected..."
              }
            ),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: exportCsv, children: "Export CSV" }),
            /* @__PURE__ */ jsxs(Button, { type: "button", onClick: bulkAcknowledge, disabled: selectedIds.length === 0, children: [
              "Acknowledge Selected (",
              selectedIds.length,
              ")"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-800", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: rows.length > 0 && rows.every((row) => selectedIdSet.has(row.id)),
                  onChange: (e) => toggleSelectPage(e.target.checked)
                }
              ) }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500", children: "Event" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500", children: "Severity" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500", children: "Ack" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500", children: "Scope" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500", children: "Channels" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500", children: "Time" })
            ] }) }),
            /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-100 dark:divide-gray-800", children: [
              rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-4 py-8 text-center text-sm text-gray-500", children: "No alert events found." }) }),
              rows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "align-top", children: [
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: selectedIdSet.has(row.id),
                    onChange: (e) => toggleSelection(row.id, e.target.checked)
                  }
                ) }),
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: row.title }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: row.event_key }),
                  row.error_message && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-600 dark:text-red-400 max-w-md break-words", children: row.error_message }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: () => openDetails(row), children: "View Details" }) })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: severityBadge(row.severity) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: statusBadge(row.status) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: row.acknowledged_at ? /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx(Badge, { variant: "success", children: "acknowledged" }),
                  row.resolve_note && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 max-w-xs break-words", children: row.resolve_note })
                ] }) : /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "secondary",
                    onClick: () => openDetails(row),
                    children: "Acknowledge"
                  }
                ) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-gray-600 dark:text-gray-300", children: row.scope || "-" }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-gray-600 dark:text-gray-300", children: Object.entries(row.channels || {}).map(([k, v]) => /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                    k,
                    ":"
                  ] }),
                  " ",
                  String(v)
                ] }, `${row.id}-${k}`)) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap", children: row.created_at ? new Date(row.created_at).toLocaleString() : "-" })
              ] }, row.id))
            ] })
          ] }) }),
          links.length > 0 && /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2", children: links.map((link, idx) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              className: `px-3 py-1.5 text-sm rounded border ${link.active ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"} ${!link.url ? "opacity-50 pointer-events-none" : ""}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            `${idx}-${link.label}`
          )) })
        ] })
      ] })
    ] }),
    detailEvent && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40", onClick: () => setDetailEvent(null) }),
      /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 overflow-y-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Alert Details" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: detailEvent.event_key })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setDetailEvent(null), children: "Close" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Title" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100", children: detailEvent.title })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx("div", { children: severityBadge(detailEvent.severity) }),
            /* @__PURE__ */ jsx("div", { children: statusBadge(detailEvent.status) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Scope" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100", children: detailEvent.scope || "-" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Channels" }),
            /* @__PURE__ */ jsx("pre", { className: "mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto", children: JSON.stringify(detailEvent.channels || {}, null, 2) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Context / Payload" }),
            /* @__PURE__ */ jsx("pre", { className: "mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto", children: JSON.stringify(detailEvent.context || {}, null, 2) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Error" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 dark:text-red-400 break-words", children: detailEvent.error_message || "-" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Resolve Note" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: detailResolveNote,
                onChange: (e) => setDetailResolveNote(e.target.value),
                rows: 4,
                className: "mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900",
                placeholder: "Optional note for audit trail..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: acknowledgeFromDrawer,
                disabled: !!detailEvent.acknowledged_at && detailResolveNote === (detailEvent.resolve_note || ""),
                children: detailEvent.acknowledged_at ? "Update Note" : "Acknowledge"
              }
            ),
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setDetailEvent(null), children: "Done" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  OperationalAlertsIndex as default
};
