import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { RefreshCw, ArrowLeft, Home } from "lucide-react";
import { B as Button } from "./Button-ymbdH_NY.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function ServerError() {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isApp = path.startsWith("/app");
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4", children: [
    /* @__PURE__ */ jsx(Head, { title: "Something went wrong" }),
    /* @__PURE__ */ jsxs("div", { className: "text-center max-w-md", children: [
      /* @__PURE__ */ jsx("p", { className: "text-6xl font-bold text-gray-200 dark:text-gray-700", children: "500" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100", children: "Something went wrong" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: "We’re sorry, we couldn’t complete your request. Our team has been notified. Please try again in a moment." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex justify-center gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => window.location.reload(),
            variant: "primary",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2", "aria-hidden": true }),
              "Try again"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(Button, { onClick: () => window.history.back(), variant: "secondary", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2", "aria-hidden": true }),
          "Go back"
        ] }),
        isApp && typeof route !== "undefined" && /* @__PURE__ */ jsx(Link, { href: route("app.dashboard"), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
          /* @__PURE__ */ jsx(Home, { className: "h-4 w-4 mr-2", "aria-hidden": true }),
          "Dashboard"
        ] }) })
      ] })
    ] })
  ] });
}
export {
  ServerError as default
};
