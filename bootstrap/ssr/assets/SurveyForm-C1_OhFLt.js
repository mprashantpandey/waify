import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head } from "@inertiajs/react";
import { CheckCircle2, Send } from "lucide-react";
import { f as MarketingLayout } from "./Marketing-xvuXbqSy.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import "react";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./ProviderLogo-DiN8H8HE.js";
function SurveyForm({ survey, workspace }) {
  const form = useForm({
    respondent_name: "",
    respondent_phone: "",
    respondent_email: "",
    score: "",
    answers: Object.fromEntries((survey.questions || []).map((_, index) => [String(index), ""]))
  });
  const submit = (event) => {
    event.preventDefault();
    form.post(route("public.surveys.submit", survey.id), { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "survey", wide: true, children: [
    /* @__PURE__ */ jsx(Head, { title: survey.name }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-3xl", children: /* @__PURE__ */ jsx(Card, { className: "p-6", children: form.recentlySuccessful ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-300" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 text-xl font-bold text-waify-text dark:text-waify-dark-text", children: "Response submitted" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: survey.successMessage || `Thank you for sharing your feedback with ${workspace.name || "this workspace"}.` })
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-wide text-waify-green-dark dark:text-emerald-300", children: workspace.name || "Zyptos workspace" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: survey.name }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          survey.type,
          survey.trigger ? ` · ${survey.trigger}` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Field, { label: "Name", children: /* @__PURE__ */ jsx(Input, { value: form.data.respondent_name, onChange: (e) => form.setData("respondent_name", e.target.value) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Phone", children: /* @__PURE__ */ jsx(Input, { value: form.data.respondent_phone, onChange: (e) => form.setData("respondent_phone", e.target.value) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Email", children: /* @__PURE__ */ jsx(Input, { type: "email", value: form.data.respondent_email, onChange: (e) => form.setData("respondent_email", e.target.value) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Score", children: /* @__PURE__ */ jsxs("select", { className: "waify-input", value: form.data.score, onChange: (e) => form.setData("score", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "No score" }),
          [1, 2, 3, 4, 5].map((score) => /* @__PURE__ */ jsx("option", { value: score, children: score }, score))
        ] }) })
      ] }),
      (survey.questions || []).map((question, index) => /* @__PURE__ */ jsx(Field, { label: question, children: /* @__PURE__ */ jsx(
        "textarea",
        {
          className: "waify-input min-h-24",
          value: form.data.answers[String(index)] || "",
          onChange: (e) => form.setData("answers", { ...form.data.answers, [String(index)]: e.target.value })
        }
      ) }, `${question}-${index}`)),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: form.processing, className: "w-full", children: form.processing ? "Submitting..." : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
        "Submit response"
      ] }) })
    ] }) }) })
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx(Label, { className: "mb-2 block text-sm font-semibold", children: label }),
    children
  ] });
}
export {
  SurveyForm as default
};
