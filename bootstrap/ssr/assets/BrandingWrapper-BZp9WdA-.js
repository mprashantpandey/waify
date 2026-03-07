import { jsx, Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { g as getPlatformName } from "../ssr.js";
function BrandingWrapper({ children }) {
  const { branding } = usePage().props;
  const platformName = getPlatformName(branding);
  useEffect(() => {
    if (!branding) {
      return;
    }
    window.__brandingName = platformName;
    const currentTitle = document.title;
    if (currentTitle) {
      const titleParts = currentTitle.split(" - ");
      if (titleParts.length > 1 && titleParts[titleParts.length - 1] !== platformName) {
        const pageTitle = titleParts.slice(0, -1).join(" - ");
        document.title = `${pageTitle} - ${platformName}`;
      } else if (titleParts.length === 1 && !currentTitle.includes(platformName)) {
        document.title = currentTitle === "Laravel" || currentTitle === "Laravel" ? platformName : `${currentTitle} - ${platformName}`;
      }
    } else {
      document.title = platformName;
    }
    if (branding.favicon_url) {
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach((link2) => link2.remove());
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = branding.favicon_url.endsWith(".ico") ? "image/x-icon" : "image/png";
      link.href = branding.favicon_url;
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    if (branding.primary_color) {
      document.documentElement.style.setProperty("--brand-primary", branding.primary_color);
    }
    if (branding.secondary_color) {
      document.documentElement.style.setProperty("--brand-secondary", branding.secondary_color);
    }
  }, [branding, platformName]);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
export {
  BrandingWrapper as B
};
