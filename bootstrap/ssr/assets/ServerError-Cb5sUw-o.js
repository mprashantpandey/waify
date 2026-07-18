import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { RefreshCw, ServerCrash } from "lucide-react";
import ErrorFrame, { defaultBackAction, defaultDashboardAction } from "./ErrorFrame-BFHludVa.js";
import "./BrandLogo-TeztHB0m.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./Button-BJftGNki.js";
function ServerError() {
  const isApp = typeof window !== "undefined" && window.location.pathname.startsWith("/app");
  const actions = [
    { label: "Retry", icon: RefreshCw, onClick: () => window.location.reload(), primary: true },
    defaultBackAction(),
    ...isApp ? [defaultDashboardAction()] : []
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Something went wrong" }),
    /* @__PURE__ */ jsx(
      ErrorFrame,
      {
        code: "500",
        title: "Something went wrong",
        description: "The request failed on the server. Retry once; if it continues, check System Health or recent logs.",
        icon: ServerCrash,
        accent: "red",
        actions
      }
    )
  ] });
}
export {
  ServerError as default
};
