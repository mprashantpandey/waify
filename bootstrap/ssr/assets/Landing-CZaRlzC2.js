import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Users, Zap, FileText, Send, Inbox, MessageSquare, Globe, Shield, CheckCircle2, TrendingUp } from "lucide-react";
import { B as Button } from "./Button-ymbdH_NY.js";
import axios from "axios";
import { P as PublicLayout } from "./PublicLayout-PRmTd_R0.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function Landing({
  stats: initialStats,
  canLogin,
  canRegister
}) {
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(route("api.stats"));
        setStats(response.data.stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    }, 5e3);
    return () => clearInterval(interval);
  }, []);
  const StatCard = ({ icon: Icon, label, value, trend }) => /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xl transition-all", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-2", children: value.toLocaleString() }),
      trend && /* @__PURE__ */ jsxs("p", { className: "text-xs text-green-600 dark:text-green-400 mt-1 flex items-center font-semibold", children: [
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 mr-1" }),
        trend
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg", children: /* @__PURE__ */ jsx(Icon, { className: "h-8 w-8 text-blue-600 dark:text-blue-400" }) })
  ] }) });
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: "No Credit Card Required • Start Free Trial" })
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent", children: [
        "WhatsApp Cloud Platform",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent", children: "Built for Scale" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed", children: "Connect Meta WhatsApp Cloud API, manage templates, run chatbots, automate messages, and scale your customer communication with enterprise-grade features." }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 flex-wrap", children: [
        canRegister && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsxs(Button, { size: "lg", className: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/50 text-lg px-8 py-6", children: [
            "Start Free Trial",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-5 w-5 ml-2" })
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("pricing"), children: /* @__PURE__ */ jsx(Button, { size: "lg", variant: "secondary", className: "border-2 text-lg px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-800", children: "View Pricing" }) })
        ] }),
        /* @__PURE__ */ jsx("a", { href: "#features", className: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-lg", children: "Learn More ↓" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent", children: "Platform Activity" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 text-lg", children: "Real-time statistics from our platform" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: Users,
            label: "Active Accounts",
            value: stats.accounts,
            trend: "Live"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: Zap,
            label: "WhatsApp Connections",
            value: stats.active_connections,
            trend: "Active"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: FileText,
            label: "Approved Templates",
            value: stats.templates
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: Send,
            label: "Messages Sent",
            value: stats.messages_sent,
            trend: "Today"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: Inbox,
            label: "Messages Received",
            value: stats.messages_received,
            trend: "Today"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: MessageSquare,
            label: "Active Conversations",
            value: stats.conversations,
            trend: "Open"
          }
        )
      ] }),
      isLoading && /* @__PURE__ */ jsx("div", { className: "text-center mt-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Updating stats..." }) })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "features", className: "bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: "Powerful Features" })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent", children: "Everything You Need" }),
        /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto", children: "Powerful features to manage your WhatsApp communication at scale" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsx(
          FeatureCard,
          {
            icon: MessageSquare,
            title: "WhatsApp Cloud API",
            description: "Connect and manage Meta WhatsApp Cloud API with encrypted credentials and webhook management."
          }
        ),
        /* @__PURE__ */ jsx(
          FeatureCard,
          {
            icon: FileText,
            title: "Template Management",
            description: "Sync, manage, and send WhatsApp message templates with variable substitution and approval tracking."
          }
        ),
        /* @__PURE__ */ jsx(
          FeatureCard,
          {
            icon: Inbox,
            title: "Team Inbox",
            description: "Collaborative inbox for managing conversations with assignment, tags, and internal notes."
          }
        ),
        /* @__PURE__ */ jsx(
          FeatureCard,
          {
            icon: Zap,
            title: "Chatbots & Automation",
            description: "Build powerful chatbots with flow nodes, triggers, and automated responses."
          }
        ),
        /* @__PURE__ */ jsx(
          FeatureCard,
          {
            icon: Globe,
            title: "AI Integration",
            description: "AI-powered auto-replies, variable auto-fill, sentiment analysis, and smart routing."
          }
        ),
        /* @__PURE__ */ jsx(
          FeatureCard,
          {
            icon: Shield,
            title: "Enterprise Security",
            description: "Account isolation, role-based access, encrypted tokens, and audit logs."
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 py-16 border-t border-gray-200 dark:border-gray-800", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md mb-4", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 dark:text-green-400" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Start Free Trial • No Credit Card Required" })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "Why Choose WACP?" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl mb-4", children: "🚀" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Quick Setup" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Get started in minutes with our guided setup wizard" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl mb-4", children: "💎" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Full Access" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Try all features during your free trial period" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl mb-4", children: "🎯" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Cancel Anytime" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "No commitments, cancel your subscription anytime" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/10" }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-4", children: "Ready to Transform Your Business Communication?" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl text-blue-100 mb-8", children: [
          "Join thousands of businesses using WACP to scale their WhatsApp communication.",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Start your free trial today - no credit card required!" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-4 flex-wrap", children: canRegister && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsxs(Button, { size: "lg", variant: "secondary", className: "bg-white text-blue-600 hover:bg-gray-100 shadow-xl", children: [
            "Start Free Trial",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-5 w-5 ml-2" })
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("pricing"), children: /* @__PURE__ */ jsx(Button, { size: "lg", variant: "secondary", className: "bg-transparent border-2 border-white text-white hover:bg-white/10", children: "View Pricing Plans" }) })
        ] }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-100 mt-6", children: "✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime" })
      ] })
    ] })
  ] });
}
function FeatureCard({ icon: Icon, title, description }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
    /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: title }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 leading-relaxed", children: description })
  ] });
}
export {
  Landing as default
};
