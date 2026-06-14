import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { CheckCircle2, Filter, ShieldAlert, Bell, ExternalLink } from "lucide-react";
import "react";
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
function severityVariant(severity) {
  if (severity === "critical") return "danger";
  if (severity === "warning") return "warning";
  if (severity === "success") return "success";
  if (severity === "info") return "info";
  return "default";
}
function NotificationsIndex({ notifications, filters, stats }) {
  const markRead = (notification) => router.post(route("app.notifications.read", notification.id), {}, { preserveScroll: true });
  const markAllRead = () => router.post(route("app.notifications.read-all"), {}, { preserveScroll: true });
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Notifications" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: "Notifications" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Workspace alerts for billing, leads, automation, and template quality." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Badge, { variant: "warning", children: [
            stats.unread,
            " unread"
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: "danger", children: [
            stats.critical,
            " critical"
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: markAllRead, disabled: stats.unread === 0, children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Mark all read"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "flex flex-wrap gap-2 p-4", children: ["all", "unread", "read"].map((status) => /* @__PURE__ */ jsx(Link, { href: route("app.notifications.index", { ...filters, status }), children: /* @__PURE__ */ jsxs(Button, { variant: (filters.status || "all") === status ? "primary" : "secondary", size: "sm", children: [
        /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
        status
      ] }) }, status)) }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: notifications.data.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-14 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No notifications found." }) }) : notifications.data.map((notification) => /* @__PURE__ */ jsx(Card, { className: !notification.read_at ? "border-waify-green/30" : void 0, children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300", children: notification.severity === "critical" ? /* @__PURE__ */ jsx(ShieldAlert, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: notification.title }),
              /* @__PURE__ */ jsx(Badge, { variant: severityVariant(notification.severity), children: notification.severity }),
              !notification.read_at && /* @__PURE__ */ jsx(Badge, { variant: "info", children: "Unread" })
            ] }),
            notification.body && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: notification.body }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: notification.created_at ? new Date(notification.created_at).toLocaleString() : "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 gap-2", children: [
          notification.action_url && /* @__PURE__ */ jsx("a", { href: notification.action_url, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
            "Open"
          ] }) }),
          !notification.read_at && /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => markRead(notification), children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Read"
          ] })
        ] })
      ] }) }, notification.id)) })
    ] })
  ] });
}
export {
  NotificationsIndex as default
};
