import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { f as MarketingLayout, r as roadmapItems } from "./Marketing-xvuXbqSy.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import "lucide-react";
import "react";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./Button-BJftGNki.js";
import "./ProviderLogo-DiN8H8HE.js";
function Roadmap() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "roadmap", children: [
    /* @__PURE__ */ jsx(Head, { title: "Roadmap" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: roadmapItems.map((item) => /* @__PURE__ */ jsxs(Card, { className: "mkt-card-lift p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(Badge, { variant: item.status === "Shipped" ? "success" : item.status === "In progress" ? "warning" : "secondary", children: item.status }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted", children: item.quarter })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: item.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: item.desc })
    ] }, item.title)) })
  ] });
}
export {
  Roadmap as default
};
