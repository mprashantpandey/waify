import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, d as CardDescription } from "./Card-8uw03vLH.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { Head, Link } from "@inertiajs/react";
import { Plus, Sparkles, Activity } from "lucide-react";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "axios";
import "laravel-echo";
import "pusher-js";
function FloatersIndex({
  workspace,
  widgets,
  stats
}) {
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Floaters & Widgets" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: "Floaters & Widgets" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Build a WhatsApp chat bubble to capture leads and start conversations." })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("app.floaters.create", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/40", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "New Widget"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3", children: [
        { label: "Impressions", value: stats.impressions },
        { label: "Clicks", value: stats.clicks },
        { label: "Leads", value: stats.leads }
      ].map((item) => /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-sm", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-gray-500", children: item.label }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: item.value }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-400", children: "Last 30 days" })
      ] }) }, item.label)) }),
      widgets.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-14 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-7 w-7 text-emerald-600 dark:text-emerald-300" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Create your first widget" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-500 dark:text-gray-400", children: "Add a WhatsApp bubble to any website and track engagement." }),
        /* @__PURE__ */ jsx(Link, { href: route("app.floaters.create", { workspace: workspace.slug }), className: "inline-flex mt-6", children: /* @__PURE__ */ jsx(Button, { className: "bg-emerald-600 hover:bg-emerald-700 text-white", children: "Create Widget" }) })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-6 lg:grid-cols-2", children: widgets.map((widget) => /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "border-b border-gray-100 dark:border-gray-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: widget.name }),
            /* @__PURE__ */ jsx(CardDescription, { children: widget.whatsapp_phone || "No WhatsApp number set" })
          ] }),
          /* @__PURE__ */ jsx(Badge, { variant: widget.is_active ? "success" : "default", children: widget.is_active ? "Active" : "Paused" })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm text-gray-500", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
            "Position: ",
            widget.position.replace("-", " ")
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-xs text-gray-500", children: [
            "Embed: ",
            /* @__PURE__ */ jsxs("code", { className: "break-all", children: [
              "/widgets/",
              widget.public_id,
              ".js"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.floaters.edit", { workspace: workspace.slug, widget: widget.slug || widget.id }), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", children: "Manage" }) }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                onClick: () => navigator.clipboard.writeText(`${window.location.origin}/widgets/${widget.public_id}.js`),
                children: "Copy Script URL"
              }
            )
          ] })
        ] })
      ] }, widget.id)) })
    ] })
  ] });
}
export {
  FloatersIndex as default
};
