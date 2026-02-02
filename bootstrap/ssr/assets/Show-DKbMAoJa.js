import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { ArrowLeft, Shield } from "lucide-react";
import "react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "./Button-BocaoVWt.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "axios";
import "laravel-echo";
import "pusher-js";
function PlatformUsersShow({
  user
}) {
  const { auth } = usePage().props;
  return /* @__PURE__ */ jsx(PlatformShell, { auth, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: route("platform.users.index"),
        className: "inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
          "Back to Users"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3", children: [
        user.name,
        user.is_super_admin && /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
          "Super Admin"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: user.email })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "User Information" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: user.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Email" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: user.email })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Role" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1", children: user.is_super_admin ? /* @__PURE__ */ jsx(Badge, { variant: "info", children: "Super Admin" }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: "User" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Created" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: new Date(user.created_at).toLocaleString() })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Workspace Statistics" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Owned Workspaces" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100", children: user.owned_workspaces_count })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Member Workspaces" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100", children: user.member_workspaces_count })
          ] })
        ] }) })
      ] })
    ] })
  ] }) });
}
export {
  PlatformUsersShow as default
};
