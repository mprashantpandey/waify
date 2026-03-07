import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { Filter, Search, Building2 } from "lucide-react";
import { I as Input } from "./Input-B0lHg7LA.js";
import "./Topbar-B0L72tZm.js";
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
function PlatformTransactionsIndex({
  transactions,
  filters
}) {
  const { auth } = usePage().props;
  const [localFilters, setLocalFilters] = useState({
    // Platform transactions page now defaults to platform-wide listing.
    // Keep account_id out of the local filter UI to avoid "tenant switch" confusion.
    account_id: void 0,
    status: filters?.status ?? "",
    source: filters?.source ?? "",
    search: filters?.search ?? "",
    per_page: filters?.per_page ?? transactions?.per_page ?? 25
  });
  const amount = (minor, currency) => new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format((minor || 0) / 100);
  const statusOptions = useMemo(() => {
    const values = /* @__PURE__ */ new Set();
    transactions?.data?.forEach((row) => {
      if (row.status) values.add(row.status);
    });
    return Array.from(values).sort();
  }, [transactions?.data]);
  const sourceOptions = useMemo(() => {
    const values = /* @__PURE__ */ new Set();
    transactions?.data?.forEach((row) => {
      if (row.source) values.add(row.source);
    });
    return Array.from(values).sort();
  }, [transactions?.data]);
  const runQuery = (next) => {
    const { account_id: _ignoredAccountId, ...query } = next;
    router.get(route("platform.transactions.index"), query, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const applyFilters = () => {
    runQuery({ ...localFilters, page: 1 });
  };
  const clearFilters = () => {
    const reset = { per_page: 25 };
    setLocalFilters(reset);
    runQuery({ ...reset, page: 1 });
  };
  const gotoPage = (page) => {
    runQuery({ ...localFilters, page });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Transactions" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Transactions" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Platform-wide wallet and payment transactions" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-5 w-5" }),
            "DataTable Filters"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Showing platform-wide transactions across all tenants. Use search, status, and source filters to narrow results." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "tx-search", children: "Search" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "tx-search",
                    className: "pl-9",
                    placeholder: "Ref, source, tenant...",
                    value: localFilters.search || "",
                    onChange: (e) => setLocalFilters({ ...localFilters, search: e.target.value }),
                    onKeyDown: (e) => e.key === "Enter" && applyFilters()
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "tx-status", children: "Status" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "tx-status",
                  value: localFilters.status || "",
                  onChange: (e) => setLocalFilters({ ...localFilters, status: e.target.value || void 0 }),
                  className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
                    statusOptions.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status }, status))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "tx-source", children: "Source" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "tx-source",
                  value: localFilters.source || "",
                  onChange: (e) => setLocalFilters({ ...localFilters, source: e.target.value || void 0 }),
                  className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "All Sources" }),
                    sourceOptions.map((source) => /* @__PURE__ */ jsx("option", { value: source, children: source }, source))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "tx-per-page", children: "Rows" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "tx-per-page",
                  value: localFilters.per_page || 25,
                  onChange: (e) => setLocalFilters({ ...localFilters, per_page: Number(e.target.value) }),
                  className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: 10, children: "10" }),
                    /* @__PURE__ */ jsx("option", { value: 25, children: "25" }),
                    /* @__PURE__ */ jsx("option", { value: 50, children: "50" }),
                    /* @__PURE__ */ jsx("option", { value: 100, children: "100" })
                  ]
                }
              )
            ] })
          ] }),
          !!filters?.account_id && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200", children: [
            "A tenant filter was present in the URL and has been removed from the UI. Click ",
            /* @__PURE__ */ jsx("strong", { children: "Clear" }),
            " to return to all transactions."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: applyFilters,
                className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
                children: "Apply Filters"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: clearFilters,
                className: "px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
                children: "Clear"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Transactions DataTable" }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            transactions.total,
            " rows • showing ",
            transactions.from,
            " to ",
            transactions.to
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Type" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Tenant" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Direction" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Amount" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Source" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Reference" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Date" })
            ] }) }),
            /* @__PURE__ */ jsxs("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: [
              transactions.data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-4 py-8 text-center text-gray-500", children: "No transactions found." }) }),
              transactions.data.map((tx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: tx.kind }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                  tx.account?.id ? /* @__PURE__ */ jsxs(
                    Link,
                    {
                      href: route("platform.accounts.show", { account: tx.account.id }),
                      className: "inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400",
                      children: [
                        /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }),
                        tx.account?.name || `Tenant #${tx.account.id}`
                      ]
                    }
                  ) : /* @__PURE__ */ jsx("span", { children: tx.account?.name || "—" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
                    "#",
                    tx.account?.id ?? "—"
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: tx.direction }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: amount(tx.amount_minor, tx.currency) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: tx.source || "—" }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
                  Badge,
                  {
                    variant: tx.status === "success" || tx.status === "paid" ? "success" : tx.status === "failed" ? "danger" : "default",
                    children: tx.status
                  }
                ) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs font-mono", children: tx.reference || "—" }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: new Date(tx.created_at).toLocaleString() })
              ] }, tx.id))
            ] })
          ] }) }),
          transactions.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              "Page ",
              transactions.current_page,
              " of ",
              transactions.last_page
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => gotoPage(Math.max(1, transactions.current_page - 1)),
                  disabled: transactions.current_page <= 1,
                  className: "px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50",
                  children: "Previous"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => gotoPage(Math.min(transactions.last_page, transactions.current_page + 1)),
                  disabled: transactions.current_page >= transactions.last_page,
                  className: "px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50",
                  children: "Next"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  PlatformTransactionsIndex as default
};
