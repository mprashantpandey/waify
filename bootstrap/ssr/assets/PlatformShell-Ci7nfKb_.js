import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { T as Topbar } from "./Topbar-B0L72tZm.js";
import { B as BrandingWrapper } from "./BrandingWrapper-BZp9WdA-.js";
import { T as Toaster, G as GlobalFlashHandler } from "./GlobalFlashHandler-yL6veGcD.js";
import { LayoutDashboard, Building2, Users, CreditCard, Puzzle, FileText, Wallet, LifeBuoy, BarChart3, Activity, Shield, AlertTriangle, Settings, X } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import { g as getPlatformName, a as getLogoUrl } from "../ssr.js";
function PlatformShell({ children, auth }) {
  const { branding, ziggy } = usePage().props;
  const platformName = getPlatformName(branding);
  const logoUrl = getLogoUrl(branding);
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
  const navigation = [
    {
      name: "Dashboard",
      href: route("platform.dashboard"),
      icon: LayoutDashboard
    },
    {
      name: "Tenants",
      href: route("platform.accounts.index"),
      icon: Building2
    },
    {
      name: "Users",
      href: route("platform.users.index"),
      icon: Users
    },
    {
      name: "Plans",
      href: route("platform.plans.index"),
      icon: CreditCard
    },
    {
      name: "Modules",
      href: route("platform.modules.index"),
      icon: Puzzle
    },
    {
      name: "Subscriptions",
      href: route("platform.subscriptions.index"),
      icon: FileText
    },
    {
      name: "Transactions",
      href: route("platform.transactions.index"),
      icon: Wallet
    },
    {
      name: "Support Desk",
      href: route("platform.support.index"),
      icon: LifeBuoy
    },
    {
      name: "Meta Pricing",
      href: route("platform.meta-pricing.index"),
      icon: Wallet
    },
    {
      name: "Analytics",
      href: route("platform.analytics"),
      icon: BarChart3
    },
    {
      name: "Templates",
      href: route("platform.templates.index"),
      icon: FileText
    },
    {
      name: "CMS Pages",
      href: route("platform.cms.index"),
      icon: FileText
    },
    {
      name: "Activity Logs",
      href: route("platform.activity-logs"),
      icon: Activity
    },
    {
      name: "System Health",
      href: route("platform.system-health"),
      icon: Shield
    },
    {
      name: "Operational Alerts",
      href: route("platform.operational-alerts.index"),
      icon: AlertTriangle
    },
    {
      name: "Settings",
      href: route("platform.settings"),
      icon: Settings
    }
  ];
  const sidebarContent = /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800", children: [
      logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-8 w-auto" }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", children: platformName })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSidebarOpen(false),
          className: "lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-gray-700 dark:text-gray-300" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-4 py-4 space-y-1", children: navigation.map((item) => {
      const Icon = item.icon;
      const isActive = currentRoute.startsWith(item.href);
      return /* @__PURE__ */ jsxs(
        Link,
        {
          href: item.href,
          className: cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          ),
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }),
            item.name
          ]
        },
        item.name
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-gray-200 dark:border-gray-800", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate", children: auth?.user?.name }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: auth?.user?.email })
      ] }) }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("profile.edit"),
          className: "mt-2 block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
          children: "Profile Settings"
        }
      )
    ] })
  ] });
  return /* @__PURE__ */ jsxs(BrandingWrapper, { children: [
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-950", children: [
      sidebarOpen && /* @__PURE__ */ jsx(
        "div",
        {
          className: "lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity",
          onClick: () => setSidebarOpen(false)
        }
      ),
      /* @__PURE__ */ jsx(
        "aside",
        {
          className: cn(
            "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          ),
          children: sidebarContent
        }
      ),
      /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800", children: sidebarContent }),
      /* @__PURE__ */ jsxs("div", { className: "lg:pl-64", children: [
        /* @__PURE__ */ jsx(
          Topbar,
          {
            user: auth?.user || null,
            onMenuClick: () => setSidebarOpen(!sidebarOpen)
          }
        ),
        /* @__PURE__ */ jsx("main", { className: "p-4 lg:p-6", children })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(GlobalFlashHandler, {})
  ] });
}
export {
  PlatformShell as P
};
