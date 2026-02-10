import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { ArrowLeft, Plus, X } from "lucide-react";
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
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
const OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" }
];
function SegmentsEdit({
  account,
  segment,
  filter_fields
}) {
  const { toast } = useToast();
  const { data, setData, put, processing, errors } = useForm({
    name: segment.name,
    description: segment.description || "",
    filters: segment.filters.length ? segment.filters.map((f) => ({ field: f.field, operator: f.operator, value: f.value ?? "" })) : []
  });
  const addFilter = () => {
    setData("filters", [...data.filters, { field: filter_fields[0]?.value ?? "name", operator: "equals", value: "" }]);
  };
  const removeFilter = (index) => {
    setData("filters", data.filters.filter((_, i) => i !== index));
  };
  const updateFilter = (index, key, value) => {
    const next = [...data.filters];
    next[index] = { ...next[index], [key]: value };
    setData("filters", next);
  };
  const submit = (e) => {
    e.preventDefault();
    put(route("app.contacts.segments.update", { segment: segment.id }), {
      onSuccess: () => toast.success("Segment updated"),
      onError: () => toast.error("Failed to update segment")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Edit ${segment.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.contacts.segments.show", { segment: segment.id }),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Segment"
            ]
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Edit segment" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Segment details" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Name and optional description" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Name *" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "mt-1 w-full max-w-md",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Description (optional)" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: data.description,
                  onChange: (e) => setData("description", e.target.value),
                  className: "mt-1 w-full max-w-md rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2",
                  rows: 2
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "mt-6", children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Filters" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Contacts that match all rules below will be in this segment" })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: addFilter, children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
              "Add rule"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: data.filters.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No filters. Add a rule to limit which contacts are in this segment." }) : data.filters.map((filter, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-40", children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Field" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: filter.field,
                  onChange: (e) => updateFilter(index, "field", e.target.value),
                  className: "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800",
                  children: filter_fields.map((f) => /* @__PURE__ */ jsx("option", { value: f.value, children: f.label }, f.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-36", children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Operator" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: filter.operator,
                  onChange: (e) => updateFilter(index, "operator", e.target.value),
                  className: "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800",
                  children: OPERATORS.map((op) => /* @__PURE__ */ jsx("option", { value: op.value, children: op.label }, op.value))
                }
              )
            ] }),
            filter.operator !== "is_empty" && filter.operator !== "is_not_empty" && /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[120px]", children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Value" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: filter.value,
                  onChange: (e) => updateFilter(index, "value", e.target.value),
                  className: "mt-1"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => removeFilter(index), children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-4", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: "Save changes" }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.show", { segment: segment.id }), children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  SegmentsEdit as default
};
