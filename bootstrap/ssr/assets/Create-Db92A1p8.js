import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { C as Checkbox } from "./Checkbox-Bd8bJ3HH.js";
import { ArrowLeft, MessageCircle, Search, Wrench, CheckCircle2, Bot } from "lucide-react";
import { u as useToast } from "./useToast-C5ECijgs.js";
import "./useConfirm-BKf7Nv1N.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function ChatbotsCreate({
  connections
}) {
  const { toast } = useToast();
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    description: "",
    status: "active",
    applies_to: {
      all_connections: true,
      connection_ids: []
    },
    starter_flow_mode: "guided",
    starter_trigger_type: "inbound_message",
    starter_keywords: "hi, hello",
    starter_reply_message: "Hi! Thanks for messaging us. A team member will get back to you shortly."
  });
  const canSubmit = useMemo(() => {
    if (data.name.trim() === "") {
      return false;
    }
    if (!data.applies_to.all_connections && (data.applies_to.connection_ids?.length ?? 0) === 0) {
      return false;
    }
    if (data.starter_flow_mode === "guided" && data.starter_trigger_type === "keyword" && data.starter_keywords.trim() === "") {
      return false;
    }
    return true;
  }, [data]);
  const setQuickMode = (mode, triggerType) => {
    setData("starter_flow_mode", mode);
    if (triggerType) {
      setData("starter_trigger_type", triggerType);
    }
  };
  const toggleConnection = (connectionId) => {
    const ids = data.applies_to.connection_ids || [];
    setData("applies_to", {
      ...data.applies_to,
      connection_ids: ids.includes(connectionId) ? ids.filter((id) => id !== connectionId) : [...ids, connectionId]
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("app.chatbots.store", {}), {
      onSuccess: () => toast.success("Bot created successfully"),
      onError: () => toast.error("Please fix the highlighted fields")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Chatbot" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.chatbots.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Chatbots"
            ]
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: "Create Chatbot" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Follow these 3 steps. A working starter flow will be created automatically." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-sm", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Step 1: Choose How It Starts" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Pick a starter mode. You can fully edit the flow after creation." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-3 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setQuickMode("guided", "inbound_message"),
                className: `rounded-xl border p-4 text-left ${data.starter_flow_mode === "guided" && data.starter_trigger_type === "inbound_message" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-gray-200 dark:border-gray-700"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100", children: [
                    /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
                    "Reply To Every Message"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Best for first-time setup." })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setQuickMode("guided", "keyword"),
                className: `rounded-xl border p-4 text-left ${data.starter_flow_mode === "guided" && data.starter_trigger_type === "keyword" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-gray-200 dark:border-gray-700"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100", children: [
                    /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
                    "Reply On Keywords"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Trigger only for matching words." })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setQuickMode("empty"),
                className: `rounded-xl border p-4 text-left ${data.starter_flow_mode === "empty" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-gray-200 dark:border-gray-700"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100", children: [
                    /* @__PURE__ */ jsx(Wrench, { className: "h-4 w-4" }),
                    "Start Empty"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Create bot only. Build flow manually." })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-sm", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Step 2: Bot Details" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Keep it simple. You can change all of this later." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Bot Name" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  type: "text",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "mt-1",
                  placeholder: "Support Assistant",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "description", value: "Description (optional)" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "description",
                  value: data.description,
                  onChange: (e) => setData("description", e.target.value),
                  className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  rows: 2,
                  placeholder: "Handles basic customer queries"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.description, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "status", value: "Status" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "status",
                  value: data.status,
                  onChange: (e) => setData("status", e.target.value),
                  className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                    /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.status, className: "mt-2" })
            ] }),
            data.starter_flow_mode === "guided" && /* @__PURE__ */ jsxs(Fragment, { children: [
              data.starter_trigger_type === "keyword" && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "starter_keywords", value: "Keywords (comma/new line separated)" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    id: "starter_keywords",
                    value: data.starter_keywords,
                    onChange: (e) => setData("starter_keywords", e.target.value),
                    className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                    rows: 2,
                    placeholder: "hi, hello, pricing"
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.starter_keywords, className: "mt-2" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "starter_reply_message", value: "First Auto Reply" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    id: "starter_reply_message",
                    value: data.starter_reply_message,
                    onChange: (e) => setData("starter_reply_message", e.target.value),
                    className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                    rows: 3
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.starter_reply_message, className: "mt-2" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-sm", children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Step 3: Where It Applies" }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  checked: data.applies_to.all_connections,
                  onChange: (e) => setData("applies_to", {
                    ...data.applies_to,
                    all_connections: e.target.checked
                  })
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "All WhatsApp connections" })
            ] }),
            !data.applies_to.all_connections && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              connections.length === 0 ? /* @__PURE__ */ jsx("p", { className: "rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200", children: "No active connections found. Create a connection first." }) : connections.map((connection) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 rounded-md border border-gray-200 p-2 dark:border-gray-700", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: data.applies_to.connection_ids.includes(connection.id),
                    onChange: () => toggleConnection(connection.id)
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: connection.name })
              ] }, connection.id)),
              /* @__PURE__ */ jsx(InputError, { message: errors["applies_to.connection_ids"], className: "mt-2" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Card, { className: "border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-5 w-5 text-emerald-600" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-emerald-800 dark:text-emerald-300", children: "What happens after Create" }),
            /* @__PURE__ */ jsxs("ul", { className: "mt-1 list-disc pl-5 text-sm text-emerald-800/90 dark:text-emerald-300/90", children: [
              /* @__PURE__ */ jsx("li", { children: "Bot is created with your selected scope." }),
              /* @__PURE__ */ jsx("li", { children: data.starter_flow_mode === "guided" ? "A starter flow is created automatically." : "No flow is created yet." }),
              /* @__PURE__ */ jsx("li", { children: "You are taken to the bot editor to fine tune behavior." })
            ] })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.index", {}), children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: processing || !canSubmit, children: [
            /* @__PURE__ */ jsx(Bot, { className: "mr-2 h-4 w-4" }),
            processing ? "Creating..." : "Create Bot"
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ChatbotsCreate as default
};
