import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { ArrowLeft, Plus, Tag, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { E as EmptyState } from "./EmptyState-B0nbB491.js";
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
function TagsIndex({
  account,
  tags
}) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const { data: createData, setData: setCreateData, post: postCreate, processing: creating, errors: createErrors, reset: resetCreate } = useForm({
    name: "",
    color: "#3B82F6",
    description: ""
  });
  const handleCreate = (e) => {
    e.preventDefault();
    postCreate(route("app.contacts.tags.store"), {
      onSuccess: () => {
        toast.success("Tag created");
        setShowCreate(false);
        resetCreate();
      },
      onError: () => toast.error("Failed to create tag")
    });
  };
  const handleDelete = (tag) => {
    if (!confirm(`Delete tag "${tag.name}"? Contacts will keep their data but this tag will be removed.`)) return;
    router.delete(route("app.contacts.tags.destroy", { tag: tag.id }), {
      onSuccess: () => toast.success("Tag deleted"),
      onError: () => toast.error("Failed to delete tag")
    });
  };
  const EditTagForm = ({ tag }) => {
    const { data, setData, put, processing, errors, reset } = useForm({
      name: tag.name,
      color: tag.color,
      description: tag.description || ""
    });
    const handleSubmit = (e) => {
      e.preventDefault();
      put(route("app.contacts.tags.update", { tag: tag.id }), {
        onSuccess: () => {
          setEditingId(null);
          toast.success("Tag updated");
        },
        onError: () => toast.error("Failed to update tag")
      });
    };
    return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex flex-wrap items-end gap-2 mt-2", children: [
      /* @__PURE__ */ jsx(TextInput, { value: data.name, onChange: (e) => setData("name", e.target.value), className: "w-40", required: true }),
      /* @__PURE__ */ jsx("input", { type: "color", value: data.color, onChange: (e) => setData("color", e.target.value), className: "h-8 w-12 rounded border" }),
      /* @__PURE__ */ jsx(TextInput, { value: data.description, onChange: (e) => setData("description", e.target.value), className: "w-48", placeholder: "Description" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", disabled: processing, children: "Save" }),
      /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => setEditingId(null), children: "Cancel" }),
      /* @__PURE__ */ jsx(InputError, { message: errors.name })
    ] });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Contact Tags" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.contacts.index"),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Contacts"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Contact Tags" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Organize contacts with tags. Use tags in filters and segments." })
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: () => setShowCreate(!showCreate), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Add Tag"
          ] })
        ] })
      ] }),
      showCreate && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "New tag" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, className: "flex flex-wrap items-end gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-48", children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Name" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                value: createData.name,
                onChange: (e) => setCreateData("name", e.target.value),
                className: "mt-1",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: createErrors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "w-32", children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Color" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "color",
                value: createData.color,
                onChange: (e) => setCreateData("color", e.target.value),
                className: "mt-1 h-10 w-full rounded border border-gray-300 dark:border-gray-700"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Description (optional)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                value: createData.description,
                onChange: (e) => setCreateData("description", e.target.value),
                className: "mt-1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: creating, children: "Create" }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => {
              setShowCreate(false);
              resetCreate();
            }, children: "Cancel" })
          ] })
        ] }) })
      ] }),
      tags.length === 0 && !showCreate ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-16 text-center", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: Tag,
          title: "No tags yet",
          description: "Create tags to organize your contacts (e.g. VIP, Lead, Customer).",
          action: /* @__PURE__ */ jsxs(Button, { onClick: () => setShowCreate(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Add Tag"
          ] })
        }
      ) }) }) : /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("ul", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: tags.map((tag) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between px-6 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "h-4 w-4 rounded-full shrink-0",
              style: { backgroundColor: tag.color }
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: tag.name }),
            tag.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: tag.description })
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "ml-2", children: [
            tag.contacts_count,
            " contact",
            tag.contacts_count !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: editingId === tag.id ? /* @__PURE__ */ jsx(EditTagForm, { tag }, tag.id) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: () => setEditingId(tag.id), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.index", { tags: [tag.id] }), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", children: "View contacts" }) }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleDelete(tag), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }) })
      ] }, tag.id)) }) }) })
    ] })
  ] });
}
export {
  TagsIndex as default
};
