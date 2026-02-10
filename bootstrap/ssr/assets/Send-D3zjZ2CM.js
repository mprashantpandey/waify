import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { ArrowLeft, Send, MessageSquare, User, Phone, Eye, Sparkles } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function TemplatesSend({
  account,
  template,
  contacts,
  conversations
}) {
  const { toast } = useToast();
  const [recipientType, setRecipientType] = useState("conversation");
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedConversation, setSelectedConversation] = useState("");
  const { data, setData, post, processing, errors } = useForm({
    to_wa_id: "",
    variables: Array(template.required_variables.total).fill("")
  });
  const handleRecipientChange = (type) => {
    setRecipientType(type);
    setData("to_wa_id", "");
    setSelectedContact("");
    setSelectedConversation("");
  };
  const handleContactSelect = (waId) => {
    setSelectedContact(waId);
    setData("to_wa_id", waId);
  };
  const handleConversationSelect = (waId) => {
    setSelectedConversation(waId);
    setData("to_wa_id", waId);
  };
  const submit = (e) => {
    e.preventDefault();
    post(route("app.whatsapp.templates.send.store", {
      template: template.slug
    }), {
      onSuccess: () => {
        toast.success("Template sent successfully");
      },
      onError: () => {
        toast.error("Failed to send template");
      }
    });
  };
  const renderPreview = () => {
    const preview = [];
    if (template.header_text) {
      let headerText = template.header_text;
      template.required_variables.header.forEach((varIndex) => {
        const varValue = data.variables[varIndex - 1] || `{{${varIndex}}}`;
        headerText = headerText.replace(`{{${varIndex}}}`, varValue);
      });
      preview.push(`📌 ${headerText}`);
    }
    if (template.body_text) {
      let bodyText = template.body_text;
      template.required_variables.body.forEach((varIndex) => {
        const varValue = data.variables[varIndex - 1] || `{{${varIndex}}}`;
        bodyText = bodyText.replace(`{{${varIndex}}}`, varValue);
      });
      preview.push(bodyText);
    }
    if (template.footer_text) {
      preview.push(`
${template.footer_text}`);
    }
    return preview.join("\n\n");
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Send ${template.name} - Template` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.whatsapp.templates.show", {
              template: template.slug
            }),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Template"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2", children: "Send Template" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
            template.name,
            " (",
            template.language,
            ")"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-green-500 rounded-xl", children: /* @__PURE__ */ jsx(Send, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Recipient & Variables" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Select recipient and fill template variables" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Recipient", className: "text-sm font-semibold mb-3" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl", children: [
                  /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer flex-1", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "radio",
                        checked: recipientType === "conversation",
                        onChange: () => handleRecipientChange("conversation"),
                        className: "w-4 h-4 text-blue-600"
                      }
                    ),
                    /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-gray-500" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "From Conversation" })
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer flex-1", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "radio",
                        checked: recipientType === "contact",
                        onChange: () => handleRecipientChange("contact"),
                        className: "w-4 h-4 text-blue-600"
                      }
                    ),
                    /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-gray-500" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "From Contact" })
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer flex-1", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "radio",
                        checked: recipientType === "manual",
                        onChange: () => handleRecipientChange("manual"),
                        className: "w-4 h-4 text-blue-600"
                      }
                    ),
                    /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4 text-gray-500" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Manual Entry" })
                  ] })
                ] }),
                recipientType === "conversation" && /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: selectedConversation,
                    onChange: (e) => handleConversationSelect(e.target.value),
                    className: "w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                    required: true,
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Select conversation..." }),
                      conversations.map((conv) => /* @__PURE__ */ jsxs("option", { value: conv.contact.wa_id, children: [
                        conv.contact.name,
                        " (",
                        conv.contact.wa_id,
                        ")"
                      ] }, conv.id))
                    ]
                  }
                ),
                recipientType === "contact" && /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: selectedContact,
                    onChange: (e) => handleContactSelect(e.target.value),
                    className: "w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                    required: true,
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Select contact..." }),
                      contacts.map((contact) => /* @__PURE__ */ jsxs("option", { value: contact.wa_id, children: [
                        contact.name || contact.wa_id,
                        " (",
                        contact.wa_id,
                        ")"
                      ] }, contact.id))
                    ]
                  }
                ),
                recipientType === "manual" && /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "text",
                    value: data.to_wa_id,
                    onChange: (e) => setData("to_wa_id", e.target.value),
                    placeholder: "Enter WhatsApp ID (e.g., 1234567890)",
                    className: "rounded-xl",
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(InputError, { message: errors.to_wa_id, className: "mt-2" })
            ] }),
            template.required_variables.total > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: `Template Variables (${template.required_variables.total} required)`, className: "text-sm font-semibold mb-3" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({ length: template.required_variables.total }, (_, index) => {
                const varIndex = index + 1;
                const isHeader = template.required_variables.header.includes(varIndex);
                const isBody = template.required_variables.body.includes(varIndex);
                const label = isHeader ? `Header Variable {{${varIndex}}}` : isBody ? `Body Variable {{${varIndex}}}` : `Button Variable {{${varIndex}}}`;
                return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "text",
                    value: data.variables[index] || "",
                    onChange: (e) => {
                      const newVars = [...data.variables];
                      newVars[index] = e.target.value;
                      setData("variables", newVars);
                    },
                    placeholder: label,
                    className: "rounded-xl",
                    required: true
                  }
                ) }, index);
              }) }),
              /* @__PURE__ */ jsx(InputError, { message: errors.variables, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("app.whatsapp.templates.show", {
                    template: template.slug
                  }),
                  children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", className: "rounded-xl", children: "Cancel" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  disabled: processing,
                  className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50 rounded-xl",
                  children: processing ? "Sending..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
                    "Send Template"
                  ] })
                }
              )
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Eye, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Preview" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "How your message will appear" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: [
                  "Template: ",
                  template.name
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-gray-950 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx("pre", { className: "text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed", children: renderPreview() }) })
            ] }),
            template.has_buttons && template.buttons.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Buttons" }),
              template.buttons.map((button, index) => /* @__PURE__ */ jsx(
                "div",
                {
                  className: "p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow",
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: button.text }),
                    /* @__PURE__ */ jsx(Badge, { variant: "info", className: "px-3 py-1", children: button.type })
                  ] })
                },
                index
              ))
            ] })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  TemplatesSend as default
};
