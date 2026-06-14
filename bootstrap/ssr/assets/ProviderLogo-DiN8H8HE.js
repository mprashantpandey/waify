import { jsx, jsxs } from "react/jsx-runtime";
import { c as cn } from "./utils-B2ZNUmII.js";
const brandLogos = {
  whatsapp: { slug: "whatsapp", color: "00A548", label: "WhatsApp" },
  "whatsapp.cloud": { slug: "whatsapp", color: "00A548", label: "WhatsApp" },
  "meta-leads": { slug: "meta", color: "0467DF", label: "Meta" },
  "meta-catalog": { slug: "meta", color: "0467DF", label: "Meta Catalog" },
  meta: { slug: "meta", color: "0467DF", label: "Meta" },
  facebook: { slug: "facebook", color: "1877F2", label: "Facebook" },
  "google-sheets": { slug: "googlesheets", color: "0F9D58", label: "Google Sheets" },
  "google-calendar": { slug: "googlecalendar", color: "4285F4", label: "Google Calendar" },
  google: { slug: "google", color: "4285F4", label: "Google" },
  "razorpay-payments": { slug: "razorpay", color: "0B72E7", label: "Razorpay" },
  razorpay: { slug: "razorpay", color: "0B72E7", label: "Razorpay" },
  shopify: { slug: "shopify", color: "7AB55C", label: "Shopify" },
  woocommerce: { slug: "woocommerce", color: "96588A", label: "WooCommerce" },
  zapier: { slug: "zapier", color: "FF4A00", label: "Zapier" },
  make: { slug: "make", color: "6D00CC", label: "Make" },
  slack: { slug: "slack", color: "4A154B", label: "Slack" },
  openai: { slug: "openai", color: "111827", label: "OpenAI" },
  anthropic: { slug: "anthropic", color: "111827", label: "Anthropic" },
  gemini: { slug: "googlegemini", color: "4285F4", label: "Gemini" },
  "google-gemini": { slug: "googlegemini", color: "4285F4", label: "Gemini" },
  elevenlabs: { slug: "elevenlabs", color: "111827", label: "ElevenLabs" }
};
const aliases = {
  "whatsapp cloud api": "whatsapp",
  whatsapp: "whatsapp",
  "meta leads": "meta-leads",
  "meta catalog": "meta-catalog",
  meta: "meta",
  facebook: "facebook",
  "google sheets": "google-sheets",
  "google calendar": "google-calendar",
  razorpay: "razorpay",
  "razorpay payments": "razorpay-payments",
  shopify: "shopify",
  woocommerce: "woocommerce",
  zapier: "zapier",
  make: "make",
  slack: "slack",
  openai: "openai",
  anthropic: "anthropic",
  gemini: "gemini",
  elevenlabs: "elevenlabs",
  webhooks: "webhooks",
  "developer webhooks": "developer-webhooks"
};
function normalizedProvider(id, name) {
  const rawId = String(id || "").trim().toLowerCase();
  if (rawId && (brandLogos[rawId] || rawId === "workspace-ai")) return rawId;
  const rawName = String(name || "").trim().toLowerCase();
  return aliases[rawName] || rawId || rawName;
}
function logoUrl(slug, color) {
  return `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
}
function MaskLogo({
  slug,
  color,
  label,
  className
}) {
  const url = logoUrl(slug);
  return /* @__PURE__ */ jsx(
    "span",
    {
      "aria-label": `${label} logo`,
      role: "img",
      className: cn("block h-6 w-6", className),
      style: {
        backgroundColor: `#${color}`,
        WebkitMask: `url(${url}) center / contain no-repeat`,
        mask: `url(${url}) center / contain no-repeat`
      }
    }
  );
}
function DeveloperWebhooksLogo({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", role: "img", "aria-label": "Developer Webhooks logo", className: cn("h-6 w-6 text-slate-900 dark:text-white", className), fill: "none", children: [
    /* @__PURE__ */ jsx("path", { d: "M8 7L4 12l4 5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M16 7l4 5-4 5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M14 4l-4 16", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "2.25", fill: "currentColor" }),
    /* @__PURE__ */ jsx("path", { d: "M12 9V6.5M12 17.5V15M9 12H6.5M17.5 12H15", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })
  ] });
}
function ProviderLogo({ id, name, className, imageClassName }) {
  const provider = normalizedProvider(id, name);
  if (provider === "developer-webhooks" || provider === "webhooks") {
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface", className),
        title: "Developer Webhooks",
        children: /* @__PURE__ */ jsx(DeveloperWebhooksLogo, { className: imageClassName })
      }
    );
  }
  if (provider === "workspace-ai") {
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface", className),
        title: "OpenAI, Anthropic, and Gemini",
        children: ["openai", "anthropic", "gemini"].map((key) => {
          const logo2 = brandLogos[key];
          return /* @__PURE__ */ jsx(
            MaskLogo,
            {
              slug: logo2.slug,
              color: logo2.color,
              label: logo2.label,
              className: cn("h-4 w-4", imageClassName)
            },
            key
          );
        })
      }
    );
  }
  const logo = brandLogos[provider];
  if (!logo) {
    const initials = String(name || id || "?").slice(0, 2).toUpperCase();
    return /* @__PURE__ */ jsx("span", { className: cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-waify-green text-sm font-bold text-white", className), children: initials });
  }
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface", className),
      title: logo.label,
      children: /* @__PURE__ */ jsx(MaskLogo, { slug: logo.slug, color: logo.color, label: logo.label, className: imageClassName })
    }
  );
}
export {
  ProviderLogo as P
};
