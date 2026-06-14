import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { Plus, ListChecks, CheckCircle2, Rows3, MessageSquareText, List, ToggleRight, ToggleLeft, Eye, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import { T as ThemedIconTile, I as IconButton, D as Drawer } from "./Elements-EbyZDnT_.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
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
function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function ListsIndex({
  account,
  lists,
  connections
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [drawerMode, setDrawerMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") return "create";
    if (params.get("edit") === "1") return "edit";
    if (params.get("list")) return "view";
    return null;
  });
  const [activeListId, setActiveListId] = useState(() => {
    const value = Number(new URLSearchParams(window.location.search).get("list"));
    return Number.isFinite(value) && value > 0 ? value : null;
  });
  const activeList = lists.find((list) => list.id === activeListId) || null;
  const defaultConnectionId = connections[0]?.id ?? "";
  const listForm = useForm({
    whatsapp_connection_id: defaultConnectionId,
    name: "",
    button_text: "View options",
    description: "",
    footer_text: "",
    sections: [{ title: "Options", rows: [{ id: "option_1", title: "Option 1", description: "" }] }]
  });
  const activeCount = lists.filter((list) => list.is_active).length;
  const totalSections = lists.reduce((sum, list) => sum + Number(list.sections_count || 0), 0);
  const totalRows = lists.reduce((sum, list) => sum + Number(list.total_rows || 0), 0);
  const handleToggle = async (list) => {
    setToggling(list.id);
    try {
      await router.post(route("app.whatsapp.lists.toggle", { list: list.id }), {}, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`List ${list.is_active ? "deactivated" : "activated"}`);
        },
        onError: () => {
          toast.error("Failed to update list status");
        },
        onFinish: () => setToggling(null)
      });
    } catch (error) {
      setToggling(null);
    }
  };
  const handleDelete = async (list) => {
    const confirmed = await confirm({
      title: "Delete List",
      message: `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    setDeleting(list.id);
    try {
      await router.delete(route("app.whatsapp.lists.destroy", { list: list.id }), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("List deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete list");
        },
        onFinish: () => setDeleting(null)
      });
    } catch (error) {
      setDeleting(null);
    }
  };
  const openCreate = () => {
    listForm.reset();
    listForm.setData({
      whatsapp_connection_id: defaultConnectionId,
      name: "",
      button_text: "View options",
      description: "",
      footer_text: "",
      sections: [{ title: "Options", rows: [{ id: "option_1", title: "Option 1", description: "" }] }]
    });
    setActiveListId(null);
    setDrawerMode("create");
  };
  const openList = (list, mode) => {
    setActiveListId(list.id);
    if (mode === "edit") {
      const normalizedSections = (list.sections?.length ? list.sections : [{ title: "Options", rows: [{ id: "option_1", title: "Option 1", description: "" }] }]).map((section) => ({
        title: section.title,
        rows: (section.rows || []).map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description || ""
        }))
      }));
      listForm.setData({
        whatsapp_connection_id: list.connection.id,
        name: list.name,
        button_text: list.button_text,
        description: list.description || "",
        footer_text: list.footer_text || "",
        sections: normalizedSections
      });
    }
    setDrawerMode(mode);
  };
  const closeDrawer = () => {
    setDrawerMode(null);
    setActiveListId(null);
  };
  const addRow = () => {
    const sections = [...listForm.data.sections];
    const first = sections[0] || { title: "Options", rows: [] };
    first.rows = [...first.rows || [], { id: `option_${(first.rows || []).length + 1}`, title: `Option ${(first.rows || []).length + 1}`, description: "" }];
    sections[0] = first;
    listForm.setData("sections", sections);
  };
  const submitList = () => {
    if (drawerMode === "edit" && activeList) {
      listForm.put(route("app.whatsapp.lists.update", { list: activeList.id }), {
        preserveScroll: true,
        onSuccess: closeDrawer,
        onError: () => toast.error("Failed to update list")
      });
      return;
    }
    listForm.post(route("app.whatsapp.lists.store", {}), {
      preserveScroll: true,
      onSuccess: closeDrawer,
      onError: () => toast.error("Failed to create list")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "WhatsApp Lists" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page max-w-[1600px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300", children: "WhatsApp" }),
          /* @__PURE__ */ jsx("h1", { className: "module-heading", children: "Interactive Lists" }),
          /* @__PURE__ */ jsx("p", { className: "module-subheading", children: "Reusable WhatsApp list messages with sections, rows, and quick selection flows." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "Create List"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(ListChecks, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Lists" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(lists.length) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "blue", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Active" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(activeCount) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "purple", children: /* @__PURE__ */ jsx(Rows3, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Sections" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(totalSections) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "amber", children: /* @__PURE__ */ jsx(MessageSquareText, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Rows" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(totalRows) })
          ] })
        ] }) })
      ] }),
      lists.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: List,
          title: "No lists found",
          description: "Create your first interactive list message to send to contacts.",
          action: /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Create List"
          ] })
        }
      ) }) }) : /* @__PURE__ */ jsx(Card, { className: "overflow-hidden border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50/70 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/60 dark:text-waify-dark-text-muted", children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "List" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Button" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Structure" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "WABA" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-right font-medium", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: lists.map((list) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "border-t border-gray-100 transition hover:bg-gray-50/70 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2/50",
            children: [
              /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => openList(list, "view"), className: "font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300", children: list.name }),
                list.description && /* @__PURE__ */ jsx("div", { className: "mt-1 max-w-xs truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: list.description }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  "Created ",
                  formatDate(list.created_at)
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: list.button_text }) }),
              /* @__PURE__ */ jsxs("td", { className: "whitespace-nowrap px-5 py-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                formatNumber(list.sections_count),
                " sections · ",
                formatNumber(list.total_rows),
                " rows"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-5 py-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: list.connection.name }),
              /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-5 py-3", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleToggle(list),
                  disabled: toggling === list.id,
                  className: "flex items-center gap-2",
                  children: list.is_active ? /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(ToggleRight, { className: "h-3 w-3" }),
                    "Active"
                  ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(ToggleLeft, { className: "h-3 w-3" }),
                    "Inactive"
                  ] })
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-5 py-3 text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                /* @__PURE__ */ jsx(IconButton, { size: "sm", "aria-label": "View list", onClick: () => openList(list, "view"), children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsx(IconButton, { size: "sm", "aria-label": "Edit list", onClick: () => openList(list, "edit"), children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsx(
                  IconButton,
                  {
                    size: "sm",
                    variant: "danger",
                    onClick: () => handleDelete(list),
                    disabled: deleting === list.id,
                    "aria-label": "Delete list",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ] }) })
            ]
          },
          list.id
        )) })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(
        Drawer,
        {
          open: drawerMode !== null,
          onClose: closeDrawer,
          title: drawerMode === "create" ? "Create list" : drawerMode === "edit" ? "Edit list" : activeList?.name || "List details",
          description: drawerMode === "view" ? "Preview sections and rows without leaving this page." : "Build a WhatsApp interactive list with one compact drawer.",
          className: "max-w-2xl",
          footer: drawerMode === "view" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            activeList && /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => openList(activeList, "edit"), children: [
              /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
              " Edit"
            ] }),
            /* @__PURE__ */ jsx(Button, { onClick: closeDrawer, children: "Done" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeDrawer, children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { onClick: submitList, disabled: listForm.processing, children: drawerMode === "edit" ? "Save list" : "Create list" })
          ] }),
          children: drawerMode === "view" && activeList ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: activeList.description || "No description" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsx(Badge, { variant: activeList.is_active ? "success" : "secondary", children: activeList.is_active ? "Active" : "Inactive" }),
                /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: activeList.button_text }),
                /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: activeList.connection.name })
              ] })
            ] }),
            (activeList.sections || []).map((section, sectionIndex) => /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: section.title }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: (section.rows || []).map((row) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: row.title }),
                row.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: row.description })
              ] }, row.id)) })
            ] }, sectionIndex))
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "List name" }),
                /* @__PURE__ */ jsx(TextInput, { value: listForm.data.name, onChange: (e) => listForm.setData("name", e.target.value), className: "w-full" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Button text" }),
                /* @__PURE__ */ jsx(TextInput, { value: listForm.data.button_text, onChange: (e) => listForm.setData("button_text", e.target.value), className: "w-full" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "WABA account" }),
              /* @__PURE__ */ jsx("select", { value: listForm.data.whatsapp_connection_id, onChange: (e) => listForm.setData("whatsapp_connection_id", Number(e.target.value)), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: connections.map((connection) => /* @__PURE__ */ jsx("option", { value: connection.id, children: connection.name }, connection.id)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
              /* @__PURE__ */ jsx(TextInput, { value: listForm.data.description, onChange: (e) => listForm.setData("description", e.target.value), className: "w-full" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Section title" }),
              /* @__PURE__ */ jsx(TextInput, { value: listForm.data.sections[0]?.title || "", onChange: (e) => {
                const sections = [...listForm.data.sections];
                sections[0] = { ...sections[0] || { rows: [] }, title: e.target.value };
                listForm.setData("sections", sections);
              }, className: "w-full" }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: (listForm.data.sections[0]?.rows || []).map((row, rowIndex) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2 rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsx(TextInput, { value: row.title, onChange: (e) => {
                  const sections = [...listForm.data.sections];
                  sections[0].rows[rowIndex] = { ...row, title: e.target.value, id: row.id || `option_${rowIndex + 1}` };
                  listForm.setData("sections", sections);
                }, placeholder: "Row title" }),
                /* @__PURE__ */ jsx(TextInput, { value: row.description || "", onChange: (e) => {
                  const sections = [...listForm.data.sections];
                  sections[0].rows[rowIndex] = { ...row, description: e.target.value };
                  listForm.setData("sections", sections);
                }, placeholder: "Row description" })
              ] }, rowIndex)) }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", className: "mt-3", onClick: addRow, children: "Add row" })
            ] })
          ] })
        }
      )
    ] })
  ] });
}
export {
  ListsIndex as default
};
