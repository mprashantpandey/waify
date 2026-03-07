import { jsxs, jsx } from "react/jsx-runtime";
import { L as LegalDocumentPage } from "./LegalDocumentPage-DL26LQ4K.js";
import { Cookie } from "lucide-react";
import "./PublicLayout-CRYi50tL.js";
import "@inertiajs/react";
import "react";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Button-ymbdH_NY.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./CookieConsentBanner-BJ5KL4CC.js";
function CookiePolicy({ content = "" }) {
  return /* @__PURE__ */ jsxs(
    LegalDocumentPage,
    {
      title: "Cookie Policy",
      eyebrow: "Cookies & Tracking",
      icon: /* @__PURE__ */ jsx(Cookie, { className: "h-3.5 w-3.5" }),
      lastUpdated: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      content,
      children: [
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "How we use cookies" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2", children: "We use cookies and similar technologies to keep sessions secure, remember preferences, improve performance, and understand product usage." })
        ] }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Cookie categories" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-2 list-disc pl-5 space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "Essential cookies for login, session security, and account access." }),
            /* @__PURE__ */ jsx("li", { children: "Preference cookies for UI behavior and saved settings." }),
            /* @__PURE__ */ jsx("li", { children: "Analytics cookies when enabled by platform configuration." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Managing cookies" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2", children: "You can manage browser cookies from your browser settings. Disabling essential cookies may affect login and core product functionality." })
        ] })
      ]
    }
  );
}
export {
  CookiePolicy as default
};
