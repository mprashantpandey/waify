import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { u as useTabs, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./Tabs-Dz-4gKmC.js";
import { User, Shield, Bell, Inbox, CreditCard, CheckCircle2, AlertTriangle } from "lucide-react";
import ProfileTab from "./ProfileTab-x30N5XOU.js";
import BillingTab from "./BillingTab-3gJWPN4s.js";
import SecurityTab from "./SecurityTab-CVgdeYGP.js";
import NotificationsTab from "./NotificationsTab-BJqkB-B2.js";
import InboxTab from "./InboxTab-3DPj9tzg.js";
import { usePage, Head } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./Badge-CHx1ViYT.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./Button-ymbdH_NY.js";
import "./Alert-C-mQ6HNk.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./TextInput-Dl1_GoEA.js";
import "./InputLabel-CE_n4Upz.js";
import "./InputError-DiSBWiye.js";
import "./useNotifications-DZIlU05F.js";
import "./useConfirm-BKf7Nv1N.js";
import "qrcode";
function getInitialTab(validIds, fallback) {
  if (typeof window === "undefined") return fallback;
  const fromQuery = new URLSearchParams(window.location.search).get("tab") || "";
  return validIds.includes(fromQuery) ? fromQuery : fallback;
}
function SettingsIndex() {
  const { props } = usePage();
  const tabs = [
    { id: "profile", label: "Profile", icon: User, description: "Account identity, email, phone, and phone verification.", component: /* @__PURE__ */ jsx(ProfileTab, {}) },
    { id: "security", label: "Security", icon: Shield, description: "Password, sessions, email verification, and 2FA.", component: /* @__PURE__ */ jsx(SecurityTab, {}) },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Personal alerts for assignments, mentions, and sounds.", component: /* @__PURE__ */ jsx(NotificationsTab, {}) },
    { id: "inbox", label: "Inbox", icon: Inbox, description: "Tenant inbox routing and auto-assignment settings.", component: /* @__PURE__ */ jsx(InboxTab, {}) },
    { id: "billing", label: "Billing", icon: CreditCard, description: "Subscription, usage, payment history, and transactions.", component: /* @__PURE__ */ jsx(BillingTab, {}) }
  ];
  const tabIds = tabs.map((t) => t.id);
  const { value: activeTab, setValue: setActiveTab } = useTabs(getInitialTab(tabIds, "profile"));
  const activeTabDef = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const ActiveIcon = activeTabDef.icon;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("tab") === activeTab) return;
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);
  const quickChecks = useMemo(() => {
    const authUser = props.auth?.user;
    const account = props.account;
    return [
      {
        label: "Email",
        ok: Boolean(props.emailVerified),
        value: props.emailVerified ? "Verified" : "Pending verification"
      },
      {
        label: "Phone",
        ok: !account?.phone_verification_required || Boolean(authUser?.phone_verified_at),
        value: account?.phone_verification_required ? authUser?.phone_verified_at ? "Verified (required)" : "Verification required" : authUser?.phone_verified_at ? "Verified" : "Optional"
      },
      {
        label: "2FA",
        ok: Boolean(props.twoFactor?.enabled),
        value: props.twoFactor?.enabled ? "Enabled" : props.securityPolicy?.require_2fa ? "Required by policy" : "Not enabled"
      }
    ];
  }, [props]);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-sm", children: /* @__PURE__ */ jsx(CardContent, { className: "p-5 sm:p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100", children: "Settings" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Manage your account profile, security, notifications, inbox routing, and billing access." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-0 lg:max-w-[560px]", children: quickChecks.map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
            item.ok ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-green-600" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5 text-amber-600" }),
            item.label
          ] }),
          /* @__PURE__ */ jsx("div", { className: `mt-1 text-sm font-semibold ${item.ok ? "text-gray-900 dark:text-gray-100" : "text-amber-700 dark:text-amber-300"}`, children: item.value })
        ] }, item.label)) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Tabs, { value: activeTab, onValueChange: setActiveTab, children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start", children: [
        /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-sm xl:sticky xl:top-20", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsx("div", { className: "xl:hidden", children: /* @__PURE__ */ jsx(TabsList, { className: "w-full h-auto justify-start gap-2 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap", children: tabs.map((tab) => {
            const Icon = tab.icon;
            return /* @__PURE__ */ jsxs(
              TabsTrigger,
              {
                value: tab.id,
                className: "shrink-0 rounded-lg px-3 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                children: [
                  /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 mr-2" }),
                  tab.label
                ]
              },
              tab.id
            );
          }) }) }),
          /* @__PURE__ */ jsx("div", { className: "hidden xl:block space-y-1", children: tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setActiveTab(tab.id),
                className: `w-full rounded-xl px-3 py-3 text-left transition border ${isActive ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" : "border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/60"}`,
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: `rounded-lg p-2 ${isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("div", { className: `text-sm font-semibold ${isActive ? "text-blue-900 dark:text-blue-200" : "text-gray-900 dark:text-gray-100"}`, children: tab.label }),
                    /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-5", children: tab.description })
                  ] })
                ] })
              },
              tab.id
            );
          }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-sm", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4 sm:p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-blue-600 p-2 text-white", children: /* @__PURE__ */ jsx(ActiveIcon, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-base font-semibold text-gray-900 dark:text-gray-100", children: activeTabDef.label }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: activeTabDef.description })
            ] })
          ] }) }) }),
          tabs.map((tab) => /* @__PURE__ */ jsx(TabsContent, { value: tab.id, className: "m-0", children: tab.component }, tab.id))
        ] })
      ] }) })
    ] })
  ] });
}
export {
  SettingsIndex as default
};
