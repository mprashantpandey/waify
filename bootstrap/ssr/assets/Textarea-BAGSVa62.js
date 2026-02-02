import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { c as cn } from "./utils-H80jjgLf.js";
import { ChevronDown } from "lucide-react";
const SelectContext = React.createContext(void 0);
const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  return /* @__PURE__ */ jsx(SelectContext.Provider, { value: { value, onValueChange, open, setOpen }, children: /* @__PURE__ */ jsx("div", { className: "relative", children }) });
};
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref,
      type: "button",
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        context.setOpen(!context.open);
      },
      className: cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-gray-700 dark:bg-gray-800 dark:ring-offset-gray-900 dark:focus:ring-blue-400",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(ChevronDown, { className: cn(
          "h-4 w-4 text-gray-500 transition-transform duration-200",
          context.open && "rotate-180"
        ) })
      ]
    }
  );
});
SelectTrigger.displayName = "SelectTrigger";
const SelectValue = ({ placeholder, children }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");
  if (children) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  return /* @__PURE__ */ jsx("span", { children: context.value || placeholder || "Select..." });
};
const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref && "current" in ref && ref.current && !ref.current.contains(event.target)) {
        context.setOpen(false);
      }
    };
    if (context.open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [context.open, ref]);
  if (!context.open) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg",
        "dark:border-gray-700 dark:bg-gray-800",
        className
      ),
      ...props,
      children
    }
  );
});
SelectContent.displayName = "SelectContent";
const SelectItem = React.forwardRef(
  ({ className, value, children, onClick, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) throw new Error("SelectItem must be used within Select");
    const isSelected = context.value === value;
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          context.onValueChange(value);
          context.setOpen(false);
          onClick?.(e);
        },
        className: cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-gray-100 focus:bg-gray-100",
          "dark:hover:bg-gray-700 dark:focus:bg-gray-700",
          isSelected && "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100",
          className
        ),
        ...props,
        children
      }
    );
  }
);
SelectItem.displayName = "SelectItem";
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:ring-offset-gray-900 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-400",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
export {
  Select as S,
  Textarea as T,
  SelectTrigger as a,
  SelectValue as b,
  SelectContent as c,
  SelectItem as d
};
