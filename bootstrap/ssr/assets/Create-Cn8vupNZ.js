import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Info, Plus, Trash2, AlertCircle } from "lucide-react";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./Select-CAnRTAG0.js";
import { T as Textarea } from "./Textarea-x8GTiAvG.js";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function ListsCreate({
  account,
  connections
}) {
  const { toast } = useToast();
  const { data, setData, post, processing, errors } = useForm({
    whatsapp_connection_id: connections?.[0]?.id?.toString() || "",
    name: "",
    button_text: "",
    description: "",
    footer_text: "",
    sections: [
      {
        title: "",
        rows: [
          { id: "", title: "", description: "" }
        ]
      }
    ]
  });
  const addSection = () => {
    if (data.sections.length >= 10) {
      toast.error("Maximum 10 sections allowed");
      return;
    }
    setData("sections", [
      ...data.sections,
      { title: "", rows: [{ id: "", title: "", description: "" }] }
    ]);
  };
  const removeSection = (index) => {
    const sections = [...data.sections];
    sections.splice(index, 1);
    setData("sections", sections);
  };
  const updateSection = (index, field, value) => {
    const sections = [...data.sections];
    sections[index] = { ...sections[index], [field]: value };
    setData("sections", sections);
  };
  const addRow = (sectionIndex) => {
    const sections = [...data.sections];
    if (sections[sectionIndex].rows.length >= 10) {
      toast.error("Maximum 10 rows per section allowed");
      return;
    }
    const totalRows2 = sections.reduce((sum, s) => sum + s.rows.length, 0);
    if (totalRows2 >= 10) {
      toast.error("Maximum 10 total rows across all sections");
      return;
    }
    sections[sectionIndex].rows.push({ id: "", title: "", description: "" });
    setData("sections", sections);
  };
  const removeRow = (sectionIndex, rowIndex) => {
    const sections = [...data.sections];
    sections[sectionIndex].rows.splice(rowIndex, 1);
    if (sections[sectionIndex].rows.length === 0) {
      sections[sectionIndex].rows.push({ id: "", title: "", description: "" });
    }
    setData("sections", sections);
  };
  const updateRow = (sectionIndex, rowIndex, field, value) => {
    const sections = [...data.sections];
    sections[sectionIndex].rows[rowIndex] = {
      ...sections[sectionIndex].rows[rowIndex],
      [field]: value
    };
    setData("sections", sections);
  };
  const submit = (e) => {
    e.preventDefault();
    post(route("app.whatsapp.lists.store", {}), {
      onSuccess: () => {
        toast.success("List created successfully");
      },
      onError: (errors2) => {
        toast.error("Failed to create list", Object.values(errors2).flat().join(", "));
      }
    });
  };
  const totalRows = data.sections.reduce((sum, s) => sum + s.rows.length, 0);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create WhatsApp List" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.lists.index", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
          "Back"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: "Create List" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Create an interactive list message for WhatsApp" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Alert, { variant: "info", className: "mb-6", children: [
        /* @__PURE__ */ jsx(Info, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold mb-1", children: "List Message Guidelines" }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm space-y-1 list-disc list-inside", children: [
            /* @__PURE__ */ jsx("li", { children: "Button text: Max 20 characters" }),
            /* @__PURE__ */ jsx("li", { children: "Description: Max 1024 characters (optional)" }),
            /* @__PURE__ */ jsx("li", { children: "Footer: Max 60 characters (optional)" }),
            /* @__PURE__ */ jsx("li", { children: "Max 10 sections, each with max 10 rows" }),
            /* @__PURE__ */ jsx("li", { children: "Total rows across all sections: Max 10" }),
            /* @__PURE__ */ jsx("li", { children: "Section title: Max 24 characters" }),
            /* @__PURE__ */ jsx("li", { children: "Row ID: Max 200 characters (unique identifier)" }),
            /* @__PURE__ */ jsx("li", { children: "Row title: Max 24 characters" }),
            /* @__PURE__ */ jsx("li", { children: "Row description: Max 72 characters (optional)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Basic Information" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Configure the list name and connection" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "connection", children: "WhatsApp Connection *" }),
              /* @__PURE__ */ jsxs(
                Select,
                {
                  value: data.whatsapp_connection_id,
                  onValueChange: (value) => setData("whatsapp_connection_id", value),
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select connection" }) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: connections.map((conn) => /* @__PURE__ */ jsx(SelectItem, { value: conn.id.toString(), children: conn.name }, conn.id)) })
                  ]
                }
              ),
              errors.whatsapp_connection_id && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.whatsapp_connection_id })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "List Name *" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  placeholder: "e.g., Product Catalog, Support Options",
                  maxLength: 255
                }
              ),
              errors.name && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "button_text", children: "Button Text * (Max 20 chars)" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "button_text",
                  value: data.button_text,
                  onChange: (e) => setData("button_text", e.target.value),
                  placeholder: "e.g., View Options, Browse",
                  maxLength: 20
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                data.button_text.length,
                "/20 characters"
              ] }),
              errors.button_text && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.button_text })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description (Optional, Max 1024 chars)" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  id: "description",
                  value: data.description || "",
                  onChange: (e) => setData("description", e.target.value),
                  placeholder: "Optional description text",
                  maxLength: 1024,
                  rows: 3
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                (data.description || "").length,
                "/1024 characters"
              ] }),
              errors.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.description })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "footer_text", children: "Footer Text (Optional, Max 60 chars)" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "footer_text",
                  value: data.footer_text || "",
                  onChange: (e) => setData("footer_text", e.target.value),
                  placeholder: "Optional footer text",
                  maxLength: 60
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                (data.footer_text || "").length,
                "/60 characters"
              ] }),
              errors.footer_text && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors.footer_text })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Sections & Rows" }),
              /* @__PURE__ */ jsxs(CardDescription, { children: [
                "Configure list sections and rows (",
                data.sections.length,
                " sections, ",
                totalRows,
                " ",
                "rows)"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", onClick: addSection, variant: "secondary", size: "sm", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
              "Add Section"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
            data.sections.map((section, sectionIndex) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: [
                      "Section ",
                      sectionIndex + 1
                    ] }),
                    data.sections.length > 1 && /* @__PURE__ */ jsx(
                      Button,
                      {
                        type: "button",
                        onClick: () => removeSection(sectionIndex),
                        variant: "ghost",
                        size: "sm",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-red-500" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { children: "Section Title * (Max 24 chars)" }),
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        value: section.title,
                        onChange: (e) => updateSection(sectionIndex, "title", e.target.value),
                        placeholder: "Section title",
                        maxLength: 24
                      }
                    ),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                      section.title.length,
                      "/24 characters"
                    ] }),
                    errors[`sections.${sectionIndex}.title`] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: errors[`sections.${sectionIndex}.title`] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs(Label, { children: [
                        "Rows (",
                        section.rows.length,
                        "/10)"
                      ] }),
                      /* @__PURE__ */ jsxs(
                        Button,
                        {
                          type: "button",
                          onClick: () => addRow(sectionIndex),
                          variant: "secondary",
                          size: "sm",
                          children: [
                            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
                            "Add Row"
                          ]
                        }
                      )
                    ] }),
                    section.rows.map((row, rowIndex) => /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2",
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                            /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold text-gray-500", children: [
                              "Row ",
                              rowIndex + 1
                            ] }),
                            section.rows.length > 1 && /* @__PURE__ */ jsx(
                              Button,
                              {
                                type: "button",
                                onClick: () => removeRow(sectionIndex, rowIndex),
                                variant: "ghost",
                                size: "sm",
                                children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3 text-red-500" })
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Row ID * (Max 200 chars)" }),
                            /* @__PURE__ */ jsx(
                              TextInput,
                              {
                                value: row.id,
                                onChange: (e) => updateRow(sectionIndex, rowIndex, "id", e.target.value),
                                placeholder: "Unique identifier (e.g., product_1)",
                                maxLength: 200,
                                className: "text-sm"
                              }
                            ),
                            errors[`sections.${sectionIndex}.rows.${rowIndex}.id`] && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: errors[`sections.${sectionIndex}.rows.${rowIndex}.id`] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Row Title * (Max 24 chars)" }),
                            /* @__PURE__ */ jsx(
                              TextInput,
                              {
                                value: row.title,
                                onChange: (e) => updateRow(sectionIndex, rowIndex, "title", e.target.value),
                                placeholder: "Row title",
                                maxLength: 24,
                                className: "text-sm"
                              }
                            ),
                            errors[`sections.${sectionIndex}.rows.${rowIndex}.title`] && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: errors[`sections.${sectionIndex}.rows.${rowIndex}.title`] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Row Description (Optional, Max 72 chars)" }),
                            /* @__PURE__ */ jsx(
                              TextInput,
                              {
                                value: row.description || "",
                                onChange: (e) => updateRow(
                                  sectionIndex,
                                  rowIndex,
                                  "description",
                                  e.target.value
                                ),
                                placeholder: "Optional description",
                                maxLength: 72,
                                className: "text-sm"
                              }
                            ),
                            errors[`sections.${sectionIndex}.rows.${rowIndex}.description`] && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: errors[`sections.${sectionIndex}.rows.${rowIndex}.description`] })
                          ] })
                        ]
                      },
                      rowIndex
                    ))
                  ] })
                ]
              },
              sectionIndex
            )),
            errors.sections && /* @__PURE__ */ jsxs(Alert, { variant: "error", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsx("div", { children: Array.isArray(errors.sections) ? /* @__PURE__ */ jsx("ul", { className: "list-disc list-inside", children: errors.sections.map((error, i) => /* @__PURE__ */ jsx("li", { children: error }, i)) }) : /* @__PURE__ */ jsx("p", { children: errors.sections }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.lists.index", {}), children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: processing ? "Creating..." : "Create List" })
        ] })
      ] })
    ] })
  ] });
}
export {
  ListsCreate as default
};
