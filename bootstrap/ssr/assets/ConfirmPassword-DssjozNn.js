import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { G as Guest } from "./GuestLayout-D8lrkWRg.js";
import { useForm, Head } from "@inertiajs/react";
import { Shield, Lock, ArrowRight } from "lucide-react";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-B2Mh0bYb.js";
function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm({
    password: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("password.confirm"), {
      onFinish: () => reset("password")
    });
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Confirm Password" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 mb-4", children: /* @__PURE__ */ jsx(Shield, { className: "h-10 w-10 text-purple-600 dark:text-purple-400" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Confirm Password" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "This is a secure area of the application. Please confirm your password before continuing." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "Password", className: "text-sm font-semibold mb-2" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "password",
              type: "password",
              name: "password",
              value: data.password,
              className: "mt-1 block w-full pl-10 rounded-xl",
              isFocused: true,
              onChange: (e) => setData("password", e.target.value),
              placeholder: "Enter your password"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: processing,
          className: "w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl",
          children: processing ? "Confirming..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Confirm Password",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
          ] })
        }
      )
    ] })
  ] });
}
export {
  ConfirmPassword as default
};
