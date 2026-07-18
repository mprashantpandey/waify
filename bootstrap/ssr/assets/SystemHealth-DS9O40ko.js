import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { RotateCcw, CheckCircle, XCircle, Activity, PlayCircle, Trash2, HardDrive, Database, Megaphone, RefreshCw, Send, AlertTriangle } from "lucide-react";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "react";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
function SystemHealth({
  webhook_health,
  webhook_event_health,
  recent_webhook_events = [],
  connection_details,
  queue_status,
  campaign_health,
  storage_status,
  database_status,
  recent_errors,
  integration_sync_logs = []
}) {
  const { auth } = usePage().props;
  const confirm = useConfirm();
  const formatBytes = (bytes) => {
    if (bytes === null || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };
  const recoverCampaigns = () => {
    router.post(route("platform.system-health.campaigns.recover"), {}, {
      preserveScroll: true
    });
  };
  const replayWebhookEvent = async (id) => {
    const confirmed = await confirm({
      title: "Replay webhook event",
      message: "Re-process this webhook event from its stored payload? Use this only after fixing the underlying error.",
      confirmText: "Replay event",
      variant: "warning"
    });
    if (confirmed) router.post(route("platform.system-health.webhooks.replay", id), {}, { preserveScroll: true });
  };
  const runQueueOnce = () => router.post(route("platform.system-health.queue.run"), {}, { preserveScroll: true });
  const retryAllFailedJobs = () => router.post(route("platform.system-health.queue.retry-all"), {}, { preserveScroll: true });
  const flushFailedJobs = async () => {
    const confirmed = await confirm({
      title: "Flush failed jobs",
      message: "Remove all failed job records? Retry them first if they are still needed.",
      confirmText: "Flush failed jobs",
      variant: "danger"
    });
    if (confirmed) router.post(route("platform.system-health.queue.flush"), {}, { preserveScroll: true });
  };
  const retryFailedJob = (id) => router.post(route("platform.system-health.queue.retry", id), {}, { preserveScroll: true });
  const forgetFailedJob = async (id) => {
    const confirmed = await confirm({
      title: "Remove failed job",
      message: "Remove this failed job record?",
      confirmText: "Remove job",
      variant: "danger"
    });
    if (confirmed) router.delete(route("platform.system-health.queue.forget", id), { preserveScroll: true });
  };
  const getHealthStatus = (isHealthy) => {
    return isHealthy ? /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }),
      "Healthy"
    ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "danger", className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(XCircle, { className: "h-3 w-3" }),
      "Unhealthy"
    ] });
  };
  const eventStatusVariant = (status) => {
    if (status === "processed") return "success";
    if (status === "failed") return "danger";
    if (status === "processing") return "warning";
    return "default";
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "System Health" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "System Health" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Monitor system components and infrastructure status" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Webhook Health" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "WhatsApp webhook subscription and activity status" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Total Connections" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: webhook_health.total })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 dark:bg-green-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Subscribed" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: webhook_health.subscribed })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Recent Activity (24h)" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-400", children: webhook_health.recent_activity })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "With Errors" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: webhook_health.with_errors })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Webhook Event Processing" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Last 24 hours plus failed and stuck event detection." })
              ] }),
              webhook_event_health.stuck_processing > 0 || webhook_event_health.failed_24h > 0 ? /* @__PURE__ */ jsx(Badge, { variant: "danger", children: "Needs attention" }) : /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Stable" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-6", children: [
              ["Total", webhook_event_health.total_24h],
              ["Processed", webhook_event_health.processed_24h],
              ["Skipped", webhook_event_health.skipped_24h],
              ["Failed", webhook_event_health.failed_24h],
              ["Processing", webhook_event_health.processing_24h],
              ["Stuck", webhook_event_health.stuck_processing]
            ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-white p-3 dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-waify-dark-text-muted", children: label }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xl font-bold text-gray-900 dark:text-waify-dark-text", children: value })
            ] }, label)) }),
            recent_webhook_events.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 overflow-x-auto rounded-lg border border-gray-100 bg-white dark:border-waify-dark-border dark:bg-waify-dark-surface", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-100 text-sm dark:divide-waify-dark-border", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-xs uppercase tracking-wide text-gray-500 dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Workspace" }),
                /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Event" }),
                /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Status" }),
                /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Attempts" }),
                /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Last seen" }),
                /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Error" }),
                /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Action" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: recent_webhook_events.map((event) => /* @__PURE__ */ jsxs("tr", { className: "align-top", children: [
                /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-waify-dark-text", children: event.account }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-waify-dark-text-muted", children: event.connection })
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-waify-dark-text", children: event.event_type || "event" }),
                  /* @__PURE__ */ jsx("p", { className: "max-w-xs truncate text-xs text-gray-500 dark:text-waify-dark-text-muted", children: event.event_key })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx(Badge, { variant: eventStatusVariant(event.status), children: event.status }) }),
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted", children: event.attempts }),
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted", children: event.last_received_at ? new Date(event.last_received_at).toLocaleString() : "Unknown" }),
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("p", { className: "max-w-sm text-xs text-red-700 dark:text-red-300", children: event.last_error || "Processing exceeded 10 minutes." }) }),
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => replayWebhookEvent(event.id), children: [
                  /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
                  "Replay"
                ] }) })
              ] }, event.id)) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3", children: "Connection Details" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: connection_details.map((conn) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-50 p-3 dark:bg-gray-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
                  conn.is_healthy ? /* @__PURE__ */ jsx(CheckCircle, { className: "mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(XCircle, { className: "mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: conn.name }),
                    /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: [
                      "Workspace #",
                      conn.account_id,
                      " · WABA ",
                      conn.waba_id || "-",
                      " · Phone ID ",
                      conn.phone_number_id || "-"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [
                      /* @__PURE__ */ jsx(Badge, { variant: conn.webhook_subscribed ? "success" : "warning", children: conn.webhook_subscribed ? "Subscribed" : "Not subscribed" }),
                      /* @__PURE__ */ jsx(Badge, { variant: conn.is_active ? "success" : "default", children: conn.is_active ? "Active" : "Inactive" }),
                      conn.quality_rating && /* @__PURE__ */ jsxs(Badge, { variant: "info", children: [
                        "Quality ",
                        conn.quality_rating
                      ] }),
                      conn.phone_number_status && /* @__PURE__ */ jsx(Badge, { variant: "default", children: conn.phone_number_status })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "shrink-0 text-right", children: [
                  getHealthStatus(conn.is_healthy),
                  /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: "Last activity" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-900 dark:text-gray-100", children: conn.last_received_at ? new Date(conn.last_received_at).toLocaleString() : "Never" })
                ] })
              ] }),
              (conn.diagnostics || []).length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100", children: (conn.diagnostics || []).map((item, index) => /* @__PURE__ */ jsx("p", { className: index > 0 ? "mt-1" : "", children: item }, `${conn.id}-diag-${index}`)) })
            ] }, conn.id)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5" }),
            "Queue Status"
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Driver" }),
              /* @__PURE__ */ jsx(Badge, { variant: "info", children: queue_status.driver })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Connection" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: queue_status.connection || "N/A" })
            ] }),
            queue_status.pending_jobs !== null && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Pending Jobs" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: queue_status.pending_jobs })
            ] }),
            queue_status.pending_by_queue?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-waify-dark-text-muted", children: "Pending by queue" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: queue_status.pending_by_queue.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-waify-dark-text-muted", children: item.queue }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-waify-dark-text", children: item.count })
              ] }, item.queue)) })
            ] }),
            queue_status.required_queues && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-amber-900 dark:text-amber-100", children: "Worker coverage" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-amber-800 dark:text-amber-200", children: [
                "Required queues: ",
                queue_status.required_queues.join(", ")
              ] }),
              queue_status.pending_required_queues && queue_status.pending_required_queues.length > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-amber-800 dark:text-amber-200", children: [
                "Pending required queues: ",
                queue_status.pending_required_queues.join(", ")
              ] }),
              queue_status.recommended_worker && /* @__PURE__ */ jsx("code", { className: "mt-2 block rounded bg-white/80 px-2 py-1 text-xs text-amber-950 dark:bg-black/20 dark:text-amber-100", children: queue_status.recommended_worker })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Failed Jobs" }),
              /* @__PURE__ */ jsx(Badge, { variant: queue_status.failed_jobs && queue_status.failed_jobs > 0 ? "danger" : "success", children: queue_status.failed_jobs ?? "N/A" })
            ] }),
            queue_status.cron && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-waify-dark-text-muted", children: "External cron" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-waify-dark-text-muted", children: "Token" }),
                  /* @__PURE__ */ jsx(Badge, { variant: queue_status.cron.external_url_configured ? "success" : "warning", children: queue_status.cron.external_url_configured ? "Configured" : "Missing" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-waify-dark-text-muted", children: "Last run" }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 dark:text-waify-dark-text", children: queue_status.cron.last_run_at ? new Date(queue_status.cron.last_run_at).toLocaleString() : "Never" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-waify-dark-text-muted", children: "Status" }),
                  /* @__PURE__ */ jsx(Badge, { variant: queue_status.cron.last_status === "failed" ? "danger" : queue_status.cron.last_status ? "success" : "warning", children: queue_status.cron.last_status ?? "Unknown" })
                ] }),
                queue_status.cron.last_error && /* @__PURE__ */ jsx("p", { className: "rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-200", children: queue_status.cron.last_error })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 pt-2", children: [
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: runQueueOnce, children: [
                /* @__PURE__ */ jsx(PlayCircle, { className: "h-4 w-4" }),
                "Run worker once"
              ] }),
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: retryAllFailedJobs, children: [
                /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
                "Retry failed jobs"
              ] }),
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "danger", size: "sm", onClick: flushFailedJobs, children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                "Flush failed jobs"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(HardDrive, { className: "h-5 w-5" }),
            "Storage Status"
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Public Available" }),
              storage_status.public_available ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Public Writable" }),
              storage_status.public_writable ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" })
            ] }),
            storage_status.public_size !== null && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Public Size" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatBytes(storage_status.public_size) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }),
            "Database Status"
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Connection" }),
              database_status.connected ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" })
            ] }),
            database_status.connected && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Driver" }),
                /* @__PURE__ */ jsx(Badge, { variant: "info", children: database_status.driver })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Database" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: database_status.connection })
              ] })
            ] }),
            database_status.error && /* @__PURE__ */ jsx("div", { className: "p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400", children: database_status.error })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Megaphone, { className: "h-5 w-5" }),
              "Campaign Delivery Health"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Detects scheduled campaigns that missed their job and sending campaigns with pending recipients." })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: recoverCampaigns, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            "Recover campaigns"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-6", children: [
            ["Sending", campaign_health.sending],
            ["Due scheduled", campaign_health.scheduled_due],
            ["Future scheduled", campaign_health.scheduled_future],
            ["Stalled", campaign_health.stalled_sending],
            ["Pending recipients", campaign_health.pending_recipients],
            ["Failed recipients", campaign_health.failed_recipients]
          ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-waify-dark-text-muted", children: label }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xl font-bold text-gray-900 dark:text-waify-dark-text", children: value })
          ] }, label)) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100", children: [
            /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
            "Cron now runs campaign recovery before processing the queue."
          ] })
        ] })
      ] }),
      integration_sync_logs.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5" }),
            "Integration Sync Logs"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Latest manual, scheduled, and provider webhook sync activity across workspaces." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-100 text-sm dark:divide-waify-dark-border", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-xs uppercase tracking-wide text-gray-500 dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Workspace" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Provider" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Trigger" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Records" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Started" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: integration_sync_logs.map((log) => /* @__PURE__ */ jsxs("tr", { className: "align-top", children: [
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-medium text-gray-900 dark:text-waify-dark-text", children: log.account }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 capitalize text-gray-700 dark:text-waify-dark-text-muted", children: log.provider.replace(/-/g, " ") }),
            /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
              /* @__PURE__ */ jsx(Badge, { variant: log.status === "success" ? "success" : log.status === "failed" ? "danger" : "warning", children: log.status }),
              log.error_message && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-xs text-xs text-red-600 dark:text-red-300", children: log.error_message })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted", children: log.trigger }),
            /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted", children: [
              log.created_count,
              " created · ",
              log.updated_count,
              " updated · ",
              log.error_count,
              " errors"
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted", children: log.started_at ? new Date(log.started_at).toLocaleString() : "Queued" })
          ] }, log.id)) })
        ] }) }) })
      ] }),
      recent_errors.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600 dark:text-yellow-400" }),
            "Recent Errors"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Failed jobs and system errors" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: recent_errors.map((error) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: error.payload?.displayName || error.payload?.job || "Unknown Job" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                    "Queue: ",
                    error.queue,
                    " | Connection: ",
                    error.connection
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(error.failed_at).toLocaleString() }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxs(Button, { type: "button", size: "xs", variant: "secondary", onClick: () => retryFailedJob(error.id), children: [
                      /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
                      "Retry"
                    ] }),
                    /* @__PURE__ */ jsxs(Button, { type: "button", size: "xs", variant: "danger", onClick: () => forgetFailedJob(error.id), children: [
                      /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                      "Forget"
                    ] })
                  ] })
                ] })
              ] }),
              error.exception_summary && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-700 dark:text-red-200", children: error.exception_summary }),
              /* @__PURE__ */ jsxs("details", { className: "mt-2", children: [
                /* @__PURE__ */ jsx("summary", { className: "text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline", children: "View Error Details" }),
                /* @__PURE__ */ jsx("pre", { className: "mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-40", children: error.exception })
              ] })
            ]
          },
          error.id
        )) }) })
      ] })
    ] })
  ] });
}
export {
  SystemHealth as default
};
