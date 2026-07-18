import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Home } from "lucide-react";
import { B as BrandLogo } from "./BrandLogo-TeztHB0m.js";
import { B as Button } from "./Button-BJftGNki.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import "react";
import "clsx";
import "tailwind-merge";
const accentClasses = {
  green: {
    chip: "text-emerald-300",
    icon: "bg-emerald-500/12 text-emerald-200 ring-emerald-400/25",
    glow: "from-emerald-500/20"
  },
  amber: {
    chip: "text-amber-300",
    icon: "bg-amber-500/12 text-amber-200 ring-amber-400/25",
    glow: "from-amber-500/20"
  },
  red: {
    chip: "text-red-300",
    icon: "bg-red-500/12 text-red-200 ring-red-400/25",
    glow: "from-red-500/20"
  }
};
function appDashboardHref() {
  return typeof route !== "undefined" ? route("app.dashboard") : "/app/dashboard";
}
function defaultBackAction() {
  return {
    label: "Back",
    icon: ArrowLeft,
    onClick: () => window.history.back()
  };
}
function defaultDashboardAction() {
  return {
    label: "Dashboard",
    icon: Home,
    href: appDashboardHref()
  };
}
function ErrorFrame({
  code,
  title,
  description,
  icon: Icon,
  accent = "green",
  actions = [defaultBackAction(), defaultDashboardAction()]
}) {
  const tone = accentClasses[accent];
  return /* @__PURE__ */ jsxs("main", { className: "min-h-screen overflow-hidden bg-[#07111f] px-4 py-8 text-slate-100", children: [
    /* @__PURE__ */ jsx("div", { className: cn("pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b to-transparent blur-3xl", tone.glow) }),
    /* @__PURE__ */ jsx("div", { className: "relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center", children: /* @__PURE__ */ jsxs("section", { className: "w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-black/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 px-6 py-5", children: [
        /* @__PURE__ */ jsx(BrandLogo, { variant: "dark", imageClassName: "h-8", fallbackTextClassName: "text-white" }),
        /* @__PURE__ */ jsx("span", { className: cn("rounded-full border border-current/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", tone.chip), children: code })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_220px] md:items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: cn("inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1", tone.icon), children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("h1", { className: "mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl", children: title }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base", children: description }),
          /* @__PURE__ */ jsx("div", { className: "mt-7 flex flex-wrap gap-2", children: actions.map((action) => {
            const ActionIcon = action.icon;
            const button = /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: action.primary ? "primary" : "secondary",
                onClick: action.onClick,
                className: !action.primary ? "border-slate-700 bg-slate-800 text-slate-100 ring-slate-700 hover:bg-slate-700" : void 0,
                children: [
                  ActionIcon && /* @__PURE__ */ jsx(ActionIcon, { className: "h-4 w-4" }),
                  action.label
                ]
              }
            );
            return action.href ? /* @__PURE__ */ jsx(Link, { href: action.href, children: button }, action.label) : /* @__PURE__ */ jsx("span", { children: button }, action.label);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden rounded-2xl border border-slate-800 bg-[#0b1626] p-5 md:block", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-20 rounded-full bg-emerald-400/70" }),
            /* @__PURE__ */ jsx("div", { className: "h-2 w-32 rounded-full bg-slate-700" }),
            /* @__PURE__ */ jsx("div", { className: "h-2 w-24 rounded-full bg-slate-700" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-8 grid grid-cols-3 gap-2", children: Array.from({ length: 9 }).map((_, index) => /* @__PURE__ */ jsx("span", { className: cn("h-10 rounded-lg bg-slate-800", index === 4 && "bg-emerald-500/20 ring-1 ring-emerald-400/20") }, index)) })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  appDashboardHref,
  ErrorFrame as default,
  defaultBackAction,
  defaultDashboardAction
};
