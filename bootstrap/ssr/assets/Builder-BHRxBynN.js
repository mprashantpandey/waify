import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { T as ThemedIconTile, M as Modal } from "./Elements-EbyZDnT_.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import { ArrowLeft, Workflow, Play, Bot, ChevronDown, ChevronUp } from "lucide-react";
import FlowBuilder from "./FlowBuilder-CapnCuRh.js";
import { NodeConfigFields } from "./Index-bSwKteBT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
import "reactflow";
import "./vendor-BWyHebfG.js";
import "./EmptyState-DZrNEInH.js";
import "./InputError-DiSBWiye.js";
function actionLabel(actionType) {
  return String(actionType || "send_text").replace(/_/g, " ");
}
function ChatbotBuilder({
  bot,
  automationOptions = { agents: [], tags: [], templates: [], lists: [] }
}) {
  const confirm = useConfirm();
  const initialFlowId = Number(new URLSearchParams(window.location.search).get("flow") || bot.flows?.[0]?.id || 0) || null;
  const [activeFlowId, setActiveFlowId] = useState(initialFlowId);
  const [nodeEditor, setNodeEditor] = useState(null);
  const [edgeEditor, setEdgeEditor] = useState(null);
  const [testMessage, setTestMessage] = useState("pricing");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  const [triggerSource, setTriggerSource] = useState("any");
  const [ctwaSourceIds, setCtwaSourceIds] = useState("");
  const [testPanelOpen, setTestPanelOpen] = useState(false);
  useEffect(() => {
    if (!bot.flows.some((flow) => flow.id === activeFlowId)) {
      setActiveFlowId(bot.flows?.[0]?.id ?? null);
    }
  }, [bot.flows, activeFlowId]);
  const activeFlow = bot.flows?.length ? bot.flows.find((flow) => flow.id === activeFlowId) ?? bot.flows[0] : null;
  useEffect(() => {
    setCooldownMinutes(Number(activeFlow?.trigger?.cooldown_minutes ?? 0));
    setTriggerSource(String(activeFlow?.trigger?.source ?? "any"));
    setCtwaSourceIds(Array.isArray(activeFlow?.trigger?.ctwa_source_ids) ? activeFlow.trigger.ctwa_source_ids.join(", ") : "");
  }, [activeFlow?.id, activeFlow?.trigger?.cooldown_minutes, activeFlow?.trigger?.source, activeFlow?.trigger?.ctwa_source_ids]);
  const selectFlow = (flowId) => {
    setActiveFlowId(flowId);
    router.get(route("app.chatbots.builder", { bot: bot.id, flow: flowId }), {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const defaultNodeConfig = (type = "action") => {
    if (type === "condition") return { type: "text_contains", value: "help", case_sensitive: false };
    if (type === "delay") return { seconds: 60 };
    if (type === "webhook") return { url: "https://example.com/webhook", method: "POST" };
    if (type === "send_buttons") return { action_type: "send_buttons", header_text: "Zyptos", body_text: "Choose the next step.", buttons: [{ id: "pricing", text: "Pricing" }, { id: "payment", text: "Payment" }, { id: "ai", text: "AI agent" }] };
    if (type === "send_template") return { action_type: "send_template", template_id: automationOptions.templates[0]?.id || "" };
    if (type === "send_media") return { action_type: "send_media", media_type: "image", media_url: "https://zyptos.com/demo/zyptos-overview.png", caption: "Zyptos feature overview" };
    if (type === "send_list") return { action_type: "send_list", list_id: automationOptions.lists[0]?.id || "" };
    if (type === "assign_agent") return { action_type: "assign_agent", agent_id: automationOptions.agents[0]?.id || "" };
    if (type === "add_tag") return { action_type: "add_tag", tag_id: automationOptions.tags[0]?.id || "", tag_name: "" };
    if (type === "update_contact") return { action_type: "update_contact", status: "active", source: "automation" };
    if (type === "create_deal") return { action_type: "create_deal", title: "WhatsApp lead", stage: "new", value: 0, currency: "INR", source: "automation" };
    if (type === "create_appointment") return { action_type: "create_appointment", title: "Zyptos demo call", minutes_from_now: 60, duration_minutes: 30, type: "Demo", reminder_enabled: true, reminder_minutes_before: 30 };
    if (type === "sync_integration") return { action_type: "sync_integration", provider: "meta-leads" };
    if (type === "handoff") return { action_type: "handoff", priority: "high", status: "open", reason: "Needs human help", agent_id: automationOptions.agents[0]?.id || "" };
    if (type === "send_payment_link") return { action_type: "send_payment_link", create_razorpay_link: true, payment_url: "", amount: 0, currency: "INR", message: "Please complete your payment here: {{payment_url}}" };
    if (type === "ai_agent_reply") return { action_type: "ai_agent_reply", agent_id: automationOptions.ai_agents?.[0]?.id || "", agent_role: automationOptions.ai_agents?.[0]?.role || "sales", instruction: "Reply as the best Zyptos sales/support AI agent and move the customer to the next step.", max_chars: 1500 };
    return { action_type: "send_text", message: "Thanks for messaging us. A team member will reply shortly." };
  };
  const addNode = (type = "action") => {
    if (!activeFlow) return;
    const nodeType = ["condition", "delay", "webhook"].includes(type) ? type : "action";
    router.post(route("app.chatbots.nodes.store", { flow: activeFlow.id }), {
      type: nodeType,
      config: defaultNodeConfig(type),
      sort_order: activeFlow.nodes.length + 1,
      pos_x: 320 + activeFlow.nodes.length * 60,
      pos_y: 160 + activeFlow.nodes.length * 40
    }, {
      preserveScroll: true,
      only: ["bot", "flash", "errors"]
    });
  };
  const saveGraph = (payload) => {
    if (!activeFlow) return;
    router.patch(route("app.chatbots.flows.update", { flow: activeFlow.id }), {
      nodes: payload.nodes,
      edges: payload.edges
    }, {
      preserveScroll: true,
      only: ["bot", "flash", "errors"]
    });
  };
  const saveSafety = () => {
    if (!activeFlow) return;
    router.patch(route("app.chatbots.flows.update", { flow: activeFlow.id }), {
      trigger: {
        ...activeFlow.trigger || {},
        cooldown_minutes: Math.max(0, Number(cooldownMinutes) || 0),
        source: triggerSource,
        ctwa_source_ids: ctwaSourceIds.split(",").map((item) => item.trim()).filter(Boolean)
      }
    }, {
      preserveScroll: true,
      only: ["bot", "flash", "errors"]
    });
  };
  const deleteNode = async (nodeId) => {
    const confirmed = await confirm({
      title: "Delete node?",
      message: "This node will be removed from the automation flow.",
      confirmText: "Delete node",
      cancelText: "Cancel",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("app.chatbots.nodes.destroy", { node: nodeId }), {
      preserveScroll: true,
      only: ["bot", "flash", "errors"]
    });
  };
  const setNodeConfig = (key, value) => {
    setNodeEditor((current) => current ? { ...current, config: { ...current.config, [key]: value } } : current);
  };
  const saveNodeConfig = () => {
    if (!nodeEditor) return;
    const nodeType = ["condition", "delay", "webhook"].includes(nodeEditor.type) ? nodeEditor.type : "action";
    router.patch(route("app.chatbots.nodes.update", { node: nodeEditor.node.id }), {
      type: nodeType,
      config: nodeEditor.config
    }, {
      preserveScroll: true,
      only: ["bot", "flash", "errors"],
      onSuccess: () => setNodeEditor(null)
    });
  };
  const saveEdgeLabel = () => {
    if (!edgeEditor) return;
    router.patch(route("app.chatbots.edges.update", { edge: edgeEditor.edge.id }), {
      label: edgeEditor.label
    }, {
      preserveScroll: true,
      only: ["bot", "flash", "errors"],
      onSuccess: () => setEdgeEditor(null)
    });
  };
  const runTest = () => {
    router.post(route("app.chatbots.test", { bot: bot.id }), {}, {
      preserveScroll: true,
      only: ["bot", "flash", "errors"]
    });
  };
  const simulate = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.content || "";
      const response = await fetch(route("app.chatbots.simulate", { bot: bot.id }), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": token
        },
        body: JSON.stringify({
          message: testMessage,
          flow_id: activeFlow?.id
        })
      });
      setTestResult(await response.json());
    } finally {
      setTesting(false);
    }
  };
  return /* @__PURE__ */ jsxs(AppShell, { fullscreen: true, children: [
    /* @__PURE__ */ jsx(Head, { title: `${bot.name} builder` }),
    /* @__PURE__ */ jsxs("div", { className: "flex h-[100dvh] min-h-0 flex-col bg-waify-bg dark:bg-waify-dark-bg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.index", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", "aria-label": "Back to automations", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(Workflow, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-waify-green-dark dark:text-emerald-300", children: "Visual journey builder" }),
            /* @__PURE__ */ jsx("h1", { className: "truncate text-base font-bold text-waify-text dark:text-waify-dark-text", children: bot.name })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: runTest, children: [
          /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
          "Run test"
        ] })
      ] }),
      bot.flows.length > 1 && /* @__PURE__ */ jsx("div", { className: "waify-scrollbar flex h-12 shrink-0 gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-2 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: bot.flows.map((flow) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => selectFlow(flow.id),
          className: `inline-flex h-8 shrink-0 items-center gap-2 rounded-btn px-3 text-xs font-semibold transition ${activeFlow?.id === flow.id ? "bg-waify-green text-white" : "bg-gray-100 text-waify-text-muted hover:text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: `h-2 w-2 rounded-full ${flow.enabled ? "bg-current" : "bg-gray-400"}` }),
            flow.name
          ]
        },
        flow.id
      )) }),
      /* @__PURE__ */ jsxs("div", { className: nodeEditor ? "grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_360px]" : "min-h-0 flex-1", children: [
        activeFlow ? /* @__PURE__ */ jsx(
          FlowBuilder,
          {
            flow: activeFlow,
            onAddNode: addNode,
            onEditNode: (node) => setNodeEditor({ node, type: node.type, config: { ...node.config || {} } }),
            onDeleteNode: deleteNode,
            onSelectEdge: (edge) => setEdgeEditor({ edge, label: edge.label || "next" }),
            onSaveGraph: saveGraph,
            fullPage: true
          }
        ) : /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex h-full min-h-[520px] flex-col items-center justify-center text-center", children: [
          /* @__PURE__ */ jsx(Bot, { className: "mb-3 h-8 w-8 text-waify-text-muted" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "No flow selected" })
        ] }) }),
        nodeEditor && /* @__PURE__ */ jsxs("aside", { className: "fixed inset-x-0 bottom-0 z-40 max-h-[78dvh] min-h-0 overflow-y-auto border-t border-gray-100 bg-white p-4 shadow-2xl dark:border-waify-dark-border dark:bg-waify-dark-surface lg:static lg:block lg:max-h-none lg:border-l lg:border-t-0 lg:shadow-none", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-waify-green-dark dark:text-emerald-300", children: "Node inspector" }),
              /* @__PURE__ */ jsx("h2", { className: "mt-1 text-base font-semibold text-waify-text dark:text-waify-dark-text", children: nodeEditor.type === "action" ? actionLabel(nodeEditor.config?.action_type) : nodeEditor.type })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setNodeEditor(null), children: "Close" })
          ] }),
          /* @__PURE__ */ jsx(NodeConfigFields, { editor: nodeEditor, options: automationOptions, onChange: setNodeConfig }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setNodeEditor(null), children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { type: "button", onClick: saveNodeConfig, children: "Save node" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "shrink-0 border-t border-gray-100 bg-white dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 px-4 py-2 xl:flex-row xl:items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              TextInput,
              {
                className: "h-9",
                value: testMessage,
                onChange: (event) => setTestMessage(event.target.value),
                placeholder: "Simulate an inbound message, e.g. pricing"
              }
            ),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: simulate, disabled: testing, className: "shrink-0", children: testing ? "Testing..." : "Simulate" })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setTestPanelOpen((open) => !open),
              className: "inline-flex h-9 items-center justify-center gap-2 rounded-btn border border-gray-200 px-3 text-xs font-semibold text-waify-text-muted transition hover:text-waify-text dark:border-waify-dark-border dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text",
              children: [
                "Trigger settings",
                testPanelOpen ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
              ]
            }
          ),
          testResult && /* @__PURE__ */ jsxs("div", { className: "min-w-0 rounded-btn bg-gray-50 px-3 py-2 text-xs text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted xl:w-[260px]", children: [
            (testResult.trace || []).length,
            " flow trace",
            (testResult.trace || []).length === 1 ? "" : "s"
          ] })
        ] }),
        testPanelOpen && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 border-t border-gray-100 px-4 py-3 dark:border-waify-dark-border xl:grid-cols-[150px_190px_minmax(220px,1fr)_auto_minmax(300px,1.4fr)] xl:items-start", children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            "Cooldown minutes",
            /* @__PURE__ */ jsx(TextInput, { className: "mt-1 h-9", type: "number", min: "0", value: cooldownMinutes, onChange: (event) => setCooldownMinutes(Number(event.target.value)) })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            "Source",
            /* @__PURE__ */ jsxs("select", { className: "mt-1 h-9 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", value: triggerSource, onChange: (event) => setTriggerSource(event.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "any", children: "Any source" }),
              /* @__PURE__ */ jsx("option", { value: "ctwa", children: "Click-to-WhatsApp ad" }),
              /* @__PURE__ */ jsx("option", { value: "webhook", children: "Organic WhatsApp" }),
              /* @__PURE__ */ jsx("option", { value: "meta_lead", children: "Meta lead" }),
              /* @__PURE__ */ jsx("option", { value: "manual", children: "Manual" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            "CTWA ad/post IDs",
            /* @__PURE__ */ jsx(TextInput, { className: "mt-1 h-9", value: ctwaSourceIds, onChange: (event) => setCtwaSourceIds(event.target.value), placeholder: "optional, comma separated" })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: saveSafety, disabled: !activeFlow, className: "mt-5", children: "Save trigger" }),
          /* @__PURE__ */ jsx("div", { className: "max-h-28 overflow-y-auto rounded-btn bg-gray-50 p-3 text-xs text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: !testResult ? "Simulation trace will appear here." : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: (testResult.trace || []).map((flow) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: flow.matched ? "font-semibold text-waify-green-dark dark:text-emerald-300" : "font-semibold", children: [
              flow.flow_name,
              ": ",
              flow.matched ? "matched" : "skipped"
            ] }),
            (flow.steps || []).map((step, index) => /* @__PURE__ */ jsxs("div", { className: "pl-3", children: [
              index + 1,
              ". ",
              step.label,
              " - ",
              step.detail
            ] }, `${flow.flow_id}-${index}`))
          ] }, flow.flow_id)) }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open: Boolean(edgeEditor),
        onClose: () => setEdgeEditor(null),
        title: "Edit branch label",
        description: "Name this connection so the flow is easier to scan.",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setEdgeEditor(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: saveEdgeLabel, children: "Save label" })
        ] }),
        children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Label" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: edgeEditor?.label || "",
              onChange: (event) => setEdgeEditor((current) => current ? { ...current, label: event.target.value } : current),
              placeholder: "next"
            }
          )
        ]
      }
    )
  ] });
}
export {
  ChatbotBuilder as default
};
