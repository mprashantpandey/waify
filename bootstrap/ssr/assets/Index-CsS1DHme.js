import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, router, Link } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { RefreshCw, Users, CalendarClock, CreditCard, FileText, MessageSquareText, Search, Building2, Send, Eye } from "lucide-react";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { D as Drawer } from "./Elements-EbyZDnT_.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
function statusVariant(status) {
  const variants = {
    active: "success",
    trialing: "info",
    trial: "info",
    paused: "warning",
    past_due: "warning",
    canceled: "danger",
    cancelled: "danger"
  };
  return variants[status] || "default";
}
function formatDate(dateString) {
  if (!dateString) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateString));
}
function cleanLabel(label) {
  return label.replace("&laquo;", "Previous").replace("&raquo;", "Next");
}
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "green"
}) {
  const tones = {
    green: "bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200",
    blue: "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-200",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-200",
    purple: "bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-200"
  };
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-4 p-4", children: [
    /* @__PURE__ */ jsx("div", { className: cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-btn", tones[tone]), children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-[0.12em] text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: value }),
      /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: sub })
    ] })
  ] }) });
}
function SubscriptionsIndex({
  subscriptions,
  filters,
  selectedSubscription
}) {
  const { auth } = usePage().props;
  const [selected, setSelected] = useState(selectedSubscription || null);
  const pageMeta = {
    current_page: subscriptions.meta?.current_page ?? subscriptions.current_page ?? 1,
    last_page: subscriptions.meta?.last_page ?? subscriptions.last_page ?? 1,
    per_page: subscriptions.meta?.per_page ?? subscriptions.per_page ?? subscriptions.data.length,
    total: subscriptions.meta?.total ?? subscriptions.total ?? subscriptions.data.length
  };
  const stats = useMemo(() => {
    const rows = subscriptions.data;
    return {
      active: rows.filter((subscription) => subscription.status === "active").length,
      trialing: rows.filter((subscription) => ["trialing", "trial"].includes(subscription.status)).length,
      razorpayPaid: rows.filter((subscription) => subscription.is_razorpay_paid).length,
      attention: rows.filter((subscription) => ["past_due", "paused", "canceled", "cancelled"].includes(subscription.status) || subscription.last_error).length,
      messages: rows.reduce((sum, subscription) => sum + subscription.usage.messages_sent, 0),
      templates: rows.reduce((sum, subscription) => sum + subscription.usage.template_sends, 0)
    };
  }, [subscriptions.data]);
  const changeStatus = (status) => {
    router.get(
      route("platform.subscriptions.index"),
      status ? { status } : {},
      {
        preserveState: true,
        preserveScroll: true,
        replace: true
      }
    );
  };
  const statusTabs = [
    { id: "", label: "All" },
    { id: "active", label: "Active" },
    { id: "trialing", label: "Trials" },
    { id: "paused", label: "Paused" },
    { id: "past_due", label: "Past due" },
    { id: "canceled", label: "Canceled" }
  ];
  const firstResult = pageMeta.total === 0 ? 0 : pageMeta.per_page * (pageMeta.current_page - 1) + 1;
  const lastResult = Math.min(pageMeta.per_page * pageMeta.current_page, pageMeta.total);
  useEffect(() => {
    setSelected(selectedSubscription || null);
  }, [selectedSubscription]);
  const closeSelected = () => {
    setSelected(null);
    router.get(route("platform.subscriptions.index"), filters, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Subscriptions" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-waify-green dark:text-emerald-300", children: "Billing operations" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: "Subscriptions" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Workspace plan state, usage counters, trial windows, and renewal dates." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => router.reload(), children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
          "Refresh"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-5", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Active", value: stats.active, sub: "On this result page", icon: Users }),
        /* @__PURE__ */ jsx(StatCard, { label: "Trials", value: stats.trialing, sub: "Trialing subscriptions", icon: CalendarClock, tone: "blue" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Razorpay paid", value: stats.razorpayPaid, sub: "One-time payments", icon: CreditCard }),
        /* @__PURE__ */ jsx(StatCard, { label: "Needs attention", value: stats.attention, sub: "Past due, paused, or errored", icon: FileText, tone: "amber" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Messages", value: stats.messages.toLocaleString("en-IN"), sub: `${stats.templates.toLocaleString("en-IN")} template sends`, icon: MessageSquareText, tone: "purple" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-4 py-4 dark:border-waify-dark-border sm:px-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: statusTabs.map((tab) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => changeStatus(tab.id),
              className: cn(
                "rounded-btn px-3 py-2 text-sm font-medium transition",
                (filters?.status || "") === tab.id ? "bg-waify-green text-white shadow-sm" : "bg-gray-100 text-waify-text-muted hover:bg-gray-200 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:bg-slate-700"
              ),
              children: tab.label
            },
            tab.id || "all"
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-[220px] items-center gap-2 rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Use filters to narrow billing state" })
          ] })
        ] }) }),
        subscriptions.data.length === 0 ? /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-card bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200", children: /* @__PURE__ */ jsx(FileText, { className: "h-7 w-7" }) }),
          /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: "No subscriptions found" }),
          /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: filters?.status ? `No subscriptions currently match "${filters.status}".` : "No subscriptions have been created yet." })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted", children: [
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Workspace" }),
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Plan" }),
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Usage" }),
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Period end" }),
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Started" }),
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: subscriptions.data.map((subscription) => /* @__PURE__ */ jsxs(
              "tr",
              {
                className: "text-waify-text transition hover:bg-gray-50/70 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2/40",
                children: [
                  /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-btn bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200", children: /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "font-semibold", children: subscription.account.name }),
                      /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: subscription.account.slug })
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
                    /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: subscription.plan.name }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: subscription.plan.key })
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
                    /* @__PURE__ */ jsx(Badge, { variant: statusVariant(subscription.status), children: subscription.status.replace("_", " ") }),
                    subscription.is_razorpay_paid && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                      "Razorpay ",
                      subscription.provider_status || "paid"
                    ] }),
                    subscription.last_error && /* @__PURE__ */ jsx("div", { className: "mt-1 max-w-[220px] truncate text-xs text-red-600 dark:text-red-300", children: subscription.last_error })
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 text-xs", children: [
                    /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-waify-text dark:text-waify-dark-text", children: [
                      /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5 text-waify-green dark:text-emerald-300" }),
                      subscription.usage.messages_sent.toLocaleString("en-IN"),
                      " messages"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                      /* @__PURE__ */ jsx(MessageSquareText, { className: "h-3.5 w-3.5" }),
                      subscription.usage.template_sends.toLocaleString("en-IN"),
                      " templates"
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: formatDate(subscription.current_period_end) }),
                  /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: formatDate(subscription.started_at) }),
                  /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      onClick: () => router.get(
                        route("platform.subscriptions.index"),
                        { ...filters || {}, subscription: subscription.slug },
                        { preserveState: true, preserveScroll: true, replace: true }
                      ),
                      children: [
                        /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                        "Inspect"
                      ]
                    }
                  ) }) })
                ]
              },
              subscription.id
            )) })
          ] }) }),
          pageMeta.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              "Showing ",
              firstResult,
              " to ",
              lastResult,
              " of ",
              pageMeta.total,
              " results"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: subscriptions.links.map(
              (link, index) => link.url ? /* @__PURE__ */ jsx(
                Link,
                {
                  href: link.url,
                  preserveScroll: true,
                  className: cn(
                    "rounded-btn px-3 py-2 text-sm font-medium transition",
                    link.active ? "bg-waify-green text-white" : "bg-white text-waify-text ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text dark:ring-waify-dark-border"
                  ),
                  children: cleanLabel(link.label)
                },
                `${link.label}-${index}`
              ) : /* @__PURE__ */ jsx(
                "span",
                {
                  className: "rounded-btn bg-gray-100 px-3 py-2 text-sm text-waify-text-muted opacity-60 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted",
                  children: cleanLabel(link.label)
                },
                `${link.label}-${index}`
              )
            ) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: !!selected,
        onClose: closeSelected,
        title: selected?.account.name || "Subscription",
        description: selected ? `${selected.plan.name} · ${selected.status.replace("_", " ")}` : void 0,
        footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeSelected, children: "Close" }),
          selected && /* @__PURE__ */ jsx(Button, { onClick: () => router.visit(route("platform.accounts.show", { account: selected.account.id })), children: "Open workspace" })
        ] }),
        children: selected && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: selected.account.name }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: selected.account.slug })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
              /* @__PURE__ */ jsx(Badge, { variant: statusVariant(selected.status), children: selected.status.replace("_", " ") }),
              /* @__PURE__ */ jsx(Badge, { variant: selected.is_razorpay_paid ? "success" : "secondary", children: selected.is_razorpay_paid ? "Razorpay paid" : selected.provider || "local" })
            ] })
          ] }) }),
          selected.last_error && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200", children: selected.last_error }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Messages sent" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: selected.usage.messages_sent.toLocaleString("en-IN") })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Template sends" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: selected.usage.template_sends.toLocaleString("en-IN") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Plan" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: selected.plan.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Payment reference" }),
              /* @__PURE__ */ jsx("span", { className: "max-w-[220px] truncate font-medium text-waify-text dark:text-waify-dark-text", children: selected.provider_ref || "Not linked" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Provider customer" }),
              /* @__PURE__ */ jsx("span", { className: "max-w-[220px] truncate font-medium text-waify-text dark:text-waify-dark-text", children: selected.provider_customer_ref || "Not linked" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Provider status" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: selected.provider_status || "Not set" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Period start" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: formatDate(selected.current_period_start) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Trial ends" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: formatDate(selected.trial_ends_at) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Period end" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: formatDate(selected.current_period_end) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Last payment" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: formatDate(selected.last_payment_at) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Last payment failed" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: formatDate(selected.last_payment_failed_at) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Discount" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: selected.discount_code || "None" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Cancel at period end" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: selected.cancel_at_period_end ? "Yes" : "No" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Started" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: formatDate(selected.started_at) })
            ] })
          ] })
        ] })
      }
    )
  ] });
}
export {
  SubscriptionsIndex as default
};
