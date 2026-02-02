import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { B as Button } from "./Button-BocaoVWt.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { useForm } from "@inertiajs/react";
import { useState, useRef } from "react";
import { AlertTriangle, Lock, Trash2 } from "lucide-react";
import { u as useNotifications } from "./useNotifications-802S-ToN.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./useToast-DNfJQ6ZA.js";
import "./useConfirm-94UId2r4.js";
function DeleteUserForm({
  className = ""
}) {
  const { confirm, toast } = useNotifications();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const passwordInput = useRef(null);
  const {
    data,
    setData,
    delete: destroy,
    processing,
    reset,
    errors,
    clearErrors
  } = useForm({
    password: ""
  });
  const deleteUser = async (e) => {
    e.preventDefault();
    const confirmed = await confirm({
      title: "Delete Account",
      message: "Are you sure you want to delete your account? This action cannot be undone. All of your data will be permanently deleted.",
      variant: "danger",
      confirmText: "Delete Account"
    });
    if (!confirmed) {
      return;
    }
    destroy(route("profile.destroy"), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Account deleted successfully");
      },
      onError: () => {
        passwordInput.current?.focus();
        toast.error("Failed to delete account. Please check your password.");
      },
      onFinish: () => reset()
    });
  };
  return /* @__PURE__ */ jsxs("section", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-red-800 dark:text-red-200 mb-1", children: "Warning: This action is permanent" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700 dark:text-red-300", children: "Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: deleteUser, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          InputLabel,
          {
            htmlFor: "password",
            value: "Confirm Password",
            className: "text-sm font-semibold mb-2"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "password",
              type: "password",
              name: "password",
              ref: passwordInput,
              value: data.password,
              onChange: (e) => setData("password", e.target.value),
              className: "block w-full pl-10 rounded-xl",
              placeholder: "Enter your password to confirm"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          InputError,
          {
            message: errors.password,
            className: "mt-2"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          variant: "danger",
          disabled: processing,
          className: "w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50 rounded-xl",
          children: processing ? "Deleting Account..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
            "Delete Account"
          ] })
        }
      )
    ] })
  ] });
}
export {
  DeleteUserForm as default
};
