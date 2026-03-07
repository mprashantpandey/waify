import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { X, Code2, Megaphone, Activity, Users, Settings, LifeBuoy, CreditCard, BarChart3, Zap, Sparkles, Bot, Inbox, FileText, MessageCircle, Puzzle, LayoutDashboard, AlertCircle, User, ArrowRight } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import { g as getPlatformName, a as getLogoUrl } from "../ssr.js";
import { T as Topbar } from "./Topbar-B0L72tZm.js";
import { T as Toaster, G as GlobalFlashHandler } from "./GlobalFlashHandler-yL6veGcD.js";
import { B as BrandingWrapper } from "./BrandingWrapper-BZp9WdA-.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { A as Alert } from "./Alert-C-mQ6HNk.js";
import { C as CookieConsentBanner, A as AnalyticsScripts } from "./CookieConsentBanner-BJ5KL4CC.js";
const iconMap = {
  LayoutDashboard,
  Puzzle,
  MessageCircle,
  FileText,
  Inbox,
  Bot,
  Sparkles,
  Zap,
  BarChart3,
  CreditCard,
  LifeBuoy,
  Settings,
  Users,
  Activity,
  Megaphone,
  Code2
};
function Sidebar({ navigation, currentRoute, account, isOpen = false, onClose }) {
  const { branding } = usePage().props;
  const platformName = getPlatformName(branding);
  const logoUrl = getLogoUrl(branding);
  const groupedNav = navigation.reduce((acc, item) => {
    const group = item.group || "other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
  const groupOrder = ["core", "messaging", "automation", "ai", "growth", "billing", "developer", "other"];
  const navOrder = [
    "app.dashboard",
    "app.whatsapp.connections.index",
    "app.whatsapp.connections.create",
    "app.whatsapp.conversations.index",
    "app.whatsapp.templates.index",
    "app.chatbots",
    "app.broadcasts.index",
    "app.contacts.index",
    "app.analytics.index",
    "app.team.index",
    "app.ai.index",
    "app.ai",
    "app.billing.index",
    "app.billing.plans",
    "app.billing.history",
    "app.settings",
    "app.activity-logs"
  ];
  const navRank = new Map(navOrder.map((key, index) => [key, index]));
  const groupLabels = {
    core: "Core",
    messaging: "Messaging",
    automation: "Automation",
    ai: "AI",
    growth: "Growth",
    billing: "Billing",
    developer: "Developer"
  };
  const tryRouteHref = (routeName) => {
    try {
      return route(routeName, {});
    } catch (error) {
      return null;
    }
  };
  const resolveRouteHref = (routeName) => {
    const direct = tryRouteHref(routeName);
    if (direct) {
      return direct;
    }
    if (routeName.endsWith(".index")) {
      return tryRouteHref(routeName.slice(0, -".index".length));
    }
    return tryRouteHref(`${routeName}.index`);
  };
  const renderNavItem = (item, index) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;
    let href = "#";
    if (account) {
      const resolved = resolveRouteHref(item.href);
      if (!resolved) {
        return null;
      }
      href = resolved;
    } else {
      return null;
    }
    const isActive = currentRoute.includes(item.href.replace("app.", ""));
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href,
        className: cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
          isActive ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1"
        ),
        children: [
          /* @__PURE__ */ jsx(Icon, { className: cn(
            "h-5 w-5 transition-transform duration-200",
            isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
            !isActive && "group-hover:scale-110"
          ) }),
          /* @__PURE__ */ jsx("span", { className: cn(
            isActive ? "font-semibold" : "font-medium"
          ), children: item.label })
        ]
      },
      `${item.href}-${item.label}-${index}`
    );
  };
  const orderedGroups = [
    ...groupOrder.filter((g) => groupedNav[g]),
    ...Object.keys(groupedNav).filter((g) => !groupOrder.includes(g)).sort((a, b) => a.localeCompare(b))
  ];
  const sortNavItems = (items) => {
    return [...items].sort((a, b) => {
      const aRank = navRank.has(a.href) ? navRank.get(a.href) : Number.MAX_SAFE_INTEGER;
      const bRank = navRank.has(b.href) ? navRank.get(b.href) : Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) {
        return aRank - bRank;
      }
      return a.label.localeCompare(b.label);
    });
  };
  const sidebarContent = /* @__PURE__ */ jsx("nav", { className: "flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-8", children: orderedGroups.map((group) => {
    const items = sortNavItems(groupedNav[group] || []);
    const validItems = items.map(renderNavItem).filter((item) => item !== null);
    if (validItems.length === 0) {
      return null;
    }
    return /* @__PURE__ */ jsxs("div", { children: [
      groupLabels[group] && /* @__PURE__ */ jsx("h3", { className: "px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3", children: groupLabels[group] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: validItems })
    ] }, group);
  }).filter(Boolean) });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex h-dvh max-h-screen w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800", children: [
            logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-8 w-auto" }) : /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: platformName }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                "aria-label": "Close sidebar",
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-gray-700 dark:text-gray-300", "aria-hidden": true })
              }
            )
          ] }),
          sidebarContent
        ]
      }
    ),
    /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800", children: logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-8 w-auto" }) : /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: platformName }) }),
      sidebarContent
    ] })
  ] });
}
function ProfileIncompleteModal() {
  const { auth } = usePage().props;
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const user = auth?.user;
  const profileComplete = auth?.profile_complete ?? true;
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("profile_incomplete_dismissed") === "true";
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);
  useEffect(() => {
    if (profileComplete) {
      setDismissed(false);
      sessionStorage.removeItem("profile_incomplete_dismissed");
    }
    if (!profileComplete && !dismissed && user) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [profileComplete, dismissed, user]);
  const handleDismiss = () => {
    setDismissed(true);
    setIsOpen(false);
    sessionStorage.setItem("profile_incomplete_dismissed", "true");
  };
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  if (currentPath === "/profile" || currentPath.startsWith("/profile/") || currentPath.startsWith("/platform")) {
    return null;
  }
  if (!isOpen || profileComplete) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-white/20 rounded-lg", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "Complete Your Profile" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleDismiss,
          className: "p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5", "aria-hidden": true })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs(Alert, { variant: "warning", children: [
        /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-sm mb-1", children: "Profile Incomplete" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Please complete your profile to access all features. The following information is required:" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 pl-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full ${user?.name ? "bg-green-500" : "bg-red-500"}` }),
          /* @__PURE__ */ jsxs("span", { className: user?.name ? "text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-gray-100", children: [
            "Full Name ",
            user?.name ? "✓" : "(Required)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full ${user?.email ? "bg-green-500" : "bg-red-500"}` }),
          /* @__PURE__ */ jsxs("span", { className: user?.email ? "text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-gray-100", children: [
            "Email Address ",
            user?.email ? "✓" : "(Required)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full ${user?.phone ? "bg-green-500" : "bg-red-500"}` }),
          /* @__PURE__ */ jsxs("span", { className: user?.phone ? "text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-gray-100", children: [
            "Phone Number ",
            user?.phone ? "✓" : "(Required)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleDismiss,
          className: "text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
          children: "I'll do it later"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("profile.edit"),
          className: "flex items-center gap-2",
          children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg", children: [
            "Complete Profile",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
          ] })
        }
      )
    ] })
  ] }) });
}
function AppShell({ children }) {
  const { account, navigation, auth, ziggy } = usePage().props;
  const currentRoute = window.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentRoute]);
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
  return /* @__PURE__ */ jsx(BrandingWrapper, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950", children: [
    /* @__PURE__ */ jsx(
      Sidebar,
      {
        navigation: navigation || [],
        currentRoute,
        account,
        isOpen: sidebarOpen,
        onClose: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "lg:pl-72", children: [
      /* @__PURE__ */ jsx(
        Topbar,
        {
          user: auth?.user,
          onMenuClick: () => setSidebarOpen(!sidebarOpen)
        }
      ),
      /* @__PURE__ */ jsx("main", { className: "p-4 lg:p-6", children })
    ] }),
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(GlobalFlashHandler, {}),
    /* @__PURE__ */ jsx(ProfileIncompleteModal, {}),
    /* @__PURE__ */ jsx(CookieConsentBanner, {}),
    /* @__PURE__ */ jsx(AnalyticsScripts, {})
  ] }) });
}
export {
  AppShell as A
};
