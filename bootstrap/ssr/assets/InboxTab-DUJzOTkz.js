import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, useForm } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Inbox, Sparkles, CheckCircle2 } from "lucide-react";
import { Transition } from "@headlessui/react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function InboxTab() {
  const { account } = usePage().props;
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    auto_assign_enabled: Boolean(account?.auto_assign_enabled),
    auto_assign_strategy: account?.auto_assign_strategy || "round_robin"
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("app.settings.inbox", {}), {
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 bg-emerald-500 rounded-xl", children: /* @__PURE__ */ jsx(Inbox, { className: "h-5 w-5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Inbox Routing" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Control how conversations are assigned to agents" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-700/50 dark:bg-gray-900", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-emerald-600" }),
              "Auto-assign incoming chats"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Automatically distribute new conversations among your agents." })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                className: "sr-only peer",
                checked: data.auto_assign_enabled,
                onChange: (e) => setData("auto_assign_enabled", e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30 rounded-full peer dark:bg-gray-700 peer-checked:bg-emerald-500" }),
            /* @__PURE__ */ jsx("div", { className: "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.auto_assign_enabled, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Assignment strategy" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: data.auto_assign_strategy,
            onChange: (e) => setData("auto_assign_strategy", e.target.value),
            className: "mt-1 block w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800",
            disabled: !data.auto_assign_enabled,
            children: /* @__PURE__ */ jsx("option", { value: "round_robin", children: "Round robin" })
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.auto_assign_strategy, className: "mt-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Round robin rotates assignments evenly across owners, admins, and members." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: processing,
            className: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/40 rounded-xl",
            children: processing ? "Saving..." : "Save Settings"
          }
        ),
        /* @__PURE__ */ jsx(
          Transition,
          {
            show: recentlySuccessful,
            enter: "transition ease-in-out",
            enterFrom: "opacity-0",
            leave: "transition ease-in-out",
            leaveTo: "opacity-0",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
              "Saved successfully"
            ] })
          }
        )
      ] })
    ] }) })
  ] }) });
}
export {
  InboxTab as default
};
