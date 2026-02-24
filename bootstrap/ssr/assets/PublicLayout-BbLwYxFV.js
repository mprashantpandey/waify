import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { usePage, Link } from "@inertiajs/react";
import { B as BrandingWrapper } from "./BrandingWrapper-B2Mh0bYb.js";
import { CreditCard, MessageSquare, HelpCircle, Info, Mail, X, Menu } from "lucide-react";
import { useState } from "react";
import { B as Button } from "./Button-ymbdH_NY.js";
import { C as CookieConsentBanner, A as AnalyticsScripts } from "./CookieConsentBanner-BJ5KL4CC.js";
function PublicLayout({ children }) {
  const { branding, auth, accounts, compliance } = usePage().props;
  const platformName = branding?.platform_name || "WACP";
  const logoUrl = branding?.logo_url;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canLogin = window.route?.has?.("login") ?? true;
  const canRegister = window.route?.has?.("register") ?? true;
  const termsUrl = compliance?.terms_url || route("terms");
  const privacyUrl = compliance?.privacy_url || route("privacy");
  const cookiePolicyUrl = compliance?.cookie_policy_url;
  const navigation = [
    { name: "Pricing", href: route("pricing"), icon: CreditCard },
    { name: "Features", href: route("landing") + "#features", icon: MessageSquare },
    { name: "Help", href: route("help"), icon: HelpCircle },
    { name: "FAQs", href: route("faqs"), icon: Info },
    { name: "About", href: route("about"), icon: Info },
    { name: "Contact", href: route("contact"), icon: Mail }
  ];
  const isExternal = (href) => href.startsWith("http");
  const footerLinks = {
    product: [
      { name: "Features", href: route("landing") + "#features" },
      { name: "Pricing", href: route("pricing") },
      { name: "Help Center", href: route("help") },
      { name: "FAQs", href: route("faqs") }
    ],
    company: [
      { name: "About Us", href: route("about") },
      { name: "Contact", href: route("contact") },
      { name: "Blog", href: "#" }
    ],
    legal: [
      { name: "Privacy Policy", href: privacyUrl },
      { name: "Terms of Service", href: termsUrl },
      ...cookiePolicyUrl ? [{ name: "Cookie Policy", href: cookiePolicyUrl }] : []
    ]
  };
  return /* @__PURE__ */ jsx(BrandingWrapper, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col", children: [
    /* @__PURE__ */ jsxs("nav", { className: "border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50", children: [
      /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center h-16", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxs(Link, { href: route("landing"), className: "flex items-center space-x-3", children: [
          logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-10 w-auto" }) : /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md", children: /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-white", children: platformName.charAt(0) }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", children: platformName })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center space-x-1", children: navigation.map((item) => /* @__PURE__ */ jsx(
          Link,
          {
            href: item.href,
            className: "px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md",
            children: item.name
          },
          item.name
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-3", children: [
          !auth?.user && /* @__PURE__ */ jsxs(Fragment, { children: [
            canLogin && /* @__PURE__ */ jsx(Link, { href: route("login"), children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: "Sign In" }) }),
            canRegister && /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsx(Button, { size: "sm", children: "Get Started" }) })
          ] }),
          auth?.user && /* @__PURE__ */ jsx(
            Link,
            {
              href: Array.isArray(accounts) && accounts.length > 0 ? route("app.dashboard", {}) : route("onboarding"),
              children: /* @__PURE__ */ jsx(Button, { size: "sm", children: "Dashboard" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
            onClick: () => setMobileMenuOpen(!mobileMenuOpen),
            children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "h-6 w-6" }) : /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" })
          }
        )
      ] }) }),
      mobileMenuOpen && /* @__PURE__ */ jsx("div", { className: "md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "px-2 pt-2 pb-3 space-y-1", children: [
        navigation.map((item) => /* @__PURE__ */ jsx(
          Link,
          {
            href: item.href,
            className: "block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md",
            onClick: () => setMobileMenuOpen(false),
            children: item.name
          },
          item.name
        )),
        !auth?.user && /* @__PURE__ */ jsxs("div", { className: "pt-4 space-y-2", children: [
          canLogin && /* @__PURE__ */ jsx(
            Link,
            {
              href: route("login"),
              className: "block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md",
              onClick: () => setMobileMenuOpen(false),
              children: "Sign In"
            }
          ),
          canRegister && /* @__PURE__ */ jsx(
            Link,
            {
              href: route("register"),
              className: "block px-3 py-2 text-base font-medium bg-blue-600 text-white rounded-md text-center",
              onClick: () => setMobileMenuOpen(false),
              children: "Get Started"
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "flex-1", children }),
    /* @__PURE__ */ jsx("footer", { className: "bg-gray-900 text-gray-400 border-t border-gray-800", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-span-1 md:col-span-1", children: [
          /* @__PURE__ */ jsxs(Link, { href: route("landing"), className: "flex items-center space-x-2 mb-4", children: [
            logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-8 w-auto" }) : /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-white", children: platformName.charAt(0) }) }),
            /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-white", children: platformName })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "WhatsApp Cloud Platform for modern businesses. Official Meta Tech Provider." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-4", children: "Product" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: footerLinks.product.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            Link,
            {
              href: link.href,
              className: "text-sm hover:text-white transition-colors",
              children: link.name
            }
          ) }, link.name)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-4", children: "Company" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: footerLinks.company.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            Link,
            {
              href: link.href,
              className: "text-sm hover:text-white transition-colors",
              children: link.name
            }
          ) }, link.name)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-4", children: "Legal" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: footerLinks.legal.map((link) => /* @__PURE__ */ jsx("li", { children: isExternal(link.href) ? /* @__PURE__ */ jsx(
            "a",
            {
              href: link.href,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-sm hover:text-white transition-colors",
              children: link.name
            }
          ) : /* @__PURE__ */ jsx(
            Link,
            {
              href: link.href,
              className: "text-sm hover:text-white transition-colors",
              children: link.name
            }
          ) }, link.name)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 pt-8 border-t border-gray-800", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-center text-gray-500", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        platformName,
        ". All rights reserved."
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(CookieConsentBanner, {}),
    /* @__PURE__ */ jsx(AnalyticsScripts, {})
  ] }) });
}
export {
  PublicLayout as P
};
