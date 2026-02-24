import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { Head } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import DeleteUserForm from "./DeleteUserForm-ClWLn-Vf.js";
import UpdatePasswordForm from "./UpdatePasswordForm-Ddtn95Kw.js";
import UpdateProfileInformation from "./UpdateProfileInformationForm-CB1WakzQ.js";
import { User, Shield, Trash2 } from "lucide-react";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-ymbdH_NY.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./InputError-DiSBWiye.js";
import "./InputLabel-CE_n4Upz.js";
import "./TextInput-Dl1_GoEA.js";
import "./useNotifications-CTnw084D.js";
import "./useConfirm-BKf7Nv1N.js";
import "@headlessui/react";
function Edit({
  mustVerifyEmail,
  status
}) {
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Profile" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Profile Settings" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage your account information and security settings" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Profile Information" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Update your account's profile information and email address" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsx(
          UpdateProfileInformation,
          {
            mustVerifyEmail,
            status
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Update Password" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Ensure your account is using a long, random password to stay secure" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsx(UpdatePasswordForm, {}) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-red-500 rounded-xl", children: /* @__PURE__ */ jsx(Trash2, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold text-red-900 dark:text-red-100", children: "Delete Account" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-red-700 dark:text-red-300", children: "Once your account is deleted, all of its resources and data will be permanently deleted" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsx(DeleteUserForm, {}) })
      ] })
    ] })
  ] });
}
export {
  Edit as default
};
