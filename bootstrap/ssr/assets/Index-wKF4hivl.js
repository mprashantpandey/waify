import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle } from "./Card-8uw03vLH.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { Fragment, useState, useEffect } from "react";
import { Transition, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";
import { AlertTriangle, X, Plus, CreditCard, ToggleRight, ToggleLeft, Eye, Edit } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "axios";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
function ConfirmationDialog({
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false
}) {
  const variantStyles = {
    danger: {
      icon: "text-red-600 dark:text-red-400",
      button: "bg-red-600 hover:bg-red-700 text-white"
    },
    warning: {
      icon: "text-yellow-600 dark:text-yellow-400",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white"
    },
    info: {
      icon: "text-blue-600 dark:text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  };
  const styles = variantStyles[variant];
  return /* @__PURE__ */ jsx(Transition, { show, as: Fragment, children: /* @__PURE__ */ jsxs(Dialog, { as: "div", className: "relative z-50", onClose, children: [
    /* @__PURE__ */ jsx(
      TransitionChild,
      {
        as: Fragment,
        enter: "ease-out duration-300",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        children: /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75" })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: /* @__PURE__ */ jsx(
      TransitionChild,
      {
        as: Fragment,
        enter: "ease-out duration-300",
        enterFrom: "opacity-0 scale-95",
        enterTo: "opacity-100 scale-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100 scale-100",
        leaveTo: "opacity-0 scale-95",
        children: /* @__PURE__ */ jsx(DialogPanel, { className: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: `flex-shrink-0 ${styles.icon}`, children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx(DialogTitle, { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: title }),
              /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: message }) })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300",
                disabled: loading,
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-end gap-3", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                onClick: onClose,
                disabled: loading,
                children: cancelText
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: onConfirm,
                disabled: loading,
                className: styles.button,
                children: loading ? "Processing..." : confirmText
              }
            )
          ] })
        ] }) })
      }
    ) }) })
  ] }) });
}
function PlansIndex({ plans }) {
  const { auth, flash } = usePage().props;
  const { addToast } = useToast();
  const [confirmToggle, setConfirmToggle] = useState({
    show: false,
    planId: null,
    planName: "",
    isActive: false
  });
  useEffect(() => {
    if (flash?.success) {
      addToast({
        title: "Success",
        description: flash.success,
        variant: "success"
      });
    }
    if (flash?.error) {
      addToast({
        title: "Error",
        description: flash.error,
        variant: "error"
      });
    }
  }, [flash, addToast]);
  const handleToggle = (planId, planName, isActive) => {
    setConfirmToggle({
      show: true,
      planId,
      planName,
      isActive
    });
  };
  const confirmToggleAction = () => {
    if (confirmToggle.planId) {
      router.post(
        route("platform.plans.toggle", { plan: confirmToggle.planId }),
        {},
        {
          preserveScroll: true,
          onSuccess: () => {
            addToast({
              title: "Plan Updated",
              description: `${confirmToggle.planName} has been ${confirmToggle.isActive ? "deactivated" : "activated"}.`,
              variant: "success"
            });
            setConfirmToggle({ show: false, planId: null, planName: "", isActive: false });
          },
          onError: () => {
            addToast({
              title: "Error",
              description: "Failed to update plan status.",
              variant: "error"
            });
          }
        }
      );
    }
  };
  const formatPrice = (amount, currency) => {
    if (amount === null || amount === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD"
    }).format(amount / 100);
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Plans" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Plans" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Manage subscription plans and pricing" })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("platform.plans.create"), children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Create Plan"
        ] }) })
      ] }),
      plans.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-12 text-center", children: [
        /* @__PURE__ */ jsx(CreditCard, { className: "h-12 w-12 mx-auto text-gray-400 mb-4" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2", children: "No plans yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-4", children: "Get started by creating your first subscription plan." }),
        /* @__PURE__ */ jsx(Link, { href: route("platform.plans.create"), children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Create Plan"
        ] }) })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-6", children: plans.map((plan) => /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsx(CardTitle, { children: plan.name }),
              /* @__PURE__ */ jsx(Badge, { variant: plan.is_active ? "success" : "default", children: plan.is_active ? "Active" : "Inactive" }),
              plan.is_public && /* @__PURE__ */ jsx(Badge, { variant: "info", children: "Public" })
            ] }),
            plan.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: plan.description })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleToggle(plan.key, plan.name, plan.is_active),
                className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
                title: plan.is_active ? "Deactivate" : "Activate",
                children: plan.is_active ? /* @__PURE__ */ jsx(ToggleRight, { className: "h-5 w-5 text-green-600" }) : /* @__PURE__ */ jsx(ToggleLeft, { className: "h-5 w-5 text-gray-400" })
              }
            ),
            /* @__PURE__ */ jsx(Link, { href: route("platform.plans.show", { plan: plan.key }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", children: [
              /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
              "View"
            ] }) }),
            /* @__PURE__ */ jsx(Link, { href: route("platform.plans.edit", { plan: plan.key }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", children: [
              /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
              "Edit"
            ] }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Monthly Price" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_monthly, plan.currency) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Yearly Price" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_yearly, plan.currency) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Trial Days" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: plan.trial_days || 0 })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Subscriptions" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: plan.subscriptions_count })
          ] })
        ] }) })
      ] }, plan.id)) }),
      /* @__PURE__ */ jsx(
        ConfirmationDialog,
        {
          show: confirmToggle.show,
          onClose: () => setConfirmToggle({ show: false, planId: null, planName: "", isActive: false }),
          onConfirm: confirmToggleAction,
          title: confirmToggle.isActive ? "Deactivate Plan" : "Activate Plan",
          message: `Are you sure you want to ${confirmToggle.isActive ? "deactivate" : "activate"} "${confirmToggle.planName}"? ${confirmToggle.isActive ? "Workspaces using this plan will not be able to access it." : "This plan will become available for selection."}`,
          confirmText: confirmToggle.isActive ? "Deactivate" : "Activate",
          variant: confirmToggle.isActive ? "warning" : "info"
        }
      )
    ] })
  ] });
}
export {
  PlansIndex as default
};
