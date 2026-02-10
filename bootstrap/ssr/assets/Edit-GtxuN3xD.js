import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Copy, Palette, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { u as useNotifications } from "./useNotifications-BFFaoN1-.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./useConfirm-BKf7Nv1N.js";
function FloatersEdit({
  account,
  widget,
  connections,
  stats,
  embed
}) {
  const widgetKey = widget.slug || widget.id;
  const { confirm, toast } = useNotifications();
  const { data, setData, put, processing, errors } = useForm({
    name: widget.name,
    whatsapp_connection_id: widget.whatsapp_connection_id ?? "",
    whatsapp_phone: widget.whatsapp_phone ?? "",
    position: widget.position,
    welcome_message: widget.welcome_message ?? "",
    theme: {
      primary: widget.theme?.primary ?? "#25D366",
      background: widget.theme?.background ?? "#075E54"
    },
    show_on: {
      include: (widget.show_on?.include ?? []).join("\n"),
      exclude: (widget.show_on?.exclude ?? []).join("\n")
    },
    is_active: widget.is_active
  });
  const [copied, setCopied] = useState(null);
  useEffect(() => {
    if (!data.whatsapp_connection_id) return;
    const match = connections.find((c) => String(c.id) === String(data.whatsapp_connection_id));
    if (match?.business_phone && !data.whatsapp_phone) {
      setData("whatsapp_phone", match.business_phone);
    }
  }, [data.whatsapp_connection_id]);
  const submit = (e) => {
    e.preventDefault();
    put(route("app.floaters.update", { widget: widgetKey }));
  };
  const toggle = () => {
    router.post(route("app.floaters.toggle", { widget: widgetKey }));
  };
  const remove = async () => {
    const confirmed = await confirm({
      title: "Delete Widget",
      message: "Are you sure you want to delete this widget? This action cannot be undone.",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("app.floaters.destroy", { widget: widgetKey }), {
      onSuccess: () => toast.success("Widget deleted"),
      onError: () => toast.error("Failed to delete widget")
    });
  };
  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2e3);
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Widget · ${widget.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
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
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: widget.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage widget settings and copy the embed snippet." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Badge, { variant: widget.is_active ? "success" : "default", children: widget.is_active ? "Active" : "Paused" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: toggle, children: widget.is_active ? "Pause" : "Activate" }),
          /* @__PURE__ */ jsx(Button, { variant: "danger", onClick: remove, children: "Delete" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3", children: [
        { label: "Impressions", value: stats.impressions },
        { label: "Clicks", value: stats.clicks },
        { label: "Leads", value: stats.leads }
      ].map((item) => /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-sm", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-gray-500", children: item.label }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: item.value }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-400", children: "Last 30 days" })
      ] }) }, item.label)) }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Embed Code" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Paste this script into your website." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-600 dark:text-gray-300", children: embed.snippet }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => copyText(embed.snippet, "snippet"), children: [
              /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
              copied === "snippet" ? "Copied" : "Copy Snippet"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => copyText(embed.script, "script"), children: [
              /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
              copied === "script" ? "Copied" : "Copy Script URL"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Widget Details" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Update widget settings." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Widget Name" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "mt-1 w-full"
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
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "WhatsApp Phone" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: data.whatsapp_phone,
                    onChange: (e) => setData("whatsapp_phone", e.target.value),
                    className: "mt-1 w-full"
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
                "Save Changes"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  FloatersEdit as default
};
