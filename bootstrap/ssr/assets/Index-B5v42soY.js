import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm, router, Head, Link } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { Users, UserCheck, UserMinus, UserPlus, Search, Filter, Trash2, Download, Upload, Plus, Loader2, Mail, Building2, MessageCircle, Phone, Clock, Edit3, FileText, Tag } from "lucide-react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { A as Avatar, I as IconButton, D as Drawer, T as ThemedIconTile, c as TrendBadge } from "./Elements-EbyZDnT_.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { s as splitPhoneNumber, C as CountryPhoneInput } from "./CountryPhoneInput-CHHfMj5w.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "./useToast-BN7qsQL3.js";
import "axios";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
import "./InputError-DiSBWiye.js";
function formatNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? new Intl.NumberFormat("en-IN").format(numeric) : "0";
}
function paginationLabel(label) {
  return String(label ?? "").replace(/&laquo;\s*/g, "Previous").replace(/\s*&raquo;/g, "Next").replace(/&amp;/g, "&").replace(/<[^>]*>/g, "").trim();
}
function formatRelative(value) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 6e4));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function statusConfig(status) {
  const statusMap = {
    active: { variant: "success", label: "Active" },
    inactive: { variant: "default", label: "Inactive" },
    blocked: { variant: "danger", label: "Blocked" },
    opt_out: { variant: "warning", label: "Opt out" }
  };
  return statusMap[status] || { variant: "default", label: status };
}
function ContactStat({
  icon,
  tone,
  label,
  value,
  trend
}) {
  return /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
    /* @__PURE__ */ jsx(ThemedIconTile, { tone, children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
      /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: value }),
        trend && /* @__PURE__ */ jsx(TrendBadge, { value: trend })
      ] })
    ] })
  ] }) });
}
function ContactsIndex({
  contacts,
  tags,
  segments,
  importBatches = [],
  filters
}) {
  const { workspace_permissions } = usePage().props;
  const canExportContacts = Boolean(workspace_permissions?.["contacts.export"]);
  const confirm = useConfirm();
  const [search, setSearch] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [navigatingContactId, setNavigatingContactId] = useState(null);
  const [deletingContactId, setDeletingContactId] = useState(null);
  const [drawerMode, setDrawerMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") return "create";
    if (params.get("contact")) return "view";
    return null;
  });
  const [activeContactSlug, setActiveContactSlug] = useState(() => new URLSearchParams(window.location.search).get("contact"));
  const activeContact = contacts.data.find((contact) => String(contact.slug || contact.id) === String(activeContactSlug) || String(contact.id) === String(activeContactSlug)) || null;
  const parsedPhone = splitPhoneNumber("+91");
  const [createCountryCode, setCreateCountryCode] = useState(parsedPhone.countryCode);
  const [createPhone, setCreatePhone] = useState(parsedPhone.localPhone);
  const [bulkTagMode, setBulkTagMode] = useState("add");
  const [bulkTagIds, setBulkTagIds] = useState([]);
  const [bulkTagBusy, setBulkTagBusy] = useState(false);
  const createForm = useForm({
    wa_id: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    status: "active",
    tags: []
  });
  const importForm = useForm({
    file: null,
    tags: []
  });
  const editForm = useForm({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    status: "active",
    tags: []
  });
  const statusCounts = useMemo(() => {
    return contacts.data.reduce((acc, contact) => {
      acc[contact.status] = (acc[contact.status] || 0) + 1;
      return acc;
    }, {});
  }, [contacts.data]);
  const totalContacts = contacts.meta?.total ?? contacts.data.length;
  const selectedAll = contacts.data.length > 0 && contacts.data.every((contact) => selected.has(contact.id));
  const activeImports = importBatches.filter((batch) => ["queued", "processing"].includes(batch.status));
  useEffect(() => {
    if (activeImports.length === 0) return;
    const timer = window.setInterval(() => {
      router.reload({
        only: ["contacts", "importBatches"]
      });
    }, 3e3);
    return () => window.clearInterval(timer);
  }, [activeImports.length]);
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("app.contacts.index", {}), { search, status: filters.status }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const applyStatus = (status) => {
    router.get(route("app.contacts.index", {}), { search, status }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const handleDeleteContact = async (contact) => {
    const confirmed = await confirm({
      title: "Delete contact",
      message: `Delete contact "${contact.name || contact.wa_id}"? This action cannot be undone.`,
      confirmText: "Delete contact",
      variant: "danger"
    });
    if (!confirmed) return;
    setDeletingContactId(contact.id);
    router.delete(route("app.contacts.destroy", { contact: contact.slug || contact.id }), {
      preserveScroll: true,
      onFinish: () => setDeletingContactId(null)
    });
  };
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const confirmed = await confirm({
      title: "Delete selected contacts",
      message: `Delete ${ids.length} selected contact(s)? Contacts with conversation history will be skipped.`,
      confirmText: "Delete contacts",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("app.contacts.bulk-destroy"), {
      data: { ids },
      preserveScroll: true,
      onSuccess: () => setSelected(/* @__PURE__ */ new Set())
    });
  };
  const openBulkTags = () => {
    setBulkTagMode("add");
    setBulkTagIds([]);
    setActiveContactSlug(null);
    setDrawerMode("bulkTags");
  };
  const handleBulkTags = () => {
    const ids = Array.from(selected);
    if (ids.length === 0 || bulkTagIds.length === 0) return;
    setBulkTagBusy(true);
    router.post(route("app.contacts.bulk-tags"), {
      ids,
      tags: bulkTagIds,
      mode: bulkTagMode
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelected(/* @__PURE__ */ new Set());
        closeDrawer();
      },
      onFinish: () => setBulkTagBusy(false)
    });
  };
  const handleMessageSelected = () => {
    const ids = Array.from(selected);
    if (ids.length === 1) {
      const contact = contacts.data.find((item) => item.id === ids[0]);
      if (contact) {
        router.visit(route("app.whatsapp.conversations.by-contact", { contact: contact.slug || contact.id }));
      }
      return;
    }
    router.visit(route("app.broadcasts.index", { contacts: ids.join(",") }));
  };
  const toggleSelected = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected(selectedAll ? /* @__PURE__ */ new Set() : new Set(contacts.data.map((contact) => contact.id)));
  };
  const openCreate = () => {
    createForm.reset();
    setCreateCountryCode("+91");
    setCreatePhone("");
    setActiveContactSlug(null);
    setDrawerMode("create");
  };
  const openImport = () => {
    importForm.reset();
    importForm.clearErrors();
    setActiveContactSlug(null);
    setDrawerMode("import");
  };
  const openContact = (contact) => {
    setActiveContactSlug(contact.slug || String(contact.id));
    setDrawerMode("view");
  };
  const openEditContact = (contact) => {
    setActiveContactSlug(contact.slug || String(contact.id));
    editForm.clearErrors();
    editForm.setData({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || contact.wa_id || "",
      company: contact.company || "",
      notes: contact.notes || "",
      status: contact.status || "active",
      tags: (contact.tags || []).map((tag) => tag.id)
    });
    setDrawerMode("edit");
  };
  const closeDrawer = () => {
    setDrawerMode(null);
    setActiveContactSlug(null);
    setBulkTagIds([]);
  };
  const submitContact = () => {
    const normalizedPhone = `${createCountryCode}${createPhone}`.replace(/\D/g, "");
    createForm.setData("wa_id", normalizedPhone);
    createForm.setData("phone", normalizedPhone);
    router.post(route("app.contacts.store", {}), {
      ...createForm.data,
      wa_id: normalizedPhone,
      phone: normalizedPhone
    }, {
      preserveScroll: true,
      onSuccess: closeDrawer
    });
  };
  const submitImport = () => {
    if (!importForm.data.file) {
      importForm.setError("file", "Choose a CSV file to upload.");
      return;
    }
    importForm.post(route("app.contacts.import", {}), {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        importForm.reset();
        closeDrawer();
      }
    });
  };
  const submitEditContact = () => {
    if (!activeContact) return;
    editForm.put(route("app.contacts.update", { contact: activeContact.slug || activeContact.id }), {
      preserveScroll: true,
      onSuccess: () => setDrawerMode("view")
    });
  };
  const downloadSampleCsv = () => {
    const rows = [
      ["wa_id", "name", "email", "phone", "company", "status", "tags", "notes"],
      ["919988776655", "Aarav Sharma", "aarav@example.com", "919988776655", "Zyptos Retail", "active", "VIP,Support", "Imported sample contact"]
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zyptos-contact-import-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const tabs = [
    { value: void 0, label: "All contacts", count: totalContacts },
    { value: "active", label: "Active", count: statusCounts.active || 0 },
    { value: "inactive", label: "Inactive", count: statusCounts.inactive || 0 },
    { value: "blocked", label: "Blocked", count: statusCounts.blocked || 0 },
    { value: "opt_out", label: "Opt out", count: statusCounts.opt_out || 0 }
  ];
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Contacts" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page max-w-[1600px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsx(
          ContactStat,
          {
            icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }),
            tone: "green",
            label: "Total contacts",
            value: formatNumber(totalContacts),
            trend: "+5.1%"
          }
        ),
        /* @__PURE__ */ jsx(
          ContactStat,
          {
            icon: /* @__PURE__ */ jsx(UserCheck, { className: "h-5 w-5" }),
            tone: "blue",
            label: "Active",
            value: formatNumber(statusCounts.active || 0),
            trend: "+4.8%"
          }
        ),
        /* @__PURE__ */ jsx(
          ContactStat,
          {
            icon: /* @__PURE__ */ jsx(UserMinus, { className: "h-5 w-5" }),
            tone: "amber",
            label: "Opted out",
            value: formatNumber(statusCounts.opt_out || 0)
          }
        ),
        /* @__PURE__ */ jsx(
          ContactStat,
          {
            icon: /* @__PURE__ */ jsx(UserPlus, { className: "h-5 w-5" }),
            tone: "purple",
            label: "Tags / segments",
            value: `${tags.length} / ${segments.length}`
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden border-transparent dark:border-slate-700/80", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-4 pt-4 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto", children: tabs.map((tab) => {
          const active = filters.status === tab.value || !filters.status && !tab.value;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => applyStatus(tab.value),
              className: `relative flex h-10 items-center gap-2 whitespace-nowrap px-3 text-sm font-medium transition ${active ? "text-waify-text dark:text-waify-dark-text" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
              children: [
                tab.label,
                /* @__PURE__ */ jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200" : "bg-gray-100 text-gray-500 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted"}`, children: formatNumber(tab.count) }),
                active && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-waify-green" })
              ]
            },
            tab.value || "all"
          );
        }) }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "flex flex-col gap-2 lg:flex-row lg:items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative min-w-[240px] flex-1", children: [
              /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                  placeholder: "Search by name, phone, email, or company...",
                  className: "h-9 rounded-btn border-gray-200 pl-10 text-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => setShowFilters((value) => !value), children: [
              /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
              "More filters"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "hidden flex-1 lg:block" }),
            selected.size > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-btn bg-gray-50 px-2 py-1 dark:bg-waify-dark-surface-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                selected.size,
                " selected"
              ] }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: openBulkTags, children: "Tags" }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: handleMessageSelected, children: selected.size === 1 ? "Message" : "Broadcast" }),
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: handleBulkDelete, className: "text-red-600 hover:text-red-700 dark:text-red-300", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                "Delete"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Link, { href: canExportContacts ? route("app.contacts.export", {}) : "#", onClick: (event) => !canExportContacts && event.preventDefault(), children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", disabled: !canExportContacts, title: canExportContacts ? "Export contacts" : "Requires contacts export permission", children: [
              /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
              "Export"
            ] }) }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: openImport, children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
              "Bulk upload"
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", onClick: openCreate, children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Add Contact"
            ] })
          ] }),
          showFilters && /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-3 rounded-card border border-gray-100 bg-gray-50/70 p-4 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: "Popular tags" }),
                /* @__PURE__ */ jsx(Link, { href: route("app.contacts.tags.index"), className: "text-xs font-semibold text-waify-green-dark dark:text-emerald-300", children: "Manage tags" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                tags.slice(0, 8).map((tag) => /* @__PURE__ */ jsx("span", { className: "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", style: { backgroundColor: `${tag.color}14`, color: tag.color, borderColor: `${tag.color}33` }, children: tag.name }, tag.id)),
                tags.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "No tags yet" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: "Segments" }),
                /* @__PURE__ */ jsx(Link, { href: route("app.contacts.segments.index"), className: "text-xs font-semibold text-waify-green-dark dark:text-emerald-300", children: "Open segments" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                segments.slice(0, 8).map((segment) => /* @__PURE__ */ jsxs("span", { className: "rounded-md bg-white px-2 py-1 text-xs font-medium text-waify-text ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border", children: [
                  segment.name,
                  " (",
                  formatNumber(segment.contact_count),
                  ")"
                ] }, segment.id)),
                segments.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "No segments yet" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      importBatches.length > 0 && /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 text-waify-green" }),
              /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Import progress" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Large CSV uploads continue in the background. Keep working while Zyptos creates or updates contacts." })
          ] }),
          activeImports.length > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "warning", className: "w-fit", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-1 h-3 w-3 animate-spin" }),
            activeImports.length,
            " running"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 grid gap-3 xl:grid-cols-2", children: importBatches.map((batch) => {
          const isActive = ["queued", "processing"].includes(batch.status);
          const isFailed = batch.status === "failed";
          const statusTone = isFailed ? "text-red-600 dark:text-red-300" : isActive ? "text-amber-600 dark:text-amber-300" : "text-waify-green-dark dark:text-emerald-300";
          return /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: batch.filename || `Import #${batch.id}` }),
                /* @__PURE__ */ jsx("p", { className: `mt-0.5 text-xs font-semibold capitalize ${statusTone}`, children: batch.status })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                batch.progress,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-waify-dark-surface", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `h-full rounded-full transition-all ${isFailed ? "bg-red-500" : "bg-waify-green"}`,
                style: { width: `${Math.max(4, batch.progress)}%` }
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-4 gap-2 text-center text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-gray-50 p-2 dark:bg-waify-dark-surface", children: [
                /* @__PURE__ */ jsxs("p", { className: "font-bold text-waify-text dark:text-waify-dark-text", children: [
                  formatNumber(batch.processed_rows),
                  "/",
                  formatNumber(batch.total_rows)
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Rows" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-gray-50 p-2 dark:bg-waify-dark-surface", children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(batch.imported_count) }),
                /* @__PURE__ */ jsx("p", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "New" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-gray-50 p-2 dark:bg-waify-dark-surface", children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(batch.updated_count) }),
                /* @__PURE__ */ jsx("p", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Updated" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-gray-50 p-2 dark:bg-waify-dark-surface", children: [
                /* @__PURE__ */ jsx("p", { className: `font-bold ${batch.error_count > 0 ? "text-red-600 dark:text-red-300" : "text-waify-text dark:text-waify-dark-text"}`, children: formatNumber(batch.error_count) }),
                /* @__PURE__ */ jsx("p", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Skipped" })
              ] })
            ] }),
            batch.errors?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between gap-2 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-200", children: [
              /* @__PURE__ */ jsx("p", { className: "min-w-0 truncate", children: batch.errors[0] }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: route("app.contacts.imports.errors", { batch: batch.id }),
                  className: "shrink-0 font-semibold hover:underline",
                  children: "Download errors"
                }
              )
            ] })
          ] }, batch.id);
        }) })
      ] }) }),
      contacts.data.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16 text-center", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: Users,
          title: "No contacts found",
          description: "Try adjusting your search or add a WhatsApp contact to start building your audience.",
          action: /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Add Contact"
          ] })
        }
      ) }) }) : /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden border-transparent dark:border-slate-700/80", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50/70 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/60 dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx("th", { className: "w-10 px-5 py-3", children: /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedAll, onChange: toggleAll, className: "h-4 w-4 rounded accent-waify-green" }) }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Name" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Phone" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Tags" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Segments" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Last activity" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-right font-medium", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: contacts.data.map((contact) => {
            const status = statusConfig(contact.status);
            return /* @__PURE__ */ jsxs("tr", { className: "group border-t border-gray-100 transition hover:bg-gray-50/70 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2/50", children: [
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: selected.has(contact.id),
                  onChange: () => toggleSelected(contact.id),
                  className: "h-4 w-4 rounded accent-waify-green"
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Avatar, { name: contact.name || contact.wa_id, size: "md" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => openContact(contact), className: "font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300", children: contact.name || contact.wa_id }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    contact.email && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Mail, { className: "h-3 w-3" }),
                      contact.email
                    ] }),
                    contact.company && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Building2, { className: "h-3 w-3" }),
                      contact.company
                    ] })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-waify-text dark:text-waify-dark-text", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                contact.wa_id && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 tabular-nums", children: [
                  /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5 text-waify-text-muted" }),
                  contact.wa_id
                ] }),
                contact.phone && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-xs tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
                  contact.phone
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx("div", { className: "flex max-w-xs flex-wrap gap-1.5", children: (contact.tags ?? []).length > 0 ? (contact.tags ?? []).map((tag) => /* @__PURE__ */ jsx(Badge, { variant: "default", style: { backgroundColor: `${tag.color}20`, color: tag.color }, children: tag.name }, tag.id)) : /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "None" }) }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx("div", { className: "flex max-w-xs flex-wrap gap-1.5", children: (contact.segments ?? []).length > 0 ? (contact.segments ?? []).map((segment) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: segment.name }, segment.id)) : /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "None" }) }) }),
              /* @__PURE__ */ jsxs("td", { className: "px-5 py-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
                  formatRelative(contact.last_seen_at || contact.created_at)
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-waify-text dark:text-waify-dark-text", children: [
                  formatNumber(contact.message_count),
                  " messages"
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: status.variant, children: status.label }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1 opacity-70 transition group-hover:opacity-100", children: [
                /* @__PURE__ */ jsx(
                  IconButton,
                  {
                    size: "sm",
                    variant: "outline",
                    disabled: navigatingContactId === contact.id,
                    onClick: () => {
                      setNavigatingContactId(contact.id);
                      router.visit(route("app.whatsapp.conversations.by-contact", { contact: contact.slug || contact.id }), {
                        onFinish: () => setNavigatingContactId(null)
                      });
                    },
                    "aria-label": `Message ${contact.name || contact.wa_id}`,
                    children: navigatingContactId === contact.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: () => openContact(contact), children: "View" }),
                /* @__PURE__ */ jsx(
                  IconButton,
                  {
                    size: "sm",
                    variant: "outline",
                    onClick: () => openEditContact(contact),
                    "aria-label": `Edit ${contact.name || contact.wa_id}`,
                    children: /* @__PURE__ */ jsx(Edit3, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  IconButton,
                  {
                    size: "sm",
                    variant: "danger",
                    disabled: deletingContactId === contact.id,
                    onClick: () => handleDeleteContact(contact),
                    "aria-label": `Delete ${contact.name || contact.wa_id}`,
                    children: deletingContactId === contact.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ] }) })
            ] }, contact.id);
          }) })
        ] }) }),
        contacts.links && contacts.links.length > 3 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/40 px-5 py-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "Showing ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: formatNumber(contacts.data.length) }),
            " of ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: formatNumber(totalContacts) }),
            " contacts"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: contacts.links.map((link, index) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => link.url && router.visit(link.url),
              disabled: !link.url,
              className: `h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition ${link.active ? "bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg" : "border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2"} ${!link.url ? "cursor-not-allowed opacity-45" : ""}`,
              children: paginationLabel(link.label)
            },
            index
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Drawer,
        {
          open: drawerMode !== null,
          onClose: closeDrawer,
          title: drawerMode === "create" ? "Add contact" : drawerMode === "import" ? "Bulk upload contacts" : drawerMode === "edit" ? "Edit contact" : drawerMode === "bulkTags" ? "Update tags" : activeContact?.name || activeContact?.wa_id || "Contact details",
          description: drawerMode === "create" ? "Create a contact without leaving the audience table." : drawerMode === "import" ? "Upload a CSV to create and update contacts in this workspace." : drawerMode === "edit" ? "Update contact details, status, and tags." : drawerMode === "bulkTags" ? `Apply tag changes to ${selected.size} selected contact(s).` : "Contact profile and quick actions.",
          className: "max-w-xl",
          footer: drawerMode === "create" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeDrawer, children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { onClick: submitContact, disabled: createForm.processing, children: "Create contact" })
          ] }) : drawerMode === "import" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeDrawer, children: "Cancel" }),
            /* @__PURE__ */ jsxs(Button, { onClick: submitImport, disabled: importForm.processing, children: [
              importForm.processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
              "Upload CSV"
            ] })
          ] }) : drawerMode === "edit" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setDrawerMode("view"), children: "Cancel" }),
            /* @__PURE__ */ jsxs(Button, { onClick: submitEditContact, disabled: editForm.processing, children: [
              editForm.processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
              "Save contact"
            ] })
          ] }) : drawerMode === "bulkTags" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeDrawer, children: "Cancel" }),
            /* @__PURE__ */ jsxs(Button, { onClick: handleBulkTags, disabled: bulkTagBusy || bulkTagIds.length === 0, children: [
              bulkTagBusy ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4" }),
              "Update tags"
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            activeContact && /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => openEditContact(activeContact), children: [
              /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
              " Edit"
            ] }),
            activeContact && /* @__PURE__ */ jsxs(Button, { onClick: () => router.visit(route("app.whatsapp.conversations.by-contact", { contact: activeContact.slug || activeContact.id })), children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
              " Message"
            ] })
          ] }),
          children: drawerMode === "create" ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Name" }),
              /* @__PURE__ */ jsx(TextInput, { value: createForm.data.name, onChange: (event) => createForm.setData("name", event.target.value), className: "w-full" })
            ] }),
            /* @__PURE__ */ jsx(
              CountryPhoneInput,
              {
                countryCode: createCountryCode,
                phone: createPhone,
                onCountryCodeChange: (value) => {
                  setCreateCountryCode(value);
                  const normalized = `${value}${createPhone}`.replace(/\D/g, "");
                  createForm.setData("wa_id", normalized);
                  createForm.setData("phone", normalized);
                },
                onPhoneChange: (value) => {
                  setCreatePhone(value);
                  const normalized = `${createCountryCode}${value}`.replace(/\D/g, "");
                  createForm.setData("wa_id", normalized);
                  createForm.setData("phone", normalized);
                },
                error: createForm.errors.wa_id
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Email" }),
                /* @__PURE__ */ jsx(TextInput, { value: createForm.data.email, onChange: (event) => createForm.setData("email", event.target.value), className: "w-full" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Company" }),
                /* @__PURE__ */ jsx(TextInput, { value: createForm.data.company, onChange: (event) => createForm.setData("company", event.target.value), className: "w-full" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Status" }),
              /* @__PURE__ */ jsxs("select", { value: createForm.data.status, onChange: (event) => createForm.setData("status", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
                /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                /* @__PURE__ */ jsx("option", { value: "inactive", children: "Inactive" }),
                /* @__PURE__ */ jsx("option", { value: "blocked", children: "Blocked" }),
                /* @__PURE__ */ jsx("option", { value: "opt_out", children: "Opt out" })
              ] })
            ] })
          ] }) : drawerMode === "import" ? /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("div", { className: "rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx(ThemedIconTile, { tone: "blue", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "CSV format" }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  "Include at least ",
                  /* @__PURE__ */ jsx("span", { className: "font-mono", children: "wa_id" }),
                  " or ",
                  /* @__PURE__ */ jsx("span", { className: "font-mono", children: "phone" }),
                  ". Supported columns: name, email, company, status, tags, notes."
                ] }),
                /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", className: "mt-3", onClick: downloadSampleCsv, children: [
                  /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
                  "Sample CSV"
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:border-waify-green hover:bg-waify-green-soft/30 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:hover:border-emerald-400/60 dark:hover:bg-emerald-400/10", children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-8 w-8 text-waify-text-muted dark:text-waify-dark-text-muted" }),
              /* @__PURE__ */ jsx("span", { className: "mt-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: importForm.data.file ? importForm.data.file.name : "Choose CSV file" }),
              /* @__PURE__ */ jsx("span", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "CSV or TXT, up to 10 MB" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: ".csv,text/csv,text/plain",
                  className: "sr-only",
                  onChange: (event) => importForm.setData("file", event.target.files?.[0] ?? null)
                }
              )
            ] }),
            importForm.errors.file && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-300", children: importForm.errors.file }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Apply tags to all imported contacts" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                tags.map((tag) => {
                  const active = importForm.data.tags.includes(tag.id);
                  return /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        importForm.setData("tags", active ? importForm.data.tags.filter((id) => id !== tag.id) : [...importForm.data.tags, tag.id]);
                      },
                      className: `rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${active ? "bg-waify-green text-white ring-waify-green" : "bg-white text-waify-text ring-gray-200 hover:bg-gray-50 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2"}`,
                      style: !active ? { color: tag.color } : void 0,
                      children: tag.name
                    },
                    tag.id
                  );
                }),
                tags.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No tags yet. CSV tag names will be created automatically." })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "rounded-card bg-gray-50 p-3 text-xs text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: "Existing contacts are matched by WhatsApp ID and updated. New contacts are created. Phone numbers are normalized to digits for WhatsApp delivery." })
          ] }) : drawerMode === "bulkTags" ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Action" }),
              /* @__PURE__ */ jsxs("select", { value: bulkTagMode, onChange: (event) => setBulkTagMode(event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
                /* @__PURE__ */ jsx("option", { value: "add", children: "Add selected tags" }),
                /* @__PURE__ */ jsx("option", { value: "replace", children: "Replace existing tags" }),
                /* @__PURE__ */ jsx("option", { value: "remove", children: "Remove selected tags" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Tags" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                tags.map((tag) => {
                  const active = bulkTagIds.includes(tag.id);
                  return /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setBulkTagIds(active ? bulkTagIds.filter((id) => id !== tag.id) : [...bulkTagIds, tag.id]),
                      className: `rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${active ? "bg-waify-green text-white ring-waify-green" : "bg-white text-waify-text ring-gray-200 hover:bg-gray-50 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2"}`,
                      style: !active ? { color: tag.color } : void 0,
                      children: tag.name
                    },
                    tag.id
                  );
                }),
                tags.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No tags yet. Create tags from Contacts first." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card bg-gray-50 p-3 text-xs text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: [
              "Selected contacts: ",
              selected.size,
              ". Replacing tags removes each contact's existing tags before applying the selected set."
            ] })
          ] }) : drawerMode === "edit" && activeContact ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Name" }),
              /* @__PURE__ */ jsx(TextInput, { value: editForm.data.name, onChange: (event) => editForm.setData("name", event.target.value), className: "w-full" }),
              editForm.errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-300", children: editForm.errors.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Phone" }),
              /* @__PURE__ */ jsx(TextInput, { value: editForm.data.phone, onChange: (event) => editForm.setData("phone", event.target.value), className: "w-full" }),
              editForm.errors.phone && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-300", children: editForm.errors.phone })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Email" }),
                /* @__PURE__ */ jsx(TextInput, { value: editForm.data.email, onChange: (event) => editForm.setData("email", event.target.value), className: "w-full" }),
                editForm.errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-300", children: editForm.errors.email })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Company" }),
                /* @__PURE__ */ jsx(TextInput, { value: editForm.data.company, onChange: (event) => editForm.setData("company", event.target.value), className: "w-full" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Status" }),
              /* @__PURE__ */ jsxs("select", { value: editForm.data.status, onChange: (event) => editForm.setData("status", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
                /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                /* @__PURE__ */ jsx("option", { value: "inactive", children: "Inactive" }),
                /* @__PURE__ */ jsx("option", { value: "blocked", children: "Blocked" }),
                /* @__PURE__ */ jsx("option", { value: "opt_out", children: "Opt out" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Tags" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                tags.map((tag) => {
                  const active = editForm.data.tags.includes(tag.id);
                  return /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        editForm.setData("tags", active ? editForm.data.tags.filter((id) => id !== tag.id) : [...editForm.data.tags, tag.id]);
                      },
                      className: `rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${active ? "bg-waify-green text-white ring-waify-green" : "bg-white text-waify-text ring-gray-200 hover:bg-gray-50 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2"}`,
                      style: !active ? { color: tag.color } : void 0,
                      children: tag.name
                    },
                    tag.id
                  );
                }),
                tags.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No tags yet." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Notes" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: editForm.data.notes,
                  onChange: (event) => editForm.setData("notes", event.target.value),
                  rows: 4,
                  className: "w-full resize-none rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                }
              )
            ] })
          ] }) : activeContact ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx(Avatar, { name: activeContact.name || activeContact.wa_id, size: "lg" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: activeContact.name || activeContact.wa_id }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: activeContact.wa_id })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Email" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text dark:text-waify-dark-text", children: activeContact.email || "Not set" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Company" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text dark:text-waify-dark-text", children: activeContact.company || "Not set" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Messages" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text dark:text-waify-dark-text", children: formatNumber(activeContact.message_count) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Status" }),
                /* @__PURE__ */ jsx(Badge, { variant: statusConfig(activeContact.status).variant, children: statusConfig(activeContact.status).label })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              (activeContact.tags || []).map((tag) => /* @__PURE__ */ jsx(Badge, { variant: "default", style: { backgroundColor: `${tag.color}20`, color: tag.color }, children: tag.name }, tag.id)),
              (activeContact.segments || []).map((segment) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: segment.name }, segment.id))
            ] })
          ] }) : null
        }
      )
    ] })
  ] });
}
export {
  ContactsIndex as default
};
