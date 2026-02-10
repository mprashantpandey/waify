import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Palette, Sparkles } from "lucide-react";
import { useEffect } from "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function FloatersCreate({
  account,
  connections
}) {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    whatsapp_connection_id: "",
    whatsapp_phone: "",
    position: "bottom-right",
    welcome_message: "Hello! How can we help you?",
    theme: {
      primary: "#25D366",
      background: "#075E54"
    },
    show_on: {
      include: "",
      exclude: ""
    },
    is_active: true
  });
  useEffect(() => {
    if (!data.whatsapp_connection_id) return;
    const match = connections.find((c) => String(c.id) === String(data.whatsapp_connection_id));
    if (match?.business_phone && !data.whatsapp_phone) {
      setData("whatsapp_phone", match.business_phone);
    }
  }, [data.whatsapp_connection_id]);
  const submit = (e) => {
    e.preventDefault();
    post(route("app.floaters.store", {}));
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Widget" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.floaters", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Widgets"
            ]
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: "Create WhatsApp Widget" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Configure a floating chat bubble for your website." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Widget Details" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Basic information for your widget." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Widget Name" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "mt-1 w-full",
                  placeholder: "Website Chat Bubble"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "WhatsApp Connection (optional)" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: data.whatsapp_connection_id,
                    onChange: (e) => setData("whatsapp_connection_id", e.target.value),
                    className: "mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Select connection" }),
                      connections.map((conn) => /* @__PURE__ */ jsx("option", { value: conn.id, children: conn.name }, conn.id))
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.whatsapp_connection_id, className: "mt-2" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "WhatsApp Phone (required)" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: data.whatsapp_phone,
                    onChange: (e) => setData("whatsapp_phone", e.target.value),
                    className: "mt-1 w-full",
                    placeholder: "+15551234567"
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.whatsapp_phone, className: "mt-2" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Welcome Message" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: data.welcome_message,
                  onChange: (e) => setData("welcome_message", e.target.value),
                  className: "mt-1 w-full"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.welcome_message, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "Position" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: data.position,
                    onChange: (e) => setData("position", e.target.value),
                    className: "mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "bottom-right", children: "Bottom right" }),
                      /* @__PURE__ */ jsx("option", { value: "bottom-left", children: "Bottom left" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-6", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: data.is_active,
                    onChange: (e) => setData("is_active", e.target.checked)
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Widget is active" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Palette, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx(CardTitle, { children: "Theme" })
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Customize the bubble colors." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "grid md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Primary Color" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "color",
                    value: data.theme.primary,
                    onChange: (e) => setData("theme", { ...data.theme, primary: e.target.value }),
                    className: "h-10 w-14 rounded-lg border border-gray-200"
                  }
                ),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: data.theme.primary,
                    onChange: (e) => setData("theme", { ...data.theme, primary: e.target.value }),
                    className: "flex-1"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Header Background" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "color",
                    value: data.theme.background,
                    onChange: (e) => setData("theme", { ...data.theme, background: e.target.value }),
                    className: "h-10 w-14 rounded-lg border border-gray-200"
                  }
                ),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: data.theme.background,
                    onChange: (e) => setData("theme", { ...data.theme, background: e.target.value }),
                    className: "flex-1"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Page Targeting" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Show or hide the widget on specific pages (one per line, supports * wildcard)." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "grid md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Show on" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: data.show_on.include,
                  onChange: (e) => setData("show_on", { ...data.show_on, include: e.target.value }),
                  className: "mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm min-h-[120px]",
                  placeholder: "/pricing\n/blog/*"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Hide on" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: data.show_on.exclude,
                  onChange: (e) => setData("show_on", { ...data.show_on, exclude: e.target.value }),
                  className: "mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm min-h-[120px]",
                  placeholder: "/privacy\n/terms"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.floaters", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", children: "Cancel" }) }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "submit",
              disabled: processing,
              className: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
              children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
                "Create Widget"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  FloatersCreate as default
};
