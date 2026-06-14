import { jsx, jsxs } from "react/jsx-runtime";
import { UserPlus, LockKeyhole, Users, Code2, Webhook, LineChart } from "lucide-react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-BtIXZ0GS.js";
import { S as Switch } from "./Switch-D6_sQewh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
const featureGroups = [
  {
    title: "Access",
    description: "Control how users enter and create workspaces.",
    items: [
      {
        key: "user_registration",
        label: "Public registration",
        description: "Allow new users to create an account from auth pages.",
        icon: UserPlus
      },
      {
        key: "email_verification",
        label: "Email verification",
        description: "Require users to verify email addresses after signup.",
        icon: LockKeyhole
      },
      {
        key: "account_creation",
        label: "Workspace creation",
        description: "Allow non-admin users to create additional workspaces.",
        icon: Users
      }
    ]
  },
  {
    title: "Developer Surface",
    description: "Expose programmable surfaces only when the platform is ready for them.",
    items: [
      {
        key: "public_api",
        label: "Public API",
        description: "Enable workspace API key usage and developer API access.",
        icon: Code2
      },
      {
        key: "webhooks",
        label: "Workspace webhooks",
        description: "Allow workspaces to configure outbound webhook endpoints.",
        icon: Webhook
      },
      {
        key: "analytics",
        label: "Workspace analytics",
        description: "Show analytics reports inside user workspaces.",
        icon: LineChart
      }
    ]
  }
];
function FeaturesTab({ data, setData }) {
  const features = data.features || {};
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: featureGroups.map((group) => /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: group.title }),
      /* @__PURE__ */ jsx(CardDescription, { children: group.description })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "grid gap-3 xl:grid-cols-2", children: group.items.map((feature) => {
      const Icon = feature.icon;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/15 dark:text-emerald-200", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: feature.label }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: feature.description })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: features[feature.key] || false,
                onCheckedChange: (checked) => setData(`features.${feature.key}`, checked)
              }
            )
          ]
        },
        feature.key
      );
    }) })
  ] }, group.title)) });
}
export {
  FeaturesTab as default
};
