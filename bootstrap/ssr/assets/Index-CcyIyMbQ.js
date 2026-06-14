import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { Plus, Save, MessageCircle, Copy, Check, Layout } from "lucide-react";
import { useState } from "react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import { D as Drawer } from "./Elements-EbyZDnT_.js";
import { s as splitPhoneNumber, C as CountryPhoneInput } from "./CountryPhoneInput-CHHfMj5w.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./BrandingWrapper-CZn0jBQL.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "clsx";
import "tailwind-merge";
import "@headlessui/react";
import "./InputError-DiSBWiye.js";
function Toggle({ checked, onChange }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => onChange(!checked),
      className: cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-waify-green/25",
        checked ? "bg-waify-green" : "bg-gray-200 dark:bg-waify-dark-surface-2"
      ),
      "aria-pressed": checked,
      children: /* @__PURE__ */ jsx("span", { className: cn("inline-block h-5 w-5 rounded-full bg-white shadow-sm transition", checked ? "translate-x-5" : "translate-x-0.5") })
    }
  );
}
function WidgetPreview({ greeting, position, primaryColor, backgroundColor }) {
  const sideClass = position === "bottom-left" ? "left-5" : "right-5";
  return /* @__PURE__ */ jsxs("div", { className: "relative h-64 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-gray-200 dark:from-slate-800 dark:to-slate-950 dark:ring-waify-dark-border", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 p-4 opacity-40", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-2 h-3 w-24 rounded bg-gray-300 dark:bg-slate-600" }),
      /* @__PURE__ */ jsx("div", { className: "mb-1 h-2 w-full rounded bg-gray-200 dark:bg-slate-700" }),
      /* @__PURE__ */ jsx("div", { className: "h-2 w-4/5 rounded bg-gray-200 dark:bg-slate-700" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cn("anim-scale absolute bottom-4 w-72 overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-waify-dark-surface dark:ring-waify-dark-border", sideClass), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 py-3 text-white", style: { background: backgroundColor }, children: [
        /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Chat with us" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-4 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: greeting }),
      /* @__PURE__ */ jsx("div", { className: "px-4 pb-4", children: /* @__PURE__ */ jsx("button", { type: "button", className: "w-full rounded-btn py-2 text-sm font-medium text-white", style: { background: primaryColor }, children: "Start chat" }) })
    ] })
  ] });
}
function RealWidgetPreview({ snippet }) {
  if (!snippet) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: "Create or connect a widget to preview the real installed script." });
  }
  const srcDoc = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body{margin:0;min-height:256px;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:linear-gradient(135deg,#f8fafc,#e2e8f0);overflow:hidden}
    .page{padding:18px;color:#475569}
    .bar{height:12px;border-radius:999px;background:#cbd5e1;margin-bottom:10px}
    .bar.short{width:38%}.bar.med{width:72%}.bar.long{width:88%}
  </style>
</head>
<body>
  <div class="page">
    <div class="bar short"></div>
    <div class="bar long"></div>
    <div class="bar med"></div>
  </div>
  ${snippet}
</body>
</html>`;
  return /* @__PURE__ */ jsx(
    "iframe",
    {
      title: "Real widget preview",
      sandbox: "allow-scripts allow-same-origin",
      srcDoc,
      className: "h-64 w-full rounded-lg border border-gray-200 bg-white dark:border-waify-dark-border"
    }
  );
}
function FloatersIndex({
  widgets,
  stats,
  connections,
  default_phone
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const primaryWidget = widgets[0];
  const defaultConnection = connections.find((connection) => connection.business_phone) || connections[0];
  const parsedCreatePhone = splitPhoneNumber(default_phone || defaultConnection?.business_phone || "+91");
  const [greeting, setGreeting] = useState(primaryWidget?.welcome_message || "Hi! How can we help you today?");
  const [position, setPosition] = useState(primaryWidget?.position || "bottom-right");
  const [primaryColor, setPrimaryColor] = useState(primaryWidget?.theme?.primary || "#00A548");
  const [backgroundColor, setBackgroundColor] = useState(primaryWidget?.theme?.background || "#075E54");
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(() => new URLSearchParams(window.location.search).get("create") === "1");
  const [createCountryCode, setCreateCountryCode] = useState(parsedCreatePhone.countryCode);
  const [createLocalPhone, setCreateLocalPhone] = useState(parsedCreatePhone.localPhone);
  const createForm = useForm({
    name: "Website Chat Bubble",
    whatsapp_connection_id: defaultConnection?.id?.toString() || "",
    whatsapp_phone: `${parsedCreatePhone.countryCode}${parsedCreatePhone.localPhone}`.replace(/\D/g, ""),
    position: "bottom-right",
    welcome_message: "Hi! How can we help you today?",
    theme: {
      primary: "#00A548",
      background: "#075E54"
    },
    show_on: {
      include: "",
      exclude: ""
    },
    is_active: true,
    _stay_index: true
  });
  const embedCode = primaryWidget?.snippet || "";
  const scriptUrl = primaryWidget?.script_url || "";
  const copyEmbed = () => {
    if (!embedCode) {
      toast.info("Create a widget first");
      return;
    }
    void navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied");
  };
  const copyScriptUrl = () => {
    if (!scriptUrl) {
      toast.info("Create a widget first");
      return;
    }
    void navigator.clipboard.writeText(scriptUrl);
    toast.success("Script URL copied");
  };
  const toggleWidget = (widget) => {
    router.post(route("app.floaters.toggle", { widget: widget.slug || widget.id }), {}, {
      preserveScroll: true,
      onError: () => toast.error("Failed to update widget")
    });
  };
  const deleteWidget = async (widget) => {
    const confirmed = await confirm({
      title: "Delete widget",
      message: `Delete "${widget.name}"? This disables its install code on your website.`,
      confirmText: "Delete widget",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("app.floaters.destroy", { widget: widget.slug || widget.id }), {
      preserveScroll: true,
      onSuccess: () => toast.success("Widget deleted"),
      onError: () => toast.error("Failed to delete widget")
    });
  };
  const updateCreateConnection = (connectionId) => {
    createForm.setData("whatsapp_connection_id", connectionId);
    const match = connections.find((connection) => String(connection.id) === String(connectionId));
    if (match?.business_phone) {
      const parsed = splitPhoneNumber(match.business_phone);
      setCreateCountryCode(parsed.countryCode);
      setCreateLocalPhone(parsed.localPhone);
      createForm.setData("whatsapp_phone", `${parsed.countryCode}${parsed.localPhone}`.replace(/\D/g, ""));
    }
  };
  const createWidget = () => {
    createForm.post(route("app.floaters.store", {}), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Widget created");
        setCreateOpen(false);
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0];
        toast.error(firstError || "Failed to create widget");
      }
    });
  };
  const saveWidget = () => {
    if (!primaryWidget) {
      toast.info("Create a widget first");
      return;
    }
    setSaving(true);
    router.put(
      route("app.floaters.update", { widget: primaryWidget.slug || primaryWidget.id }),
      {
        name: primaryWidget.name,
        whatsapp_connection_id: primaryWidget.whatsapp_connection_id || "",
        whatsapp_phone: primaryWidget.whatsapp_phone || "",
        position,
        welcome_message: greeting,
        is_active: primaryWidget.is_active,
        theme: {
          primary: primaryColor,
          background: backgroundColor
        },
        show_on: {
          include: primaryWidget.show_on?.include || [],
          exclude: primaryWidget.show_on?.exclude || []
        },
        _stay_index: true
      },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Widget settings saved"),
        onError: (errors) => toast.error(errors.whatsapp_phone || errors.welcome_message || errors.position || "Failed to save widget"),
        onFinish: () => setSaving(false)
      }
    );
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Widgets" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text md:text-3xl", children: "Widgets" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "WhatsApp floaters & on-site embeds" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => setCreateOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Add widget"
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: saveWidget, disabled: saving || !primaryWidget, children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            " Save changes"
          ] })
        ] })
      ] }),
      widgets.length === 0 && /* @__PURE__ */ jsx(Card, { className: "overflow-hidden p-0", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 sm:p-8", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-waify-green/15 text-waify-green-dark dark:text-emerald-300", children: /* @__PURE__ */ jsx(MessageCircle, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-waify-text dark:text-waify-dark-text", children: "Create your first website widget" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Add one WhatsApp chat bubble for this workspace, preview it, and copy the real install code after it is created." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => setCreateOpen(true), children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              " Add widget"
            ] }),
            connections.length === 0 && /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.connections.index", {}), children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Connect WABA first" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 bg-gray-50 p-5 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 lg:border-l lg:border-t-0", children: /* @__PURE__ */ jsx(WidgetPreview, { greeting: createForm.data.welcome_message, position: createForm.data.position, primaryColor: createForm.data.theme.primary, backgroundColor: createForm.data.theme.background }) })
      ] }) }),
      primaryWidget && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Selected widget" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: primaryWidget.name })
            ] }),
            /* @__PURE__ */ jsx(Toggle, { checked: primaryWidget.is_active, onChange: () => toggleWidget(primaryWidget) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Welcome message" }),
            /* @__PURE__ */ jsx(TextInput, { value: greeting, onChange: (event) => setGreeting(event.target.value), className: "w-full" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Position" }),
            /* @__PURE__ */ jsxs("select", { value: position, onChange: (event) => setPosition(event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsx("option", { value: "bottom-right", children: "Bottom right" }),
              /* @__PURE__ */ jsx("option", { value: "bottom-left", children: "Bottom left" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Bubble color" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("input", { type: "color", value: primaryColor, onChange: (event) => setPrimaryColor(event.target.value), className: "h-10 w-12 rounded border-0 bg-transparent" }),
                /* @__PURE__ */ jsx(TextInput, { value: primaryColor, onChange: (event) => setPrimaryColor(event.target.value), className: "w-full" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Header color" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("input", { type: "color", value: backgroundColor, onChange: (event) => setBackgroundColor(event.target.value), className: "h-10 w-12 rounded border-0 bg-transparent" }),
                /* @__PURE__ */ jsx(TextInput, { value: backgroundColor, onChange: (event) => setBackgroundColor(event.target.value), className: "w-full" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Live preview" }),
          /* @__PURE__ */ jsx(RealWidgetPreview, { snippet: primaryWidget.snippet })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-2 font-semibold text-waify-text dark:text-waify-dark-text", children: "Website install code" }),
        primaryWidget ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use the embed code for normal website installation. The script URL is only the raw JavaScript file, useful for custom loaders or tag managers." }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Embed code" }),
                /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: copyEmbed, children: [
                  /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                  " Copy embed"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "rounded-btn bg-slate-900 p-4", children: /* @__PURE__ */ jsx("pre", { className: "overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-slate-100", children: embedCode }) }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                "Paste this before the closing ",
                /* @__PURE__ */ jsx("code", { className: "rounded bg-gray-100 px-1 dark:bg-waify-dark-surface-2", children: "</body>" }),
                " tag."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Script URL" }),
                /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: copyScriptUrl, children: [
                  /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                  " Copy URL"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "rounded-btn border border-gray-200 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsx("p", { className: "break-all font-mono text-xs text-waify-text dark:text-waify-dark-text", children: scriptUrl }) }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Direct JavaScript file for advanced installs." })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-card border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "No widget exists yet. Add a widget to generate a real embed code and script URL." }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => setCreateOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Add widget"
          ] })
        ] })
      ] }),
      widgets.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Existing widgets" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            stats.impressions,
            " impressions, ",
            stats.clicks,
            " clicks, ",
            stats.leads,
            " leads in the last 30 days"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: widgets.map((widget) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: cn("flex h-10 w-10 items-center justify-center rounded-lg", widget.is_active ? "bg-waify-green/15 text-waify-green-dark dark:text-emerald-300" : "bg-gray-100 text-gray-400 dark:bg-waify-dark-surface-2"), children: widget.is_active ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Layout, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: widget.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                widget.whatsapp_phone || "No WhatsApp number set",
                " · ",
                widget.position.replace("-", " ")
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.floaters", { widget: widget.slug || widget.id }), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", children: "Manage" }) }),
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => {
              void navigator.clipboard.writeText(widget.snippet);
              toast.success("Embed code copied");
            }, children: [
              /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
              " Copy embed"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => {
              void navigator.clipboard.writeText(widget.script_url);
              toast.success("Script URL copied");
            }, children: [
              /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
              " Copy URL"
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "danger", size: "sm", onClick: () => deleteWidget(widget), children: "Delete" })
          ] })
        ] }, widget.id)) })
      ] }),
      /* @__PURE__ */ jsx(
        Drawer,
        {
          open: createOpen,
          onClose: () => setCreateOpen(false),
          title: "Create widget",
          description: "Create a real website widget using this workspace's WhatsApp number.",
          className: "max-w-3xl",
          footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setCreateOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxs(Button, { type: "button", onClick: createWidget, disabled: createForm.processing, children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              createForm.processing ? "Creating..." : "Create widget"
            ] })
          ] }),
          children: /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Widget name" }),
                /* @__PURE__ */ jsx(TextInput, { value: createForm.data.name, onChange: (event) => createForm.setData("name", event.target.value), className: "w-full" }),
                createForm.errors.name && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: createForm.errors.name })
              ] }),
              connections.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "WABA account" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: createForm.data.whatsapp_connection_id,
                    onChange: (event) => updateCreateConnection(event.target.value),
                    className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Manual phone" }),
                      connections.map((connection) => /* @__PURE__ */ jsxs("option", { value: connection.id, children: [
                        connection.name,
                        connection.business_phone ? ` · ${connection.business_phone}` : ""
                      ] }, connection.id))
                    ]
                  }
                ),
                createForm.errors.whatsapp_connection_id && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: createForm.errors.whatsapp_connection_id })
              ] }),
              /* @__PURE__ */ jsx(
                CountryPhoneInput,
                {
                  countryCode: createCountryCode,
                  phone: createLocalPhone,
                  onCountryCodeChange: (value) => {
                    setCreateCountryCode(value);
                    createForm.setData("whatsapp_phone", `${value}${createLocalPhone}`.replace(/\D/g, ""));
                  },
                  onPhoneChange: (value) => {
                    setCreateLocalPhone(value);
                    createForm.setData("whatsapp_phone", `${createCountryCode}${value}`.replace(/\D/g, ""));
                  },
                  error: createForm.errors.whatsapp_phone
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Welcome message" }),
                /* @__PURE__ */ jsx(TextInput, { value: createForm.data.welcome_message, onChange: (event) => createForm.setData("welcome_message", event.target.value), className: "w-full" }),
                createForm.errors.welcome_message && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: createForm.errors.welcome_message })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Position" }),
                  /* @__PURE__ */ jsxs("select", { value: createForm.data.position, onChange: (event) => createForm.setData("position", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
                    /* @__PURE__ */ jsx("option", { value: "bottom-right", children: "Bottom right" }),
                    /* @__PURE__ */ jsx("option", { value: "bottom-left", children: "Bottom left" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between gap-3 rounded-card border border-gray-100 px-3 py-2 dark:border-waify-dark-border", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text dark:text-waify-dark-text", children: "Active" }),
                  /* @__PURE__ */ jsx(Toggle, { checked: createForm.data.is_active, onChange: (checked) => createForm.setData("is_active", checked) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Bubble color" }),
                  /* @__PURE__ */ jsx("input", { type: "color", value: createForm.data.theme.primary, onChange: (event) => createForm.setData("theme", { ...createForm.data.theme, primary: event.target.value }), className: "h-10 w-14 rounded border-0 bg-transparent" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Header color" }),
                  /* @__PURE__ */ jsx("input", { type: "color", value: createForm.data.theme.background, onChange: (event) => createForm.setData("theme", { ...createForm.data.theme, background: event.target.value }), className: "h-10 w-14 rounded border-0 bg-transparent" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(
                WidgetPreview,
                {
                  greeting: createForm.data.welcome_message,
                  position: createForm.data.position,
                  primaryColor: createForm.data.theme.primary,
                  backgroundColor: createForm.data.theme.background
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: [
                "After creating, copy the real install snippet from this page and paste it before ",
                /* @__PURE__ */ jsx("code", { children: "</body>" }),
                "."
              ] })
            ] })
          ] })
        }
      )
    ] })
  ] });
}
export {
  FloatersIndex as default
};
