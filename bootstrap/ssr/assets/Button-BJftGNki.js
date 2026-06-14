import { jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import { c as cn } from "./utils-B2ZNUmII.js";
const Button = forwardRef(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-btn font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-waify-green/25 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-waify-dark-bg";
    const variants = {
      primary: "bg-waify-green text-white shadow-sm hover:bg-waify-green-dark",
      secondary: "bg-white text-waify-text hover:bg-gray-50 ring-1 ring-inset ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2",
      danger: "bg-red-600 text-white hover:bg-red-700",
      success: "bg-waify-green text-white shadow-sm hover:bg-waify-green-dark",
      warning: "bg-amber-500 text-white hover:bg-amber-600",
      info: "bg-waify-green-dark text-white hover:bg-waify-green",
      dark: "bg-waify-text text-white hover:bg-gray-800 dark:bg-waify-dark-text dark:text-waify-dark-bg dark:hover:bg-white",
      link: "px-0 text-waify-green-dark hover:underline dark:text-emerald-300",
      ghost: "text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text"
    };
    const sizes = {
      xs: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-3.5 text-sm gap-2",
      lg: "h-11 px-5 text-sm gap-2 rounded-xl",
      xl: "h-12 px-6 text-base gap-2 rounded-xl"
    };
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref,
        className: cn(baseStyles, variants[variant], sizes[size], className),
        ...props
      }
    );
  }
);
Button.displayName = "Button";
export {
  Button as B
};
