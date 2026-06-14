import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { RefreshCw, Plus, GitBranch, AlertTriangle, Rocket, Archive } from "lucide-react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { D as Drawer } from "./Elements-EbyZDnT_.js";
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
function statusVariant(status) {
  const normalized = status.toLowerCase();
  if (["published", "approved"].includes(normalized)) return "success";
  if (["draft"].includes(normalized)) return "warning";
  if (["deprecated", "blocked", "rejected"].includes(normalized)) return "danger";
  return "secondary";
}
function WhatsAppFlowsIndex({
  flows = [],
  connections = []
}) {
  const { toast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const form = useForm({
    whatsapp_connection_id: connections[0]?.id ?? "",
    name: "",
    category: "OTHER",
    data_channel_uri: "",
    flow_json: ""
  });
  const openCreate = () => {
    form.reset();
    form.setData({
      whatsapp_connection_id: connections[0]?.id ?? "",
      name: "",
      category: "OTHER",
      data_channel_uri: "",
      flow_json: ""
    });
    setDrawerOpen(true);
  };
  const submit = () => {
    form.post(route("app.whatsapp.flows.store"), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Flow created");
        setDrawerOpen(false);
      },
      onError: () => toast.error("Flow could not be created")
    });
  };
  const syncFlows = () => {
    router.post(route("app.whatsapp.flows.sync"), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Flows synced from Meta")
    });
  };
  const action = (flow, type) => {
    router.post(route(`app.whatsapp.flows.${type}`, { flow: flow.id }), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success(type === "publish" ? "Flow published" : "Flow deprecated"),
      onError: () => toast.error(`Flow ${type} failed`)
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "WhatsApp Flows" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text", children: "WhatsApp Flows" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Manage official Meta Flow lifecycle records, sync validation status, and publish structured WhatsApp forms." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: syncFlows, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            "Sync Meta"
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: openCreate, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "New Flow"
          ] })
        ] })
      ] }),
      flows.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-10", children: /* @__PURE__ */ jsx(EmptyState, { icon: GitBranch, title: "No WhatsApp Flows yet", description: "Sync from Meta or create a structured form for lead capture, quotes, onboarding, or purchase intent." }) }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: flows.map((flow) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx("h2", { className: "truncate text-base font-semibold text-waify-text dark:text-waify-dark-text", children: flow.name }),
            /* @__PURE__ */ jsx(Badge, { variant: statusVariant(flow.status), children: flow.status }),
            flow.category && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: flow.category })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Connection: ",
              flow.connection?.name || "Unknown"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Meta Flow ID: ",
              flow.meta_flow_id || "Local draft"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Data endpoint: ",
              flow.data_channel_uri || "Not configured"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Last sync: ",
              flow.last_synced_at ? new Date(flow.last_synced_at).toLocaleString() : "Never"
            ] })
          ] }),
          flow.last_meta_error && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex gap-2 rounded-md border border-red-100 bg-red-50 p-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 flex-shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: flow.last_meta_error })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => action(flow, "publish"), disabled: !flow.meta_flow_id || flow.status === "published", children: [
            /* @__PURE__ */ jsx(Rocket, { className: "h-4 w-4" }),
            "Publish"
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => action(flow, "deprecate"), disabled: !flow.meta_flow_id || flow.status === "deprecated", children: [
            /* @__PURE__ */ jsx(Archive, { className: "h-4 w-4" }),
            "Deprecate"
          ] })
        ] })
      ] }) }) }, flow.id)) })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: drawerOpen,
        onClose: () => setDrawerOpen(false),
        title: "Create Meta Flow",
        description: "Create the Flow shell in Meta, optionally upload Flow JSON, then publish when validation passes.",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setDrawerOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: submit, disabled: form.processing || !form.data.name || !form.data.whatsapp_connection_id, children: form.processing ? "Creating..." : "Create Flow" })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Connection" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: form.data.whatsapp_connection_id,
                onChange: (event) => form.setData("whatsapp_connection_id", Number(event.target.value)),
                className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-slate-800",
                children: connections.map((connection) => /* @__PURE__ */ jsx("option", { value: connection.id, children: connection.name }, connection.id))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Name" }),
            /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: (event) => form.setData("name", event.target.value), className: "w-full" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Category" }),
            /* @__PURE__ */ jsx(TextInput, { value: form.data.category, onChange: (event) => form.setData("category", event.target.value), className: "w-full" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Data endpoint URL" }),
            /* @__PURE__ */ jsx(TextInput, { value: form.data.data_channel_uri, onChange: (event) => form.setData("data_channel_uri", event.target.value), className: "w-full", placeholder: "https://example.com/whatsapp/flow-data" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Flow JSON" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: form.data.flow_json,
                onChange: (event) => form.setData("flow_json", event.target.value),
                rows: 10,
                className: "w-full resize-y rounded-btn border border-waify-border bg-white px-3 py-2 font-mono text-xs dark:border-waify-dark-border dark:bg-slate-800",
                placeholder: '{"version":"7.1","screens":[]}'
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
export {
  WhatsAppFlowsIndex as default
};
