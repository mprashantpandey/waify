import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { Search, Shield, Eye, LogIn } from "lucide-react";
import "./Topbar-B0L72tZm.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function PlatformUsersIndex({
  users,
  filters
}) {
  const { auth } = usePage().props;
  const [localFilters, setLocalFilters] = useState(filters);
  const applyFilters = () => {
    router.get(route("platform.users.index"), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsx(PlatformShell, { auth, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Users" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Manage all users on the platform" })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            value: localFilters.search,
            onChange: (e) => setLocalFilters({ ...localFilters, search: e.target.value }),
            onKeyDown: (e) => e.key === "Enter" && applyFilters(),
            className: "pl-10",
            placeholder: "Search users..."
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(Button, { onClick: applyFilters, children: "Apply Filters" })
    ] }) }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "User" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Role" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Created" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800", children: users.data.map((user) => /* @__PURE__ */ jsxs(
        "tr",
        {
          className: "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: user.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: user.email })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: user.is_super_admin ? /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "flex items-center gap-1 w-fit", children: [
              /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
              "Super Admin"
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "User" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: new Date(user.created_at).toLocaleDateString() }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("platform.users.show", {
                    user: user.id
                  }),
                  children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-1" }),
                    "View"
                  ] })
                }
              ),
              Number(auth?.user?.id) !== Number(user.id) && /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "secondary",
                  size: "sm",
                  onClick: () => router.post(route("platform.users.impersonate", { user: user.id })),
                  children: [
                    /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4 mr-1" }),
                    "Login As User"
                  ]
                }
              )
            ] }) })
          ]
        },
        user.id
      )) })
    ] }) }) }) }),
    users.links && users.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-2", children: users.links.map((link, index) => /* @__PURE__ */ jsx(
      Link,
      {
        href: link.url || "#",
        className: `px-3 py-2 rounded-lg text-sm ${link.active ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"} ${!link.url && "opacity-50 cursor-not-allowed"}`,
        dangerouslySetInnerHTML: { __html: link.label }
      },
      index
    )) })
  ] }) });
}
export {
  PlatformUsersIndex as default
};
