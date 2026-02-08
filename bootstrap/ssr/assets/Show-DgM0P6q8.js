import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { useState, useEffect } from "react";
import { u as useRealtime } from "./RealtimeProvider-Dletx5Ny.js";
import "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
const isImage = (attachment) => {
  if (attachment.mime_type) {
    return attachment.mime_type.startsWith("image/");
  }
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.file_name);
};
const isPdf = (attachment) => {
  if (attachment.mime_type) {
    return attachment.mime_type === "application/pdf";
  }
  return /\.pdf$/i.test(attachment.file_name);
};
function SupportShow({
  account,
  thread,
  messages
}) {
  const { data, setData, post, processing, reset } = useForm({
    message: "",
    attachments: []
  });
  const { subscribe } = useRealtime();
  const [items, setItems] = useState(messages);
  useEffect(() => {
    setItems(messages);
  }, [messages]);
  useEffect(() => {
    const channel = `account.${account.id}.support.thread.${thread.id}`;
    const unsubscribe = subscribe(channel, "support.message.created", (payload) => {
      setItems((prev) => {
        if (prev.some((m) => m.id === payload.id)) {
          return prev;
        }
        return [...prev, payload];
      });
    });
    return () => {
      unsubscribe();
    };
  }, [subscribe, account.id, thread.id]);
  const submit = (e) => {
    e.preventDefault();
    post(route("app.support.message", { thread: thread.slug ?? thread.id }), {
      forceFormData: true,
      onSuccess: () => reset()
    });
  };
  const closeThread = () => {
    post(route("app.support.close", { thread: thread.slug ?? thread.id }));
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Support - ${thread.subject}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("app.support.hub", {}),
          className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
          children: "← Back to Support Hub"
        }
      ),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: thread.subject }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            "Status: ",
            thread.status
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-xs text-gray-500 dark:text-gray-400 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              "Category: ",
              thread.category || "—"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Tags: ",
              thread.tags && thread.tags.length > 0 ? thread.tags.join(", ") : "—"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "First response due:",
              " ",
              thread.first_response_due_at ? new Date(thread.first_response_due_at).toLocaleString() : "—"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Resolution due: ",
              thread.due_at ? new Date(thread.due_at).toLocaleString() : "—"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Escalation level: ",
              thread.escalation_level ?? 0
            ] })
          ] }),
          thread.status === "closed" && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 px-4 py-3", children: "This chat is closed. You can start a new request anytime." }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: items.map((message) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `rounded-lg px-4 py-3 ${message.sender_type === "admin" || message.sender_type === "bot" ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" : message.sender_type === "system" ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1", children: message.sender_type === "admin" ? "Support" : message.sender_type === "bot" ? "Assistant" : message.sender_type === "system" ? "System" : "You" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap", children: message.body }),
                message.attachments && message.attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-2", children: message.attachments.map((attachment) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: attachment.url,
                      target: "_blank",
                      rel: "noreferrer",
                      className: "block text-xs text-blue-600 dark:text-blue-300 hover:underline",
                      children: attachment.file_name
                    }
                  ),
                  isImage(attachment) && /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: attachment.url,
                      alt: attachment.file_name,
                      className: "max-h-40 rounded-md border border-gray-200 dark:border-gray-700"
                    }
                  ),
                  isPdf(attachment) && /* @__PURE__ */ jsxs("details", { className: "text-xs text-gray-600 dark:text-gray-300", children: [
                    /* @__PURE__ */ jsx("summary", { className: "cursor-pointer", children: "Preview PDF" }),
                    /* @__PURE__ */ jsx(
                      "iframe",
                      {
                        src: attachment.url,
                        className: "mt-2 h-48 w-full rounded-md border border-gray-200 dark:border-gray-700"
                      }
                    )
                  ] })
                ] }, attachment.id)) }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: new Date(message.created_at).toLocaleString() })
              ]
            },
            message.id
          )) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: data.message,
                onChange: (e) => setData("message", e.target.value),
                className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                rows: 4,
                placeholder: "Write your reply..."
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                multiple: true,
                onChange: (e) => setData("attachments", Array.from(e.target.files || [])),
                className: "block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end", children: [
              thread.status === "open" && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: closeThread, className: "mr-2", children: "Close Chat" }),
              thread.status === "closed" && /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  onClick: () => post(route("app.support.reopen", { thread: thread.slug ?? thread.id })),
                  className: "mr-2",
                  children: "Reopen Chat"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  disabled: processing || thread.status === "closed" || data.message.trim().length === 0 && data.attachments.length === 0,
                  children: processing ? "Sending..." : "Send Message"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SupportShow as default
};
