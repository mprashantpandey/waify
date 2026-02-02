import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { u as useTabs, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./Tabs-BqC3-2P6.js";
import { XCircle, Palette, Globe, Shield, CreditCard, Webhook, BarChart3, Scale, Zap, ToggleLeft, Bot, LifeBuoy, Radio, Mail, HardDrive, Save } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { u as useNotifications } from "./useNotifications-802S-ToN.js";
import GeneralTab from "./GeneralTab-_YlOZmBV.js";
import SecurityTab from "./SecurityTab-wiZm07dk.js";
import PaymentTab from "./PaymentTab-CuS4isVK.js";
import IntegrationsTab from "./IntegrationsTab-BStaLXUM.js";
import AnalyticsTab from "./AnalyticsTab-DcTZOQPO.js";
import ComplianceTab from "./ComplianceTab-BK-bRmGa.js";
import PerformanceTab from "./PerformanceTab-Eq2AEhG1.js";
import FeaturesTab from "./FeaturesTab-B3FdueaH.js";
import PusherTab from "./PusherTab-BfX-Lh4o.js";
import MailTab from "./MailTab-BuHdE11-.js";
import StorageTab from "./StorageTab-1iCTL7jV.js";
import BrandingTab from "./BrandingTab-C6M3HL6N.js";
import AiTab from "./AiTab-C7cY1M5K.js";
import SupportTab from "./SupportTab-Tcek1Mns.js";
import "./RealtimeProvider-DfTOxbgl.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "axios";
import "./useConfirm-94UId2r4.js";
import "./Card-8uw03vLH.js";
import "./TextInput-Dl1_GoEA.js";
import "./InputLabel-CE_n4Upz.js";
import "./InputError-DiSBWiye.js";
import "./Input-BgsnMcKc.js";
import "./Label-CbZtQFYj.js";
import "./Switch-hton75fW.js";
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
  support
}) {
  const { auth, flash } = usePage().props;
  const { value: activeTab, setValue: setActiveTab } = useTabs("general");
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
    { id: "branding", label: "Branding", icon: Palette },
    { id: "general", label: "General", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "integrations", label: "Integrations", icon: Webhook },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "compliance", label: "Compliance", icon: Scale },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "features", label: "Features", icon: ToggleLeft },
    { id: "ai", label: "AI", icon: Bot },
    { id: "support", label: "Support", icon: LifeBuoy },
    { id: "pusher", label: "Pusher", icon: Radio },
    { id: "mail", label: "Mail", icon: Mail },
    { id: "storage", label: "Storage", icon: HardDrive }
  ];
  return /* @__PURE__ */ jsx(PlatformShell, { auth, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Platform Settings" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Configure all platform-wide settings and integrations" })
    ] }),
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
        /* @__PURE__ */ jsx(TabsContent, { value: "branding", children: /* @__PURE__ */ jsx(BrandingTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "general", children: /* @__PURE__ */ jsx(GeneralTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "security", children: /* @__PURE__ */ jsx(SecurityTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "payment", children: /* @__PURE__ */ jsx(PaymentTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "integrations", children: /* @__PURE__ */ jsx(IntegrationsTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "analytics", children: /* @__PURE__ */ jsx(AnalyticsTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "compliance", children: /* @__PURE__ */ jsx(ComplianceTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "performance", children: /* @__PURE__ */ jsx(PerformanceTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "features", children: /* @__PURE__ */ jsx(FeaturesTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "pusher", children: /* @__PURE__ */ jsx(PusherTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "ai", children: /* @__PURE__ */ jsx(AiTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "support", children: /* @__PURE__ */ jsx(SupportTab, { data, setData, errors }) }),
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
