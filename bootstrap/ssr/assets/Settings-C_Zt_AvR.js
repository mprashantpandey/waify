import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm, Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Building2, Palette, Shield, CreditCard, Webhook, ToggleLeft, Mail, Radio, Bot, HardDrive, XCircle, Save } from "lucide-react";
import { P as PlatformShell } from "./PlatformShell-BDgjSKtX.js";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { M as MisconfiguredSettingsAlert } from "./MisconfiguredSettingsAlert-CD_n8Xs5.js";
import { u as useNotifications } from "./useNotifications-CWqdQOlf.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import GeneralTab from "./GeneralTab-BQHk-lUm.js";
import SecurityTab from "./SecurityTab-aDHrOao5.js";
import PaymentTab from "./PaymentTab-BtGQPI9Y.js";
import IntegrationsTab from "./IntegrationsTab-CSQnupgu.js";
import FeaturesTab from "./FeaturesTab-BSNEtvhr.js";
import PusherTab from "./PusherTab-jk52_3vR.js";
import MailTab from "./MailTab-Fhj-bhuS.js";
import StorageTab from "./StorageTab-CPSVyihY.js";
import BrandingTab from "./BrandingTab-CmeE5yJz.js";
import AiTab from "./AiTab-B5Ro9f2t.js";
import "axios";
import "./BrandingWrapper-CZn0jBQL.js";
import "./useToast-BN7qsQL3.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./Alert-CEZ-sRON.js";
import "./useConfirm-gGqxmsEz.js";
import "clsx";
import "tailwind-merge";
import "./Input-DGMAswN3.js";
import "./Label-DSCoVIUl.js";
import "./Switch-D6_sQewh.js";
import "./TextInput-CmkZX80k.js";
import "./InputLabel-BMzefKC8.js";
import "./InputError-DiSBWiye.js";
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
  misconfigured_settings
}) {
  const { auth } = usePage().props;
  const { confirm, toast } = useNotifications();
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("tab") || "general";
    }
    return "general";
  };
  const { data, setData: setFormData, post, processing, errors } = useForm({
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
    whatsapp: whatsapp || {}
  });
  const [activeTab, setActiveTab] = useState(getInitialTab());
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [activeTab, setActiveTab]);
  const switchTab = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };
  const setData = (key, value) => {
    if (!key.includes(".")) {
      setFormData(key, value);
      return;
    }
    const [group, field] = key.split(".", 2);
    const currentGroup = data[group] || {};
    setFormData(group, {
      ...currentGroup,
      [field]: value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentPayment = payment || {};
    const newPayment = data.payment || {};
    if (currentPayment.razorpay_enabled && !newPayment.razorpay_enabled) {
      const confirmed = await confirm({
        title: "Disable Razorpay?",
        message: "You are about to disable Razorpay. This will prevent users from making payments.",
        variant: "warning"
      });
      if (!confirmed) return;
    }
    post(route("platform.settings.update"), {
      preserveScroll: false,
      forceFormData: true,
      only: ["general", "security", "payment", "integrations", "analytics", "compliance", "performance", "features", "pusher", "mail", "storage", "branding", "ai", "whatsapp", "flash"],
      onError: (formErrors) => {
        const errorMessages = Object.values(formErrors).flat();
        toast.error(
          "Error saving settings",
          errorMessages.length > 0 ? String(errorMessages[0]) : "Failed to save settings. Please try again."
        );
      }
    });
  };
  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "integrations", label: "Integrations", icon: Webhook },
    { id: "features", label: "Features", icon: ToggleLeft },
    { id: "mail", label: "Mail", icon: Mail },
    { id: "pusher", label: "Pusher", icon: Radio },
    { id: "ai", label: "AI", icon: Bot },
    { id: "storage", label: "Storage", icon: HardDrive }
  ];
  const active = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const renderActiveTab = () => {
    switch (active.id) {
      case "general":
        return /* @__PURE__ */ jsx(GeneralTab, { data, setData, errors });
      case "branding":
        return /* @__PURE__ */ jsx(BrandingTab, { data, setData, errors });
      case "security":
        return /* @__PURE__ */ jsx(SecurityTab, { data, setData, errors });
      case "payment":
        return /* @__PURE__ */ jsx(PaymentTab, { data, setData, errors });
      case "integrations":
        return /* @__PURE__ */ jsx(IntegrationsTab, { data, setData, errors });
      case "features":
        return /* @__PURE__ */ jsx(FeaturesTab, { data, setData, errors });
      case "pusher":
        return /* @__PURE__ */ jsx(PusherTab, { data, setData, errors });
      case "ai":
        return /* @__PURE__ */ jsx(AiTab, { data, setData, errors });
      case "mail":
        return /* @__PURE__ */ jsx(MailTab, { data, setData, errors });
      case "storage":
        return /* @__PURE__ */ jsx(StorageTab, { data, setData, errors });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Platform Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1400px] space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: "Platform settings" }) }),
        /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Production" })
      ] }),
      misconfigured_settings && misconfigured_settings.length > 0 && /* @__PURE__ */ jsx(MisconfiguredSettingsAlert, { misconfiguredSettings: misconfigured_settings, variant: "settings" }),
      Object.keys(errors).length > 0 && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-red-200 bg-red-50 p-4 dark:border-red-400/25 dark:bg-red-500/10", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(XCircle, { className: "mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-300" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-red-800 dark:text-red-100", children: "Validation errors" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-2 list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-200", children: Object.entries(errors).map(([key, messages]) => /* @__PURE__ */ jsx("li", { children: Array.isArray(messages) ? messages.join(", ") : String(messages) }, key)) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]", children: [
        /* @__PURE__ */ jsx("nav", { className: "min-w-0", children: /* @__PURE__ */ jsx(Card, { className: "p-2 lg:sticky lg:top-6 lg:max-h-[calc(100vh-9rem)] lg:overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "waify-scrollbar flex gap-1 overflow-x-auto pb-1 lg:max-h-[calc(100vh-10rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0", children: tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active.id === tab.id;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => switchTab(tab.id),
              className: cn(
                "flex shrink-0 items-center gap-3 rounded-btn px-3 py-2.5 text-left transition lg:w-full",
                isActive ? "bg-waify-green-soft text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-300" : "text-waify-text-muted hover:bg-gray-50 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-700/50 dark:hover:text-waify-dark-text"
              ),
              children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      isActive ? "bg-white/80 dark:bg-waify-dark-surface" : "bg-gray-100 dark:bg-waify-dark-surface-2"
                    ),
                    children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "hidden min-w-0 sm:block", children: /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium", children: tab.label }) })
              ]
            },
            tab.id
          );
        }) }) }) }),
        /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/50", children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: active.label }) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: renderActiveTab() }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60", children: [
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => window.location.reload(), children: "Cancel" }),
              /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: processing, children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                processing ? "Saving..." : "Save changes"
              ] })
            ] })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  PlatformSettings as default
};
