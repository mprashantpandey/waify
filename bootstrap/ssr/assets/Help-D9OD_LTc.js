import { jsx, jsxs } from "react/jsx-runtime";
import { P as PublicLayout } from "./PublicLayout-BbLwYxFV.js";
import { Link } from "@inertiajs/react";
import { HelpCircle, Video, MessageSquare, Sparkles, Search, ArrowRight, BookOpen, FileText, ExternalLink } from "lucide-react";
import { B as Button } from "./Button-ymbdH_NY.js";
import { useState } from "react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const helpCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn the basics and get up and running quickly",
      articles: [
        "Creating your first account",
        "Connecting WhatsApp Business Account",
        "Setting up your first template",
        "Sending your first message"
      ]
    },
    {
      title: "Templates & Messages",
      icon: FileText,
      description: "Manage templates and send messages effectively",
      articles: [
        "Creating message templates",
        "Template approval process",
        "Sending template messages",
        "Message delivery tracking"
      ]
    },
    {
      title: "Chatbots & Automation",
      icon: MessageSquare,
      description: "Build and manage automated conversations",
      articles: [
        "Creating your first chatbot",
        "Setting up flow nodes",
        "Configuring triggers",
        "Testing chatbots"
      ]
    },
    {
      title: "Billing & Plans",
      icon: FileText,
      description: "Manage your subscription and billing",
      articles: [
        "Understanding pricing plans",
        "Upgrading or downgrading",
        "Payment methods",
        "Billing history"
      ]
    }
  ];
  const quickLinks = [
    { title: "FAQs", href: route("faqs"), icon: HelpCircle },
    { title: "Video Tutorials", href: "#", icon: Video },
    { title: "Contact Support", href: route("contact"), icon: MessageSquare }
  ];
  return /* @__PURE__ */ jsx(PublicLayout, { children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: "Help & Support Center" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent", children: "How can we help you?" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8", children: "Find answers, guides, and tutorials to get the most out of our platform." }),
      /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search for help articles...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg transition-all"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-16", children: quickLinks.map((link) => /* @__PURE__ */ jsx(
      Link,
      {
        href: link.href,
        className: "bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all group",
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-purple-900/30 transition-all", children: /* @__PURE__ */ jsx(link.icon, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors", children: link.title }) })
          ] }),
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" })
        ] })
      },
      link.title
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8", children: "Browse by Category" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: helpCategories.map((category) => {
        const Icon = category.icon;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-4 mb-4", children: [
                /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg", children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: category.title }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: category.description })
                ] })
              ] }),
              /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: category.articles.map((article, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "#",
                  className: "text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center transition-colors",
                  children: [
                    article,
                    /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 ml-1" })
                  ]
                }
              ) }, index)) })
            ]
          },
          category.title
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white shadow-xl relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/10" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mb-4", children: "Still need help?" }),
        /* @__PURE__ */ jsx("p", { className: "text-blue-100 mb-6 max-w-2xl mx-auto", children: "Our support team is here to help you. Get in touch and we'll respond as soon as possible." }),
        /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "lg", className: "bg-white text-blue-600 hover:bg-gray-100 shadow-lg", children: [
          "Contact Support",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-5 w-5 ml-2" })
        ] }) })
      ] })
    ] })
  ] }) });
}
export {
  Help as default
};
