import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { Tag, FolderOpen, Download, Plus, Search, Filter, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { E as EmptyState } from "./EmptyState-B0nbB491.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function ContactsIndex({
  account,
  contacts,
  tags,
  segments,
  filters
}) {
  const [search, setSearch] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [navigatingContactId, setNavigatingContactId] = useState(null);
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("app.contacts.index", {}), { search }, {
      preserveState: true,
      preserveScroll: true
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
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Contacts" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Contacts" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage your contacts and customer relationships" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.tags.index"), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
            /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4 mr-2" }),
            "Tags"
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.index"), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
            /* @__PURE__ */ jsx(FolderOpen, { className: "h-4 w-4 mr-2" }),
            "Segments"
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.export", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
            "Export"
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.create", {}), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Add Contact"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              type: "text",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "Search contacts...",
              className: "pl-10 w-full"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", children: "Search" }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "secondary",
            onClick: () => setShowFilters(!showFilters),
            children: [
              /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 mr-2" }),
              "Filters"
            ]
          }
        )
      ] }) }) }),
      contacts.data.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16 text-center", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: Users,
          title: "No contacts yet",
          description: "Start building your contact list by adding contacts manually or importing from CSV",
          action: /* @__PURE__ */ jsx(Link, { href: route("app.contacts.create", {}), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Add Contact"
          ] }) })
        }
      ) }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        contacts.data.map((contact) => /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg hover:shadow-xl transition-shadow", children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("app.contacts.show", {
                    contact: contact.slug || contact.id
                  }),
                  className: "text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400",
                  children: contact.name || contact.wa_id
                }
              ),
              getStatusBadge(contact.status)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2", children: [
              contact.wa_id && /* @__PURE__ */ jsxs("span", { children: [
                "WhatsApp: ",
                contact.wa_id
              ] }),
              contact.email && /* @__PURE__ */ jsxs("span", { children: [
                "Email: ",
                contact.email
              ] }),
              contact.phone && /* @__PURE__ */ jsxs("span", { children: [
                "Phone: ",
                contact.phone
              ] }),
              contact.company && /* @__PURE__ */ jsxs("span", { children: [
                "Company: ",
                contact.company
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-500 dark:text-gray-400", children: "Tags:" }),
              (contact.tags ?? []).length > 0 ? (contact.tags ?? []).map((tag) => /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: "default",
                  style: { backgroundColor: tag.color + "20", color: tag.color },
                  children: tag.name
                },
                tag.id
              )) : /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 dark:text-gray-500", children: "None" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-500 dark:text-gray-400", children: "Segments:" }),
              (contact.segments ?? []).length > 0 ? (contact.segments ?? []).map((seg) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: seg.name }, seg.id)) : /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 dark:text-gray-500", children: "None" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                className: "bg-[#25D366] hover:bg-[#1DAA57] text-white",
                disabled: navigatingContactId === contact.id,
                onClick: () => {
                  setNavigatingContactId(contact.id);
                  router.visit(route("app.whatsapp.conversations.by-contact", { contact: contact.slug || contact.id }), {
                    onFinish: () => setNavigatingContactId(null)
                  });
                },
                "aria-label": `Message ${contact.name || contact.wa_id}`,
                children: [
                  navigatingContactId === contact.id && /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin mr-1", "aria-hidden": true }),
                  "Message"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("app.contacts.show", {
                  contact: contact.slug || contact.id
                }),
                children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", children: "View" })
              }
            )
          ] })
        ] }) }) }, contact.id)),
        contacts.links && contacts.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-6", children: contacts.links.map((link, index) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => link.url && router.visit(link.url),
            disabled: !link.url,
            className: `px-4 py-2 rounded-md text-sm font-medium ${link.active ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"} ${!link.url ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          index
        )) })
      ] })
    ] })
  ] });
}
export {
  ContactsIndex as default
};
