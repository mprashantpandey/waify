import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState, useRef, useMemo } from "react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AddonPage, StatGrid, ServerListControls, EmptyPanel } from "./Shared-BnBdIg9m.js";
import { a as Toolbar, T as ThemedIconTile, S as StatusBadge, M as Modal } from "./Elements-EbyZDnT_.js";
import { Image, Video, Music2, Copy, Trash2, Upload, FileText } from "lucide-react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "./Input-DGMAswN3.js";
import "@headlessui/react";
function MediaLibrary({ items = [], stats, filters = {}, pagination = null }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const fileRef = useRef(null);
  const uploadForm = useForm({ file: null, name: "" });
  const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const iconFor = (type) => type === "image" ? Image : type === "video" ? Video : FileText;
  const upload = (file) => {
    uploadForm.setData({ file, name: file.name });
    uploadForm.post(route("app.media-library.store"), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        uploadForm.reset();
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  };
  const remove = async (item) => {
    if (!item.deletable) return;
    const confirmed = await confirm({
      title: "Delete media",
      message: `Delete "${item.name}" from this workspace media library?`,
      confirmText: "Delete media",
      variant: "danger"
    });
    if (confirmed) router.delete(route("app.media-library.destroy", item.numericId), { preserveScroll: true, onSuccess: () => setSelected(null) });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Media Library" }),
    /* @__PURE__ */ jsxs(
      AddonPage,
      {
        title: "Media Library",
        description: "Reusable WhatsApp media pulled from inbox messages and outbound assets.",
        actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", className: "hidden", onChange: (event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
          } }),
          /* @__PURE__ */ jsxs(Button, { onClick: () => fileRef.current?.click(), disabled: uploadForm.processing, children: [
            /* @__PURE__ */ jsx(Upload, { className: "mr-2 h-4 w-4" }),
            uploadForm.processing ? "Uploading..." : "Upload media"
          ] })
        ] }),
        children: [
          /* @__PURE__ */ jsx(StatGrid, { stats: [
            { label: "Total assets", value: stats.total, icon: Image, tone: "green" },
            { label: "Images", value: stats.images, icon: Image, tone: "blue" },
            { label: "Videos", value: stats.videos, icon: Video, tone: "purple" },
            { label: "Documents & audio", value: stats.documents, icon: Music2, tone: "amber" }
          ] }),
          /* @__PURE__ */ jsx(ServerListControls, { routeName: "app.media-library.index", filters, pagination, searchPlaceholder: "Search media library" }),
          /* @__PURE__ */ jsx(Toolbar, { search: { value: search, onChange: setSearch, placeholder: "Filter current page" } }),
          filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyPanel, { title: "No media found", description: "Images, videos, documents, and audio from WhatsApp conversations will appear here once messages contain attachments." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", children: filtered.map((item) => {
            const Icon = iconFor(item.type);
            return /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSelected(item), className: "text-left", children: /* @__PURE__ */ jsx(Card, { className: "h-full transition hover:border-waify-green/50 hover:shadow-pop dark:hover:border-emerald-400/40", children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx(ThemedIconTile, { tone: item.type === "image" ? "blue" : item.type === "video" ? "purple" : "amber", size: "lg", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: item.name }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: item.size }),
                /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsx(StatusBadge, { tone: "info", children: item.type }),
                  /* @__PURE__ */ jsx(StatusBadge, { tone: "muted", children: item.usedIn })
                ] })
              ] })
            ] }) }) }) }, item.id);
          }) }),
          /* @__PURE__ */ jsx(Modal, { open: !!selected, onClose: () => setSelected(null), title: selected?.name || "Media", description: "Workspace media asset", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-44 items-center justify-center rounded-card bg-gray-50 dark:bg-waify-dark-surface-2", children: selected?.type === "image" && selected.url ? /* @__PURE__ */ jsx("img", { src: selected.url, alt: selected.name, className: "h-full w-full rounded-card object-contain" }) : selected && /* @__PURE__ */ jsx(ThemedIconTile, { tone: "blue", size: "lg", children: (() => {
              const Icon = iconFor(selected.type);
              return /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6" });
            })() }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Type" }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold capitalize", children: selected?.type })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Source" }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: selected?.usedIn })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "w-full", onClick: () => {
              navigator.clipboard?.writeText(selected?.url || String(selected?.id || ""));
              toast.success("Media reference copied");
            }, children: [
              /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
              "Copy reference"
            ] }),
            selected?.deletable && /* @__PURE__ */ jsxs(Button, { variant: "danger", className: "w-full", onClick: () => remove(selected), children: [
              /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              "Delete media"
            ] })
          ] }) })
        ]
      }
    )
  ] });
}
export {
  MediaLibrary as default
};
