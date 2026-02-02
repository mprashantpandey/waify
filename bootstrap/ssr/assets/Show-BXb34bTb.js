import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, usePage, Head, Link, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { useState, useEffect } from "react";
import { u as useRealtime } from "./RealtimeProvider-DfTOxbgl.js";
import axios from "axios";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
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
function PlatformSupportShow({
  thread,
  messages,
  admins,
  auditLogs
}) {
  const { data, setData, post, processing, reset } = useForm({
    message: "",
    attachments: []
  });
  const { subscribe } = useRealtime();
  const { addToast } = useToast();
  const { ai } = usePage().props;
  const [items, setItems] = useState(messages);
  const [assistLoading, setAssistLoading] = useState(false);
  const [ticketData, setTicketData] = useState({
    status: thread.status,
    priority: thread.priority || "normal",
    assigned_to: thread.assigned_to || "",
    category: thread.category || "",
    tags: (thread.tags || []).join(", ")
  });
  const [aiNote, setAiNote] = useState(null);
  useEffect(() => {
    setItems(messages);
  }, [messages]);
  useEffect(() => {
    if (!thread.workspace) {
      return;
    }
    const channel = `workspace.${thread.workspace.id}.support.thread.${thread.id}`;
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
  }, [subscribe, thread.id, thread.workspace?.id]);
  const submit = (e) => {
    e.preventDefault();
    post(route("platform.support.message", { thread: thread.slug ?? thread.id }), {
      forceFormData: true,
      onSuccess: () => reset()
    });
  };
  const closeThread = () => {
    post(route("platform.support.close", { thread: thread.slug ?? thread.id }));
  };
  const updateTicket = (e) => {
    e.preventDefault();
    const tags = ticketData.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    router.post(
      route("platform.support.update", { thread: thread.slug ?? thread.id }),
      {
        status: ticketData.status,
        priority: ticketData.priority,
        assigned_to: ticketData.assigned_to || null,
        category: ticketData.category || null,
        tags
      }
    );
  };
  const generateSuggestion = async (action) => {
    setAssistLoading(true);
    try {
      const response = await axios.post(
        route("platform.support.assistant", { thread: thread.slug ?? thread.id }),
        { action },
        { headers: { Accept: "application/json" } }
      );
      const suggestion = response.data?.suggestion;
      if (suggestion && action === "reply") {
        setData("message", suggestion);
        setAiNote(null);
      } else if (suggestion) {
        setAiNote({
          title: action === "summary" ? "AI Summary" : "AI Next Steps",
          content: suggestion
        });
      }
    } catch (error) {
      addToast({
        title: "AI Assistant",
        description: error?.response?.data?.error || "Unable to generate a suggestion.",
        variant: "error"
      });
    } finally {
      setAssistLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Support - ${thread.subject}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: thread.subject }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
          "Workspace: ",
          thread.workspace?.name ?? "Unknown",
          " · Status: ",
          thread.status
        ] }),
        thread.workspace && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Owner: ",
            thread.workspace.owner?.name || "—"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "·" }),
          /* @__PURE__ */ jsx("span", { children: thread.workspace.owner?.email || "—" }),
          /* @__PURE__ */ jsx("span", { children: "·" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: route("platform.workspaces.show", { workspace: thread.workspace.id }),
              className: "text-blue-600 dark:text-blue-300 hover:underline",
              children: "View Workspace"
            }
          ),
          /* @__PURE__ */ jsx("span", { children: "·" }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("platform.workspaces.impersonate", { workspace: thread.workspace.id }),
              method: "post",
              className: "text-blue-600 dark:text-blue-300 hover:underline",
              children: "Open Dashboard"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Conversation" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Reply to the tenant" })
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
          thread.status === "closed" && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 px-4 py-3", children: "This chat is closed." }),
          aiNote && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/20 p-4 text-sm text-gray-800 dark:text-gray-200", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-300 mb-2", children: aiNote.title }),
            /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap", children: aiNote.content })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: items.map((message) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `rounded-lg px-4 py-3 ${message.sender_type === "admin" || message.sender_type === "bot" ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" : message.sender_type === "system" ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1", children: message.sender_type === "admin" ? "Support" : message.sender_type === "bot" ? "Assistant" : message.sender_type === "system" ? "System" : "Tenant" }),
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
                placeholder: "Write a reply..."
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
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              thread.status === "open" && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: closeThread, children: "Close Chat" }),
              ai?.enabled && /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  onClick: () => generateSuggestion("reply"),
                  disabled: assistLoading,
                  children: assistLoading ? "Generating..." : "AI Suggest"
                }
              ),
              ai?.enabled && /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  onClick: () => generateSuggestion("summary"),
                  disabled: assistLoading,
                  children: assistLoading ? "Generating..." : "Summarize"
                }
              ),
              ai?.enabled && /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  onClick: () => generateSuggestion("next_steps"),
                  disabled: assistLoading,
                  children: assistLoading ? "Generating..." : "Next Steps"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  disabled: processing || thread.status === "closed" || data.message.trim().length === 0 && data.attachments.length === 0,
                  children: processing ? "Sending..." : "Send Reply"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      thread.channel !== "live" ? /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Ticket Management" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Update status, priority, and assignee" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("form", { onSubmit: updateTicket, className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Status" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: ticketData.status,
                  onChange: (e) => setTicketData({ ...ticketData, status: e.target.value }),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                    /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                    /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Priority" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: ticketData.priority,
                  onChange: (e) => setTicketData({ ...ticketData, priority: e.target.value }),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
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
              /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Assignee" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: ticketData.assigned_to,
                  onChange: (e) => setTicketData({ ...ticketData, assigned_to: e.target.value }),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                    admins.map((admin) => /* @__PURE__ */ jsxs("option", { value: admin.id, children: [
                      admin.name,
                      " (",
                      admin.email,
                      ")"
                    ] }, admin.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Category" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: ticketData.category,
                  onChange: (e) => setTicketData({ ...ticketData, category: e.target.value }),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  placeholder: "Billing, WhatsApp, Templates..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Tags (comma separated)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: ticketData.tags,
                  onChange: (e) => setTicketData({ ...ticketData, tags: e.target.value }),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  placeholder: "urgent, whatsapp, api"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "md:col-span-3 flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Changes" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              "First response due: ",
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
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Live Chat Summary" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Live chat sessions do not use ticket management fields." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6 text-sm text-gray-600 dark:text-gray-300", children: "Convert this chat to a ticket if you need assignments, priorities, and SLA tracking." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Audit Log" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Recent activity on this ticket" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-3", children: [
          auditLogs.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No audit entries yet." }),
          auditLogs.map((log) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400", children: log.action.replace(/_/g, " ") }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-200 mt-1", children: [
              log.user?.name || "System",
              " · ",
              log.user?.email || "—"
            ] }),
            log.meta && Object.keys(log.meta).length > 0 && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: JSON.stringify(log.meta) }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: log.created_at ? new Date(log.created_at).toLocaleString() : "—" })
          ] }, log.id))
        ] })
      ] })
    ] })
  ] });
}
export {
  PlatformSupportShow as default
};
