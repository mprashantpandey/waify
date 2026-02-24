import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { Activity, ServerCog, Mail, MessageSquare, Radio, CheckCircle2, AlertTriangle } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function statusTone(score) {
  if (score >= 85) {
    return { label: "Healthy", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" };
  }
  if (score >= 60) {
    return { label: "Warning", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
  }
  return { label: "Critical", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
}
const fmt = (value) => value ? new Date(value).toLocaleString() : "N/A";
function DeliveryTab({ delivery }) {
  const tone = statusTone(delivery.health_score);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5" }),
          "Delivery & Trigger Health"
        ] }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          "Generated at ",
          fmt(delivery.generated_at)
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-600 dark:text-slate-400", children: "Overall health score" }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-slate-900 dark:text-slate-100", children: delivery.health_score })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${tone.cls}`, children: tone.label })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsx(ServerCog, { className: "h-4 w-4" }),
          "Queue"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "Pending total: ",
            /* @__PURE__ */ jsx("strong", { children: delivery.queue.pending_total })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Failed (1h): ",
            /* @__PURE__ */ jsx("strong", { children: delivery.queue.failed_last_hour })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Failed (24h): ",
            /* @__PURE__ */ jsx("strong", { children: delivery.queue.failed_last_24h })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Oldest pending: ",
            /* @__PURE__ */ jsx("strong", { children: fmt(delivery.queue.oldest_pending_at) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-2", children: Object.entries(delivery.queue.pending_by_queue).map(([queue, count]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800", children: [
            /* @__PURE__ */ jsx("span", { children: queue }),
            /* @__PURE__ */ jsx("strong", { children: count })
          ] }, queue)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }),
          "Email"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "Driver: ",
            /* @__PURE__ */ jsx("strong", { children: delivery.mail.driver })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Mail-related failures (24h): ",
            /* @__PURE__ */ jsx("strong", { children: delivery.mail.mail_related_failures_last_24h })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Notification failures (24h): ",
            /* @__PURE__ */ jsx("strong", { children: delivery.mail.notification_failures_last_24h })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Failover enabled: ",
            /* @__PURE__ */ jsx("strong", { children: delivery.mail.fallback_enabled ? "Yes" : "No" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Last fallback: ",
            /* @__PURE__ */ jsx("strong", { children: fmt(delivery.mail.fallback_last_triggered_at) })
          ] }),
          delivery.mail.fallback_last_error && /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200", children: [
            "Last fallback error: ",
            delivery.mail.fallback_last_error
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-2 text-xs text-slate-500 dark:text-slate-400", children: "Template diagnostics (last 7 days)" }),
          delivery.mail.template_diagnostics.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500 dark:text-slate-400", children: "No outbox diagnostics yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: delivery.mail.template_diagnostics.map((row) => /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-gray-50 p-2 text-xs dark:bg-gray-800", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: row.template_key }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1", children: [
              "total: ",
              /* @__PURE__ */ jsx("strong", { children: row.total }),
              " | sent: ",
              /* @__PURE__ */ jsx("strong", { children: row.sent }),
              " | failed: ",
              /* @__PURE__ */ jsx("strong", { children: row.failed }),
              " | queued/retrying: ",
              /* @__PURE__ */ jsx("strong", { children: row.queued + row.retrying })
            ] })
          ] }, row.template_key)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }),
          "Triggers"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-1 font-semibold", children: "Chatbots (24h)" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.entries(delivery.triggers.chatbots_24h).map(([k, v]) => /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800", children: [
              k,
              ": ",
              /* @__PURE__ */ jsx("strong", { children: v })
            ] }, k)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-1 font-semibold", children: "Campaigns (24h)" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.entries(delivery.triggers.campaigns_24h).map(([k, v]) => /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800", children: [
              k,
              ": ",
              /* @__PURE__ */ jsx("strong", { children: v })
            ] }, k)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsx(Radio, { className: "h-4 w-4" }),
          "Webhooks"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "Active connections: ",
            /* @__PURE__ */ jsx("strong", { children: delivery.webhooks.active_connections })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Healthy: ",
            /* @__PURE__ */ jsx("strong", { children: delivery.webhooks.healthy_connections })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Stale: ",
            /* @__PURE__ */ jsx("strong", { children: delivery.webhooks.stale_connections })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "With errors: ",
            /* @__PURE__ */ jsx("strong", { children: delivery.webhooks.connections_with_errors })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Last webhook: ",
            /* @__PURE__ */ jsx("strong", { children: fmt(delivery.webhooks.last_webhook_at) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Recent Failures" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Latest failed jobs from queue workers." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: delivery.recent_failures.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
        "No recent failures."
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: delivery.recent_failures.map((failure) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900/40 dark:bg-red-900/20", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 font-semibold text-red-700 dark:text-red-300", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }),
            "Queue: ",
            failure.queue
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-red-700/80 dark:text-red-300/80", children: fmt(failure.failed_at) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-red-800 dark:text-red-200", children: failure.error })
      ] }, failure.id)) }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Recent Email Delivery Failures" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Template-level diagnostics from notification outbox." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: delivery.mail.recent_outbox_failures.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
        "No recent email delivery failures."
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: delivery.mail.recent_outbox_failures.map((failure, idx) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/40 dark:bg-amber-900/20", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-amber-800 dark:text-amber-200", children: failure.template_key }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-amber-700/80 dark:text-amber-300/80", children: fmt(failure.failed_at) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-amber-900 dark:text-amber-100", children: [
          "recipient: ",
          failure.recipient || "unknown",
          " | code: ",
          failure.provider_code || "n/a"
        ] }),
        failure.failure_reason && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-amber-800 dark:text-amber-200", children: failure.failure_reason })
      ] }, `${failure.template_key}-${failure.failed_at}-${idx}`)) }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Backups" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Automated database backup and restore drill status." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          "Latest backup status: ",
          /* @__PURE__ */ jsx("strong", { children: delivery.backups.latest_status || "N/A" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "Latest completed at: ",
          /* @__PURE__ */ jsx("strong", { children: fmt(delivery.backups.latest_completed_at) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "Latest restore drill: ",
          /* @__PURE__ */ jsx("strong", { children: delivery.backups.latest_restore_drill_status || "N/A" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "Restore drill at: ",
          /* @__PURE__ */ jsx("strong", { children: fmt(delivery.backups.latest_restore_drill_at) })
        ] })
      ] })
    ] })
  ] });
}
export {
  DeliveryTab as default
};
