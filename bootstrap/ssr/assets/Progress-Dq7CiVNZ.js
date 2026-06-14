import { jsx } from "react/jsx-runtime";
import { c as cn } from "./utils-B2ZNUmII.js";
function Progress({ value, className, max = 100, variant = "default" }) {
  const percentage = Math.min(Math.max(value / max * 100, 0), 100);
  const colorClasses = {
    default: "bg-waify-green dark:bg-waify-green",
    success: "bg-green-600 dark:bg-green-500",
    warning: "bg-yellow-600 dark:bg-yellow-500",
    danger: "bg-red-600 dark:bg-red-500"
  };
  return /* @__PURE__ */ jsx("div", { className: cn("h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-waify-dark-surface-2", className), children: /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("h-full rounded-full transition-all duration-300", colorClasses[variant]),
      style: { width: `${percentage}%` },
      role: "progressbar",
      "aria-valuenow": value,
      "aria-valuemin": 0,
      "aria-valuemax": max
    }
  ) });
}
export {
  Progress as P
};
