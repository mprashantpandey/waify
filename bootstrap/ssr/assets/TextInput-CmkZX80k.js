import { jsx } from "react/jsx-runtime";
import { forwardRef, useRef, useImperativeHandle, useEffect } from "react";
const TextInput = forwardRef(function TextInput2({
  type = "text",
  className = "",
  isFocused = false,
  value,
  ...props
}, ref) {
  const localRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus()
  }));
  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);
  const safeValue = value === null || value === void 0 ? "" : value;
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      type,
      value: safeValue,
      className: "flex h-10 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text shadow-sm placeholder:text-gray-400 focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted dark:focus:ring-waify-green/30 " + className,
      ref: localRef
    }
  );
});
export {
  TextInput as T
};
