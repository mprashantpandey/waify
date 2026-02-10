import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { P as PlatformShell } from "./PlatformShell-COfIDu4w.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { u as useTabs, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./Tabs-Dz-4gKmC.js";
import { XCircle, Globe, LifeBuoy, Palette, Shield, CreditCard, Webhook, BarChart3, Scale, Zap, ToggleLeft, Bot, Radio, Mail, HardDrive, Save } from "lucide-react";
import { M as MisconfiguredSettingsAlert } from "./MisconfiguredSettingsAlert-B_SAryYx.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { u as useNotifications } from "./useNotifications-BFFaoN1-.js";
import GeneralTab from "./GeneralTab-Bwp6caNn.js";
import SecurityTab from "./SecurityTab-itWIxf8o.js";
import PaymentTab from "./PaymentTab-CEW02-wl.js";
import IntegrationsTab from "./IntegrationsTab-DST6R8AO.js";
import AnalyticsTab from "./AnalyticsTab-BncuBVKM.js";
import ComplianceTab from "./ComplianceTab-CAi-xsOL.js";
import PerformanceTab from "./PerformanceTab-PECov6b3.js";
import FeaturesTab from "./FeaturesTab-B_dell7x.js";
import PusherTab from "./PusherTab-CE_kPJek.js";
import MailTab from "./MailTab-6Xay2Wdv.js";
import StorageTab from "./StorageTab-DpZp4bEr.js";
import BrandingTab from "./BrandingTab-DcCHXuPc.js";
import AiTab from "./AiTab-B7fojUtW.js";
import SupportTab from "./SupportTab-Czi0zkfH.js";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "axios";
import "./Alert-DWa0cnrh.js";
import "./Card-DLPTnTfC.js";
import "./useConfirm-BKf7Nv1N.js";
import "./TextInput-Dl1_GoEA.js";
import "./InputLabel-CE_n4Upz.js";
import "./InputError-DiSBWiye.js";
import "./Input-B0lHg7LA.js";
import "./Label-DSCoVIUl.js";
import "./Switch-DsHb4CWG.js";
function PlatformSettings({
  pusher,
  mail,
  storage,
  general,
  security,
  payment,
  integrations,
  analytics,
  compliance,
  performance,
  features,
  branding,
  ai,
  whatsapp,
  support,
  misconfigured_settings
}) {
  const { auth, flash } = usePage().props;
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("tab") || "general";
    }
    return "general";
  };
  const { value: activeTab, setValue: setActiveTab } = useTabs(getInitialTab());
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get("tab");
      if (tabFromUrl && tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [activeTab, setActiveTab]);
  const { addToast } = useToast();
  const { confirm } = useNotifications();
  const { data, setData, post, processing, errors } = useForm({
    general: general || {},
    security: security || {},
    payment: payment || {},
    integrations: integrations || {},
    analytics: analytics || {},
    compliance: compliance || {},
    performance: performance || {},
    features: features || {},
    pusher: pusher || {},
    mail: mail || {},
    storage: storage || {},
    branding: branding || {},
    ai: ai || {},
    whatsapp: whatsapp || {},
    support: support || {}
  });
  useEffect(() => {
    if (flash?.success) {
      addToast({
        title: "Success",
        description: flash.success,
        variant: "success"
      });
    }
    if (flash?.error) {
      addToast({
        title: "Error",
        description: flash.error,
        variant: "error"
      });
    }
    if (flash?.warning) {
      addToast({
        title: "Warning",
        description: flash.warning,
        variant: "warning"
      });
    }
  }, [flash, addToast]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentPayment = payment || {};
    const newPayment = data.payment || {};
    if (currentPayment.razorpay_enabled && !newPayment.razorpay_enabled) {
      const confirmed = await confirm({
        title: "Disable Razorpay?",
        message: "You are about to disable Razorpay. This will prevent users from making payments. Are you sure?",
        variant: "warning"
      });
      if (!confirmed) {
        return;
      }
    }
    post(route("platform.settings.update"), {
      preserveScroll: false,
      forceFormData: true,
      // Required for file uploads
      only: ["general", "security", "payment", "integrations", "analytics", "compliance", "performance", "features", "pusher", "mail", "storage", "branding", "ai", "whatsapp", "support", "flash"],
      onSuccess: () => {
        addToast({
          title: "Settings Saved",
          description: "All settings have been updated successfully.",
          variant: "success"
        });
      },
      onError: (errors2) => {
        const errorMessages = Object.values(errors2).flat();
        addToast({
          title: "Error Saving Settings",
          description: errorMessages.length > 0 ? errorMessages[0] : "Failed to save settings. Please try again.",
          variant: "error"
        });
      }
    });
  };
  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "support", label: "Support", icon: LifeBuoy },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "integrations", label: "Integrations", icon: Webhook },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "compliance", label: "Compliance", icon: Scale },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "features", label: "Features", icon: ToggleLeft },
    { id: "ai", label: "AI", icon: Bot },
    { id: "pusher", label: "Pusher", icon: Radio },
    { id: "mail", label: "Mail", icon: Mail },
    { id: "storage", label: "Storage", icon: HardDrive }
  ];
  return /* @__PURE__ */ jsx(PlatformShell, { auth, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Platform Settings" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Configure all platform-wide settings and integrations" })
    ] }),
    misconfigured_settings && misconfigured_settings.length > 0 && /* @__PURE__ */ jsx(
      MisconfiguredSettingsAlert,
      {
        misconfiguredSettings: misconfigured_settings,
        variant: "settings"
      }
    ),
    Object.keys(errors).length > 0 && /* @__PURE__ */ jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-red-800 dark:text-red-200 mb-1", children: "Validation Errors" }),
        /* @__PURE__ */ jsx("ul", { className: "list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1", children: Object.entries(errors).map(([key, messages]) => /* @__PURE__ */ jsx("li", { children: Array.isArray(messages) ? messages.join(", ") : messages }, key)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsx(TabsList, { className: "w-full justify-start mb-6 overflow-x-auto", children: tabs.map((tab) => {
        const Icon = tab.icon;
        return /* @__PURE__ */ jsxs(TabsTrigger, { value: tab.id, children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 mr-2" }),
          tab.label
        ] }, tab.id);
      }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsx(TabsContent, { value: "general", children: /* @__PURE__ */ jsx(GeneralTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "support", children: /* @__PURE__ */ jsx(SupportTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "branding", children: /* @__PURE__ */ jsx(BrandingTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "security", children: /* @__PURE__ */ jsx(SecurityTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "payment", children: /* @__PURE__ */ jsx(PaymentTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "integrations", children: /* @__PURE__ */ jsx(IntegrationsTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "analytics", children: /* @__PURE__ */ jsx(AnalyticsTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "compliance", children: /* @__PURE__ */ jsx(ComplianceTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "performance", children: /* @__PURE__ */ jsx(PerformanceTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "features", children: /* @__PURE__ */ jsx(FeaturesTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "pusher", children: /* @__PURE__ */ jsx(PusherTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "ai", children: /* @__PURE__ */ jsx(AiTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "mail", children: /* @__PURE__ */ jsx(MailTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "storage", children: /* @__PURE__ */ jsx(StorageTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800", children: /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: processing, children: [
          /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
          processing ? "Saving..." : "Save All Settings"
        ] }) })
      ] })
    ] })
  ] }) });
}
export {
  PlatformSettings as default
};
