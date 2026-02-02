import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { ArrowLeft, Bot, Save, Zap, Plus } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./useConfirm-94UId2r4.js";
import { C as Checkbox } from "./Checkbox-Bd8bJ3HH.js";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "axios";
import "laravel-echo";
import "pusher-js";
function ChatbotsShow({
  workspace,
  bot,
  connections
}) {
  const { toast } = useToast();
  const { data, setData, patch, processing, errors } = useForm({
    name: bot.name,
    description: bot.description || "",
    status: bot.status,
    applies_to: bot.applies_to
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    patch(route("app.chatbots.update", { workspace: workspace.slug, bot: bot.id }), {
      onSuccess: () => {
        toast.success("Bot updated successfully");
      },
      onError: () => {
        toast.error("Failed to update bot");
      }
    });
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      paused: { variant: "warning", label: "Paused" },
      draft: { variant: "default", label: "Draft" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, className: "px-3 py-1", children: config.label });
  };
  const toggleConnection = (connectionId) => {
    const ids = data.applies_to.connection_ids || [];
    if (ids.includes(connectionId)) {
      setData("applies_to", {
        ...data.applies_to,
        connection_ids: ids.filter((id) => id !== connectionId)
      });
    } else {
      setData("applies_to", {
        ...data.applies_to,
        connection_ids: [...ids, connectionId]
      });
    }
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${bot.name} - Chatbot` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.chatbots.index", { workspace: workspace.slug }),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Chatbots"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsx(Bot, { className: "h-8 w-8 text-purple-600 dark:text-purple-400" }),
              bot.name
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: bot.description || "No description" })
          ] }),
          getStatusBadge(bot.status)
        ] })
      ] }),
      /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-purple-500 rounded-xl", children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Bot Settings" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Update your chatbot configuration" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Bot Name", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "name",
                type: "text",
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                className: "mt-1 rounded-xl",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "description", value: "Description", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "description",
                value: data.description,
                onChange: (e) => setData("description", e.target.value),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                rows: 3,
                placeholder: "Describe what this bot does..."
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.description, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "status", value: "Status", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "status",
                value: data.status,
                onChange: (e) => setData("status", e.target.value),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                  /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                  /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.status, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Applies To", className: "text-sm font-semibold mb-3" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
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
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "All connections" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: "Apply this bot to all WhatsApp connections" })
                ] })
              ] }) }),
              !data.applies_to.all_connections && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: connections.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl", children: "No connections available" }) : connections.map((connection) => /* @__PURE__ */ jsxs(
                "label",
                {
                  className: "flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(
                      Checkbox,
                      {
                        checked: data.applies_to.connection_ids?.includes(connection.id),
                        onChange: () => toggleConnection(connection.id)
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: connection.name })
                  ]
                },
                connection.id
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              disabled: processing,
              className: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl",
              children: processing ? "Saving..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
                "Save Changes"
              ] })
            }
          ) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl", children: /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Flows" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Define when and how the bot responds" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Add Flow"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: bot.flows.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4", children: /* @__PURE__ */ jsx(Zap, { className: "h-8 w-8 text-gray-400" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "No flows yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-4", children: "Add a flow to define when and how the bot responds to messages." }),
          /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Add Your First Flow"
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: bot.flows.map((flow) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: flow.name }),
                  /* @__PURE__ */ jsx(Badge, { variant: flow.enabled ? "success" : "default", className: "px-2 py-1 text-xs", children: flow.enabled ? "Enabled" : "Disabled" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Trigger: ",
                    flow.trigger.type
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Priority: ",
                    flow.priority
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Nodes: ",
                    flow.nodes.length
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: "Edit" })
            ] })
          },
          flow.id
        )) }) })
      ] })
    ] })
  ] });
}
export {
  ChatbotsShow as default
};
