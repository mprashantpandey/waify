import { jsx, jsxs } from "react/jsx-runtime";
import { useForm } from "@inertiajs/react";
import { G as Guest } from "./GuestLayout-D8lrkWRg.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function Onboarding() {
  const { data, setData, post, processing, errors } = useForm({
    name: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("onboarding.store"));
  };
  return /* @__PURE__ */ jsx(Guest, { children: /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100", children: "Create Your Workspace" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-sm text-gray-600 dark:text-gray-400", children: "Get started by creating your first workspace" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "mt-8 space-y-6", onSubmit: submit, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Workspace Name" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "name",
            type: "text",
            value: data.name,
            className: "mt-1 block w-full",
            onChange: (e) => setData("name", e.target.value),
            required: true,
            autoFocus: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: processing, children: "Create Workspace" }) })
    ] })
  ] }) }) });
}
export {
  Onboarding as default
};
