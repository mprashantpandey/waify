import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Users, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "react";
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
function SegmentsShow({
  account,
  segment,
  contacts
}) {
  const { toast } = useToast();
  const handleRecalculate = () => {
    router.post(route("app.contacts.segments.recalculate", { segment: segment.id }), {}, {
      onSuccess: () => toast.success("Count recalculated")
    });
  };
  const handleDelete = () => {
    if (!confirm(`Delete segment "${segment.name}"?`)) return;
    router.delete(route("app.contacts.segments.destroy", { segment: segment.id }), {
      onSuccess: () => {
        toast.success("Segment deleted");
        router.visit(route("app.contacts.segments.index"));
      }
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: segment.name }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.contacts.segments.index"),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Segments"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: segment.name }),
            segment.description && /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: segment.description }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
                segment.contact_count,
                " contacts"
              ] }),
              segment.last_calculated_at && /* @__PURE__ */ jsxs("span", { children: [
                "Updated ",
                new Date(segment.last_calculated_at).toLocaleString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: handleRecalculate, children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
              "Recalculate"
            ] }),
            /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.edit", { segment: segment.id }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", children: [
              /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4 mr-2" }),
              "Edit"
            ] }) }),
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: handleDelete, children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2 text-red-600" }),
              "Delete"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Contacts in this segment" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          contacts.data.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 py-8 text-center", children: "No contacts match this segment’s filters." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: contacts.data.map((contact) => /* @__PURE__ */ jsxs("li", { className: "py-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("app.contacts.show", { contact: contact.slug || contact.id }),
                  className: "font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400",
                  children: contact.name || contact.wa_id
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400", children: [
                contact.wa_id && /* @__PURE__ */ jsxs("span", { children: [
                  "WhatsApp: ",
                  contact.wa_id
                ] }),
                contact.email && /* @__PURE__ */ jsxs("span", { children: [
                  "Email: ",
                  contact.email
                ] }),
                contact.company && /* @__PURE__ */ jsx("span", { children: contact.company })
              ] }),
              (contact.tags || []).length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: (contact.tags || []).map((t) => /* @__PURE__ */ jsx(Badge, { variant: "default", style: { backgroundColor: t.color + "20", color: t.color }, children: t.name }, t.id)) })
            ] }),
            /* @__PURE__ */ jsx(Link, { href: route("app.contacts.show", { contact: contact.slug || contact.id }), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", children: "View" }) })
          ] }, contact.id)) }),
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
    ] })
  ] });
}
export {
  SegmentsShow as default
};
