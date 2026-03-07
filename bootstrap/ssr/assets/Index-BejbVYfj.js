import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { T as Textarea } from "./Textarea-x8GTiAvG.js";
import "react";
import "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./Badge-CHx1ViYT.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./Alert-C-mQ6HNk.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function SupportIndex({ threads, filters }) {
  const createForm = useForm({
    subject: "",
    message: "",
    priority: "normal",
    category: "",
    attachments: []
  });
  const status = filters?.status || "";
  const search = filters?.search || "";
  const applyFilters = (next) => {
    router.get(route("app.support.index"), { ...filters, ...next }, { preserveState: true, replace: true });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Support Tickets" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Support Tickets" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Create and track support requests for your account." })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Tickets" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Open and closed support tickets" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: search,
                  onChange: (e) => applyFilters({ search: e.target.value }),
                  placeholder: "Search subject or ticket",
                  className: "w-full"
                }
              ),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: status,
                  onChange: (e) => applyFilters({ status: e.target.value }),
                  className: "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "All statuses" }),
                    /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                    /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" }),
                    /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-800", children: [
              (threads?.data || []).length === 0 && /* @__PURE__ */ jsx("div", { className: "px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400", children: "No support tickets yet." }),
              (threads?.data || []).map((thread) => /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("app.support.show", { thread: thread.slug }),
                  className: "block px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-gray-900 dark:text-gray-100", children: thread.subject }),
                      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: [
                        "#",
                        thread.slug,
                        " · ",
                        thread.messages_count ?? 0,
                        " messages · ",
                        thread.creator?.name || "Unknown"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2 text-xs", children: [
                      /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-1 ${thread.status === "closed" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`, children: thread.status }),
                      thread.priority && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", children: thread.priority })
                    ] })
                  ] })
                },
                thread.id
              ))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Create Ticket" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Open a new support request" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            createForm.post(route("app.support.store"), { forceFormData: true });
          }, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "subject", value: "Subject" }),
              /* @__PURE__ */ jsx(TextInput, { id: "subject", value: createForm.data.subject, onChange: (e) => createForm.setData("subject", e.target.value), className: "mt-1 w-full" }),
              /* @__PURE__ */ jsx(InputError, { message: createForm.errors.subject, className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "priority", value: "Priority" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "priority",
                    value: createForm.data.priority,
                    onChange: (e) => createForm.setData("priority", e.target.value),
                    className: "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "low", children: "Low" }),
                      /* @__PURE__ */ jsx("option", { value: "normal", children: "Normal" }),
                      /* @__PURE__ */ jsx("option", { value: "high", children: "High" }),
                      /* @__PURE__ */ jsx("option", { value: "urgent", children: "Urgent" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "category", value: "Category" }),
                /* @__PURE__ */ jsx(TextInput, { id: "category", value: createForm.data.category, onChange: (e) => createForm.setData("category", e.target.value), className: "mt-1 w-full", placeholder: "billing / setup" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "message", value: "Message" }),
              /* @__PURE__ */ jsx(Textarea, { id: "message", value: createForm.data.message, onChange: (e) => createForm.setData("message", e.target.value), className: "mt-1 min-h-[140px]" }),
              /* @__PURE__ */ jsx(InputError, { message: createForm.errors.message, className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "attachments", value: "Attachments (Optional)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "attachments",
                  type: "file",
                  multiple: true,
                  onChange: (e) => createForm.setData("attachments", Array.from(e.target.files || [])),
                  className: "mt-1 block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 dark:file:bg-gray-800"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: "Up to 5 files, 10MB each." }),
              /* @__PURE__ */ jsx(InputError, { message: createForm.errors.attachments, className: "mt-1" }),
              createForm.data.attachments.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400", children: createForm.data.attachments.map((f, i) => /* @__PURE__ */ jsx("li", { children: f.name }, `${f.name}-${i}`)) })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: createForm.processing, className: "w-full", children: createForm.processing ? "Creating..." : "Create Ticket" })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  SupportIndex as default
};
