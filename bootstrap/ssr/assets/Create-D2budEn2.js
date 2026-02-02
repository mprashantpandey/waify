import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { ArrowLeft, Link as Link$1, Sparkles, CheckCircle2, Info, EyeOff, Eye } from "lucide-react";
import axios from "axios";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-DfTOxbgl.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
function ConnectionsCreate({
  workspace,
  embeddedSignup,
  defaultApiVersion
}) {
  const [showToken, setShowToken] = useState(false);
  const [embeddedReady, setEmbeddedReady] = useState(false);
  const [embeddedStatus, setEmbeddedStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [webhookSetup, setWebhookSetup] = useState("later");
  const { addToast } = useToast();
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    waba_id: "",
    phone_number_id: "",
    business_phone: "",
    access_token: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("app.whatsapp.connections.store", { workspace: workspace.slug }));
  };
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await axios.post(
        route("app.whatsapp.connections.test", { workspace: workspace.slug }),
        {
          phone_number_id: data.phone_number_id,
          access_token: data.access_token,
          waba_id: data.waba_id || null
        }
      );
      const payload = response.data;
      const display = payload.display_phone_number || payload.verified_name || "Connection looks valid";
      setData("business_phone", payload.display_phone_number || data.business_phone);
      setTestResult({
        ok: true,
        message: `Success: ${display}`
      });
      addToast({ title: "Connection verified", variant: "success" });
    } catch (error) {
      const message = error?.response?.data?.error || "Unable to verify connection";
      setTestResult({
        ok: false,
        message
      });
      addToast({ title: "Connection test failed", variant: "error" });
    } finally {
      setTesting(false);
    }
  };
  const embeddedEnabled = Boolean(embeddedSignup?.enabled && embeddedSignup?.appId && embeddedSignup?.configId);
  const embeddedForm = useForm({
    name: "",
    waba_id: "",
    phone_number_id: "",
    business_phone: "",
    access_token: "",
    code: "",
    pin: "",
    redirect_uri: ""
  });
  useEffect(() => {
    if (!embeddedEnabled) {
      return;
    }
    const initSdk = () => {
      if (!window.FB) {
        return;
      }
      window.FB.init({
        appId: embeddedSignup.appId,
        cookie: true,
        xfbml: true,
        version: embeddedSignup.apiVersion || "v21.0"
      });
      setEmbeddedReady(true);
    };
    if (window.FB) {
      initSdk();
      return;
    }
    window.fbAsyncInit = initSdk;
    const scriptId = "facebook-jssdk";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      document.body.appendChild(script);
    }
  }, [embeddedEnabled, embeddedSignup?.appId, embeddedSignup?.apiVersion]);
  useEffect(() => {
    if (!embeddedEnabled) {
      return;
    }
    const handler = (event) => {
      if (!event.origin.includes("facebook.com")) {
        return;
      }
      let payload = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }
      const action = payload?.event || payload?.type || payload?.action;
      const data2 = payload?.data || payload?.payload || payload;
      if (action === "FINISH" || action === "COMPLETE" || data2?.waba_id || data2?.phone_number_id) {
        if (data2?.waba_id) {
          embeddedForm.setData("waba_id", data2.waba_id);
        }
        if (data2?.phone_number_id) {
          embeddedForm.setData("phone_number_id", data2.phone_number_id);
        }
        if (data2?.business_phone || data2?.display_phone_number) {
          embeddedForm.setData("business_phone", data2.business_phone || data2.display_phone_number);
        }
        setEmbeddedStatus("Embedded signup finished. Ready to create connection.");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [embeddedEnabled]);
  const startEmbeddedSignup = () => {
    if (!embeddedEnabled || !window.FB) {
      return;
    }
    setEmbeddedStatus("Starting Meta Embedded Signup...");
    embeddedForm.setData("redirect_uri", window.location.href);
    window.FB.login(
      (response) => {
        if (response?.authResponse) {
          if (response.authResponse.code) {
            embeddedForm.setData("code", response.authResponse.code);
          }
          if (response.authResponse.accessToken) {
            embeddedForm.setData("access_token", response.authResponse.accessToken);
          }
          setEmbeddedStatus("Authorization complete. Finish setup to create the connection.");
        } else {
          setEmbeddedStatus("Login was cancelled or did not fully authorize.");
        }
      },
      {
        config_id: embeddedSignup.configId,
        response_type: "code",
        override_default_response_type: true,
        scope: "whatsapp_business_management,whatsapp_business_messaging,business_management"
      }
    );
  };
  const submitEmbedded = (e) => {
    e.preventDefault();
    embeddedForm.post(route("app.whatsapp.connections.store-embedded", { workspace: workspace.slug }));
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create WhatsApp Connection" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.whatsapp.connections.index", { workspace: workspace.slug }),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Connections"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Create WhatsApp Connection" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Connect your WhatsApp Business Account to start messaging" })
        ] })
      ] }),
      embeddedEnabled ? /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-emerald-600 rounded-xl", children: /* @__PURE__ */ jsx(Link$1, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Embedded Signup (Recommended)" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Connect directly via Meta for a verified, production-ready setup" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.connections.wizard", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
            "Use Wizard"
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                onClick: startEmbeddedSignup,
                disabled: !embeddedReady,
                className: "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl",
                children: "Connect with Meta"
              }
            ),
            !embeddedReady && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Loading Meta SDK..." })
          ] }),
          embeddedStatus && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-700 dark:text-emerald-300", children: embeddedStatus })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submitEmbedded, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "embedded_name", value: "Connection Name (Optional)", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "embedded_name",
                  type: "text",
                  value: embeddedForm.data.name,
                  className: "mt-1 block w-full rounded-xl",
                  onChange: (e) => embeddedForm.setData("name", e.target.value),
                  placeholder: "My Meta WhatsApp"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "embedded_waba", value: "WABA ID", className: "text-sm font-semibold mb-2" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    id: "embedded_waba",
                    type: "text",
                    value: embeddedForm.data.waba_id,
                    className: "mt-1 block w-full rounded-xl font-mono",
                    onChange: (e) => embeddedForm.setData("waba_id", e.target.value),
                    placeholder: "Auto-filled after signup"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "embedded_phone_id", value: "Phone Number ID", className: "text-sm font-semibold mb-2" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    id: "embedded_phone_id",
                    type: "text",
                    value: embeddedForm.data.phone_number_id,
                    className: "mt-1 block w-full rounded-xl font-mono",
                    onChange: (e) => embeddedForm.setData("phone_number_id", e.target.value),
                    placeholder: "Auto-filled after signup"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "embedded_business_phone", value: "Business Phone (Optional)", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "embedded_business_phone",
                  type: "text",
                  value: embeddedForm.data.business_phone,
                  className: "mt-1 block w-full rounded-xl",
                  onChange: (e) => embeddedForm.setData("business_phone", e.target.value),
                  placeholder: "+1234567890"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "embedded_pin", value: "Registration PIN (Optional)", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "embedded_pin",
                  type: "text",
                  value: embeddedForm.data.pin,
                  className: "mt-1 block w-full rounded-xl font-mono",
                  onChange: (e) => embeddedForm.setData("pin", e.target.value),
                  placeholder: "6-digit PIN",
                  maxLength: 6
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: "Provide PIN to register the phone number immediately after signup." })
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: embeddedForm.errors?.embedded, className: "mt-2" }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-4 pt-2", children: /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                disabled: embeddedForm.processing,
                className: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/40 rounded-xl",
                children: embeddedForm.processing ? "Connecting..." : "Create Connection"
              }
            ) })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-amber-500 rounded-xl", children: /* @__PURE__ */ jsx(Info, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Embedded Signup" }),
            /* @__PURE__ */ jsx(CardDescription, { children: embeddedSignup?.enabled === false ? "Disabled by your platform administrator" : "Not configured by your platform administrator" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: embeddedSignup?.enabled === false ? "Embedded Signup is currently disabled. Please contact support or use the manual setup below." : "Embedded Signup is not fully configured yet. Please contact support or use the manual setup below." }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(
            Link,
            {
              href: route("app.support.hub", { workspace: workspace.slug }),
              className: "inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200",
              children: "Contact support"
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Link$1, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Connection Details" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Enter only the required Meta details" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "phone_number_id", value: "Phone Number ID *", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "phone_number_id",
                type: "text",
                value: data.phone_number_id,
                className: "mt-1 block w-full rounded-xl font-mono",
                onChange: (e) => setData("phone_number_id", e.target.value),
                placeholder: "123456789012345",
                required: true,
                autoFocus: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.phone_number_id, className: "mt-2" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800", children: [
              /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-700 dark:text-blue-300", children: "Found in Meta Business Manager → WhatsApp → API Setup" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "waba_id", value: "WhatsApp Business Account ID (Optional)", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "waba_id",
                type: "text",
                value: data.waba_id,
                className: "mt-1 block w-full rounded-xl font-mono",
                onChange: (e) => setData("waba_id", e.target.value),
                placeholder: "123456789012345"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.waba_id, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "access_token", value: "Access Token *", className: "text-sm font-semibold" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowToken(!showToken),
                  className: "text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1",
                  children: showToken ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }),
                    "Hide"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                    "Show"
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "access_token",
                type: showToken ? "text" : "password",
                value: data.access_token,
                className: "mt-1 block w-full rounded-xl font-mono text-sm",
                onChange: (e) => setData("access_token", e.target.value),
                placeholder: "Enter your permanent access token",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.access_token, className: "mt-2" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800", children: [
              /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-700 dark:text-amber-300", children: "Permanent token from Meta Business Manager. Keep this secure." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 pt-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                className: "rounded-xl",
                onClick: testConnection,
                disabled: testing || !data.phone_number_id || !data.access_token,
                children: testing ? "Testing..." : "Test Connection"
              }
            ),
            testResult && /* @__PURE__ */ jsx("span", { className: testResult.ok ? "text-xs text-green-600" : "text-xs text-red-600", children: testResult.message })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3", children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Webhook Setup", className: "text-sm font-semibold" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    name: "webhook_setup",
                    value: "now",
                    checked: webhookSetup === "now",
                    onChange: () => setWebhookSetup("now")
                  }
                ),
                "Set up webhook now"
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    name: "webhook_setup",
                    value: "later",
                    checked: webhookSetup === "later",
                    onChange: () => setWebhookSetup("later")
                  }
                ),
                "I’ll do it later"
              ] })
            ] }),
            webhookSetup === "now" ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "After creation, we’ll show the webhook URL and verify token." }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "You can set it up anytime from the connection page." }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Need assistance? Contact support from the Help menu." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "inline-flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
              onClick: () => addToast({ title: "Live chat coming soon", variant: "info" }),
              children: "Open live chat (coming soon)"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.connections.index", { workspace: workspace.slug }), children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", className: "rounded-xl", children: "Cancel" }) }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                disabled: processing,
                className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
                children: processing ? "Creating..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
                  "Create Connection"
                ] })
              }
            )
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  ConnectionsCreate as default
};
