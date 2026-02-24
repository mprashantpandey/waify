import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-BVTGgi5j.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { ArrowLeft, Shield } from "lucide-react";
import "react";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./Button-ymbdH_NY.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "axios";
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
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Tenant Statistics" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Owned Tenants" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100", children: user.owned_accounts_count })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Member Tenants" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100", children: user.member_accounts_count })
          ] })
        ] }) })
      ] })
    ] })
  ] }) });
}
export {
  PlatformUsersShow as default
};
