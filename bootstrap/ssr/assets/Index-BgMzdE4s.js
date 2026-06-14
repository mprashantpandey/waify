import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useMemo } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import axios from "axios";
import { ChevronDown, Plus, BarChart3, ClipboardList, Sparkles, Settings2, Bot, UserRoundCog, Trash2, AlertTriangle, CheckCircle2, Save } from "lucide-react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-BtIXZ0GS.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import { S as Switch } from "./Switch-D6_sQewh.js";
import { S as StatusBadge, T as ThemedIconTile, D as Drawer } from "./Elements-EbyZDnT_.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./BrandingWrapper-CZn0jBQL.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "clsx";
import "tailwind-merge";
import "@headlessui/react";
const SelectContext = React.createContext(void 0);
const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  return /* @__PURE__ */ jsx(SelectContext.Provider, { value: { value, onValueChange, open, setOpen }, children: /* @__PURE__ */ jsx("div", { className: "relative", children }) });
};
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref,
      type: "button",
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        context.setOpen(!context.open);
      },
      className: cn(
        "flex h-10 w-full items-center justify-between rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text shadow-sm",
        "ring-offset-white focus:outline-none focus:ring-2 focus:ring-waify-green/20 focus:ring-offset-0 focus:border-waify-green",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-offset-waify-dark-bg dark:focus:ring-waify-green/30",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(ChevronDown, { className: cn(
          "h-4 w-4 text-gray-500 transition-transform duration-200",
          context.open && "rotate-180"
        ) })
      ]
    }
  );
});
SelectTrigger.displayName = "SelectTrigger";
const SelectValue = ({ placeholder, children }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");
  if (children) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  return /* @__PURE__ */ jsx("span", { children: context.value || placeholder || "Select..." });
};
const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref && "current" in ref && ref.current && !ref.current.contains(event.target)) {
        context.setOpen(false);
      }
    };
    if (context.open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [context.open, ref]);
  if (!context.open) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-card border border-gray-100 bg-white py-1 text-sm text-waify-text shadow-pop",
        "dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
        className
      ),
      ...props,
      children
    }
  );
});
SelectContent.displayName = "SelectContent";
const SelectItem = React.forwardRef(
  ({ className, value, children, onClick, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) throw new Error("SelectItem must be used within Select");
    const isSelected = context.value === value;
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          context.onValueChange(value);
          context.setOpen(false);
          onClick?.(e);
        },
        className: cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-gray-100 focus:bg-gray-100",
          "dark:hover:bg-waify-dark-surface-2 dark:focus:bg-waify-dark-surface-2",
          isSelected && "bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-100",
          className
        ),
        ...props,
        children
      }
    );
  }
);
SelectItem.displayName = "SelectItem";
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text shadow-sm ring-offset-white placeholder:text-gray-400 focus-visible:border-waify-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waify-green/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-offset-waify-dark-bg dark:placeholder:text-waify-dark-text-muted dark:focus-visible:ring-waify-green/30",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.keys(value).filter((key) => key.trim().length > 0);
  }
  return [];
};
const featureLabels = {
  conversation_suggest: "Conversation reply suggestions",
  support_reply: "Support assistant"
};
const roleLabels = {
  support: "Support",
  sales: "Sales",
  sales_support: "Sales + Support",
  operations: "Operations",
  custom: "Custom"
};
const toneLabels = {
  professional: "Professional",
  friendly: "Friendly",
  concise: "Concise",
  empathetic: "Empathetic",
  bold: "Bold"
};
const modeLabels = {
  suggest: "Manual suggestions only",
  approval: "Draft for approval",
  autopilot: "Auto-reply to customers"
};
const knowledgeOptions = [
  { value: "recent_conversation", label: "Recent conversation" },
  { value: "contact_profile", label: "Contact profile" },
  { value: "quick_replies", label: "Quick replies" },
  { value: "templates", label: "Approved templates" },
  { value: "catalog", label: "Catalog" },
  { value: "workspace_profile", label: "Workspace profile" }
];
const guardrailOptions = [
  { value: "handoff_when_unsure", label: "Hand off when unsure" },
  { value: "no_policy_promises", label: "No policy promises" },
  { value: "no_pricing_promises", label: "No pricing promises" },
  { value: "ask_before_discount", label: "Ask before discounts" }
];
const allowedActionOptions = [
  { value: "answer_questions", label: "Answer questions" },
  { value: "qualify_lead", label: "Qualify lead" },
  { value: "send_pricing", label: "Share pricing" },
  { value: "book_demo", label: "Book demo" },
  { value: "create_deal", label: "Create deal" },
  { value: "handoff", label: "Handoff" }
];
const blankAgent = {
  name: "",
  avatar: "🤖",
  role: "support",
  language: "en",
  tone: "professional",
  mode: "suggest",
  is_active: true,
  goal: "Understand the customer need, qualify the lead, and move them to the next useful step.",
  instructions: "",
  knowledge_sources: ["recent_conversation", "contact_profile", "quick_replies"],
  allowed_actions: ["answer_questions", "qualify_lead", "send_pricing", "book_demo", "handoff"],
  qualification_fields: "business name\nuse case\nteam size\nmonthly message volume\npreferred plan",
  guardrails: ["handoff_when_unsure", "no_policy_promises"],
  escalation_keywords: "refund\nlegal\ncomplaint\nangry\ncancel",
  handoff_keywords: "human\nagent\ncall me\ncomplaint\nlegal\nrefund",
  handoff_after_invalid_replies: 2,
  fallback_reply: "I want to answer this correctly. Let me connect you with a team member for the next step.",
  max_auto_replies_per_conversation: 3,
  max_reply_chars: 3500,
  confidence_threshold: 0.7
};
function FieldError({ message }) {
  if (!message) return null;
  return /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-300", children: message });
}
function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "green"
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/15",
    blue: "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-400/15",
    amber: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/15"
  };
  return /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: value }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
    ] }),
    /* @__PURE__ */ jsx("span", { className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-card ring-1", tones[tone]), children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) })
  ] }) });
}
function AiIndex({
  ai_suggestions_enabled = false,
  ai_agents = [],
  ai_agent_runs = [],
  platform_ai_enabled = false,
  platform_ai_provider = "openai",
  usage = { this_month: 0, by_feature: {}, period_start: "" }
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [agentDrawerOpen, setAgentDrawerOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [simulationMessage, setSimulationMessage] = useState("Hi, I need pricing and want a discount.");
  const [simulationContext, setSimulationContext] = useState("");
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const form = useForm({
    ai_suggestions_enabled
  });
  const agentForm = useForm({
    ...blankAgent
  });
  const usageEntries = Object.entries(usage?.by_feature || {});
  const activeAgents = useMemo(() => ai_agents.filter((agent) => agent.is_active), [ai_agents]);
  const autopilotAgents = useMemo(() => ai_agents.filter((agent) => agent.mode === "autopilot" && agent.is_active), [ai_agents]);
  const submit = (event) => {
    event.preventDefault();
    form.transform(() => ({
      ai_suggestions_enabled: form.data.ai_suggestions_enabled
    }));
    form.post(route("app.ai.settings"), {
      preserveScroll: true,
      onSuccess: () => toast.success("AI settings saved")
    });
  };
  const openCreateAgent = () => {
    setEditingAgent(null);
    agentForm.reset();
    agentForm.setData({ ...blankAgent });
    setAgentDrawerOpen(true);
  };
  const openEditAgent = (agent) => {
    setEditingAgent(agent);
    setSimulationResult(null);
    const knowledgeSources = normalizeStringArray(agent.knowledge_sources);
    const guardrails = normalizeStringArray(agent.guardrails);
    agentForm.setData({
      name: agent.name,
      avatar: agent.avatar || "🤖",
      role: agent.role,
      language: agent.language || "en",
      tone: agent.tone,
      mode: agent.mode,
      is_active: agent.is_active,
      goal: agent.goal || "",
      instructions: agent.instructions || "",
      knowledge_sources: knowledgeSources,
      allowed_actions: normalizeStringArray(agent.allowed_actions),
      qualification_fields: normalizeStringArray(agent.qualification_fields).join("\n"),
      guardrails,
      escalation_keywords: (agent.escalation_rules?.keywords || []).join("\n"),
      handoff_keywords: (agent.handoff_rules?.keywords || []).join("\n"),
      handoff_after_invalid_replies: agent.handoff_rules?.after_invalid_replies ?? 2,
      fallback_reply: agent.fallback_reply || "",
      max_auto_replies_per_conversation: agent.max_auto_replies_per_conversation ?? 3,
      max_reply_chars: agent.max_reply_chars ?? 3500,
      confidence_threshold: agent.confidence_threshold ?? 0.7
    });
    setAgentDrawerOpen(true);
  };
  const toggleArrayValue = (field, value) => {
    const current = normalizeStringArray(agentForm.data[field]);
    agentForm.setData(field, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };
  const submitAgent = (event) => {
    event.preventDefault();
    const payload = {
      ...agentForm.data,
      qualification_fields: normalizeStringArray(agentForm.data.qualification_fields),
      escalation_rules: {
        keywords: agentForm.data.escalation_keywords.split("\n").map((keyword) => keyword.trim()).filter(Boolean)
      },
      handoff_rules: {
        keywords: agentForm.data.handoff_keywords.split("\n").map((keyword) => keyword.trim()).filter(Boolean),
        after_invalid_replies: Number(agentForm.data.handoff_after_invalid_replies) || 2
      }
    };
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(editingAgent ? "AI agent updated" : "AI agent created");
        setAgentDrawerOpen(false);
        setEditingAgent(null);
        agentForm.reset();
      }
    };
    agentForm.transform(() => payload);
    if (editingAgent) {
      agentForm.patch(route("app.ai.agents.update", { agent: editingAgent.id }), options);
    } else {
      agentForm.post(route("app.ai.agents.store"), options);
    }
  };
  const simulateAgent = async () => {
    if (!editingAgent) {
      toast.warning("Save the agent first", "Simulator is available after the agent is created.");
      return;
    }
    setSimulationLoading(true);
    try {
      const response = await axios.post(route("app.ai.agents.simulate", { agent: editingAgent.id }), {
        message: simulationMessage,
        context: simulationContext
      });
      setSimulationResult(response.data);
    } catch (error) {
      toast.error("Simulation failed", error?.response?.data?.message || "Server error");
    } finally {
      setSimulationLoading(false);
    }
  };
  const deleteAgent = async (agent) => {
    const confirmed = await confirm({
      title: "Delete AI agent",
      message: `Delete "${agent.name}"? Inbox suggestions using this agent will stop.`,
      confirmText: "Delete agent",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("app.ai.agents.destroy", { agent: agent.id }), {
      preserveScroll: true,
      onSuccess: () => toast.success("AI agent deleted")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "AI Assistant" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1400px] space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-waify-green dark:text-emerald-300", children: "Workspace intelligence" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text md:text-3xl", children: "AI Agents" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Create role-based agents for inbox reply suggestions, approval workflows, and guarded autopilot." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx(Badge, { variant: platform_ai_enabled ? "success" : "warning", children: platform_ai_enabled ? "Platform enabled" : "Platform disabled" }),
          /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: platform_ai_provider }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: openCreateAgent, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Create agent"
          ] })
        ] })
      ] }),
      !platform_ai_enabled && /* @__PURE__ */ jsx(Alert, { variant: "warning", title: "AI provider is disabled", children: "Agents can be configured, but replies will stay unavailable until an AI provider is enabled." }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            title: "Requests this month",
            value: usage?.this_month ?? 0,
            description: "Generated by your account in this workspace.",
            icon: BarChart3,
            tone: "green"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            title: "Active agents",
            value: activeAgents.length,
            description: `${ai_agents.length} workspace AI agent${ai_agents.length === 1 ? "" : "s"} configured.`,
            icon: ClipboardList,
            tone: "blue"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            title: "Conversation assist",
            value: form.data.ai_suggestions_enabled && platform_ai_enabled ? "On" : "Off",
            description: autopilotAgents.length > 0 ? `${autopilotAgents.length} autopilot agent${autopilotAgents.length === 1 ? "" : "s"} active.` : "Inbox suggestions use selected active agents.",
            icon: Sparkles,
            tone: "amber"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]", children: [
        /* @__PURE__ */ jsxs("aside", { className: "space-y-4 lg:sticky lg:top-24 lg:h-fit", children: [
          /* @__PURE__ */ jsx(Card, { className: "p-2", children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "flex w-full items-center gap-3 rounded-btn bg-waify-green-soft px-3 py-2.5 text-left text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-300",
              children: [
                /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 dark:bg-waify-dark-surface", children: /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold", children: "Agent setup" }),
                  /* @__PURE__ */ jsx("span", { className: "block text-[11px] opacity-80", children: "Agents and activity" })
                ] })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-400/15", children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Agent behavior" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: "Instructions, knowledge sources, guardrails, and escalation rules now live inside each agent." })
            ] })
          ] }) }),
          usageEntries.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Usage by feature" }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: usageEntries.map(([feature, count]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-btn bg-gray-50 px-3 py-2 text-sm dark:bg-waify-dark-surface-2", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate text-waify-text-muted dark:text-waify-dark-text-muted", children: featureLabels[feature] ?? feature }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: count })
            ] }, feature)) })
          ] }),
          ai_agent_runs.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Agent activity" }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: ai_agent_runs.slice(0, 6).map((run) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 px-3 py-2 dark:bg-waify-dark-surface-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "truncate text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: run.agent?.name || "AI agent" }),
                /* @__PURE__ */ jsx(StatusBadge, { tone: run.status === "sent" ? "success" : run.status === "failed" ? "danger" : "muted", children: run.status })
              ] }),
              run.reason && /* @__PURE__ */ jsx("p", { className: "mt-1 truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: run.reason })
            ] }, run.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 space-y-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(UserRoundCog, { className: "h-5 w-5 text-waify-green-dark dark:text-emerald-300" }),
                  "AI agents"
                ] }),
                /* @__PURE__ */ jsx(CardDescription, { children: "Create role-based assistants that draft customer replies from Inbox." })
              ] }),
              /* @__PURE__ */ jsxs(Button, { type: "button", onClick: openCreateAgent, children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                "Create agent"
              ] })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { children: ai_agents.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-dashed border-gray-200 p-6 text-center dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx(Bot, { className: "mx-auto h-9 w-9 text-waify-text-muted dark:text-waify-dark-text-muted" }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "No AI agents yet" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Create a support or sales assistant and choose it from the Inbox composer." }),
              /* @__PURE__ */ jsxs(Button, { type: "button", className: "mt-4", onClick: openCreateAgent, children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                "Create first agent"
              ] })
            ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-3 xl:grid-cols-2", children: ai_agents.map((agent) => /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
                  /* @__PURE__ */ jsx(ThemedIconTile, { tone: agent.is_active ? "green" : "gray", size: "lg", children: /* @__PURE__ */ jsx("span", { className: "text-lg", children: agent.avatar || "🤖" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: agent.name }),
                    /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                      roleLabels[agent.role],
                      " · ",
                      toneLabels[agent.tone]
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
                  /* @__PURE__ */ jsx(StatusBadge, { tone: agent.is_active ? "success" : "muted", children: agent.is_active ? "Active" : "Paused" }),
                  /* @__PURE__ */ jsx(StatusBadge, { tone: agent.mode === "autopilot" ? "warning" : agent.mode === "approval" ? "info" : "default", children: modeLabels[agent.mode] })
                ] })
              ] }),
              agent.instructions && /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-2 text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted", children: agent.instructions }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: normalizeStringArray(agent.knowledge_sources).slice(0, 3).map((source) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: knowledgeOptions.find((item) => item.value === source)?.label || source }, source)) }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => openEditAgent(agent), children: "Edit" }),
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => deleteAgent(agent), "aria-label": "Delete agent", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
                ] })
              ] })
            ] }, agent.id)) }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-waify-green-dark dark:text-emerald-300" }),
                "Conversation AI"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Show the AI suggest action in Inbox conversations for reply ideas." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border sm:flex-row sm:items-center sm:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Enable reply suggestions" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Agents can generate draft replies without leaving the conversation page." })
              ] }),
              /* @__PURE__ */ jsx(
                Switch,
                {
                  checked: form.data.ai_suggestions_enabled,
                  onCheckedChange: (checked) => form.setData("ai_suggestions_enabled", checked),
                  disabled: !platform_ai_enabled
                }
              )
            ] }) })
          ] }),
          !platform_ai_enabled && /* @__PURE__ */ jsx(Alert, { variant: "warning", title: "Admin action required", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }),
            "Enable a provider in Platform Settings before agents can generate suggestions."
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-waify-dark-border sm:flex-row sm:items-center sm:justify-end", children: [
            form.recentlySuccessful && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
              "Saved"
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: form.processing, children: [
              /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
              form.processing ? "Saving..." : "Save settings"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: agentDrawerOpen,
        onClose: () => setAgentDrawerOpen(false),
        title: editingAgent ? "Edit AI agent" : "Create AI agent",
        description: "Agents are workspace-scoped and can be selected from Inbox suggestions.",
        className: "sm:max-w-3xl",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setAgentDrawerOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", form: "ai-agent-form", disabled: agentForm.processing, children: agentForm.processing ? "Saving..." : editingAgent ? "Save agent" : "Create agent" })
        ] }),
        children: /* @__PURE__ */ jsxs("form", { id: "ai-agent-form", onSubmit: submitAgent, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-[90px_minmax(0,1fr)]", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "agent-avatar", children: "Avatar" }),
              /* @__PURE__ */ jsx(Input, { id: "agent-avatar", value: agentForm.data.avatar, onChange: (event) => agentForm.setData("avatar", event.target.value), placeholder: "🤖", maxLength: 12 })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "agent-name", children: "Agent name" }),
              /* @__PURE__ */ jsx(Input, { id: "agent-name", value: agentForm.data.name, onChange: (event) => agentForm.setData("name", event.target.value), placeholder: "Sales concierge" }),
              /* @__PURE__ */ jsx(FieldError, { message: agentForm.errors.name })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Role" }),
              /* @__PURE__ */ jsxs(Select, { value: agentForm.data.role, onValueChange: (value) => agentForm.setData("role", value), children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { children: roleLabels[agentForm.data.role] }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: Object.entries(roleLabels).map(([value, label]) => /* @__PURE__ */ jsx(SelectItem, { value, children: label }, value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Tone" }),
              /* @__PURE__ */ jsxs(Select, { value: agentForm.data.tone, onValueChange: (value) => agentForm.setData("tone", value), children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { children: toneLabels[agentForm.data.tone] }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: Object.entries(toneLabels).map(([value, label]) => /* @__PURE__ */ jsx(SelectItem, { value, children: label }, value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "agent-language", children: "Language" }),
              /* @__PURE__ */ jsx(Input, { id: "agent-language", value: agentForm.data.language, onChange: (event) => agentForm.setData("language", event.target.value), placeholder: "en" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border sm:grid-cols-[minmax(0,1fr)_220px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx(
                Switch,
                {
                  checked: agentForm.data.mode === "autopilot",
                  onCheckedChange: (checked) => agentForm.setData("mode", checked ? "autopilot" : "suggest")
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Auto-reply in WhatsApp" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "When off, this agent only creates suggestions or drafts. Automatic chat replies run only for active agents with this enabled." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Manual mode" }),
              /* @__PURE__ */ jsxs(
                Select,
                {
                  value: agentForm.data.mode === "autopilot" ? "suggest" : agentForm.data.mode,
                  onValueChange: (value) => agentForm.setData("mode", value),
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { disabled: agentForm.data.mode === "autopilot", children: /* @__PURE__ */ jsx(SelectValue, { children: agentForm.data.mode === "autopilot" ? "Auto-reply enabled" : modeLabels[agentForm.data.mode] }) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "suggest", children: modeLabels.suggest }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "approval", children: modeLabels.approval })
                    ] })
                  ]
                }
              )
            ] })
          ] }),
          agentForm.data.mode === "autopilot" && /* @__PURE__ */ jsx(Alert, { variant: "warning", title: "Autopilot sends replies", children: "Active autopilot agents can reply to inbound text messages automatically. Escalation keywords, reply caps, recent human replies, billing limits, and platform AI settings are checked before sending." }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "agent-goal", children: "Goal" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "agent-goal",
                value: agentForm.data.goal,
                onChange: (event) => agentForm.setData("goal", event.target.value),
                rows: 3,
                placeholder: "Define the business outcome this agent should move toward."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "agent-instructions", children: "Instructions" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "agent-instructions",
                value: agentForm.data.instructions,
                onChange: (event) => agentForm.setData("instructions", event.target.value),
                rows: 6,
                placeholder: "Describe what this agent can answer, when it should ask questions, and when it should hand off."
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: agentForm.errors.instructions })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Knowledge sources" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 grid gap-2 sm:grid-cols-2", children: knowledgeOptions.map((option) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded-card border border-gray-100 px-3 py-2 text-sm dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: normalizeStringArray(agentForm.data.knowledge_sources).includes(option.value), onChange: () => toggleArrayValue("knowledge_sources", option.value), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green" }),
              /* @__PURE__ */ jsx("span", { className: "text-waify-text dark:text-waify-dark-text", children: option.label })
            ] }, option.value)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Allowed actions" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 grid gap-2 sm:grid-cols-2", children: allowedActionOptions.map((option) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded-card border border-gray-100 px-3 py-2 text-sm dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: normalizeStringArray(agentForm.data.allowed_actions).includes(option.value), onChange: () => toggleArrayValue("allowed_actions", option.value), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green" }),
              /* @__PURE__ */ jsx("span", { className: "text-waify-text dark:text-waify-dark-text", children: option.label })
            ] }, option.value)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "agent-qualification", children: "Qualification fields" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "agent-qualification",
                value: Array.isArray(agentForm.data.qualification_fields) ? agentForm.data.qualification_fields.join("\n") : agentForm.data.qualification_fields,
                onChange: (event) => agentForm.setData("qualification_fields", event.target.value),
                rows: 4,
                placeholder: "business name\nuse case\nmonthly message volume"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Guardrails" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 grid gap-2 sm:grid-cols-2", children: guardrailOptions.map((option) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded-card border border-gray-100 px-3 py-2 text-sm dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: normalizeStringArray(agentForm.data.guardrails).includes(option.value), onChange: () => toggleArrayValue("guardrails", option.value), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green" }),
              /* @__PURE__ */ jsx("span", { className: "text-waify-text dark:text-waify-dark-text", children: option.label })
            ] }, option.value)) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-gray-100 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-amber-500" }),
                "Safety controls"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { children: "These checks decide whether an agent can suggest, request approval, or auto-send." })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Escalation keywords" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Matched keywords block autopilot and force human handling." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Auto reply cap" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Caps repeated replies in one conversation and prevents loops." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Recent human reply" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Runtime autopilot skips if a team member replied recently." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Confidence threshold" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Lower thresholds stay visible as warnings in simulator and review." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "agent-escalation", children: "Escalation keywords" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "agent-escalation",
                value: agentForm.data.escalation_keywords,
                onChange: (event) => agentForm.setData("escalation_keywords", event.target.value),
                rows: 4,
                placeholder: "refund\nlegal\ncomplaint"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "agent-handoff", children: "Handoff keywords" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  id: "agent-handoff",
                  value: agentForm.data.handoff_keywords,
                  onChange: (event) => agentForm.setData("handoff_keywords", event.target.value),
                  rows: 4,
                  placeholder: "human\nagent\ncall me"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "agent-handoff-invalid", children: "Invalid replies" }),
              /* @__PURE__ */ jsx(Input, { id: "agent-handoff-invalid", type: "number", min: 1, max: 10, value: agentForm.data.handoff_after_invalid_replies, onChange: (event) => agentForm.setData("handoff_after_invalid_replies", Number(event.target.value)) }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Pause or handoff after this many unmatched replies." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "agent-fallback", children: "Fallback when unsure" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "agent-fallback",
                value: agentForm.data.fallback_reply,
                onChange: (event) => agentForm.setData("fallback_reply", event.target.value),
                rows: 3,
                placeholder: "I want to answer this correctly. Let me connect you with a team member."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded-card border border-gray-100 px-3 py-2 text-sm dark:border-waify-dark-border sm:col-span-1", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: agentForm.data.is_active, onChange: (event) => agentForm.setData("is_active", event.target.checked), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green" }),
              /* @__PURE__ */ jsx("span", { className: "text-waify-text dark:text-waify-dark-text", children: "Active" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "agent-max-replies", children: "Auto reply cap" }),
              /* @__PURE__ */ jsx(Input, { id: "agent-max-replies", type: "number", min: 0, max: 20, value: agentForm.data.max_auto_replies_per_conversation, onChange: (event) => agentForm.setData("max_auto_replies_per_conversation", Number(event.target.value)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "agent-confidence", children: "Confidence" }),
              /* @__PURE__ */ jsx(Input, { id: "agent-confidence", type: "number", min: 0, max: 1, step: 0.05, value: agentForm.data.confidence_threshold, onChange: (event) => agentForm.setData("confidence_threshold", Number(event.target.value)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "agent-max-chars", children: "Max reply length" }),
              /* @__PURE__ */ jsx(Input, { id: "agent-max-chars", type: "number", min: 120, max: 4e3, value: agentForm.data.max_reply_chars, onChange: (event) => agentForm.setData("max_reply_chars", Number(event.target.value)) }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use 1800-2500 for pricing and sales replies." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-gray-100 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
                /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 text-waify-green-dark dark:text-emerald-300" }),
                "Agent simulator"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Test replies and safety decisions before using the agent in Inbox." })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "agent-sim-message", children: "Customer message" }),
                /* @__PURE__ */ jsx(Textarea, { id: "agent-sim-message", value: simulationMessage, onChange: (event) => setSimulationMessage(event.target.value), rows: 3 })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "agent-sim-context", children: "Optional context" }),
                /* @__PURE__ */ jsx(Textarea, { id: "agent-sim-context", value: simulationContext, onChange: (event) => setSimulationContext(event.target.value), rows: 3, placeholder: "Recent order, product, or policy context..." })
              ] }),
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: simulateAgent, disabled: simulationLoading || !editingAgent, children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
                simulationLoading ? "Running..." : "Run simulation"
              ] }),
              !editingAgent && /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Create the agent once, then reopen it to run simulations against saved safety rules." }),
              simulationResult && /* @__PURE__ */ jsxs("div", { className: "space-y-3 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Simulation result" }),
                  /* @__PURE__ */ jsx(StatusBadge, { tone: simulationResult.status === "blocked" ? "danger" : "success", children: simulationResult.status })
                ] }),
                simulationResult.reply && /* @__PURE__ */ jsx("p", { className: "rounded-btn bg-white p-3 text-sm text-waify-text dark:bg-waify-dark-surface dark:text-waify-dark-text", children: simulationResult.reply }),
                /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: simulationResult.safety.map((check) => /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 rounded-btn bg-white p-3 text-xs dark:bg-waify-dark-surface", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: check.label }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 text-waify-text-muted dark:text-waify-dark-text-muted", children: check.message })
                  ] }),
                  /* @__PURE__ */ jsx(StatusBadge, { tone: check.severity === "block" ? "danger" : check.severity === "warn" ? "warning" : "success", children: check.severity })
                ] }, check.label)) })
              ] })
            ] })
          ] })
        ] })
      }
    )
  ] });
}
export {
  AiIndex as default
};
