import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { c as cn } from "./utils-B2ZNUmII.js";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text shadow-sm",
          "ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waify-green/20 focus-visible:border-waify-green focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-offset-waify-dark-bg",
          "dark:placeholder:text-waify-dark-text-muted dark:focus-visible:ring-waify-green/30",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
export {
  Input as I
};
