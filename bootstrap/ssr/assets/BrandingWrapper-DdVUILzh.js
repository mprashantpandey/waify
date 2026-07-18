import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Sun, Moon, Monitor } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import { u as useTheme } from "./BrandLogo-TeztHB0m.js";
import { useRef, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
function ThemeToggle({ className, showSystem = false }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const Icon = resolvedTheme === "dark" ? Sun : Moon;
  if (showSystem) {
    const options = [
      { value: "light", icon: Sun, label: "Light" },
      { value: "dark", icon: Moon, label: "Dark" },
      { value: "system", icon: Monitor, label: "System" }
    ];
    return /* @__PURE__ */ jsx("div", { className: cn("inline-flex rounded-btn border border-gray-200 bg-white p-1 dark:border-waify-dark-border dark:bg-waify-dark-surface", className), children: options.map((option) => {
      const OptionIcon = option.icon;
      const active = theme === option.value;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setTheme(option.value),
          className: cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition",
            active ? "bg-waify-green text-waify-ink shadow-sm" : "text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text"
          ),
          "aria-pressed": active,
          title: option.label,
          children: [
            /* @__PURE__ */ jsx(OptionIcon, { className: "h-3.5 w-3.5", "aria-hidden": true }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: option.label })
          ]
        },
        option.value
      );
    }) });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: toggleTheme,
      className: cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-btn text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text focus:outline-none focus:ring-2 focus:ring-waify-green/25 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text",
        className
      ),
      "aria-label": resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      title: resolvedTheme === "dark" ? "Light theme" : "Dark theme",
      children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5", "aria-hidden": true })
    }
  );
}
function GlobalFlashHandler() {
  const { flash, errors } = usePage().props;
  const { addToast } = useToast();
  const lastPayloadRef = useRef("");
  useEffect(() => {
    const payloadSignature = JSON.stringify({
      flash: flash ?? null,
      errors: errors ?? null
    });
    if (lastPayloadRef.current === payloadSignature) {
      return;
    }
    lastPayloadRef.current = payloadSignature;
    const emitted = /* @__PURE__ */ new Set();
    const emit = (title, description, variant) => {
      const key = `${variant}|${title}|${description}`;
      if (emitted.has(key)) {
        return;
      }
      emitted.add(key);
      addToast({ title, description, variant, source: "flash" });
    };
    if (flash) {
      if (flash.success) {
        emit("Success", flash.success, "success");
      }
      if (flash.error) {
        emit("Error", flash.error, "error");
      }
      if (flash.warning) {
        emit("Warning", flash.warning, "warning");
      }
      if (flash.info) {
        emit("Info", flash.info, "info");
      }
      if (flash.status) {
        const statusMessages = {
          "verification-link-sent": { title: "Verification Link Sent", variant: "success" },
          "password-updated": { title: "Password Updated", variant: "success" },
          "profile-updated": { title: "Profile Updated", variant: "success" }
        };
        const config = statusMessages[flash.status] || { title: "Status", variant: "info" };
        emit(config.title, flash.status, config.variant);
      }
    }
    if (errors && typeof errors === "object" && Object.keys(errors).length > 0) {
      const messages = Object.entries(errors).map(([key, value]) => typeof value === "string" ? value : Array.isArray(value) ? value[0] : String(value)).filter(Boolean);
      const description = messages.length === 1 ? messages[0] : messages.slice(0, 3).join(" • ");
      const flashError = (flash?.error ?? "").trim().toLowerCase();
      if (!flashError || flashError !== description.trim().toLowerCase()) {
        emit("Error", description, "error");
      }
    }
  }, [flash, errors, addToast]);
  return null;
}
function BrandingWrapper({ children }) {
  const { branding } = usePage().props;
  const { resolvedTheme } = useTheme();
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
        } else if (currentTitle === "Laravel" || currentTitle === "Zyptos") {
          document.title = branding.platform_name;
        }
      } else {
        document.title = branding.platform_name;
      }
    }
    const faviconUrl = resolvedTheme === "dark" ? branding.favicon_dark_url || branding.favicon_url : branding.favicon_url || branding.favicon_dark_url;
    if (faviconUrl) {
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach((link2) => link2.remove());
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/png";
      link.href = faviconUrl;
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    if (branding.primary_color) {
      document.documentElement.style.setProperty("--brand-primary", branding.primary_color);
    }
    if (branding.secondary_color) {
      document.documentElement.style.setProperty("--brand-secondary", branding.secondary_color);
    }
  }, [branding, resolvedTheme]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    children,
    /* @__PURE__ */ jsx(GlobalFlashHandler, {})
  ] });
}
export {
  BrandingWrapper as B,
  ThemeToggle as T
};
