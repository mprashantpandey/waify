import { jsx, jsxs } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { ToggleLeft } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function FeaturesTab({ data, setData, errors }) {
  const features = [
    {
      key: "user_registration",
      label: "User Registration",
      description: "Allow new users to register accounts",
      category: "Authentication"
    },
    {
      key: "email_verification",
      label: "Email Verification",
      description: "Require email verification for new accounts",
      category: "Authentication"
    },
    {
      key: "workspace_creation",
      label: "Workspace Creation",
      description: "Allow users to create new workspaces",
      category: "Workspaces"
    },
    {
      key: "public_api",
      label: "Public API",
      description: "Enable public API access",
      category: "API"
    },
    {
      key: "webhooks",
      label: "Webhooks",
      description: "Enable webhook functionality",
      category: "Integrations"
    },
    {
      key: "analytics",
      label: "Analytics",
      description: "Enable analytics tracking",
      category: "Analytics"
    },
    {
      key: "beta_features",
      label: "Beta Features",
      description: "Show beta features to users",
      category: "Features"
    },
    {
      key: "maintenance_mode",
      label: "Maintenance Mode",
      description: "Put platform in maintenance mode",
      category: "System"
    }
  ];
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {});
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: Object.entries(groupedFeatures).map(([category, categoryFeatures]) => /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(ToggleLeft, { className: "h-5 w-5" }),
      category
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: categoryFeatures.map((feature) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { value: feature.label }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: feature.description })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: data.features?.[feature.key] || false,
            onChange: (e) => setData(`features.${feature.key}`, e.target.checked),
            className: "sr-only peer"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
      ] })
    ] }, feature.key)) })
  ] }, category)) });
}
export {
  FeaturesTab as default
};
