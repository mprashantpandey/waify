import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useRef } from "react";
import { usePage, Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { Shield, Building2, Users, Layers, Puzzle, FileText, Tag, Send, Wallet, BarChart3, LifeBuoy, Bell, ClipboardList, History, ShieldCheck, Settings, X, ChevronRight, ChevronLeft, ArrowLeft, Menu, Activity, ChevronDown, UserRound, LogOut, Search, Loader2 } from "lucide-react";
import { B as BrandingWrapper, a as BrandLogo, T as ThemeToggle } from "./BrandingWrapper-CZn0jBQL.js";
import { A as Avatar } from "./Elements-EbyZDnT_.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { c as cn } from "./utils-B2ZNUmII.js";
const adminSections = [
  {
    label: "Platform",
    items: [
      { label: "Overview", routeName: "platform.dashboard", icon: Shield },
      { label: "Workspaces", routeName: "platform.accounts.index", icon: Building2, match: ["platform.accounts.show"] },
      { label: "Users", routeName: "platform.users.index", icon: Users },
      { label: "Plans", routeName: "platform.plans.index", icon: Layers },
      { label: "Modules", routeName: "platform.modules.index", icon: Puzzle }
    ]
  },
  {
    label: "Growth",
    items: [
      { label: "Subscriptions", routeName: "platform.subscriptions.index", icon: FileText },
      { label: "Discounts", routeName: "platform.discounts.index", icon: Tag },
      { label: "Email campaigns", routeName: "platform.email-campaigns.index", icon: Send },
      { label: "Transactions", routeName: "platform.transactions.index", icon: Wallet },
      { label: "Analytics", routeName: "platform.analytics", icon: BarChart3 }
    ]
  },
  {
    label: "Operations",
    items: [
      { label: "Support", routeName: "platform.support.index", icon: LifeBuoy, match: ["platform.support.show"] },
      { label: "Notifications", routeName: "platform.notifications.index", icon: Bell },
      { label: "Contact requests", routeName: "platform.contact-requests.index", icon: ClipboardList },
      { label: "Templates", routeName: "platform.templates.index", icon: FileText, match: ["platform.templates.show"] },
      { label: "Audit logs", routeName: "platform.activity-logs", icon: History },
      { label: "System health", routeName: "platform.system-health", icon: ShieldCheck }
    ]
  },
  {
    label: "System",
    items: [
      { label: "Settings", routeName: "platform.settings", icon: Settings }
    ]
  }
];
const routeMeta = {
  "platform.dashboard": { title: "Overview", subtitle: "Platform health, growth, and operational signals" },
  "platform.accounts.index": { title: "Workspaces", subtitle: "Tenant accounts, plans, status, and access" },
  "platform.users.index": { title: "Users", subtitle: "Platform users, roles, and impersonation access" },
  "platform.plans.index": { title: "Plans", subtitle: "Plan catalog, pricing, modules, and limits" },
  "platform.modules.index": { title: "Modules", subtitle: "Feature modules and workspace availability" },
  "platform.subscriptions.index": { title: "Subscriptions", subtitle: "Customer subscriptions and renewal status" },
  "platform.discounts.index": { title: "Discounts", subtitle: "Promo codes, offers, and Razorpay discount mapping" },
  "platform.email-campaigns.index": { title: "Email campaigns", subtitle: "Newsletter, promotion, and offer emails" },
  "platform.transactions.index": { title: "Transactions", subtitle: "Wallet ledger and billing payment records" },
  "platform.analytics": { title: "Analytics", subtitle: "System-wide usage and business reporting" },
  "platform.support.index": { title: "Support", subtitle: "Tenant support conversations and ticket operations" },
  "platform.notifications.index": { title: "Notifications", subtitle: "Platform alerts for webhooks, payments, automation, and WABA health" },
  "platform.contact-requests.index": { title: "Contact requests", subtitle: "Public contact form leads and follow-up status" },
  "platform.templates.index": { title: "Templates", subtitle: "Meta template oversight across workspaces" },
  "platform.activity-logs": { title: "Audit logs", subtitle: "System events and operational diagnostics" },
  "platform.system-health": { title: "System health", subtitle: "Infrastructure, queue, and integration readiness" },
  "platform.settings": { title: "Settings", subtitle: "Branding, payments, support, compliance, and infrastructure" }
};
function routeHref(routeName) {
  try {
    return route(routeName);
  } catch (error) {
    return "#";
  }
}
function routePath(routeName) {
  const href = routeHref(routeName);
  if (href === "#") return null;
  try {
    return new URL(href, window.location.origin).pathname;
  } catch (error) {
    return href;
  }
}
function isActiveRoute(item, currentPath) {
  const paths = [item.routeName, ...item.match || []].map(routePath).filter((path) => Boolean(path));
  return paths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`));
}
function currentMeta(currentPath) {
  const profilePath = routePath("profile.edit");
  if (profilePath && (currentPath === profilePath || currentPath.startsWith(`${profilePath}/`))) {
    return { title: "Profile", subtitle: "Manage your admin login and security" };
  }
  const matched = adminSections.flatMap((section) => section.items).find((item) => isActiveRoute(item, currentPath));
  return matched ? routeMeta[matched.routeName] || { title: matched.label, subtitle: "Platform operations" } : routeMeta["platform.dashboard"];
}
function AdminSidebar({
  currentPath,
  collapsed,
  mobileOpen,
  user,
  onClose,
  onToggle
}) {
  const effectiveCollapsed = collapsed;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    mobileOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40 bg-black/40 lg:hidden", onClick: onClose }),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-60 flex-shrink-0 flex-col bg-waify-sidebar text-white transition-transform duration-300 ease-out lg:relative lg:translate-x-0",
          effectiveCollapsed ? "lg:w-16" : "lg:w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: cn("flex h-16 items-center justify-between border-b border-white/5", effectiveCollapsed ? "px-3 lg:justify-center" : "px-5"), children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                BrandLogo,
                {
                  variant: "dark",
                  compact: effectiveCollapsed,
                  className: cn(effectiveCollapsed ? "lg:justify-center" : "max-w-[150px]"),
                  imageClassName: effectiveCollapsed ? "h-8 w-8 object-contain" : "max-h-9 w-auto object-contain",
                  fallbackTextClassName: "text-white"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: cn("min-w-0", effectiveCollapsed && "lg:hidden"), children: /* @__PURE__ */ jsx("div", { className: "truncate text-[10px] uppercase tracking-wider text-white/45", children: "Platform admin" }) })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 lg:hidden",
                "aria-label": "Close menu",
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onToggle,
              "aria-label": "Toggle sidebar",
              className: "keep-light absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-white text-waify-text shadow-pop ring-1 ring-gray-200 hover:bg-gray-50 lg:flex",
              children: effectiveCollapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
            }
          ),
          /* @__PURE__ */ jsx("nav", { className: cn("sidebar-scroll flex-1 overflow-y-auto py-4", effectiveCollapsed ? "px-2" : "px-3"), children: adminSections.map((section) => /* @__PURE__ */ jsxs("div", { className: section.label === "Platform" ? "" : "mt-4", children: [
            /* @__PURE__ */ jsx("div", { className: cn("mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-white/35", effectiveCollapsed && "lg:hidden"), children: section.label }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-0.5", children: section.items.map((item) => {
              const active = isActiveRoute(item, currentPath);
              const Icon = item.icon;
              return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                Link,
                {
                  href: routeHref(item.routeName),
                  onClick: onClose,
                  title: effectiveCollapsed ? item.label : void 0,
                  className: cn(
                    "group relative flex h-10 w-full items-center rounded-btn text-sm transition-all",
                    effectiveCollapsed ? "px-2 lg:justify-center" : "px-3",
                    active ? "bg-waify-green/15 font-semibold text-waify-green" : "text-white/70 hover:bg-white/5 hover:text-white"
                  ),
                  children: [
                    active && /* @__PURE__ */ jsx("span", { className: "absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-waify-green" }),
                    /* @__PURE__ */ jsx(Icon, { className: cn("h-[18px] w-[18px] flex-shrink-0", effectiveCollapsed ? "lg:mr-0 mr-3" : "mr-3") }),
                    /* @__PURE__ */ jsx("span", { className: cn("min-w-0 flex-1 truncate text-left", effectiveCollapsed && "lg:hidden"), children: item.label })
                  ]
                }
              ) }, item.routeName);
            }) })
          ] }, section.label)) }),
          /* @__PURE__ */ jsxs("div", { className: cn("border-t border-white/5 py-3", effectiveCollapsed ? "px-2" : "px-3"), children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: routeHref("app.dashboard"),
                className: cn("mb-2 flex w-full items-center gap-3 rounded-btn px-1.5 py-2 text-white/60 transition hover:bg-white/5 hover:text-white/90", effectiveCollapsed && "lg:justify-center"),
                children: [
                  /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 flex-shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: cn("min-w-0 flex-1 truncate text-left text-xs", effectiveCollapsed && "lg:hidden"), children: "Customer app" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: routeHref("profile.edit"),
                className: cn("flex w-full items-center gap-3 rounded-btn p-1.5 transition hover:bg-white/5", effectiveCollapsed && "lg:justify-center"),
                title: effectiveCollapsed ? "Profile" : void 0,
                children: [
                  /* @__PURE__ */ jsx(Avatar, { name: user?.name || "Ops Admin", size: "sm" }),
                  /* @__PURE__ */ jsxs("div", { className: cn("min-w-0 flex-1 text-left", effectiveCollapsed && "lg:hidden"), children: [
                    /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium text-white", children: user?.name || "Ops Admin" }),
                    /* @__PURE__ */ jsx("div", { className: "truncate text-[11px] text-white/50", children: "Super admin" })
                  ] })
                ]
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function AdminHeader({
  title,
  subtitle,
  user,
  onMobileMenuClick
}) {
  const { flash, notification_summary } = usePage().props;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifications = [
    flash?.success ? { tone: "success", title: flash.success, time: "Now" } : null,
    flash?.warning ? { tone: "warning", title: flash.warning, time: "Now" } : null,
    flash?.error ? { tone: "danger", title: flash.error, time: "Now" } : null,
    flash?.info ? { tone: "info", title: flash.info, time: "Now" } : null,
    ...(notification_summary?.latest || []).map((item) => ({
      tone: item.severity === "critical" ? "danger" : item.severity === "warning" ? "warning" : item.severity === "success" ? "success" : "info",
      title: item.title,
      body: item.body,
      time: item.created_at ? new Date(item.created_at).toLocaleString() : "",
      href: item.action_url || routeHref("platform.notifications.index")
    }))
  ].filter(Boolean);
  const unreadNotifications = Number(notification_summary?.unread || 0);
  const signOutHref = routeHref("logout");
  return /* @__PURE__ */ jsxs("header", { className: "app-header z-30 flex h-16 flex-shrink-0 items-center gap-2 border-b border-waify-border bg-white px-4 dark:border-slate-700 dark:bg-slate-900 sm:gap-4 sm:px-6", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onMobileMenuClick,
        "aria-label": "Open menu",
        className: "flex h-9 w-9 items-center justify-center rounded-md text-waify-text hover:bg-gray-100 dark:text-waify-dark-text dark:hover:bg-slate-800 lg:hidden",
        children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 lg:flex-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "truncate text-base font-semibold text-waify-text dark:text-waify-dark-text sm:text-lg", children: title }),
        /* @__PURE__ */ jsx(Badge, { variant: "info", className: "hidden flex-shrink-0 sm:inline-flex", children: "Ops" })
      ] }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "mt-0.5 hidden truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted sm:block", children: subtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto hidden max-w-xl flex-1 md:block", children: /* @__PURE__ */ jsx(PlatformGlobalSearch, {}) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 md:hidden" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 items-center gap-1 sm:gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", "data-popover": true, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setNotificationsOpen((value) => !value);
              setUserOpen(false);
            },
            className: "relative flex h-10 w-10 items-center justify-center rounded-btn text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800",
            "aria-label": "Notifications",
            children: [
              /* @__PURE__ */ jsx(Bell, { className: "h-[18px] w-[18px]" }),
              unreadNotifications > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-900", children: unreadNotifications > 99 ? "99+" : unreadNotifications })
            ]
          }
        ),
        notificationsOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-700", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Ops alerts" }),
            /* @__PURE__ */ jsx(Link, { href: routeHref("platform.notifications.index"), className: "text-xs font-semibold text-waify-green-dark hover:underline dark:text-emerald-300", children: "View all" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "max-h-72 overflow-y-auto", children: notifications.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-4 py-6 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No new alerts." }) : notifications.map((notification, index) => /* @__PURE__ */ jsxs(Link, { href: notification.href || routeHref("platform.notifications.index"), className: "flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-[18px] w-[18px] flex-shrink-0 text-waify-green" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text dark:text-waify-dark-text", children: notification.title }),
              notification.body && /* @__PURE__ */ jsx("p", { className: "mt-0.5 line-clamp-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: notification.body }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: notification.time })
            ] })
          ] }, `${notification.title}-${index}`)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(ThemeToggle, {}),
      /* @__PURE__ */ jsxs("div", { className: "relative", "data-popover": true, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setUserOpen((value) => !value);
              setNotificationsOpen(false);
            },
            className: "flex items-center gap-2 rounded-btn p-1 hover:bg-gray-100 dark:hover:bg-slate-800 sm:pr-2",
            children: [
              /* @__PURE__ */ jsx(Avatar, { name: user?.name || "Ops Admin", size: "sm" }),
              /* @__PURE__ */ jsx(ChevronDown, { className: "hidden h-3.5 w-3.5 text-gray-400 sm:block" })
            ]
          }
        ),
        userOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 px-4 py-3 dark:border-slate-700", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: user?.name || "Ops Admin" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: user?.email || "ops@waify.io" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "py-1", children: [
            /* @__PURE__ */ jsxs(Link, { href: routeHref("profile.edit"), className: "flex w-full items-center gap-3 px-4 py-2 text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
              " Profile & password"
            ] }),
            /* @__PURE__ */ jsxs(Link, { href: routeHref("platform.plans.index"), className: "flex w-full items-center gap-3 px-4 py-2 text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4" }),
              " Plans"
            ] }),
            /* @__PURE__ */ jsxs(Link, { href: routeHref("platform.settings"), className: "flex w-full items-center gap-3 px-4 py-2 text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
              " Settings"
            ] }),
            /* @__PURE__ */ jsxs(Link, { href: routeHref("app.dashboard"), className: "flex w-full items-center gap-3 px-4 py-2 text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              " Customer app"
            ] })
          ] }),
          signOutHref !== "#" && /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 py-1 dark:border-slate-700", children: /* @__PURE__ */ jsxs(Link, { href: signOutHref, method: "post", as: "button", className: "flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30", children: [
            /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
            " Sign out"
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
function PlatformGlobalSearch() {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    if (!open) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(route("platform.search"), {
          params: { q: query, limit: 8 },
          signal: controller.signal,
          headers: { Accept: "application/json" }
        });
        setResults(response.data?.results || []);
      } catch (error) {
        if (error?.code !== "ERR_CANCELED" && error?.name !== "CanceledError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, query.trim().length >= 2 ? 180 : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);
  const visit = (href) => {
    setOpen(false);
    router.visit(href);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative transition-all focus-within:scale-[1.01]", children: [
    /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        value: query,
        placeholder: "Search workspaces, users, audit logs...",
        onClick: () => setOpen(true),
        onChange: (event) => {
          setQuery(event.target.value);
          setOpen(true);
        },
        className: "h-10 w-full rounded-btn border border-transparent bg-gray-50 pl-10 pr-16 text-sm outline-none transition placeholder:text-gray-400 focus:border-waify-green focus:bg-white focus:ring-2 focus:ring-waify-green/15 dark:bg-slate-800 dark:text-waify-dark-text dark:focus:bg-slate-900"
      }
    ),
    /* @__PURE__ */ jsx("kbd", { className: "absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-slate-700 dark:bg-slate-900 sm:flex", children: "Ctrl K" }),
    open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxs("div", { className: "absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-4 py-2 dark:border-slate-700", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Platform search" }),
          loading && /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin text-waify-green" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-[60vh] overflow-y-auto py-1", children: results.length > 0 ? results.map((result) => {
          const Icon = platformResultIcon(result.type);
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onMouseDown: (event) => event.preventDefault(),
              onClick: () => visit(result.href),
              className: "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-slate-800",
              children: [
                /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: result.label }),
                  result.description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: result.description }),
                  /* @__PURE__ */ jsx("span", { className: "mt-1 block text-[10px] font-medium uppercase tracking-wider text-waify-green-dark dark:text-emerald-300", children: result.type.replace("_", " ") })
                ] })
              ]
            },
            `${result.type}-${result.id}`
          );
        }) : /* @__PURE__ */ jsxs("div", { className: "px-4 py-8 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: query.trim().length >= 2 ? "No matching results" : "Search platform data" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: query.trim().length >= 2 ? "Try a workspace, user email, plan, subscription, or ticket." : "Type at least two characters, or choose a common page." })
        ] }) })
      ] })
    ] })
  ] });
}
function platformResultIcon(type) {
  switch (type) {
    case "workspace":
      return Building2;
    case "user":
      return Users;
    case "plan":
      return Layers;
    case "subscription":
      return FileText;
    case "transaction":
      return Wallet;
    case "template":
      return FileText;
    case "support":
      return LifeBuoy;
    case "module":
      return Puzzle;
    default:
      return Search;
  }
}
function PlatformShell({ children, auth: authProp }) {
  const { auth, ziggy } = usePage().props;
  const user = authProp?.user || auth?.user || null;
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentPath]);
  useEffect(() => {
    if (ziggy) {
      window.Ziggy = ziggy;
    }
  }, [ziggy]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const meta = useMemo(() => currentMeta(currentPath), [currentPath]);
  return /* @__PURE__ */ jsxs(BrandingWrapper, { children: [
    /* @__PURE__ */ jsxs(Head, { children: [
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" }),
      /* @__PURE__ */ jsx("link", { href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap", rel: "stylesheet" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex h-screen overflow-hidden bg-waify-bg text-waify-text dark:bg-slate-950 dark:text-waify-dark-text", children: [
      /* @__PURE__ */ jsx(
        AdminSidebar,
        {
          currentPath,
          collapsed: sidebarCollapsed,
          mobileOpen: sidebarOpen,
          user,
          onClose: () => setSidebarOpen(false),
          onToggle: () => setSidebarCollapsed((value) => !value)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
        /* @__PURE__ */ jsx(
          AdminHeader,
          {
            title: meta.title,
            subtitle: meta.subtitle,
            user,
            onMobileMenuClick: () => setSidebarOpen(true)
          }
        ),
        /* @__PURE__ */ jsx("main", { className: "waify-scrollbar flex-1 overflow-y-auto p-4 lg:p-6", children })
      ] })
    ] })
  ] });
}
export {
  PlatformShell as P
};
