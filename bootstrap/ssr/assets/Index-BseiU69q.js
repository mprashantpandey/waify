import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { I as Input } from "./Input-B0lHg7LA.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import "./Topbar-B0L72tZm.js";
import "lucide-react";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
const COUNTRY_OPTIONS = [
  { code: "IN", label: "India", currency: "INR" },
  { code: "US", label: "United States", currency: "USD" },
  { code: "AE", label: "United Arab Emirates", currency: "AED" },
  { code: "AU", label: "Australia", currency: "AUD" },
  { code: "BR", label: "Brazil", currency: "BRL" },
  { code: "CA", label: "Canada", currency: "CAD" },
  { code: "DE", label: "Germany", currency: "EUR" },
  { code: "ES", label: "Spain", currency: "EUR" },
  { code: "FR", label: "France", currency: "EUR" },
  { code: "GB", label: "United Kingdom", currency: "GBP" },
  { code: "ID", label: "Indonesia", currency: "IDR" },
  { code: "IT", label: "Italy", currency: "EUR" },
  { code: "MX", label: "Mexico", currency: "MXN" },
  { code: "NG", label: "Nigeria", currency: "NGN" },
  { code: "PH", label: "Philippines", currency: "PHP" },
  { code: "SA", label: "Saudi Arabia", currency: "SAR" },
  { code: "SG", label: "Singapore", currency: "SGD" },
  { code: "TH", label: "Thailand", currency: "THB" },
  { code: "TR", label: "Turkey", currency: "TRY" },
  { code: "ZA", label: "South Africa", currency: "ZAR" }
];
const COMMON_CURRENCY_OPTIONS = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "AUD",
  "BRL",
  "CAD",
  "IDR",
  "MXN",
  "NGN",
  "PHP",
  "SAR",
  "SGD",
  "THB",
  "TRY",
  "ZAR"
];
function PlatformMetaPricingIndex({
  versions,
  legacy_default,
  sync_status,
  reconciliation
}) {
  const { auth } = usePage().props;
  const countryCurrencyMap = Object.fromEntries(COUNTRY_OPTIONS.map((c) => [c.code, c.currency]));
  const currencyOptions = Array.from(/* @__PURE__ */ new Set([
    legacy_default?.currency || "INR",
    ...COMMON_CURRENCY_OPTIONS,
    ...COUNTRY_OPTIONS.map((c) => c.currency)
  ])).filter(Boolean);
  const [bulkIssueType, setBulkIssueType] = useState("all_issues");
  const [bulkLimit, setBulkLimit] = useState(200);
  const [officialSource, setOfficialSource] = useState(sync_status?.last_source || "");
  const { data, setData, post, processing, errors, reset } = useForm({
    country_code: legacy_default?.country_code || "IN",
    currency: legacy_default?.currency || "INR",
    effective_from: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    effective_to: "",
    is_active: true,
    notes: "Meta WhatsApp conversation pricing (versioned)",
    rates: {
      marketing: Number(legacy_default?.rates?.marketing || 0),
      utility: Number(legacy_default?.rates?.utility || 0),
      authentication: Number(legacy_default?.rates?.authentication || 0),
      service: Number(legacy_default?.rates?.service || 0)
    }
  });
  const money = (minor, currency) => new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2 }).format((minor || 0) / 100);
  const runBulkRecalc = () => {
    router.post(
      route("platform.meta-pricing.billing.recalculate-bulk"),
      { issue_type: bulkIssueType, limit: bulkLimit },
      { preserveScroll: true }
    );
  };
  const submit = (e) => {
    e.preventDefault();
    post(route("platform.meta-pricing.store"), {
      preserveScroll: true,
      onSuccess: () => {
        reset("notes");
        setData("effective_from", (/* @__PURE__ */ new Date()).toISOString().slice(0, 16));
      }
    });
  };
  const handleCountryChange = (value) => {
    const nextCountry = value.toUpperCase();
    setData("country_code", nextCountry);
    const suggestedCurrency = countryCurrencyMap[nextCountry];
    if (suggestedCurrency) {
      setData("currency", suggestedCurrency);
    }
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Meta Pricing" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Meta Pricing" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Versioned WhatsApp conversation pricing for tenant billing estimates." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "secondary",
              onClick: () => router.post(route("platform.meta-pricing.import-legacy"), {}, { preserveScroll: true }),
              children: "Import Legacy Rates"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              onClick: () => router.post(route("platform.meta-pricing.sync-official"), { source: officialSource || void 0 }, { preserveScroll: true }),
              children: "Sync Official Rates"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Official Sync Feed" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Use a JSON/CSV feed URL or file path and sync the latest Meta rate card snapshot." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3 items-end", children: [
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-4", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "official_source", children: "Feed URL or absolute file path" }),
              /* @__PURE__ */ jsx(Input, { id: "official_source", value: officialSource, onChange: (e) => setOfficialSource(e.target.value), placeholder: "https://.../meta-pricing.json or /home/.../meta-pricing.json" })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                onClick: () => router.post(route("platform.meta-pricing.sync-official"), { source: officialSource || void 0 }, { preserveScroll: true }),
                children: "Run Sync"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
            "Last sync: ",
            sync_status?.last_run_at || "never",
            " · Status: ",
            sync_status?.last_status || "never",
            sync_status?.last_error ? ` · Error: ${sync_status.last_error}` : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Create Pricing Version" }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            "Legacy source: ",
            legacy_default.source,
            " (",
            legacy_default.country_code,
            "/",
            legacy_default.currency,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "country_code", children: "Country Code" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "country_code",
                  value: data.country_code,
                  onChange: (e) => handleCountryChange(e.target.value),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Global / Default" }),
                    COUNTRY_OPTIONS.map((country) => /* @__PURE__ */ jsxs("option", { value: country.code, children: [
                      country.label,
                      " (",
                      country.code,
                      ")"
                    ] }, country.code)),
                    !COUNTRY_OPTIONS.some((country) => country.code === data.country_code) && data.country_code ? /* @__PURE__ */ jsxs("option", { value: data.country_code, children: [
                      data.country_code,
                      " (custom)"
                    ] }) : null
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.country_code, className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "currency", children: "Currency" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  id: "currency",
                  value: data.currency,
                  onChange: (e) => setData("currency", e.target.value.toUpperCase()),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  children: currencyOptions.map((code) => /* @__PURE__ */ jsx("option", { value: code, children: code }, code))
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.currency, className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "effective_from", children: "Effective From" }),
              /* @__PURE__ */ jsx(Input, { id: "effective_from", type: "datetime-local", value: data.effective_from, onChange: (e) => setData("effective_from", e.target.value) }),
              /* @__PURE__ */ jsx(InputError, { message: errors.effective_from, className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "effective_to", children: "Effective To (Optional)" }),
              /* @__PURE__ */ jsx(Input, { id: "effective_to", type: "datetime-local", value: data.effective_to, onChange: (e) => setData("effective_to", e.target.value) }),
              /* @__PURE__ */ jsx(InputError, { message: errors.effective_to, className: "mt-1" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: ["marketing", "utility", "authentication", "service"].map((category) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(Label, { htmlFor: `rate_${category}`, children: [
              category[0].toUpperCase() + category.slice(1),
              " Rate (minor)"
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: `rate_${category}`,
                type: "number",
                min: 0,
                value: data.rates[category],
                onChange: (e) => setData("rates", {
                  ...data.rates,
                  [category]: Number(e.target.value || 0)
                })
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: money(Number(data.rates[category] || 0), data.currency || "INR") }),
            /* @__PURE__ */ jsx(InputError, { message: errors[`rates.${category}`], className: "mt-1" })
          ] }, category)) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "notes", children: "Notes" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "notes",
                rows: 3,
                value: data.notes,
                onChange: (e) => setData("notes", e.target.value),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.notes, className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.is_active,
                onChange: (e) => setData("is_active", e.target.checked),
                className: "rounded border-gray-300"
              }
            ),
            "Activate immediately (deactivates existing active version for same country)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: processing ? "Saving..." : "Create Version" }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Pricing Versions" }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            versions.length,
            " version(s)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          versions.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No versioned Meta pricing configured yet." }),
          versions.map((version) => {
            const rateMap = Object.fromEntries(version.rates.map((r) => [r.category, r.amount_minor]));
            return /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: [
                    "Version #",
                    version.id
                  ] }),
                  /* @__PURE__ */ jsx(Badge, { variant: version.is_active ? "success" : "default", children: version.is_active ? "Active" : "Inactive" }),
                  /* @__PURE__ */ jsxs(Badge, { variant: "info", children: [
                    version.country_code || "GLOBAL",
                    "/",
                    version.currency
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                  "Effective: ",
                  new Date(version.effective_from).toLocaleString(),
                  version.effective_to ? ` → ${new Date(version.effective_to).toLocaleString()}` : " → open-ended"
                ] }),
                version.notes && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 dark:text-gray-300", children: version.notes }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 text-xs", children: ["marketing", "utility", "authentication", "service"].map((category) => /* @__PURE__ */ jsxs("div", { className: "rounded bg-gray-50 dark:bg-gray-800 px-2 py-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-gray-500 dark:text-gray-400 capitalize", children: category }),
                  /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: money(Number(rateMap[category] || 0), version.currency) })
                ] }, category)) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: version.is_active ? "secondary" : "primary",
                  onClick: () => router.post(route("platform.meta-pricing.toggle", { version: version.id }), {}, { preserveScroll: true }),
                  children: version.is_active ? "Deactivate" : "Activate"
                }
              ) })
            ] }) }, version.id);
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Reconciliation Snapshot" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Quick audit of Meta billing snapshots captured from webhooks" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: !reconciliation?.available ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "`whatsapp_message_billings` table is not available on this environment yet." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-lg border border-gray-200 dark:border-gray-800 p-3 md:flex-row md:items-end", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "bulk_issue_type", children: "Bulk Repair Scope" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "bulk_issue_type",
                  value: bulkIssueType,
                  onChange: (e) => setBulkIssueType(e.target.value),
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "all_issues", children: "All issue types" }),
                    /* @__PURE__ */ jsx("option", { value: "missing_pricing_version", children: "Missing pricing version" }),
                    /* @__PURE__ */ jsx("option", { value: "zero_rate_billable", children: "Zero rate on billable" }),
                    /* @__PURE__ */ jsx("option", { value: "zero_cost_billable", children: "Zero cost on billable" }),
                    /* @__PURE__ */ jsx("option", { value: "uncategorized", children: "Uncategorized" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full md:w-40", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "bulk_limit", children: "Limit" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "bulk_limit",
                  type: "number",
                  min: 1,
                  max: 500,
                  value: bulkLimit,
                  onChange: (e) => setBulkLimit(Number(e.target.value || 1))
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: runBulkRecalc, children: "Bulk Recalculate" }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
            ["Total Records", reconciliation.summary.total_records ?? 0],
            ["Billable", reconciliation.summary.billable_records ?? 0],
            ["Missing Version", reconciliation.summary.missing_pricing_version ?? 0],
            ["Zero Rate (Billable)", reconciliation.summary.zero_rate_billable ?? 0],
            ["Zero Cost (Billable)", reconciliation.summary.zero_cost_billable ?? 0],
            ["Uncategorized", reconciliation.summary.uncategorized ?? 0]
          ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: label }),
            /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: Number(value).toLocaleString() })
          ] }, String(label))) }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400", children: [
              /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Time" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Tenant" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Category" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Version" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Rate" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Cost" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Message" }),
              /* @__PURE__ */ jsx("th", { className: "py-2", children: "Action" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: (reconciliation.recent_issues || []).length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "py-6 text-center text-gray-500 dark:text-gray-400", children: "No current reconciliation issues detected in recent records." }) }) : reconciliation.recent_issues.map((row) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-gray-900", children: [
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-3 text-gray-700 dark:text-gray-300", children: new Date(row.created_at).toLocaleString() }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsx("a", { href: route("platform.accounts.show", { account: row.account_id }), className: "text-blue-600 dark:text-blue-400 hover:underline", children: row.account_name }) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-3 text-gray-700 dark:text-gray-300", children: row.category || "uncategorized" }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-3 text-gray-700 dark:text-gray-300", children: row.meta_pricing_version_id ? `#${row.meta_pricing_version_id}` : "Missing" }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-3 text-gray-700 dark:text-gray-300", children: money(row.rate_minor || 0, row.pricing_currency || "INR") }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-3 text-gray-700 dark:text-gray-300", children: money(row.estimated_cost_minor || 0, row.pricing_currency || "INR") }),
              /* @__PURE__ */ jsxs("td", { className: "py-2 text-gray-500 dark:text-gray-400 font-mono", children: [
                (row.meta_message_id || "").slice(0, 24),
                "..."
              ] }),
              /* @__PURE__ */ jsx("td", { className: "py-2", children: /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  className: "px-2 py-1 text-xs",
                  onClick: () => router.post(
                    route("platform.meta-pricing.billing.recalculate", { billing: row.id }),
                    {},
                    { preserveScroll: true }
                  ),
                  children: "Recalculate"
                }
              ) })
            ] }, row.id)) })
          ] }) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  PlatformMetaPricingIndex as default
};
