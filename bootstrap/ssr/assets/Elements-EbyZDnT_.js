import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useRef } from "react";
import { Transition, TransitionChild } from "@headlessui/react";
import { X, CloudUpload, Check, FileText, Search, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import "./Button-BJftGNki.js";
const toneClasses = {
  default: "bg-gray-100 text-gray-800 ring-gray-200 dark:bg-slate-700/70 dark:text-slate-100 dark:ring-slate-500/30",
  success: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-400/25",
  warning: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:ring-amber-400/25",
  danger: "bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/20 dark:text-red-100 dark:ring-red-400/25",
  info: "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-100 dark:ring-sky-400/25",
  muted: "bg-gray-50 text-waify-text-muted ring-gray-200 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:ring-waify-dark-border"
};
function Avatar({
  name,
  src,
  size = "md",
  status,
  className
}) {
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
    "2xl": "h-20 w-20 text-2xl"
  };
  const initials = (name || "U").split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
  const statusClasses = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    offline: "bg-gray-300 dark:bg-waify-dark-text-muted"
  };
  return /* @__PURE__ */ jsxs("span", { className: "relative inline-flex shrink-0", children: [
    /* @__PURE__ */ jsx("span", { className: cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-waify-green font-semibold text-white ring-2 ring-white dark:ring-waify-dark-bg", sizes[size], className), children: src ? /* @__PURE__ */ jsx("img", { src, alt: name || "Avatar", className: "h-full w-full object-cover" }) : initials }),
    status && /* @__PURE__ */ jsx("span", { className: cn("absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-waify-dark-bg", statusClasses[status]) })
  ] });
}
function IconButton({
  className,
  variant = "ghost",
  size = "md",
  ...props
}) {
  const variants = {
    ghost: "text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text",
    outline: "border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2",
    primary: "bg-waify-green text-waify-ink hover:bg-waify-green-dark hover:text-white",
    danger: "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
  };
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-11 w-11"
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: cn("inline-flex items-center justify-center rounded-btn transition focus:outline-none focus:ring-2 focus:ring-waify-green/25 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className),
      ...props
    }
  );
}
function StatusBadge({
  tone = "default",
  dot = false,
  className,
  children
}) {
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", toneClasses[tone], className), children: [
    dot && /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-current" }),
    children
  ] });
}
function ThemedIconTile({
  tone = "green",
  size = "md",
  className,
  children
}) {
  const tones = {
    green: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-400/20",
    blue: "bg-sky-100 text-sky-700 ring-1 ring-sky-200/70 dark:bg-sky-500/20 dark:text-sky-100 dark:ring-sky-400/20",
    amber: "bg-amber-100 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-500/20 dark:text-amber-100 dark:ring-amber-400/20",
    purple: "bg-purple-100 text-purple-700 ring-1 ring-purple-200/70 dark:bg-purple-500/20 dark:text-purple-100 dark:ring-purple-400/20",
    pink: "bg-pink-100 text-pink-700 ring-1 ring-pink-200/70 dark:bg-pink-500/20 dark:text-pink-100 dark:ring-pink-400/20",
    red: "bg-red-100 text-red-700 ring-1 ring-red-200/70 dark:bg-red-500/20 dark:text-red-100 dark:ring-red-400/20",
    gray: "bg-gray-100 text-gray-700 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text"
  };
  const sizes = {
    sm: "h-8 w-8 rounded-md",
    md: "h-10 w-10 rounded-lg",
    lg: "h-11 w-11 rounded-xl"
  };
  return /* @__PURE__ */ jsx("span", { className: cn("inline-flex shrink-0 items-center justify-center", tones[tone], sizes[size], className), children });
}
function TagPill({
  className,
  children,
  onRemove,
  tone = "default"
}) {
  const colors = {
    default: "bg-white text-waify-text ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border",
    success: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-400/25",
    warning: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:ring-amber-400/25",
    danger: "bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/20 dark:text-red-100 dark:ring-red-400/25",
    info: "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-100 dark:ring-sky-400/25",
    muted: "bg-gray-50 text-waify-text-muted ring-gray-200 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:ring-waify-dark-border"
  };
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", colors[tone], className), children: [
    children,
    onRemove && /* @__PURE__ */ jsx("button", { type: "button", onClick: onRemove, className: "rounded-full text-waify-text-muted hover:text-red-500", "aria-label": "Remove tag", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
  ] });
}
function TrendBadge({
  value,
  direction = "up",
  className
}) {
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  const tone = direction === "up" ? "success" : direction === "down" ? "danger" : "muted";
  return /* @__PURE__ */ jsxs(StatusBadge, { tone, className: cn("gap-1 px-2 py-0.5", className), children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
    value
  ] });
}
function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      eyebrow && /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs font-semibold uppercase tracking-wider text-waify-green-dark dark:text-emerald-300", children: eyebrow }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-3xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 flex-wrap items-center gap-2", children: actions })
  ] });
}
function Toolbar({
  search,
  filters,
  actions,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none md:flex-row md:items-center md:justify-between", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-3 sm:flex-row sm:items-center", children: [
      search && /* @__PURE__ */ jsxs("label", { className: "relative block min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: search.value,
            onChange: (event) => search.onChange(event.target.value),
            placeholder: search.placeholder || "Search",
            className: "waify-input pl-9"
          }
        )
      ] }),
      filters && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2", children: filters })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions })
  ] });
}
function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className
}) {
  return /* @__PURE__ */ jsx(Transition, { show: open, as: Fragment, children: /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[250] overflow-y-auto", children: [
    /* @__PURE__ */ jsx(TransitionChild, { as: Fragment, enter: "ease-out duration-200", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-150", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: /* @__PURE__ */ jsx("button", { type: "button", className: "fixed inset-0 bg-waify-ink/45 backdrop-blur-sm dark:bg-black/70", onClick: onClose, "aria-label": "Close modal" }) }),
    /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: /* @__PURE__ */ jsx(TransitionChild, { as: Fragment, enter: "ease-out duration-200", enterFrom: "opacity-0 translate-y-3 scale-95", enterTo: "opacity-100 translate-y-0 scale-100", leave: "ease-in duration-150", leaveFrom: "opacity-100 translate-y-0 scale-100", leaveTo: "opacity-0 translate-y-3 scale-95", children: /* @__PURE__ */ jsxs("section", { className: cn("relative w-full max-w-lg overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", className), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
          description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
        ] }),
        /* @__PURE__ */ jsx(IconButton, { size: "sm", onClick: onClose, "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-5 py-4", children }),
      footer && /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70", children: footer })
    ] }) }) })
  ] }) });
}
function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  className
}) {
  const defaultWidthClass = className ? "" : "sm:max-w-md";
  return /* @__PURE__ */ jsx(Transition, { show: open, as: Fragment, children: /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[250] overflow-hidden", children: [
    /* @__PURE__ */ jsx(TransitionChild, { as: Fragment, enter: "ease-out duration-200", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-150", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: /* @__PURE__ */ jsx("button", { type: "button", className: "fixed inset-0 bg-waify-ink/45 backdrop-blur-sm dark:bg-black/70", onClick: onClose, "aria-label": "Close drawer" }) }),
    /* @__PURE__ */ jsx("div", { className: cn("fixed inset-y-0 flex max-w-full", side === "right" ? "right-0 pl-0 sm:pl-10" : "left-0 pr-0 sm:pr-10"), children: /* @__PURE__ */ jsx(TransitionChild, { as: Fragment, enter: "transform transition ease-out duration-200", enterFrom: side === "right" ? "translate-x-full" : "-translate-x-full", enterTo: "translate-x-0", leave: "transform transition ease-in duration-150", leaveFrom: "translate-x-0", leaveTo: side === "right" ? "translate-x-full" : "-translate-x-full", children: /* @__PURE__ */ jsxs("section", { className: cn("flex h-full w-screen max-w-[100vw] flex-col border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", defaultWidthClass, side === "right" ? "border-l" : "border-r", className), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 dark:border-waify-dark-border sm:px-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("h2", { className: "break-words text-base font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
          description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
        ] }),
        /* @__PURE__ */ jsx(IconButton, { size: "sm", onClick: onClose, "aria-label": "Close", className: "shrink-0", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-4 py-4 waify-scrollbar sm:px-5", children }),
      footer && /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 bg-gray-50/70 px-4 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70 sm:px-5", children: footer })
    ] }) }) })
  ] }) });
}
function FileDropzone({
  label = "Upload file",
  description = "Drag and drop a file here, or click to browse.",
  accept,
  onFile,
  className
}) {
  const inputRef = useRef(null);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: () => inputRef.current?.click(),
      onDragOver: (event) => event.preventDefault(),
      onDrop: (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
          onFile?.(file);
        }
      },
      className: cn("flex w-full flex-col items-center justify-center rounded-card border border-dashed border-gray-300 bg-gray-50/70 px-5 py-8 text-center transition hover:border-waify-green hover:bg-waify-green-soft/60 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/50 dark:hover:bg-waify-dark-green-soft", className),
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            type: "file",
            accept,
            className: "hidden",
            onChange: (event) => {
              const file = event.target.files?.[0];
              if (file) {
                onFile?.(file);
              }
            }
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "flex h-11 w-11 items-center justify-center rounded-full bg-white text-waify-green-dark shadow-sm dark:bg-waify-dark-surface dark:text-emerald-200", children: /* @__PURE__ */ jsx(CloudUpload, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("span", { className: "mt-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: label }),
        /* @__PURE__ */ jsx("span", { className: "mt-1 max-w-sm text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
      ]
    }
  );
}
function UploadedFileRow({
  name,
  meta,
  progress,
  status = "uploading",
  onRemove,
  className
}) {
  const done = status === "done";
  const error = status === "error";
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "flex items-center gap-3 rounded-btn p-3",
    done ? "bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/12 dark:ring-emerald-500/20" : error ? "bg-red-50 ring-1 ring-red-100 dark:bg-red-500/12 dark:ring-red-500/20" : "bg-gray-50 dark:bg-waify-dark-surface-2",
    className
  ), children: [
    /* @__PURE__ */ jsx("div", { className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", done ? "bg-white text-emerald-500 dark:bg-waify-dark-surface" : error ? "bg-white text-red-500 dark:bg-waify-dark-surface" : "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-200"), children: done ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium text-waify-text dark:text-waify-dark-text", children: name }),
        onRemove && /* @__PURE__ */ jsx("button", { type: "button", onClick: onRemove, className: "text-gray-400 transition hover:text-red-600 dark:hover:text-red-300", "aria-label": "Remove file", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      typeof progress === "number" && !done && /* @__PURE__ */ jsx("div", { className: "mt-1 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-waify-dark-border", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-waify-green", style: { width: `${Math.max(0, Math.min(progress, 100))}%` } }) }),
      meta && /* @__PURE__ */ jsx("div", { className: "mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: meta })
    ] })
  ] });
}
export {
  Avatar as A,
  Drawer as D,
  FileDropzone as F,
  IconButton as I,
  Modal as M,
  PageHeader as P,
  StatusBadge as S,
  ThemedIconTile as T,
  UploadedFileRow as U,
  Toolbar as a,
  TagPill as b,
  TrendBadge as c
};
