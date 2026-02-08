import { jsx, jsxs } from "react/jsx-runtime";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { Transition } from "@headlessui/react";
import { usePage, useForm, Link } from "@inertiajs/react";
import { User, Mail, Phone, Send, CheckCircle2 } from "lucide-react";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function UpdateProfileInformation({
  mustVerifyEmail,
  status,
  className = ""
}) {
  const user = usePage().props.auth.user;
  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || ""
  });
  const submit = (e) => {
    e.preventDefault();
    patch(route("profile.update"));
  };
  return /* @__PURE__ */ jsx("section", { className, children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Full Name", className: "text-sm font-semibold mb-2" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "name",
            className: "mt-1 block w-full pl-10 rounded-xl",
            value: data.name,
            onChange: (e) => setData("name", e.target.value),
            required: true,
            autoComplete: "name"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: errors.name })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email Address", className: "text-sm font-semibold mb-2" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "email",
            type: "email",
            className: "mt-1 block w-full pl-10 rounded-xl",
            value: data.email,
            onChange: (e) => setData("email", e.target.value),
            required: true,
            autoComplete: "username"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: errors.email })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: "phone", value: "Phone Number", className: "text-sm font-semibold mb-2" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Phone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "phone",
            type: "tel",
            className: "mt-1 block w-full pl-10 rounded-xl",
            value: data.phone,
            onChange: (e) => setData("phone", e.target.value),
            required: true,
            autoComplete: "tel",
            placeholder: "+1234567890"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: errors.phone })
    ] }),
    mustVerifyEmail && user.email_verified_at === null && /* @__PURE__ */ jsxs(Alert, { variant: "warning", children: [
      /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Your email address is unverified." }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("verification.send"),
            method: "post",
            as: "button",
            className: "mt-1 text-sm underline hover:no-underline flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
              "Click here to re-send the verification email."
            ]
          }
        ),
        status === "verification-link-sent" && /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm font-medium text-green-600 dark:text-green-400", children: "A new verification link has been sent to your email address." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: processing,
          className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
          children: processing ? "Saving..." : "Save Changes"
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
  ] }) });
}
export {
  UpdateProfileInformation as default
};
