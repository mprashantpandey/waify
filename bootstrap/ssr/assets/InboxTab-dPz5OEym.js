import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { Sparkles, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function InboxTab() {
  const { account } = usePage().props;
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    auto_assign_enabled: Boolean(account?.auto_assign_enabled),
    auto_assign_strategy: account?.auto_assign_strategy || "round_robin",
    welcome_message_enabled: Boolean(account?.welcome_message_enabled),
    welcome_message_body: account?.welcome_message_body || "Hi {{name}}, thanks for messaging us. Our team will reply shortly.",
    auto_close_conversations_enabled: Boolean(account?.auto_close_conversations_enabled),
    auto_close_after_hours: account?.auto_close_after_hours || 48
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("app.settings.inbox", {}), {
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-waify-green-dark dark:text-emerald-300" }),
            "Auto-assign incoming chats"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Automatically distribute new conversations among your agents." })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "relative inline-flex cursor-pointer items-center", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "peer sr-only",
              checked: data.auto_assign_enabled,
              onChange: (e) => setData("auto_assign_enabled", e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-waify-green peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-waify-green/20 dark:bg-slate-700" }),
          /* @__PURE__ */ jsx("div", { className: "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(InputError, { message: errors.auto_assign_enabled, className: "mt-2 text-xs" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Assignment strategy" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: data.auto_assign_strategy,
          onChange: (e) => setData("auto_assign_strategy", e.target.value),
          className: "block h-9 w-full rounded-btn border-gray-200 bg-white px-3 text-sm shadow-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text",
          disabled: !data.auto_assign_enabled,
          children: /* @__PURE__ */ jsx("option", { value: "round_robin", children: "Round robin" })
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.auto_assign_strategy, className: "mt-2 text-xs" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Round robin rotates assignments evenly across owners, admins, and members." })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4 text-waify-green-dark dark:text-emerald-300" }),
            "Welcome message"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Send a first response automatically when a new contact opens a chat." })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "relative inline-flex cursor-pointer items-center", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "peer sr-only",
              checked: data.welcome_message_enabled,
              onChange: (e) => setData("welcome_message_enabled", e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-waify-green peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-waify-green/20 dark:bg-slate-700" }),
          /* @__PURE__ */ jsx("div", { className: "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: data.welcome_message_body,
            onChange: (e) => setData("welcome_message_body", e.target.value),
            disabled: !data.welcome_message_enabled,
            rows: 4,
            className: "block w-full rounded-2xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-waify-green focus:ring-waify-green/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-waify-text-muted dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text dark:disabled:bg-slate-950 dark:disabled:text-waify-dark-text-muted",
            placeholder: "Hi {{name}}, thanks for messaging us. Our team will reply shortly."
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.welcome_message_enabled, className: "mt-2 text-xs" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.welcome_message_body, className: "mt-2 text-xs" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          "Available placeholders: ",
          "{{name}}",
          ", ",
          "{{phone}}",
          ", ",
          "{{workspace}}",
          "."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100", children: data.welcome_message_body.replaceAll("{{name}}", "Prashant").replaceAll("{{phone}}", "+91 99887 76655").replaceAll("{{workspace}}", account?.name || "Zyptos Business") })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-waify-green-dark dark:text-emerald-300" }),
            "Auto-close inactive chats"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Keep the inbox clean by closing conversations that have no activity for a set number of hours." })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "relative inline-flex cursor-pointer items-center", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "peer sr-only",
              checked: data.auto_close_conversations_enabled,
              onChange: (e) => setData("auto_close_conversations_enabled", e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-waify-green peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-waify-green/20 dark:bg-slate-700" }),
          /* @__PURE__ */ jsx("div", { className: "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 max-w-xs space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "Inactive hours before close" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: 1,
            max: 720,
            value: data.auto_close_after_hours,
            disabled: !data.auto_close_conversations_enabled,
            onChange: (e) => setData("auto_close_after_hours", Number(e.target.value)),
            className: "block h-9 w-full rounded-btn border-gray-200 bg-white px-3 text-sm shadow-sm focus:border-waify-green focus:ring-waify-green/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-waify-text-muted dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.auto_close_conversations_enabled, className: "mt-2 text-xs" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.auto_close_after_hours, className: "mt-2 text-xs" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 border-t border-gray-100 pt-4 dark:border-slate-700", children: [
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: processing ? "Saving..." : "Save settings" }),
      /* @__PURE__ */ jsx(Transition, { show: recentlySuccessful, enter: "transition ease-in-out", enterFrom: "opacity-0", leave: "transition ease-in-out", leaveTo: "opacity-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
        "Saved"
      ] }) })
    ] })
  ] });
}
export {
  InboxTab as default
};
