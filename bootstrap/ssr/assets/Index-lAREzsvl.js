import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { P as PageHeader, a as Toolbar, T as ThemedIconTile, S as StatusBadge, D as Drawer } from "./Elements-EbyZDnT_.js";
import { Inbox, Mail, Eye, CheckCircle2, UserPlus, Search, Clock, UserRound, XCircle, Building2, Trash2 } from "lucide-react";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./Badge-C65MHc2S.js";
import "@headlessui/react";
function statusTone(status) {
  if (status === "closed") return "success";
  if (status === "reviewed") return "info";
  if (status === "new") return "warning";
  return "default";
}
function statusLabel(status) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function StatCard({ label, value, icon: Icon, tone = "green" }) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: value })
    ] }),
    /* @__PURE__ */ jsx(ThemedIconTile, { tone, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) })
  ] }) }) });
}
function PlatformContactRequestsIndex({
  requests,
  filters,
  stats,
  accounts = []
}) {
  const { auth } = usePage().props;
  const confirm = useConfirm();
  const [localFilters, setLocalFilters] = useState({
    q: filters?.q || "",
    status: filters?.status || "all",
    per_page: filters?.per_page || 15
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [convertAccountId, setConvertAccountId] = useState("");
  const queryParams = (extra = {}) => ({
    q: localFilters.q || void 0,
    status: localFilters.status && localFilters.status !== "all" ? localFilters.status : void 0,
    per_page: localFilters.per_page || 15,
    ...extra
  });
  const applyFilters = () => {
    router.get(route("platform.contact-requests.index"), queryParams({ page: void 0 }), {
      preserveState: true,
      preserveScroll: true
    });
  };
  const clearFilters = () => {
    setLocalFilters({ q: "", status: "all", per_page: 15 });
    router.get(route("platform.contact-requests.index"), {}, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const goToPage = (page) => {
    router.get(route("platform.contact-requests.index"), queryParams({ page }), {
      preserveState: true,
      preserveScroll: true
    });
  };
  const updateStatus = (contactRequest, status) => {
    router.patch(route("platform.contact-requests.update", { contactRequest: contactRequest.id }), { status }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedRequest((current) => current && current.id === contactRequest.id ? { ...current, status } : current);
      }
    });
  };
  const convertLead = (contactRequest) => {
    if (!convertAccountId) return;
    router.post(route("platform.contact-requests.convert", { contactRequest: contactRequest.id }), { account_id: Number(convertAccountId) }, {
      preserveScroll: true,
      onSuccess: () => {
        setConvertAccountId("");
        setSelectedRequest(null);
      }
    });
  };
  const deleteRequest = async (contactRequest) => {
    const confirmed = await confirm({
      title: "Delete contact request",
      message: `Delete the contact request from ${contactRequest.name}?`,
      confirmText: "Delete request",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("platform.contact-requests.destroy", { contactRequest: contactRequest.id }), {
      preserveScroll: true,
      onSuccess: () => setSelectedRequest(null)
    });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Contact Requests" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Contact requests",
          description: "Leads and messages submitted from the public contact page.",
          actions: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: clearFilters, children: "Reset filters" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Total requests", value: stats.total, icon: Inbox }),
        /* @__PURE__ */ jsx(StatCard, { label: "New", value: stats.new, icon: Mail, tone: "amber" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Reviewed", value: stats.reviewed, icon: Eye, tone: "blue" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Closed", value: stats.closed, icon: CheckCircle2, tone: "green" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Converted", value: stats.converted || 0, icon: UserPlus, tone: "purple" })
      ] }),
      /* @__PURE__ */ jsx(
        Toolbar,
        {
          filters: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "relative min-w-64", children: [
              /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: localFilters.q || "",
                  onChange: (event) => setLocalFilters({ ...localFilters, q: event.target.value }),
                  onKeyDown: (event) => {
                    if (event.key === "Enter") applyFilters();
                  },
                  className: "waify-input w-full pl-9",
                  placeholder: "Search name, email, subject..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.status || "all",
                onChange: (event) => setLocalFilters({ ...localFilters, status: event.target.value }),
                className: "waify-input min-w-40",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All statuses" }),
                  /* @__PURE__ */ jsx("option", { value: "new", children: "New" }),
                  /* @__PURE__ */ jsx("option", { value: "reviewed", children: "Reviewed" }),
                  /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
                ]
              }
            )
          ] }),
          actions: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: applyFilters, children: [
            /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
            "Search"
          ] })
        }
      ),
      requests.data.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsx(ThemedIconTile, { tone: "gray", size: "lg", children: /* @__PURE__ */ jsx(Inbox, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "No contact requests found" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "New public contact form submissions will appear here." })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: requests.data.map((contactRequest) => /* @__PURE__ */ jsx(Card, { className: "transition hover:border-waify-green/40", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: contactRequest.status === "new" ? "amber" : contactRequest.status === "reviewed" ? "blue" : "green", children: /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx(StatusBadge, { tone: statusTone(contactRequest.status), dot: true, children: statusLabel(contactRequest.status) }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
                new Date(contactRequest.created_at).toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: contactRequest.subject }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(UserRound, { className: "h-3.5 w-3.5" }),
                contactRequest.name
              ] }),
              /* @__PURE__ */ jsx("a", { href: `mailto:${contactRequest.email}`, className: "font-medium text-waify-green-dark hover:underline dark:text-emerald-300", children: contactRequest.email })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 line-clamp-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: contactRequest.message })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => setSelectedRequest(contactRequest), children: [
            /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
            "View"
          ] }),
          contactRequest.status === "new" && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => updateStatus(contactRequest, "reviewed"), children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Reviewed"
          ] }),
          contactRequest.status !== "closed" && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => updateStatus(contactRequest, "closed"), children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
            "Close"
          ] })
        ] })
      ] }) }) }, contactRequest.id)) }),
      requests.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          "Showing ",
          requests.per_page * (requests.current_page - 1) + 1,
          " to ",
          Math.min(requests.per_page * requests.current_page, requests.total),
          " of ",
          requests.total
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: Array.from({ length: requests.last_page }, (_, index) => index + 1).map((page) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => goToPage(page),
            className: `h-9 min-w-9 rounded-btn px-3 text-sm font-semibold transition ${page === requests.current_page ? "bg-waify-green text-waify-ink" : "border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2"}`,
            children: page
          },
          page
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: Boolean(selectedRequest),
        onClose: () => setSelectedRequest(null),
        title: selectedRequest?.subject || "Contact request",
        description: selectedRequest ? `${selectedRequest.name} <${selectedRequest.email}>` : void 0,
        className: "sm:max-w-2xl",
        children: selectedRequest && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx(StatusBadge, { tone: statusTone(selectedRequest.status), dot: true, children: statusLabel(selectedRequest.status) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: new Date(selectedRequest.created_at).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap text-sm leading-relaxed text-waify-text dark:text-waify-dark-text", children: selectedRequest.message }) }),
          selectedRequest.converted_at && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
              "Converted to lead"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs", children: [
              selectedRequest.converted_account?.name || "Workspace",
              " · ",
              selectedRequest.converted_contact?.name || selectedRequest.name,
              " · ",
              new Date(selectedRequest.converted_at).toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 text-sm sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Email" }),
              /* @__PURE__ */ jsx("a", { href: `mailto:${selectedRequest.email}`, className: "mt-1 inline-block font-medium text-waify-green-dark hover:underline dark:text-emerald-300", children: selectedRequest.email })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Source" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-waify-text dark:text-waify-dark-text", children: selectedRequest.source.replace(/_/g, " ") })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "IP address" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-waify-text dark:text-waify-dark-text", children: selectedRequest.ip_address || "Not captured" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Handled by" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-waify-text dark:text-waify-dark-text", children: selectedRequest.handler?.name || "Not handled yet" })
            ] })
          ] }),
          selectedRequest.user_agent && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "User agent" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 break-words text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: selectedRequest.user_agent })
          ] }),
          !selectedRequest.converted_at && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
              "Convert to workspace contact"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-col gap-2 sm:flex-row", children: [
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: convertAccountId,
                  onChange: (event) => setConvertAccountId(event.target.value),
                  className: "waify-input min-w-0 flex-1",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Select workspace" }),
                    accounts.map((account) => /* @__PURE__ */ jsx("option", { value: account.id, children: account.name }, account.id))
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => convertLead(selectedRequest), disabled: !convertAccountId, children: [
                /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
                "Convert"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-waify-dark-border", children: [
            selectedRequest.status !== "reviewed" && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => updateStatus(selectedRequest, "reviewed"), children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
              "Mark reviewed"
            ] }),
            selectedRequest.status !== "closed" && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => updateStatus(selectedRequest, "closed"), children: [
              /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
              "Close"
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "danger", onClick: () => deleteRequest(selectedRequest), children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
              "Delete"
            ] })
          ] })
        ] })
      }
    )
  ] });
}
export {
  PlatformContactRequestsIndex as default
};
