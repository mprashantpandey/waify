import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import "react";
import "./Topbar-B0L72tZm.js";
import "lucide-react";
import "./Badge-CHx1ViYT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
function PlatformSupportIndex({ auth, threads, filters }) {
  const setFilter = (patch) => {
    router.get(route("platform.support.index"), { ...filters, ...patch }, { preserveState: true, replace: true });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Support Desk" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Support Desk" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Manage tenant support tickets and reply from the platform panel." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Tickets" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Platform-wide tenant support queue" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-4", children: [
            /* @__PURE__ */ jsx(TextInput, { value: filters.search || "", onChange: (e) => setFilter({ search: e.target.value, page: 1 }), placeholder: "Search subject, slug, tenant" }),
            /* @__PURE__ */ jsxs("select", { value: filters.status || "", onChange: (e) => setFilter({ status: e.target.value, page: 1 }), className: "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All statuses" }),
              /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
              /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
              /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: filters.assigned || "", onChange: (e) => setFilter({ assigned: e.target.value, page: 1 }), className: "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All assignment" }),
              /* @__PURE__ */ jsx("option", { value: "me", children: "Assigned to me" }),
              /* @__PURE__ */ jsx("option", { value: "unassigned", children: "Unassigned" })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setFilter({ search: "", status: "", assigned: "", page: 1 }), className: "rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700", children: "Clear" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900/50", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Ticket" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Tenant" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Assignee" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Last Activity" })
            ] }) }),
            /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: [
              (threads?.data || []).length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-gray-500", children: "No tickets found." }) }),
              (threads?.data || []).map((t) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-900/30", children: [
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsx(Link, { href: route("platform.support.show", { thread: t.slug }), className: "font-semibold text-blue-600 dark:text-blue-400", children: t.subject }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
                    "#",
                    t.slug,
                    " · ",
                    t.messages_count,
                    " msgs · ",
                    t.priority || "normal"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: t.account?.name || "-" }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: t.creator?.email || t.creator?.name || "-" })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-1 text-xs ${t.status === "closed" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" : t.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`, children: t.status }) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-700 dark:text-gray-300", children: t.assignee?.name || "Unassigned" }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-gray-500", children: t.last_message_at ? new Date(t.last_message_at).toLocaleString() : "-" })
              ] }, t.id))
            ] })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  PlatformSupportIndex as default
};
