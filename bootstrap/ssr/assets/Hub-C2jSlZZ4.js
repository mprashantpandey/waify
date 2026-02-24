import { jsxs, jsx } from "react/jsx-runtime";
import { P as PlatformShell } from "./PlatformShell-BVTGgi5j.js";
import { Head, Link } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./Tabs-Dz-4gKmC.js";
import { useState } from "react";
import "./RealtimeProvider-Dletx5Ny.js";
import "lucide-react";
import "./Badge-CHx1ViYT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./Button-ymbdH_NY.js";
import "axios";
function PlatformSupportHub({
  openThreads,
  closedThreads,
  liveThreads,
  faqs
}) {
  const [faqQuery, setFaqQuery] = useState("");
  const filteredFaqs = faqs.filter((faq) => {
    const query = faqQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query);
  });
  const formatCountdown = (dateStr) => {
    if (!dateStr) {
      return "—";
    }
    const diffMs = new Date(dateStr).getTime() - Date.now();
    if (diffMs <= 0) {
      return "Overdue";
    }
    const diffHours = Math.ceil(diffMs / (1e3 * 60 * 60));
    return `Due in ${diffHours}h`;
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Support Hub" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Support Hub" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Live chat, tickets, and FAQs" })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { defaultValue: "live", children: [
        /* @__PURE__ */ jsxs(TabsList, { className: "w-full justify-start", children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "live", children: "Live Chats" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "tickets", children: "Open Tickets" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "history", children: "Previous Chats" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "status", children: "Status Portal" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "faqs", children: "FAQs" })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "live", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Live Chats" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Tenants requesting a live agent" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: [
            liveThreads.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500 dark:text-gray-400", children: "No live agent requests right now." }),
            liveThreads.map((thread) => /* @__PURE__ */ jsx(
              Link,
              {
                href: route("platform.support.show", { thread: thread.slug ?? thread.id }),
                className: "block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition",
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: thread.subject }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Priority: ",
                      thread.priority ?? "normal",
                      " · Assignee: ",
                      thread.assignee?.name || "Unassigned"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Tenant: ",
                      thread.account?.name ?? "Unknown",
                      " · ",
                      thread.account?.owner?.email || "—"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—" })
                ] })
              },
              thread.id
            ))
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "tickets", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Open Tickets" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "All open support requests" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: [
            openThreads.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500 dark:text-gray-400", children: "No open tickets." }),
            openThreads.map((thread) => /* @__PURE__ */ jsx(
              Link,
              {
                href: route("platform.support.show", { thread: thread.slug ?? thread.id }),
                className: "block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition",
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: thread.subject }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Priority: ",
                      thread.priority ?? "normal",
                      " · Assignee: ",
                      thread.assignee?.name || "Unassigned"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Tenant: ",
                      thread.account?.name ?? "Unknown",
                      " · ",
                      thread.account?.owner?.email || "—"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—" })
                ] })
              },
              thread.id
            ))
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "history", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Previous Chats" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Closed tickets and past conversations" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: [
            closedThreads.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500 dark:text-gray-400", children: "No previous chats yet." }),
            closedThreads.map((thread) => /* @__PURE__ */ jsx(
              Link,
              {
                href: route("platform.support.show", { thread: thread.slug ?? thread.id }),
                className: "block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition",
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: thread.subject }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Priority: ",
                      thread.priority ?? "normal",
                      " · Assignee: ",
                      thread.assignee?.name || "Unassigned"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Tenant: ",
                      thread.account?.name ?? "Unknown",
                      " · ",
                      thread.account?.owner?.email || "—"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—" })
                ] })
              },
              thread.id
            ))
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "status", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Status Portal" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Track SLA and due dates across tickets" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-6 space-y-4", children: [...openThreads, ...closedThreads].map((thread) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: thread.subject }),
              /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400", children: thread.status })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: [
              "Priority: ",
              thread.priority ?? "normal",
              " · Category: ",
              thread.category ?? "—",
              " · Assignee:",
              " ",
              thread.assignee?.name || "Unassigned"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: [
              "First response due:",
              " ",
              thread.first_response_due_at ? new Date(thread.first_response_due_at).toLocaleString() : "—"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: [
              "Resolution due: ",
              thread.due_at ? new Date(thread.due_at).toLocaleString() : "—"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: [
              "SLA: ",
              formatCountdown(thread.due_at),
              " · First response: ",
              formatCountdown(thread.first_response_due_at)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: [
              "Escalation level: ",
              thread.escalation_level ?? 0
            ] })
          ] }, thread.id)) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "faqs", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "FAQs" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Shared answers for tenants" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: faqQuery,
                onChange: (e) => setFaqQuery(e.target.value),
                className: "w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200",
                placeholder: "Search FAQs..."
              }
            ) }),
            filteredFaqs.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No FAQs matched your search." }),
            filteredFaqs.map((faq, index) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: faq.question }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: faq.answer })
            ] }, index))
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  PlatformSupportHub as default
};
