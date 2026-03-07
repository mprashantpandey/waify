import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-DLPTnTfC.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { S as Switch } from "./Switch-DsHb4CWG.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { T as Textarea } from "./Textarea-x8GTiAvG.js";
import { Sparkles, Trash2, Plus, BarChart3, CheckCircle2 } from "lucide-react";
import { Transition } from "@headlessui/react";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { u as useNotifications } from "./useNotifications-DZIlU05F.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./Badge-CHx1ViYT.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./Alert-C-mQ6HNk.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./useConfirm-BKf7Nv1N.js";
function AiIndex({
  ai_suggestions_enabled = false,
  ai_prompts = [],
  prompt_library = [],
  purpose_options = [],
  platform_ai_enabled = false,
  platform_ai_provider = "openai",
  usage = { this_month: 0, by_feature: {}, period_start: "" }
}) {
  const { toast } = useNotifications();
  const { data, setData, post, transform, processing, errors, recentlySuccessful } = useForm({
    ai_suggestions_enabled,
    ai_prompts: Array.isArray(ai_prompts) && ai_prompts.length > 0 ? ai_prompts : []
  });
  const addPrompt = () => {
    const next = [
      ...data.ai_prompts,
      { purpose: `custom_${Date.now()}`, label: "", prompt: "", scope: "all", enabled: true }
    ];
    setData("ai_prompts", next);
  };
  const addFromLibrary = (libraryPrompt) => {
    const scope = libraryPrompt.scope ?? "all";
    const next = [
      ...data.ai_prompts,
      {
        purpose: libraryPrompt.purpose,
        label: libraryPrompt.label,
        prompt: libraryPrompt.prompt,
        scope,
        enabled: true
      }
    ];
    setData("ai_prompts", next);
    toast.success("Prompt added from library");
  };
  const updatePrompt = (index, field, value) => {
    const next = data.ai_prompts.map((p, i) => i === index ? { ...p, [field]: value } : p);
    setData("ai_prompts", next);
  };
  const removePrompt = (index) => {
    const next = data.ai_prompts.filter((_, i) => i !== index);
    setData("ai_prompts", next);
  };
  const submit = (e) => {
    e.preventDefault();
    const cleaned = data.ai_prompts.map((row) => ({
      purpose: (row.purpose || "").trim(),
      label: (row.label || "").trim(),
      prompt: (row.prompt || "").trim(),
      scope: row.scope || "all",
      enabled: row.enabled !== false
    })).filter((row) => row.purpose || row.label || row.prompt);
    const hasIncomplete = cleaned.some((row) => !row.purpose || !row.label || !row.prompt);
    if (hasIncomplete) {
      toast.warning("Incomplete prompt rows", "Fill purpose/label/prompt or remove incomplete rows.");
      return;
    }
    setData("ai_prompts", cleaned);
    transform(() => ({
      ai_suggestions_enabled: data.ai_suggestions_enabled,
      ai_prompts: cleaned
    }));
    post(route("app.ai.settings"), {
      preserveScroll: true
    });
  };
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
        !platform_ai_enabled && /* @__PURE__ */ jsx(Card, { className: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4 text-sm text-amber-800 dark:text-amber-200", children: "AI is currently disabled in platform settings. Your personal prompts are saved, but AI suggestions will stay unavailable until a super admin enables AI." }) }),
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
                onCheckedChange: (checked) => setData("ai_suggestions_enabled", checked),
                disabled: !platform_ai_enabled
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-bold", children: "Your prompts" }),
            /* @__PURE__ */ jsxs(CardDescription, { children: [
              "Each prompt has a ",
              /* @__PURE__ */ jsx("strong", { children: "purpose" }),
              " (where it is used), a ",
              /* @__PURE__ */ jsx("strong", { children: "label" }),
              ", and ",
              /* @__PURE__ */ jsx("strong", { children: "prompt text" }),
              ". Purpose determines when this instruction is applied: ",
              /* @__PURE__ */ jsx("code", { className: "text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded", children: "conversation_suggest" }),
              " = WhatsApp chat reply suggestions; ",
              /* @__PURE__ */ jsx("code", { className: "text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded", children: "support_reply" }),
              " = Support ticket / live chat assistant."
            ] })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
            Array.isArray(purpose_options) && purpose_options.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400", children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Purpose = where the prompt is used" }),
              /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: purpose_options.map((opt) => /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-xs text-indigo-600 dark:text-indigo-400", children: opt.value }),
                " — ",
                opt.description
              ] }, opt.value)) })
            ] }),
            data.ai_prompts.map((row, index) => {
              const purposeInfo = Array.isArray(purpose_options) ? purpose_options.find((o) => o.value === row.purpose) : null;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-800/50",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 max-w-[220px] space-y-1", children: [
                        /* @__PURE__ */ jsx(
                          TextInput,
                          {
                            placeholder: "Purpose (e.g. conversation_suggest)",
                            value: row.purpose,
                            onChange: (e) => updatePrompt(index, "purpose", e.target.value),
                            className: "w-full"
                          }
                        ),
                        purposeInfo && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: purposeInfo.description })
                      ] }),
                      /* @__PURE__ */ jsx(
                        TextInput,
                        {
                          placeholder: "Label",
                          value: row.label,
                          onChange: (e) => updatePrompt(index, "label", e.target.value),
                          className: "flex-1 max-w-[180px]"
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          value: row.scope || "all",
                          onChange: (e) => updatePrompt(index, "scope", e.target.value),
                          className: "rounded-lg border-gray-300 text-sm dark:bg-gray-800 dark:border-gray-700",
                          children: [
                            /* @__PURE__ */ jsx("option", { value: "all", children: "All roles" }),
                            /* @__PURE__ */ jsx("option", { value: "owner", children: "Owner" }),
                            /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" }),
                            /* @__PURE__ */ jsx("option", { value: "member", children: "Member" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Switch,
                        {
                          checked: row.enabled !== false,
                          onCheckedChange: (checked) => updatePrompt(index, "enabled", checked)
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
              );
            }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: addPrompt, className: "gap-2", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Add prompt"
            ] }),
            Array.isArray(prompt_library) && prompt_library.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-600 dark:text-gray-300", children: "Prompt library (purpose = where it’s used)" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: prompt_library.map((preset, idx) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800",
                  onClick: () => addFromLibrary(preset),
                  title: preset.purpose_description ?? preset.purpose,
                  children: [
                    preset.label,
                    preset.purpose_description && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-gray-500 dark:text-gray-400", children: [
                      "· ",
                      preset.purpose_description
                    ] })
                  ]
                },
                `${preset.purpose}-${idx}`
              )) })
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
            /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: [
              "Active provider: ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: platform_ai_provider })
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
