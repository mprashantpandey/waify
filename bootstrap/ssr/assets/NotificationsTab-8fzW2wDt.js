import { jsx, jsxs } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { Bell, Sparkles } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function NotificationsTab() {
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Notification Preferences" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Manage your notification settings" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 mb-4", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-10 w-10 text-blue-600 dark:text-blue-400" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Coming Soon" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto", children: "Notification settings will be available in a future update. You'll be able to customize email notifications, in-app alerts, and more." })
    ] }) })
  ] }) });
}
export {
  NotificationsTab as default
};
