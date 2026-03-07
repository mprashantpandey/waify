import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm, Head } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import "react";
import "./Topbar-B0L72tZm.js";
import "lucide-react";
import "./Badge-CHx1ViYT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
function CmsPagesIndex({
  pages
}) {
  const { auth } = usePage().props;
  const { data, setData, post, processing, errors } = useForm({
    terms_content: pages?.terms_content || "",
    privacy_content: pages?.privacy_content || "",
    cookie_content: pages?.cookie_content || "",
    refund_content: pages?.refund_content || ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("platform.cms.update"));
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "CMS Pages" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "CMS Pages" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Edit policy pages shown on public site." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Terms of Service" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Displayed on `/terms`" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "terms_content", children: "Content" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "terms_content",
                value: data.terms_content,
                onChange: (e) => setData("terms_content", e.target.value),
                rows: 14,
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                placeholder: "Enter terms content..."
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.terms_content, className: "mt-2" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Privacy Policy" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Displayed on `/privacy`" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "privacy_content", children: "Content" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "privacy_content",
                value: data.privacy_content,
                onChange: (e) => setData("privacy_content", e.target.value),
                rows: 14,
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                placeholder: "Enter privacy content..."
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.privacy_content, className: "mt-2" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Refund Policy" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Displayed on `/refund-policy`" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "refund_content", children: "Content" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "refund_content",
                value: data.refund_content,
                onChange: (e) => setData("refund_content", e.target.value),
                rows: 12,
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                placeholder: "Enter refund policy content..."
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.refund_content, className: "mt-2" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Cookie Policy" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Displayed on `/cookie-policy`" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "cookie_content", children: "Content" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "cookie_content",
                value: data.cookie_content,
                onChange: (e) => setData("cookie_content", e.target.value),
                rows: 12,
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                placeholder: "Enter cookie policy content..."
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.cookie_content, className: "mt-2" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: processing ? "Saving..." : "Save CMS Pages" }) })
      ] })
    ] })
  ] });
}
export {
  CmsPagesIndex as default
};
