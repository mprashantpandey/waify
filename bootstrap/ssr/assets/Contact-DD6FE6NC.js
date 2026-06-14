import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head } from "@inertiajs/react";
import { Send, Mail, MapPin, Clock, ShieldCheck } from "lucide-react";
import { f as MarketingLayout } from "./Marketing-xvuXbqSy.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import "react";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./ProviderLogo-DiN8H8HE.js";
const contactReasons = [
  "Sales and pricing",
  "Meta/WABA setup",
  "Billing or invoice",
  "Migration help",
  "Technical support",
  "Enterprise review"
];
function Contact() {
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const submit = (event) => {
    event.preventDefault();
    post(route("contact.submit"));
  };
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "contact", wide: true, children: [
    /* @__PURE__ */ jsx(Head, { title: "Contact" }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_360px]", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
        recentlySuccessful && /* @__PURE__ */ jsx("div", { className: "mb-6 rounded-xl border border-waify-green/30 bg-waify-green/10 p-4 text-sm font-semibold text-waify-green-dark", children: "Thank you. We received your message and will get back to you soon." }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Name", error: errors.name, children: /* @__PURE__ */ jsx(Input, { value: data.name, onChange: (event) => setData("name", event.target.value), required: true, placeholder: "Your full name" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Work email", error: errors.email, children: /* @__PURE__ */ jsx(Input, { type: "email", value: data.email, onChange: (event) => setData("email", event.target.value), required: true, placeholder: "you@company.com" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "What do you need help with?" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: contactReasons.map((reason) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setData("subject", reason),
                className: `rounded-full border px-3 py-1.5 text-xs font-medium transition ${data.subject === reason ? "border-waify-green bg-waify-green text-white" : "border-gray-200 bg-white text-waify-text-muted hover:border-waify-green/50 hover:text-waify-green-dark dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text-muted"}`,
                children: reason
              },
              reason
            )) })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Topic", error: errors.subject, children: /* @__PURE__ */ jsx(Input, { value: data.subject, onChange: (event) => setData("subject", event.target.value), required: true, placeholder: "Sales, support, billing, Meta setup..." }) }),
          /* @__PURE__ */ jsx(Field, { label: "Message", error: errors.message, children: /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 6,
              value: data.message,
              onChange: (event) => setData("message", event.target.value),
              required: true,
              placeholder: "Tell us about your use case, workspace, Meta app, billing question, or timeline.",
              className: "block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
            }
          ) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, size: "lg", className: "w-full", children: processing ? "Sending..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
            " Send message"
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-center text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "For faster routing, include your workspace name, connected WhatsApp number, invoice number, Meta app ID, or error screenshot details where relevant." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("aside", { className: "space-y-4", children: [
        [Mail, "Email", "hello@zyptos.com · support@zyptos.com"],
        [MapPin, "Office", "Ghanshyam Colony, Pilibhit, Uttar Pradesh"],
        [Clock, "Hours", "Mon-Sat, 9:00-19:00 IST"],
        [ShieldCheck, "Phone", "+91 81769 91383 for sales and onboarding."],
        [Clock, "Response time", "Billing and setup queries are usually reviewed within one business day. Urgent production issues should include workspace and WABA details."]
      ].map(([Icon, title, body]) => /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx(Icon, { className: "mb-3 h-5 w-5 text-waify-green-dark" }),
        /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: title }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: body })
      ] }, title)) })
    ] })
  ] });
}
function Field({ label, error, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-2", children }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: error })
  ] });
}
export {
  Contact as default
};
