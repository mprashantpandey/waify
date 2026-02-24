import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { S as Switch } from "./Switch-DsHb4CWG.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function AiTab({ data, setData, errors }) {
  const ai = data.ai || {};
  const provider = ai.provider || "openai";
  const setProvider = (value) => {
    setData("ai", { ...ai, provider: value });
  };
  return /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "AI Settings" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Only one provider can be active. Enable AI and choose a single provider for support and conversation suggestions." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Enable AI Assistant" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Turn on AI for support replies and conversation suggestions." })
        ] }),
        /* @__PURE__ */ jsx(
          Switch,
          {
            checked: ai.enabled || false,
            onCheckedChange: (checked) => setData("ai", { ...ai, enabled: checked })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Provider (one only)" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-3", children: "Select the single provider to use. Only this provider will be used when AI is enabled." }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: [
          { value: "openai", label: "OpenAI (GPT-4o, etc.)" },
          { value: "anthropic", label: "Anthropic (Claude)" },
          { value: "gemini", label: "Google Gemini" }
        ].map(({ value, label }) => /* @__PURE__ */ jsxs(
          "label",
          {
            className: `
                                    flex items-center gap-2 rounded-lg border-2 px-4 py-3 cursor-pointer transition
                                    ${provider === value ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}
                                `,
            children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "radio",
                  name: "ai.provider",
                  value,
                  checked: provider === value,
                  onChange: () => setProvider(value),
                  className: "sr-only"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: label })
            ]
          },
          value
        )) }),
        errors?.["ai.provider"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.provider"] })
      ] }),
      provider === "openai" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/30", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "OpenAI" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ai.openai_api_key", children: "API Key" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "ai.openai_api_key",
                type: "password",
                value: ai.openai_api_key || "",
                onChange: (e) => setData("ai", { ...ai, openai_api_key: e.target.value }),
                className: "mt-1 block w-full",
                placeholder: "sk-..."
              }
            ),
            errors?.["ai.openai_api_key"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.openai_api_key"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ai.openai_model", children: "Model" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "ai.openai_model",
                type: "text",
                value: ai.openai_model || "gpt-4o-mini",
                onChange: (e) => setData("ai", { ...ai, openai_model: e.target.value }),
                className: "mt-1 block w-full"
              }
            ),
            errors?.["ai.openai_model"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.openai_model"] })
          ] })
        ] })
      ] }),
      provider === "anthropic" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/30", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Anthropic" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ai.anthropic_api_key", children: "API Key" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "ai.anthropic_api_key",
                type: "password",
                value: ai.anthropic_api_key || "",
                onChange: (e) => setData("ai", { ...ai, anthropic_api_key: e.target.value }),
                className: "mt-1 block w-full",
                placeholder: "sk-ant-..."
              }
            ),
            errors?.["ai.anthropic_api_key"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.anthropic_api_key"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ai.anthropic_model", children: "Model" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "ai.anthropic_model",
                type: "text",
                value: ai.anthropic_model || "claude-3-5-haiku-20241022",
                onChange: (e) => setData("ai", { ...ai, anthropic_model: e.target.value }),
                className: "mt-1 block w-full",
                placeholder: "claude-3-5-haiku-20241022"
              }
            ),
            errors?.["ai.anthropic_model"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.anthropic_model"] })
          ] })
        ] })
      ] }),
      provider === "gemini" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/30", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Google Gemini" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ai.gemini_api_key", children: "API Key" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "ai.gemini_api_key",
                type: "password",
                value: ai.gemini_api_key || "",
                onChange: (e) => setData("ai", { ...ai, gemini_api_key: e.target.value }),
                className: "mt-1 block w-full",
                placeholder: "AIza..."
              }
            ),
            errors?.["ai.gemini_api_key"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.gemini_api_key"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ai.gemini_model", children: "Model" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "ai.gemini_model",
                type: "text",
                value: ai.gemini_model || "gemini-1.5-flash",
                onChange: (e) => setData("ai", { ...ai, gemini_model: e.target.value }),
                className: "mt-1 block w-full"
              }
            ),
            errors?.["ai.gemini_model"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.gemini_model"] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "ai.temperature", children: "Temperature" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "ai.temperature",
              type: "number",
              step: "0.1",
              min: "0",
              max: "1",
              value: ai.temperature ?? 0.2,
              onChange: (e) => setData("ai", { ...ai, temperature: Number(e.target.value) }),
              className: "mt-1 block w-full"
            }
          ),
          errors?.["ai.temperature"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.temperature"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "ai.max_tokens", children: "Max Output Tokens" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "ai.max_tokens",
              type: "number",
              min: "50",
              max: "1000",
              value: ai.max_tokens ?? 300,
              onChange: (e) => setData("ai", { ...ai, max_tokens: Number(e.target.value) }),
              className: "mt-1 block w-full"
            }
          ),
          errors?.["ai.max_tokens"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.max_tokens"] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "ai.system_prompt", children: "System Prompt" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "ai.system_prompt",
            value: ai.system_prompt || "",
            onChange: (e) => setData("ai", { ...ai, system_prompt: e.target.value }),
            className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
            rows: 3,
            placeholder: "You are a helpful support assistant..."
          }
        ),
        errors?.["ai.system_prompt"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["ai.system_prompt"] })
      ] })
    ] })
  ] });
}
export {
  AiTab as default
};
