import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { ArrowLeft, Megaphone, Plus, FolderOpen, Search, MoreVertical, Pencil, Copy, RefreshCw, Trash2 } from "lucide-react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { T as ThemedIconTile, I as IconButton, D as Drawer, c as TrendBadge } from "./Elements-EbyZDnT_.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "axios";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
function formatNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? new Intl.NumberFormat("en-IN").format(numeric) : "0";
}
function formatRelative(value) {
  if (!value) return "Not calculated";
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
function ruleLabel(rule) {
  return [rule.field, rule.operator, rule.value].filter(Boolean).join(" ");
}
function StatChip({ label, value, trend }) {
  return /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-card border border-gray-100 bg-white px-3 py-2 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none", children: [
    /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-waify-text dark:text-waify-dark-text", children: value }),
    trend && /* @__PURE__ */ jsx(TrendBadge, { value: trend, className: "py-0" })
  ] });
}
function SegmentsIndex({
  segments
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [busySegmentId, setBusySegmentId] = useState(null);
  const [drawerMode, setDrawerMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") return "create";
    if (params.get("edit") === "1") return "edit";
    if (params.get("segment")) return "view";
    return null;
  });
  const [activeSegmentId, setActiveSegmentId] = useState(() => {
    const id = Number(new URLSearchParams(window.location.search).get("segment"));
    return Number.isFinite(id) && id > 0 ? id : null;
  });
  const activeSegment = segments.find((segment) => segment.id === activeSegmentId) || null;
  const segmentForm = useForm({
    name: "",
    description: "",
    filters: [{ field: "status", operator: "equals", value: "active" }]
  });
  const filteredSegments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return segments;
    return segments.filter((segment) => {
      return segment.name.toLowerCase().includes(query) || (segment.description || "").toLowerCase().includes(query) || (segment.filters || []).some((filter) => ruleLabel(filter).toLowerCase().includes(query));
    });
  }, [search, segments]);
  const totalContacts = segments.reduce((sum, segment) => sum + Number(segment.contact_count || 0), 0);
  const averageContacts = segments.length ? Math.round(totalContacts / segments.length) : 0;
  const handleDelete = async (segment) => {
    const confirmed = await confirm({
      title: "Delete segment",
      message: `Delete segment "${segment.name}"? Contacts will remain unchanged.`,
      confirmText: "Delete segment",
      variant: "danger"
    });
    if (!confirmed) return;
    setBusySegmentId(segment.id);
    router.delete(route("app.contacts.segments.destroy", { segment: segment.id }), {
      preserveScroll: true,
      onSuccess: () => toast.success("Segment deleted"),
      onError: () => toast.error("Failed to delete segment"),
      onFinish: () => setBusySegmentId(null)
    });
  };
  const handleRecalculate = (segmentId) => {
    setBusySegmentId(segmentId);
    router.post(route("app.contacts.segments.recalculate", { segment: segmentId }), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Count recalculated"),
      onError: () => toast.error("Failed to recalculate segment"),
      onFinish: () => setBusySegmentId(null)
    });
  };
  const openCreate = () => {
    segmentForm.setData({ name: "", description: "", filters: [{ field: "status", operator: "equals", value: "active" }] });
    setActiveSegmentId(null);
    setDrawerMode("create");
  };
  const openSegment = (segment, mode) => {
    setActiveSegmentId(segment.id);
    if (mode === "edit") {
      const normalizedFilters = (segment.filters?.length ? segment.filters : [{ field: "status", operator: "equals", value: "active" }]).map((filter) => ({
        field: filter.field,
        operator: filter.operator,
        value: filter.value || ""
      }));
      segmentForm.setData({
        name: segment.name,
        description: segment.description || "",
        filters: normalizedFilters
      });
    }
    setDrawerMode(mode);
  };
  const closeDrawer = () => {
    setDrawerMode(null);
    setActiveSegmentId(null);
  };
  const saveSegment = () => {
    if (drawerMode === "edit" && activeSegment) {
      segmentForm.put(route("app.contacts.segments.update", { segment: activeSegment.id }), {
        preserveScroll: true,
        onSuccess: closeDrawer,
        onError: () => toast.error("Failed to update segment")
      });
      return;
    }
    segmentForm.post(route("app.contacts.segments.store", {}), {
      preserveScroll: true,
      onSuccess: closeDrawer,
      onError: () => toast.error("Failed to create segment")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Audience Segments" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page max-w-[1600px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Link, { href: route("app.contacts.index"), className: "mb-4 inline-flex items-center gap-2 text-sm font-medium text-waify-text-muted transition hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Back to contacts"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300", children: "Audience" }),
          /* @__PURE__ */ jsx("h1", { className: "module-heading", children: "Audience Segments" }),
          /* @__PURE__ */ jsx("p", { className: "module-subheading", children: "Group contacts with rules for targeted campaigns." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.broadcasts.index", { panel: "create" }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
            /* @__PURE__ */ jsx(Megaphone, { className: "h-4 w-4" }),
            "New campaign"
          ] }) }),
          /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "New segment"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(StatChip, { label: "Total segments", value: segments.length }),
        /* @__PURE__ */ jsx(StatChip, { label: "Reachable contacts", value: formatNumber(totalContacts), trend: "+6.2%" }),
        /* @__PURE__ */ jsx(StatChip, { label: "Avg. per segment", value: formatNumber(averageContacts) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-card border border-emerald-100 bg-waify-green-soft/70 p-4 dark:border-emerald-500/20 dark:bg-waify-dark-green-soft", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", size: "sm", children: /* @__PURE__ */ jsx(FolderOpen, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Smart segments are live" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Segments recalculate from your saved rules. Use them when creating campaigns for cleaner targeting." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-2 p-3 md:flex-row md:items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative min-w-[220px] flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: search,
              onChange: (event) => setSearch(event.target.value),
              placeholder: "Search segments...",
              className: "h-9 rounded-btn border-gray-200 pl-10 text-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("select", { className: "h-9 rounded-btn border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: [
          /* @__PURE__ */ jsx("option", { children: "All types" }),
          /* @__PURE__ */ jsx("option", { children: "Dynamic" }),
          /* @__PURE__ */ jsx("option", { children: "Static" })
        ] })
      ] }) }),
      filteredSegments.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16 text-center", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: FolderOpen,
          title: "No segments found",
          description: "Create a segment to target specific groups of contacts.",
          action: /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "New segment"
          ] })
        }
      ) }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", children: filteredSegments.map((segment, index) => {
        const rules = segment.filters || [];
        const iconTones = ["amber", "blue", "green", "purple", "pink"];
        return /* @__PURE__ */ jsx(Card, { className: "group border-transparent transition-all hover:-translate-y-0.5 hover:shadow-card-lg dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
              /* @__PURE__ */ jsx(ThemedIconTile, { tone: iconTones[index % iconTones.length], size: "lg", children: /* @__PURE__ */ jsx(FolderOpen, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => openSegment(segment, "view"), className: "font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300", children: segment.name }),
                /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  "Updated ",
                  formatRelative(segment.last_calculated_at || segment.created_at)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "group/menu relative", children: [
              /* @__PURE__ */ jsx(IconButton, { size: "sm", variant: "ghost", "aria-label": "Segment actions", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { className: "invisible absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-card bg-white py-1 opacity-0 shadow-pop ring-1 ring-gray-100 transition group-hover/menu:visible group-hover/menu:opacity-100 dark:bg-waify-dark-surface dark:ring-waify-dark-border", children: [
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => openSegment(segment, "edit"), className: "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2", children: [
                  /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" }),
                  "Edit rules"
                ] }),
                /* @__PURE__ */ jsxs("button", { type: "button", disabled: true, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-waify-text-muted opacity-70 dark:text-waify-dark-text-muted", children: [
                  /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" }),
                  "Duplicate"
                ] }),
                /* @__PURE__ */ jsxs(Link, { href: route("app.broadcasts.index", { panel: "create" }), className: "flex items-center gap-2 px-3 py-2 text-xs font-medium text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2", children: [
                  /* @__PURE__ */ jsx(Megaphone, { className: "h-3.5 w-3.5" }),
                  "Use in campaign"
                ] })
              ] })
            ] })
          ] }),
          segment.description && /* @__PURE__ */ jsx("p", { className: "mb-3 line-clamp-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: segment.description }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex min-h-7 flex-wrap gap-1.5", children: [
            rules.length > 0 ? rules.slice(0, 4).map((rule, ruleIndex) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "rounded-md", children: ruleLabel(rule) }, `${segment.id}-${ruleIndex}`)) : /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "rounded-md", children: "Manual segment" }),
            rules.length > 4 && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "rounded-md", children: [
              "+",
              rules.length - 4,
              " more"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Contacts" }),
              /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(segment.contact_count) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Growth" }),
              /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-300", children: "Live" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Rules" }),
              /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: rules.length })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.broadcasts.index", { panel: "create" }), className: "flex-1", children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "w-full", children: [
              /* @__PURE__ */ jsx(Megaphone, { className: "h-3.5 w-3.5" }),
              "Campaign"
            ] }) }),
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", className: "flex-1", onClick: () => openSegment(segment, "edit"), children: [
              /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsx(IconButton, { size: "sm", variant: "outline", disabled: busySegmentId === segment.id, onClick: () => handleRecalculate(segment.id), "aria-label": `Recalculate ${segment.name}`, children: busySegmentId === segment.id ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(IconButton, { size: "sm", variant: "danger", disabled: busySegmentId === segment.id, onClick: () => handleDelete(segment), "aria-label": `Delete ${segment.name}`, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }) }, segment.id);
      }) }),
      /* @__PURE__ */ jsx(
        Drawer,
        {
          open: drawerMode !== null,
          onClose: closeDrawer,
          title: drawerMode === "create" ? "New segment" : drawerMode === "edit" ? "Edit segment" : activeSegment?.name || "Segment details",
          description: drawerMode === "view" ? "Rules and audience count for this segment." : "Define rules without leaving the segment page.",
          className: "max-w-xl",
          footer: drawerMode === "view" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            activeSegment && /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => openSegment(activeSegment, "edit"), children: [
              /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
              " Edit"
            ] }),
            /* @__PURE__ */ jsx(Button, { onClick: closeDrawer, children: "Done" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeDrawer, children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { onClick: saveSegment, disabled: segmentForm.processing, children: drawerMode === "edit" ? "Save segment" : "Create segment" })
          ] }),
          children: drawerMode === "view" && activeSegment ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: activeSegment.description || "No description" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
                  formatNumber(activeSegment.contact_count),
                  " contacts"
                ] }),
                /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
                  "Updated ",
                  formatRelative(activeSegment.last_calculated_at || activeSegment.created_at)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              (activeSegment.filters || []).map((filter, index) => /* @__PURE__ */ jsx("div", { className: "rounded-btn bg-gray-50 p-3 text-sm text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text", children: ruleLabel(filter) }, index)),
              (activeSegment.filters || []).length === 0 && /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Manual segment" })
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Name" }),
              /* @__PURE__ */ jsx(TextInput, { value: segmentForm.data.name, onChange: (e) => segmentForm.setData("name", e.target.value), className: "w-full" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
              /* @__PURE__ */ jsx(TextInput, { value: segmentForm.data.description, onChange: (e) => segmentForm.setData("description", e.target.value), className: "w-full" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Rules" }),
              segmentForm.data.filters.map((filter, index) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-3", children: [
                /* @__PURE__ */ jsx("select", { value: filter.field, onChange: (e) => {
                  const filters = [...segmentForm.data.filters];
                  filters[index] = { ...filter, field: e.target.value };
                  segmentForm.setData("filters", filters);
                }, className: "h-10 rounded-btn border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: ["name", "wa_id", "email", "phone", "company", "status", "source"].map((field) => /* @__PURE__ */ jsx("option", { value: field, children: field }, field)) }),
                /* @__PURE__ */ jsx("select", { value: filter.operator, onChange: (e) => {
                  const filters = [...segmentForm.data.filters];
                  filters[index] = { ...filter, operator: e.target.value };
                  segmentForm.setData("filters", filters);
                }, className: "h-10 rounded-btn border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "is_empty", "is_not_empty"].map((operator) => /* @__PURE__ */ jsx("option", { value: operator, children: operator }, operator)) }),
                /* @__PURE__ */ jsx(TextInput, { value: filter.value || "", onChange: (e) => {
                  const filters = [...segmentForm.data.filters];
                  filters[index] = { ...filter, value: e.target.value };
                  segmentForm.setData("filters", filters);
                }, placeholder: "Value" })
              ] }, index))
            ] })
          ] })
        }
      )
    ] })
  ] });
}
export {
  SegmentsIndex as default
};
