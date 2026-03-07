import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { ArrowLeft, AlertCircle, Key, Sparkles, Phone, CheckCircle2, Loader2, Link as Link$1, Zap, Shield } from "lucide-react";
import { u as useToast } from "./useToast-CwsXrmjR.js";
import "./useConfirm-BKf7Nv1N.js";
import { P as Progress } from "./Progress-BMolBmhQ.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { A as Alert } from "./Alert-C-mQ6HNk.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function EmbeddedWizard({
  account,
  embeddedSignup,
  defaultApiVersion
}) {
  const { toast } = useToast();
  const [embeddedReady, setEmbeddedReady] = useState(false);
  const [wizardState, setWizardState] = useState({
    step: "init",
    progress: 0,
    message: "Ready to start",
    data: {}
  });
  const [autoCreateMode, setAutoCreateMode] = useState(false);
  const messageHandlerRef = useRef(null);
  const lastTelemetryKeyRef = useRef("");
  const autoCreateTriggeredRef = useRef(false);
  const resolveOAuthRedirectUri = () => {
    const raw = embeddedSignup?.oauthRedirectUri || route("app.whatsapp.connections.create", {});
    try {
      return new URL(raw, window.location.origin).toString();
    } catch {
      return `${window.location.origin}/app/connections/create`;
    }
  };
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
  const emitTelemetry = (payload) => {
    const key = `${payload.step}:${payload.status}:${payload.message || ""}`;
    if (lastTelemetryKeyRef.current === key) return;
    lastTelemetryKeyRef.current = key;
    fetch(route("app.whatsapp.connections.embedded-telemetry", {}), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
      },
      body: JSON.stringify(payload),
      credentials: "same-origin"
    }).catch(() => {
    });
  };
  useEffect(() => {
    if (embeddedSignup?.enabled === false) {
      setWizardState((prev) => ({
        ...prev,
        step: "error",
        error: "Embedded Signup is disabled by your platform administrator."
      }));
      return;
    }
    if (!embeddedSignup?.appId || !embeddedSignup?.configId) {
      setWizardState((prev) => ({
        ...prev,
        step: "error",
        error: "Embedded Signup is not configured yet. Please contact support or use manual setup."
      }));
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
      setWizardState((prev) => ({
        ...prev,
        step: "init",
        message: 'Meta SDK loaded. Click "Start Setup" to begin.'
      }));
      emitTelemetry({ step: "sdk_ready", status: "progress", message: "Meta SDK initialized" });
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
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [embeddedSignup?.enabled, embeddedSignup?.appId, embeddedSignup?.configId, embeddedSignup?.apiVersion]);
  useEffect(() => {
    if (!embeddedSignup?.enabled || !embeddedSignup?.appId) return;
    const handler = (event) => {
      const allowedOrigins = [
        "https://www.facebook.com",
        "https://facebook.com",
        "https://web.facebook.com",
        "https://business.facebook.com"
      ];
      if (!allowedOrigins.some((origin) => event.origin.includes(origin.replace("https://", "")))) {
        return;
      }
      let payload = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          if (payload.includes("waba_id") || payload.includes("phone_number_id")) {
            try {
              const match = payload.match(/\{.*\}/);
              if (match) {
                payload = JSON.parse(match[0]);
              }
            } catch {
              return;
            }
          } else {
            return;
          }
        }
      }
      const action = payload?.event || payload?.type || payload?.action || payload?.status;
      const data = payload?.data || payload?.payload || payload?.result || payload;
      if (action === "FINISH" || action === "COMPLETE" || action === "SUCCESS" || data?.waba_id || data?.phone_number_id || payload?.waba_id || payload?.phone_number_id) {
        const extractedData = {
          waba_id: data?.waba_id || payload?.waba_id || data?.wabaId || payload?.wabaId,
          phone_number_id: data?.phone_number_id || payload?.phone_number_id || data?.phoneNumberId || payload?.phoneNumberId,
          business_phone: data?.business_phone || payload?.business_phone || data?.display_phone_number || payload?.display_phone_number || data?.businessPhone || payload?.businessPhone
        };
        if (extractedData.waba_id || extractedData.phone_number_id) {
          setWizardState((prev) => ({
            ...prev,
            step: "waba-lookup",
            progress: 60,
            message: "Received signup data from Meta",
            data: {
              ...prev.data,
              ...extractedData
            }
          }));
          if (extractedData.waba_id) {
            embeddedForm.setData("waba_id", extractedData.waba_id);
          }
          if (extractedData.phone_number_id) {
            embeddedForm.setData("phone_number_id", extractedData.phone_number_id);
          }
          if (extractedData.business_phone) {
            embeddedForm.setData("business_phone", extractedData.business_phone);
          }
          emitTelemetry({
            step: "embedded_payload_received",
            status: "progress",
            message: "Received WhatsApp Business Account / phone details",
            context: {
              has_waba: Boolean(extractedData.waba_id),
              has_phone_number_id: Boolean(extractedData.phone_number_id)
            }
          });
        }
      }
      if (data?.code || payload?.code || data?.accessToken || payload?.accessToken) {
        const code = data?.code || payload?.code;
        const accessToken = data?.accessToken || payload?.accessToken || data?.access_token || payload?.access_token;
        if (code) {
          embeddedForm.setData("code", code);
          setWizardState((prev) => ({
            ...prev,
            step: "code-exchange",
            progress: 30,
            message: "Authorization code received",
            data: {
              ...prev.data,
              code
            }
          }));
        }
        if (accessToken) {
          embeddedForm.setData("access_token", accessToken);
          setWizardState((prev) => ({
            ...prev,
            step: "code-exchange",
            progress: 40,
            message: "Access token received",
            data: {
              ...prev.data,
              accessToken
            }
          }));
        }
        emitTelemetry({
          step: "oauth_response_received",
          status: "progress",
          message: "Received code/access token response",
          context: {
            has_code: Boolean(code),
            has_access_token: Boolean(accessToken)
          }
        });
      }
    };
    messageHandlerRef.current = handler;
    window.addEventListener("message", handler);
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
      }
    };
  }, [embeddedSignup?.appId, toast]);
  const startWizard = () => {
    if (!embeddedReady || !window.FB) {
      toast.error("Meta SDK not ready. Please wait...");
      return;
    }
    const oauthRedirectUri = resolveOAuthRedirectUri();
    setWizardState({
      step: "auth",
      progress: 10,
      message: "Starting Meta authorization...",
      data: {}
    });
    setAutoCreateMode(false);
    autoCreateTriggeredRef.current = false;
    emitTelemetry({ step: "authorization_start", status: "started", message: "Started Meta OAuth flow" });
    embeddedForm.setData("redirect_uri", oauthRedirectUri);
    window.FB.login(
      (response) => {
        if (response?.authResponse) {
          const code = response.authResponse.code;
          const accessToken = response.authResponse.accessToken;
          if (code && !accessToken) {
            embeddedForm.setData("code", code);
            setWizardState((prev) => ({
              ...prev,
              step: "code-exchange",
              progress: 30,
              message: "Authorization code received. Exchanging for access token...",
              data: {
                ...prev.data,
                code
              }
            }));
          }
          if (accessToken) {
            embeddedForm.setData("access_token", accessToken);
            embeddedForm.setData("code", "");
            setWizardState((prev) => ({
              ...prev,
              step: "code-exchange",
              progress: 40,
              message: "Access token received",
              data: {
                ...prev.data,
                accessToken
              }
            }));
          }
          if (code || accessToken) {
            emitTelemetry({
              step: "authorization_success",
              status: "success",
              context: { has_code: Boolean(code), has_access_token: Boolean(accessToken) }
            });
          } else {
            setWizardState((prev) => ({
              ...prev,
              step: "error",
              error: "Authorization response missing code or access token"
            }));
            emitTelemetry({ step: "authorization_error", status: "error", message: "Missing code/access token from OAuth response" });
          }
        } else {
          setWizardState((prev) => ({
            ...prev,
            step: "error",
            error: "Login was cancelled or did not fully authorize"
          }));
          toast.error("Authorization cancelled");
          emitTelemetry({ step: "authorization_cancelled", status: "cancelled", message: "User cancelled authorization" });
        }
      },
      {
        config_id: embeddedSignup.configId,
        redirect_uri: oauthRedirectUri,
        scope: "whatsapp_business_management,whatsapp_business_messaging,business_management"
      }
    );
  };
  const createConnection = (mode = "manual") => {
    if (!embeddedForm.data.code && !embeddedForm.data.access_token) {
      if (mode === "manual") {
        toast.error("Please complete the authorization step first");
      }
      emitTelemetry({ step: "submit_blocked", status: "error", message: "Missing code/access token before submit" });
      return;
    }
    if (!embeddedForm.data.name?.trim()) {
      embeddedForm.setData("name", "WhatsApp Connection");
    }
    setAutoCreateMode(mode === "auto");
    setWizardState((prev) => ({
      ...prev,
      step: "complete",
      progress: 90,
      message: mode === "auto" ? "Creating connection automatically..." : "Creating connection..."
    }));
    embeddedForm.post(route("app.whatsapp.connections.store-embedded", {}), {
      onSuccess: () => {
        setAutoCreateMode(false);
        setWizardState((prev) => ({
          ...prev,
          step: "complete",
          progress: 100,
          message: "Connection created successfully!"
        }));
        emitTelemetry({ step: "connection_created", status: "success", message: "Embedded connection created" });
      },
      onError: (errors) => {
        setWizardState((prev) => ({
          ...prev,
          step: "error",
          error: errors?.embedded || "Failed to create connection"
        }));
        setAutoCreateMode(false);
        if (mode === "auto") {
          autoCreateTriggeredRef.current = false;
        }
        toast.error(mode === "auto" ? "Auto-create failed. You can retry manually." : "Failed to create connection");
        emitTelemetry({
          step: "connection_create_error",
          status: "error",
          message: errors?.embedded || "Failed to create connection"
        });
      }
    });
  };
  const submitEmbedded = (e) => {
    e.preventDefault();
    createConnection("manual");
  };
  useEffect(() => {
    const hasAuth = Boolean(embeddedForm.data.code || embeddedForm.data.access_token);
    const canAutoCreate = ["code-exchange", "waba-lookup", "phone-lookup", "subscribe", "register"].includes(wizardState.step);
    if (!hasAuth || !canAutoCreate || embeddedForm.processing || autoCreateTriggeredRef.current) {
      return;
    }
    autoCreateTriggeredRef.current = true;
    createConnection("auto");
  }, [embeddedForm.data.code, embeddedForm.data.access_token, wizardState.step, embeddedForm.processing]);
  const getStepIcon = (step) => {
    switch (step) {
      case "init":
        return /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5" });
      case "auth":
      case "code-exchange":
        return /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" });
      case "waba-lookup":
      case "phone-lookup":
        return /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5" });
      case "subscribe":
      case "register":
        return /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" });
      case "complete":
        return /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" });
      case "error":
        return /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" });
      default:
        return /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5" });
    }
  };
  const getStepColor = (step) => {
    if (step === "error") return "from-red-500 to-red-600";
    if (step === "complete") return "from-green-500 to-green-600";
    return "from-blue-500 to-blue-600";
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Embedded Signup Wizard" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.whatsapp.connections.create", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Create Connection"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Embedded Signup Wizard" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Guided setup for connecting your WhatsApp Business Account via Meta" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: `p-2 bg-gradient-to-br ${getStepColor(wizardState.step)} rounded-xl`, children: getStepIcon(wizardState.step) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Setup Progress" }),
            /* @__PURE__ */ jsx(CardDescription, { children: wizardState.message })
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: wizardState.step === "complete" ? "success" : wizardState.step === "error" ? "danger" : "default", className: "px-3 py-1", children: [
            Math.round(wizardState.progress),
            "%"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsx(Progress, { value: wizardState.progress, variant: wizardState.step === "error" ? "danger" : "default", className: "h-3" }),
          wizardState.error && /* @__PURE__ */ jsxs(Alert, { variant: "error", className: "border-red-200 dark:border-red-800", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-red-800 dark:text-red-200 mb-1", children: "Error" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: wizardState.error }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", onClick: startWizard, children: "Retry Authorization" }),
                (embeddedForm.data.code || embeddedForm.data.access_token) && /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    onClick: () => createConnection("manual"),
                    disabled: embeddedForm.processing,
                    children: "Retry Connection Create"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mt-6", children: [
            { key: "auth", label: "Authorize", icon: Key },
            { key: "code-exchange", label: "Exchange", icon: Sparkles },
            { key: "waba-lookup", label: "Lookup", icon: Phone },
            { key: "complete", label: "Complete", icon: CheckCircle2 }
          ].map(({ key, label, icon: Icon }) => {
            const isActive = wizardState.step === key;
            const isCompleted = ["waba-lookup", "phone-lookup", "subscribe", "register", "complete"].includes(wizardState.step) && ["auth", "code-exchange", "waba-lookup"].includes(key);
            return /* @__PURE__ */ jsx(
              "div",
              {
                className: `p-4 rounded-xl border-2 transition-all ${isActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : isCompleted ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"}`,
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  isCompleted ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-green-600 dark:text-green-400" }) : isActive ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" }) : /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-gray-400" }),
                  /* @__PURE__ */ jsx("span", { className: `text-xs font-semibold ${isActive ? "text-blue-700 dark:text-blue-300" : isCompleted ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400"}`, children: label })
                ] })
              },
              key
            );
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Link$1, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Connection Details" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Complete the setup to create your WhatsApp connection" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-6", children: [
          wizardState.step === "init" && /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
            /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 mb-6", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-10 w-10 text-emerald-600 dark:text-emerald-400" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Ready to Start" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto", children: "Click the button below to begin the Meta Embedded Signup process. You'll be guided through authorization and connection setup." }),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: startWizard,
                disabled: !embeddedReady,
                className: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/50 rounded-xl px-8",
                children: !embeddedReady ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                  "Loading Meta SDK..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
                  "Start Setup"
                ] })
              }
            )
          ] }),
          (wizardState.step === "auth" || wizardState.step === "code-exchange") && /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" }),
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: wizardState.step === "auth" ? "Authorizing with Meta..." : "Exchanging authorization code..." }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: wizardState.message })
          ] }),
          ["waba-lookup", "phone-lookup", "subscribe", "register"].includes(wizardState.step) && /* @__PURE__ */ jsxs("form", { onSubmit: submitEmbedded, className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "wizard_name", value: "Connection Name", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "wizard_name",
                  type: "text",
                  value: embeddedForm.data.name,
                  className: "mt-1 block w-full rounded-xl",
                  onChange: (e) => embeddedForm.setData("name", e.target.value),
                  placeholder: "My Meta WhatsApp Connection"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: embeddedForm.errors?.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "wizard_waba", value: "WhatsApp Business Account ID", className: "text-sm font-semibold mb-2" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    id: "wizard_waba",
                    type: "text",
                    value: embeddedForm.data.waba_id,
                    className: "mt-1 block w-full rounded-xl font-mono",
                    onChange: (e) => embeddedForm.setData("waba_id", e.target.value),
                    placeholder: "Auto-filled after signup",
                    readOnly: !!wizardState.data.wabaId
                  }
                ),
                wizardState.data.wabaId && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
                  "Auto-detected from Meta"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "wizard_phone_id", value: "Phone Number ID", className: "text-sm font-semibold mb-2" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    id: "wizard_phone_id",
                    type: "text",
                    value: embeddedForm.data.phone_number_id,
                    className: "mt-1 block w-full rounded-xl font-mono",
                    onChange: (e) => embeddedForm.setData("phone_number_id", e.target.value),
                    placeholder: "Auto-filled after signup",
                    readOnly: !!wizardState.data.phoneNumberId
                  }
                ),
                wizardState.data.phoneNumberId && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
                  "Auto-detected from Meta"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "wizard_business_phone", value: "Business Phone (Optional)", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "wizard_business_phone",
                  type: "text",
                  value: embeddedForm.data.business_phone,
                  className: "mt-1 block w-full rounded-xl",
                  onChange: (e) => embeddedForm.setData("business_phone", e.target.value),
                  placeholder: "+1234567890",
                  readOnly: !!wizardState.data.businessPhone
                }
              ),
              wizardState.data.businessPhone && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
                "Auto-detected from Meta"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "wizard_pin", value: "Registration PIN (Optional)", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "wizard_pin",
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
            autoCreateMode && /* @__PURE__ */ jsx(Alert, { variant: "info", children: "Auto-create is running. Please wait while we complete connection setup." }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                disabled: autoCreateMode || embeddedForm.processing || !embeddedForm.data.code && !embeddedForm.data.access_token,
                className: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/40 rounded-xl",
                children: embeddedForm.processing ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                  "Creating..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 mr-2" }),
                  "Create Connection"
                ] })
              }
            ) })
          ] }),
          wizardState.step === "complete" && wizardState.progress === 100 && /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
            /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 mb-6", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-10 w-10 text-green-600 dark:text-green-400" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Connection Created Successfully!" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "Your WhatsApp connection has been set up and is ready to use." }),
            /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.connections.index", {}), children: /* @__PURE__ */ jsx(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl", children: "View Connections" }) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  EmbeddedWizard as default
};
