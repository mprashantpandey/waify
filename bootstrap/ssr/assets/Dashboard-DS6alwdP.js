import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm, Head, Link as Link$1 } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { M as Modal } from "./Modal-BeSeEOS3.js";
import { MessageSquare, Link, Inbox, Users, Copy, QrCode, Sparkles, ArrowRight, CheckCircle, Send, Activity, FileText, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { I as Input } from "./Input-B0lHg7LA.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import QRCode from "qrcode";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./Alert-C-mQ6HNk.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "@headlessui/react";
function Dashboard({
  account,
  stats,
  onboarding_checklist,
  connection_alerts = [],
  connection_heartbeat = null,
  customer_start_conversation = null,
  message_trends,
  recent_conversations
}) {
  const { navigation } = usePage().props;
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [wizardStepKey, setWizardStepKey] = useState(null);
  const [dashboardWidgetQr, setDashboardWidgetQr] = useState(null);
  const inviteForm = useForm({
    email: "",
    role: "member"
  });
  const hasRoute = (routeName) => {
    return navigation?.some((nav) => nav.href === routeName) ?? false;
  };
  const formatNumber = (num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  };
  const getMaxValue = (data) => {
    if (data.length === 0) return 100;
    return Math.max(...data.map((d) => d.count || 0), 1);
  };
  const openSetupWizard = (stepKey) => {
    setWizardStepKey(stepKey ?? null);
    setSetupWizardOpen(true);
  };
  const launchInNewTab = (href) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };
  const submitQuickInvite = () => {
    inviteForm.post(route("app.team.invite", {}), {
      preserveScroll: true,
      onSuccess: () => {
        inviteForm.reset("email");
      }
    });
  };
  useEffect(() => {
    let active = true;
    const link = customer_start_conversation?.start_link;
    if (!link) {
      setDashboardWidgetQr(null);
      return () => {
        active = false;
      };
    }
    QRCode.toDataURL(link, { width: 180, margin: 1 }).then((url) => {
      if (active) setDashboardWidgetQr(url);
    }).catch(() => {
      if (active) setDashboardWidgetQr(null);
    });
    return () => {
      active = false;
    };
  }, [customer_start_conversation?.start_link]);
  const statCards = [
    {
      label: "Total Messages",
      value: formatNumber(stats.messages.total),
      change: `${stats.messages.today} today`,
      icon: MessageSquare,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
    },
    {
      label: "Active Connections",
      value: stats.connections.active,
      change: `${stats.connections.total} total`,
      icon: Link,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20"
    },
    {
      label: "Open Conversations",
      value: stats.conversations.open,
      change: `${stats.conversations.total} total`,
      icon: Inbox,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
    },
    {
      label: "Team Members",
      value: stats.team.total_members,
      change: `${stats.team.admins} admins`,
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20"
    }
  ];
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Welcome back" })
      ] }) }),
      connection_alerts.length > 0 && /* @__PURE__ */ jsx(Card, { className: "border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-900/20", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-amber-800 dark:text-amber-200", children: "Connection attention required" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-700 dark:text-amber-300 mt-1", children: "One or more WhatsApp connections have webhook or activation issues." }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1", children: connection_alerts.slice(0, 3).map((alert) => /* @__PURE__ */ jsxs("div", { className: "text-xs text-amber-800 dark:text-amber-200", children: [
            alert.name,
            ": ",
            !alert.is_active ? "inactive" : !alert.webhook_subscribed ? "webhook not subscribed" : "webhook error"
          ] }, alert.id)) })
        ] }),
        /* @__PURE__ */ jsx(Link$1, { href: route("app.whatsapp.connections.index", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", children: "Review Connections" }) })
      ] }) }) }),
      connection_heartbeat && connection_heartbeat.active_connections > 0 && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-sky-50 to-cyan-100 dark:from-sky-900/20 dark:to-cyan-800/20", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Webhook Live Heartbeat" }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            "Last ",
            connection_heartbeat.window_minutes,
            " minutes for active WhatsApp connections."
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-green-700 dark:text-green-300", children: "Healthy" }),
            /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold text-green-800 dark:text-green-200", children: connection_heartbeat.healthy })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-amber-700 dark:text-amber-300", children: "Stale" }),
            /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold text-amber-800 dark:text-amber-200", children: connection_heartbeat.stale })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-red-700 dark:text-red-300", children: "Offline/Error" }),
            /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold text-red-800 dark:text-red-200", children: connection_heartbeat.offline_or_error })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Last event" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-gray-800 dark:text-gray-200", children: connection_heartbeat.latest_received_at ? new Date(connection_heartbeat.latest_received_at).toLocaleString() : "No webhook events yet" })
          ] })
        ] }) })
      ] }),
      customer_start_conversation && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Customer Start Conversation" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Share this link or QR code with customers to start a WhatsApp chat instantly." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: customer_start_conversation.start_link ? /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr,220px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Source widget: ",
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-700 dark:text-gray-200", children: customer_start_conversation.widget_name }),
              /* @__PURE__ */ jsx("span", { className: "ml-2 rounded px-2 py-0.5 bg-gray-100 dark:bg-gray-800 uppercase tracking-wide", children: customer_start_conversation.widget_type })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-xs break-all text-gray-700 dark:text-gray-300", children: customer_start_conversation.start_link }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "secondary",
                  size: "sm",
                  onClick: () => navigator.clipboard.writeText(customer_start_conversation.start_link || ""),
                  children: [
                    /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
                    "Copy Link"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(Link$1, { href: route("app.widgets.edit", { widget: customer_start_conversation.widget_slug }), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", children: "Manage Widget" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 flex flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(QrCode, { className: "h-4 w-4" }),
              "Scan to Chat"
            ] }),
            dashboardWidgetQr ? /* @__PURE__ */ jsx("img", { src: dashboardWidgetQr, alt: "Customer start conversation QR", className: "h-44 w-44 rounded-lg bg-white border border-gray-200 dark:border-gray-700" }) : /* @__PURE__ */ jsx("div", { className: "h-44 w-44 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-gray-500", children: "QR unavailable" })
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-amber-300/70 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300", children: "Configure a valid WhatsApp phone in your widget to generate the start conversation link." }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: statCards.map((stat, index) => {
        const Icon = stat.icon;
        return /* @__PURE__ */ jsx(Card, { className: "overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group", children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: stat.label }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: stat.value }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-blue-600 dark:text-blue-400", children: stat.change })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} group-hover:scale-110 transition-transform duration-300`, children: /* @__PURE__ */ jsx(Icon, { className: `h-6 w-6 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`, style: { WebkitTextFillColor: "transparent" } }) })
        ] }) }) }, index);
      }) }),
      onboarding_checklist?.show && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg font-semibold flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-indigo-600 dark:text-indigo-400" }),
                "Getting Started Checklist"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Complete the setup steps to get your account production-ready." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300", children: [
              onboarding_checklist.completed,
              "/",
              onboarding_checklist.total,
              " completed"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx("div", { className: "h-2 w-full rounded-full bg-white/60 dark:bg-gray-800/60 overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-500",
              style: { width: `${onboarding_checklist.progress_percent}%` }
            }
          ) }) })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          onboarding_checklist.next_item && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/10 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-semibold", children: "Next Recommended Step" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: onboarding_checklist.next_item.label })
            ] }),
            /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => openSetupWizard(onboarding_checklist.next_item?.key), children: [
              onboarding_checklist.next_item.cta,
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: onboarding_checklist.items.map((item) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => openSetupWizard(item.key),
              className: `rounded-xl border p-4 transition ${item.done ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/10" : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: `mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${item.done ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"}`, children: /* @__PURE__ */ jsx(CheckCircle, { className: "h-3.5 w-3.5 text-white" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: item.label }),
                    /* @__PURE__ */ jsx(Badge, { variant: item.done ? "success" : "default", className: "text-[10px]", children: item.done ? "Done" : "Pending" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: item.description }),
                  !item.done && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400", children: [
                    item.cta,
                    " →"
                  ] })
                ] })
              ] })
            },
            item.key
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Message Statistics" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Message volume breakdown" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-lg", children: /* @__PURE__ */ jsx(Inbox, { className: "h-4 w-4 text-white" }) }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Inbound" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.messages.inbound) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl border border-green-200/50 dark:border-green-800/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx("div", { className: "p-2 bg-green-500 rounded-lg", children: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 text-white" }) }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Outbound" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.messages.outbound) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-700/50", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "This Week" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.messages.this_week) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-700/50", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "This Month" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.messages.this_month) })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Message Trends" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Last 7 days activity" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: message_trends.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-12 w-12 text-gray-400 mb-4" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No data available" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: message_trends.map((trend) => {
            const maxValue = getMaxValue(message_trends);
            const percentage = trend.count / maxValue * 100;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-20 text-xs font-medium text-gray-600 dark:text-gray-400", children: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500",
                  style: { width: `${percentage}%` }
                }
              ) }),
              /* @__PURE__ */ jsx("div", { className: "w-16 text-right text-xs font-bold text-gray-900 dark:text-gray-100", children: formatNumber(trend.count) })
            ] }, trend.date);
          }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Recent Conversations" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Latest activity" })
            ] }),
            hasRoute("app.whatsapp.conversations.index") && /* @__PURE__ */ jsx(
              Link$1,
              {
                href: route("app.whatsapp.conversations.index", {}),
                className: "text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
                children: "View All →"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: recent_conversations.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [
            /* @__PURE__ */ jsx(Inbox, { className: "h-12 w-12 text-gray-400 mb-4" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-2", children: "No conversations yet" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500", children: "Start a conversation to see it here" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: recent_conversations.map((conversation) => {
            const convId = Number(conversation.id);
            const conversationRoute = hasRoute("app.whatsapp.conversations.index") && Number.isInteger(convId) && convId >= 1 ? route("app.whatsapp.conversations.show", {
              conversation: convId
            }) : "#";
            return /* @__PURE__ */ jsx(
              Link$1,
              {
                href: conversationRoute,
                className: "block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group",
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors", children: conversation.contact_name }),
                      /* @__PURE__ */ jsx(Badge, { variant: conversation.status === "open" ? "success" : "default", className: "text-xs", children: conversation.status })
                    ] }),
                    conversation.last_message && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: conversation.last_message })
                  ] }),
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-4" })
                ] })
              },
              conversation.id
            );
          }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Quick Actions" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Common tasks and shortcuts" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            hasRoute("app.whatsapp.connections.index") && /* @__PURE__ */ jsxs(
              Link$1,
              {
                href: route("app.whatsapp.connections.index", {}),
                className: "flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 group",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg", children: /* @__PURE__ */ jsx(Link, { className: "h-5 w-5 text-white" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors", children: "Manage Connections" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Add or configure WhatsApp connections" })
                  ] }),
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" })
                ]
              }
            ),
            hasRoute("app.whatsapp.templates.index") && /* @__PURE__ */ jsxs(
              Link$1,
              {
                href: route("app.whatsapp.templates.index", {}),
                className: "flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-100 dark:hover:from-green-900/20 dark:hover:to-emerald-800/20 transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-800 group",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-white" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors", children: "Message Templates" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Create and manage templates" })
                  ] }),
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link$1,
              {
                href: route("app.settings", {}),
                className: "flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 group",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-white" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors", children: "Team Settings" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Manage team members and roles" })
                  ] }),
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link$1,
              {
                href: route("app.billing.index", {}),
                className: "flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-100 dark:hover:from-amber-900/20 dark:hover:to-orange-800/20 transition-all duration-200 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 group",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-white" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors", children: "Billing & Usage" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "View usage and manage subscription" })
                  ] }),
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" })
                ]
              }
            )
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Modal, { show: setupWizardOpen, onClose: () => setSetupWizardOpen(false), maxWidth: "2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "First-Run Setup Wizard" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Complete your initial account setup without losing dashboard context." })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: () => setSetupWizardOpen(false), children: "Close" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: (onboarding_checklist?.items ?? []).map((item) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setWizardStepKey(item.key),
          className: `text-left rounded-xl border p-4 ${wizardStepKey === item.key ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-800"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Badge, { variant: item.done ? "success" : "default", className: "text-[10px]", children: item.done ? "Done" : "Pending" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: item.label })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: item.description })
          ]
        },
        item.key
      )) }),
      wizardStepKey === "connection" && /* @__PURE__ */ jsx(Card, { className: "border border-emerald-200 dark:border-emerald-800", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Connect WhatsApp via Meta Embedded Signup" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Open the connection page in a new tab, complete Meta Embedded Signup, then return here." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { onClick: () => launchInNewTab(route("app.whatsapp.connections.create", {})), children: "Open Connection Setup" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => launchInNewTab(route("app.whatsapp.connections.wizard", {})), children: "Open Guided Wizard" })
        ] })
      ] }) }),
      wizardStepKey === "team" && /* @__PURE__ */ jsx(Card, { className: "border border-blue-200 dark:border-blue-800", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Invite a teammate (Chat Agent)" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Send an invite directly from the dashboard. New invites are chat-agent only." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "quick_invite_email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "quick_invite_email",
              type: "email",
              value: inviteForm.data.email,
              onChange: (e) => inviteForm.setData("email", e.target.value),
              placeholder: "agent@example.com",
              className: "mt-1"
            }
          ),
          inviteForm.errors?.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: inviteForm.errors.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { onClick: submitQuickInvite, disabled: inviteForm.processing || !inviteForm.data.email, children: inviteForm.processing ? "Sending..." : "Send Invite" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => launchInNewTab(route("app.team.index", {})), children: "Open Team Page" })
        ] })
      ] }) }),
      wizardStepKey === "template" && /* @__PURE__ */ jsx(Card, { className: "border border-purple-200 dark:border-purple-800", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Create your first WhatsApp template" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Open template builder in a new tab, save your template, then return to continue setup." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { onClick: () => launchInNewTab(route("app.whatsapp.templates.create", {})), children: "Open Template Builder" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => launchInNewTab(route("app.whatsapp.templates.index", {})), children: "View Templates" })
        ] })
      ] }) }),
      wizardStepKey === "profile" && /* @__PURE__ */ jsx(Card, { className: "border border-amber-200 dark:border-amber-800", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Complete your profile" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Profile completion is required for notifications, security, and team operations." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: /* @__PURE__ */ jsx(Link$1, { href: route("profile.edit"), children: /* @__PURE__ */ jsx(Button, { children: "Open Profile Settings" }) }) })
      ] }) }),
      wizardStepKey === "test_message" && /* @__PURE__ */ jsx(Card, { className: "border border-indigo-200 dark:border-indigo-800", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Send a test message" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Open inbox in a new tab and verify inbound/outbound messaging on your connected number." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: /* @__PURE__ */ jsx(Button, { onClick: () => launchInNewTab(route("app.whatsapp.conversations.index", {})), children: "Open Inbox" }) })
      ] }) })
    ] }) })
  ] });
}
export {
  Dashboard as default
};
