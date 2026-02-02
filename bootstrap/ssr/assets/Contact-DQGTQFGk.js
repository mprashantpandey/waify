import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { P as PublicLayout } from "./PublicLayout-CgFgjZDl.js";
import { useForm, Link } from "@inertiajs/react";
import { MessageSquare, Send, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { B as Button } from "./Button-BocaoVWt.js";
import { I as Input } from "./Input-BgsnMcKc.js";
import { L as Label } from "./Label-CbZtQFYj.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function Contact() {
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("contact.submit"));
  };
  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@example.com",
      href: "mailto:support@example.com",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123 Business St, City, State 12345",
      href: "#",
      gradient: "from-green-500 to-green-600"
    }
  ];
  return /* @__PURE__ */ jsx(PublicLayout, { children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: "We're Here to Help" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent", children: "Get in Touch" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto", children: "Have a question or need help? We're here to assist you. Send us a message and we'll respond as soon as possible." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow", children: [
        recentlySuccessful && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl", children: /* @__PURE__ */ jsx("p", { className: "text-green-800 dark:text-green-200 font-medium", children: "✓ Thank you for contacting us! We'll get back to you soon." }) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", className: "text-sm font-semibold", children: "Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "name",
                  type: "text",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  required: true,
                  className: "mt-2 border-2 focus:border-blue-500 focus:ring-blue-500",
                  placeholder: "Your full name"
                }
              ),
              errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", className: "text-sm font-semibold", children: "Email" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  value: data.email,
                  onChange: (e) => setData("email", e.target.value),
                  required: true,
                  className: "mt-2 border-2 focus:border-blue-500 focus:ring-blue-500",
                  placeholder: "your@email.com"
                }
              ),
              errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.email })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "subject", className: "text-sm font-semibold", children: "Subject" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "subject",
                type: "text",
                value: data.subject,
                onChange: (e) => setData("subject", e.target.value),
                required: true,
                className: "mt-2 border-2 focus:border-blue-500 focus:ring-blue-500",
                placeholder: "What's this about?"
              }
            ),
            errors.subject && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.subject })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "message", className: "text-sm font-semibold", children: "Message" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "message",
                rows: 6,
                value: data.message,
                onChange: (e) => setData("message", e.target.value),
                required: true,
                className: "mt-2 block w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors",
                placeholder: "Tell us how we can help..."
              }
            ),
            errors.message && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.message })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              disabled: processing,
              size: "lg",
              className: "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50",
              children: processing ? "Sending..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                "Send Message",
                /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 ml-2" })
              ] })
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-2 border-gray-200 dark:border-gray-700", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6", children: "Contact Information" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: contactInfo.map((info, index) => {
            const Icon = info.icon;
            return /* @__PURE__ */ jsxs(
              "a",
              {
                href: info.href,
                className: "flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800",
                children: [
                  /* @__PURE__ */ jsx("div", { className: `bg-gradient-to-r ${info.gradient} p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-white" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: info.label }),
                    /* @__PURE__ */ jsx("p", { className: "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium", children: info.value })
                  ] })
                ]
              },
              index
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/10" }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 mb-4", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2", children: "Need Immediate Help?" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-100 text-sm mb-4", children: "Check out our help center for instant answers to common questions." }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("help"),
                className: "text-white font-medium hover:underline inline-flex items-center gap-1",
                children: [
                  "Visit Help Center",
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Contact as default
};
