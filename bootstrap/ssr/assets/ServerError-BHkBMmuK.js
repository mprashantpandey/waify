import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { ServerCrash, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function ServerError() {
  const isApp = typeof window !== "undefined" && window.location.pathname.startsWith("/app");
  const dashboardHref = typeof route !== "undefined" ? route("app.dashboard") : "/app/dashboard";
  return /* @__PURE__ */ jsxs("main", { className: "min-h-screen bg-waify-bg px-4 py-8 text-waify-text dark:bg-waify-dark-bg dark:text-waify-dark-text", children: [
    /* @__PURE__ */ jsx(Head, { title: "Something went wrong" }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center", children: /* @__PURE__ */ jsxs("section", { className: "w-full rounded-card border border-gray-100 bg-white p-6 shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface sm:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-200", children: /* @__PURE__ */ jsx(ServerCrash, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-300", children: "500" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-semibold", children: "Something went wrong" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "The request failed on the server. Retry once; if it continues, check System Health or recent logs." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => window.location.reload(), children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
          "Retry"
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => window.history.back(), children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back"
        ] }),
        isApp && /* @__PURE__ */ jsx(Link, { href: dashboardHref, children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
          /* @__PURE__ */ jsx(Home, { className: "h-4 w-4" }),
          "Dashboard"
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  ServerError as default
};
