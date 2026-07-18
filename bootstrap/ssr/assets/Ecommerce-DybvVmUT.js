import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AddonPage, StatGrid, EmptyPanel, MiniStatus, ServerListControls } from "./Shared-BnBdIg9m.js";
import { T as ThemedIconTile, M as Modal } from "./Elements-EbyZDnT_.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { Store, ShoppingBag, BadgeIndianRupee, RefreshCw, CreditCard, PackageCheck, Truck, Bot, Send, UserPlus, Edit3, Trash2, Plus } from "lucide-react";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
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
  const connectedPlatforms = integrations.filter((item) => item.connected);
  const hasStore = connectedPlatforms.some((item) => ["shopify", "woocommerce", "meta-catalog"].includes(item.id));
  const hasOrders = orders.length > 0;
  const hasAbandoned = orders.some((order) => order.status === "abandoned");
  const hasPaymentReady = connectedPlatforms.some((item) => item.id.includes("razorpay") || item.id.includes("pay") || item.id === "cashfree") || orders.some((order) => Boolean(order.paymentUrl));
  const commercePlaybooks = [
    {
      title: "Catalog messages",
      description: "Sync products, then send Meta product cards and product lists from the inbox.",
      status: hasStore ? "ready" : "setup",
      icon: ShoppingBag,
      action: "Manage catalog",
      routeName: "app.catalog.index"
    },
    {
      title: "Abandoned cart recovery",
      description: "Track abandoned orders, create payment links, and trigger recovery flows from automations.",
      status: hasAbandoned ? "ready" : hasOrders ? "setup" : "missing",
      icon: RefreshCw,
      action: hasOrders ? "Create recovery flow" : "Add order",
      onClick: hasOrders ? () => router.visit(route("app.chatbots.index", { panel: "create" })) : openCreate
    },
    {
      title: "Payment reminders",
      description: "Use Razorpay payment links and template follow-ups for pending or unpaid orders.",
      status: hasPaymentReady ? "ready" : "setup",
      icon: CreditCard,
      action: hasPaymentReady ? "Open templates" : "Connect payments",
      routeName: hasPaymentReady ? "app.whatsapp.templates.index" : "app.integrations.index"
    },
    {
      title: "Order confirmation",
      description: "Create a template for paid orders and use automation or campaigns for confirmations.",
      status: hasOrders ? "setup" : "missing",
      icon: PackageCheck,
      action: "Create template",
      routeName: "app.whatsapp.templates.index"
    },
    {
      title: "Shipping updates",
      description: "Use order status and tracking fields to send dispatch and delivery updates.",
      status: hasOrders ? "setup" : "missing",
      icon: Truck,
      action: "Open automations",
      routeName: "app.chatbots.index"
    },
    {
      title: "Post-purchase AI support",
      description: "Route order questions to an AI support agent with handoff rules for refunds or returns.",
      status: "setup",
      icon: Bot,
      action: "Open AI agents",
      routeName: "app.ai.index"
    }
  ];
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Ecommerce" }),
    /* @__PURE__ */ jsxs(AddonPage, { title: "Ecommerce", description: "Catalog, order, payment, and recovery workflows for WhatsApp commerce.", actions: /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
      /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
      "Add order"
    ] }), children: [
      /* @__PURE__ */ jsx(StatGrid, { stats: [
        { label: "Connected platforms", value: connectedPlatforms.length, icon: Store, tone: "green" },
        { label: "Orders 24h", value: totalOrders, icon: ShoppingBag, tone: "blue" },
        { label: "Revenue 24h", value: money(totalRevenue), icon: BadgeIndianRupee, tone: "amber" },
        { label: "Recovery queue", value: orders.filter((order) => order.status === "abandoned" || order.recoveryStatus === "queued").length, icon: RefreshCw, tone: "purple" }
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: "Commerce playbooks" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Packaged WhatsApp commerce workflows. Each card shows the setup path instead of hiding commerce work across catalog, templates, automations, and inbox." })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => router.visit(route("app.integrations.index", { category: "commerce" })), children: [
            /* @__PURE__ */ jsx(Store, { className: "h-4 w-4" }),
            "Commerce integrations"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: commercePlaybooks.map((playbook) => {
          const Icon = playbook.icon;
          const status = playbook.status === "ready" ? { label: "Ready", className: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30" } : playbook.status === "missing" ? { label: "Needs data", className: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30" } : { label: "Setup", className: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/30" };
          return /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50/70 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsx(ThemedIconTile, { tone: playbook.status === "ready" ? "green" : playbook.status === "missing" ? "amber" : "blue", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${status.className}`, children: status.label })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 font-semibold text-waify-text dark:text-waify-dark-text", children: playbook.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 min-h-12 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: playbook.description }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                size: "sm",
                variant: "secondary",
                className: "mt-3",
                onClick: () => playbook.onClick ? playbook.onClick() : playbook.routeName ? router.visit(route(playbook.routeName)) : void 0,
                children: [
                  playbook.title.includes("Payment") ? /* @__PURE__ */ jsx(CreditCard, { className: "h-3.5 w-3.5" }) : playbook.title.includes("Catalog") ? /* @__PURE__ */ jsx(ShoppingBag, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
                  playbook.action
                ]
              }
            )
          ] }, playbook.title);
        }) })
      ] }) }),
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
