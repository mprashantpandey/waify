import { jsxs, jsx } from "react/jsx-runtime";
import { I as Input } from "./Input-BgsnMcKc.js";
import { L as Label } from "./Label-CbZtQFYj.js";
import { S as Switch } from "./Switch-hton75fW.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function BrandingTab({ data, setData, errors }) {
  const handleFileChange = (field, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setData(field, file);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Platform Branding" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Customize your platform's appearance and branding" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "branding.platform_name", children: "Platform Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "branding.platform_name",
              value: data.branding?.platform_name || "",
              onChange: (e) => setData("branding", { ...data.branding, platform_name: e.target.value }),
              placeholder: "Waify"
            }
          ),
          errors?.["branding.platform_name"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["branding.platform_name"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "logo", children: "Logo" }),
          data.branding?.logo_url && /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: data.branding.logo_url,
              alt: "Current logo",
              className: "h-12 w-auto mb-2"
            }
          ) }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "logo",
              type: "file",
              accept: "image/*",
              onChange: (e) => handleFileChange("logo", e)
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Recommended: PNG or SVG, max 2MB. Will be displayed in sidebar and headers." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "favicon", children: "Favicon" }),
          data.branding?.favicon_url && /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: data.branding.favicon_url,
              alt: "Current favicon",
              className: "h-8 w-8 mb-2"
            }
          ) }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "favicon",
              type: "file",
              accept: "image/x-icon,image/png",
              onChange: (e) => handleFileChange("favicon", e)
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Recommended: ICO or PNG, 32x32px, max 512KB." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "branding.primary_color", children: "Primary Color" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "branding.primary_color",
                  type: "color",
                  value: data.branding?.primary_color || "#3B82F6",
                  onChange: (e) => setData("branding", { ...data.branding, primary_color: e.target.value }),
                  className: "w-20 h-10"
                }
              ),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.branding?.primary_color || "#3B82F6",
                  onChange: (e) => setData("branding", { ...data.branding, primary_color: e.target.value }),
                  placeholder: "#3B82F6",
                  pattern: "^#[0-9A-Fa-f]{6}$"
                }
              )
            ] }),
            errors?.["branding.primary_color"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["branding.primary_color"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "branding.secondary_color", children: "Secondary Color" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "branding.secondary_color",
                  type: "color",
                  value: data.branding?.secondary_color || "#8B5CF6",
                  onChange: (e) => setData("branding", { ...data.branding, secondary_color: e.target.value }),
                  className: "w-20 h-10"
                }
              ),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.branding?.secondary_color || "#8B5CF6",
                  onChange: (e) => setData("branding", { ...data.branding, secondary_color: e.target.value }),
                  placeholder: "#8B5CF6",
                  pattern: "^#[0-9A-Fa-f]{6}$"
                }
              )
            ] }),
            errors?.["branding.secondary_color"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["branding.secondary_color"] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Support Information" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Contact information displayed to users" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "branding.support_email", children: "Support Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "branding.support_email",
              type: "email",
              value: data.branding?.support_email || "",
              onChange: (e) => setData("branding", { ...data.branding, support_email: e.target.value }),
              placeholder: "support@example.com"
            }
          ),
          errors?.["branding.support_email"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["branding.support_email"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "branding.support_phone", children: "Support Phone" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "branding.support_phone",
              value: data.branding?.support_phone || "",
              onChange: (e) => setData("branding", { ...data.branding, support_phone: e.target.value }),
              placeholder: "+1 (555) 123-4567"
            }
          ),
          errors?.["branding.support_phone"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["branding.support_phone"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "branding.footer_text", children: "Footer Text" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "branding.footer_text",
              value: data.branding?.footer_text || "",
              onChange: (e) => setData("branding", { ...data.branding, footer_text: e.target.value }),
              placeholder: "© 2024 Your Company. All rights reserved."
            }
          ),
          errors?.["branding.footer_text"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["branding.footer_text"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "branding.show_powered_by", children: 'Show "Powered By"' }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: 'Display "Powered by [Platform Name]" in the footer' })
          ] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              id: "branding.show_powered_by",
              checked: data.branding?.show_powered_by || false,
              onCheckedChange: (checked) => setData("branding", { ...data.branding, show_powered_by: checked })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  BrandingTab as default
};
