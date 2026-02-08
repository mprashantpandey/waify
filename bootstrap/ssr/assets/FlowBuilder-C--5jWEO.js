import { jsxs, jsx } from "react/jsx-runtime";
import { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, { applyNodeChanges, applyEdgeChanges, addEdge, MiniMap, Controls, Background } from "reactflow";
import "./vendor-BWyHebfG.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { Plus, Pencil, Trash2 } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function FlowBuilder({
  flow,
  onEditNode,
  onAddNode,
  onDeleteNode,
  onSelectEdge,
  onSaveGraph
}) {
  const initialNodes = useMemo(() => {
    return (flow.nodes || []).map((node) => ({
      id: String(node.id),
      position: {
        x: node.pos_x ?? node.sort_order * 180,
        y: node.pos_y ?? 120
      },
      data: {
        label: `${node.type}${node.config?.is_start ? " (start)" : ""}`,
        meta: node
      },
      style: {
        borderRadius: 12,
        border: "1px solid #E2E8F0",
        padding: 12,
        background: "#fff",
        minWidth: 140
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
      style: { stroke: "#6366F1" }
    }));
  }, [flow.edges]);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
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
          style: { stroke: "#6366F1" }
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
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Flow Graph" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Drag nodes and connect them to create branches. Click “Save Graph” to persist." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", className: "rounded-xl", onClick: onAddNode, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Node"
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", onClick: handleSaveGraph, children: "Save Graph" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-[420px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white", children: /* @__PURE__ */ jsxs(
      ReactFlow,
      {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        fitView: true,
        children: [
          /* @__PURE__ */ jsx(MiniMap, {}),
          /* @__PURE__ */ jsx(Controls, {}),
          /* @__PURE__ */ jsx(Background, { gap: 16, size: 1 })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: (flow.nodes || []).map((node) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: node.type }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
              "Order: ",
              node.sort_order
            ] }),
            (node.config?.is_start ?? false) && /* @__PURE__ */ jsx(Badge, { variant: "info", className: "mt-2", children: "Start" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "rounded-lg", onClick: () => onEditNode(node), children: [
              /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4 mr-1" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "rounded-lg", onClick: () => onDeleteNode(node.id), children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-1" }),
              "Delete"
            ] })
          ] })
        ]
      },
      node.id
    )) })
  ] });
}
export {
  FlowBuilder as default
};
