import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Bell, CheckCircle2, Sparkles } from "lucide-react";
import { Transition } from "@headlessui/react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function NotificationsTab() {
  const { auth } = usePage().props;
  const user = auth?.user;
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    notify_assignment_enabled: Boolean(user?.notify_assignment_enabled ?? true),
    notify_mention_enabled: Boolean(user?.notify_mention_enabled ?? true),
    notify_sound_enabled: Boolean(user?.notify_sound_enabled ?? true)
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("app.settings.notifications", {}), {
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Notification Preferences" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Control pings and sounds for the inbox" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Assignment pings" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Notify me when a conversation is assigned to me." })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  className: "sr-only peer",
                  checked: data.notify_assignment_enabled,
                  onChange: (e) => setData("notify_assignment_enabled", e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500" }),
              /* @__PURE__ */ jsx("div", { className: "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.notify_assignment_enabled, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Mention pings" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Notify me when I’m mentioned in internal notes." })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  className: "sr-only peer",
                  checked: data.notify_mention_enabled,
                  onChange: (e) => setData("notify_mention_enabled", e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500" }),
              /* @__PURE__ */ jsx("div", { className: "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.notify_mention_enabled, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Notification sound" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Play a short sound on mentions or assignments." })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  className: "sr-only peer",
                  checked: data.notify_sound_enabled,
                  onChange: (e) => setData("notify_sound_enabled", e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500" }),
              /* @__PURE__ */ jsx("div", { className: "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.notify_sound_enabled, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              disabled: processing,
              className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/40 rounded-xl",
              children: processing ? "Saving..." : "Save Preferences"
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
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-green-600 dark:text-green-400", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
                "Saved successfully"
              ] })
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
      "Mentions support @yourname or @youremail in internal notes."
    ] })
  ] });
}
export {
  NotificationsTab as default
};
