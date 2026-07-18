import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { ShieldAlert } from "lucide-react";
import ErrorFrame, { defaultBackAction, defaultDashboardAction } from "./ErrorFrame-BFHludVa.js";
import "./BrandLogo-TeztHB0m.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./Button-BJftGNki.js";
function Forbidden() {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isApp = path.startsWith("/app");
  const actions = [
    defaultBackAction(),
    ...isApp ? [defaultDashboardAction()] : [],
    ...isApp && typeof route !== "undefined" ? [{ label: "Inbox", href: route("app.whatsapp.conversations.index") }] : []
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Access denied" }),
    /* @__PURE__ */ jsx(
      ErrorFrame,
      {
        code: "403",
        title: "Access denied",
        description: "You do not have permission to view this page in the current workspace.",
        icon: ShieldAlert,
        accent: "amber",
        actions
      }
    )
  ] });
}
export {
  Forbidden as default
};
