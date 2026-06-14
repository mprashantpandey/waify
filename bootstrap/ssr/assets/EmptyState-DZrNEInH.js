import { jsxs, jsx } from "react/jsx-runtime";
function EmptyState({ icon: Icon, title, description, action }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center px-4 py-12", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-full bg-waify-green-soft p-4 text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200", children: /* @__PURE__ */ jsx(Icon, { className: "h-8 w-8" }) }),
    /* @__PURE__ */ jsx("h3", { className: "mb-2 text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "mb-4 max-w-md text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description }),
    action && /* @__PURE__ */ jsx("div", { className: "mt-4", children: action })
  ] });
}
export {
  EmptyState as E
};
