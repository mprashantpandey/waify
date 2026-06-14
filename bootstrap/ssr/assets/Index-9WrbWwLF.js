import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState, useRef, useEffect, useMemo } from "react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { M as Modal } from "./Elements-EbyZDnT_.js";
import { Sparkles, Loader2, UserCheck, KeyRound, QrCode, Link, Phone, CheckCircle2, Zap, ShieldCheck, Medal, MessageCircle, AlertTriangle, RefreshCw, Trash2, BadgeCheck, Image, Building2, Mail, MapPin, Globe2 } from "lucide-react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "axios";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
function ConnectionsIndex({
  connections,
  canCreate,
  embeddedSignup,
  centralWebhook,
  defaultApiVersion
}) {
  const { addToast } = useToast();
  const activeConnections = connections.filter((item) => item.is_active);
  const connection = activeConnections[0] ?? null;
  const [embeddedReady, setEmbeddedReady] = useState(false);
  const [autoStatus, setAutoStatus] = useState("idle");
  const [autoMessage, setAutoMessage] = useState("Meta embedded signup is ready to connect your WABA account.");
  const [showAutoDialog, setShowAutoDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showMetaDetails, setShowMetaDetails] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [signupMode, setSignupMode] = useState("cloud_api");
  const [setupPath, setSetupPath] = useState("new_cloud_api");
  const [refreshingHealth, setRefreshingHealth] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const embeddedSessionRef = useRef({});
  const embeddedEnabled = Boolean(embeddedSignup?.enabled && embeddedSignup?.appId && (embeddedSignup?.configId || embeddedSignup?.coexistenceConfigId));
  const connectionKey = connection?.id ?? "new";
  const profileForm = useForm({
    _method: "put",
    name: connection?.name ?? "",
    waba_id: connection?.waba_id ?? "",
    phone_number_id: connection?.phone_number_id ?? "",
    business_phone: connection?.business_phone ?? "",
    business_category: connection?.business_category ?? "Retail",
    business_about: connection?.business_about ?? "Turn conversations into conversions.",
    business_address: connection?.business_address ?? "",
    business_description: connection?.business_description ?? "",
    business_email: connection?.business_email ?? "",
    business_websites: connection?.business_websites?.length ? connection.business_websites : ["", ""],
    business_vertical: connection?.business_vertical ?? "RETAIL",
    profile_picture_handle: connection?.profile_picture_handle ?? "",
    profile_picture_file: null,
    access_token: "",
    api_version: connection?.api_version ?? defaultApiVersion,
    throughput_cap_per_minute: connection?.throughput_cap_per_minute ?? 120,
    quiet_hours_start: connection?.quiet_hours_start ?? "",
    quiet_hours_end: connection?.quiet_hours_end ?? "",
    quiet_hours_timezone: connection?.quiet_hours_timezone ?? "UTC"
  });
  const manualForm = useForm({
    name: "",
    waba_id: "",
    phone_number_id: "",
    business_phone: "",
    business_category: "Retail",
    business_about: "Turn conversations into conversions.",
    business_address: "",
    business_description: "",
    business_email: "",
    business_websites: ["", ""],
    business_vertical: "RETAIL",
    access_token: "",
    api_version: defaultApiVersion,
    throughput_cap_per_minute: 120,
    quiet_hours_start: "",
    quiet_hours_end: "",
    quiet_hours_timezone: "UTC"
  });
  const qrForm = useForm({
    name: "WhatsApp QR (Unofficial)",
    throughput_cap_per_minute: 15,
    quiet_hours_start: "",
    quiet_hours_end: "",
    quiet_hours_timezone: "Asia/Kolkata"
  });
  const [qrState, setQrState] = useState({});
  useEffect(() => {
    if (!connection) {
      profileForm.setData({
        _method: "put",
        name: "",
        waba_id: "",
        phone_number_id: "",
        business_phone: "",
        business_category: "Retail",
        business_about: "Turn conversations into conversions.",
        business_address: "",
        business_description: "",
        business_email: "",
        business_websites: ["", ""],
        business_vertical: "RETAIL",
        profile_picture_handle: "",
        profile_picture_file: null,
        access_token: "",
        api_version: defaultApiVersion,
        throughput_cap_per_minute: 120,
        quiet_hours_start: "",
        quiet_hours_end: "",
        quiet_hours_timezone: "UTC"
      });
      return;
    }
    profileForm.setData({
      _method: "put",
      name: connection.name ?? "",
      waba_id: connection.waba_id ?? "",
      phone_number_id: connection.phone_number_id ?? "",
      business_phone: connection.business_phone ?? "",
      business_category: connection.business_category ?? "Retail",
      business_about: connection.business_about ?? "Turn conversations into conversions.",
      business_address: connection.business_address ?? "",
      business_description: connection.business_description ?? "",
      business_email: connection.business_email ?? "",
      business_websites: connection.business_websites?.length ? connection.business_websites : ["", ""],
      business_vertical: connection.business_vertical ?? "RETAIL",
      profile_picture_handle: connection.profile_picture_handle ?? "",
      profile_picture_file: null,
      access_token: "",
      api_version: connection.api_version ?? defaultApiVersion,
      throughput_cap_per_minute: connection.throughput_cap_per_minute ?? 120,
      quiet_hours_start: connection.quiet_hours_start ?? "",
      quiet_hours_end: connection.quiet_hours_end ?? "",
      quiet_hours_timezone: connection.quiet_hours_timezone ?? "UTC"
    });
  }, [connectionKey]);
  useEffect(() => {
    if (!embeddedEnabled) {
      return;
    }
    const handleEmbeddedMessage = (event) => {
      if (typeof event.origin !== "string" || !event.origin.endsWith("facebook.com")) {
        return;
      }
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "WA_EMBEDDED_SIGNUP") {
          embeddedSessionRef.current = data || {};
          if (data.event === "FINISH") {
            setAutoMessage("Meta signup completed. Finishing setup in Zyptos...");
          } else if (data.event === "CANCEL") {
            setAutoStatus("error");
            setAutoMessage("Meta signup was cancelled before completion.");
          } else if (data.event === "ERROR") {
            setAutoStatus("error");
            setAutoMessage(data?.data?.error_message || "Meta embedded signup returned an error.");
          }
        }
      } catch (error) {
        setAutoStatus("error");
        setAutoMessage("Zyptos could not read the Meta embedded signup callback.");
      }
    };
    window.addEventListener("message", handleEmbeddedMessage);
    const initSdk = () => {
      if (!window.FB) {
        return;
      }
      window.FB.init({
        appId: embeddedSignup.appId,
        cookie: true,
        xfbml: true,
        version: embeddedSignup.apiVersion || defaultApiVersion || "v25.0"
      });
      setEmbeddedReady(true);
      setAutoStatus("idle");
      setAutoMessage("Meta embedded signup is ready to connect your WABA account.");
    };
    if (window.FB) {
      initSdk();
      return;
    }
    setAutoStatus("loading");
    setAutoMessage("Loading Meta embedded signup...");
    window.fbAsyncInit = initSdk;
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    return () => {
      window.removeEventListener("message", handleEmbeddedMessage);
    };
  }, [connectionKey, embeddedEnabled, embeddedSignup?.appId, embeddedSignup?.apiVersion, defaultApiVersion]);
  useEffect(() => {
    if (connection || typeof window === "undefined") {
      return;
    }
    const setup = new URLSearchParams(window.location.search).get("setup");
    if (setup === "embedded") {
      setSetupPath("new_cloud_api");
      setSignupMode("cloud_api");
      setShowAutoDialog(true);
      return;
    }
    if (setup === "migrate_api") {
      setSetupPath("migrate_api");
      setSignupMode("cloud_api");
      setShowAutoDialog(true);
      return;
    }
    if (setup === "coexistence") {
      setSetupPath("coexistence");
      setSignupMode("coexistence");
      setShowAutoDialog(true);
      return;
    }
    if (setup === "manual") {
      setShowManualDialog(true);
      return;
    }
    if (setup === "qr") {
      setShowQrDialog(true);
    }
  }, [connectionKey, connection]);
  const maskBusinessId = (value) => {
    if (!value) return "Not available";
    if (value.length <= 8) return value;
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  };
  const automaticDisabled = !canCreate || !embeddedEnabled || !embeddedReady || signupMode === "cloud_api" && !embeddedSignup?.configId || signupMode === "coexistence" && !embeddedSignup?.coexistenceEnabled || autoStatus === "authorizing" || autoStatus === "saving";
  const automaticButtonLabel = useMemo(() => {
    if (!embeddedEnabled) return "Meta setup unavailable";
    if (signupMode === "cloud_api" && !embeddedSignup?.configId) return "Embedded config missing";
    if (signupMode === "coexistence" && !embeddedSignup?.coexistenceEnabled) return "Embedded config missing";
    if (!embeddedReady || autoStatus === "loading") return "Loading Meta...";
    if (autoStatus === "authorizing") return "Opening Meta...";
    if (autoStatus === "saving") return "Finishing setup...";
    if (signupMode === "coexistence") return "Connect with co-existence";
    if (setupPath === "migrate_api") return "Start migration";
    return "Connect automatically";
  }, [embeddedEnabled, embeddedReady, autoStatus, signupMode, setupPath, embeddedSignup?.coexistenceEnabled]);
  const submitEmbedded = (payload) => {
    setAutoStatus("saving");
    setAutoMessage("Completing setup and linking your WABA account...");
    router.post(route("app.whatsapp.connections.store-embedded", {}), payload, {
      preserveScroll: true,
      onSuccess: () => {
        setAutoStatus("idle");
        setAutoMessage("WABA account connected successfully.");
        setShowAutoDialog(false);
        addToast({ title: "WABA account connected", variant: "success" });
      },
      onError: (errors) => {
        setAutoStatus("error");
        setAutoMessage(errors?.embedded || "Meta embedded signup could not be completed.");
        addToast({ title: "Embedded signup failed", variant: "error" });
      }
    });
  };
  const startEmbeddedSignup = () => {
    if (automaticDisabled || !window.FB) {
      return;
    }
    setAutoStatus("authorizing");
    setAutoMessage("Opening Meta embedded signup...");
    window.FB.login(
      (response) => {
        if (!response?.authResponse) {
          setAutoStatus("error");
          setAutoMessage("Meta signup was cancelled or did not fully authorize.");
          return;
        }
        const code = response.authResponse.code || "";
        const accessToken = response.authResponse.accessToken || "";
        if (!code && !accessToken) {
          setAutoStatus("error");
          setAutoMessage("Meta did not return an authorization code. Please try again.");
          return;
        }
        window.setTimeout(() => {
          const session = embeddedSessionRef.current || {};
          const sessionData = session.data || {};
          submitEmbedded({
            name: "",
            waba_id: sessionData.waba_id || session.waba_id || "",
            phone_number_id: sessionData.phone_number_id || session.phone_number_id || "",
            business_id: sessionData.business_id || session.business_id || "",
            business_phone: sessionData.phone_number || sessionData.display_phone_number || "",
            session_info: JSON.stringify(session),
            connection_mode: signupMode,
            access_token: accessToken,
            code,
            pin: ""
          });
        }, 350);
      },
      {
        config_id: signupMode === "coexistence" && embeddedSignup.coexistenceConfigId ? embeddedSignup.coexistenceConfigId : embeddedSignup.configId,
        response_type: "code",
        override_default_response_type: true,
        scope: "whatsapp_business_management,whatsapp_business_messaging,business_management",
        extras: {
          version: embeddedSignup.apiVersion || defaultApiVersion || "v25.0",
          sessionInfoVersion: "3",
          setup: {}
        }
      }
    );
  };
  const submitManual = (event) => {
    event.preventDefault();
    manualForm.post(route("app.whatsapp.connections.store", {}), {
      preserveScroll: true,
      onSuccess: () => {
        setShowManualDialog(false);
        addToast({ title: "WABA account connected", variant: "success" });
      }
    });
  };
  const submitProfile = (event) => {
    event.preventDefault();
    if (!connection) return;
    profileForm.post(route("app.whatsapp.connections.update", { connection: connection.slug ?? connection.id }), {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => addToast({ title: "Business profile saved", variant: "success" })
    });
  };
  const updateWebsite = (index, value) => {
    const websites = [...profileForm.data.business_websites || ["", ""]];
    websites[index] = value;
    profileForm.setData("business_websites", websites);
  };
  const refreshMetaHealth = () => {
    if (!connection) return;
    setRefreshingHealth(true);
    router.post(route("app.whatsapp.connections.sync-meta", { connection: connection.slug ?? connection.id }), {}, {
      preserveScroll: true,
      onFinish: () => setRefreshingHealth(false),
      onSuccess: () => addToast({ title: "Meta details synced", variant: "success" })
    });
  };
  const disconnectWaba = () => {
    if (!connection) return;
    setDisconnecting(true);
    router.delete(route("app.whatsapp.connections.destroy", { connection: connection.slug ?? connection.id }), {
      preserveScroll: true,
      onSuccess: () => {
        setShowDisconnectDialog(false);
        addToast({ title: "WABA account disconnected", variant: "success" });
      },
      onFinish: () => setDisconnecting(false)
    });
  };
  useEffect(() => {
    if (!connection || connection.connection_mode !== "baileys_qr") {
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(route("app.whatsapp.connections.qr.status", { connection: connection.slug ?? connection.id }), {
          headers: { Accept: "application/json" }
        });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        setQrState({
          status: data.bridge?.status || data.connection?.status,
          qr: data.bridge?.qr || null,
          phone: data.bridge?.phone || data.connection?.business_phone || null,
          error: data.bridge?.error || data.connection?.last_error || null
        });
      } catch {
        if (!cancelled) {
          setQrState((current) => ({ ...current, status: "bridge_unavailable" }));
        }
      }
    };
    poll();
    const interval = window.setInterval(poll, 5e3);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [connectionKey, connection?.connection_mode]);
  const submitQr = (event) => {
    event.preventDefault();
    qrForm.post(route("app.whatsapp.connections.qr.store"), {
      preserveScroll: true,
      onSuccess: () => {
        setShowQrDialog(false);
        addToast({ title: "QR connection created", variant: "success" });
      }
    });
  };
  const reconnectQr = () => {
    if (!connection) return;
    router.post(route("app.whatsapp.connections.qr.reconnect", { connection: connection.slug ?? connection.id }), {}, {
      preserveScroll: true,
      onSuccess: () => addToast({ title: "QR session restarted", variant: "success" })
    });
  };
  const disconnectQr = () => {
    if (!connection) return;
    router.delete(route("app.whatsapp.connections.qr.disconnect", { connection: connection.slug ?? connection.id }), {
      preserveScroll: false,
      onSuccess: () => {
        addToast({ title: "QR session disconnected", variant: "success" });
        router.visit(route("app.whatsapp.connections.index"), {
          preserveScroll: false,
          preserveState: false,
          replace: true
        });
      }
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "WABA Account" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1100px] space-y-6", children: [
      !connection ? /* @__PURE__ */ jsxs("section", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsx(Card, { className: "p-5 ring-1 ring-waify-green/35", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-waify-green text-white", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Embedded / Auto connection" }),
                  /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Recommended" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use Meta embedded signup. Inside this flow users can choose a new number, API migration, or eligible Business App coexistence." })
              ] })
            ] }),
            /* @__PURE__ */ jsx("ol", { className: "mt-2 space-y-1", children: ["Sign in with Meta", "Choose setup path", "Select WABA and phone", "Complete setup here"].map((step, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-waify-text dark:bg-slate-700 dark:text-waify-dark-text", children: index + 1 }),
              step
            ] }, step)) }),
            /* @__PURE__ */ jsx("div", { className: "rounded-card border border-waify-border bg-white p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text-muted", children: autoStatus === "loading" || autoStatus === "authorizing" || autoStatus === "saving" ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
              autoMessage
            ] }) : autoMessage }),
            /* @__PURE__ */ jsxs(Button, { onClick: () => {
              setSetupPath("new_cloud_api");
              setSignupMode("cloud_api");
              setShowAutoDialog(true);
            }, disabled: !canCreate, className: "mt-auto w-full sm:w-auto", children: [
              /* @__PURE__ */ jsx(UserCheck, { className: "h-3.5 w-3.5" }),
              "Start auto setup"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white", children: /* @__PURE__ */ jsx(KeyRound, { className: "h-5 w-5 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Manual setup" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use this only when support asks you to add WABA ID, phone number ID, and a permanent token manually." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => setShowManualDialog(true), className: "mt-auto w-full sm:w-auto", children: [
              /* @__PURE__ */ jsx(KeyRound, { className: "h-3.5 w-3.5" }),
              "Configure manually"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-700", children: /* @__PURE__ */ jsx(QrCode, { className: "h-5 w-5 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "WhatsApp QR (Unofficial)" }),
                  /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "No anti-ban guarantee" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Link a regular WhatsApp session by QR. Zyptos adds throttling and safety controls, but bans cannot be guaranteed against." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => setShowQrDialog(true), disabled: !canCreate, className: "mt-auto w-full sm:w-auto", children: [
              /* @__PURE__ */ jsx(QrCode, { className: "h-3.5 w-3.5" }),
              "Connect by QR"
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-start gap-3 p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-waify-green-soft dark:bg-waify-green/10", children: /* @__PURE__ */ jsx(Link, { className: "h-4 w-4 text-waify-green-dark dark:text-waify-green" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "One WABA account per workspace" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "A workspace uses one WABA account so contacts, templates, and billing references stay aligned." })
          ] })
        ] }) })
      ] }) : /* @__PURE__ */ jsxs("section", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "WhatsApp" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: connection.connection_mode === "baileys_qr" ? "WhatsApp QR (Unofficial)" : "Business API connection" })
        ] }),
        connection.connection_mode === "baileys_qr" && /* @__PURE__ */ jsx(
          QrConnectionPanel,
          {
            connection,
            qrState,
            onReconnect: reconnectQr,
            onDisconnect: disconnectQr
          }
        ),
        connection.connection_mode !== "baileys_qr" && /* @__PURE__ */ jsx("div", { className: "rounded-card bg-gradient-to-br from-waify-green-soft to-emerald-50 p-5 ring-1 ring-emerald-100 dark:from-emerald-950/30 dark:to-slate-800 dark:ring-emerald-900/50 lg:p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-card dark:bg-slate-800", children: /* @__PURE__ */ jsx(Phone, { className: "h-6 w-6 text-waify-green-dark dark:text-waify-green" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: connection.meta_verified_name || profileForm.data.name || connection.name }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-medium text-white", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5" }),
                "Connected"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              connection.business_phone || connection.phone_number_id,
              " · ",
              connection.meta_waba_name || profileForm.data.business_vertical || "RETAIL",
              " · Business Account ID:",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-mono text-waify-text dark:text-waify-dark-text", children: maskBusinessId(connection.waba_id) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-3 text-xs", children: [
              /* @__PURE__ */ jsx(StatusPill, { icon: /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 text-emerald-600" }), label: "API:", value: connection.phone_number_status || "Connected" }),
              /* @__PURE__ */ jsx(StatusPill, { icon: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3 w-3 text-blue-600" }), label: "Display name:", value: connection.meta_verified_name || "Not synced" }),
              /* @__PURE__ */ jsx(StatusPill, { icon: /* @__PURE__ */ jsx(Medal, { className: "h-3 w-3 text-amber-600" }), label: "Quality:", value: connection.quality_rating || "Not synced" }),
              connection.connection_mode === "coexistence" && /* @__PURE__ */ jsx(StatusPill, { icon: /* @__PURE__ */ jsx(MessageCircle, { className: "h-3 w-3 text-emerald-700" }), label: "Co-existence:", value: connection.coexistence_status || "Connected" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 flex-col gap-2 sm:items-end", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              connection.setup_method === "manual" && /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: connection.webhook_subscribed ? "secondary" : "warning",
                  className: connection.webhook_subscribed ? "" : "border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/30",
                  onClick: () => setShowWebhookDialog(true),
                  children: [
                    /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }),
                    "Attention"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => {
                setSetupPath(connection.connection_mode === "coexistence" ? "coexistence" : "new_cloud_api");
                setSignupMode(connection.connection_mode === "coexistence" ? "coexistence" : "cloud_api");
                setShowAutoDialog(true);
              }, disabled: autoStatus === "authorizing" || autoStatus === "saving", children: [
                autoStatus === "authorizing" || autoStatus === "saving" ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
                "Reconnect"
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "danger", onClick: () => setShowDisconnectDialog(true), disabled: disconnecting, children: [
                disconnecting ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                "Disconnect"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setShowMetaDetails((value) => !value), children: showMetaDetails ? "Hide details" : "Display details" })
          ] })
        ] }) }),
        connection.connection_mode !== "baileys_qr" && showMetaDetails && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(DetailItem, { label: "WABA ID", value: connection.waba_id || "Not available", mono: true }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Business Manager ID", value: connection.meta_business_id || "Not synced", mono: true }),
          /* @__PURE__ */ jsx(DetailItem, { label: "WABA name", value: connection.meta_waba_name || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Phone Number ID", value: connection.phone_number_id || "Not available", mono: true }),
          /* @__PURE__ */ jsx(DetailItem, { label: "WABA number", value: connection.business_phone || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Display name", value: connection.meta_verified_name || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Phone status", value: connection.phone_number_status || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Quality rating", value: connection.quality_rating || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Code verification", value: connection.code_verification_status || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Account review", value: connection.meta_account_review_status || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Business verification", value: connection.meta_business_verification_status || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Template namespace", value: connection.meta_template_namespace || "Not synced", mono: true }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Meta timezone ID", value: connection.meta_timezone_id || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Business vertical", value: connection.business_vertical || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Connection mode", value: connection.connection_mode === "coexistence" ? "WhatsApp app co-existence" : "Cloud API" }),
          connection.connection_mode === "coexistence" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(DetailItem, { label: "Co-existence status", value: connection.coexistence_status || "Not checked" }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Last co-existence check", value: connection.coexistence_last_checked_at ? new Date(connection.coexistence_last_checked_at).toLocaleString() : "Not checked" }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Co-existence warning", value: connection.coexistence_last_error || "No warning", className: "sm:col-span-2" })
          ] }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Full address", value: connection.business_address || "Not synced", className: "sm:col-span-2" })
        ] }) }) }),
        showWebhookDialog && /* @__PURE__ */ jsx(
          WebhookSetupDialog,
          {
            connection,
            centralWebhook,
            onClose: () => setShowWebhookDialog(false)
          }
        ),
        showVerificationDialog && /* @__PURE__ */ jsx(VerificationDialog, { onClose: () => setShowVerificationDialog(false) }),
        connection.connection_mode !== "baileys_qr" && /* @__PURE__ */ jsx(
          WabaHealthPanel,
          {
            connection,
            embeddedEnabled,
            refreshing: refreshingHealth,
            onRefresh: refreshMetaHealth,
            onWebhookSetup: () => setShowWebhookDialog(true)
          }
        ),
        connection.connection_mode !== "baileys_qr" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "WhatsApp preview" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "How customers see this business profile in WhatsApp." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(WhatsAppProfilePreview, { connection }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Verified badge services" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Guided readiness for Meta Verified or Official Business Account review." })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("div", { className: "rounded-card border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/70 dark:bg-blue-950/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx(BadgeCheck, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700 dark:text-blue-300" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-blue-950 dark:text-blue-100", children: "Blue-tick assistance" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-blue-800 dark:text-blue-200", children: "We can help prepare business verification, profile completeness, policy readiness, and submission support. Meta makes the final approval or subscription decision." })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                "Business Manager verification readiness",
                "Display name and profile review",
                "Policy and website/domain checks",
                "Meta Verified or OBA guidance"
              ].map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-waify-green" }),
                item
              ] }, item)) }),
              /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => setShowVerificationDialog(true), className: "w-full", children: [
                /* @__PURE__ */ jsx(BadgeCheck, { className: "h-4 w-4" }),
                "View service details"
              ] })
            ] })
          ] })
        ] }),
        connection.connection_mode !== "baileys_qr" && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Business profile" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Manage the public WhatsApp profile for this phone number." })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: submitProfile, className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/60 sm:flex-row sm:items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-waify-border bg-white dark:border-waify-dark-border dark:bg-slate-950", children: connection.profile_picture_url ? /* @__PURE__ */ jsx("img", { src: connection.profile_picture_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx(Image, { className: "h-8 w-8 text-waify-text-muted dark:text-waify-dark-text-muted" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Profile photo" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Upload a square JPG or PNG. Meta returns the public profile image URL after sync." }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    accept: "image/jpeg,image/png",
                    onChange: (event) => profileForm.setData("profile_picture_file", event.currentTarget.files?.[0] ?? null),
                    className: "mt-3 block w-full text-xs text-waify-text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-waify-green file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white dark:text-waify-dark-text-muted"
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: profileForm.errors.profile_picture_file, className: "mt-1" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsx(Field, { icon: /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }), label: "Business display name", value: profileForm.data.name, onChange: (value) => profileForm.setData("name", value), error: profileForm.errors.name, required: true }),
              /* @__PURE__ */ jsx(SelectField, { label: "Business vertical", value: profileForm.data.business_vertical, onChange: (value) => profileForm.setData("business_vertical", value), error: profileForm.errors.business_vertical }),
              /* @__PURE__ */ jsx(Field, { icon: /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }), label: "Business phone", value: profileForm.data.business_phone, onChange: (value) => profileForm.setData("business_phone", value), error: profileForm.errors.business_phone }),
              /* @__PURE__ */ jsx(Field, { icon: /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }), label: "Contact email", value: profileForm.data.business_email, onChange: (value) => profileForm.setData("business_email", value), error: profileForm.errors.business_email, type: "email" }),
              /* @__PURE__ */ jsx(Field, { icon: /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }), label: "Business address", value: profileForm.data.business_address, onChange: (value) => profileForm.setData("business_address", value), error: profileForm.errors.business_address, className: "sm:col-span-2" }),
              /* @__PURE__ */ jsx(TextAreaField, { label: "About text", value: profileForm.data.business_about, onChange: (value) => profileForm.setData("business_about", value), error: profileForm.errors.business_about, maxLength: 139, className: "sm:col-span-2" }),
              /* @__PURE__ */ jsx(TextAreaField, { label: "Business description", value: profileForm.data.business_description, onChange: (value) => profileForm.setData("business_description", value), error: profileForm.errors.business_description, maxLength: 512, className: "sm:col-span-2" }),
              /* @__PURE__ */ jsx(Field, { icon: /* @__PURE__ */ jsx(Globe2, { className: "h-3.5 w-3.5" }), label: "Website 1", value: profileForm.data.business_websites?.[0] ?? "", onChange: (value) => updateWebsite(0, value), error: profileForm.errors["business_websites.0"], placeholder: "https://example.com" }),
              /* @__PURE__ */ jsx(Field, { icon: /* @__PURE__ */ jsx(Globe2, { className: "h-3.5 w-3.5" }), label: "Website 2", value: profileForm.data.business_websites?.[1] ?? "", onChange: (value) => updateWebsite(1, value), error: profileForm.errors["business_websites.1"], placeholder: "https://instagram.com/yourbrand" }),
              /* @__PURE__ */ jsx(Field, { label: "Profile picture handle", value: profileForm.data.profile_picture_handle, onChange: (value) => profileForm.setData("profile_picture_handle", value), error: profileForm.errors.profile_picture_handle, placeholder: "Optional Meta upload handle", className: "sm:col-span-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-t border-waify-border pt-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  "Phone Number ID: ",
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-waify-text dark:text-waify-dark-text", children: connection.phone_number_id })
                ] }),
                connection.profile_synced_at && /* @__PURE__ */ jsxs("div", { children: [
                  "Last synced with Meta: ",
                  new Date(connection.profile_synced_at).toLocaleString()
                ] }),
                connection.profile_sync_error && /* @__PURE__ */ jsxs("div", { className: "text-amber-700 dark:text-amber-300", children: [
                  "Last sync warning: ",
                  connection.profile_sync_error
                ] })
              ] }),
              /* @__PURE__ */ jsxs(Button, { type: "submit", size: "sm", disabled: profileForm.processing, children: [
                profileForm.processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
                "Save profile"
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/60", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Messaging limits" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: connection.connection_mode === "baileys_qr" ? "QR sessions can send inbox replies and campaigns with throttling, quiet hours, opt-out filtering, and adaptive backoff. Anti-ban is not guaranteed." : "Messaging limits are managed by Meta and may vary by phone number quality and verification state." })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        SetupWizardDialog,
        {
          open: showAutoDialog,
          onClose: () => setShowAutoDialog(false),
          embeddedEnabled,
          embeddedReady,
          autoStatus,
          autoMessage,
          automaticDisabled,
          automaticButtonLabel,
          startEmbeddedSignup,
          connection,
          setupPath,
          signupMode,
          setSignupMode,
          setSetupPath,
          coexistenceEnabled: Boolean(embeddedSignup?.coexistenceEnabled)
        }
      ),
      /* @__PURE__ */ jsx(
        DisconnectWabaDialog,
        {
          open: showDisconnectDialog,
          onClose: () => setShowDisconnectDialog(false),
          onConfirm: disconnectWaba,
          processing: disconnecting,
          connection
        }
      ),
      /* @__PURE__ */ jsx(
        ManualSetupDialog,
        {
          open: showManualDialog,
          onClose: () => setShowManualDialog(false),
          manualForm,
          submitManual
        }
      ),
      /* @__PURE__ */ jsx(
        QrSetupDialog,
        {
          open: showQrDialog,
          onClose: () => setShowQrDialog(false),
          qrForm,
          submitQr
        }
      )
    ] })
  ] });
}
function QrConnectionPanel({
  connection,
  qrState,
  onReconnect,
  onDisconnect
}) {
  const status = qrState.status || connection.qr_status || "starting";
  const connected = status === "connected";
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-5 p-5 lg:grid-cols-[280px_minmax(0,1fr)]", children: [
    /* @__PURE__ */ jsx("div", { className: "flex min-h-[280px] items-center justify-center rounded-card border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-slate-950", children: qrState.qr && !connected ? /* @__PURE__ */ jsx("img", { src: qrState.qr, alt: "WhatsApp QR code", className: "h-64 w-64 rounded-btn object-contain" }) : /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: `mx-auto flex h-16 w-16 items-center justify-center rounded-full ${connected ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"}`, children: connected ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-7 w-7" }) : /* @__PURE__ */ jsx(QrCode, { className: "h-7 w-7" }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: connected ? "QR session connected" : "Waiting for QR code" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: connected ? qrState.phone || connection.business_phone || "Phone linked" : "Restart the session if the QR does not appear." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: connection.name }),
            /* @__PURE__ */ jsx(Badge, { variant: connected ? "success" : status === "bridge_unavailable" ? "danger" : "warning", children: status.replace(/_/g, " ") })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Scan with WhatsApp mobile: Linked devices → Link a device." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: onReconnect, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            "Restart QR"
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "danger", size: "sm", onClick: onDisconnect, children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
            "Disconnect"
          ] })
        ] })
      ] }),
      qrState.error && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-200", children: qrState.error }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx(DetailItem, { label: "Linked phone", value: qrState.phone || connection.business_phone || "Not linked yet" }),
        /* @__PURE__ */ jsx(DetailItem, { label: "Last seen", value: connection.qr_last_seen_at ? new Date(connection.qr_last_seen_at).toLocaleString() : "Not seen yet" }),
        /* @__PURE__ */ jsx(DetailItem, { label: "Rate cap", value: `${connection.throughput_cap_per_minute || 15} messages/minute` }),
        /* @__PURE__ */ jsx(DetailItem, { label: "Supported use", value: "Inbox, automations, and throttled campaigns" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700 dark:text-amber-200" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-amber-950 dark:text-amber-100", children: "Safety rules enabled" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200", children: [
            /* @__PURE__ */ jsx("li", { children: "Groups, WhatsApp broadcast lists, status, and newsletters are blocked." }),
            /* @__PURE__ */ jsx("li", { children: "Campaigns use per-minute throttling, opt-out filtering, quiet hours, and adaptive backoff." }),
            /* @__PURE__ */ jsx("li", { children: "This is unofficial Baileys usage; Zyptos cannot guarantee anti-ban protection." })
          ] })
        ] })
      ] }) })
    ] })
  ] }) });
}
function QrSetupDialog({
  open,
  onClose,
  qrForm,
  submitQr
}) {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      title: "WhatsApp QR (Unofficial)",
      description: "Create a QR session for inbox, automation, and throttled campaigns.",
      className: "max-w-2xl",
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { type: "submit", form: "qr-login-form", disabled: qrForm.processing, children: [
          qrForm.processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(QrCode, { className: "h-4 w-4" }),
          "Create QR session"
        ] })
      ] }),
      children: /* @__PURE__ */ jsxs("form", { id: "qr-login-form", onSubmit: submitQr, className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100", children: "This uses unofficial Baileys linked-device login. Zyptos adds throttling, quiet hours, opt-out checks, and adaptive backoff, but anti-ban cannot be guaranteed." }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Connection name", value: qrForm.data.name, onChange: (value) => qrForm.setData("name", value), error: qrForm.errors.name }),
          /* @__PURE__ */ jsx(Field, { label: "Max messages/minute", type: "number", value: String(qrForm.data.throughput_cap_per_minute), onChange: (value) => qrForm.setData("throughput_cap_per_minute", Number(value)), error: qrForm.errors.throughput_cap_per_minute }),
          /* @__PURE__ */ jsx(Field, { label: "Quiet hours start", value: qrForm.data.quiet_hours_start, onChange: (value) => qrForm.setData("quiet_hours_start", value), error: qrForm.errors.quiet_hours_start, placeholder: "22:00" }),
          /* @__PURE__ */ jsx(Field, { label: "Quiet hours end", value: qrForm.data.quiet_hours_end, onChange: (value) => qrForm.setData("quiet_hours_end", value), error: qrForm.errors.quiet_hours_end, placeholder: "09:00" })
        ] })
      ] })
    }
  );
}
function WabaHealthPanel({
  connection,
  embeddedEnabled,
  refreshing,
  onRefresh,
  onWebhookSetup
}) {
  const checks = [
    {
      label: "Meta app setup",
      desc: embeddedEnabled ? "Embedded signup config is available." : "Platform embedded signup config is missing.",
      ok: embeddedEnabled
    },
    {
      label: "WABA identifiers",
      desc: connection.waba_id && connection.phone_number_id ? "WABA ID and phone number ID are present." : "WABA ID or phone number ID is missing.",
      ok: Boolean(connection.waba_id && connection.phone_number_id)
    },
    {
      label: "Phone registration",
      desc: connection.phone_number_status || connection.code_verification_status || "Phone status has not been synced from Meta yet.",
      ok: Boolean(connection.phone_number_status || connection.code_verification_status)
    },
    {
      label: "WABA review",
      desc: connection.meta_account_review_status || connection.meta_business_verification_status || "WABA review details have not been synced from Meta yet.",
      ok: Boolean(connection.meta_account_review_status || connection.meta_business_verification_status)
    },
    {
      label: "Business profile",
      desc: connection.profile_sync_error ? connection.profile_sync_error : connection.profile_synced_at ? "Profile data synced from Meta." : "Profile has local values and can be refreshed from Meta.",
      ok: Boolean(connection.profile_synced_at && !connection.profile_sync_error)
    },
    {
      label: "Webhook readiness",
      desc: connection.setup_method !== "manual" ? connection.webhook_subscribed ? "Provider-managed central webhook is subscribed." : "Provider-managed central webhook needs a Meta subscription sync." : connection.webhook_subscribed ? "Manual webhook is subscribed." : "Manual connection should verify webhooks to receive inbound messages.",
      ok: Boolean(connection.webhook_subscribed),
      action: onWebhookSetup
    },
    {
      label: "Webhook signature",
      desc: connection.setup_method !== "manual" ? "Central webhook security is managed at provider level." : connection.webhook_verify_token ? "Verify token is configured." : "Verify token is missing.",
      ok: connection.setup_method !== "manual" || Boolean(connection.webhook_verify_token),
      action: connection.setup_method === "manual" ? onWebhookSetup : void 0
    },
    ...connection.connection_mode === "coexistence" ? [{
      label: "Co-existence diagnostics",
      desc: connection.coexistence_last_error ? connection.coexistence_last_error : connection.coexistence_status ? `Co-existence status: ${connection.coexistence_status}` : "Refresh from Meta to check co-existence status.",
      ok: Boolean(connection.coexistence_status && !connection.coexistence_last_error)
    }] : []
  ];
  const readyCount = checks.filter((check) => check.ok).length;
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "WABA health checklist" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Live readiness checks for setup, profile sync, phone status, and webhook handling." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Badge, { variant: readyCount === checks.length ? "success" : "warning", children: [
          readyCount,
          "/",
          checks.length,
          " ready"
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: onRefresh, disabled: refreshing, children: [
          refreshing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
          "Refresh from Meta"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-2", children: checks.map((check) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70", children: [
      /* @__PURE__ */ jsx("span", { className: `mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${check.ok ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"}`, children: check.ok ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: check.label }),
          /* @__PURE__ */ jsx(Badge, { variant: check.ok ? "success" : "warning", children: check.ok ? "Ready" : "Needs attention" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: check.desc }),
        check.action && /* @__PURE__ */ jsx(Button, { type: "button", variant: "link", size: "sm", className: "mt-2 h-auto p-0", onClick: check.action, children: "Open webhook setup" })
      ] })
    ] }, check.label)) }) })
  ] });
}
function StatusPill({ icon, label, value }) {
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-waify-text dark:bg-slate-800/80 dark:text-waify-dark-text", children: [
    icon,
    label,
    " ",
    /* @__PURE__ */ jsx("strong", { children: value })
  ] });
}
function SetupWizardDialog({
  open,
  onClose,
  embeddedEnabled,
  embeddedReady,
  autoStatus,
  autoMessage,
  automaticDisabled,
  automaticButtonLabel,
  startEmbeddedSignup,
  connection,
  setupPath,
  signupMode,
  setSignupMode,
  setSetupPath,
  coexistenceEnabled
}) {
  const selectedPath = setupPath === "coexistence" ? "coexistence" : setupPath;
  const steps = [
    { title: "Sign in with Meta", desc: "Authenticate the business admin who owns the WhatsApp Business Account or existing number." },
    { title: "Choose Business Manager", desc: selectedPath === "migrate_api" ? "Select the WABA and phone number being migrated or released by the existing provider." : "Select the business, WABA, and phone number to connect with this workspace." },
    { title: "Authorize Zyptos", desc: "Grant required WhatsApp Business Management and Messaging permissions." },
    { title: "Finish in Zyptos", desc: "Zyptos stores the phone ID, subscribes provider webhooks, and syncs profile data." }
  ];
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      title: connection ? "Reconnect WABA account" : selectedPath === "migrate_api" ? "Migrate existing WhatsApp API number" : selectedPath === "coexistence" ? "Connect WhatsApp Business App co-existence" : "Automatic WABA setup",
      description: selectedPath === "migrate_api" ? "Use Meta embedded signup to connect a number already on WhatsApp Business Platform." : selectedPath === "coexistence" ? "Use Meta embedded signup for eligible Business App numbers that can run app + API together." : "Complete Meta embedded signup without leaving this page.",
      className: "max-w-3xl",
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { type: "button", onClick: startEmbeddedSignup, disabled: automaticDisabled, children: [
          autoStatus === "authorizing" || autoStatus === "saving" || autoStatus === "loading" ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(UserCheck, { className: "h-4 w-4" }),
          automaticButtonLabel
        ] })
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                setSetupPath("new_cloud_api");
                setSignupMode("cloud_api");
              },
              className: `rounded-card border p-4 text-left transition ${setupPath === "new_cloud_api" ? "border-waify-green bg-waify-green-soft/70 dark:border-waify-green dark:bg-waify-green/10" : "border-waify-border bg-white hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-waify-green-dark dark:text-waify-green" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "New Cloud API" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: "Standard Meta Embedded Signup for a WABA phone number managed through Cloud API." })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                setSetupPath("migrate_api");
                setSignupMode("cloud_api");
              },
              className: `rounded-card border p-4 text-left transition ${setupPath === "migrate_api" ? "border-waify-green bg-waify-green-soft/70 dark:border-waify-green dark:bg-waify-green/10" : "border-waify-border bg-white hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 text-blue-700 dark:text-blue-300" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Migrate API number" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: "For existing BSP/API numbers. Templates and quality may transfer; old chat history normally does not." })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                setSetupPath("coexistence");
                setSignupMode("coexistence");
              },
              className: `rounded-card border p-4 text-left transition ${setupPath === "coexistence" ? "border-waify-green bg-waify-green-soft/70 dark:border-waify-green dark:bg-waify-green/10" : "border-waify-border bg-white hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4 text-emerald-700 dark:text-emerald-300" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "App co-existence" }),
                  !coexistenceEnabled && /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Signup config missing" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: "For eligible numbers that Meta allows to keep WhatsApp Business app usage alongside API messaging." })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${embeddedEnabled ? "bg-waify-green-soft dark:bg-waify-green/10" : "bg-amber-100 dark:bg-amber-500/10"}`, children: embeddedEnabled ? /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-waify-green-dark dark:text-waify-green" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-amber-700 dark:text-amber-300" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: embeddedEnabled ? "Meta embedded signup is configured" : "Meta embedded signup needs platform settings" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: signupMode === "coexistence" && !coexistenceEnabled ? "Add the Meta Embedded Signup config ID in platform WhatsApp settings before using this mode." : embeddedEnabled ? "This flow uses your platform Meta app ID and embedded signup configuration." : "Add Meta app ID, app secret, and embedded signup config ID in platform WhatsApp settings." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 flex-shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Data migration note" }),
            /* @__PURE__ */ jsx("p", { className: "leading-6", children: "Zyptos starts syncing messages after connection and webhook subscription. Existing chat history from WhatsApp Business App or another provider is not imported through the normal Cloud API. Use CSV import for old contacts if needed." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: steps.map((step, index) => /* @__PURE__ */ jsx("div", { className: "rounded-card border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-slate-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-waify-green-soft text-xs font-bold text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: index + 1 }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: step.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: step.desc })
          ] })
        ] }) }, step.title)) }),
        /* @__PURE__ */ jsx("div", { className: `rounded-card border p-3 text-sm ${autoStatus === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-200" : "border-waify-border bg-white text-waify-text-muted dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text-muted"}`, children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
          (autoStatus === "loading" || autoStatus === "authorizing" || autoStatus === "saving") && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
          !embeddedReady && embeddedEnabled && autoStatus !== "error" ? "Loading Meta SDK..." : autoMessage
        ] }) })
      ] })
    }
  );
}
function ManualSetupDialog({
  open,
  onClose,
  manualForm,
  submitManual
}) {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      title: "Manual WABA setup",
      description: "Use this only when support asks you to add Meta identifiers and a permanent token manually.",
      className: "max-w-3xl",
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { type: "submit", form: "manual-waba-form", disabled: manualForm.processing, children: [
          manualForm.processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
          "Connect manually"
        ] })
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100", children: "Manual connections can send messages after token validation. To receive inbound messages, verify the webhook from the Attention dialog after setup." }),
        /* @__PURE__ */ jsxs("form", { id: "manual-waba-form", onSubmit: submitManual, className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Business display name", value: manualForm.data.name, onChange: (value) => manualForm.setData("name", value), error: manualForm.errors.name }),
          /* @__PURE__ */ jsx(Field, { label: "Business phone", value: manualForm.data.business_phone, onChange: (value) => manualForm.setData("business_phone", value), error: manualForm.errors.business_phone }),
          /* @__PURE__ */ jsx(Field, { label: "WABA ID", value: manualForm.data.waba_id, onChange: (value) => manualForm.setData("waba_id", value), error: manualForm.errors.waba_id }),
          /* @__PURE__ */ jsx(Field, { label: "Phone Number ID", value: manualForm.data.phone_number_id, onChange: (value) => manualForm.setData("phone_number_id", value), error: manualForm.errors.phone_number_id, required: true }),
          /* @__PURE__ */ jsx(Field, { label: "Permanent access token", value: manualForm.data.access_token, onChange: (value) => manualForm.setData("access_token", value), error: manualForm.errors.access_token, required: true, type: "password", className: "sm:col-span-2" })
        ] })
      ] })
    }
  );
}
function DisconnectWabaDialog({
  open,
  onClose,
  onConfirm,
  processing,
  connection
}) {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose: processing ? () => void 0 : onClose,
      title: "Disconnect WABA account",
      description: "Remove this WhatsApp Business API connection from the workspace.",
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, disabled: processing, children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "danger", onClick: onConfirm, disabled: processing, children: [
          processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
          "Disconnect WABA"
        ] })
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-card border border-red-200 bg-red-50 p-4 dark:border-red-900/70 dark:bg-red-950/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-red-950 dark:text-red-100", children: "This removes the active WABA connection." }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-6 text-red-800 dark:text-red-200", children: "Zyptos will try to unsubscribe the Meta webhook first, then remove the local connection so this workspace can connect another WABA." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 text-sm sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(DetailItem, { label: "Display name", value: connection?.meta_verified_name || connection?.name || "Current WABA" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Phone", value: connection?.business_phone || connection?.phone_number_id || "Not synced" }),
          /* @__PURE__ */ jsx(DetailItem, { label: "WABA ID", value: connection?.waba_id || "Not available", mono: true }),
          /* @__PURE__ */ jsx(DetailItem, { label: "Webhook", value: connection?.webhook_subscribed ? "Subscribed" : "Not subscribed" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Related WhatsApp records linked to this connection, such as conversations, templates, and lists, may also be removed by database cascade." })
      ] })
    }
  );
}
function DetailItem({
  label,
  value,
  mono = false,
  className = ""
}) {
  return /* @__PURE__ */ jsxs("div", { className: `rounded-card border border-waify-border bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-slate-900/70 ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
    /* @__PURE__ */ jsx("div", { className: `mt-1 break-words text-sm font-semibold text-waify-text dark:text-waify-dark-text ${mono ? "font-mono" : ""}`, children: value })
  ] });
}
function WhatsAppProfilePreview({ connection }) {
  const displayName = connection.meta_verified_name || connection.name || "Business";
  const phone = connection.business_phone || connection.phone_number_id || "";
  const about = connection.business_about || "Business account";
  const description = connection.business_description || "No business description added yet.";
  const address = connection.business_address || "Address not added";
  const websites = (connection.business_websites || []).filter(Boolean);
  return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-sm overflow-hidden rounded-[28px] bg-[#111b21] p-2 shadow-pop", children: /* @__PURE__ */ jsxs("div", { className: "rounded-[22px] bg-[#0b141a] text-[#e9edef]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-[#075e54] px-4 py-3", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/20", children: connection.profile_picture_url ? /* @__PURE__ */ jsx("img", { src: connection.profile_picture_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex min-w-0 items-center gap-1", children: /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-semibold text-white", children: displayName }) }),
        /* @__PURE__ */ jsx("div", { className: "truncate text-[11px] text-white/75", children: phone })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-[#202c33] p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-[#8696a0]", children: "About" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm leading-5 text-[#e9edef]", children: about })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-[#202c33] p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-[#8696a0]", children: "Business details" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-2 text-sm text-[#d1d7db]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-[#8696a0]" }),
            /* @__PURE__ */ jsx("span", { children: address })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-[#8696a0]" }),
            /* @__PURE__ */ jsx("span", { children: description })
          ] }),
          connection.business_email && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Mail, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-[#8696a0]" }),
            /* @__PURE__ */ jsx("span", { children: connection.business_email })
          ] }),
          websites.map((website) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Globe2, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-[#8696a0]" }),
            /* @__PURE__ */ jsx("span", { className: "break-all text-[#53bdeb]", children: website })
          ] }, website))
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#00a884] text-sm font-semibold text-[#08130f]",
          children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
            "Message business"
          ]
        }
      )
    ] })
  ] }) });
}
function VerificationDialog({ onClose }) {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open: true,
      onClose,
      title: "Blue-tick verification services",
      description: "Meta controls verified badge eligibility and approval. Zyptos can provide readiness checks and guided submission support.",
      className: "max-w-xl",
      footer: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Close" }),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-card border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/70 dark:bg-blue-950/20", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10", children: /* @__PURE__ */ jsx(BadgeCheck, { className: "h-5 w-5 text-blue-700 dark:text-blue-300" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-blue-950 dark:text-blue-100", children: "Readiness and guided submission" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-blue-800 dark:text-blue-200", children: "We can review the workspace profile, business verification assets, website policy pages, and Meta submission readiness." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "What we can add" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-1 gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx("div", { children: "Business verification document checklist" }),
            /* @__PURE__ */ jsx("div", { children: "Display name, website, domain, and policy readiness checks" }),
            /* @__PURE__ */ jsx("div", { children: "Meta Verified subscription guidance where available" }),
            /* @__PURE__ */ jsx("div", { children: "Official Business Account readiness and support handoff" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100", children: "Badge approval is not guaranteed. Meta Verified is a Meta product, and Official Business Account approval depends on Meta eligibility, business verification, policy compliance, and brand notability." })
      ] })
    }
  );
}
function WebhookSetupDialog({
  connection,
  centralWebhook,
  onClose
}) {
  const subscribeWebhook = () => {
    router.post(route("app.whatsapp.connections.subscribe-webhook", { connection: connection.slug ?? connection.id }), {}, {
      preserveScroll: true
    });
  };
  const unsubscribeWebhook = () => {
    router.delete(route("app.whatsapp.connections.unsubscribe-webhook", { connection: connection.slug ?? connection.id }), {
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open: true,
      onClose,
      title: "Webhook setup",
      description: "Sending messages works without webhooks. Receiving inbound messages and delivery/read statuses needs Meta webhook verification.",
      className: "max-w-2xl",
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Close" }),
        connection.webhook_subscribed ? /* @__PURE__ */ jsx(Button, { type: "button", variant: "warning", onClick: unsubscribeWebhook, children: "Unsubscribe" }) : /* @__PURE__ */ jsx(Button, { type: "button", onClick: subscribeWebhook, children: "Subscribe webhook" })
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70", children: [
          /* @__PURE__ */ jsx("div", { className: `mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${connection.webhook_subscribed ? "bg-emerald-100 dark:bg-emerald-500/10" : "bg-amber-100 dark:bg-amber-500/10"}`, children: connection.webhook_subscribed ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-emerald-700 dark:text-emerald-300" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-amber-700 dark:text-amber-300" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Badge, { variant: connection.webhook_subscribed ? "success" : "warning", children: connection.webhook_subscribed ? "Receiving enabled" : "Action needed" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Manual setup accounts need webhook verification only if this workspace should receive inbound messages or status callbacks." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/20", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-emerald-900 dark:text-emerald-100", children: "Recommended: central webhook" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-emerald-800 dark:text-emerald-200", children: "Use this single callback for all connected WABA accounts. Zyptos routes each event internally by the Meta phone number ID in the webhook payload." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-1 gap-3", children: [
            /* @__PURE__ */ jsx(ReadOnlyCopyField, { label: "Central callback URL", value: centralWebhook.url }),
            /* @__PURE__ */ jsx(ReadOnlyCopyField, { label: "Central verify token", value: centralWebhook.verify_token })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Connection-specific fallback" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Keep this only for older manually configured accounts that already use a connection-specific callback." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-1 gap-3", children: [
            /* @__PURE__ */ jsx(ReadOnlyCopyField, { label: "Connection callback URL", value: connection.webhook_url || "" }),
            /* @__PURE__ */ jsx(ReadOnlyCopyField, { label: "Connection verify token", value: connection.webhook_verify_token || "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-waify-border bg-white p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text-muted", children: [
          connection.webhook_last_received_at ? /* @__PURE__ */ jsxs("span", { children: [
            "Last webhook received: ",
            new Date(connection.webhook_last_received_at).toLocaleString()
          ] }) : /* @__PURE__ */ jsx("span", { children: "No inbound webhook has been received yet." }),
          connection.webhook_last_error && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-red-600 dark:text-red-300", children: [
            "Last webhook error: ",
            connection.webhook_last_error
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-slate-900", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Recent Meta events" }),
          connection.meta_event_logs?.length ? /* @__PURE__ */ jsx("div", { className: "mt-3 divide-y divide-gray-100 dark:divide-waify-dark-border", children: connection.meta_event_logs.map((event) => /* @__PURE__ */ jsxs("div", { className: "py-2 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: [
                event.field || "event",
                event.event_type ? ` / ${event.event_type}` : ""
              ] }),
              /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: event.received_at ? new Date(event.received_at).toLocaleString() : "Just now" })
            ] }),
            (event.status || event.message) && /* @__PURE__ */ jsx("div", { className: "mt-1 text-waify-text-muted dark:text-waify-dark-text-muted", children: [event.status, event.message].filter(Boolean).join(" - ") })
          ] }, event.id)) }) : /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "No Meta webhook events have been logged for this connection yet." })
        ] })
      ] })
    }
  );
}
function Field({
  icon,
  label,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  className = "",
  placeholder = ""
}) {
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsxs("label", { className: "mb-1.5 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-red-500", children: " *" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      icon && /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted", children: icon }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type,
          value: value ?? "",
          placeholder,
          onChange: (event) => onChange(event.target.value),
          className: `w-full rounded-card border border-waify-border bg-white py-2 text-sm text-waify-text shadow-sm placeholder:text-waify-text-muted/60 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted/60 ${icon ? "pl-9 pr-3" : "px-3"}`
        }
      )
    ] }),
    /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-1" })
  ] });
}
function TextAreaField({
  label,
  value,
  onChange,
  error,
  maxLength,
  className = ""
}) {
  const length = String(value ?? "").length;
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: label }),
      maxLength && /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
        length,
        "/",
        maxLength
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        value: value ?? "",
        maxLength,
        onChange: (event) => onChange(event.target.value),
        rows: 3,
        className: "w-full resize-none rounded-card border border-waify-border bg-white px-3 py-2 text-sm text-waify-text shadow-sm placeholder:text-waify-text-muted/60 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted/60"
      }
    ),
    /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-1" })
  ] });
}
function ReadOnlyCopyField({ label, value }) {
  const { addToast } = useToast();
  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    addToast({ title: `${label} copied`, variant: "success" });
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "flex overflow-hidden rounded-card border border-waify-border bg-white shadow-sm dark:border-waify-dark-border dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          readOnly: true,
          value,
          className: "min-w-0 flex-1 border-0 bg-transparent px-3 py-2 font-mono text-xs text-waify-text outline-none dark:text-waify-dark-text"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: copy,
          className: "border-l border-waify-border px-3 text-xs font-semibold text-waify-green-dark hover:bg-waify-green-soft dark:border-waify-dark-border dark:text-waify-green dark:hover:bg-waify-green/10",
          children: "Copy"
        }
      )
    ] })
  ] });
}
function SelectField({
  label,
  value,
  onChange,
  error
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs font-medium text-waify-text dark:text-waify-dark-text", children: label }),
    /* @__PURE__ */ jsx(
      "select",
      {
        value: value || "RETAIL",
        onChange: (event) => onChange(event.target.value),
        className: "w-full rounded-card border border-waify-border bg-white px-3 py-2 text-sm text-waify-text shadow-sm dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text",
        children: BUSINESS_VERTICALS.map((vertical) => /* @__PURE__ */ jsx("option", { value: vertical.value, children: vertical.label }, vertical.value))
      }
    ),
    /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-1" })
  ] });
}
const BUSINESS_VERTICALS = [
  { value: "AUTO", label: "Automotive" },
  { value: "BEAUTY", label: "Beauty, spa and salon" },
  { value: "APPAREL", label: "Clothing and apparel" },
  { value: "EDU", label: "Education" },
  { value: "ENTERTAIN", label: "Entertainment" },
  { value: "EVENT_PLAN", label: "Event planning" },
  { value: "FINANCE", label: "Finance and banking" },
  { value: "GROCERY", label: "Grocery" },
  { value: "GOVT", label: "Government" },
  { value: "HOTEL", label: "Hotel and lodging" },
  { value: "HEALTH", label: "Healthcare" },
  { value: "NONPROFIT", label: "Nonprofit" },
  { value: "PROF_SERVICES", label: "Professional services" },
  { value: "RETAIL", label: "Retail" },
  { value: "TRAVEL", label: "Travel and transportation" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "NOT_A_BIZ", label: "Not a business" },
  { value: "OTHER", label: "Other" }
];
export {
  ConnectionsIndex as default
};
