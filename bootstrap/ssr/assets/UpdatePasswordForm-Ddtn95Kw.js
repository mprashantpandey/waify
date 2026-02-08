import { jsx, jsxs } from "react/jsx-runtime";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { Transition } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import { useRef } from "react";
import { Lock, Shield, CheckCircle2 } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function UpdatePasswordForm({
  className = ""
}) {
  const passwordInput = useRef(null);
  const currentPasswordInput = useRef(null);
  const {
    data,
    setData,
    errors,
    put,
    reset,
    processing,
    recentlySuccessful
  } = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const updatePassword = (e) => {
    e.preventDefault();
    put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => reset(),
      onError: (errors2) => {
        if (errors2.password) {
          reset("password", "password_confirmation");
          passwordInput.current?.focus();
        }
        if (errors2.current_password) {
          reset("current_password");
          currentPasswordInput.current?.focus();
        }
      }
    });
  };
  return /* @__PURE__ */ jsx("section", { className, children: /* @__PURE__ */ jsxs("form", { onSubmit: updatePassword, className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        InputLabel,
        {
          htmlFor: "current_password",
          value: "Current Password",
          className: "text-sm font-semibold mb-2"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "current_password",
            ref: currentPasswordInput,
            value: data.current_password,
            onChange: (e) => setData("current_password", e.target.value),
            type: "password",
            className: "mt-1 block w-full pl-10 rounded-xl",
            autoComplete: "current-password",
            placeholder: "Enter current password"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        InputError,
        {
          message: errors.current_password,
          className: "mt-2"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "New Password", className: "text-sm font-semibold mb-2" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Shield, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "password",
            ref: passwordInput,
            value: data.password,
            onChange: (e) => setData("password", e.target.value),
            type: "password",
            className: "mt-1 block w-full pl-10 rounded-xl",
            autoComplete: "new-password",
            placeholder: "Enter new password"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        InputLabel,
        {
          htmlFor: "password_confirmation",
          value: "Confirm Password",
          className: "text-sm font-semibold mb-2"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Shield, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "password_confirmation",
            value: data.password_confirmation,
            onChange: (e) => setData("password_confirmation", e.target.value),
            type: "password",
            className: "mt-1 block w-full pl-10 rounded-xl",
            autoComplete: "new-password",
            placeholder: "Confirm new password"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        InputError,
        {
          message: errors.password_confirmation,
          className: "mt-2"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: processing,
          className: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl",
          children: processing ? "Updating..." : "Update Password"
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
  ] }) });
}
export {
  UpdatePasswordForm as default
};
