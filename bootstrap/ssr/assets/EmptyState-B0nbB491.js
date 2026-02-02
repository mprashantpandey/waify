import { jsxs, jsx } from "react/jsx-runtime";
function EmptyState({ icon: Icon, title, description, action }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-4", children: [
    /* @__PURE__ */ jsx("div", { className: "rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-4", children: /* @__PURE__ */ jsx(Icon, { className: "h-8 w-8 text-gray-400 dark:text-gray-500" }) }),
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4", children: description }),
    action && /* @__PURE__ */ jsx("div", { className: "mt-4", children: action })
  ] });
}
export {
  EmptyState as E
};
