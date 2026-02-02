import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { c as cn } from "./utils-H80jjgLf.js";
const Label = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "label",
      {
        ref,
        className: cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          "text-gray-700 dark:text-gray-300",
          className
        ),
        ...props
      }
    );
  }
);
Label.displayName = "Label";
export {
  Label as L
};
