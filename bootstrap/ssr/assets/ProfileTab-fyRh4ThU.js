import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { usePage, useForm } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { User, Mail, Phone, Save, CheckCircle2 } from "lucide-react";
import { Transition } from "@headlessui/react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function ProfileTab() {
  const { auth, mustVerifyEmail } = usePage().props;
  const user = auth?.user;
  const { data, setData, patch, processing, errors, reset, recentlySuccessful } = useForm({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });
  const submit = (e) => {
    e.preventDefault();
    patch(route("profile.update"), {
      preserveScroll: true,
      onSuccess: () => reset()
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Profile Information" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Update your account's profile information and email address" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Full Name", className: "text-sm font-semibold mb-2" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "name",
              type: "text",
              value: data.name,
              onChange: (e) => setData("name", e.target.value),
              className: "mt-1 block w-full pl-10 rounded-xl",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
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
              value: data.email,
              onChange: (e) => setData("email", e.target.value),
              className: "mt-1 block w-full pl-10 rounded-xl",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
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
              value: data.phone,
              onChange: (e) => setData("phone", e.target.value),
              className: "mt-1 block w-full pl-10 rounded-xl",
              required: true,
              placeholder: "+1234567890"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.phone, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: processing,
            className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
            children: processing ? "Saving..." : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
              "Save Changes"
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
              "Saved successfully"
            ] })
          }
        )
      ] })
    ] }) })
  ] }) });
}
export {
  ProfileTab as default
};
