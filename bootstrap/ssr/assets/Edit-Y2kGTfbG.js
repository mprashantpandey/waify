import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-BVTGgi5j.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { I as Input } from "./Input-B0lHg7LA.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { S as Switch } from "./Switch-DsHb4CWG.js";
import { u as useToast } from "./useToast-C5ECijgs.js";
import { ArrowLeft, Save } from "lucide-react";
import "react";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "axios";
function PlansEdit({ plan, modules, default_currency = "USD" }) {
  const { auth } = usePage().props;
  const { addToast } = useToast();
  const { data, setData, patch, processing, errors } = useForm({
    key: plan.key,
    name: plan.name,
    description: plan.description || "",
    price_monthly: plan.price_monthly,
    price_yearly: plan.price_yearly,
    is_active: plan.is_active,
    is_public: plan.is_public,
    trial_days: plan.trial_days,
    sort_order: plan.sort_order,
    limits: plan.limits || {},
    modules: plan.modules || []
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    patch(route("platform.plans.update", { plan: plan.id }), {
      onSuccess: () => {
        addToast({
          title: "Plan Updated",
          description: "The plan has been updated successfully.",
          variant: "success"
        });
      },
      onError: (errors2) => {
        addToast({
          title: "Error",
          description: Object.values(errors2)[0] || "Failed to update plan. Please check the form.",
          variant: "error"
        });
      }
    });
  };
  const toggleModule = (moduleKey) => {
    const currentModules = data.modules || [];
    if (currentModules.includes(moduleKey)) {
      setData("modules", currentModules.filter((m) => m !== moduleKey));
    } else {
      setData("modules", [...currentModules, moduleKey]);
    }
  };
  const updateLimit = (key, value) => {
    const numValue = value === "" || value === "-1" ? -1 : parseInt(value) || 0;
    setData("limits", {
      ...data.limits,
      [key]: numValue
    });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: `Edit Plan: ${plan.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { href: route("platform.plans.index"), children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
          "Back to Plans"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Edit Plan" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Update plan details and configuration" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Basic Information" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Plan identification and basic details" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "key", children: "Plan Key *" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "key",
                    value: data.key,
                    onChange: (e) => setData("key", e.target.value),
                    required: true,
                    disabled: true
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Plan key cannot be changed after creation" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Plan Name *" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "name",
                    value: data.name,
                    onChange: (e) => setData("name", e.target.value),
                    required: true
                  }
                ),
                errors.name && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.name })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "description",
                  value: data.description,
                  onChange: (e) => setData("description", e.target.value),
                  rows: 3,
                  className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                }
              ),
              errors.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.description })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "sort_order", children: "Sort Order" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "sort_order",
                    type: "number",
                    value: data.sort_order,
                    onChange: (e) => setData("sort_order", parseInt(e.target.value) || 0),
                    min: "0"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "trial_days", children: "Trial Days" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "trial_days",
                    type: "number",
                    value: data.trial_days,
                    onChange: (e) => setData("trial_days", parseInt(e.target.value) || 0),
                    min: "0"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Currency" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                    "Plans use the platform default currency: ",
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: default_currency })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: "To change the currency, update it in Platform Settings → Payment" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "is_active", children: "Active" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Plan is available for selection" })
              ] }),
              /* @__PURE__ */ jsx(
                Switch,
                {
                  id: "is_active",
                  checked: data.is_active,
                  onCheckedChange: (checked) => setData("is_active", checked)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "is_public", children: "Public" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Visible to tenant owners in plans page" })
              ] }),
              /* @__PURE__ */ jsx(
                Switch,
                {
                  id: "is_public",
                  checked: data.is_public,
                  onCheckedChange: (checked) => setData("is_public", checked)
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Pricing" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Set monthly and yearly pricing (in cents/paisa)" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "price_monthly", children: "Monthly Price (cents/paisa)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "price_monthly",
                  type: "number",
                  value: data.price_monthly || "",
                  onChange: (e) => setData("price_monthly", e.target.value ? parseInt(e.target.value) : null),
                  placeholder: "99900",
                  min: "0"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: data.price_monthly ? `₹${(data.price_monthly / 100).toFixed(2)}` : "Free or custom pricing" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "price_yearly", children: "Yearly Price (cents/paisa)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "price_yearly",
                  type: "number",
                  value: data.price_yearly || "",
                  onChange: (e) => setData("price_yearly", e.target.value ? parseInt(e.target.value) : null),
                  placeholder: "999000",
                  min: "0"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: data.price_yearly ? `₹${(data.price_yearly / 100).toFixed(2)}` : "Free or custom pricing" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Limits" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Set resource limits for this plan (-1 for unlimited)" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "limit_agents", children: "Agents" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "limit_agents",
                    type: "number",
                    value: data.limits.agents === -1 ? "" : data.limits.agents || "",
                    onChange: (e) => updateLimit("agents", e.target.value),
                    placeholder: "-1 for unlimited"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "limit_connections", children: "WhatsApp Connections" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "limit_connections",
                    type: "number",
                    value: data.limits.whatsapp_connections === -1 ? "" : data.limits.whatsapp_connections || "",
                    onChange: (e) => updateLimit("whatsapp_connections", e.target.value),
                    placeholder: "-1 for unlimited"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "limit_messages", children: "Messages Monthly" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "limit_messages",
                    type: "number",
                    value: data.limits.messages_monthly === -1 ? "" : data.limits.messages_monthly || "",
                    onChange: (e) => updateLimit("messages_monthly", e.target.value),
                    placeholder: "-1 for unlimited"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "limit_templates", children: "Template Sends Monthly" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "limit_templates",
                    type: "number",
                    value: data.limits.template_sends_monthly === -1 ? "" : data.limits.template_sends_monthly || "",
                    onChange: (e) => updateLimit("template_sends_monthly", e.target.value),
                    placeholder: "-1 for unlimited"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "limit_ai_credits", children: "AI Credits Monthly" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "limit_ai_credits",
                    type: "number",
                    value: data.limits.ai_credits_monthly === -1 ? "" : data.limits.ai_credits_monthly || "",
                    onChange: (e) => updateLimit("ai_credits_monthly", e.target.value),
                    placeholder: "-1 for unlimited"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "limit_retention", children: "Data Retention (Days)" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "limit_retention",
                    type: "number",
                    value: data.limits.retention_days === -1 ? "" : data.limits.retention_days || "",
                    onChange: (e) => updateLimit("retention_days", e.target.value),
                    placeholder: "-1 for unlimited"
                  }
                )
              ] })
            ] }),
            errors.limits && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: errors.limits })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Modules" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Select which modules are included in this plan" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: modules.map((module) => /* @__PURE__ */ jsxs(
              "label",
              {
                className: "flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: data.modules.includes(module.key),
                      onChange: () => toggleModule(module.key),
                      className: "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: module.name })
                ]
              },
              module.id
            )) }),
            errors.modules && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-2", children: errors.modules })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4", children: [
          /* @__PURE__ */ jsx(Link, { href: route("platform.plans.index"), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", type: "button", children: "Cancel" }) }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: processing, children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
            processing ? "Saving..." : "Save Changes"
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  PlansEdit as default
};
