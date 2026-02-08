import { jsx } from "react/jsx-runtime";
import { c as cn } from "./utils-B2ZNUmII.js";
function Card({ className, children, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
        className
      ),
      ...props,
      children
    }
  );
}
function CardHeader({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("px-6 py-4 border-b border-gray-200 dark:border-gray-800", className), ...props, children });
}
function CardTitle({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("h3", { className: cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className), ...props, children });
}
function CardDescription({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("p", { className: cn("text-sm text-gray-500 dark:text-gray-400 mt-1", className), ...props, children });
}
function CardContent({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("px-6 py-4", className), ...props, children });
}
export {
  Card as C,
  CardContent as a,
  CardHeader as b,
  CardTitle as c,
  CardDescription as d
};
