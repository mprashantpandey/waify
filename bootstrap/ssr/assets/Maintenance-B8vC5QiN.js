import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { Settings, LogIn, Wrench } from "lucide-react";
import ErrorFrame from "./ErrorFrame-BFHludVa.js";
import "./BrandLogo-TeztHB0m.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./Button-BJftGNki.js";
function Maintenance({ message }) {
  const isPlatform = typeof window !== "undefined" && window.location.pathname.startsWith("/platform");
  const platformHref = typeof route !== "undefined" ? route("platform.settings") : "/platform/settings";
  const loginHref = typeof route !== "undefined" ? route("login") : "/login";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Maintenance" }),
    /* @__PURE__ */ jsx(
      ErrorFrame,
      {
        code: "503",
        title: "We'll be back soon",
        description: message || "We are currently performing scheduled maintenance. Please check back shortly.",
        icon: Wrench,
        accent: "amber",
        actions: [
          {
            label: isPlatform ? "Platform settings" : "Admin login",
            href: isPlatform ? platformHref : loginHref,
            icon: isPlatform ? Settings : LogIn,
            primary: true
          },
          {
            label: "Refresh",
            onClick: () => window.location.reload()
          }
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "sr-only", children: /* @__PURE__ */ jsx(Link, { href: platformHref, children: "Platform settings" }) })
  ] });
}
export {
  Maintenance as default
};
