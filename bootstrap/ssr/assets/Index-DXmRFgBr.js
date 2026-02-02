import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { useMemo } from "react";
import "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-DfTOxbgl.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "axios";
function SupportIndex({
  workspace,
  threads
}) {
  const { flash, branding } = usePage().props;
  const { data, setData, post, processing, errors, reset } = useForm({
    subject: "",
    message: "",
    category: "",
    tags: "",
    attachments: []
  });
  const supportContacts = useMemo(() => {
    return {
      email: branding?.support_email,
      phone: branding?.support_phone
    };
  }, [branding?.support_email, branding?.support_phone]);
  const submit = (e) => {
    e.preventDefault();
    post(route("app.support.store", { workspace: workspace.slug }), {
      forceFormData: true,
      onSuccess: () => reset()
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Support" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Support" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Create a support request or follow up on existing tickets" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Live Chat Access" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Pick the fastest way to reach us" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Support Inbox" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Start a ticket right here and keep the full history." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Email & Phone" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: supportContacts.email || supportContacts.phone ? `${supportContacts.email ?? "—"} ${supportContacts.phone ? `· ${supportContacts.phone}` : ""}` : "Ask your admin to add support email/phone." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Live Chat Widget" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Use the live chat bubble at the bottom-right of your screen." })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "New Request" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Tell us how we can help" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "subject", value: "Subject" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "subject",
                type: "text",
                value: data.subject,
                onChange: (e) => setData("subject", e.target.value),
                className: "mt-1 block w-full",
                placeholder: "Issue with webhook setup"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.subject, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "category", value: "Category" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "category",
                  type: "text",
                  value: data.category,
                  onChange: (e) => setData("category", e.target.value),
                  className: "mt-1 block w-full",
                  placeholder: "Billing, WhatsApp, Templates..."
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.category, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "tags", value: "Tags (comma separated)" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "tags",
                  type: "text",
                  value: data.tags,
                  onChange: (e) => setData("tags", e.target.value),
                  className: "mt-1 block w-full",
                  placeholder: "urgent, webhook, api"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.tags, className: "mt-2" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "message", value: "Message" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "message",
                value: data.message,
                onChange: (e) => setData("message", e.target.value),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                rows: 4,
                placeholder: "Describe your issue..."
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.message, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "attachments", value: "Attachments" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "attachments",
                type: "file",
                multiple: true,
                onChange: (e) => setData("attachments", Array.from(e.target.files || [])),
                className: "mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.attachments, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: processing ? "Sending..." : "Submit" }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Your Requests" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Recent conversations with support" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: [
          threads.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500 dark:text-gray-400", children: "No support requests yet." }),
          threads.map((thread) => /* @__PURE__ */ jsx(
            Link,
            {
              href: route("app.support.show", { workspace: workspace.slug, thread: thread.slug ?? thread.id }),
              className: "block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: thread.subject }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                    "Last message: ",
                    thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400", children: thread.status })
              ] })
            },
            thread.id
          ))
        ] }) })
      ] })
    ] })
  ] });
}
export {
  SupportIndex as default
};
