import { jsx, Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
function BrandingWrapper({ children }) {
  const { branding } = usePage().props;
  useEffect(() => {
    if (!branding) {
      return;
    }
    if (branding.platform_name) {
      window.__brandingName = branding.platform_name;
    }
    if (branding.platform_name) {
      const currentTitle = document.title;
      if (currentTitle) {
        const titleParts = currentTitle.split(" - ");
        if (titleParts.length > 1 && titleParts[titleParts.length - 1] !== branding.platform_name) {
          const pageTitle = titleParts.slice(0, -1).join(" - ");
          document.title = `${pageTitle} - ${branding.platform_name}`;
        } else if (titleParts.length === 1 && currentTitle !== branding.platform_name) {
          if (!currentTitle.includes(branding.platform_name)) {
            document.title = `${currentTitle} - ${branding.platform_name}`;
          }
        } else if (currentTitle === "Laravel" || currentTitle === "Laravel") {
          document.title = branding.platform_name;
        }
      } else {
        document.title = branding.platform_name;
      }
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
  }, [branding]);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
export {
  BrandingWrapper as B
};
