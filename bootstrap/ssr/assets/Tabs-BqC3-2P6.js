import { jsx } from "react/jsx-runtime";
import { useState, useContext, createContext } from "react";
import { c as cn } from "./utils-H80jjgLf.js";
const TabsContext = createContext(void 0);
function Tabs({ children, defaultValue, value: controlledValue, onValueChange, className }) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const isControlled = controlledValue !== void 0;
  const currentValue = isControlled ? controlledValue : internalValue;
  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };
  return /* @__PURE__ */ jsx(TabsContext.Provider, { value: { value: currentValue, onValueChange: handleValueChange }, children: /* @__PURE__ */ jsx("div", { className: cn("w-full", className), children }) });
}
function TabsList({ children, className }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400",
        className
      ),
      role: "tablist",
      children
    }
  );
}
function TabsTrigger({ value, children, className, ...props }) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }
  const isActive = context.value === value;
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => context.onValueChange(value),
      className: cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950",
        isActive ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
        className
      ),
      ...props,
      children
    }
  );
}
function TabsContent({ value, children, className }) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }
  if (context.value !== value) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:ring-offset-gray-950",
        className
      ),
      children
    }
  );
}
function useTabs(defaultValue) {
  const [value, setValue] = useState(defaultValue);
  return { value, setValue };
}
export {
  Tabs as T,
  TabsList as a,
  TabsTrigger as b,
  TabsContent as c,
  useTabs as u
};
