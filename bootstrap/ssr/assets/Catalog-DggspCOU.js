import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AddonPage, StatGrid, EmptyPanel, ServerListControls, MiniStatus } from "./Shared-BnBdIg9m.js";
import { M as Modal, T as ThemedIconTile } from "./Elements-EbyZDnT_.js";
import { Package, Store, RefreshCw, Tag, Edit3, Trash2, ShoppingBag, Plus } from "lucide-react";
import { useState } from "react";
import { I as Input } from "./Input-DGMAswN3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "./useToast-BN7qsQL3.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value / 100);
}
function Catalog({ integration, products = [], filters = {}, pagination = null }) {
  const confirm = useConfirm();
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const form = useForm({
    name: "",
    sku: "",
    category: "",
    price: 0,
    stock: 0,
    image_url: "",
    description: "",
    status: "active"
  });
  const openCreate = () => {
    setEditing(null);
    form.reset();
    form.setData({
      name: "",
      sku: "",
      category: "",
      price: 0,
      stock: 0,
      image_url: "",
      description: "",
      status: "active"
    });
    setFormOpen(true);
  };
  const openEdit = (product) => {
    setEditing(product);
    form.setData({
      name: product.name,
      sku: product.sku || "",
      category: product.category || "",
      price: product.price || 0,
      stock: product.stock || 0,
      image_url: product.imageUrl || "",
      description: product.description || "",
      status: product.status || "active"
    });
    setFormOpen(true);
  };
  const saveProduct = () => {
    const options = { preserveScroll: true, onSuccess: () => setFormOpen(false) };
    if (editing) {
      form.patch(route("app.catalog.products.update", editing.id), options);
    } else {
      form.post(route("app.catalog.products.store"), options);
    }
  };
  const deleteProduct = async (product) => {
    const confirmed = await confirm({
      title: "Delete product",
      message: `Delete "${product.name}" from this workspace catalog?`,
      confirmText: "Delete product",
      variant: "danger"
    });
    if (confirmed) {
      router.delete(route("app.catalog.products.destroy", product.id), { preserveScroll: true });
    }
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Catalog" }),
    /* @__PURE__ */ jsxs(
      AddonPage,
      {
        title: "Catalog",
        description: "Manual workspace catalog for WhatsApp-ready product cards and campaign previews. External store sync is not enabled until a real store integration is connected.",
        actions: /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "Add product"
        ] }),
        children: [
          /* @__PURE__ */ jsx(StatGrid, { stats: [
            { label: "Products", value: products.length, icon: Package, tone: "green" },
            { label: "Connected store", value: integration ? integration.provider : "None", icon: Store, tone: integration ? "blue" : "gray" },
            { label: "Catalog health", value: integration?.health || "Setup needed", icon: RefreshCw, tone: integration ? "green" : "amber" },
            { label: "Low stock", value: products.filter((item) => item.stock < 30).length, icon: Tag, tone: "amber" }
          ] }),
          !integration && products.length === 0 && /* @__PURE__ */ jsx(EmptyPanel, { title: "Build your catalog", description: "Add products manually. This page does not show imported store data unless a real commerce integration is configured later.", action: /* @__PURE__ */ jsx(Button, { onClick: openCreate, children: "Add first product" }) }),
          /* @__PURE__ */ jsx(ServerListControls, { routeName: "app.catalog.index", filters, pagination, searchPlaceholder: "Search products, SKU, category" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", children: products.map((product) => /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxs("div", { role: "button", tabIndex: 0, onClick: () => setPreview(product), onKeyDown: (event) => {
            if (event.key === "Enter") setPreview(product);
          }, className: "block w-full cursor-pointer text-left", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-36 items-center justify-center bg-gray-50 dark:bg-waify-dark-surface-2", children: product.imageUrl ? /* @__PURE__ */ jsx("img", { src: product.imageUrl, alt: product.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-waify-green shadow-card dark:bg-waify-dark-surface", children: product.image }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("h3", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: product.name }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    product.sku,
                    " · ",
                    product.category
                  ] })
                ] }),
                /* @__PURE__ */ jsx(MiniStatus, { status: product.status || (product.stock > 0 ? "active" : "draft") })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-end justify-between", children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-waify-text dark:text-waify-dark-text", children: money(product.price) }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  product.stock,
                  " in stock"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2", onClick: (event) => event.stopPropagation(), children: [
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: () => openEdit(product), children: [
                  /* @__PURE__ */ jsx(Edit3, { className: "h-3.5 w-3.5" }),
                  "Edit"
                ] }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => deleteProduct(product), children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  "Delete"
                ] })
              ] })
            ] })
          ] }) }, product.id)) }),
          /* @__PURE__ */ jsx(Modal, { open: !!preview, onClose: () => setPreview(null), title: "WhatsApp product preview", description: preview?.name, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx("h3", { className: "mt-3 font-semibold text-waify-text dark:text-waify-dark-text", children: preview?.name }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: preview?.category }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-xl font-bold", children: money(preview?.price || 0) })
            ] }),
            /* @__PURE__ */ jsx(Button, { className: "w-full", children: "Use in campaign" })
          ] }) }),
          /* @__PURE__ */ jsx(
            Modal,
            {
              open: formOpen,
              onClose: () => setFormOpen(false),
              title: editing ? "Edit product" : "Add product",
              description: "Stored in this workspace catalog.",
              footer: /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setFormOpen(false), children: "Cancel" }),
                /* @__PURE__ */ jsx(Button, { onClick: saveProduct, disabled: form.processing, children: form.processing ? "Saving..." : "Save product" })
              ] }),
              children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Name",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.name, onChange: (e) => form.setData("name", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "SKU",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.sku, onChange: (e) => form.setData("sku", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Category",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.category, onChange: (e) => form.setData("category", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Price in paise",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "number", value: form.data.price, onChange: (e) => form.setData("price", Number(e.target.value)) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Stock",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "number", value: form.data.stock, onChange: (e) => form.setData("stock", Number(e.target.value)) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Image URL",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.image_url, onChange: (e) => form.setData("image_url", e.target.value), placeholder: "https://..." })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Description",
                  /* @__PURE__ */ jsx("textarea", { className: "waify-input mt-1 min-h-24", value: form.data.description, onChange: (e) => form.setData("description", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Status",
                  /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.status, onChange: (e) => form.setData("status", e.target.value), children: [
                    /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                    /* @__PURE__ */ jsx("option", { value: "archived", children: "Archived" })
                  ] })
                ] })
              ] })
            }
          )
        ]
      }
    )
  ] });
}
export {
  Catalog as default
};
