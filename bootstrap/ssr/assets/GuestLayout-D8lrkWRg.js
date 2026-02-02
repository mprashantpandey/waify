import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Link } from "@inertiajs/react";
import { B as BrandingWrapper } from "./BrandingWrapper-B2Mh0bYb.js";
function Guest({ children }) {
  const { branding } = usePage().props;
  const platformName = branding?.platform_name || "WACP";
  const logoUrl = branding?.logo_url;
  return /* @__PURE__ */ jsx(BrandingWrapper, { children: /* @__PURE__ */ jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsx("div", { className: "text-center mb-8", children: /* @__PURE__ */ jsxs(Link, { href: "/", className: "inline-block", children: [
      logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-16 w-auto mx-auto mb-4" }) : /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-white", children: platformName.charAt(0) }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: platformName })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800", children: /* @__PURE__ */ jsx("div", { className: "h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" }) }),
      /* @__PURE__ */ jsx("div", { className: "p-8", children })
    ] })
  ] }) }) });
}
export {
  Guest as G
};
