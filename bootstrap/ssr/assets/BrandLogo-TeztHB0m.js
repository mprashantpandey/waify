import { jsxs, jsx } from "react/jsx-runtime";
import { usePage } from "@inertiajs/react";
import { useContext, createContext, useState, useEffect } from "react";
import { c as cn } from "./utils-B2ZNUmII.js";
const ThemeContext = createContext(void 0);
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
function ZyptosLogo({
  size = 30,
  withText = true,
  textClassName = "text-waify-text"
}) {
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
    /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", width: size, height: size, "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: `zyptosLogo${size}`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#00A548" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#128C7E" })
      ] }) }),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M20 3 C29.4 3 37 9.8 37 18.2 C37 26.6 29.4 33.4 20 33.4 C18.2 33.4 16.4 33.1 14.7 32.6 L5 35 L7.5 26.6 C5.9 24.1 5 21.2 5 18.2 C5 9.8 12.6 3 20 3 Z",
          fill: `url(#zyptosLogo${size})`
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M11.5 13 L14.5 25 L17.5 17 L20.5 25 L23.5 17 L26.5 25 L29.5 13",
          stroke: "white",
          strokeWidth: "2.4",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "none"
        }
      )
    ] }),
    withText && /* @__PURE__ */ jsx("span", { className: `text-lg font-bold tracking-tight ${textClassName}`, children: "Zyptos" })
  ] });
}
function BrandLogo({
  variant = "auto",
  compact = false,
  className,
  imageClassName,
  fallbackTextClassName = "text-waify-text dark:text-waify-dark-text"
}) {
  const { branding } = usePage().props;
  const { resolvedTheme } = useTheme();
  const mode = variant === "auto" ? resolvedTheme : variant;
  const platformName = branding?.platform_name || "Zyptos";
  const [failedLogoUrls, setFailedLogoUrls] = useState([]);
  const bundledLogoUrl = compact ? mode === "dark" ? "/images/brand/zyptos-icon-white.png" : "/images/brand/zyptos-icon-dark.png" : mode === "dark" ? "/images/brand/zyptos-logo-white.png" : "/images/brand/zyptos-logo-dark.png";
  const logoUrl = compact ? mode === "dark" ? branding?.sidebar_icon_dark_url || branding?.logo_dark_url || bundledLogoUrl : branding?.sidebar_icon_url || branding?.logo_url || bundledLogoUrl : mode === "dark" ? branding?.logo_dark_url || bundledLogoUrl : branding?.logo_url || bundledLogoUrl;
  const failedSet = new Set(failedLogoUrls);
  const effectiveLogoUrl = failedSet.has(logoUrl) ? bundledLogoUrl : logoUrl;
  const showImage = Boolean(!failedSet.has(effectiveLogoUrl));
  useEffect(() => {
    setFailedLogoUrls([]);
  }, [logoUrl]);
  return /* @__PURE__ */ jsx("span", { className: cn("inline-flex min-w-0 items-center gap-2", className), children: showImage ? /* @__PURE__ */ jsx(
    "img",
    {
      src: effectiveLogoUrl,
      alt: platformName,
      className: cn(compact ? "h-8 w-8 object-contain" : "h-8 w-auto max-w-full object-contain", imageClassName),
      loading: "eager",
      decoding: "async",
      onError: () => setFailedLogoUrls((current) => !current.includes(effectiveLogoUrl) ? [...current, effectiveLogoUrl] : current)
    }
  ) : /* @__PURE__ */ jsx(ZyptosLogo, { withText: !compact, textClassName: fallbackTextClassName }) });
}
export {
  BrandLogo as B,
  useTheme as u
};
