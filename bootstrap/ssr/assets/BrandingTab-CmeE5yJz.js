import { jsxs, jsx } from "react/jsx-runtime";
import { Image, Upload, Sun, Moon, MonitorSmartphone, Trash2 } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-BtIXZ0GS.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import "react";
import "clsx";
import "tailwind-merge";
function FieldError({ message }) {
  if (!message) return null;
  return /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-300", children: message });
}
function AssetCard({
  id,
  title,
  description,
  url,
  removeKey,
  removed,
  accept,
  icon: Icon,
  compact = false,
  darkPreview = false,
  errors,
  onUpload,
  onRemove
}) {
  const hasAsset = Boolean(url && !removed);
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-card border border-gray-100 bg-white dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 border-b border-gray-100 p-4 dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/15 dark:text-emerald-200", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: id, children: title }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
        ] })
      ] }),
      hasAsset && /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => onRemove(removeKey, id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex h-24 items-center justify-center rounded-card border border-dashed px-4",
            darkPreview ? "border-white/10 bg-waify-sidebar text-white/70" : "border-gray-200 bg-gray-50 text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted"
          ),
          children: hasAsset ? /* @__PURE__ */ jsx("img", { src: url, alt: title, className: compact ? "h-11 w-11 object-contain" : "max-h-14 max-w-full object-contain" }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: removed ? "Removed after save" : "No file uploaded" })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(Input, { id, type: "file", accept, onChange: (event) => onUpload(id, event) }),
      /* @__PURE__ */ jsx(FieldError, { message: errors[id] })
    ] })
  ] });
}
function BrandingTab({ data, setData, errors }) {
  const branding = data.branding || {};
  const updateBranding = (key, value) => {
    setData("branding", { ...branding, [key]: value });
  };
  const handleFileChange = (field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setData(field, file);
    updateBranding(`remove_${field}`, false);
  };
  const markForRemoval = (removeKey, field) => {
    updateBranding(removeKey, true);
    setData(field, null);
  };
  const primaryColor = branding.primary_color || "#22c55e";
  const rasterLogoAccept = "image/jpeg,image/png,image/gif,image/svg+xml";
  const faviconAccept = "image/x-icon,image/png";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Image, { className: "h-5 w-5" }),
          "Brand Identity"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Core name and visual assets used across app shells, auth screens, public pages, and favicons." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "branding.platform_name", children: "Platform Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "branding.platform_name",
              value: branding.platform_name || "",
              onChange: (event) => updateBranding("platform_name", event.target.value),
              placeholder: "Zyptos"
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["branding.platform_name"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center gap-3 bg-white px-4 text-waify-text", children: [
            branding.logo_url && !branding.remove_logo ? /* @__PURE__ */ jsx("img", { src: branding.logo_url, alt: "", className: "max-h-9 w-auto" }) : /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-card text-white", style: { backgroundColor: primaryColor }, children: /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-semibold", children: branding.platform_name || "Zyptos" })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center gap-3 bg-waify-sidebar px-4 text-white", children: [
            branding.logo_dark_url && !branding.remove_logo_dark ? /* @__PURE__ */ jsx("img", { src: branding.logo_dark_url, alt: "", className: "max-h-9 w-auto" }) : /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-card", style: { backgroundColor: primaryColor }, children: /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-semibold", children: branding.platform_name || "Zyptos" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center gap-3 rounded-card bg-waify-sidebar px-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-card bg-white/5", children: branding.sidebar_icon_dark_url && !branding.remove_sidebar_icon_dark ? /* @__PURE__ */ jsx("img", { src: branding.sidebar_icon_dark_url, alt: "", className: "h-7 w-7 object-contain" }) : /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 text-white/70" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-2", children: [
              /* @__PURE__ */ jsx("div", { className: "h-3 w-24 rounded-full bg-white/20" }),
              /* @__PURE__ */ jsx("div", { className: "h-3 w-16 rounded-full bg-white/10" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Logo Assets" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use horizontal logos for headers, public pages, and auth layouts." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsx(
          AssetCard,
          {
            id: "logo",
            title: "Light Logo",
            description: "PNG, JPG, GIF, or SVG up to 2MB.",
            url: branding.logo_url,
            removeKey: "remove_logo",
            removed: branding.remove_logo,
            accept: rasterLogoAccept,
            icon: Sun,
            errors,
            onUpload: handleFileChange,
            onRemove: markForRemoval
          }
        ),
        /* @__PURE__ */ jsx(
          AssetCard,
          {
            id: "logo_dark",
            title: "Dark Logo",
            description: "For dark headers, dark mode, and dark public sections.",
            url: branding.logo_dark_url,
            removeKey: "remove_logo_dark",
            removed: branding.remove_logo_dark,
            accept: rasterLogoAccept,
            icon: Moon,
            darkPreview: true,
            errors,
            onUpload: handleFileChange,
            onRemove: markForRemoval
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Sidebar Icons" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Compact marks for collapsed navigation and dense app surfaces." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
          /* @__PURE__ */ jsx(
            AssetCard,
            {
              id: "sidebar_icon",
              title: "Light Sidebar Icon",
              description: "Square icon for light shell.",
              url: branding.sidebar_icon_url,
              removeKey: "remove_sidebar_icon",
              removed: branding.remove_sidebar_icon,
              accept: rasterLogoAccept,
              icon: MonitorSmartphone,
              compact: true,
              errors,
              onUpload: handleFileChange,
              onRemove: markForRemoval
            }
          ),
          /* @__PURE__ */ jsx(
            AssetCard,
            {
              id: "sidebar_icon_dark",
              title: "Dark Sidebar Icon",
              description: "Square icon for dark shell.",
              url: branding.sidebar_icon_dark_url,
              removeKey: "remove_sidebar_icon_dark",
              removed: branding.remove_sidebar_icon_dark,
              accept: rasterLogoAccept,
              icon: MonitorSmartphone,
              compact: true,
              darkPreview: true,
              errors,
              onUpload: handleFileChange,
              onRemove: markForRemoval
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Favicons" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Browser tab icons for light and dark browser themes." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
          /* @__PURE__ */ jsx(
            AssetCard,
            {
              id: "favicon",
              title: "Light Favicon",
              description: "ICO or PNG up to 512KB.",
              url: branding.favicon_url,
              removeKey: "remove_favicon",
              removed: branding.remove_favicon,
              accept: faviconAccept,
              icon: Sun,
              compact: true,
              errors,
              onUpload: handleFileChange,
              onRemove: markForRemoval
            }
          ),
          /* @__PURE__ */ jsx(
            AssetCard,
            {
              id: "favicon_dark",
              title: "Dark Favicon",
              description: "ICO or PNG up to 512KB.",
              url: branding.favicon_dark_url,
              removeKey: "remove_favicon_dark",
              removed: branding.remove_favicon_dark,
              accept: faviconAccept,
              icon: Moon,
              compact: true,
              darkPreview: true,
              errors,
              onUpload: handleFileChange,
              onRemove: markForRemoval
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
