import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, router } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Shield, Lock, Save, CheckCircle2, Trash2 } from "lucide-react";
import { u as useNotifications } from "./useNotifications-CTnw084D.js";
import { Transition } from "@headlessui/react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
import "./useToast-C5ECijgs.js";
import "./useConfirm-BKf7Nv1N.js";
function SecurityTab() {
  const { confirm, toast } = useNotifications();
  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Password updated successfully");
        reset();
      },
      onError: () => {
        toast.error("Failed to update password");
      }
    });
  };
  const deleteAccount = async () => {
    const confirmed = await confirm({
      title: "Delete Account",
      message: "Are you sure you want to delete your account? This action cannot be undone. All of your data will be permanently deleted.",
      variant: "danger",
      confirmText: "Delete Account"
    });
    if (!confirmed) return;
    const password = prompt("Please enter your password to confirm:");
    if (!password) return;
    router.delete(route("profile.destroy"), {
      data: { password },
      onSuccess: () => {
        toast.success("Account deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete account");
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-purple-500 rounded-xl", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Update Password" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Ensure your account is using a long, random password to stay secure" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "current_password", value: "Current Password", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "current_password",
                type: "password",
                value: data.current_password,
                onChange: (e) => setData("current_password", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: true,
                placeholder: "Enter current password"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.current_password, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "New Password", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "password",
                type: "password",
                value: data.password,
                onChange: (e) => setData("password", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: true,
                placeholder: "Enter new password"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password_confirmation", value: "Confirm Password", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "password_confirmation",
                type: "password",
                value: data.password_confirmation,
                onChange: (e) => setData("password_confirmation", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: true,
                placeholder: "Confirm new password"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.password_confirmation, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              disabled: processing,
              className: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl",
              children: processing ? "Updating..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
                "Update Password"
              ] })
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
                "Password updated"
              ] })
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg border-red-200 dark:border-red-800", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-red-500 rounded-xl", children: /* @__PURE__ */ jsx(Trash2, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold text-red-900 dark:text-red-100", children: "Delete Account" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-red-700 dark:text-red-300", children: "Permanently delete your account and all associated data" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: "Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain." }) }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "danger",
            onClick: deleteAccount,
            className: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50 rounded-xl",
            children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
              "Delete Account"
            ]
          }
        )
      ] })
    ] })
  ] });
}
export {
  SecurityTab as default
};
