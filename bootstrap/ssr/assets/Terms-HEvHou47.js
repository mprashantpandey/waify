import { jsx, jsxs } from "react/jsx-runtime";
import { FileText, CheckCircle, AlertCircle, Scale } from "lucide-react";
import { L as LegalDocumentPage } from "./LegalDocumentPage-DL26LQ4K.js";
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
function Terms({ content = "" }) {
  return /* @__PURE__ */ jsx(
    LegalDocumentPage,
    {
      title: "Terms of Service",
      eyebrow: "Legal Information",
      icon: /* @__PURE__ */ jsx(Scale, { className: "h-3.5 w-3.5" }),
      lastUpdated: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      content,
      children: !content?.trim() && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3", children: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
            "1. Acceptance of Terms"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement." })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mr-3", children: /* @__PURE__ */ jsx(CheckCircle, { className: "h-6 w-6 text-green-600 dark:text-green-400" }) }),
            "2. Use License"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "Permission is granted to temporarily use our services for personal or commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4", children: [
            /* @__PURE__ */ jsx("li", { children: "Modify or copy the materials" }),
            /* @__PURE__ */ jsx("li", { children: "Use the materials for any commercial purpose or for any public display" }),
            /* @__PURE__ */ jsx("li", { children: "Attempt to reverse engineer any software contained in our services" }),
            /* @__PURE__ */ jsx("li", { children: "Remove any copyright or other proprietary notations from the materials" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-red-50 dark:bg-red-900/20 p-2 rounded-lg mr-3", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6 text-red-600 dark:text-red-400" }) }),
            "3. Acceptable Use"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "You agree not to use our services to:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4", children: [
            /* @__PURE__ */ jsx("li", { children: "Send spam, unsolicited messages, or engage in any form of harassment" }),
            /* @__PURE__ */ jsx("li", { children: "Violate any applicable laws or regulations" }),
            /* @__PURE__ */ jsx("li", { children: "Infringe upon the rights of others" }),
            /* @__PURE__ */ jsx("li", { children: "Transmit any malicious code or viruses" }),
            /* @__PURE__ */ jsx("li", { children: "Interfere with or disrupt the services" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "4. Payment Terms" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. You are responsible for any taxes applicable to your use of our services." })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "5. Service Availability" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "We strive to maintain high availability of our services but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of our services at any time." })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "6. Limitation of Liability" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses." })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "7. Termination" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "We may terminate or suspend your account and access to our services immediately, without prior notice, for any breach of these Terms of Service." })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "8. Contact Information" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "If you have any questions about these Terms of Service, please contact us at:" }),
          /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-900 dark:text-gray-100 font-medium", children: [
            "Email: legal@example.com",
            /* @__PURE__ */ jsx("br", {}),
            "Address: [Your Company Address]"
          ] }) })
        ] })
      ] })
    }
  );
}
export {
  Terms as default
};
