import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Loader2, MessageSquare, Trash2, Clock, User } from "lucide-react";
import { useState } from "react";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function ContactsShow({
  account,
  contact: contactProp,
  activities = [],
  tags: tagsProp = [],
  segments: availableSegments = []
}) {
  const contact = {
    ...contactProp,
    tags: contactProp?.tags ?? [],
    segments: contactProp?.segments ?? []
  };
  const tags = Array.isArray(tagsProp) ? tagsProp : [];
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [navigatingToConversation, setNavigatingToConversation] = useState(false);
  const [deletingContact, setDeletingContact] = useState(false);
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
    tags: (contact.tags || []).map((t) => t.id),
    segments: (contact.segments || []).map((s) => s.id)
  });
  const handleUpdate = (e) => {
    e.preventDefault();
    put(route("app.contacts.update", { contact: contact.slug || contact.id }));
  };
  const handleAddNote = (e) => {
    e.preventDefault();
    postNote(route("app.contacts.add-note", { contact: contact.slug || contact.id }), {
      onSuccess: () => {
        setShowNoteForm(false);
        setNoteData("note", "");
      }
    });
  };
  const handleDeleteContact = () => {
    if (!confirm(`Delete contact "${contact.name || contact.wa_id}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingContact(true);
    router.delete(route("app.contacts.destroy", { contact: contact.slug || contact.id }), {
      onFinish: () => {
        setDeletingContact(false);
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
            href: route("app.contacts.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Contacts"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: contact.name || contact.wa_id }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-2", children: [
              getStatusBadge(contact.status),
              (contact.tags || []).map((tag) => /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: "default",
                  style: { backgroundColor: tag.color + "20", color: tag.color },
                  children: tag.name
                },
                tag.id
              )),
              (contact.segments || []).length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Segments:" }),
                (contact.segments || []).map((seg) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: seg.name }, seg.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                className: "bg-[#25D366] hover:bg-[#1DAA57] text-white",
                disabled: navigatingToConversation,
                onClick: () => {
                  setNavigatingToConversation(true);
                  router.visit(route("app.whatsapp.conversations.by-contact", { contact: contact.slug || contact.id }), {
                    onFinish: () => setNavigatingToConversation(false)
                  });
                },
                "aria-label": "Start conversation in Inbox",
                children: [
                  navigatingToConversation ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 mr-2", "aria-hidden": true }),
                  "Start conversation"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "danger",
                disabled: deletingContact,
                onClick: handleDeleteContact,
                "aria-label": "Delete contact",
                children: [
                  deletingContact ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2", "aria-hidden": true }),
                  "Delete"
                ]
              }
            )
          ] })
        ] })
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
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Tags" }),
              tags.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2", children: "Add or remove tags for this contact" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const current = contactData.tags;
                      setContactData("tags", current.includes(tag.id) ? current.filter((id) => id !== tag.id) : [...current, tag.id]);
                    },
                    className: `px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${contactData.tags.includes(tag.id) ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
                    style: !contactData.tags.includes(tag.id) ? { borderColor: tag.color + "80", backgroundColor: tag.color + "20", color: tag.color } : void 0,
                    children: tag.name
                  },
                  tag.id
                )) })
              ] }) : /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: [
                "No tags yet.",
                " ",
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("app.contacts.tags.index"),
                    className: "font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400",
                    children: "Create tags in the Tags section"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Segments" }),
              availableSegments.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2", children: "Add or remove segments for this contact" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: availableSegments.map((seg) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const current = contactData.segments;
                      setContactData("segments", current.includes(seg.id) ? current.filter((id) => id !== seg.id) : [...current, seg.id]);
                    },
                    className: `px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${contactData.segments.includes(seg.id) ? "border-emerald-500 bg-emerald-600 text-white" : "border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
                    children: seg.name
                  },
                  seg.id
                )) })
              ] }) : /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: [
                "No segments yet.",
                " ",
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("app.contacts.segments.index"),
                    className: "font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400",
                    children: "Create segments in the Segments section"
                  }
                )
              ] })
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
