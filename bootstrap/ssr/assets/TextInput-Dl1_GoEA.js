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
      className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500 " + className,
      ref: localRef
    }
  );
});
export {
  TextInput as T
};
