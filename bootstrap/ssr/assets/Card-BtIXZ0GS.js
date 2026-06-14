import { jsx } from "react/jsx-runtime";
import { c as cn } from "./utils-B2ZNUmII.js";
function Card({ className, children, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "surface rounded-card border border-transparent bg-white shadow-card dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-none",
        className
      ),
      ...props,
      children
    }
  );
}
function CardHeader({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", className), ...props, children });
}
function CardTitle({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("h3", { className: cn("text-base font-semibold text-waify-text dark:text-waify-dark-text", className), ...props, children });
}
function CardDescription({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("p", { className: cn("mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", className), ...props, children });
}
function CardContent({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("px-5 py-4", className), ...props, children });
}
export {
  Card as C,
  CardContent as a,
  CardHeader as b,
  CardTitle as c,
  CardDescription as d
};
