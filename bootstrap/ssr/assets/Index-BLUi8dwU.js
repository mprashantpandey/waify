import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Plus, FolderOpen, Users, RefreshCw, Trash2 } from "lucide-react";
import { u as useToast } from "./useToast-CwsXrmjR.js";
import { E as EmptyState } from "./EmptyState-B0nbB491.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./Badge-CHx1ViYT.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./Alert-C-mQ6HNk.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function SegmentsIndex({
  account,
  segments
}) {
  const { toast } = useToast();
  const handleDelete = (segment) => {
    if (!confirm(`Delete segment "${segment.name}"?`)) return;
    router.delete(route("app.contacts.segments.destroy", { segment: segment.id }), {
      onError: () => toast.error("Failed to delete segment")
    });
  };
  const handleRecalculate = (segmentId) => {
    router.post(route("app.contacts.segments.recalculate", { segment: segmentId }), {});
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
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Contact Segments" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Group contacts by rules. Use segments for campaigns and filters." })
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.create"), className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxs(Button, { className: "w-full sm:w-auto", children: [
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
          action: /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.create"), className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxs(Button, { className: "w-full sm:w-auto", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "New Segment"
          ] }) })
        }
      ) }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: segments.map((seg) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("app.contacts.segments.show", { segment: seg.id }),
              className: "text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 break-words",
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
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-stretch sm:items-center gap-2 lg:shrink-0", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              size: "sm",
              className: "w-full sm:w-auto",
              onClick: () => handleRecalculate(seg.id),
              children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.edit", { segment: seg.id }), className: "w-full sm:w-auto", children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "w-full sm:w-auto", children: "Edit" }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.show", { segment: seg.id }), className: "w-full sm:w-auto", children: /* @__PURE__ */ jsx(Button, { size: "sm", className: "w-full sm:w-auto", children: "View" }) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              size: "sm",
              className: "w-full sm:w-auto",
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
