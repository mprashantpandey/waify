import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { c as cn } from "./utils-B2ZNUmII.js";
const Switch = React.forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          className: "sr-only peer",
          checked,
          onChange: (e) => onCheckedChange?.(e.target.checked),
          ref,
          ...props
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "relative h-6 w-11 rounded-full bg-gray-200 peer peer-checked:bg-waify-green peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-waify-green/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-waify-dark-border dark:bg-waify-dark-surface-2",
            className
          )
        }
      )
    ] });
  }
);
Switch.displayName = "Switch";
export {
  Switch as S
};
