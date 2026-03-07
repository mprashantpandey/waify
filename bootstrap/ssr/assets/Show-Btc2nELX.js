import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as Textarea } from "./Textarea-x8GTiAvG.js";
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
function PlatformSupportShow({ auth, thread, admins }) {
  const replyForm = useForm({ message: "", attachments: [] });
  const metaForm = useForm({
    status: thread.status || "open",
    priority: thread.priority || "normal",
    category: thread.category || "",
    assigned_to: thread.assignee?.id ? String(thread.assignee.id) : ""
  });
  const fmtBytes = (bytes) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i += 1;
    }
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: `Support Desk: ${thread.subject}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Link, { href: route("platform.support.index"), className: "text-sm text-blue-600 dark:text-blue-400", children: "← Back to Support Desk" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100", children: thread.subject }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: [
          "#",
          thread.slug,
          " · Tenant: ",
          thread.account?.name,
          " · Created by ",
          thread.creator?.email || thread.creator?.name
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Conversation" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Tenant and platform support replies" })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
              (thread.messages || []).map((m) => /* @__PURE__ */ jsxs("div", { className: `rounded-lg border px-4 py-3 ${m.sender_type === "admin" ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: m.sender_name }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: m.created_at ? new Date(m.created_at).toLocaleString() : "" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300", children: m.body }),
                (m.attachments?.length || 0) > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: m.attachments.map((a) => /* @__PURE__ */ jsxs("a", { href: a.download_url, target: "_blank", rel: "noreferrer", className: "rounded-md border border-gray-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-300 dark:hover:bg-blue-900/20", children: [
                  a.file_name,
                  " (",
                  fmtBytes(a.file_size),
                  ")"
                ] }, a.id)) })
              ] }, m.id)),
              (!thread.messages || thread.messages.length === 0) && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "No messages yet." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Reply as Platform Support" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Response is visible to tenant in their support ticket." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
              e.preventDefault();
              replyForm.post(route("platform.support.message", { thread: thread.slug }), { forceFormData: true, onSuccess: () => replyForm.reset() });
            }, className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Textarea, { value: replyForm.data.message, onChange: (e) => replyForm.setData("message", e.target.value), className: "min-h-[140px]", placeholder: "Write a clear response with next steps..." }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    multiple: true,
                    onChange: (e) => replyForm.setData("attachments", Array.from(e.target.files || [])),
                    className: "block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 dark:file:bg-gray-800"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Up to 5 files, 10MB each." }),
                replyForm.data.attachments.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-xs text-gray-500", children: replyForm.data.attachments.map((f, i) => /* @__PURE__ */ jsx("li", { children: f.name }, `${f.name}-${i}`)) })
              ] }),
              replyForm.errors.message && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: replyForm.errors.message }),
              /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: replyForm.processing, children: replyForm.processing ? "Sending..." : "Send Reply" }) })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Ticket Controls" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Assignment and status" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            metaForm.post(route("platform.support.update", { thread: thread.slug }));
          }, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Status" }),
              /* @__PURE__ */ jsxs("select", { value: metaForm.data.status, onChange: (e) => metaForm.setData("status", e.target.value), className: "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900", children: [
                /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Priority" }),
              /* @__PURE__ */ jsxs("select", { value: metaForm.data.priority, onChange: (e) => metaForm.setData("priority", e.target.value), className: "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900", children: [
                /* @__PURE__ */ jsx("option", { value: "low", children: "Low" }),
                /* @__PURE__ */ jsx("option", { value: "normal", children: "Normal" }),
                /* @__PURE__ */ jsx("option", { value: "high", children: "High" }),
                /* @__PURE__ */ jsx("option", { value: "urgent", children: "Urgent" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Assignee" }),
              /* @__PURE__ */ jsxs("select", { value: metaForm.data.assigned_to, onChange: (e) => metaForm.setData("assigned_to", e.target.value), className: "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900", children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                (admins || []).map((a) => /* @__PURE__ */ jsxs("option", { value: String(a.id), children: [
                  a.name,
                  " (",
                  a.email,
                  ")"
                ] }, a.id))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Category" }),
              /* @__PURE__ */ jsx(TextInput, { value: metaForm.data.category, onChange: (e) => metaForm.setData("category", e.target.value), className: "mt-1 w-full", placeholder: "billing / setup / bug" })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: metaForm.processing, children: metaForm.processing ? "Saving..." : "Save Controls" })
          ] }) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  PlatformSupportShow as default
};
