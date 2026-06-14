import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AddonPage, StatGrid, EmptyPanel, MiniStatus, ServerListControls } from "./Shared-BnBdIg9m.js";
import { T as ThemedIconTile, M as Modal } from "./Elements-EbyZDnT_.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { Store, ShoppingBag, BadgeIndianRupee, RefreshCw, CreditCard, UserPlus, Edit3, Trash2, Plus } from "lucide-react";
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
function Ecommerce({ integrations = [], orders = [], filters = {}, pagination = null }) {
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const form = useForm({ order_number: "", customer_name: "", customer_phone: "", amount: 0, status: "pending", source: "manual", payment_url: "", recovery_status: "none", placed_at: "" });
  const totalOrders = orders.length;
  const totalRevenue = orders.filter((order) => ["paid", "fulfilled", "completed"].includes(order.status)).reduce((sum, item) => sum + item.amount, 0);
  const openCreate = () => {
    setEditing(null);
    form.setData({ order_number: "", customer_name: "", customer_phone: "", amount: 0, status: "pending", source: integrations[0]?.id || "manual", payment_url: "", recovery_status: "none", placed_at: "" });
    setOpen(true);
  };
  const openEdit = (order) => {
    setEditing(order);
    form.setData({ order_number: order.orderNumber, customer_name: order.customerName, customer_phone: order.customerPhone || "", amount: order.amount, status: order.status, source: order.source, payment_url: order.paymentUrl || "", recovery_status: order.recoveryStatus || "none", placed_at: order.placedAt ? order.placedAt.slice(0, 16) : "" });
    setOpen(true);
  };
  const save = () => {
    const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
    editing ? form.patch(route("app.ecommerce.orders.update", editing.id), options) : form.post(route("app.ecommerce.orders.store"), options);
  };
  const remove = async (order) => {
    const confirmed = await confirm({
      title: "Delete order",
      message: `Delete order ${order.orderNumber}?`,
      confirmText: "Delete order",
      variant: "danger"
    });
    if (confirmed) router.delete(route("app.ecommerce.orders.destroy", order.id), { preserveScroll: true });
  };
  const convert = (order) => {
    router.post(route("app.ecommerce.orders.contact", order.id), {}, { preserveScroll: true });
  };
  const createPaymentLink = (order) => {
    router.post(route("app.ecommerce.orders.payment-link", order.id), {}, { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Ecommerce" }),
    /* @__PURE__ */ jsxs(AddonPage, { title: "Ecommerce", description: "Manual order tracking for WhatsApp follow-ups. Imported store orders are shown only after a real store integration exists.", actions: /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
      /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
      "Add order"
    ] }), children: [
      /* @__PURE__ */ jsx(StatGrid, { stats: [
        { label: "Connected platforms", value: integrations.filter((item) => item.connected).length, icon: Store, tone: "green" },
        { label: "Orders 24h", value: totalOrders, icon: ShoppingBag, tone: "blue" },
        { label: "Revenue 24h", value: money(totalRevenue), icon: BadgeIndianRupee, tone: "amber" },
        { label: "Recovery queue", value: orders.filter((order) => order.status === "abandoned" || order.recoveryStatus === "queued").length, icon: RefreshCw, tone: "purple" }
      ] }),
      integrations.length === 0 && orders.length === 0 ? /* @__PURE__ */ jsx(EmptyPanel, { title: "Start order tracking", description: "Add orders manually. No fake Shopify, WooCommerce, Razorpay, or Cashfree order feed is displayed until a real connector is available.", action: /* @__PURE__ */ jsx(Button, { onClick: openCreate, children: "Add order" }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: integrations.map((item) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 gap-4", children: [
            /* @__PURE__ */ jsx(ThemedIconTile, { tone: item.id.includes("pay") || item.id === "cashfree" ? "amber" : "green", children: item.id.includes("pay") || item.id === "cashfree" ? /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Store, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: item.platform }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: item.store || "Workspace integration" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(MiniStatus, { status: item.connected ? "connected" : "draft" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-3 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Orders" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: item.orders })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Revenue" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: money(item.revenue) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Abandoned" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: item.abandoned })
          ] })
        ] })
      ] }) }, item.id)) }),
      /* @__PURE__ */ jsx(ServerListControls, { routeName: "app.ecommerce.index", filters, pagination, searchPlaceholder: "Search orders, customer, phone" }),
      orders.length > 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: orders.map((order) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: [
            order.orderNumber,
            " · ",
            order.customerName
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            order.customerPhone || "No phone",
            " · ",
            order.source
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: money(order.amount) }),
          /* @__PURE__ */ jsx(MiniStatus, { status: order.recoveryStatus && order.recoveryStatus !== "none" ? order.recoveryStatus : order.status }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: () => createPaymentLink(order), children: [
            /* @__PURE__ */ jsx(CreditCard, { className: "h-3.5 w-3.5" }),
            "Create link"
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", disabled: !order.customerPhone, onClick: () => convert(order), children: [
            /* @__PURE__ */ jsx(UserPlus, { className: "h-3.5 w-3.5" }),
            "Contact"
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: () => openEdit(order), children: [
            /* @__PURE__ */ jsx(Edit3, { className: "h-3.5 w-3.5" }),
            "Edit"
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => remove(order), children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
            "Delete"
          ] })
        ] })
      ] }, order.id)) }) }) }),
      /* @__PURE__ */ jsx(Modal, { open, onClose: () => setOpen(false), title: editing ? "Edit order" : "Add order", description: "Saved to this workspace.", footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { onClick: save, disabled: form.processing, children: "Save order" })
      ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Order number",
          /* @__PURE__ */ jsx(Input, { disabled: Boolean(editing), className: "mt-1", value: form.data.order_number, onChange: (e) => form.setData("order_number", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Customer",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.customer_name, onChange: (e) => form.setData("customer_name", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Phone",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.customer_phone, onChange: (e) => form.setData("customer_phone", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Amount paise",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "number", value: form.data.amount, onChange: (e) => form.setData("amount", Number(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Source",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.source, onChange: (e) => form.setData("source", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text sm:col-span-2", children: [
          "Payment link",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.payment_url, onChange: (e) => form.setData("payment_url", e.target.value), placeholder: "https://rzp.io/i/..." })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Placed at",
          /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "datetime-local", value: form.data.placed_at, onChange: (e) => form.setData("placed_at", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Status",
          /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.status, onChange: (e) => form.setData("status", e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
            /* @__PURE__ */ jsx("option", { value: "paid", children: "Paid" }),
            /* @__PURE__ */ jsx("option", { value: "fulfilled", children: "Fulfilled" }),
            /* @__PURE__ */ jsx("option", { value: "completed", children: "Completed" }),
            /* @__PURE__ */ jsx("option", { value: "abandoned", children: "Abandoned" }),
            /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" }),
            /* @__PURE__ */ jsx("option", { value: "refunded", children: "Refunded" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
          "Recovery",
          /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.recovery_status, onChange: (e) => form.setData("recovery_status", e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "none", children: "None" }),
            /* @__PURE__ */ jsx("option", { value: "queued", children: "Queued" }),
            /* @__PURE__ */ jsx("option", { value: "sent", children: "Sent" }),
            /* @__PURE__ */ jsx("option", { value: "recovered", children: "Recovered" }),
            /* @__PURE__ */ jsx("option", { value: "failed", children: "Failed" })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  Ecommerce as default
};
