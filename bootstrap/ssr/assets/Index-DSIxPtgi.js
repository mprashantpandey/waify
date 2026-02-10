import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Plus, FolderOpen, Users, RefreshCw, Trash2 } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { E as EmptyState } from "./EmptyState-B0nbB491.js";
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
function SegmentsIndex({
  account,
  segments
}) {
  const { toast } = useToast();
  const handleDelete = (segment) => {
    if (!confirm(`Delete segment "${segment.name}"?`)) return;
    router.delete(route("app.contacts.segments.destroy", { segment: segment.id }), {
      onSuccess: () => toast.success("Segment deleted"),
      onError: () => toast.error("Failed to delete segment")
    });
  };
  const handleRecalculate = (segmentId) => {
    router.post(route("app.contacts.segments.recalculate", { segment: segmentId }), {}, {
      onSuccess: () => toast.success("Count recalculated")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Contact Segments" }),
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
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Contact Segments" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Group contacts by rules. Use segments for campaigns and filters." })
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.create"), children: /* @__PURE__ */ jsxs(Button, { children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "New Segment"
          ] }) })
        ] })
      ] }),
      segments.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-16 text-center", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: FolderOpen,
          title: "No segments yet",
          description: "Create segments to group contacts by criteria (e.g. status, tag, company).",
          action: /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.create"), children: /* @__PURE__ */ jsxs(Button, { children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "New Segment"
          ] }) })
        }
      ) }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: segments.map((seg) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("app.contacts.segments.show", { segment: seg.id }),
              className: "text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400",
              children: seg.name
            }
          ),
          seg.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: seg.description }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
              seg.contact_count,
              " contacts"
            ] }),
            seg.last_calculated_at && /* @__PURE__ */ jsxs("span", { children: [
              "Updated ",
              new Date(seg.last_calculated_at).toLocaleDateString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              size: "sm",
              onClick: () => handleRecalculate(seg.id),
              children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.edit", { segment: seg.id }), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", children: "Edit" }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.show", { segment: seg.id }), children: /* @__PURE__ */ jsx(Button, { size: "sm", children: "View" }) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              size: "sm",
              onClick: () => handleDelete(seg),
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-red-600" })
            }
          )
        ] })
      ] }) }, seg.id)) })
    ] })
  ] });
}
export {
  SegmentsIndex as default
};
