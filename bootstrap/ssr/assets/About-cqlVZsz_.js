import { jsxs, jsx } from "react/jsx-runtime";
import { P as PublicLayout } from "./PublicLayout-CRYi50tL.js";
import { Sparkles, Target, Users, Award, Zap, ArrowRight } from "lucide-react";
import { Head, Link } from "@inertiajs/react";
import { B as Button } from "./Button-ymbdH_NY.js";
import { P as PublicPageHero } from "./PublicPageHero-CAzOoyqp.js";
import "react";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function About() {
  const values = [
    {
      icon: Target,
      title: "Mission",
      description: "To empower businesses of all sizes to communicate effectively with their customers through WhatsApp, making enterprise-grade messaging accessible to everyone.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Team",
      description: "We're a passionate team of developers, designers, and customer success specialists dedicated to building the best WhatsApp communication platform.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Award,
      title: "Quality",
      description: "We believe in delivering high-quality, reliable services with exceptional customer support. Your success is our success.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously innovate and improve our platform based on customer feedback and industry best practices.",
      gradient: "from-orange-500 to-orange-600"
    }
  ];
  const stats = [
    { label: "Active Accounts", value: "1000+", icon: "🚀" },
    { label: "Messages Sent", value: "10M+", icon: "📨" },
    { label: "Happy Customers", value: "500+", icon: "😊" },
    { label: "Uptime", value: "99.9%", icon: "⚡" }
  ];
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "About" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14", children: [
      /* @__PURE__ */ jsx(
        PublicPageHero,
        {
          eyebrow: "About",
          icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
          title: "Built for modern WhatsApp operations",
          description: "We build workflow, automation, and billing infrastructure for businesses that run customer communication on WhatsApp at scale."
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mb-16", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-10 shadow-sm border border-gray-200 dark:border-gray-800", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6", children: "Our Story" }),
        /* @__PURE__ */ jsxs("div", { className: "prose prose-lg dark:prose-invert max-w-none", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed", children: "Zyptos was born from a simple observation: businesses were struggling to scale their WhatsApp communication. While WhatsApp is one of the most popular messaging platforms globally, managing it at scale required complex integrations, custom development, and significant technical expertise." }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed", children: "We set out to change that. Our platform makes it easy for businesses of all sizes to leverage the power of WhatsApp Cloud API without the complexity. Whether you're a startup sending your first message or an enterprise managing millions of conversations, Zyptos provides the tools you need." }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 text-lg leading-relaxed", children: "As an official Meta Tech Provider, we're proud to serve hundreds of businesses, helping them connect with their customers in more meaningful ways. But we're just getting started. Our mission is to make WhatsApp the primary channel for business communication, and we're building the platform to make that happen." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 mb-16", children: stats.map((stat, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white dark:bg-gray-900 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all",
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: stat.icon }),
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2", children: stat.value }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium", children: stat.label })
          ]
        },
        index
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12", children: "Our Values" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: values.map((value, index) => {
          const Icon = value.icon;
          return /* @__PURE__ */ jsx(
            "div",
            {
              className: "bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-4", children: [
                /* @__PURE__ */ jsx("div", { className: `bg-gradient-to-r ${value.gradient} p-3 rounded-lg shadow-lg`, children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-white" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: value.title }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 leading-relaxed", children: value.description })
                ] })
              ] })
            },
            index
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white shadow-xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/10" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "Join Us on This Journey" }),
          /* @__PURE__ */ jsx("p", { className: "text-blue-100 mb-8 max-w-2xl mx-auto text-lg", children: "We're an official Meta Tech Provider. Whether you're a customer, partner, or potential team member, we'd love to hear from you." }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 flex-wrap", children: [
            /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "lg", className: "bg-white text-blue-600 hover:bg-gray-100 shadow-lg", children: "Get in Touch" }) }),
            /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "lg", className: "bg-blue-700 text-white hover:bg-blue-800 border-2 border-white shadow-lg", children: [
              "Start Free Trial",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-5 w-5 ml-2" })
            ] }) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  About as default
};
