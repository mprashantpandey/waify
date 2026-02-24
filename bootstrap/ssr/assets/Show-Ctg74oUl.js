import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Edit } from "lucide-react";
import "react";
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
function ListsShow({
  account,
  list
}) {
  const totalRows = list.sections.reduce((sum, s) => sum + s.rows.length, 0);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `List: ${list.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.lists.index", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
          "Back"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: list.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Interactive list message configuration" })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.lists.edit", { list: list.id }), children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
          "Edit"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Button Text" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1", children: list.button_text })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Sections" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1", children: list.sections.length })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total Rows" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1", children: totalRows })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "List Details" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Connection" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 mt-1", children: list.connection.name })
          ] }),
          list.description && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Description" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 mt-1", children: list.description })
          ] }),
          list.footer_text && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Footer" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 mt-1", children: list.footer_text })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Status" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1", children: list.is_active ? /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Active" }) : /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Inactive" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Sections & Rows" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-6", children: list.sections.map((section, sectionIndex) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3",
            children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: section.title || `Section ${sectionIndex + 1}` }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: section.rows.map((row, rowIndex) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "border border-gray-200 dark:border-gray-700 rounded-lg p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: row.title }),
                    row.description && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: row.description }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: [
                      "ID: ",
                      row.id
                    ] })
                  ]
                },
                rowIndex
              )) })
            ]
          },
          sectionIndex
        )) })
      ] })
    ] })
  ] });
}
export {
  ListsShow as default
};
