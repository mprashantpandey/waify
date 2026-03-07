import { jsx, jsxs } from "react/jsx-runtime";
import { Lock, Eye, Shield, FileText } from "lucide-react";
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
function Privacy({ content = "" }) {
  return /* @__PURE__ */ jsx(
    LegalDocumentPage,
    {
      title: "Privacy Policy",
      eyebrow: "Your Privacy Matters",
      icon: /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5" }),
      lastUpdated: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      content,
      children: !content?.trim() && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3", children: /* @__PURE__ */ jsx(Lock, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
            "1. Information We Collect"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "We collect information that you provide directly to us, including:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4", children: [
            /* @__PURE__ */ jsx("li", { children: "Account information (name, email address, phone number)" }),
            /* @__PURE__ */ jsx("li", { children: "Account and business information" }),
            /* @__PURE__ */ jsx("li", { children: "Payment and billing information" }),
            /* @__PURE__ */ jsx("li", { children: "Messages and communications sent through our platform" }),
            /* @__PURE__ */ jsx("li", { children: "Usage data and analytics" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3", children: /* @__PURE__ */ jsx(Eye, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
            "2. How We Use Your Information"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "We use the information we collect to:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4", children: [
            /* @__PURE__ */ jsx("li", { children: "Provide, maintain, and improve our services" }),
            /* @__PURE__ */ jsx("li", { children: "Process transactions and send related information" }),
            /* @__PURE__ */ jsx("li", { children: "Send technical notices and support messages" }),
            /* @__PURE__ */ jsx("li", { children: "Respond to your comments and questions" }),
            /* @__PURE__ */ jsx("li", { children: "Monitor and analyze trends and usage" }),
            /* @__PURE__ */ jsx("li", { children: "Detect, prevent, and address technical issues" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3", children: /* @__PURE__ */ jsx(Shield, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
            "3. Data Security"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "We implement appropriate technical and organizational measures to protect your personal information:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4", children: [
            /* @__PURE__ */ jsx("li", { children: "Encryption of data in transit and at rest" }),
            /* @__PURE__ */ jsx("li", { children: "Regular security audits and assessments" }),
            /* @__PURE__ */ jsx("li", { children: "Access controls and authentication mechanisms" }),
            /* @__PURE__ */ jsx("li", { children: "Secure data centers with physical security measures" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3", children: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
            "4. Your Rights"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "You have the right to:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4", children: [
            /* @__PURE__ */ jsx("li", { children: "Access and receive a copy of your personal data" }),
            /* @__PURE__ */ jsx("li", { children: "Rectify inaccurate or incomplete data" }),
            /* @__PURE__ */ jsx("li", { children: "Request deletion of your personal data" }),
            /* @__PURE__ */ jsx("li", { children: "Object to processing of your personal data" }),
            /* @__PURE__ */ jsx("li", { children: "Data portability" }),
            /* @__PURE__ */ jsx("li", { children: "Withdraw consent at any time" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "5. Third-Party Services" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "Our services integrate with third-party services, including:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4", children: [
            /* @__PURE__ */ jsx("li", { children: "Meta WhatsApp Cloud API for messaging services" }),
            /* @__PURE__ */ jsx("li", { children: "Payment processors (Razorpay) for billing" }),
            /* @__PURE__ */ jsx("li", { children: "Cloud infrastructure providers for hosting" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mt-4", children: "These third parties have their own privacy policies, and we encourage you to review them." })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "6. Contact Us" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "If you have any questions about this Privacy Policy, please contact us at:" }),
          /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-900 dark:text-gray-100 font-medium", children: [
            "Email: privacy@example.com",
            /* @__PURE__ */ jsx("br", {}),
            "Address: [Your Company Address]"
          ] }) })
        ] })
      ] })
    }
  );
}
export {
  Privacy as default
};
