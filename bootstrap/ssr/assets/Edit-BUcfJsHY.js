import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import { Check, AlertTriangle, ArrowLeft, Link as Link$1, EyeOff, Eye, Shield, Copy, Info, RotateCcw, Sparkles, Activity } from "lucide-react";
import { u as useNotifications } from "./useNotifications-BFFaoN1-.js";
import axios from "axios";
import { Transition, Dialog, TransitionChild, DialogPanel } from "@headlessui/react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./useConfirm-BKf7Nv1N.js";
function Modal({
  children,
  show = false,
  maxWidth = "2xl",
  closeable = true,
  onClose = () => {
  }
}) {
  const close = () => {
    if (closeable) {
      onClose();
    }
  };
  const maxWidthClass = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl"
  }[maxWidth];
  return /* @__PURE__ */ jsx(Transition, { show, leave: "duration-200", children: /* @__PURE__ */ jsxs(
    Dialog,
    {
      as: "div",
      id: "modal",
      className: "fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0",
      onClose: close,
      children: [
        /* @__PURE__ */ jsx(
          TransitionChild,
          {
            enter: "ease-out duration-300",
            enterFrom: "opacity-0",
            enterTo: "opacity-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100",
            leaveTo: "opacity-0",
            children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-500/75" })
          }
        ),
        /* @__PURE__ */ jsx(
          TransitionChild,
          {
            enter: "ease-out duration-300",
            enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            enterTo: "opacity-100 translate-y-0 sm:scale-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
            leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            children: /* @__PURE__ */ jsx(
              DialogPanel,
              {
                className: `mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full ${maxWidthClass}`,
                children
              }
            )
          }
        )
      ]
    }
  ) });
}
function ConnectionsEdit({
  account,
  connection,
  canViewSecrets = false
}) {
  const { confirm, toast } = useNotifications();
  const [showToken, setShowToken] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);
  const [copied, setCopied] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const { data, setData, put, processing, errors } = useForm({
    name: connection.name,
    waba_id: connection.waba_id || "",
    phone_number_id: connection.phone_number_id,
    business_phone: connection.business_phone || "",
    access_token: "",
    // Optional on update
    api_version: connection.api_version
  });
  const submit = (e) => {
    e.preventDefault();
    put(route("app.whatsapp.connections.update", {
      connection: connection.slug ?? connection.id
    }));
  };
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2e3);
  };
  const rotateToken = async () => {
    const confirmed = await confirm({
      title: "Rotate Verify Token",
      message: "Are you sure you want to rotate the verify token? You will need to update your webhook settings in Meta Business Manager.",
      variant: "warning"
    });
    if (confirmed) {
      router.post(route("app.whatsapp.connections.rotate-verify-token", {
        connection: connection.slug ?? connection.id
      }), {}, {
        onSuccess: () => {
          toast.success("Verify token rotated successfully");
        },
        onError: () => {
          toast.error("Failed to rotate token");
        }
      });
    }
  };
  const showAlert = (title, message, variant) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVariant(variant);
    setAlertOpen(true);
  };
  const runConnectionTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const { data: data2 } = await axios.post(
        route("app.whatsapp.connections.test-saved", {
          connection: connection.slug ?? connection.id
        })
      );
      const summary = [
        data2.display_phone_number ? `Phone: ${data2.display_phone_number}` : null,
        data2.verified_name ? `Verified: ${data2.verified_name}` : null,
        data2.waba_match === false ? "WABA mismatch" : null
      ].filter(Boolean).join(" · ");
      setTestResult({ ok: true, message: summary || "Connection looks valid." });
      showAlert("Connection Test Successful", summary || "Connection looks valid.", "success");
    } catch (error) {
      const message = error?.response?.data?.error || "Connection test failed";
      setTestResult({ ok: false, message });
      showAlert("Connection Test Failed", message, "error");
    } finally {
      setTestLoading(false);
    }
  };
  const runWebhookTest = async () => {
    setWebhookLoading(true);
    setWebhookResult(null);
    try {
      const { data: data2 } = await axios.post(
        route("app.whatsapp.connections.webhook.test", {
          connection: connection.slug ?? connection.id
        })
      );
      const message = data2?.message || "Webhook verified successfully.";
      setWebhookResult({ ok: true, message });
      showAlert("Webhook Test Successful", message, "success");
    } catch (error) {
      const message = error?.response?.data?.error || error?.response?.data?.message || "Webhook test failed. Please check your webhook settings and try again.";
      setWebhookResult({ ok: false, message });
      showAlert("Webhook Test Failed", message, "error");
    } finally {
      setWebhookLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Edit ${connection.name}` }),
    /* @__PURE__ */ jsx(Modal, { show: alertOpen, onClose: () => setAlertOpen(false), maxWidth: "sm", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: `h-10 w-10 rounded-full flex items-center justify-center ${alertVariant === "success" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`, children: alertVariant === "success" ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: alertTitle }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap", children: alertMessage })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: () => setAlertOpen(false), variant: "secondary", children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.whatsapp.connections.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Connections"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Edit Connection" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Update your WhatsApp connection settings" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Link$1, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Connection Settings" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Update your connection details" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Connection Name", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "name",
                type: "text",
                value: data.name,
                className: "mt-1 block w-full rounded-xl",
                onChange: (e) => setData("name", e.target.value),
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
          ] }),
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
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.phone_number_id, className: "mt-2" })
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
                onChange: (e) => setData("waba_id", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.waba_id, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "business_phone", value: "Business Phone (Optional)", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "business_phone",
                type: "text",
                value: data.business_phone,
                className: "mt-1 block w-full rounded-xl",
                onChange: (e) => setData("business_phone", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.business_phone, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "access_token", value: "Access Token (Leave blank to keep current)", className: "text-sm font-semibold" }),
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
                placeholder: "Leave blank to keep current token"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.access_token, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "api_version", value: "API Version", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "api_version",
                type: "text",
                value: data.api_version,
                className: "mt-1 block w-full rounded-xl font-mono",
                onChange: (e) => setData("api_version", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.api_version, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
              /* @__PURE__ */ jsx(InputLabel, { value: "Webhook Configuration", className: "text-base font-bold" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Webhook URL" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => copyToClipboard(connection.webhook_url, "url"),
                      className: "text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1",
                      children: copied === "url" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
                        "Copied!"
                      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                        "Copy"
                      ] })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("code", { className: "block text-xs font-mono bg-white dark:bg-gray-950 px-3 py-2 rounded-lg break-all border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100", children: connection.webhook_url }),
                /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5" }),
                  "Paste this URL in Meta Business Manager → WhatsApp → Configuration → Webhook"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Verify Token" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowVerifyToken(!showVerifyToken),
                        className: "text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1",
                        children: showVerifyToken ? /* @__PURE__ */ jsxs(Fragment, { children: [
                          /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }),
                          "Hide"
                        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                          /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                          "Show"
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => copyToClipboard(
                          canViewSecrets && connection.webhook_verify_token_full ? connection.webhook_verify_token_full : connection.webhook_verify_token,
                          "verify"
                        ),
                        className: "text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1",
                        disabled: !canViewSecrets && !showVerifyToken,
                        title: !canViewSecrets && !showVerifyToken ? "You need owner/admin access to copy the full token" : "Copy token",
                        children: copied === "verify" ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: rotateToken,
                        className: "text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors flex items-center gap-1",
                        children: [
                          /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
                          "Rotate"
                        ]
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx("code", { className: "block text-xs font-mono bg-white dark:bg-gray-950 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 text-gray-900 dark:text-gray-100", children: showVerifyToken && canViewSecrets && connection.webhook_verify_token_full ? connection.webhook_verify_token_full : showVerifyToken ? connection.webhook_verify_token : "••••••••••••••••" }),
                !canViewSecrets && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }),
                  "Only account owners/admins can view the full token"
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5" }),
                  "Use this token when verifying the webhook in Meta"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Badge, { variant: connection.webhook_subscribed ? "success" : "default", className: "flex items-center gap-1.5 px-3 py-1", children: connection.webhook_subscribed ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                  "Webhook Subscribed"
                ] }) : "Not Subscribed" }),
                connection.webhook_last_received_at && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                  "Last received: ",
                  new Date(connection.webhook_last_received_at).toLocaleString()
                ] })
              ] }),
              connection.webhook_last_error && /* @__PURE__ */ jsx(Alert, { variant: "error", className: "border-red-200 dark:border-red-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-red-800 dark:text-red-200", children: "Last Error:" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: connection.webhook_last_error })
                ] })
              ] }) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.connections.health", { connection: connection.slug ?? connection.id }), children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", className: "rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30", children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 mr-2" }),
              "Health Check"
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.connections.index", {}), children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", className: "rounded-xl", children: "Cancel" }) }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  disabled: processing,
                  className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
                  children: processing ? "Saving..." : "Save Changes"
                }
              )
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-emerald-500 rounded-xl", children: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Connection Tests" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Validate your Meta connection and webhook from here." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6 space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Uses the credentials saved with this connection." }),
            /* @__PURE__ */ jsx(Button, { onClick: runConnectionTest, disabled: testLoading, children: testLoading ? "Testing..." : "Test Connection" }),
            testResult && /* @__PURE__ */ jsx(Alert, { variant: testResult.ok ? "success" : "error", children: testResult.message })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              "Webhook URL: ",
              /* @__PURE__ */ jsx("span", { className: "font-mono break-all", children: connection.webhook_url })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "This sends an internal verification request to the webhook endpoint." }),
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: runWebhookTest, disabled: webhookLoading, children: webhookLoading ? "Testing..." : "Test Webhook" }),
            webhookResult && /* @__PURE__ */ jsx(Alert, { variant: webhookResult.ok ? "success" : "error", children: webhookResult.message })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  ConnectionsEdit as default
};
