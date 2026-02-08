import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link as Link$1 } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { MessageSquare, Link, Inbox, Users, Send, Activity, ArrowRight, FileText, TrendingUp } from "lucide-react";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-ymbdH_NY.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function Dashboard({
  account,
  stats,
  message_trends,
  recent_conversations
}) {
  const { navigation } = usePage().props;
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
    ] })
  ] });
}
export {
  Dashboard as default
};
