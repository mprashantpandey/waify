import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { S as Switch } from "./Switch-DsHb4CWG.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { T as Textarea } from "./Textarea-x8GTiAvG.js";
import { Sparkles, Trash2, Plus, BarChart3, CheckCircle2 } from "lucide-react";
import { Transition } from "@headlessui/react";
import { I as InputError } from "./InputError-DiSBWiye.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function AiIndex({
  account,
  ai_suggestions_enabled = false,
  ai_prompts = [],
  usage = { this_month: 0, by_feature: {}, period_start: "" }
}) {
  const [prompts, setPrompts] = useState(Array.isArray(ai_prompts) && ai_prompts.length > 0 ? ai_prompts : []);
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    ai_suggestions_enabled,
    ai_prompts: prompts
  });
  const addPrompt = () => {
    const next = [...prompts, { purpose: `custom_${Date.now()}`, label: "", prompt: "" }];
    setPrompts(next);
    setData("ai_prompts", next);
  };
  const updatePrompt = (index, field, value) => {
    const next = prompts.map((p, i) => i === index ? { ...p, [field]: value } : p);
    setPrompts(next);
    setData("ai_prompts", next);
  };
  const removePrompt = (index) => {
    const next = prompts.filter((_, i) => i !== index);
    setPrompts(next);
    setData("ai_prompts", next);
  };
  const submit = (e) => {
    e.preventDefault();
    setData("ai_prompts", prompts);
    post(route("app.ai.settings"), { preserveScroll: true });
  };
  usage?.by_feature ?? {};
  const featureLabels = {
    conversation_suggest: "Conversation reply suggestions",
    support_reply: "Support assistant"
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "AI Assistant" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-8 w-8 text-amber-500" }),
          "AI Assistant"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Enable AI features, manage prompts for different purposes, and view usage." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-bold", children: "Conversation AI" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Show an AI suggest button in WhatsApp chats to get reply suggestions (requires AI module on your plan)." })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "AI suggestions in conversations" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: "When enabled, you’ll see a suggest button in chat to generate reply ideas." })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: data.ai_suggestions_enabled,
                onCheckedChange: (checked) => setData("ai_suggestions_enabled", checked)
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-bold", children: "Your prompts" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Add prompts for different purposes. Use a short key (e.g. reply_suggestion, summary) and a label; the prompt text guides the AI for that use case." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
            prompts.map((row, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-800/50",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        placeholder: "Purpose key (e.g. reply_suggestion)",
                        value: row.purpose,
                        onChange: (e) => updatePrompt(index, "purpose", e.target.value),
                        className: "flex-1 max-w-[200px]"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        placeholder: "Label",
                        value: row.label,
                        onChange: (e) => updatePrompt(index, "label", e.target.value),
                        className: "flex-1 max-w-[180px]"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => removePrompt(index),
                        className: "p-2 text-gray-400 hover:text-red-600 rounded-lg",
                        "aria-label": "Remove prompt",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    Textarea,
                    {
                      placeholder: "Prompt text for this purpose...",
                      value: row.prompt,
                      onChange: (e) => updatePrompt(index, "prompt", e.target.value),
                      rows: 2,
                      className: "w-full text-sm"
                    }
                  )
                ]
              },
              index
            )),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: addPrompt, className: "gap-2", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Add prompt"
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: errors?.ai_prompts, className: "mt-2" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5 text-emerald-600 dark:text-emerald-400" }),
              /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-bold", children: "Usage & stats" })
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: "AI requests this month for your account." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: usage?.this_month ?? 0 }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "requests this month" })
            ] }),
            usage?.by_feature && Object.keys(usage.by_feature).length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2", children: Object.entries(usage.by_feature).map(([feature, count]) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: featureLabels[feature] ?? feature }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: count })
            ] }, feature)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, className: "bg-indigo-600 hover:bg-indigo-700 text-white", children: processing ? "Saving..." : "Save settings" }),
          /* @__PURE__ */ jsx(Transition, { show: recentlySuccessful, enter: "transition ease-out", enterFrom: "opacity-0", leave: "transition ease-in", leaveTo: "opacity-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-green-600 dark:text-green-400", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Saved"
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  AiIndex as default
};
