import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Building2, User, ShieldCheck, CreditCard, Bell, Inbox, ImagePlus, Save } from "lucide-react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import ProfileTab from "./ProfileTab-DolH02t4.js";
import SecurityTab from "./SecurityTab-frYKo9SR.js";
import BillingTab from "./BillingTab-4HmuU79t.js";
import NotificationsTab from "./NotificationsTab-CBJSB3xq.js";
import InboxTab from "./InboxTab-dPz5OEym.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "./useToast-BN7qsQL3.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./Button-BJftGNki.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "./TextInput-CmkZX80k.js";
import "./InputLabel-BMzefKC8.js";
import "./InputError-DiSBWiye.js";
import "./CountryPhoneInput-CHHfMj5w.js";
import "./useNotifications-CWqdQOlf.js";
import "./useConfirm-gGqxmsEz.js";
import "./TwoFactorSetupPanel-D-GRENr8.js";
import "qrcode";
function PageHeader({ title, subtitle }) {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-end justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: subtitle })
  ] }) });
}
function SettingsSection({ title, description, children }) {
  return /* @__PURE__ */ jsxs("section", { children: [
    (title || description) && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      title && /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
    ] }),
    children
  ] });
}
function Avatar({ name, src, size = 88 }) {
  const palette = ["#00A548", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#14B8A6", "#EF4444", "#6366F1"];
  const initial = (name || "?").trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase();
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "inline-flex flex-shrink-0 select-none items-center justify-center rounded-full font-semibold text-white",
      style: { width: size, height: size, background: palette[Math.abs(hash) % palette.length], fontSize: size * 0.38 },
      children: src ? /* @__PURE__ */ jsx("img", { src, alt: name || "Workspace", className: "h-full w-full object-cover" }) : initial
    }
  );
}
function WorkspaceTab({ workspace, workspaceTypes = {}, timezones = [] }) {
  const [logoPreview, setLogoPreview] = useState(workspace?.logo_url || null);
  const form = useForm({
    name: workspace?.name || "",
    workspace_type: workspace?.workspace_type || "business",
    industry: workspace?.industry || "",
    timezone: workspace?.timezone || "UTC",
    billing_name: workspace?.billing_name || "",
    billing_email: workspace?.billing_email || "",
    billing_gstin: workspace?.billing_gstin || "",
    billing_address_line1: workspace?.billing_address_line1 || "",
    billing_address_line2: workspace?.billing_address_line2 || "",
    billing_city: workspace?.billing_city || "",
    billing_state: workspace?.billing_state || "",
    billing_state_code: workspace?.billing_state_code || "",
    billing_postal_code: workspace?.billing_postal_code || "",
    billing_country: workspace?.billing_country || "IN",
    logo: null
  });
  const submit = (event) => {
    event.preventDefault();
    form.transform((data) => ({ ...data, _method: "patch" }));
    form.post(route("app.settings.workspace.upload"), {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => form.setData("logo", null)
    });
  };
  if (!workspace) {
    return /* @__PURE__ */ jsx(Alert, { variant: "info", title: "No active workspace", children: "Select or create a workspace before changing workspace profile settings." });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]", children: [
      /* @__PURE__ */ jsxs(Card, { className: "flex flex-col items-center p-5 text-center lg:items-start lg:text-left", children: [
        /* @__PURE__ */ jsx(Avatar, { name: form.data.name || workspace.name, src: logoPreview }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 font-semibold text-waify-text dark:text-waify-dark-text", children: form.data.name || workspace.name }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 max-w-full truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: workspace.slug }),
        /* @__PURE__ */ jsxs("label", { className: "mt-4 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-btn border border-gray-200 bg-white px-3 text-sm font-medium text-waify-text transition hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2", children: [
          /* @__PURE__ */ jsx(ImagePlus, { className: "h-4 w-4" }),
          "Upload image",
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/jpeg,image/png,image/webp,image/gif",
              className: "sr-only",
              onChange: (event) => {
                const file = event.target.files?.[0] || null;
                form.setData("logo", file);
                setLogoPreview(file ? URL.createObjectURL(file) : workspace.logo_url);
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "PNG, JPG, WebP or GIF up to 2MB." }),
        form.errors.logo && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.logo })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsx(SettingsSection, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Workspace name" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.name, onChange: (event) => form.setData("name", event.target.value) }),
          form.errors.name && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Workspace type" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: form.data.workspace_type,
              onChange: (event) => form.setData("workspace_type", event.target.value),
              className: "h-9 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none transition focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text",
              children: Object.entries(workspaceTypes).map(([key, label]) => /* @__PURE__ */ jsx("option", { value: key, children: label }, key))
            }
          ),
          form.errors.workspace_type && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.workspace_type })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Industry" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.industry, onChange: (event) => form.setData("industry", event.target.value), placeholder: "Retail, healthcare, education" }),
          form.errors.industry && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.industry })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Timezone" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: form.data.timezone,
              onChange: (event) => form.setData("timezone", event.target.value),
              className: "h-9 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none transition focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text",
              children: timezones.map((timezone) => /* @__PURE__ */ jsx("option", { value: timezone, children: timezone }, timezone))
            }
          ),
          form.errors.timezone && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.timezone })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { className: "p-5 lg:col-start-2", children: /* @__PURE__ */ jsx(SettingsSection, { title: "Billing Profile", description: "Used for tax invoices and payment receipts.", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Billing name" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_name, onChange: (event) => form.setData("billing_name", event.target.value) }),
          form.errors.billing_name && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.billing_name })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Billing email" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_email, onChange: (event) => form.setData("billing_email", event.target.value) }),
          form.errors.billing_email && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.billing_email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "GSTIN" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_gstin, onChange: (event) => form.setData("billing_gstin", event.target.value.toUpperCase()) }),
          form.errors.billing_gstin && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.billing_gstin })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Country" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_country, onChange: (event) => form.setData("billing_country", event.target.value.toUpperCase()) }),
          form.errors.billing_country && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.billing_country })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Address line 1" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_address_line1, onChange: (event) => form.setData("billing_address_line1", event.target.value) }),
          form.errors.billing_address_line1 && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: form.errors.billing_address_line1 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Address line 2" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_address_line2, onChange: (event) => form.setData("billing_address_line2", event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "City" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_city, onChange: (event) => form.setData("billing_city", event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "State" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_state, onChange: (event) => form.setData("billing_state", event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "State code" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_state_code, onChange: (event) => form.setData("billing_state_code", event.target.value.toUpperCase()), placeholder: "MH, DL, KA" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Postal code" }),
          /* @__PURE__ */ jsx(Input, { value: form.data.billing_postal_code, onChange: (event) => form.setData("billing_postal_code", event.target.value) })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2 border-t border-gray-100 pt-2 dark:border-slate-700", children: /* @__PURE__ */ jsxs("button", { type: "submit", disabled: form.processing || !form.data.name.trim(), className: "inline-flex h-9 items-center justify-center gap-2 rounded-btn bg-waify-green px-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-waify-green-dark disabled:cursor-not-allowed disabled:opacity-50", children: [
      /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
      form.processing ? "Saving..." : "Save changes"
    ] }) })
  ] });
}
function SettingsIndex({ workspace, workspaceTypes = {}, timezones = [], initialTab = "workspace" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabs = [
    { id: "workspace", label: "Workspace", icon: Building2, desc: "Workspace details", component: /* @__PURE__ */ jsx(WorkspaceTab, { workspace, workspaceTypes, timezones }) },
    { id: "profile", label: "Profile", icon: User, desc: "Your account details", component: /* @__PURE__ */ jsx(ProfileTab, {}) },
    { id: "security", label: "Security", icon: ShieldCheck, desc: "Password, 2FA & sessions", component: /* @__PURE__ */ jsx(SecurityTab, {}) },
    { id: "billing", label: "Billing", icon: CreditCard, desc: "Plan & usage", component: /* @__PURE__ */ jsx(BillingTab, {}) },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Email & alerts", component: /* @__PURE__ */ jsx(NotificationsTab, {}) },
    { id: "inbox", label: "Inbox", icon: Inbox, desc: "Routing preferences", component: /* @__PURE__ */ jsx(InboxTab, {}) }
  ];
  const active = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1400px] p-6", children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Settings", subtitle: "Manage your workspace, profile, billing, notifications, and inbox preferences." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col items-start gap-6 lg:flex-row", children: [
        /* @__PURE__ */ jsx("nav", { className: "w-full flex-shrink-0 lg:w-[240px]", children: /* @__PURE__ */ jsx(Card, { className: "p-2 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "scrollbar-none flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible", children: tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab(tab.id),
              className: `flex flex-shrink-0 items-center gap-3 rounded-btn px-3 py-2.5 text-left transition lg:w-full ${isActive ? "bg-waify-green-soft text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-400" : "text-waify-text-muted hover:bg-gray-50 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-700/50 dark:hover:text-waify-dark-text"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-white/80 dark:bg-slate-800" : "bg-gray-100 dark:bg-slate-700"}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxs("span", { className: "hidden min-w-0 sm:block lg:block", children: [
                  /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium", children: tab.label }),
                  /* @__PURE__ */ jsx("span", { className: "block truncate text-[11px] opacity-80", children: tab.desc })
                ] })
              ]
            },
            tab.id
          );
        }) }) }) }),
        /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1 w-full", children: /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: active.label }),
            /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: active.desc })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-6", children: active.component })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  SettingsIndex as default
};
