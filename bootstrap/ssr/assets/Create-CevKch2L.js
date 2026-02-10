import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { ArrowLeft } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function BroadcastsCreate({
  account,
  connections,
  templates,
  contactsCount,
  segments
}) {
  const { toast } = useToast();
  const [campaignType, setCampaignType] = useState("template");
  const [recipientType, setRecipientType] = useState("contacts");
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    description: "",
    type: "template",
    whatsapp_connection_id: "",
    whatsapp_template_id: "",
    template_params: [],
    message_text: "",
    media_url: "",
    media_type: "image",
    recipient_type: "contacts",
    recipient_filters: {},
    custom_recipients: [],
    scheduled_at: "",
    send_delay_seconds: 0,
    respect_opt_out: true
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("app.broadcasts.store", {}), {
      onSuccess: () => {
        toast.success("Campaign created successfully");
      },
      onError: () => {
        toast.error("Failed to create campaign");
      }
    });
  };
  const addCustomRecipient = () => {
    setData("custom_recipients", [...data.custom_recipients, { phone: "", name: "" }]);
  };
  const removeCustomRecipient = (index) => {
    setData(
      "custom_recipients",
      data.custom_recipients.filter((_, i) => i !== index)
    );
  };
  const updateCustomRecipient = (index, field, value) => {
    const updated = [...data.custom_recipients];
    updated[index] = { ...updated[index], [field]: value };
    setData("custom_recipients", updated);
  };
  const toggleSegment = (segmentId) => {
    const next = selectedSegments.includes(segmentId) ? selectedSegments.filter((id) => id !== segmentId) : [...selectedSegments, segmentId];
    setSelectedSegments(next);
    setData("recipient_filters", { ...data.recipient_filters || {}, segment_ids: next });
  };
  const availableTemplates = selectedConnection ? templates.filter((t) => t.connection_id === selectedConnection) : templates;
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Campaign" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.broadcasts.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Campaigns"
            ]
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Create Campaign" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Campaign Details" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Basic information about your campaign" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Campaign Name *" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  type: "text",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "mt-1 block w-full",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "description", value: "Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "description",
                  value: data.description,
                  onChange: (e) => setData("description", e.target.value),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  rows: 3
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.description, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "connection", value: "WhatsApp Connection *" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "connection",
                  value: selectedConnection,
                  onChange: (e) => {
                    setSelectedConnection(e.target.value ? Number(e.target.value) : "");
                    setData("whatsapp_connection_id", e.target.value);
                    setSelectedTemplate("");
                    setData("whatsapp_template_id", "");
                  },
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  required: true,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Select a connection" }),
                    connections.map((conn) => /* @__PURE__ */ jsx("option", { value: conn.id, children: conn.name }, conn.id))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.whatsapp_connection_id, className: "mt-2" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Message Type" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Choose how to send your campaign" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    value: "template",
                    checked: campaignType === "template",
                    onChange: (e) => {
                      setCampaignType("template");
                      setData("type", "template");
                    },
                    className: "mr-2"
                  }
                ),
                "Template Message"
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    value: "text",
                    checked: campaignType === "text",
                    onChange: (e) => {
                      setCampaignType("text");
                      setData("type", "text");
                    },
                    className: "mr-2"
                  }
                ),
                "Text Message"
              ] })
            ] }),
            campaignType === "template" && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "template", value: "Template *" }),
              !selectedConnection ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Select a WhatsApp connection above to see templates." }) : availableTemplates.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-amber-600 dark:text-amber-400", children: "No approved templates for this connection. Create and approve templates in Meta Business Suite or sync templates in WhatsApp settings." }) : /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "template",
                  value: selectedTemplate,
                  onChange: (e) => {
                    setSelectedTemplate(e.target.value ? Number(e.target.value) : "");
                    setData("whatsapp_template_id", e.target.value || "");
                  },
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  required: true,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Select a template" }),
                    availableTemplates.map((template) => /* @__PURE__ */ jsxs("option", { value: template.id, children: [
                      template.name,
                      " (",
                      template.language,
                      ")"
                    ] }, template.id))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.whatsapp_template_id, className: "mt-2" })
            ] }),
            campaignType === "text" && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "message_text", value: "Message Text *" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "message_text",
                  value: data.message_text,
                  onChange: (e) => setData("message_text", e.target.value),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  rows: 5,
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.message_text, className: "mt-2" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Recipients" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Who should receive this campaign?" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    value: "contacts",
                    checked: recipientType === "contacts",
                    onChange: (e) => {
                      setRecipientType("contacts");
                      setData("recipient_type", "contacts");
                      setSelectedSegments([]);
                      setData("recipient_filters", {});
                    },
                    className: "mr-2"
                  }
                ),
                "All Contacts (",
                contactsCount,
                ")"
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    value: "custom",
                    checked: recipientType === "custom",
                    onChange: (e) => {
                      setRecipientType("custom");
                      setData("recipient_type", "custom");
                      setSelectedSegments([]);
                      setData("recipient_filters", {});
                    },
                    className: "mr-2"
                  }
                ),
                "Custom List"
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    value: "segment",
                    checked: recipientType === "segment",
                    onChange: () => {
                      setRecipientType("segment");
                      setData("recipient_type", "segment");
                      setData("recipient_filters", { segment_ids: selectedSegments });
                    },
                    className: "mr-2"
                  }
                ),
                "Segments"
              ] })
            ] }),
            recipientType === "custom" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              data.custom_recipients.map((recipient, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "text",
                    placeholder: "Phone number (with country code)",
                    value: recipient.phone,
                    onChange: (e) => updateCustomRecipient(index, "phone", e.target.value),
                    className: "flex-1"
                  }
                ),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "text",
                    placeholder: "Name (optional)",
                    value: recipient.name || "",
                    onChange: (e) => updateCustomRecipient(index, "name", e.target.value),
                    className: "flex-1"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "secondary",
                    onClick: () => removeCustomRecipient(index),
                    children: "Remove"
                  }
                )
              ] }, index)),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: addCustomRecipient, children: "Add Recipient" })
            ] }),
            recipientType === "segment" && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3", children: "Select segments" }),
              segments.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No segments available yet." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: segments.map((segment) => /* @__PURE__ */ jsxs(
                "label",
                {
                  className: "flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700",
                  children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: selectedSegments.includes(segment.id),
                        onChange: () => toggleSegment(segment.id)
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "flex-1", children: segment.name }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: segment.contact_count ?? "—" })
                  ]
                },
                segment.id
              )) }),
              selectedSegments.length === 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 text-xs text-amber-600", children: "Select at least one segment to continue." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Schedule" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "When should this campaign be sent?" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "scheduled_at", value: "Schedule (optional)" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "scheduled_at",
                  type: "datetime-local",
                  value: data.scheduled_at,
                  onChange: (e) => setData("scheduled_at", e.target.value),
                  className: "mt-1 block w-full"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.scheduled_at, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "send_delay_seconds", value: "Delay Between Messages (seconds)" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "send_delay_seconds",
                  type: "number",
                  min: "0",
                  max: "3600",
                  value: data.send_delay_seconds,
                  onChange: (e) => setData("send_delay_seconds", Number(e.target.value)),
                  className: "mt-1 block w-full"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.send_delay_seconds, className: "mt-2" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-4", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.broadcasts.index", {}), children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: data.scheduled_at ? "Schedule Campaign" : "Create Campaign" })
        ] })
      ] })
    ] })
  ] });
}
export {
  BroadcastsCreate as default
};
