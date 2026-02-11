import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { ArrowLeft, Bot, Trash2, Save, Workflow, Plus, Settings, Zap, Pencil, Link as Link$1 } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./useConfirm-BKf7Nv1N.js";
import { C as Checkbox } from "./Checkbox-Bd8bJ3HH.js";
import FlowBuilder from "./FlowBuilder-C--5jWEO.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "reactflow";
import "./vendor-BWyHebfG.js";
const defaultFlowForm = {
  name: "",
  enabled: true,
  priority: 100,
  triggerType: "inbound_message",
  triggerConnections: [],
  firstMessageOnly: false,
  skipIfAssigned: false,
  keywords: "",
  matchType: "any",
  caseSensitive: false,
  wholeWord: false,
  buttonId: ""
};
const defaultNodeForm = {
  type: "action",
  sortOrder: "",
  isStart: false,
  conditionType: "text_contains",
  conditionValue: "",
  conditionCaseSensitive: false,
  regexPattern: "",
  timeWindowTimezone: "UTC",
  timeWindowStart: "09:00",
  timeWindowEnd: "17:00",
  timeWindowDays: [1, 2, 3, 4, 5],
  conditionConnectionIds: [],
  conditionStatus: "open",
  conditionTagId: "",
  conditionTagName: "",
  actionType: "send_text",
  actionMessage: "",
  actionTemplateId: "",
  actionTemplateVariables: "{}",
  actionListId: "",
  actionButtonsJson: "[]",
  actionButtonBodyText: "",
  actionButtonHeaderText: "",
  actionButtonFooterText: "",
  actionAgentId: "",
  actionTagId: "",
  actionTagName: "",
  actionStatus: "open",
  actionPriority: "normal",
  delaySeconds: 60,
  webhookUrl: "",
  webhookMethod: "POST",
  webhookTimeout: 10
};
function ChatbotsShow({
  account,
  bot,
  connections,
  templates,
  tags,
  agents
}) {
  const { toast } = useToast();
  const { data, setData, patch, processing, errors } = useForm({
    name: bot.name,
    description: bot.description || "",
    status: bot.status,
    applies_to: bot.applies_to
  });
  const [flowFormOpen, setFlowFormOpen] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState(null);
  const [flowForm, setFlowForm] = useState({ ...defaultFlowForm });
  const [nodeFormOpen, setNodeFormOpen] = useState(false);
  const [nodeFormFlowId, setNodeFormFlowId] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [nodeForm, setNodeForm] = useState({ ...defaultNodeForm });
  const [edgeFormOpen, setEdgeFormOpen] = useState(false);
  const [edgeFlowId, setEdgeFlowId] = useState(null);
  const [edgeForm, setEdgeForm] = useState({
    id: null,
    fromNodeId: "",
    toNodeId: "",
    label: "next",
    sortOrder: ""
  });
  const flowById = useMemo(() => {
    return new Map(bot.flows.map((flow) => [flow.id, flow]));
  }, [bot.flows]);
  const saveGraph = (flowId, payload) => {
    const flow = flowById.get(flowId);
    if (!flow) {
      return;
    }
    const nextEdges = payload.edges.map((edge, index) => ({
      from_node_id: edge.from_node_id,
      to_node_id: edge.to_node_id,
      label: edge.label ?? "next",
      sort_order: edge.sort_order ?? index + 1
    }));
    router.patch(
      route("app.chatbots.flows.update", { flow: flowId }),
      {
        nodes: payload.nodes.map((node, index) => ({
          id: node.id,
          type: node.type,
          config: node.config,
          sort_order: node.sort_order ?? index + 1,
          pos_x: node.pos_x ?? null,
          pos_y: node.pos_y ?? null
        })),
        edges: nextEdges
      },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Graph saved"),
        onError: () => toast.error("Failed to save graph")
      }
    );
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    patch(route("app.chatbots.update", { bot: bot.id }), {
      onSuccess: () => {
        toast.success("Bot updated successfully");
      },
      onError: () => {
        toast.error("Failed to update bot");
      }
    });
  };
  const deleteBot = () => {
    if (!confirm(`Delete bot "${bot.name}"? This will also delete flows and execution logs.`)) {
      return;
    }
    router.post(route("app.chatbots.destroy.post", { bot: bot.id }), { _method: "delete" }, {
      onSuccess: () => toast.success("Bot deleted"),
      onError: () => toast.error("Failed to delete bot")
    });
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      paused: { variant: "warning", label: "Paused" },
      draft: { variant: "default", label: "Draft" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, className: "px-3 py-1", children: config.label });
  };
  const toggleConnection = (connectionId) => {
    const ids = data.applies_to.connection_ids || [];
    if (ids.includes(connectionId)) {
      setData("applies_to", {
        ...data.applies_to,
        connection_ids: ids.filter((id) => id !== connectionId)
      });
    } else {
      setData("applies_to", {
        ...data.applies_to,
        connection_ids: [...ids, connectionId]
      });
    }
  };
  const resetFlowForm = () => {
    setFlowForm({ ...defaultFlowForm });
    setEditingFlowId(null);
    setFlowFormOpen(false);
  };
  const openEditFlow = (flow) => {
    const trigger = flow.trigger || {};
    const triggerType = trigger.type || "inbound_message";
    setEditingFlowId(flow.id);
    setFlowFormOpen(true);
    setFlowForm({
      name: flow.name,
      enabled: flow.enabled,
      priority: flow.priority,
      triggerType,
      triggerConnections: trigger.connection_ids || [],
      firstMessageOnly: !!trigger.first_message_only,
      skipIfAssigned: !!trigger.skip_if_assigned,
      keywords: Array.isArray(trigger.keywords) ? trigger.keywords.join(", ") : "",
      matchType: trigger.match_type || "any",
      caseSensitive: !!trigger.case_sensitive,
      wholeWord: !!trigger.whole_word,
      buttonId: trigger.button_id || ""
    });
  };
  const buildTrigger = () => {
    if (flowForm.triggerType === "keyword") {
      const keywords = flowForm.keywords.split(",").map((value) => value.trim()).filter((value) => value.length > 0);
      return {
        type: "keyword",
        keywords,
        match_type: flowForm.matchType,
        case_sensitive: flowForm.caseSensitive,
        whole_word: flowForm.wholeWord
      };
    }
    if (flowForm.triggerType === "button_reply") {
      return {
        type: "button_reply",
        button_id: flowForm.buttonId
      };
    }
    return {
      type: "inbound_message",
      connection_ids: flowForm.triggerConnections,
      first_message_only: flowForm.firstMessageOnly,
      skip_if_assigned: flowForm.skipIfAssigned
    };
  };
  const submitFlow = (e) => {
    e.preventDefault();
    const payload = {
      name: flowForm.name,
      enabled: flowForm.enabled,
      priority: flowForm.priority,
      trigger: buildTrigger()
    };
    if (editingFlowId) {
      router.patch(route("app.chatbots.flows.update", { flow: editingFlowId }), payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Flow updated successfully");
          resetFlowForm();
        },
        onError: () => {
          toast.error("Failed to update flow");
        }
      });
    } else {
      router.post(route("app.chatbots.flows.store", { bot: bot.id }), payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Flow created successfully");
          resetFlowForm();
        },
        onError: () => {
          toast.error("Failed to create flow");
        }
      });
    }
  };
  const deleteFlow = (flowId) => {
    if (!confirm("Delete this flow?")) {
      return;
    }
    router.delete(route("app.chatbots.flows.destroy", { flow: flowId }), {
      preserveScroll: true,
      onSuccess: () => toast.success("Flow deleted"),
      onError: () => toast.error("Failed to delete flow")
    });
  };
  const openNodeForm = (flowId) => {
    setNodeFormFlowId(flowId);
    setEditingNodeId(null);
    setNodeForm({ ...defaultNodeForm });
    setNodeFormOpen(true);
  };
  const openEditNode = (flowId, node) => {
    const config = node.config || {};
    setNodeFormFlowId(flowId);
    setEditingNodeId(node.id);
    setNodeFormOpen(true);
    setNodeForm({
      ...defaultNodeForm,
      type: node.type || "action",
      sortOrder: node.sort_order,
      isStart: config.is_start ?? false,
      conditionType: config.type || "text_contains",
      conditionValue: config.value || "",
      conditionCaseSensitive: !!config.case_sensitive,
      regexPattern: config.pattern || "",
      timeWindowTimezone: config.timezone || "UTC",
      timeWindowStart: config.start_time || "09:00",
      timeWindowEnd: config.end_time || "17:00",
      timeWindowDays: config.days || [1, 2, 3, 4, 5],
      conditionConnectionIds: config.connection_ids || [],
      conditionStatus: config.status || "open",
      conditionTagId: config.tag_ids?.[0] || "",
      conditionTagName: config.tags?.[0] || config.tag_names?.[0] || "",
      actionType: config.action_type || "send_text",
      actionMessage: config.message || "",
      actionTemplateId: config.template_id || "",
      actionTemplateVariables: config.variables ? JSON.stringify(config.variables, null, 2) : "{}",
      actionListId: config.list_id || "",
      actionButtonsJson: config.buttons ? JSON.stringify(config.buttons, null, 2) : "[]",
      actionButtonBodyText: config.body_text || config.message || "",
      actionButtonHeaderText: config.header_text || "",
      actionButtonFooterText: config.footer_text || "",
      actionAgentId: config.agent_id || "",
      actionTagId: config.tag_id || "",
      actionTagName: config.tag || config.tag_name || "",
      actionStatus: config.status || "open",
      actionPriority: config.priority || "normal",
      delaySeconds: config.seconds || 60,
      webhookUrl: config.url || "",
      webhookMethod: (config.method || "POST").toUpperCase(),
      webhookTimeout: config.timeout || 10
    });
  };
  const closeNodeForm = () => {
    setNodeFormOpen(false);
    setNodeFormFlowId(null);
    setEditingNodeId(null);
    setNodeForm({ ...defaultNodeForm });
  };
  const buildNodeConfig = () => {
    if (nodeForm.type === "condition") {
      const base = {
        type: nodeForm.conditionType
      };
      if (["text_contains", "text_equals", "text_starts_with"].includes(nodeForm.conditionType)) {
        base.value = nodeForm.conditionValue;
        base.case_sensitive = nodeForm.conditionCaseSensitive;
      }
      if (nodeForm.conditionType === "regex_match") {
        base.pattern = nodeForm.regexPattern;
      }
      if (nodeForm.conditionType === "time_window") {
        base.timezone = nodeForm.timeWindowTimezone;
        base.start_time = nodeForm.timeWindowStart;
        base.end_time = nodeForm.timeWindowEnd;
        base.days = nodeForm.timeWindowDays;
      }
      if (nodeForm.conditionType === "connection_is") {
        base.connection_ids = nodeForm.conditionConnectionIds;
      }
      if (nodeForm.conditionType === "conversation_status") {
        base.status = nodeForm.conditionStatus;
      }
      if (nodeForm.conditionType === "tags_contains") {
        if (nodeForm.conditionTagId) {
          base.tag_ids = [nodeForm.conditionTagId];
        } else if (nodeForm.conditionTagName) {
          base.tag_names = [nodeForm.conditionTagName];
        }
      }
      if (nodeForm.isStart) {
        base.is_start = true;
      }
      return base;
    }
    if (nodeForm.type === "delay") {
      const config = { seconds: Number(nodeForm.delaySeconds) || 1 };
      if (nodeForm.isStart) {
        config.is_start = true;
      }
      return config;
    }
    if (nodeForm.type === "webhook") {
      const config = {
        url: nodeForm.webhookUrl,
        method: nodeForm.webhookMethod,
        timeout: Number(nodeForm.webhookTimeout) || 10
      };
      if (nodeForm.isStart) {
        config.is_start = true;
      }
      return config;
    }
    const actionConfig = {
      action_type: nodeForm.actionType
    };
    if (nodeForm.actionType === "send_text") {
      actionConfig.message = nodeForm.actionMessage;
    }
    if (nodeForm.actionType === "send_template") {
      actionConfig.template_id = nodeForm.actionTemplateId;
      if (nodeForm.actionTemplateVariables) {
        try {
          actionConfig.variables = JSON.parse(nodeForm.actionTemplateVariables);
        } catch (error) {
          toast.error("Template variables must be valid JSON");
          throw error;
        }
      }
    }
    if (nodeForm.actionType === "send_list") {
      actionConfig.list_id = Number(nodeForm.actionListId);
    }
    if (nodeForm.actionType === "send_buttons") {
      actionConfig.body_text = nodeForm.actionButtonBodyText;
      actionConfig.header_text = nodeForm.actionButtonHeaderText || null;
      actionConfig.footer_text = nodeForm.actionButtonFooterText || null;
      try {
        actionConfig.buttons = JSON.parse(nodeForm.actionButtonsJson || "[]");
      } catch (error) {
        toast.error("Buttons must be valid JSON");
        throw error;
      }
    }
    if (nodeForm.actionType === "assign_agent") {
      actionConfig.agent_id = nodeForm.actionAgentId;
    }
    if (nodeForm.actionType === "add_tag") {
      if (nodeForm.actionTagId) {
        actionConfig.tag_id = nodeForm.actionTagId;
      }
      if (nodeForm.actionTagName) {
        actionConfig.tag = nodeForm.actionTagName;
      }
    }
    if (nodeForm.actionType === "set_status") {
      actionConfig.status = nodeForm.actionStatus;
    }
    if (nodeForm.actionType === "set_priority") {
      actionConfig.priority = nodeForm.actionPriority;
    }
    if (nodeForm.isStart) {
      actionConfig.is_start = true;
    }
    return actionConfig;
  };
  const submitNode = (e) => {
    e.preventDefault();
    if (!nodeFormFlowId) {
      return;
    }
    let config;
    try {
      config = buildNodeConfig();
    } catch (error) {
      return;
    }
    const payload = {
      type: nodeForm.type,
      config,
      sort_order: nodeForm.sortOrder === "" ? void 0 : nodeForm.sortOrder
    };
    if (editingNodeId) {
      router.patch(route("app.chatbots.nodes.update", { node: editingNodeId }), payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Node updated successfully");
          closeNodeForm();
        },
        onError: () => toast.error("Failed to update node")
      });
    } else {
      router.post(route("app.chatbots.nodes.store", { flow: nodeFormFlowId }), payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Node added successfully");
          closeNodeForm();
        },
        onError: () => toast.error("Failed to add node")
      });
    }
  };
  const deleteNode = (nodeId) => {
    if (!confirm("Delete this node?")) {
      return;
    }
    router.delete(route("app.chatbots.nodes.destroy", { node: nodeId }), {
      preserveScroll: true,
      onSuccess: () => toast.success("Node deleted"),
      onError: () => toast.error("Failed to delete node")
    });
  };
  const openEdgeForm = (flowId, edge) => {
    const flow = flowById.get(flowId);
    const nodes = flow?.nodes || [];
    setEdgeFlowId(flowId);
    setEdgeFormOpen(true);
    setEdgeForm({
      id: edge?.id ?? null,
      fromNodeId: edge?.from_node_id ?? nodes[0]?.id ?? "",
      toNodeId: edge?.to_node_id ?? nodes[1]?.id ?? "",
      label: edge?.label ?? "next",
      sortOrder: edge?.sort_order ?? ""
    });
  };
  const closeEdgeForm = () => {
    setEdgeFormOpen(false);
    setEdgeFlowId(null);
    setEdgeForm({ id: null, fromNodeId: "", toNodeId: "", label: "next", sortOrder: "" });
  };
  const saveEdge = () => {
    if (!edgeFlowId) {
      return;
    }
    const flow = flowById.get(edgeFlowId);
    if (!flow) {
      return;
    }
    const updatedEdges = [...flow.edges || []];
    const existingIndex = updatedEdges.findIndex((edge) => edge.id === edgeForm.id);
    const edgePayload = {
      id: edgeForm.id ?? Date.now(),
      from_node_id: edgeForm.fromNodeId,
      to_node_id: edgeForm.toNodeId,
      label: edgeForm.label || "next",
      sort_order: edgeForm.sortOrder === "" ? void 0 : edgeForm.sortOrder
    };
    if (existingIndex >= 0) {
      updatedEdges[existingIndex] = edgePayload;
    } else {
      updatedEdges.push(edgePayload);
    }
    router.patch(
      route("app.chatbots.flows.update", { flow: edgeFlowId }),
      {
        edges: updatedEdges.map((edge, index) => ({
          from_node_id: edge.from_node_id,
          to_node_id: edge.to_node_id,
          label: edge.label,
          sort_order: edge.sort_order ?? index + 1
        }))
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Edge saved");
          closeEdgeForm();
        },
        onError: () => toast.error("Failed to save edge")
      }
    );
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${bot.name} - Chatbot` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.chatbots.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Chatbots"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsx(Bot, { className: "h-8 w-8 text-purple-600 dark:text-purple-400" }),
              bot.name
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: bot.description || "No description" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            getStatusBadge(bot.status),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "danger",
                className: "rounded-xl",
                onClick: deleteBot,
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                  "Delete Bot"
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        data.status === "active" && (bot.health?.runnable_flows_count ?? 0) === 0 && /* @__PURE__ */ jsx(Card, { className: "border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 shadow-none", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-amber-800 dark:text-amber-100", children: "This bot is active but has no runnable flow." }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-amber-700 dark:text-amber-200 mt-1", children: "Add an enabled flow with at least one executable node (`action`, `delay`, or `webhook`)." })
        ] }) }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-purple-500 rounded-xl", children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Bot Settings" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Update your chatbot configuration" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Bot Name", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  type: "text",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "mt-1 rounded-xl",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "description", value: "Description", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "description",
                  value: data.description,
                  onChange: (e) => setData("description", e.target.value),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  rows: 3,
                  placeholder: "Describe what this bot does..."
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.description, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "status", value: "Status", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "status",
                  value: data.status,
                  onChange: (e) => setData("status", e.target.value),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                    /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.status, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Applies To", className: "text-sm font-semibold mb-3" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      checked: data.applies_to.all_connections,
                      onChange: (e) => setData("applies_to", {
                        ...data.applies_to,
                        all_connections: e.target.checked
                      })
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "All connections" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: "Apply this bot to all WhatsApp connections" })
                  ] })
                ] }) }),
                !data.applies_to.all_connections && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: connections.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl", children: "No connections available" }) : connections.map((connection) => /* @__PURE__ */ jsxs(
                  "label",
                  {
                    className: "flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(
                        Checkbox,
                        {
                          checked: data.applies_to.connection_ids?.includes(connection.id),
                          onChange: () => toggleConnection(connection.id)
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: connection.name })
                    ]
                  },
                  connection.id
                )) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                disabled: processing,
                className: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl",
                children: processing ? "Saving..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
                  "Save Changes"
                ] })
              }
            ) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl", children: /* @__PURE__ */ jsx(Workflow, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Flows" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Define when and how the bot responds" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "secondary",
              size: "sm",
              className: "rounded-xl",
              onClick: () => {
                setFlowFormOpen(!flowFormOpen);
                if (!flowFormOpen) {
                  setEditingFlowId(null);
                  setFlowForm({ ...defaultFlowForm });
                }
              },
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
                flowFormOpen ? "Close" : "Add Flow"
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-6", children: [
          flowFormOpen && /* @__PURE__ */ jsxs("form", { onSubmit: submitFlow, className: "space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300", children: [
              /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
              editingFlowId ? "Edit Flow" : "Create Flow"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Flow Name", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: flowForm.name,
                  onChange: (e) => setFlowForm({ ...flowForm, name: e.target.value }),
                  className: "mt-1 rounded-xl",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "Priority", className: "text-sm font-semibold mb-2" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "number",
                    value: flowForm.priority,
                    onChange: (e) => setFlowForm({ ...flowForm, priority: Number(e.target.value) }),
                    className: "mt-1 rounded-xl"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-7", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: flowForm.enabled,
                    onChange: (e) => setFlowForm({ ...flowForm, enabled: e.target.checked })
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Enabled" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Trigger Type", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: flowForm.triggerType,
                  onChange: (e) => setFlowForm({ ...flowForm, triggerType: e.target.value }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "inbound_message", children: "Inbound message" }),
                    /* @__PURE__ */ jsx("option", { value: "keyword", children: "Keyword match" }),
                    /* @__PURE__ */ jsx("option", { value: "button_reply", children: "Button reply" })
                  ]
                }
              )
            ] }),
            flowForm.triggerType === "inbound_message" && /* @__PURE__ */ jsxs("div", { className: "space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: flowForm.firstMessageOnly,
                    onChange: (e) => setFlowForm({ ...flowForm, firstMessageOnly: e.target.checked })
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Only first inbound message" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: flowForm.skipIfAssigned,
                    onChange: (e) => setFlowForm({ ...flowForm, skipIfAssigned: e.target.checked })
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Skip if already assigned" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "Connections (optional)", className: "text-sm font-semibold mb-2" }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  connections.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "No connections available" }),
                  connections.map((connection) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300", children: [
                    /* @__PURE__ */ jsx(
                      Checkbox,
                      {
                        checked: flowForm.triggerConnections.includes(connection.id),
                        onChange: (e) => {
                          const ids = flowForm.triggerConnections.includes(connection.id) ? flowForm.triggerConnections.filter((id) => id !== connection.id) : [...flowForm.triggerConnections, connection.id];
                          setFlowForm({ ...flowForm, triggerConnections: ids });
                        }
                      }
                    ),
                    connection.name
                  ] }, connection.id))
                ] })
              ] })
            ] }),
            flowForm.triggerType === "keyword" && /* @__PURE__ */ jsxs("div", { className: "space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "Keywords (comma separated)", className: "text-sm font-semibold mb-2" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: flowForm.keywords,
                    onChange: (e) => setFlowForm({ ...flowForm, keywords: e.target.value }),
                    className: "mt-1 rounded-xl",
                    placeholder: "pricing, demo, help"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { value: "Match Type", className: "text-sm font-semibold mb-2" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: flowForm.matchType,
                      onChange: (e) => setFlowForm({ ...flowForm, matchType: e.target.value }),
                      className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "any", children: "Any keyword" }),
                        /* @__PURE__ */ jsx("option", { value: "all", children: "All keywords" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-7", children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      checked: flowForm.caseSensitive,
                      onChange: (e) => setFlowForm({ ...flowForm, caseSensitive: e.target.checked })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Case sensitive" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      checked: flowForm.wholeWord,
                      onChange: (e) => setFlowForm({ ...flowForm, wholeWord: e.target.checked })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Whole word match" })
                ] })
              ] })
            ] }),
            flowForm.triggerType === "button_reply" && /* @__PURE__ */ jsxs("div", { className: "space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Button Reply ID", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: flowForm.buttonId,
                  onChange: (e) => setFlowForm({ ...flowForm, buttonId: e.target.value }),
                  className: "mt-1 rounded-xl",
                  placeholder: "button_1"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(Button, { type: "submit", className: "rounded-xl", children: editingFlowId ? "Update Flow" : "Create Flow" }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", className: "rounded-xl", onClick: resetFlowForm, children: "Cancel" })
            ] })
          ] }),
          bot.flows.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
            /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4", children: /* @__PURE__ */ jsx(Zap, { className: "h-8 w-8 text-gray-400" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "No flows yet" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-4", children: "Add a flow to define when and how the bot responds to messages." })
          ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: bot.flows.map((flow) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: flow.name }),
                      /* @__PURE__ */ jsx(Badge, { variant: flow.enabled ? "success" : "default", className: "px-2 py-1 text-xs", children: flow.enabled ? "Enabled" : "Disabled" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      "Trigger: ",
                      flow.trigger?.type || "inbound_message",
                      " • Priority: ",
                      flow.priority
                    ] }),
                    flow.enabled && flow.health && !flow.health.is_runnable && /* @__PURE__ */ jsx("div", { className: "text-xs text-amber-600 dark:text-amber-300 mt-1", children: "Not runnable: add at least one executable node." })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        variant: "secondary",
                        size: "sm",
                        className: "rounded-xl",
                        onClick: () => openEditFlow(flow),
                        children: [
                          /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4 mr-1" }),
                          "Edit"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        variant: "secondary",
                        size: "sm",
                        className: "rounded-xl",
                        onClick: () => openNodeForm(flow.id),
                        children: [
                          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                          "Add Node"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        variant: "secondary",
                        size: "sm",
                        className: "rounded-xl",
                        onClick: () => openEdgeForm(flow.id),
                        children: [
                          /* @__PURE__ */ jsx(Link$1, { className: "h-4 w-4 mr-1" }),
                          "Add Edge"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        variant: "danger",
                        size: "sm",
                        className: "rounded-xl",
                        onClick: () => deleteFlow(flow.id),
                        children: [
                          /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-1" }),
                          "Delete"
                        ]
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-2", children: /* @__PURE__ */ jsx(
                  FlowBuilder,
                  {
                    flow,
                    onEditNode: (node) => openEditNode(flow.id, node),
                    onAddNode: () => openNodeForm(flow.id),
                    onDeleteNode: (nodeId) => deleteNode(nodeId),
                    onSelectEdge: (edge) => openEdgeForm(flow.id, edge),
                    onSaveGraph: (payload) => saveGraph(flow.id, payload)
                  }
                ) })
              ]
            },
            flow.id
          )) })
        ] })
      ] }),
      nodeFormOpen && nodeFormFlowId && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(Link$1, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: editingNodeId ? "Edit Node" : "Add Node" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Configure bot behavior step" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submitNode, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Node Type", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: nodeForm.type,
                  onChange: (e) => setNodeForm({ ...nodeForm, type: e.target.value }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "action", children: "Action" }),
                    /* @__PURE__ */ jsx("option", { value: "condition", children: "Condition" }),
                    /* @__PURE__ */ jsx("option", { value: "delay", children: "Delay" }),
                    /* @__PURE__ */ jsx("option", { value: "webhook", children: "Webhook" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Sort Order", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  type: "number",
                  value: nodeForm.sortOrder,
                  onChange: (e) => setNodeForm({
                    ...nodeForm,
                    sortOrder: e.target.value === "" ? "" : Number(e.target.value)
                  }),
                  className: "mt-1 rounded-xl"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: nodeForm.isStart,
                onChange: (e) => setNodeForm({ ...nodeForm, isStart: e.target.checked })
              }
            ),
            "Mark as start node"
          ] }),
          nodeForm.type === "condition" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4", children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Condition Type", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: nodeForm.conditionType,
                onChange: (e) => setNodeForm({ ...nodeForm, conditionType: e.target.value }),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "text_contains", children: "Text contains" }),
                  /* @__PURE__ */ jsx("option", { value: "text_equals", children: "Text equals" }),
                  /* @__PURE__ */ jsx("option", { value: "text_starts_with", children: "Text starts with" }),
                  /* @__PURE__ */ jsx("option", { value: "regex_match", children: "Regex match" }),
                  /* @__PURE__ */ jsx("option", { value: "time_window", children: "Time window" }),
                  /* @__PURE__ */ jsx("option", { value: "connection_is", children: "Connection is" }),
                  /* @__PURE__ */ jsx("option", { value: "conversation_status", children: "Conversation status" }),
                  /* @__PURE__ */ jsx("option", { value: "tags_contains", children: "Contact has tag" })
                ]
              }
            ),
            ["text_contains", "text_equals", "text_starts_with"].includes(nodeForm.conditionType) && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: nodeForm.conditionValue,
                  onChange: (e) => setNodeForm({ ...nodeForm, conditionValue: e.target.value }),
                  className: "mt-1 rounded-xl",
                  placeholder: "Enter value"
                }
              ),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: nodeForm.conditionCaseSensitive,
                    onChange: (e) => setNodeForm({ ...nodeForm, conditionCaseSensitive: e.target.checked })
                  }
                ),
                "Case sensitive"
              ] })
            ] }),
            nodeForm.conditionType === "regex_match" && /* @__PURE__ */ jsx(
              TextInput,
              {
                value: nodeForm.regexPattern,
                onChange: (e) => setNodeForm({ ...nodeForm, regexPattern: e.target.value }),
                className: "mt-1 rounded-xl",
                placeholder: "/pattern/"
              }
            ),
            nodeForm.conditionType === "time_window" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: nodeForm.timeWindowTimezone,
                    onChange: (e) => setNodeForm({ ...nodeForm, timeWindowTimezone: e.target.value }),
                    className: "mt-1 rounded-xl",
                    placeholder: "Timezone (e.g. UTC)"
                  }
                ),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: nodeForm.timeWindowStart,
                    onChange: (e) => setNodeForm({ ...nodeForm, timeWindowStart: e.target.value }),
                    className: "mt-1 rounded-xl",
                    placeholder: "Start (HH:MM)"
                  }
                ),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: nodeForm.timeWindowEnd,
                    onChange: (e) => setNodeForm({ ...nodeForm, timeWindowEnd: e.target.value }),
                    className: "mt-1 rounded-xl",
                    placeholder: "End (HH:MM)"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 text-sm text-gray-700 dark:text-gray-300", children: [
                { label: "Sun", value: 0 },
                { label: "Mon", value: 1 },
                { label: "Tue", value: 2 },
                { label: "Wed", value: 3 },
                { label: "Thu", value: 4 },
                { label: "Fri", value: 5 },
                { label: "Sat", value: 6 }
              ].map((day) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: nodeForm.timeWindowDays.includes(day.value),
                    onChange: () => {
                      const days = nodeForm.timeWindowDays.includes(day.value) ? nodeForm.timeWindowDays.filter((d) => d !== day.value) : [...nodeForm.timeWindowDays, day.value];
                      setNodeForm({ ...nodeForm, timeWindowDays: days });
                    }
                  }
                ),
                day.label
              ] }, day.value)) })
            ] }),
            nodeForm.conditionType === "connection_is" && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: connections.map((connection) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300", children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  checked: nodeForm.conditionConnectionIds.includes(connection.id),
                  onChange: (e) => {
                    const ids = nodeForm.conditionConnectionIds.includes(connection.id) ? nodeForm.conditionConnectionIds.filter((id) => id !== connection.id) : [...nodeForm.conditionConnectionIds, connection.id];
                    setNodeForm({ ...nodeForm, conditionConnectionIds: ids });
                  }
                }
              ),
              connection.name
            ] }, connection.id)) }),
            nodeForm.conditionType === "conversation_status" && /* @__PURE__ */ jsxs(
              "select",
              {
                value: nodeForm.conditionStatus,
                onChange: (e) => setNodeForm({ ...nodeForm, conditionStatus: e.target.value }),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
                ]
              }
            ),
            nodeForm.conditionType === "tags_contains" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: nodeForm.conditionTagId,
                  onChange: (e) => setNodeForm({ ...nodeForm, conditionTagId: e.target.value ? Number(e.target.value) : "" }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Select tag" }),
                    tags.map((tag) => /* @__PURE__ */ jsx("option", { value: tag.id, children: tag.name }, tag.id))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: nodeForm.conditionTagName,
                  onChange: (e) => setNodeForm({ ...nodeForm, conditionTagName: e.target.value }),
                  className: "mt-1 rounded-xl",
                  placeholder: "Or type tag name"
                }
              )
            ] })
          ] }),
          nodeForm.type === "action" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4", children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Action Type", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: nodeForm.actionType,
                onChange: (e) => setNodeForm({ ...nodeForm, actionType: e.target.value }),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "send_text", children: "Send text" }),
                  /* @__PURE__ */ jsx("option", { value: "send_template", children: "Send template" }),
                  /* @__PURE__ */ jsx("option", { value: "send_buttons", children: "Send buttons" }),
                  /* @__PURE__ */ jsx("option", { value: "send_list", children: "Send list" }),
                  /* @__PURE__ */ jsx("option", { value: "assign_agent", children: "Assign agent" }),
                  /* @__PURE__ */ jsx("option", { value: "add_tag", children: "Add tag" }),
                  /* @__PURE__ */ jsx("option", { value: "set_status", children: "Set status" }),
                  /* @__PURE__ */ jsx("option", { value: "set_priority", children: "Set priority" })
                ]
              }
            ),
            nodeForm.actionType === "send_text" && /* @__PURE__ */ jsx(
              "textarea",
              {
                value: nodeForm.actionMessage,
                onChange: (e) => setNodeForm({ ...nodeForm, actionMessage: e.target.value }),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                rows: 3,
                placeholder: "Message text"
              }
            ),
            nodeForm.actionType === "send_template" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: nodeForm.actionTemplateId,
                  onChange: (e) => setNodeForm({ ...nodeForm, actionTemplateId: e.target.value ? Number(e.target.value) : "" }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Select template" }),
                    templates.map((template) => /* @__PURE__ */ jsxs("option", { value: template.id, children: [
                      template.name,
                      " (",
                      template.language,
                      ")"
                    ] }, template.id))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: nodeForm.actionTemplateVariables,
                  onChange: (e) => setNodeForm({ ...nodeForm, actionTemplateVariables: e.target.value }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  rows: 3,
                  placeholder: '{"1": "value"}'
                }
              )
            ] }),
            nodeForm.actionType === "send_buttons" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: nodeForm.actionButtonBodyText,
                  onChange: (e) => setNodeForm({ ...nodeForm, actionButtonBodyText: e.target.value }),
                  className: "mt-1 rounded-xl",
                  placeholder: "Body text"
                }
              ),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: nodeForm.actionButtonHeaderText,
                  onChange: (e) => setNodeForm({ ...nodeForm, actionButtonHeaderText: e.target.value }),
                  className: "mt-1 rounded-xl",
                  placeholder: "Header text (optional)"
                }
              ),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: nodeForm.actionButtonFooterText,
                  onChange: (e) => setNodeForm({ ...nodeForm, actionButtonFooterText: e.target.value }),
                  className: "mt-1 rounded-xl",
                  placeholder: "Footer text (optional)"
                }
              ),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: nodeForm.actionButtonsJson,
                  onChange: (e) => setNodeForm({ ...nodeForm, actionButtonsJson: e.target.value }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  rows: 3,
                  placeholder: '[{"id":"btn_1","text":"Option 1"},{"id":"btn_2","text":"Option 2"}]'
                }
              )
            ] }),
            nodeForm.actionType === "send_list" && /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "number",
                value: nodeForm.actionListId,
                onChange: (e) => setNodeForm({ ...nodeForm, actionListId: e.target.value ? Number(e.target.value) : "" }),
                className: "mt-1 rounded-xl",
                placeholder: "WhatsApp list ID"
              }
            ),
            nodeForm.actionType === "assign_agent" && /* @__PURE__ */ jsxs(
              "select",
              {
                value: nodeForm.actionAgentId,
                onChange: (e) => setNodeForm({ ...nodeForm, actionAgentId: e.target.value ? Number(e.target.value) : "" }),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Select agent" }),
                  agents.map((agent) => /* @__PURE__ */ jsxs("option", { value: agent.id, children: [
                    agent.name,
                    " (",
                    agent.role,
                    ")"
                  ] }, agent.id))
                ]
              }
            ),
            nodeForm.actionType === "add_tag" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: nodeForm.actionTagId,
                  onChange: (e) => setNodeForm({ ...nodeForm, actionTagId: e.target.value ? Number(e.target.value) : "" }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Select tag" }),
                    tags.map((tag) => /* @__PURE__ */ jsx("option", { value: tag.id, children: tag.name }, tag.id))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: nodeForm.actionTagName,
                  onChange: (e) => setNodeForm({ ...nodeForm, actionTagName: e.target.value }),
                  className: "mt-1 rounded-xl",
                  placeholder: "Or type tag name"
                }
              )
            ] }),
            nodeForm.actionType === "set_status" && /* @__PURE__ */ jsxs(
              "select",
              {
                value: nodeForm.actionStatus,
                onChange: (e) => setNodeForm({ ...nodeForm, actionStatus: e.target.value }),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
                ]
              }
            ),
            nodeForm.actionType === "set_priority" && /* @__PURE__ */ jsxs(
              "select",
              {
                value: nodeForm.actionPriority,
                onChange: (e) => setNodeForm({ ...nodeForm, actionPriority: e.target.value }),
                className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "low", children: "Low" }),
                  /* @__PURE__ */ jsx("option", { value: "normal", children: "Normal" }),
                  /* @__PURE__ */ jsx("option", { value: "high", children: "High" }),
                  /* @__PURE__ */ jsx("option", { value: "urgent", children: "Urgent" })
                ]
              }
            )
          ] }),
          nodeForm.type === "delay" && /* @__PURE__ */ jsx(
            TextInput,
            {
              type: "number",
              value: nodeForm.delaySeconds,
              onChange: (e) => setNodeForm({ ...nodeForm, delaySeconds: Number(e.target.value) }),
              className: "mt-1 rounded-xl",
              placeholder: "Delay seconds"
            }
          ),
          nodeForm.type === "webhook" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(
              TextInput,
              {
                value: nodeForm.webhookUrl,
                onChange: (e) => setNodeForm({ ...nodeForm, webhookUrl: e.target.value }),
                className: "mt-1 rounded-xl",
                placeholder: "https://example.com/hook"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: nodeForm.webhookMethod,
                  onChange: (e) => setNodeForm({ ...nodeForm, webhookMethod: e.target.value }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "POST", children: "POST" }),
                    /* @__PURE__ */ jsx("option", { value: "GET", children: "GET" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  type: "number",
                  value: nodeForm.webhookTimeout,
                  onChange: (e) => setNodeForm({ ...nodeForm, webhookTimeout: Number(e.target.value) }),
                  className: "mt-1 rounded-xl",
                  placeholder: "Timeout (seconds)"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Button, { type: "submit", className: "rounded-xl", children: editingNodeId ? "Update Node" : "Add Node" }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", className: "rounded-xl", onClick: closeNodeForm, children: "Cancel" })
          ] })
        ] }) })
      ] }),
      edgeFormOpen && edgeFlowId && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl", children: /* @__PURE__ */ jsx(Link$1, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: edgeForm.id ? "Edit Edge" : "Add Edge" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Connect nodes to define branching" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "From Node", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: edgeForm.fromNodeId,
                  onChange: (e) => setEdgeForm({ ...edgeForm, fromNodeId: Number(e.target.value) }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: (flowById.get(edgeFlowId)?.nodes || []).map((node) => /* @__PURE__ */ jsxs("option", { value: node.id, children: [
                    "Node #",
                    node.id,
                    " (",
                    node.type,
                    ")"
                  ] }, node.id))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "To Node", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: edgeForm.toNodeId,
                  onChange: (e) => setEdgeForm({ ...edgeForm, toNodeId: Number(e.target.value) }),
                  className: "mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: (flowById.get(edgeFlowId)?.nodes || []).map((node) => /* @__PURE__ */ jsxs("option", { value: node.id, children: [
                    "Node #",
                    node.id,
                    " (",
                    node.type,
                    ")"
                  ] }, node.id))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Label", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: edgeForm.label,
                  onChange: (e) => setEdgeForm({ ...edgeForm, label: e.target.value }),
                  className: "mt-1 rounded-xl",
                  placeholder: "true / false / next"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Sort Order", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  type: "number",
                  value: edgeForm.sortOrder,
                  onChange: (e) => setEdgeForm({
                    ...edgeForm,
                    sortOrder: e.target.value === "" ? "" : Number(e.target.value)
                  }),
                  className: "mt-1 rounded-xl"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Button, { className: "rounded-xl", onClick: saveEdge, children: "Save Edge" }),
            /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "rounded-xl", onClick: closeEdgeForm, children: "Cancel" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ChatbotsShow as default
};
