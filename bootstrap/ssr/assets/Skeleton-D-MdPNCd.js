import { jsx, jsxs } from "react/jsx-runtime";
function Skeleton({ className = "" }) {
  return /* @__PURE__ */ jsx("div", { className: `animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}` });
}
function ConversationSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-10 rounded-full" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-32" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-16" })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-2/3" })
    ] })
  ] }) });
}
function MessageSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "flex justify-start mb-4", children: /* @__PURE__ */ jsx("div", { className: "max-w-xs lg:max-w-md", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-full rounded-lg" }) }) });
}
export {
  ConversationSkeleton as C,
  MessageSkeleton as M
};
