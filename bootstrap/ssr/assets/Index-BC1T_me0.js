import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Head } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, c as CardContent } from "./Card-8uw03vLH.js";
import { u as useTabs, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./Tabs-BqC3-2P6.js";
import { User, Building2, CreditCard, Shield, Bell } from "lucide-react";
import ProfileTab from "./ProfileTab-DTTK2Bmo.js";
import WorkspaceTab from "./WorkspaceTab-DaAMTq2U.js";
import BillingTab from "./BillingTab-7vr63ltI.js";
import SecurityTab from "./SecurityTab-DelXtSBA.js";
import NotificationsTab from "./NotificationsTab-8fzW2wDt.js";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-DfTOxbgl.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-BocaoVWt.js";
import "axios";
import "./TextInput-Dl1_GoEA.js";
import "./InputLabel-CE_n4Upz.js";
import "./InputError-DiSBWiye.js";
import "@headlessui/react";
import "./useNotifications-802S-ToN.js";
import "./useConfirm-94UId2r4.js";
function SettingsIndex() {
  const { workspace, auth } = usePage().props;
  const { value: activeTab, setValue: setActiveTab } = useTabs("profile");
  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      component: /* @__PURE__ */ jsx(ProfileTab, {})
    },
    {
      id: "workspace",
      label: "Workspace",
      icon: Building2,
      component: /* @__PURE__ */ jsx(WorkspaceTab, { workspace }),
      requiresWorkspace: true
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      component: /* @__PURE__ */ jsx(BillingTab, { workspace }),
      requiresWorkspace: true
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
    }
  ].filter((tab) => !tab.requiresWorkspace || workspace);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Settings" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage your account and workspace settings" })
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
