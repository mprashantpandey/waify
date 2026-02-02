import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { ArrowLeft, MessageSquare, Clock, User } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { useState } from "react";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "axios";
import "laravel-echo";
import "pusher-js";
function ContactsShow({
  workspace,
  contact,
  activities,
  tags
}) {
  const { toast } = useToast();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const { data: noteData, setData: setNoteData, post: postNote, processing: noteProcessing } = useForm({
    note: ""
  });
  const { data: contactData, setData: setContactData, put, processing } = useForm({
    name: contact.name || "",
    email: contact.email || "",
    phone: contact.phone || "",
    company: contact.company || "",
    notes: contact.notes || "",
    status: contact.status,
    tags: contact.tags.map((t) => t.id)
  });
  const handleUpdate = (e) => {
    e.preventDefault();
    put(route("app.contacts.update", { workspace: workspace.slug, contact: contact.slug }), {
      onSuccess: () => {
        toast.success("Contact updated");
      },
      onError: () => {
        toast.error("Failed to update contact");
      }
    });
  };
  const handleAddNote = (e) => {
    e.preventDefault();
    postNote(route("app.contacts.add-note", { workspace: workspace.slug, contact: contact.slug }), {
      onSuccess: () => {
        toast.success("Note added");
        setShowNoteForm(false);
        setNoteData("note", "");
      },
      onError: () => {
        toast.error("Failed to add note");
      }
    });
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      inactive: { variant: "default", label: "Inactive" },
      blocked: { variant: "danger", label: "Blocked" },
      opt_out: { variant: "warning", label: "Opt Out" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, children: config.label });
  };
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: contact.name || contact.wa_id }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.contacts.index", { workspace: workspace.slug }),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Contacts"
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: contact.name || contact.wa_id }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
            getStatusBadge(contact.status),
            contact.tags.map((tag) => /* @__PURE__ */ jsx(
              Badge,
              {
                variant: "default",
                style: { backgroundColor: tag.color + "20", color: tag.color },
                children: tag.name
              },
              tag.id
            ))
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Contact Details" }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleUpdate, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Name" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  type: "text",
                  value: contactData.name,
                  onChange: (e) => setContactData("name", e.target.value),
                  className: "mt-1 block w-full"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "email",
                  type: "email",
                  value: contactData.email,
                  onChange: (e) => setContactData("email", e.target.value),
                  className: "mt-1 block w-full"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "phone", value: "Phone" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "phone",
                  type: "text",
                  value: contactData.phone,
                  onChange: (e) => setContactData("phone", e.target.value),
                  className: "mt-1 block w-full"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "company", value: "Company" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "company",
                  type: "text",
                  value: contactData.company,
                  onChange: (e) => setContactData("company", e.target.value),
                  className: "mt-1 block w-full"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "status", value: "Status" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "status",
                  value: contactData.status,
                  onChange: (e) => setContactData("status", e.target.value),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsx("option", { value: "inactive", children: "Inactive" }),
                    /* @__PURE__ */ jsx("option", { value: "blocked", children: "Blocked" }),
                    /* @__PURE__ */ jsx("option", { value: "opt_out", children: "Opt Out" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "notes", value: "Notes" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "notes",
                  value: contactData.notes,
                  onChange: (e) => setContactData("notes", e.target.value),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700",
                  rows: 4
                }
              )
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: "Save Changes" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Activity History" }) }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            !showNoteForm ? /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => setShowNoteForm(true),
                variant: "secondary",
                className: "mb-4 w-full",
                children: "Add Note"
              }
            ) : /* @__PURE__ */ jsxs("form", { onSubmit: handleAddNote, className: "mb-4 space-y-2", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: noteData.note,
                  onChange: (e) => setNoteData("note", e.target.value),
                  placeholder: "Add a note...",
                  required: true
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(Button, { type: "submit", disabled: noteProcessing, size: "sm", children: "Save" }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "secondary",
                    size: "sm",
                    onClick: () => {
                      setShowNoteForm(false);
                      setNoteData("note", "");
                    },
                    children: "Cancel"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-4 max-h-96 overflow-y-auto", children: activities.map((activity) => /* @__PURE__ */ jsx("div", { className: "border-l-2 border-gray-200 dark:border-gray-700 pl-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: activity.title }),
                activity.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: activity.description }),
                activity.user && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: [
                  "by ",
                  activity.user.name
                ] })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-500", children: formatDate(activity.created_at) })
            ] }) }, activity.id)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5 text-blue-600" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Messages" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", children: contact.message_count })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-green-600" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Last Seen" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: formatDate(contact.last_seen_at) })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-purple-600" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Source" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: contact.source || "Manual" })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-orange-600" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Created" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: formatDate(contact.created_at) })
          ] })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  ContactsShow as default
};
