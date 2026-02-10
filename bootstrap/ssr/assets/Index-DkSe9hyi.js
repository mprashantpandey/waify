import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { u as useTabs, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./Tabs-Dz-4gKmC.js";
import { User, CreditCard, Shield, Bell, Inbox } from "lucide-react";
import ProfileTab from "./ProfileTab-fyRh4ThU.js";
import BillingTab from "./BillingTab-fSl85nFQ.js";
import SecurityTab from "./SecurityTab-C8oA_nTe.js";
import NotificationsTab from "./NotificationsTab-F29kZEk2.js";
import InboxTab from "./InboxTab-DUJzOTkz.js";
import { Head } from "@inertiajs/react";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-ymbdH_NY.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./TextInput-Dl1_GoEA.js";
import "./InputLabel-CE_n4Upz.js";
import "./InputError-DiSBWiye.js";
import "@headlessui/react";
import "./useNotifications-BFFaoN1-.js";
import "./useConfirm-BKf7Nv1N.js";
function SettingsIndex() {
  const { value: activeTab, setValue: setActiveTab } = useTabs("profile");
  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      component: /* @__PURE__ */ jsx(ProfileTab, {})
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      component: /* @__PURE__ */ jsx(BillingTab, {})
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      component: /* @__PURE__ */ jsx(SecurityTab, {})
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      component: /* @__PURE__ */ jsx(NotificationsTab, {})
    },
    {
      id: "inbox",
      label: "Inbox",
      icon: Inbox,
      component: /* @__PURE__ */ jsx(InboxTab, {})
    }
  ];
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Settings" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage your account settings" })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
        /* @__PURE__ */ jsx(TabsList, { className: "w-full justify-start p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: tabs.map((tab) => {
          const Icon = tab.icon;
          return /* @__PURE__ */ jsxs(
            TabsTrigger,
            {
              value: tab.id,
              className: "rounded-xl px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white",
              children: [
                /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 mr-2" }),
                tab.label
              ]
            },
            tab.id
          );
        }) }),
        tabs.map((tab) => /* @__PURE__ */ jsx(TabsContent, { value: tab.id, className: "p-6", children: tab.component }, tab.id))
      ] }) }) })
    ] })
  ] });
}
export {
  SettingsIndex as default
};
