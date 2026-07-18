import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AddonPage, StatGrid, MiniStatus } from "./Shared-BnBdIg9m.js";
import { T as ThemedIconTile } from "./Elements-EbyZDnT_.js";
import { Radio, Plug, MessageCircle, Webhook, Smartphone, Instagram, Facebook } from "lucide-react";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "./Input-DGMAswN3.js";
import "@headlessui/react";
const icons = {
  wa: MessageCircle,
  fb: Facebook,
  ig: Instagram,
  sms: Smartphone
};
function Channels({ channels = [] }) {
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Channels" }),
    /* @__PURE__ */ jsxs(AddonPage, { title: "Channels", description: "One place to review customer messaging channels and connection readiness.", actions: /* @__PURE__ */ jsx(Link, { href: route("app.integrations.index"), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
      /* @__PURE__ */ jsx(Plug, { className: "mr-2 h-4 w-4" }),
      "All integrations"
    ] }) }), children: [
      /* @__PURE__ */ jsx(StatGrid, { stats: [
        { label: "Channels", value: channels.length, icon: Radio, tone: "green" },
        { label: "Connected", value: channels.filter((item) => item.connected).length, icon: Plug, tone: "blue" },
        { label: "Primary WABA", value: channels.find((item) => item.id === "wa")?.connected ? "Ready" : "Missing", icon: MessageCircle, tone: "green" },
        { label: "Webhook managed", value: "Central", icon: Webhook, tone: "purple" }
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4", children: channels.map((channel) => {
        const Icon = icons[channel.id] || Radio;
        return /* @__PURE__ */ jsx(Card, { className: "h-full", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex h-full flex-col p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsx(ThemedIconTile, { tone: channel.connected ? "green" : "gray", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx(MiniStatus, { status: channel.connected ? "connected" : "draft" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-5 font-semibold text-waify-text dark:text-waify-dark-text", children: channel.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: channel.handle }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: channel.metric }),
          /* @__PURE__ */ jsx("div", { className: "mt-auto pt-5", children: /* @__PURE__ */ jsx(Link, { href: route(channel.route), children: /* @__PURE__ */ jsx(Button, { className: "w-full", variant: channel.connected ? "secondary" : "primary", children: channel.connected ? "Manage" : "Connect" }) }) })
        ] }) }, channel.id);
      }) })
    ] })
  ] });
}
export {
  Channels as default
};
