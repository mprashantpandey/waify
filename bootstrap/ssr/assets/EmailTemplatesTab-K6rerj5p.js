import { jsx, jsxs } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as Textarea } from "./Textarea-x8GTiAvG.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { FileText, Lock, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
const DEFAULT_PLACEHOLDERS = ["{{name}}", "{{email}}", "{{reset_link}}", "{{support_email}}", "{{platform_name}}"];
const SYSTEM_KEYS_SET = /* @__PURE__ */ new Set(["welcome", "password_reset", "email_verification", "support_notification", "phone_verification"]);
function EmailTemplatesTab({ data, setData, errors }) {
  const templates = Array.isArray(data.mail?.email_templates) ? data.mail.email_templates.map((t) => ({
    key: t.key ?? "",
    name: t.name ?? "",
    subject: t.subject ?? "",
    body_html: t.body_html ?? "",
    body_text: t.body_text ?? "",
    placeholders: Array.isArray(t.placeholders) ? t.placeholders : []
  })) : [];
  const systemTemplateKeys = new Set(
    Array.isArray(data.mail?.system_template_keys) ? data.mail.system_template_keys : Array.from(SYSTEM_KEYS_SET)
  );
  const isSystemTemplate = (key) => key !== "" && systemTemplateKeys.has(key);
  const [expandedId, setExpandedId] = useState(0);
  const updateTemplate = (index, field, value) => {
    const next = [...templates];
    next[index] = { ...next[index], [field]: value };
    setData("mail", { ...data.mail, email_templates: next });
  };
  const addTemplate = () => {
    const next = [
      ...templates,
      {
        key: "",
        name: "",
        subject: "",
        body_html: "",
        body_text: "",
        placeholders: []
      }
    ];
    setData("mail", { ...data.mail, email_templates: next });
    setExpandedId(next.length - 1);
  };
  const removeTemplate = (index) => {
    if (isSystemTemplate(templates[index]?.key ?? "")) return;
    const next = templates.filter((_, i) => i !== index);
    setData("mail", { ...data.mail, email_templates: next });
    if (expandedId === index) setExpandedId(null);
    else if (expandedId !== null && expandedId > index) setExpandedId(expandedId - 1);
  };
  const addPlaceholder = (templateIndex, placeholder) => {
    const t = templates[templateIndex];
    const p = placeholder.trim().replace(/\{\{|\}\}/g, "") ? `{{${placeholder.trim().replace(/\{\{|\}\}/g, "")}}}` : placeholder.trim();
    if (!p || t.placeholders.includes(p)) return;
    updateTemplate(templateIndex, "placeholders", [...t.placeholders, p]);
  };
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }),
        "Email templates"
      ] }),
      /* @__PURE__ */ jsxs(CardDescription, { children: [
        "Define reusable email templates for system emails (welcome, password reset, notifications, etc.). Use placeholders like ",
        "{{name}}",
        ", ",
        "{{reset_link}}",
        " in subject and body. Key must be unique (e.g. welcome, password_reset, support_notification)."
      ] })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      templates.map((template, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden",
          children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                className: "w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors",
                onClick: () => setExpandedId(expandedId === index ? null : index),
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-sm text-gray-500 dark:text-gray-400", children: template.key || "(new template)" }),
                    isSystemTemplate(template.key) && /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "shrink-0 gap-1 text-xs", children: [
                      /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3" }),
                      "System"
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 dark:text-gray-100 truncate", children: template.name || "Untitled" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]", children: template.subject || "No subject" }),
                    !isSystemTemplate(template.key) && /* @__PURE__ */ jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        className: "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
                        onClick: (e) => {
                          e.stopPropagation();
                          removeTemplate(index);
                        },
                        "aria-label": "Remove template",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] })
                ]
              }
            ),
            expandedId === index && /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: `tpl-key-${index}`, children: "Key (unique, e.g. welcome)" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: `tpl-key-${index}`,
                      value: template.key,
                      onChange: (e) => !isSystemTemplate(template.key) && updateTemplate(index, "key", e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "_")),
                      placeholder: "welcome_email",
                      className: "mt-1 font-mono text-sm",
                      readOnly: isSystemTemplate(template.key),
                      disabled: isSystemTemplate(template.key)
                    }
                  ),
                  isSystemTemplate(template.key) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: "System template key cannot be changed." }),
                  /* @__PURE__ */ jsx(InputError, { message: errors[`mail.email_templates.${index}.key`] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: `tpl-name-${index}`, children: "Display name" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: `tpl-name-${index}`,
                      value: template.name,
                      onChange: (e) => updateTemplate(index, "name", e.target.value),
                      placeholder: "Welcome email",
                      className: "mt-1"
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors[`mail.email_templates.${index}.name`] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: `tpl-subject-${index}`, children: "Subject line" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    id: `tpl-subject-${index}`,
                    value: template.subject,
                    onChange: (e) => updateTemplate(index, "subject", e.target.value),
                    placeholder: "Welcome to {{platform_name}}",
                    className: "mt-1"
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors[`mail.email_templates.${index}.subject`] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: `tpl-body-html-${index}`, children: "Body (HTML)" }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    id: `tpl-body-html-${index}`,
                    value: template.body_html,
                    onChange: (e) => updateTemplate(index, "body_html", e.target.value),
                    placeholder: "<p>Hello {{name}},</p><p>Welcome...</p>",
                    rows: 6,
                    className: "mt-1 font-mono text-sm"
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors[`mail.email_templates.${index}.body_html`] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: `tpl-body-text-${index}`, children: "Body (plain text, optional)" }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    id: `tpl-body-text-${index}`,
                    value: template.body_text,
                    onChange: (e) => updateTemplate(index, "body_text", e.target.value),
                    placeholder: "Hello {{name}}, Welcome...",
                    rows: 3,
                    className: "mt-1 text-sm"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Placeholders (optional)" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2", children: [
                  "Add placeholders that can be used in this template. Use ",
                  "{{placeholder}}",
                  " in subject/body."
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  DEFAULT_PLACEHOLDERS.filter((p) => !template.placeholders.includes(p)).map((p) => /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700",
                      onClick: () => addPlaceholder(index, p),
                      children: [
                        "+ ",
                        p
                      ]
                    },
                    p
                  )),
                  template.placeholders.map((p) => /* @__PURE__ */ jsxs(
                    "span",
                    {
                      className: "inline-flex items-center rounded-md bg-gray-200 dark:bg-gray-700 px-2 py-1 font-mono text-xs",
                      children: [
                        p,
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            className: "ml-1 text-gray-500 hover:text-red-600",
                            onClick: () => updateTemplate(
                              index,
                              "placeholders",
                              template.placeholders.filter((x) => x !== p)
                            ),
                            "aria-label": `Remove ${p}`,
                            children: "×"
                          }
                        )
                      ]
                    },
                    p
                  ))
                ] })
              ] })
            ] })
          ]
        },
        index
      )),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: addTemplate, className: "gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "Add template"
      ] }),
      /* @__PURE__ */ jsx(InputError, { message: errors["mail.email_templates"] })
    ] })
  ] }) });
}
export {
  EmailTemplatesTab as default
};
