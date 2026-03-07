import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
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
function SupportShow({ thread }) {
  const replyForm = useForm({ message: "", attachments: [] });
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
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Support: ${thread.subject}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.support.index"), className: "text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400", children: "← Back to Tickets" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100", children: thread.subject }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: [
            "#",
            thread.slug,
            " · ",
            thread.status,
            " · ",
            thread.priority || "normal",
            thread.category ? ` · ${thread.category}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: thread.status === "closed" ? /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => replyForm.post(route("app.support.reopen", { thread: thread.slug })), children: "Reopen Ticket" }) : /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => replyForm.post(route("app.support.close", { thread: thread.slug })), children: "Close Ticket" }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Conversation" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Support ticket messages" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          thread.messages.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No messages yet." }),
          thread.messages.map((message) => /* @__PURE__ */ jsxs("div", { className: `rounded-lg border px-4 py-3 ${message.sender_type === "admin" ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: message.sender_name }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: message.created_at ? new Date(message.created_at).toLocaleString() : "" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300", children: message.body }),
            (message.attachments?.length || 0) > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: message.attachments.map((a) => /* @__PURE__ */ jsxs("a", { href: a.download_url, target: "_blank", rel: "noreferrer", className: "rounded-md border border-gray-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-300 dark:hover:bg-blue-900/20", children: [
              a.file_name,
              " (",
              fmtBytes(a.file_size),
              ")"
            ] }, a.id)) })
          ] }, message.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Reply" }),
          /* @__PURE__ */ jsx(CardDescription, { children: thread.status === "closed" ? "Reopen the ticket to send a reply." : "Send a reply to support." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          replyForm.post(route("app.support.message", { thread: thread.slug }), { forceFormData: true, onSuccess: () => replyForm.reset() });
        }, className: "space-y-3", children: [
          /* @__PURE__ */ jsx(
            Textarea,
            {
              value: replyForm.data.message,
              onChange: (e) => replyForm.setData("message", e.target.value),
              className: "min-h-[140px]",
              placeholder: "Describe the issue, steps tried, and expected behavior...",
              disabled: thread.status === "closed" || replyForm.processing
            }
          ),
          replyForm.errors.message && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: replyForm.errors.message }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                multiple: true,
                onChange: (e) => replyForm.setData("attachments", Array.from(e.target.files || [])),
                className: "block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 dark:file:bg-gray-800",
                disabled: thread.status === "closed" || replyForm.processing
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Up to 5 files, 10MB each." }),
            replyForm.data.attachments.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-xs text-gray-500", children: replyForm.data.attachments.map((f, i) => /* @__PURE__ */ jsx("li", { children: f.name }, `${f.name}-${i}`)) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: thread.status === "closed" || replyForm.processing, children: replyForm.processing ? "Sending..." : "Send Reply" }) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  SupportShow as default
};
