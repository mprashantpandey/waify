import { jsx, jsxs } from "react/jsx-runtime";
import { P as PublicLayout } from "./PublicLayout-PRmTd_R0.js";
import { HelpCircle, ChevronUp, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import "@inertiajs/react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-ymbdH_NY.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./CookieConsentBanner-BJ5KL4CC.js";
function FAQs({ faqs: initialFaqs }) {
  const [openIndex, setOpenIndex] = useState(0);
  const defaultFaqs = [
    {
      question: "What is WACP?",
      answer: "WACP (WhatsApp Cloud Platform) is a comprehensive platform for managing WhatsApp Business communications at scale. It provides tools for template management, chatbot automation, team collaboration, and more."
    },
    {
      question: "How do I get started?",
      answer: "Getting started is easy! Sign up for a free account, create your account profile, and connect your WhatsApp Business Account. Our onboarding wizard will guide you through the setup process."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and UPI payments through Razorpay. All payments are processed securely."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time from your billing settings. Changes take effect immediately, and we'll prorate any charges."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, all plans come with a free trial. No credit card required. You can explore all features during the trial period."
    },
    {
      question: "How do I connect my WhatsApp Business Account?",
      answer: "You can connect your WhatsApp Business Account through our Embedded Signup wizard or manually by providing your Meta App credentials. We support both methods."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "If you exceed your plan limits, we'll notify you and you can either upgrade your plan or wait until the next billing cycle. Some limits may have overage charges."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption for data in transit and at rest. All API credentials are encrypted, and we follow strict security practices. See our Privacy Policy for more details."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes! We offer email support for all users, and priority support for Pro and Enterprise plans. You can also access our help center and documentation anytime."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time from your billing settings. Your subscription will remain active until the end of the current billing period."
    }
  ];
  const faqs = initialFaqs && initialFaqs.length > 0 ? initialFaqs : defaultFaqs;
  return /* @__PURE__ */ jsx(PublicLayout, { children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6", children: [
        /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: "Common Questions" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6", children: /* @__PURE__ */ jsx(HelpCircle, { className: "h-10 w-10 text-blue-600 dark:text-blue-400" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent", children: "Frequently Asked Questions" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-600 dark:text-gray-400", children: "Find answers to common questions about our platform" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-12", children: faqs.map((faq, index) => {
      const isOpen = openIndex === index;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all overflow-hidden",
          children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setOpenIndex(isOpen ? null : index),
                className: "w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-gray-100 pr-4 text-lg", children: faq.question }),
                  /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg", children: isOpen ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" }) })
                ]
              }
            ),
            isOpen && /* @__PURE__ */ jsx("div", { className: "px-6 pb-5 border-t border-gray-200 dark:border-gray-700 pt-4", children: /* @__PURE__ */ jsx("p", { className: "text-gray-700 dark:text-gray-300 leading-relaxed", children: faq.answer }) })
          ]
        },
        index
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 text-center border-2 border-blue-200 dark:border-blue-800", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Still have questions? We're here to help!" })
      ] }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: route("contact"),
          className: "inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors",
          children: [
            "Contact Support",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
          ]
        }
      )
    ] })
  ] }) });
}
export {
  FAQs as default
};
