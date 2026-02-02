import { jsxs, jsx } from "react/jsx-runtime";
import { Info, AlertCircle, XCircle, CheckCircle, X } from "lucide-react";
import { c as cn } from "./utils-H80jjgLf.js";
function Alert({ variant = "info", title, children, onClose, className }) {
  const variants = {
    success: {
      container: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
      icon: CheckCircle
    },
    error: {
      container: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
      icon: XCircle
    },
    warning: {
      container: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
      icon: AlertCircle
    },
    info: {
      container: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
      icon: Info
    }
  };
  const config = variants[variant];
  const Icon = config.icon;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "border rounded-lg p-4 flex items-start gap-3",
        config.container,
        className
      ),
      role: "alert",
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          title && /* @__PURE__ */ jsx("p", { className: "font-medium text-sm mb-1", children: title }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children })
        ] }),
        onClose && /* @__PURE__ */ jsx(
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
export {
  Alert as A
};
