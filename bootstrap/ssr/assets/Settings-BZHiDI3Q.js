import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { u as useTabs, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./Tabs-Dz-4gKmC.js";
import { Globe, Palette, ToggleLeft, Scale, Shield, Mail, FileText, MessageSquare, Radio, CreditCard, Webhook, HardDrive, BarChart3, Zap, Bot, Clock3, Activity, XCircle, Save } from "lucide-react";
import { M as MisconfiguredSettingsAlert } from "./MisconfiguredSettingsAlert-C5cle28_.js";
import { u as useToast } from "./useToast-CwsXrmjR.js";
import { u as useNotifications } from "./useNotifications-DZIlU05F.js";
import GeneralTab from "./GeneralTab-Bwp6caNn.js";
import SecurityTab from "./SecurityTab-itWIxf8o.js";
import PaymentTab from "./PaymentTab-CkISdJru.js";
import IntegrationsTab from "./IntegrationsTab-C_tAm7Rn.js";
import AnalyticsTab from "./AnalyticsTab-BncuBVKM.js";
import ComplianceTab from "./ComplianceTab-CAi-xsOL.js";
import PerformanceTab from "./PerformanceTab-PECov6b3.js";
import FeaturesTab from "./FeaturesTab-B_dell7x.js";
import PusherTab from "./PusherTab-CE_kPJek.js";
import MailTab from "./MailTab-CThf-D3S.js";
import EmailTemplatesTab from "./EmailTemplatesTab-K6rerj5p.js";
import SmsTab from "./SmsTab-Ced_khM3.js";
import StorageTab from "./StorageTab-DpZp4bEr.js";
import BrandingTab from "./BrandingTab-DcCHXuPc.js";
import AiTab from "./AiTab-ltaiglEI.js";
import CronTab from "./CronTab-BrQvZ4Dz.js";
import DeliveryTab from "./DeliveryTab-Bt6IGfwo.js";
import "./Topbar-B0L72tZm.js";
import "./Badge-CHx1ViYT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./Alert-C-mQ6HNk.js";
import "./Card-DLPTnTfC.js";
import "./useConfirm-BKf7Nv1N.js";
import "./TextInput-Dl1_GoEA.js";
import "./InputLabel-CE_n4Upz.js";
import "./InputError-DiSBWiye.js";
import "./Label-DSCoVIUl.js";
import "./Textarea-x8GTiAvG.js";
import "./Input-B0lHg7LA.js";
import "./Switch-DsHb4CWG.js";
function PlatformSettings({
  pusher,
  mail,
  storage,
  general,
  security,
  payment,
  integrations,
  alerts,
  analytics,
  compliance,
  performance,
  features,
  branding,
  ai,
  whatsapp,
  sms,
  campaigns,
  settings_section,
  cron,
  delivery,
  misconfigured_settings
}) {
  const { auth } = usePage().props;
  const tabs = [
    { id: "general", label: "General", icon: Globe, section: "core" },
    { id: "branding", label: "Branding", icon: Palette, section: "core" },
    { id: "features", label: "Features", icon: ToggleLeft, section: "core" },
    { id: "compliance", label: "Compliance", icon: Scale, section: "core" },
    { id: "security", label: "Security", icon: Shield, section: "security" },
    { id: "mail", label: "Mail", icon: Mail, section: "security" },
    { id: "email_templates", label: "Email templates", icon: FileText, section: "security" },
    { id: "sms", label: "SMS (2FA & MSG91)", icon: MessageSquare, section: "security" },
    { id: "pusher", label: "Pusher", icon: Radio, section: "security" },
    { id: "payment", label: "Payment", icon: CreditCard, section: "payments" },
    { id: "integrations", label: "Integrations", icon: Webhook, section: "integrations" },
    { id: "storage", label: "Storage", icon: HardDrive, section: "integrations" },
    { id: "analytics", label: "Analytics", icon: BarChart3, section: "operations" },
    { id: "performance", label: "Performance", icon: Zap, section: "operations" },
    { id: "ai", label: "AI", icon: Bot, section: "operations" },
    { id: "cron", label: "Cron", icon: Clock3, section: "delivery" },
    { id: "delivery", label: "Delivery", icon: Activity, section: "delivery" }
  ];
  const currentSection = ["core", "security", "payments", "integrations", "operations", "delivery"].includes(settings_section) ? settings_section : "core";
  const sectionTabs = tabs.filter((t) => t.section === currentSection);
  const fallbackTab = sectionTabs[0]?.id || "general";
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab") || fallbackTab;
      return sectionTabs.some((t) => t.id === tab) ? tab : fallbackTab;
    }
    return fallbackTab;
  };
  const { value: activeTab, setValue: setActiveTab } = useTabs(getInitialTab());
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get("tab");
      if (tabFromUrl && tabFromUrl !== activeTab && sectionTabs.some((t) => t.id === tabFromUrl)) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [activeTab, setActiveTab, sectionTabs]);
  const { addToast } = useToast();
  const { confirm } = useNotifications();
  const { data, setData, post, processing, errors } = useForm({
    general: general || {},
    security: security || {},
    payment: payment || {},
    integrations: integrations || {},
    alerts: alerts || {},
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
    sms: sms || {},
    campaigns: campaigns || {},
    _settings_section: currentSection,
    _settings_tab: fallbackTab
  });
  useEffect(() => {
    setData("_settings_section", currentSection);
    setData("_settings_tab", activeTab);
  }, [currentSection, activeTab, setData]);
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
      only: ["general", "security", "payment", "integrations", "alerts", "analytics", "compliance", "performance", "features", "pusher", "mail", "storage", "branding", "ai", "whatsapp", "sms", "campaigns", "flash"],
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
  const sections = [
    { id: "core", label: "Core", description: "General, branding, features, compliance" },
    { id: "security", label: "Security & Mail", description: "Security, mail, templates, SMS, pusher" },
    { id: "payments", label: "Payments", description: "Payment gateway and billing behavior" },
    { id: "integrations", label: "Integrations", description: "Integrations, WhatsApp, storage" },
    { id: "operations", label: "Operations", description: "Analytics, performance, AI" },
    { id: "delivery", label: "Cron & Delivery", description: "Cron diagnostics and delivery status" }
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
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4", children: sections.map((section) => /* @__PURE__ */ jsxs(
        "a",
        {
          href: route("platform.settings.section", { section: section.id }),
          className: `rounded-lg border p-3 transition ${currentSection === section.id ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20" : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: section.label }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: section.description })
          ]
        },
        section.id
      )) }),
      /* @__PURE__ */ jsx(TabsList, { className: "w-full justify-start mb-6 overflow-x-auto", children: sectionTabs.map((tab) => {
        const Icon = tab.icon;
        return /* @__PURE__ */ jsxs(TabsTrigger, { value: tab.id, children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 mr-2" }),
          tab.label
        ] }, tab.id);
      }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "_settings_section", value: currentSection }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "_settings_tab", value: activeTab }),
        /* @__PURE__ */ jsx(TabsContent, { value: "general", children: /* @__PURE__ */ jsx(GeneralTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "branding", children: /* @__PURE__ */ jsx(BrandingTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "security", children: /* @__PURE__ */ jsx(SecurityTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "payment", children: /* @__PURE__ */ jsx(PaymentTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "integrations", children: /* @__PURE__ */ jsx(IntegrationsTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "analytics", children: /* @__PURE__ */ jsx(AnalyticsTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "compliance", children: /* @__PURE__ */ jsx(ComplianceTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "performance", children: /* @__PURE__ */ jsx(PerformanceTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "features", children: /* @__PURE__ */ jsx(FeaturesTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "cron", children: /* @__PURE__ */ jsx(CronTab, { cron }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "delivery", children: /* @__PURE__ */ jsx(DeliveryTab, { delivery, data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "pusher", children: /* @__PURE__ */ jsx(PusherTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "ai", children: /* @__PURE__ */ jsx(AiTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "mail", children: /* @__PURE__ */ jsx(MailTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "email_templates", children: /* @__PURE__ */ jsx(EmailTemplatesTab, { data, setData, errors }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "sms", children: /* @__PURE__ */ jsx(SmsTab, { data, setData, errors }) }),
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
