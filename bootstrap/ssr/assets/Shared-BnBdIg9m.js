import { jsxs, jsx } from "react/jsx-runtime";
import { router } from "@inertiajs/react";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { P as PageHeader, T as ThemedIconTile, S as StatusBadge } from "./Elements-EbyZDnT_.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "@headlessui/react";
import "lucide-react";
function ServerListControls({
  routeName,
  filters = {},
  pagination,
  searchPlaceholder = "Search",
  children
}) {
  const apply = (next) => {
    router.get(route(routeName), { ...filters, ...next, page: 1 }, { preserveState: true, preserveScroll: true, replace: true });
  };
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-3 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          defaultValue: filters.q || "",
          placeholder: searchPlaceholder,
          className: "sm:max-w-sm",
          onKeyDown: (event) => {
            if (event.key === "Enter") {
              apply({ q: event.currentTarget.value });
            }
          },
          onBlur: (event) => apply({ q: event.currentTarget.value })
        }
      ),
      children
    ] }),
    pagination && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted lg:justify-end", children: [
      /* @__PURE__ */ jsx("span", { children: pagination.total > 0 ? `${pagination.from}-${pagination.to} of ${pagination.total}` : "0 results" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            size: "sm",
            variant: "secondary",
            disabled: !pagination.prev_page_url,
            onClick: () => pagination.prev_page_url && router.visit(pagination.prev_page_url, { preserveState: true, preserveScroll: true }),
            children: "Prev"
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "min-w-16 text-center text-xs font-medium", children: [
          pagination.current_page,
          "/",
          pagination.last_page
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            size: "sm",
            variant: "secondary",
            disabled: !pagination.next_page_url,
            onClick: () => pagination.next_page_url && router.visit(pagination.next_page_url, { preserveState: true, preserveScroll: true }),
            children: "Next"
          }
        )
      ] })
    ] })
  ] }) });
}
function AddonPage({
  title,
  description,
  actions,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title, description, actions }),
    children
  ] });
}
function StatGrid({
  stats
}) {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", children: stats.map((stat) => {
    const Icon = stat.icon;
    return /* @__PURE__ */ jsx(Card, { className: "border-gray-200/80 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text-muted dark:text-waify-dark-text-muted", children: stat.label }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text", children: stat.value }),
        stat.hint && /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: stat.hint })
      ] }),
      /* @__PURE__ */ jsx(ThemedIconTile, { tone: stat.tone || "green", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) })
    ] }) }) }, stat.label);
  }) });
}
function EmptyPanel({
  title,
  description,
  action
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-dashed border-gray-200 bg-white p-8 text-center dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description }),
    action && /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-center", children: action })
  ] });
}
function MiniStatus({ status }) {
  const value = typeof status === "boolean" ? status ? "connected" : "draft" : String(status || "draft");
  const tone = value === "connected" || value === "active" || value === "confirmed" || value === "healthy" ? "success" : value === "pending" || value === "draft" ? "warning" : value === "lost" || value === "failed" ? "danger" : "info";
  return /* @__PURE__ */ jsx(StatusBadge, { tone, dot: true, children: value.replace(/_/g, " ") });
}
function ActionButton({ children, ...props }) {
  return /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", ...props, children });
}
export {
  ActionButton,
  AddonPage,
  EmptyPanel,
  MiniStatus,
  ServerListControls,
  StatGrid
};
