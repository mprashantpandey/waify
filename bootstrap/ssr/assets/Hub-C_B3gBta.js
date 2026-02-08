import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./Tabs-Dz-4gKmC.js";
import "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-ymbdH_NY.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function SupportHub({
  account,
  openThreads,
  closedThreads,
  liveThreads,
  faqs
}) {
  const initialTab = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") || "live" : "live";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [faqQuery, setFaqQuery] = useState("");
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const filteredFaqs = faqs.filter((faq) => {
    const query = faqQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query);
  });
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Support Hub" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Support Hub" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Live chat, tickets, and help articles in one place" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
        Link,
        {
          href: route("app.support.index", {}),
          className: "inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700",
          children: "Create Ticket"
        }
      ) }),
      /* @__PURE__ */ jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
        /* @__PURE__ */ jsxs(TabsList, { className: "w-full justify-start", children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "live", children: "Live Chat" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "tickets", children: "Tickets Opened" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "history", children: "Previous Chats" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "faqs", children: "FAQs" })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "live", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Live Chat" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Chat with support or request a live agent" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Use the live chat bubble at the bottom-right of your screen." }),
            liveThreads.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: liveThreads.map((thread) => {
              const threadKey = thread.slug ?? thread.id;
              return /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("app.support.show", { thread: threadKey }),
                  className: "block rounded-lg border border-blue-200 dark:border-blue-800 p-3 text-sm hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: thread.subject }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Live agent requested · ",
                      thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—"
                    ] })
                  ]
                },
                thread.id
              );
            }) }) : /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No live agent requests yet." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "tickets", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Open Tickets" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Your currently open support requests" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: [
            openThreads.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500 dark:text-gray-400", children: "No open tickets." }),
            openThreads.map((thread) => {
              const threadKey = thread.slug ?? thread.id;
              return /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("app.support.show", { thread: threadKey }),
                  className: "block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition",
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: thread.subject }),
                      /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                        "Priority: ",
                        thread.priority ?? "normal"
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                        "Last message: ",
                        thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400", children: thread.status })
                  ] })
                },
                thread.id
              );
            })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "history", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Previous Chats" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Closed tickets and past conversations" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: [
            closedThreads.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500 dark:text-gray-400", children: "No previous chats yet." }),
            closedThreads.map((thread) => {
              const threadKey = thread.slug ?? thread.id;
              return /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("app.support.show", { thread: threadKey }),
                  className: "block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition",
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: thread.subject }),
                      /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                        "Priority: ",
                        thread.priority ?? "normal"
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                        "Closed · ",
                        thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400", children: thread.status })
                  ] })
                },
                thread.id
              );
            })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "faqs", className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "FAQs" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Quick answers to common questions" })
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
  SupportHub as default
};
