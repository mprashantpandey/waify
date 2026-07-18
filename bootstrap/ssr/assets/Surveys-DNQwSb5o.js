import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AddonPage, StatGrid, ServerListControls, EmptyPanel, MiniStatus } from "./Shared-BnBdIg9m.js";
import { T as ThemedIconTile, M as Modal } from "./Elements-EbyZDnT_.js";
import { B as Button } from "./Button-BJftGNki.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { ClipboardList, BarChart3, MessageSquareText, Star, UserRoundPlus, Tag, Copy, ExternalLink, Edit3, Trash2, Plus } from "lucide-react";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
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
function Surveys({
  surveys = [],
  tags = [],
  automationFlows = [],
  filters = {},
  pagination = null
}) {
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const form = useForm({
    name: "",
    type: "Lead form",
    trigger: "",
    status: "draft",
    average_score: "",
    questions: ["What are you interested in?", "What is your budget?", "When should we contact you?"],
    auto_create_contact: true,
    contact_name_field: "respondent_name",
    contact_phone_field: "respondent_phone",
    contact_email_field: "respondent_email",
    auto_tag_names: ["Form lead"],
    success_message: "Thanks. Our team will contact you shortly.",
    automation_enabled: false,
    automation_bot_flow_id: ""
  });
  const openCreate = () => {
    setEditing(null);
    form.setData({
      name: "",
      type: "Lead form",
      trigger: "",
      status: "draft",
      average_score: "",
      questions: ["What are you interested in?", "What is your budget?", "When should we contact you?"],
      auto_create_contact: true,
      contact_name_field: "respondent_name",
      contact_phone_field: "respondent_phone",
      contact_email_field: "respondent_email",
      auto_tag_names: ["Form lead"],
      success_message: "Thanks. Our team will contact you shortly.",
      automation_enabled: false,
      automation_bot_flow_id: ""
    });
    setOpen(true);
  };
  const openEdit = (survey) => {
    setEditing(survey);
    form.setData({
      name: survey.name,
      type: survey.type,
      trigger: survey.trigger,
      status: survey.status,
      average_score: survey.averageScore ?? "",
      questions: survey.questions?.length ? survey.questions : ["How was your experience?"],
      auto_create_contact: survey.autoCreateContact ?? true,
      contact_name_field: survey.contactNameField || "respondent_name",
      contact_phone_field: survey.contactPhoneField || "respondent_phone",
      contact_email_field: survey.contactEmailField || "respondent_email",
      auto_tag_names: survey.autoTagNames?.length ? survey.autoTagNames : [],
      success_message: survey.successMessage || "",
      automation_enabled: survey.automationEnabled ?? false,
      automation_bot_flow_id: survey.automationBotFlowId ?? ""
    });
    setOpen(true);
  };
  const save = () => {
    const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
    editing ? form.patch(route("app.surveys.update", editing.id), options) : form.post(route("app.surveys.store"), options);
  };
  const remove = async (survey) => {
    const confirmed = await confirm({
      title: "Delete form",
      message: `Delete "${survey.name}" and its workspace form configuration?`,
      confirmText: "Delete form",
      variant: "danger"
    });
    if (confirmed) router.delete(route("app.surveys.destroy", survey.id), { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Surveys & Forms" }),
    /* @__PURE__ */ jsxs(AddonPage, { title: "Surveys & Forms", description: "Collect CSAT, NPS, and campaign feedback inside WhatsApp.", actions: /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
      /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
      "Create form"
    ] }), children: [
      /* @__PURE__ */ jsx(StatGrid, { stats: [
        { label: "Forms", value: surveys.length, icon: ClipboardList, tone: "green" },
        { label: "Responses", value: surveys.reduce((sum, item) => sum + item.responses, 0), icon: BarChart3, tone: "blue" },
        { label: "Active flows", value: surveys.filter((item) => item.status === "active").length, icon: MessageSquareText, tone: "purple" },
        { label: "Avg score", value: surveys.length ? (surveys.reduce((sum, item) => sum + Number(item.averageScore || 0), 0) / Math.max(surveys.filter((item) => item.averageScore).length, 1)).toFixed(1) : "-", icon: Star, tone: "amber" }
      ] }),
      /* @__PURE__ */ jsx(ServerListControls, { routeName: "app.surveys.index", filters, pagination, searchPlaceholder: "Search forms, type, trigger" }),
      surveys.length === 0 && /* @__PURE__ */ jsx(EmptyPanel, { title: "No forms yet", description: "Create a survey or feedback form for this workspace.", action: /* @__PURE__ */ jsx(Button, { onClick: openCreate, children: "Create form" }) }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: surveys.map((survey) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "purple", children: /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: survey.name }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              survey.type,
              " · ",
              survey.trigger
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap gap-2 text-xs font-semibold", children: [
              survey.autoCreateContact && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200", children: [
                /* @__PURE__ */ jsx(UserRoundPlus, { className: "h-3 w-3" }),
                "Creates contact"
              ] }),
              survey.automationEnabled && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200", children: [
                /* @__PURE__ */ jsx(MessageSquareText, { className: "h-3 w-3" }),
                "Starts automation"
              ] }),
              (survey.autoTagNames || []).slice(0, 3).map((tag) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-waify-green-soft px-2 py-1 text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-200", children: [
                /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3" }),
                tag
              ] }, tag))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold", children: [
            survey.responses,
            " responses"
          ] }),
          /* @__PURE__ */ jsx(MiniStatus, { status: survey.status }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: () => navigator.clipboard?.writeText(survey.publicUrl), children: [
            /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" }),
            "Copy link"
          ] }),
          /* @__PURE__ */ jsx("a", { href: survey.publicUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
            "Open"
          ] }) }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: () => openEdit(survey), children: [
            /* @__PURE__ */ jsx(Edit3, { className: "h-3.5 w-3.5" }),
            "Edit"
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => remove(survey), children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
            "Delete"
          ] })
        ] })
      ] }) }, survey.id)) }),
      /* @__PURE__ */ jsx(Modal, { open, onClose: () => setOpen(false), title: editing ? "Edit form" : "Create form", description: "Saved to this workspace.", footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { onClick: save, disabled: form.processing, children: "Save" })
      ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Name",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.name, onChange: (e) => form.setData("name", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Type",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.type, onChange: (e) => form.setData("type", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Trigger",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.trigger, onChange: (e) => form.setData("trigger", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Average score",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "number", step: "0.1", value: form.data.average_score, onChange: (e) => form.setData("average_score", e.target.value === "" ? "" : Number(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Status",
          /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.status, onChange: (e) => form.setData("status", e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
            /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
            /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" }),
            /* @__PURE__ */ jsx("option", { value: "archived", children: "Archived" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Questions",
          /* @__PURE__ */ jsx("textarea", { className: "waify-input mt-1 min-h-28", value: form.data.questions.join("\n"), onChange: (e) => form.setData("questions", e.target.value.split("\n").map((line) => line.trim()).filter(Boolean)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 rounded-lg border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-1", checked: form.data.auto_create_contact, onChange: (e) => form.setData("auto_create_contact", e.target.checked) }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Create or update contact on submission",
              /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs font-normal text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use public forms as lead capture pages. A contact is created only when a phone number is available." })
            ] })
          ] }),
          form.data.auto_create_contact && /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsx(FieldSelect, { label: "Name field", value: form.data.contact_name_field, questions: form.data.questions, onChange: (value) => form.setData("contact_name_field", value) }),
            /* @__PURE__ */ jsx(FieldSelect, { label: "Phone field", value: form.data.contact_phone_field, questions: form.data.questions, onChange: (value) => form.setData("contact_phone_field", value) }),
            /* @__PURE__ */ jsx(FieldSelect, { label: "Email field", value: form.data.contact_email_field, questions: form.data.questions, onChange: (value) => form.setData("contact_email_field", value) }),
            /* @__PURE__ */ jsxs("label", { className: "sm:col-span-3 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Auto tags",
              /* @__PURE__ */ jsx(
                Input,
                {
                  className: "mt-1",
                  list: "survey-tag-options",
                  value: form.data.auto_tag_names.join(", "),
                  onChange: (e) => form.setData("auto_tag_names", e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean)),
                  placeholder: "Lead, Website form, Hot prospect"
                }
              ),
              /* @__PURE__ */ jsx("datalist", { id: "survey-tag-options", children: tags.map((tag) => /* @__PURE__ */ jsx("option", { value: tag }, tag)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Success message",
          /* @__PURE__ */ jsx("textarea", { className: "waify-input mt-1 min-h-20", value: form.data.success_message, onChange: (e) => form.setData("success_message", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 rounded-lg border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-1", checked: form.data.automation_enabled, onChange: (e) => form.setData("automation_enabled", e.target.checked) }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Start automation after submission",
              /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs font-normal text-waify-text-muted dark:text-waify-dark-text-muted", children: "Runs the selected active chatbot flow for the created contact. This works best with a WhatsApp connection and a flow that sends a template, payment link, assignment, or AI-agent reply." })
            ] })
          ] }),
          form.data.automation_enabled && /* @__PURE__ */ jsxs("label", { className: "mt-4 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
            "Flow to run",
            /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.automation_bot_flow_id, onChange: (event) => form.setData("automation_bot_flow_id", event.target.value ? Number(event.target.value) : ""), children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select active flow" }),
              automationFlows.map((flow) => /* @__PURE__ */ jsxs("option", { value: flow.id, children: [
                flow.bot_name,
                " / ",
                flow.name
              ] }, flow.id))
            ] }),
            automationFlows.length === 0 && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-amber-600 dark:text-amber-300", children: "Create and activate an automation flow before enabling this." })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
function FieldSelect({ label, value, questions, onChange }) {
  return /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
    label,
    /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: value || "", onChange: (event) => onChange(event.target.value), children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Auto detect" }),
      /* @__PURE__ */ jsx("option", { value: "respondent_name", children: "Built-in name" }),
      /* @__PURE__ */ jsx("option", { value: "respondent_phone", children: "Built-in phone" }),
      /* @__PURE__ */ jsx("option", { value: "respondent_email", children: "Built-in email" }),
      questions.map((question, index) => /* @__PURE__ */ jsx("option", { value: `answer_${index}`, children: question }, `${question}-${index}`))
    ] })
  ] });
}
export {
  Surveys as default
};
