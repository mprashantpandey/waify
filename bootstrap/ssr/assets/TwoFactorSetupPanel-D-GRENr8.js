import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
function TwoFactorSetupPanel({ setup }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrError, setQrError] = useState(false);
  useEffect(() => {
    let active = true;
    setQrDataUrl(null);
    setQrError(false);
    QRCode.toDataURL(setup.otpauth_url, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 6,
      color: {
        dark: "#111827",
        light: "#ffffff"
      }
    }).then((url) => {
      if (active) setQrDataUrl(url);
    }).catch(() => {
      if (active) setQrError(true);
    });
    return () => {
      active = false;
    };
  }, [setup.otpauth_url]);
  return /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-[164px,minmax(0,1fr)]", children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-[164px] w-[164px] items-center justify-center rounded-card border border-gray-200 bg-white p-2 dark:border-slate-700", children: qrDataUrl ? /* @__PURE__ */ jsx("img", { src: qrDataUrl, alt: "Authenticator QR code", className: "h-full w-full" }) : /* @__PURE__ */ jsx("div", { className: "px-3 text-center text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: qrError ? "QR unavailable" : "Preparing QR..." }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Authenticator setup" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Scan this QR code in Google Authenticator, Microsoft Authenticator, 1Password, or another TOTP app." }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Manual key" }),
      /* @__PURE__ */ jsx("code", { className: "mt-2 block break-all rounded-btn bg-white p-2 font-mono text-xs dark:bg-slate-900", children: setup.secret })
    ] })
  ] }) });
}
export {
  TwoFactorSetupPanel as T
};
