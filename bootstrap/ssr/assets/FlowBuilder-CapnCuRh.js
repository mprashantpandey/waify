import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, { applyNodeChanges, applyEdgeChanges, addEdge, MiniMap, Controls } from "reactflow";
import "./vendor-BWyHebfG.js";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { T as ThemedIconTile } from "./Elements-EbyZDnT_.js";
import { Send, ListChecks, Bot, Image, ClipboardList, Tag, Users, UserCog, UserCheck, Handshake, Workflow, CalendarPlus, BadgeIndianRupee, Sparkles, GitBranch, Clock, DatabaseZap, Webhook, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Plus, Save, Search, MousePointer2, Trash2 } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
const nodeTypesMeta = [
  { type: "action", label: "Text reply", category: "Messages", icon: Send, tone: "green", description: "Send a plain WhatsApp reply" },
  { type: "send_buttons", label: "Buttons", category: "Messages", icon: ListChecks, tone: "blue", description: "Show up to 3 WhatsApp quick replies" },
  { type: "send_template", label: "Template", category: "Messages", icon: Bot, tone: "purple", description: "Send an approved template" },
  { type: "send_media", label: "Media", category: "Messages", icon: Image, tone: "blue", description: "Send an image, document, video, or audio link" },
  { type: "send_flow", label: "Form flow", category: "Messages", icon: ClipboardList, tone: "green", description: "Send a WhatsApp Flow form" },
  { type: "add_tag", label: "Add tag", category: "CRM", icon: Tag, tone: "blue", description: "Tag the contact for segmentation" },
  { type: "add_segment", label: "Add segment", category: "CRM", icon: Users, tone: "blue", description: "Place contact into a lead segment" },
  { type: "update_contact", label: "Update contact", category: "CRM", icon: UserCog, tone: "amber", description: "Set contact fields or source" },
  { type: "assign_agent", label: "Assign agent", category: "CRM", icon: UserCheck, tone: "pink", description: "Route conversation to a team member" },
  { type: "handoff", label: "Handoff", category: "CRM", icon: Handshake, tone: "red", description: "Mark for human follow-up" },
  { type: "create_deal", label: "Create deal", category: "CRM", icon: Workflow, tone: "green", description: "Open a sales opportunity" },
  { type: "create_appointment", label: "Appointment", category: "CRM", icon: CalendarPlus, tone: "green", description: "Create a demo or service appointment" },
  { type: "send_payment_link", label: "Payment link", category: "Commerce", icon: BadgeIndianRupee, tone: "amber", description: "Send a checkout or payment URL" },
  { type: "ai_agent_reply", label: "AI agent", category: "AI", icon: Sparkles, tone: "purple", description: "Let a workspace AI agent reply" },
  { type: "condition", label: "Condition", category: "Logic", icon: GitBranch, tone: "blue", description: "Branch by message, tag, status, or time" },
  { type: "delay", label: "Delay", category: "Logic", icon: Clock, tone: "amber", description: "Wait before moving to the next step" },
  { type: "sync_integration", label: "Sync integration", category: "Integrations", icon: DatabaseZap, tone: "purple", description: "Run Meta Leads, Sheets, Calendar, or commerce sync" },
  { type: "webhook", label: "Webhook", category: "Integrations", icon: Webhook, tone: "purple", description: "Call an external endpoint" }
];
const nodeMetaFor = (type, actionType) => nodeTypesMeta.find((item) => item.type === (type === "action" ? actionType : type)) || nodeTypesMeta[0];
function describeNode(node) {
  const config = node.config || {};
  if (node.type === "condition") {
    return String(config.type || "condition").replace(/_/g, " ");
  }
  if (node.type === "delay") {
    return `${Number(config.seconds || 0)} seconds`;
  }
  if (node.type === "webhook") {
    return config.url || "Webhook request";
  }
  if (config.action_type === "send_text") {
    return config.message || "Send text";
  }
  if (config.action_type === "send_template") {
    return "Send approved template";
  }
  if (config.action_type === "send_buttons") {
    return config.body_text || "Send quick reply buttons";
  }
  if (config.action_type === "add_tag") {
    return config.tag_name || `Tag #${config.tag_id || ""}` || "Add tag";
  }
  if (config.action_type === "add_segment") {
    return config.segment_name || `Segment #${config.segment_id || ""}` || "Add segment";
  }
  if (config.action_type === "send_flow") {
    return config.body_text || config.meta_flow_id || "Send WhatsApp form flow";
  }
  if (config.action_type === "assign_agent") {
    return config.agent_id ? `Assign agent #${config.agent_id}` : "Assign agent";
  }
  if (config.action_type === "handoff") {
    return config.reason || "Human handoff";
  }
  if (config.action_type === "create_deal") {
    return config.title || "Create deal";
  }
  if (config.action_type === "create_appointment") {
    return config.title || "Create appointment";
  }
  if (config.action_type === "sync_integration") {
    return `Sync ${String(config.provider || "integration").replace(/-/g, " ")}`;
  }
  if (config.action_type === "send_payment_link") {
    return "Send payment link";
  }
  return String(config.action_type || "action").replace(/_/g, " ");
}
function FlowBuilder({
  flow,
  onEditNode,
  onAddNode,
  onDeleteNode,
  onSelectEdge,
  onSaveGraph,
  fullPage = false
}) {
  const initialNodes = useMemo(() => {
    return (flow.nodes || []).map((node) => ({
      id: String(node.id),
      position: {
        x: node.pos_x ?? node.sort_order * 180,
        y: node.pos_y ?? 120
      },
      data: {
        label: nodeMetaFor(node.type, node.config?.action_type).label,
        meta: node
      },
      style: {
        borderRadius: 14,
        border: "1px solid rgba(148, 163, 184, 0.38)",
        padding: 0,
        background: "transparent",
        minWidth: 248,
        boxShadow: "none"
      }
    }));
  }, [flow.nodes]);
  const initialEdges = useMemo(() => {
    return (flow.edges || []).map((edge) => ({
      id: String(edge.id),
      source: String(edge.from_node_id),
      target: String(edge.to_node_id),
      label: edge.label || "next",
      animated: edge.label === "true" || edge.label === "false",
      style: { stroke: "#10B981", strokeWidth: 2 },
      labelStyle: { fill: "#D1D5DB", fontSize: 10, fontWeight: 700 },
      labelBgStyle: { fill: "#111827", fillOpacity: 0.92 },
      labelBgPadding: [5, 3],
      labelBgBorderRadius: 6
    }));
  }, [flow.edges]);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteCategory, setPaletteCategory] = useState("All");
  const [paletteOpen, setPaletteOpen] = useState(() => !fullPage);
  const [summaryOpen, setSummaryOpen] = useState(false);
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges]);
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);
  const onConnect = useCallback((connection) => {
    setEdges(
      (eds) => addEdge(
        {
          ...connection,
          id: `temp-${Date.now()}`,
          label: "next",
          style: { stroke: "#10B981", strokeWidth: 2 },
          labelStyle: { fill: "#D1D5DB", fontSize: 10, fontWeight: 700 },
          labelBgStyle: { fill: "#111827", fillOpacity: 0.92 },
          labelBgPadding: [5, 3],
          labelBgBorderRadius: 6
        },
        eds
      )
    );
  }, []);
  const handleSaveGraph = () => {
    const nodePayload = nodes.map((node, index) => {
      const meta = node.data?.meta;
      return {
        ...meta,
        sort_order: meta?.sort_order ?? index + 1,
        pos_x: Math.round(node.position.x),
        pos_y: Math.round(node.position.y)
      };
    });
    const edgePayload = edges.map((edge, index) => ({
      id: edge.id && !Number.isNaN(Number(edge.id)) ? Number(edge.id) : 0,
      from_node_id: Number(edge.source),
      to_node_id: Number(edge.target),
      label: edge.label || "next",
      sort_order: index + 1
    }));
    onSaveGraph({ nodes: nodePayload, edges: edgePayload });
  };
  const paletteCategories = useMemo(() => ["All", ...Array.from(new Set(nodeTypesMeta.map((item) => item.category)))], []);
  const paletteItems = useMemo(() => {
    const query = paletteQuery.trim().toLowerCase();
    return nodeTypesMeta.filter((item) => {
      const matchesCategory = paletteCategory === "All" || item.category === paletteCategory;
      const matchesQuery = query === "" || item.label.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [paletteCategory, paletteQuery]);
  const visualNodes = nodes.map((node) => {
    const meta = node.data?.meta;
    const nodeMeta = nodeMetaFor(meta?.type || "action", meta?.config?.action_type);
    const Icon = nodeMeta.icon;
    return {
      ...node,
      data: {
        ...node.data,
        label: /* @__PURE__ */ jsx("div", { className: "w-[248px] rounded-card border border-slate-300 bg-white p-3 shadow-card ring-1 ring-white/60 dark:border-slate-600/80 dark:bg-waify-dark-surface dark:ring-white/5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: nodeMeta.tone, size: "sm", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: nodeMeta.label }),
              meta?.config?.is_start && /* @__PURE__ */ jsx(Badge, { variant: "info", className: "px-1.5 py-0 text-[10px]", children: "Start" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: describeNode(meta) })
          ] })
        ] }) })
      }
    };
  });
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "overflow-hidden bg-white dark:bg-waify-dark-surface",
    fullPage ? "flex h-full min-h-0 flex-col rounded-none border-0 shadow-none" : "rounded-card border border-gray-100 shadow-card dark:border-waify-dark-border"
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: cn(
      "shrink-0 flex flex-col gap-3 border-b border-gray-100 dark:border-waify-dark-border lg:flex-row lg:items-center lg:justify-between",
      fullPage ? "px-4 py-2" : "p-4"
    ), children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          /* @__PURE__ */ jsx(Workflow, { className: "h-3.5 w-3.5" }),
          "Journey builder"
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "mt-1 truncate text-base font-semibold text-waify-text dark:text-waify-dark-text", children: flow.name }),
        !fullPage && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Add steps, connect branches, then save the journey." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 sm:flex", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setPaletteOpen((open) => !open), className: "hidden sm:inline-flex", children: [
          paletteOpen ? /* @__PURE__ */ jsx(PanelLeftClose, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(PanelLeftOpen, { className: "h-4 w-4" }),
          "Add steps"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setSummaryOpen((open) => !open), className: "hidden sm:inline-flex", children: [
          summaryOpen ? /* @__PURE__ */ jsx(PanelRightClose, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(PanelRightOpen, { className: "h-4 w-4" }),
          "Map"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => onAddNode("action"), className: "w-full sm:w-auto", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "Add step"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handleSaveGraph, className: "w-full sm:w-auto", children: [
          /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
          "Save journey"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cn(
      "grid",
      fullPage ? cn("min-h-0 flex-1", paletteOpen && summaryOpen && "lg:grid-cols-[240px_minmax(0,1fr)_260px]", paletteOpen && !summaryOpen && "lg:grid-cols-[240px_minmax(0,1fr)_44px]", !paletteOpen && summaryOpen && "lg:grid-cols-[44px_minmax(0,1fr)_260px]", !paletteOpen && !summaryOpen && "lg:grid-cols-[44px_minmax(0,1fr)_44px]") : "min-h-[560px] lg:grid-cols-[260px_minmax(0,1fr)_280px]"
    ), children: [
      /* @__PURE__ */ jsx("aside", { className: cn(
        "border-b border-gray-100 bg-gray-50/70 dark:border-waify-dark-border dark:bg-slate-950 lg:border-b-0 lg:border-r",
        paletteOpen ? "p-3" : "p-2",
        fullPage && "hidden min-h-0 overflow-y-auto lg:block"
      ), children: !paletteOpen ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setPaletteOpen(true),
          className: "flex h-9 w-full items-center justify-center rounded-btn border border-gray-200 bg-white text-waify-text-muted transition hover:text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text-muted",
          "aria-label": "Open node palette",
          children: /* @__PURE__ */ jsx(PanelLeftOpen, { className: "h-4 w-4" })
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-2 px-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Add step" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setPaletteOpen(false),
              className: "rounded-md p-1 text-waify-text-muted hover:bg-white hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface dark:hover:text-waify-dark-text",
              "aria-label": "Collapse node palette",
              children: /* @__PURE__ */ jsx(PanelLeftClose, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: paletteQuery,
                onChange: (event) => setPaletteQuery(event.target.value),
                placeholder: "Search steps",
                className: "h-8 w-full rounded-btn border border-gray-200 bg-white pl-8 pr-3 text-xs text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto pb-1 waify-scrollbar", children: paletteCategories.map((category) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setPaletteCategory(category),
              className: cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition",
                paletteCategory === category ? "bg-waify-green text-white" : "bg-white text-waify-text-muted hover:text-waify-text dark:bg-waify-dark-surface dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"
              ),
              children: category
            },
            category
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          paletteItems.map((item) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => onAddNode(item.type),
              className: "flex w-full items-center gap-2 rounded-btn border border-gray-200 bg-white p-2 text-left transition hover:border-waify-green hover:shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:hover:border-emerald-400/60",
              children: [
                /* @__PURE__ */ jsx(ThemedIconTile, { tone: item.tone, size: "sm", children: /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("span", { className: "block truncate text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: item.label }),
                  /* @__PURE__ */ jsx("span", { className: "mt-0.5 block truncate text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: item.description })
                ] })
              ]
            },
            item.type
          )),
          paletteItems.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-btn border border-dashed border-gray-200 bg-white p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text-muted", children: "No steps match this filter." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-btn border border-gray-200 bg-white p-2 text-[11px] leading-relaxed text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text-muted", children: [
          /* @__PURE__ */ jsx(MousePointer2, { className: "mb-1.5 h-4 w-4 text-waify-green" }),
          "Double-click a step to edit. Drag handles to connect."
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: cn("flow-canvas min-w-0 bg-slate-50 dark:bg-[#0B1220]", fullPage ? "h-full min-h-0" : "h-[560px]"), children: /* @__PURE__ */ jsxs(
        ReactFlow,
        {
          nodes: visualNodes,
          edges,
          onNodesChange,
          onEdgesChange,
          onConnect,
          onNodeDoubleClick: (_, node) => onEditNode(node.data.meta),
          onEdgeDoubleClick: (_, edge) => {
            const match = flow.edges.find((item) => String(item.id) === String(edge.id));
            if (match) onSelectEdge(match);
          },
          fitView: visualNodes.length <= 12,
          defaultViewport: { x: 48, y: 80, zoom: 0.82 },
          minZoom: 0.35,
          maxZoom: 1.45,
          children: [
            /* @__PURE__ */ jsx(
              MiniMap,
              {
                className: "hidden !h-24 !w-36 overflow-hidden rounded-btn border border-gray-200 !bg-white/90 shadow-card dark:border-waify-dark-border dark:!bg-waify-dark-surface/90 2xl:block",
                nodeStrokeColor: "#10B981",
                nodeColor: "#ECFDF5",
                maskColor: "rgba(15, 23, 42, 0.08)"
              }
            ),
            /* @__PURE__ */ jsx(Controls, {})
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("aside", { className: cn(
        "border-t border-gray-100 dark:border-waify-dark-border lg:border-l lg:border-t-0",
        summaryOpen ? "p-3" : "p-2",
        fullPage && "hidden min-h-0 overflow-y-auto lg:block"
      ), children: !summaryOpen ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setSummaryOpen(true),
          className: "flex h-9 w-full items-center justify-center rounded-btn border border-gray-200 text-waify-text-muted transition hover:text-waify-text dark:border-waify-dark-border dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text",
          "aria-label": "Open flow summary",
          children: /* @__PURE__ */ jsx(PanelRightOpen, { className: "h-4 w-4" })
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Journey map" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setSummaryOpen(false),
              className: "rounded-md p-1 text-waify-text-muted hover:bg-gray-50 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text",
              "aria-label": "Collapse flow summary",
              children: /* @__PURE__ */ jsx(PanelRightClose, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-2.5 dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: "Steps" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: flow.nodes.length })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-2.5 dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: "Links" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: flow.edges.length })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1.5", children: [
          (flow.nodes || []).map((node) => {
            const meta = nodeMetaFor(node.type, node.config?.action_type);
            const Icon = meta.icon;
            return /* @__PURE__ */ jsx("div", { className: "rounded-btn border border-gray-100 p-2.5 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(ThemedIconTile, { tone: meta.tone, size: "sm", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: meta.label }),
                /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: describeNode(node) })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onEditNode(node), className: "rounded-md px-2 py-1 text-xs font-semibold text-waify-green-dark hover:bg-waify-green-soft dark:text-emerald-300 dark:hover:bg-emerald-500/10", children: "Edit" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onDeleteNode(node.id), className: "rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] }) }, node.id);
          }),
          flow.nodes.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-btn border border-dashed border-gray-200 p-4 text-center text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "Add the first step to make this journey runnable." })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  FlowBuilder as default
};
