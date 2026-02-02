import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { L as Label } from "./Label-CbZtQFYj.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { S as Switch } from "./Switch-hton75fW.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "react";
function SupportTab({ data, setData, errors }) {
  const faqs = data.support?.faqs || [];
  const updateFaq = (index, field, value) => {
    const next = [...faqs];
    next[index] = { ...next[index], [field]: value };
    setData("support", { ...data.support, faqs: next });
  };
  const addFaq = () => {
    setData("support", {
      ...data.support,
      faqs: [...faqs, { question: "", answer: "" }]
    });
  };
  const removeFaq = (index) => {
    const next = faqs.filter((_, idx) => idx !== index);
    setData("support", { ...data.support, faqs: next });
  };
  return /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Support FAQs" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Manage common questions shown in the Support Hub" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Email Notifications" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Enable or disable all support emails." })
          ] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              checked: data.support?.email_notifications_enabled ?? true,
              onCheckedChange: (value) => setData("support", { ...data.support, email_notifications_enabled: value })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Notify Admins" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Email platform admins on new tickets and replies." })
          ] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              checked: data.support?.notify_admins ?? true,
              onCheckedChange: (value) => setData("support", { ...data.support, notify_admins: value })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Notify Customers" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Email tenants when agents reply." })
          ] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              checked: data.support?.notify_customers ?? true,
              onCheckedChange: (value) => setData("support", { ...data.support, notify_customers: value })
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "support.sla_hours", children: "SLA Hours" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "support.sla_hours",
              type: "number",
              min: "1",
              value: data.support?.sla_hours ?? 48,
              onChange: (e) => setData("support", { ...data.support, sla_hours: Number(e.target.value) }),
              className: "mt-1 block w-full"
            }
          ),
          errors?.["support.sla_hours"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["support.sla_hours"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "support.first_response_hours", children: "First Response SLA (hours)" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "support.first_response_hours",
              type: "number",
              min: "1",
              value: data.support?.first_response_hours ?? 4,
              onChange: (e) => setData("support", { ...data.support, first_response_hours: Number(e.target.value) }),
              className: "mt-1 block w-full"
            }
          ),
          errors?.["support.first_response_hours"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["support.first_response_hours"] })
        ] })
      ] }),
      faqs.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No FAQs yet. Add your first one." }),
      faqs.map((faq, index) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: `support.faqs.${index}.question`, children: "Question" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: `support.faqs.${index}.question`,
              type: "text",
              value: faq.question,
              onChange: (e) => updateFaq(index, "question", e.target.value),
              className: "mt-1 block w-full",
              placeholder: "How do I connect WhatsApp?"
            }
          ),
          errors?.[`support.faqs.${index}.question`] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors[`support.faqs.${index}.question`] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: `support.faqs.${index}.answer`, children: "Answer" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: `support.faqs.${index}.answer`,
              value: faq.answer,
              onChange: (e) => updateFaq(index, "answer", e.target.value),
              className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
              rows: 3,
              placeholder: "Go to Connections and follow the setup wizard."
            }
          ),
          errors?.[`support.faqs.${index}.answer`] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors[`support.faqs.${index}.answer`] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => removeFaq(index), children: "Remove" }) })
      ] }, index)),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "button", onClick: addFaq, children: "Add FAQ" }) })
    ] })
  ] });
}
export {
  SupportTab as default
};
