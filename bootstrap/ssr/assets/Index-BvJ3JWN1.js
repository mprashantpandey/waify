import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-BVTGgi5j.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { useState, useEffect, useMemo } from "react";
import { u as useRealtime } from "./RealtimeProvider-Dletx5Ny.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "lucide-react";
import "./Button-ymbdH_NY.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "axios";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
function PlatformSupportIndex({ threads }) {
  const { branding } = usePage().props;
  const { subscribe } = useRealtime();
  const [items, setItems] = useState(threads);
  const [hasNew, setHasNew] = useState(false);
  useEffect(() => {
    setItems(threads);
  }, [threads]);
  useEffect(() => {
    const unsubscribe = subscribe("platform.support", "support.message.created", (payload) => {
      if (!payload.thread_id) {
        return;
      }
      setItems((prev) => {
        const index = prev.findIndex((thread) => thread.id === payload.thread_id);
        if (index === -1) {
          setHasNew(true);
          return prev;
        }
        const next = [...prev];
        const updated = { ...next[index] };
        updated.last_message_at = payload.created_at ?? updated.last_message_at;
        next.splice(index, 1);
        next.unshift(updated);
        return next;
      });
    });
    return () => {
      unsubscribe();
    };
  }, [subscribe]);
  const supportContacts = useMemo(() => {
    return {
      email: branding?.support_email,
      phone: branding?.support_phone
    };
  }, [branding?.support_email, branding?.support_phone]);
  return /* @__PURE__ */ jsxs(PlatformShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Support Requests" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Support Requests" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "All tenant support conversations" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Live Chat Access" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Ways tenants can reach your support team" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Support Inbox" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Tenants can create tickets from their Support page." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Email & Phone" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: supportContacts.email || supportContacts.phone ? `${supportContacts.email ?? "—"} ${supportContacts.phone ? `· ${supportContacts.phone}` : ""}` : "Set support email/phone in Platform Settings → Branding." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Live Chat Widget" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Use the live chat bubble at the bottom-right of the screen." })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Threads" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Recent messages from tenants" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
          hasNew && /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-yellow-50/60 dark:bg-yellow-900/10 text-sm text-gray-700 dark:text-gray-200 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "New support activity available." }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setHasNew(false);
                  router.reload({ only: ["threads"] });
                },
                className: "text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline",
                children: "Refresh"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: [
            items.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500 dark:text-gray-400", children: "No support requests yet." }),
            items.map((thread) => /* @__PURE__ */ jsx(
              Link,
              {
                href: route("platform.support.show", { thread: thread.slug ?? thread.id }),
                className: "block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition",
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: thread.subject }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Tenant: ",
                      thread.account?.name ?? "Unknown"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—" })
                ] })
              },
              thread.id
            ))
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  PlatformSupportIndex as default
};
