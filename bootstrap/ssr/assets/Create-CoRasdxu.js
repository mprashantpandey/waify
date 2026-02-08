import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { ArrowLeft } from "lucide-react";
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
function ContactsCreate({
  account,
  tags
}) {
  const { toast } = useToast();
  const { data, setData, post, processing, errors } = useForm({
    wa_id: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    status: "active",
    tags: []
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("app.contacts.store", {}), {
      onSuccess: () => {
        toast.success("Contact created successfully");
      },
      onError: () => {
        toast.error("Failed to create contact");
      }
    });
  };
  const toggleTag = (tagId) => {
    if (data.tags.includes(tagId)) {
      setData("tags", data.tags.filter((id) => id !== tagId));
    } else {
      setData("tags", [...data.tags, tagId]);
    }
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Contact" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.contacts.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Contacts"
            ]
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Create Contact" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Contact Information" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Basic information about the contact" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "wa_id", value: "WhatsApp ID / Phone *" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "wa_id",
                  type: "text",
                  value: data.wa_id,
                  onChange: (e) => setData("wa_id", e.target.value),
                  className: "mt-1 block w-full",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.wa_id, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Name" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  type: "text",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "mt-1 block w-full"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "email",
                  type: "email",
                  value: data.email,
                  onChange: (e) => setData("email", e.target.value),
                  className: "mt-1 block w-full"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "phone", value: "Phone" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "phone",
                  type: "text",
                  value: data.phone,
                  onChange: (e) => setData("phone", e.target.value),
                  className: "mt-1 block w-full"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.phone, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "company", value: "Company" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "company",
                  type: "text",
                  value: data.company,
                  onChange: (e) => setData("company", e.target.value),
                  className: "mt-1 block w-full"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.company, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "status", value: "Status" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "status",
                  value: data.status,
                  onChange: (e) => setData("status", e.target.value),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsx("option", { value: "inactive", children: "Inactive" }),
                    /* @__PURE__ */ jsx("option", { value: "blocked", children: "Blocked" }),
                    /* @__PURE__ */ jsx("option", { value: "opt_out", children: "Opt Out" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.status, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "notes", value: "Notes" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "notes",
                  value: data.notes,
                  onChange: (e) => setData("notes", e.target.value),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  rows: 4
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.notes, className: "mt-2" })
            ] })
          ] })
        ] }),
        tags.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Tags" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Organize contacts with tags" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => toggleTag(tag.id),
              className: `px-3 py-1 rounded-full text-sm font-medium transition-colors ${data.tags.includes(tag.id) ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
              style: data.tags.includes(tag.id) ? {} : { backgroundColor: tag.color + "20", color: tag.color },
              children: tag.name
            },
            tag.id
          )) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-4", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.index", {}), children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: "Create Contact" })
        ] })
      ] })
    ] })
  ] });
}
export {
  ContactsCreate as default
};
