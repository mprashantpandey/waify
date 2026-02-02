import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Mail, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function MailTab({ data, setData, errors }) {
  const [showPassword, setShowPassword] = useState(false);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }),
      "Mail Configuration"
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mail.driver", value: "Driver" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "mail.driver",
            value: data.mail?.driver || "smtp",
            onChange: (e) => setData("mail.driver", e.target.value),
            className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "smtp", children: "SMTP" }),
              /* @__PURE__ */ jsx("option", { value: "sendmail", children: "Sendmail" }),
              /* @__PURE__ */ jsx("option", { value: "mailgun", children: "Mailgun" }),
              /* @__PURE__ */ jsx("option", { value: "ses", children: "Amazon SES" }),
              /* @__PURE__ */ jsx("option", { value: "postmark", children: "Postmark" }),
              /* @__PURE__ */ jsx("option", { value: "log", children: "Log" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["mail.driver"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mail.host", value: "Host" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "mail.host",
            type: "text",
            value: data.mail?.host || "",
            onChange: (e) => setData("mail.host", e.target.value),
            className: "mt-1",
            placeholder: "smtp.mailtrap.io"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["mail.host"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mail.port", value: "Port" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "mail.port",
            type: "number",
            value: data.mail?.port || 587,
            onChange: (e) => setData("mail.port", parseInt(e.target.value) || 587),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["mail.port"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mail.encryption", value: "Encryption" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "mail.encryption",
            value: data.mail?.encryption || "tls",
            onChange: (e) => setData("mail.encryption", e.target.value),
            className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "tls", children: "TLS" }),
              /* @__PURE__ */ jsx("option", { value: "ssl", children: "SSL" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["mail.encryption"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mail.username", value: "Username" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "mail.username",
            type: "text",
            value: data.mail?.username || "",
            onChange: (e) => setData("mail.username", e.target.value),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["mail.username"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mail.password", value: "Password" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "mail.password",
              type: showPassword ? "text" : "password",
              value: data.mail?.password || "",
              onChange: (e) => setData("mail.password", e.target.value),
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowPassword(!showPassword),
              className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors["mail.password"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mail.from_address", value: "From Address" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "mail.from_address",
            type: "email",
            value: data.mail?.from_address || "",
            onChange: (e) => setData("mail.from_address", e.target.value),
            className: "mt-1",
            placeholder: "noreply@example.com"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["mail.from_address"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mail.from_name", value: "From Name" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "mail.from_name",
            type: "text",
            value: data.mail?.from_name || "",
            onChange: (e) => setData("mail.from_name", e.target.value),
            className: "mt-1",
            placeholder: "WACP Platform"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["mail.from_name"] })
      ] })
    ] }) })
  ] });
}
export {
  MailTab as default
};
