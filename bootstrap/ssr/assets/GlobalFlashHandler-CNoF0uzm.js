import { jsx, jsxs } from "react/jsx-runtime";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { Info, AlertCircle, XCircle, CheckCircle, X } from "lucide-react";
import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
function Toaster() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed top-4 right-4 z-50 space-y-2 max-w-md", children: toasts.map((toast) => /* @__PURE__ */ jsx(ToastItem, { toast, onClose: () => removeToast(toast.id) }, toast.id)) });
}
function ToastItem({ toast, onClose }) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(onClose, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);
  const variant = toast.variant || "info";
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };
  const colors = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
  };
  const Icon = icons[variant] || Info;
  const colorClass = colors[variant] || colors.info;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `${colorClass} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right`,
      role: "alert",
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-sm", children: toast.title }),
          toast.description && /* @__PURE__ */ jsx("p", { className: "text-sm mt-1 opacity-90", children: toast.description })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
          }
        )
      ]
    }
  );
}
function GlobalFlashHandler() {
  const { flash, errors } = usePage().props;
  const { addToast } = useToast();
  useEffect(() => {
    if (flash) {
      if (flash.success) {
        addToast({ title: "Success", description: flash.success, variant: "success" });
      }
      if (flash.error) {
        addToast({ title: "Error", description: flash.error, variant: "error" });
      }
      if (flash.warning) {
        addToast({ title: "Warning", description: flash.warning, variant: "warning" });
      }
      if (flash.info) {
        addToast({ title: "Info", description: flash.info, variant: "info" });
      }
      if (flash.status) {
        const statusMessages = {
          "verification-link-sent": { title: "Verification Link Sent", variant: "success" },
          "password-updated": { title: "Password Updated", variant: "success" },
          "profile-updated": { title: "Profile Updated", variant: "success" }
        };
        const config = statusMessages[flash.status] || { title: "Status", variant: "info" };
        addToast({ title: config.title, description: flash.status, variant: config.variant });
      }
    }
    if (errors && typeof errors === "object" && Object.keys(errors).length > 0) {
      const messages = Object.entries(errors).map(([key, value]) => typeof value === "string" ? value : Array.isArray(value) ? value[0] : String(value)).filter(Boolean);
      const description = messages.length === 1 ? messages[0] : messages.slice(0, 3).join(" • ");
      addToast({ title: "Error", description, variant: "error" });
    }
  }, [flash, errors, addToast]);
  return null;
}
export {
  GlobalFlashHandler as G,
  Toaster as T
};
