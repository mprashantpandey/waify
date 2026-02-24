import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { E as EmptyState } from "./EmptyState-B0nbB491.js";
import { Plus, List, ToggleRight, ToggleLeft, Eye, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { u as useToast } from "./useToast-C5ECijgs.js";
import { u as useConfirm } from "./useConfirm-BKf7Nv1N.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function ListsIndex({
  account,
  lists,
  connections
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const handleToggle = async (list) => {
    setToggling(list.id);
    try {
      await router.post(route("app.whatsapp.lists.toggle", { list: list.id }), {}, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`List ${list.is_active ? "deactivated" : "activated"}`);
        },
        onError: () => {
          toast.error("Failed to update list status");
        },
        onFinish: () => setToggling(null)
      });
    } catch (error) {
      setToggling(null);
    }
  };
  const handleDelete = async (list) => {
    const confirmed = await confirm({
      title: "Delete List",
      message: `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    setDeleting(list.id);
    try {
      await router.delete(route("app.whatsapp.lists.destroy", { list: list.id }), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("List deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete list");
        },
        onFinish: () => setDeleting(null)
      });
    } catch (error) {
      setDeleting(null);
    }
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "WhatsApp Lists" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: "WhatsApp Lists" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Create and manage interactive list messages for WhatsApp" })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.lists.create", {}), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Create List"
        ] }) })
      ] }),
      lists.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: List,
          title: "No lists found",
          description: "Create your first interactive list message to send to contacts.",
          action: /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.lists.create", {}), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Create List"
          ] }) })
        }
      ) }) }) : /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "List Name" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Button Text" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Sections" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Rows" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Connection" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800", children: lists.map((list) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/10 dark:hover:to-blue-800/10 transition-all duration-200",
            children: [
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: list.name }),
                list.description && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs", children: list.description })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: list.button_text }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: list.sections_count }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: list.total_rows }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: list.connection.name }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleToggle(list),
                  disabled: toggling === list.id,
                  className: "flex items-center gap-2",
                  children: list.is_active ? /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(ToggleRight, { className: "h-3 w-3" }),
                    "Active"
                  ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(ToggleLeft, { className: "h-3 w-3" }),
                    "Inactive"
                  ] })
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.lists.show", { list: list.id }), children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.lists.edit", { list: list.id }), children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => handleDelete(list),
                    disabled: deleting === list.id,
                    children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-red-500" })
                  }
                )
              ] }) })
            ]
          },
          list.id
        )) })
      ] }) }) }) })
    ] })
  ] });
}
export {
  ListsIndex as default
};
