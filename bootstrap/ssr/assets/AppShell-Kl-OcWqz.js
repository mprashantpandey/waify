import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { ExternalLink, ChevronsUpDown, X, ChevronRight, ChevronLeft, GitBranch, PhoneCall, Store, Bell, Radio, Image, ClipboardList, Calendar, Target, ShoppingBag, History, Code2, Shield, HelpCircle, Plug, CalendarRange, Link2, Layout, Wrench, Workflow, Layers, FolderOpen, Tag, List, Building2, Megaphone, Activity, Users, Settings, LifeBuoy, CreditCard, BarChart3, Zap, Sparkles, Bot, Inbox, FileText, MessageCircle, Puzzle, LayoutDashboard, Search, Menu, Plus, ChevronDown, User, Keyboard, LogOut, Loader2, Check, Wand2, Reply, Tags, MessageSquareText } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import { a as BrandLogo, T as ThemeToggle, B as BrandingWrapper } from "./BrandingWrapper-CZn0jBQL.js";
import axios from "axios";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { A as Avatar } from "./Elements-EbyZDnT_.js";
import { C as CookieConsentBanner, A as AnalyticsScripts } from "./CookieConsentBanner-X10ew4Dy.js";
import { u as useRealtime } from "./RealtimeProvider-D1qLzQY9.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
const iconMap = {
  LayoutDashboard,
  Puzzle,
  MessageCircle,
  FileText,
  Inbox,
  Bot,
  Sparkles,
  Zap,
  BarChart3,
  CreditCard,
  LifeBuoy,
  Settings,
  Users,
  Activity,
  Megaphone,
  Building2,
  List,
  Tag,
  FolderOpen,
  Layers,
  Workflow,
  Wrench,
  Layout,
  Link2,
  CalendarRange,
  Plug,
  HelpCircle,
  Shield,
  Code2,
  History,
  ShoppingBag,
  Target,
  Calendar,
  ClipboardList,
  ExternalLink,
  Image,
  Radio,
  Bell,
  Store,
  PhoneCall,
  GitBranch,
  ChevronsUpDown
};
const sectionOrder = [
  "Main",
  "CRM & Sales",
  "Grow",
  "Tools & Widgets",
  "Connect",
  "Inbox tools",
  "Support",
  "Platform",
  "Workspace"
];
const navPlacement = {
  "app.dashboard": { section: "Main", order: 10, icon: "LayoutDashboard", label: "Dashboard" },
  "app.whatsapp.conversations.index": { section: "Main", order: 20, icon: "MessageCircle", label: "Inbox" },
  "app.whatsapp.templates.index": { section: "Main", order: 30, icon: "FileText", label: "Templates" },
  "app.broadcasts.index": { section: "Main", order: 40, icon: "Megaphone", label: "Campaigns" },
  "app.billing.index": { section: "Main", order: 50, icon: "CreditCard", label: "Billing" },
  "app.whatsapp.connections.index": { section: "Main", order: 60, icon: "Link2", label: "WABA Account" },
  "app.contacts.index": { section: "Main", order: 70, icon: "Users", label: "Contacts" },
  "app.contacts.segments.index": { section: "Main", order: 80, icon: "Layers", label: "Segments" },
  "app.chatbots.index": { section: "Grow", order: 10, icon: "Workflow", label: "Automation" },
  "app.analytics.index": { section: "Grow", order: 30, icon: "BarChart3", label: "Analytics" },
  "app.ai.index": { section: "Grow", order: 40, icon: "Sparkles", label: "AI Assistant" },
  "app.whatsapp-calls.index": { section: "Grow", order: 45, icon: "PhoneCall", label: "WhatsApp Calls" },
  "app.modules": { section: "Tools & Widgets", order: 10, icon: "Wrench", label: "Tools" },
  "app.floaters": { section: "Tools & Widgets", order: 20, icon: "Layout", label: "Widgets" },
  "app.channels.index": { section: "Tools & Widgets", order: 30, icon: "Radio", label: "Channels" },
  "app.media-library.index": { section: "Tools & Widgets", order: 40, icon: "Image", label: "Media Library" },
  "app.catalog.index": { section: "Tools & Widgets", order: 50, icon: "Store", label: "Catalog" },
  "app.ecommerce.index": { section: "Tools & Widgets", order: 60, icon: "ShoppingBag", label: "Ecommerce" },
  "app.meta-leads.index": { section: "Tools & Widgets", order: 70, icon: "Target", label: "Meta Leads" },
  "app.appointments.index": { section: "Tools & Widgets", order: 80, icon: "Calendar", label: "Appointments" },
  "app.surveys.index": { section: "Tools & Widgets", order: 90, icon: "ClipboardList", label: "Surveys" },
  "app.integrations.index": { section: "Tools & Widgets", order: 100, icon: "Plug", label: "Integrations" },
  "app.developer.index": { section: "Tools & Widgets", order: 110, icon: "Code2", label: "Developer" },
  "app.notifications.index": { section: "Tools & Widgets", order: 120, icon: "Bell", label: "Notifications" },
  "app.quick-replies.index": { section: "Inbox tools", order: 10, icon: "Zap", label: "Quick Replies" },
  "app.whatsapp.lists.index": { section: "Inbox tools", order: 20, icon: "List", label: "Interactive Lists" },
  "app.whatsapp.flows.index": { section: "Inbox tools", order: 30, icon: "GitBranch", label: "WhatsApp Flows" },
  "app.support.index": { section: "Support", order: 10, icon: "LifeBuoy", label: "Support" },
  "platform.dashboard": { section: "Platform", order: 10, icon: "Shield", label: "Platform admin" },
  "platform.accounts.index": { section: "Platform", order: 20, icon: "Building2", label: "Tenants" },
  "platform.users.index": { section: "Platform", order: 30, icon: "Users", label: "Users" },
  "platform.plans.index": { section: "Platform", order: 40, icon: "CreditCard", label: "Plans" },
  "platform.modules.index": { section: "Platform", order: 50, icon: "Puzzle", label: "Modules" },
  "platform.subscriptions.index": { section: "Platform", order: 60, icon: "FileText", label: "Subscriptions" },
  "platform.discounts.index": { section: "Platform", order: 70, icon: "Tag", label: "Discounts" },
  "platform.transactions.index": { section: "Platform", order: 80, icon: "CreditCard", label: "Transactions" },
  "platform.analytics": { section: "Platform", order: 90, icon: "BarChart3", label: "Analytics" },
  "platform.templates.index": { section: "Platform", order: 100, icon: "FileText", label: "Templates" },
  "platform.support.index": { section: "Platform", order: 110, icon: "LifeBuoy", label: "Support" },
  "platform.activity-logs": { section: "Platform", order: 120, icon: "History", label: "Audit logs" },
  "platform.system-health": { section: "Platform", order: 130, icon: "Shield", label: "System health" },
  "platform.settings": { section: "Platform", order: 140, icon: "Settings", label: "Settings" },
  "app.workspaces.index": { section: "Workspace", order: 10, icon: "Building2", label: "Workspaces" },
  "app.team.index": { section: "Workspace", order: 20, icon: "Users", label: "Team" },
  "app.activity-logs": { section: "Workspace", order: 30, icon: "History", label: "Activity" },
  "app.settings": { section: "Workspace", order: 50, icon: "Settings", label: "Settings" }
};
const hiddenUntilRealImplementation = /* @__PURE__ */ new Set([
  "app.catalog.index",
  "app.ecommerce.index",
  "app.surveys.index"
]);
function Sidebar({ navigation, currentRoute, account, isOpen = false, onClose, onCollapseChange }) {
  const { auth, inbox_summary } = usePage().props;
  const user = auth?.user;
  const inboxUnread = Number(inbox_summary?.unread || 0);
  const [collapsed, setCollapsed] = useState(false);
  const tryRouteHref = (routeName) => {
    try {
      return route(routeName, {});
    } catch (error) {
      return null;
    }
  };
  const resolveRouteHref = (routeName) => {
    const direct = tryRouteHref(routeName);
    if (direct) {
      return direct;
    }
    if (routeName.endsWith(".index")) {
      return tryRouteHref(routeName.slice(0, -".index".length));
    }
    return tryRouteHref(`${routeName}.index`);
  };
  const marketingHref = tryRouteHref("landing") || "/";
  const profileHref = tryRouteHref("app.settings") ? `${tryRouteHref("app.settings")}?tab=profile` : "#";
  resolveRouteHref("app.billing.index") || "#";
  const accountDescriptor = account?.subscription?.plan?.name || account?.plan?.name || account?.workspace_type_label || account?.workspace_type || "Workspace";
  const safeNavigation = navigation.reduce((items, item) => {
    if (hiddenUntilRealImplementation.has(item.href)) {
      return items;
    }
    if (!item.href || items.some((existing) => existing.href === item.href)) {
      return items;
    }
    items.push(item);
    return items;
  }, []);
  if (auth?.user?.is_super_admin) {
    [
      "platform.dashboard",
      "platform.accounts.index",
      "platform.users.index",
      "platform.plans.index",
      "platform.modules.index",
      "platform.subscriptions.index",
      "platform.discounts.index",
      "platform.transactions.index",
      "platform.analytics",
      "platform.templates.index",
      "platform.support.index",
      "platform.notifications.index",
      "platform.activity-logs",
      "platform.system-health",
      "platform.settings"
    ].forEach((href) => {
      const placement = navPlacement[href];
      if (placement && !safeNavigation.some((item) => item.href === href)) {
        safeNavigation.push({
          label: placement.label || href,
          href,
          icon: placement.icon || "Shield",
          group: "Platform"
        });
      }
    });
  }
  const sections = safeNavigation.reduce((acc, item) => {
    const placement = navPlacement[item.href] ?? {
      section: item.group || "Workspace",
      order: 100
    };
    if (!acc[placement.section]) {
      acc[placement.section] = [];
    }
    acc[placement.section].push({
      ...item,
      label: placement.label ?? item.label,
      icon: placement.icon ?? item.icon,
      order: placement.order
    });
    return acc;
  }, {});
  const orderedSections = sectionOrder.map((label) => ({
    label,
    items: (sections[label] || []).sort((a, b) => a.order - b.order)
  })).filter((section) => section.items.length > 0);
  const isCurrentPath = (href) => {
    try {
      const pathname = new URL(href, window.location.origin).pathname;
      return currentRoute === pathname || currentRoute.startsWith(`${pathname}/`);
    } catch (error) {
      return false;
    }
  };
  const renderNavItem = (item, index) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;
    const resolved = resolveRouteHref(item.href);
    const unreadCount = item.href === "app.whatsapp.conversations.index" ? inboxUnread : 0;
    if (!resolved) {
      return null;
    }
    const isActive = isCurrentPath(resolved);
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href: resolved,
        className: cn(
          "relative flex items-center h-10 rounded-btn text-sm transition-all group",
          collapsed ? "lg:justify-center lg:px-2 px-3" : "px-3",
          isActive ? "bg-waify-green/15 text-waify-green font-semibold" : "text-white/70 hover:bg-white/5 hover:text-white"
        ),
        title: collapsed ? item.label : void 0,
        children: [
          isActive && /* @__PURE__ */ jsx("span", { className: "absolute left-0 top-2 bottom-2 w-0.5 bg-waify-green rounded-full" }),
          /* @__PURE__ */ jsx(Icon, { className: cn(
            "h-[18px] w-[18px] transition-transform duration-200",
            collapsed ? "lg:mr-0 mr-3" : "mr-3",
            isActive ? "text-waify-green" : "text-white/60 group-hover:text-white"
          ) }),
          /* @__PURE__ */ jsx("span", { className: cn(
            "flex-1 text-left",
            collapsed ? "lg:hidden" : "",
            isActive ? "font-semibold" : "font-medium"
          ), children: item.label }),
          unreadCount > 0 && /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-waify-green px-1.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-black/20",
                collapsed ? "lg:absolute lg:right-1 lg:top-1 lg:h-4 lg:min-w-4 lg:px-1 lg:text-[9px]" : ""
              ),
              children: unreadCount > 99 ? "99+" : unreadCount
            }
          )
        ]
      },
      `${item.href}-${item.label}-${index}`
    );
  };
  const sidebarContent = /* @__PURE__ */ jsx("nav", { className: cn("min-h-0 flex-1 overflow-y-auto py-4 space-y-4 waify-scrollbar", collapsed ? "lg:px-2 px-3" : "px-3"), children: orderedSections.map((section) => {
    const validItems = section.items.map(renderNavItem).filter((item) => item !== null);
    if (validItems.length === 0) {
      return null;
    }
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: cn("px-3 text-[10px] font-bold text-white/35 uppercase tracking-wider mb-1.5", collapsed ? "lg:hidden" : ""), children: section.label }),
      /* @__PURE__ */ jsx("div", { className: "space-y-0.5", children: validItems })
    ] }, section.label);
  }).filter(Boolean) });
  const sidebarFooter = /* @__PURE__ */ jsxs("div", { className: cn("flex-shrink-0 border-t border-white/5 py-3", collapsed ? "lg:px-2 px-3" : "px-3"), children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: marketingHref,
        className: cn(
          "mb-2 flex w-full items-center gap-3 rounded-btn px-1.5 py-2 text-white/60 transition hover:bg-white/5 hover:text-white/90",
          collapsed ? "lg:justify-center" : ""
        ),
        title: "View marketing site",
        children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: cn("h-4 w-4 shrink-0", collapsed ? "lg:mx-auto" : "") }),
          /* @__PURE__ */ jsx("span", { className: cn("flex-1 text-xs", collapsed ? "lg:hidden" : ""), children: "Marketing site" })
        ]
      }
    ),
    user && /* @__PURE__ */ jsxs(
      Link,
      {
        href: profileHref,
        className: cn(
          "flex w-full items-center gap-3 rounded-btn p-1.5 transition hover:bg-white/5",
          collapsed ? "lg:justify-center" : ""
        ),
        title: collapsed ? user.name : void 0,
        children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-waify-green text-sm font-bold text-white ring-2 ring-white/10", children: (user.name || "U").split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") }),
          /* @__PURE__ */ jsxs("span", { className: cn("min-w-0 flex-1 text-left", collapsed ? "lg:hidden" : ""), children: [
            /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium text-white", children: user.name }),
            /* @__PURE__ */ jsx("span", { className: "block truncate text-[11px] text-white/50", children: accountDescriptor })
          ] }),
          /* @__PURE__ */ jsx(ChevronsUpDown, { className: cn("h-3.5 w-3.5 shrink-0 text-white/50", collapsed ? "lg:hidden" : "") })
        ]
      }
    )
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-waify-sidebar text-white transform transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex h-16 flex-shrink-0 items-center justify-between px-5 border-b border-white/5", children: [
            /* @__PURE__ */ jsx(BrandLogo, { variant: "dark", fallbackTextClassName: "text-white" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "p-2 rounded-lg hover:bg-white/10 transition-colors",
                "aria-label": "Close sidebar",
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-white/70", "aria-hidden": true })
              }
            )
          ] }),
          sidebarContent,
          sidebarFooter
        ]
      }
    ),
    /* @__PURE__ */ jsxs("aside", { className: cn("hidden min-h-0 lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-waify-sidebar text-white transition-all duration-300", collapsed ? "lg:w-16" : "lg:w-60"), children: [
      /* @__PURE__ */ jsx("div", { className: cn("h-16 flex flex-shrink-0 items-center border-b border-white/5", collapsed ? "justify-center px-2" : "px-5"), children: /* @__PURE__ */ jsx(
        BrandLogo,
        {
          variant: "dark",
          compact: collapsed,
          fallbackTextClassName: "text-white"
        }
      ) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            const nextCollapsed = !collapsed;
            setCollapsed(nextCollapsed);
            onCollapseChange?.(nextCollapsed);
          },
          "aria-label": "Toggle sidebar",
          className: "hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-pop ring-1 ring-gray-200 items-center justify-center hover:bg-gray-50 text-waify-text z-10",
          children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
        }
      ),
      sidebarContent,
      sidebarFooter
    ] })
  ] });
}
function Topbar({ user, onMenuClick }) {
  const { flash, impersonation, workspaces, accounts, workspace, account, notification_summary } = usePage().props;
  const workspaceList = Array.isArray(workspaces) ? workspaces : accounts;
  const currentWorkspace = workspace || account;
  const showWorkspaceSwitcher = Boolean(currentWorkspace && !user?.is_super_admin);
  const currentRoute = typeof window !== "undefined" ? window.location.pathname : "";
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const tryRoute = (routeName, params = {}) => {
    try {
      return route(routeName, params);
    } catch (error) {
      return null;
    }
  };
  const routeTitles = [
    { route: "app.dashboard", title: "Dashboard", subtitle: "Workspace performance and next actions" },
    { route: "app.whatsapp.conversations.index", title: "Inbox", subtitle: "Manage customer conversations" },
    { route: "app.whatsapp.templates.index", title: "Templates", subtitle: "Create and sync Meta message templates" },
    { route: "app.whatsapp.templates.library", title: "Template library", subtitle: "Start from Meta-ready template structures" },
    { route: "app.broadcasts.index", title: "Campaigns", subtitle: "Broadcasts, scheduling, and delivery health" },
    { route: "app.contacts.index", title: "Contacts", subtitle: "Audience records, tags, and segments" },
    { route: "app.contacts.segments.index", title: "Segments", subtitle: "Dynamic audience groups" },
    { route: "app.whatsapp.connections.index", title: "WABA Account", subtitle: "Meta WABA, phone numbers, and webhook status" },
    { route: "app.billing.index", title: "Billing", subtitle: "Plan, usage, wallet, and invoices" },
    { route: "app.workspaces.index", title: "Workspaces", subtitle: "Switch brands, clients, and teams" },
    { route: "app.settings", title: "Settings", subtitle: "Workspace preferences and security" },
    { route: "app.activity-logs", title: "Activity", subtitle: "Recent workspace events" },
    { route: "app.notifications.index", title: "Notifications", subtitle: "Workspace alerts and operational follow-ups" },
    { route: "app.team.index", title: "Team", subtitle: "Members, roles, and invitations" },
    { route: "app.modules", title: "Tools", subtitle: "QR codes, links, validators, and utilities" },
    { route: "app.floaters", title: "Widgets", subtitle: "WhatsApp floaters and website embeds" },
    { route: "app.developer.index", title: "Developer", subtitle: "API reference, webhooks, and usage ledger" },
    { route: "app.whatsapp-calls.index", title: "WhatsApp Calls", subtitle: "Enable, diagnose, and route WABA calls" },
    { route: "app.quick-replies.index", title: "Quick Replies", subtitle: "Reusable replies for inbox agents" },
    { route: "app.whatsapp.flows.index", title: "WhatsApp Flows", subtitle: "Create, sync, validate, and publish Meta Flows" },
    { route: "app.support.index", title: "Support", subtitle: "Tickets and customer support" },
    { route: "platform.dashboard", title: "Platform admin", subtitle: "System-wide operations and health" },
    { route: "platform.accounts.index", title: "Tenants", subtitle: "Workspace and tenant management" },
    { route: "platform.users.index", title: "Users", subtitle: "Platform users and permissions" },
    { route: "platform.plans.index", title: "Plans", subtitle: "Plan catalog, pricing, and limits" },
    { route: "platform.modules.index", title: "Modules", subtitle: "Feature modules and availability" },
    { route: "platform.subscriptions.index", title: "Subscriptions", subtitle: "Customer subscriptions and status" },
    { route: "platform.discounts.index", title: "Discounts", subtitle: "Promo and billing discount rules" },
    { route: "platform.transactions.index", title: "Transactions", subtitle: "Wallet, invoices, and payment records" },
    { route: "platform.analytics", title: "Platform analytics", subtitle: "System usage and growth metrics" },
    { route: "platform.templates.index", title: "Template library", subtitle: "Platform message template oversight" },
    { route: "platform.support.index", title: "Support inbox", subtitle: "Customer tickets and assistance" },
    { route: "platform.activity-logs", title: "Audit logs", subtitle: "System events and admin activity" },
    { route: "platform.notifications.index", title: "Notifications", subtitle: "Platform alerts and incident signals" },
    { route: "platform.system-health", title: "System health", subtitle: "Infrastructure and integration status" },
    { route: "platform.settings", title: "Platform settings", subtitle: "Branding, payments, support, and compliance" }
  ].map((item) => ({ ...item, href: tryRoute(item.route) })).filter((item) => item.href);
  const activeMeta = routeTitles.sort((a, b) => String(b.href).length - String(a.href).length).find((item) => {
    const pathname = new URL(String(item.href), currentOrigin).pathname;
    return currentRoute === pathname || currentRoute.startsWith(`${pathname}/`);
  });
  const title = activeMeta?.title || (user?.is_super_admin ? "Platform admin" : "Workspace");
  const subtitle = activeMeta?.subtitle;
  const hideRouteTitle = activeMeta?.route === "app.settings" || activeMeta?.route === "app.whatsapp.connections.index";
  const notificationHref = user?.is_super_admin ? tryRoute("platform.notifications.index") : tryRoute("app.notifications.index");
  const notificationItems = [
    flash?.success ? { tone: "success", title: flash.success, time: "Now" } : null,
    flash?.warning ? { tone: "warning", title: flash.warning, time: "Now" } : null,
    flash?.error ? { tone: "danger", title: flash.error, time: "Now" } : null,
    flash?.info ? { tone: "info", title: flash.info, time: "Now" } : null,
    ...(notification_summary?.latest || []).map((item) => ({
      tone: item.severity === "critical" ? "danger" : item.severity === "warning" ? "warning" : item.severity === "success" ? "success" : "info",
      title: item.title,
      body: item.body,
      time: item.created_at ? new Date(item.created_at).toLocaleString() : "",
      href: item.action_url || notificationHref
    }))
  ].filter(Boolean);
  const unreadNotifications = Number(notification_summary?.unread || 0);
  const campaignIndexHref = tryRoute("app.broadcasts.index");
  const campaignCreateHref = campaignIndexHref ? `${campaignIndexHref}?panel=create` : null;
  const helpHref = user?.is_super_admin ? tryRoute("platform.support.index") : tryRoute("app.support.index");
  return /* @__PURE__ */ jsx("header", { className: "app-header relative z-[120] h-16 flex-shrink-0 border-b border-waify-border bg-white/95 px-4 backdrop-blur dark:border-waify-dark-border dark:bg-waify-dark-surface/95 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full items-center gap-2 sm:gap-4", children: [
    mobileSearchOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-2 border-b border-waify-border bg-white px-4 dark:border-waify-dark-border dark:bg-waify-dark-surface md:hidden", children: [
      /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 shrink-0 text-gray-400" }),
      /* @__PURE__ */ jsx(GlobalSearchInput, { mobile: true, autoFocus: true, onClose: () => setMobileSearchOpen(false) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setMobileSearchOpen(false),
          className: "flex h-9 w-9 items-center justify-center rounded-btn text-waify-text-muted hover:bg-gray-100 dark:hover:bg-waify-dark-surface-2",
          "aria-label": "Close search",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-3 lg:flex-none", children: [
      onMenuClick && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onMenuClick,
          className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-waify-text transition-colors hover:bg-gray-100 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2 lg:hidden",
          "aria-label": "Open menu",
          children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5", "aria-hidden": true })
        }
      ),
      !hideRouteTitle && /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsx("h1", { className: "truncate text-base font-semibold leading-tight text-waify-text dark:text-waify-dark-text sm:text-lg", children: title }),
          showWorkspaceSwitcher && /* @__PURE__ */ jsx(
            WorkspaceSwitcher,
            {
              currentWorkspace,
              workspaceList: workspaceList || [],
              compact: true,
              onSwitch: (id) => router.post(route("app.accounts.switch", { account: id }))
            }
          )
        ] }),
        subtitle && /* @__PURE__ */ jsx("p", { className: "mt-0.5 hidden truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted sm:block", children: subtitle })
      ] })
    ] }),
    showWorkspaceSwitcher && /* @__PURE__ */ jsx(
      WorkspaceSwitcher,
      {
        currentWorkspace,
        workspaceList: workspaceList || [],
        onSwitch: (id) => router.post(route("app.accounts.switch", { account: id }))
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mx-auto hidden max-w-xl flex-1 md:block", children: /* @__PURE__ */ jsx(GlobalSearchInput, {}) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 md:hidden" }),
    /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-1 sm:gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setMobileSearchOpen(true),
          className: "flex h-9 w-9 items-center justify-center rounded-btn text-gray-600 transition hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 md:hidden",
          "aria-label": "Search",
          children: /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setShowNotifications((value) => !value);
              setShowUserMenu(false);
            },
            className: "relative flex h-10 w-10 items-center justify-center rounded-btn text-gray-600 transition hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2",
            "aria-label": "Notifications",
            children: [
              /* @__PURE__ */ jsx(Bell, { className: "h-[18px] w-[18px]" }),
              unreadNotifications > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-waify-dark-surface", children: unreadNotifications > 99 ? "99+" : unreadNotifications })
            ]
          }
        ),
        showNotifications && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10", onClick: () => setShowNotifications(false) }),
          /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-12 z-20 w-80 overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Notifications" }),
              notificationHref && /* @__PURE__ */ jsx(
                Link,
                {
                  href: notificationHref,
                  className: "text-xs font-medium text-waify-green-dark hover:underline dark:text-emerald-200",
                  children: "View all"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "max-h-96 overflow-y-auto py-1", children: notificationItems.length > 0 ? notificationItems.map((notification, index) => /* @__PURE__ */ jsxs(Link, { href: notification.href || notificationHref || "#", className: "flex gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2", children: [
              /* @__PURE__ */ jsx("span", { className: cn(
                "mt-1 h-2 w-2 shrink-0 rounded-full",
                notification.tone === "success" && "bg-emerald-500",
                notification.tone === "warning" && "bg-amber-500",
                notification.tone === "danger" && "bg-red-500",
                notification.tone === "info" && "bg-waify-green"
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "leading-snug text-waify-text dark:text-waify-dark-text", children: notification.title }),
                notification.body && /* @__PURE__ */ jsx("p", { className: "mt-0.5 line-clamp-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: notification.body }),
                /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: notification.time })
              ] })
            ] }, `${notification.tone}-${index}`)) : /* @__PURE__ */ jsxs("div", { className: "px-4 py-8 text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200", children: /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "No new notifications" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Recent activity appears here after actions complete." })
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(ThemeToggle, {}),
      helpHref && /* @__PURE__ */ jsx(
        Link,
        {
          href: helpHref,
          className: "hidden h-10 w-10 items-center justify-center rounded-btn text-gray-600 transition hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 md:flex",
          "aria-label": "Help",
          children: /* @__PURE__ */ jsx(HelpCircle, { className: "h-[18px] w-[18px]" })
        }
      ),
      campaignCreateHref && !user?.is_super_admin && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: campaignCreateHref,
            className: "hidden h-10 items-center gap-2 rounded-btn bg-waify-green px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-waify-green-dark sm:inline-flex",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "New Campaign"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: campaignCreateHref,
            className: "flex h-9 w-9 items-center justify-center rounded-btn bg-waify-green text-white shadow-sm transition hover:bg-waify-green-dark sm:hidden",
            "aria-label": "New campaign",
            children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })
          }
        )
      ] }),
      user && /* @__PURE__ */ jsxs("div", { className: "relative sm:pl-1", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setShowUserMenu((value) => !value);
              setShowNotifications(false);
            },
            className: "flex items-center gap-2 rounded-btn p-1 transition hover:bg-gray-100 dark:hover:bg-waify-dark-surface-2 sm:pr-2",
            children: [
              /* @__PURE__ */ jsx(Avatar, { name: user.name, size: "sm" }),
              /* @__PURE__ */ jsx(ChevronDown, { className: "hidden h-3.5 w-3.5 text-gray-400 sm:block" })
            ]
          }
        ),
        showUserMenu && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "fixed inset-0 z-10",
              onClick: () => setShowUserMenu(false)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-12 z-20 w-64 overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
            /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-4 py-3 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(Avatar, { name: user.name }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: user.name }),
                /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: user.email })
              ] }),
              user.is_super_admin && /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "flex items-center gap-1 px-2 py-0.5 text-xs", children: [
                /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
                "Admin"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "py-1", children: [
              user.is_super_admin && /* @__PURE__ */ jsx(TopbarMenuLink, { href: route("platform.dashboard"), icon: /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }), children: "Platform Panel" }),
              /* @__PURE__ */ jsx(TopbarMenuLink, { href: `${route("app.settings")}?tab=profile`, icon: /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }), children: "Profile" }),
              !user.is_super_admin && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(TopbarMenuLink, { href: route("app.billing.index"), icon: /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }), children: "Billing" }),
                /* @__PURE__ */ jsx(TopbarMenuLink, { href: route("app.team.index"), icon: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), children: "Team" })
              ] }),
              /* @__PURE__ */ jsxs("button", { className: "flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-waify-text transition hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx(Keyboard, { className: "h-4 w-4 text-gray-500 dark:text-waify-dark-text-muted" }),
                "Keyboard shortcuts"
              ] }),
              helpHref && /* @__PURE__ */ jsx(TopbarMenuLink, { href: helpHref, icon: /* @__PURE__ */ jsx(LifeBuoy, { className: "h-4 w-4" }), children: "Support" })
            ] }),
            impersonation?.active && /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 py-1 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("impersonate.leave"),
                method: "post",
                className: "flex items-center gap-3 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20",
                children: [
                  /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
                  "Stop Impersonation"
                ]
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 py-1 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("logout"),
                method: "post",
                className: "flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
                children: [
                  /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                  "Sign out"
                ]
              }
            ) })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function WorkspaceSwitcher({
  currentWorkspace,
  workspaceList,
  compact = false,
  onSwitch
}) {
  const [open, setOpen] = useState(false);
  const workspaceInitial = currentWorkspace?.name?.charAt(0)?.toUpperCase() || "W";
  return /* @__PURE__ */ jsxs("div", { className: cn("relative shrink-0", compact ? "lg:hidden" : "hidden lg:block"), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((value) => !value),
        "aria-label": "Switch workspace",
        className: cn(
          "flex items-center gap-2 rounded-btn border border-waify-border bg-gray-50 transition hover:bg-white dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:hover:bg-waify-dark-surface",
          compact ? "h-8 max-w-[140px] pl-1.5 pr-2" : "h-9 max-w-[220px] pl-2 pr-2.5"
        ),
        children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-waify-green text-[10px] font-bold text-white", children: workspaceInitial }),
          /* @__PURE__ */ jsx("span", { className: cn("truncate font-medium text-waify-text dark:text-waify-dark-text", compact ? "text-xs" : "text-sm"), children: currentWorkspace?.name || "Workspace" }),
          /* @__PURE__ */ jsx(ChevronsUpDown, { className: cn("shrink-0 text-gray-400", compact ? "h-3 w-3" : "h-3.5 w-3.5") })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[125]", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxs("div", { className: cn(
        "absolute z-[140] overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface",
        compact ? "left-0 top-10 w-[min(100vw-2rem,18rem)] origin-top" : "left-0 top-11 w-72 origin-top-left"
      ), children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-3 py-2 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Switch workspace" }) }),
        /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto py-1", children: workspaceList.map((workspace) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setOpen(false);
              onSwitch(workspace.id);
            },
            className: cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2",
              workspace.id === currentWorkspace?.id && "bg-waify-green/5"
            ),
            children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-waify-green text-xs font-bold text-white", children: workspace.name?.charAt(0)?.toUpperCase() || "W" }),
              /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium text-waify-text dark:text-waify-dark-text", children: workspace.name }),
                /* @__PURE__ */ jsx("span", { className: "block truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: workspace.workspace_type_label || workspace.workspace_type || workspace.industry || "Workspace" })
              ] }),
              workspace.id === currentWorkspace?.id && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 shrink-0 text-waify-green" })
            ]
          },
          workspace.id
        )) }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 p-2 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.workspaces.index"),
            className: "flex w-full items-center justify-center gap-2 rounded-btn px-3 py-2 text-sm font-medium text-waify-green-dark transition hover:bg-waify-green/10 dark:text-emerald-200",
            children: [
              /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5" }),
              "Manage workspaces"
            ]
          }
        ) })
      ] })
    ] })
  ] });
}
function TopbarMenuLink({ href, icon, children }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href,
      className: "flex items-center gap-3 px-4 py-2 text-sm text-waify-text transition hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2",
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-gray-500 dark:text-waify-dark-text-muted", children: icon }),
        children
      ]
    }
  );
}
function GlobalSearchInput({ mobile = false, autoFocus = false, onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (autoFocus) {
      window.setTimeout(() => {
        inputRef.current?.focus();
        setOpen(true);
      }, 30);
    }
  }, [autoFocus]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(route("app.search"), {
          params: { q: query, limit: 8 },
          signal: controller.signal,
          headers: { Accept: "application/json" }
        });
        setResults(response.data?.results || []);
      } catch (error) {
        if (error?.code !== "ERR_CANCELED" && error?.name !== "CanceledError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, query.trim().length >= 2 ? 180 : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);
  const visit = (href) => {
    setOpen(false);
    onClose?.();
    router.visit(href);
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", mobile ? "min-w-0 flex-1" : "transition-all focus-within:scale-[1.01]"), children: [
    !mobile && /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        value: query,
        onChange: (event) => {
          setQuery(event.target.value);
          setOpen(true);
        },
        onClick: () => setOpen(true),
        placeholder: "Search campaigns, contacts, templates...",
        className: cn(
          "h-10 w-full border-0 text-sm outline-none ring-0 transition placeholder:text-gray-400 focus:ring-0",
          mobile ? "bg-transparent px-0 text-waify-text dark:text-waify-dark-text" : "rounded-btn border border-transparent bg-gray-50 pl-10 pr-16 focus:border-waify-green focus:bg-white focus:ring-2 focus:ring-waify-green/15 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text dark:focus:bg-waify-dark-surface"
        )
      }
    ),
    !mobile && /* @__PURE__ */ jsx("kbd", { className: "absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-waify-dark-border dark:bg-waify-dark-surface sm:flex", children: "Ctrl K" }),
    open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[130]", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxs("div", { className: cn(
        "absolute z-[150] overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface",
        mobile ? "left-[-2rem] right-[-3rem] top-12" : "left-0 right-0 top-12"
      ), children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-4 py-2 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Global search" }),
          loading && /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin text-waify-green" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-[60vh] overflow-y-auto py-1", children: results.length > 0 ? results.map((result) => {
          const Icon = resultIcon(result.type);
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onMouseDown: (event) => event.preventDefault(),
              onClick: () => visit(result.href),
              className: "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2",
              children: [
                /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: result.label }),
                  result.description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: result.description }),
                  /* @__PURE__ */ jsx("span", { className: "mt-1 block text-[10px] font-medium uppercase tracking-wider text-waify-green-dark dark:text-emerald-300", children: resultTypeLabel(result.type) })
                ] })
              ]
            },
            `${result.type}-${result.id}`
          );
        }) : /* @__PURE__ */ jsxs("div", { className: "px-4 py-8 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: query.trim().length >= 2 ? "No matching results" : "Search workspace data" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: query.trim().length >= 2 ? "Try a contact name, phone number, campaign, or template." : "Type at least two characters, or choose a common page." })
        ] }) })
      ] })
    ] })
  ] });
}
function resultIcon(type) {
  switch (type) {
    case "contact":
      return Users;
    case "conversation":
      return MessageCircle;
    case "template":
      return MessageSquareText;
    case "campaign":
      return Megaphone;
    case "segment":
      return Tags;
    case "quick_reply":
      return Reply;
    case "connection":
      return Building2;
    case "widget":
      return Wand2;
    case "chatbot":
      return Bot;
    default:
      return Search;
  }
}
function resultTypeLabel(type) {
  return type.replace("_", " ");
}
const actionableCallStatuses = /* @__PURE__ */ new Set(["ringing", "incoming", "queued", "initiated"]);
function isQuietHours(user) {
  if (!user?.quiet_hours_enabled) return false;
  const start = String(user.quiet_hours_start || "22:00");
  const end = String(user.quiet_hours_end || "08:00");
  const now = /* @__PURE__ */ new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = start.split(":").map((value) => Number(value || 0));
  const [endHour, endMinute] = end.split(":").map((value) => Number(value || 0));
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  if (startMinutes === endMinutes) return false;
  return startMinutes < endMinutes ? current >= startMinutes && current < endMinutes : current >= startMinutes || current < endMinutes;
}
function playTone(frequency = 880, duration = 0.12, volume = 0.04) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const gain = context.createGain();
  gain.gain.value = Math.max(volume, 0.12);
  gain.connect(context.destination);
  [0, 0.16].forEach((offset, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = index === 0 ? frequency : 1174;
    oscillator.connect(gain);
    oscillator.start(context.currentTime + offset);
    oscillator.stop(context.currentTime + offset + duration);
  });
  window.setTimeout(() => void context.close?.(), Math.ceil((duration + 0.2) * 1e3) + 80);
}
function playRingPattern() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const gain = context.createGain();
  gain.gain.value = 0.05;
  gain.connect(context.destination);
  [0, 0.18, 0.42, 0.62].forEach((offset, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = index % 2 === 0 ? 560 : 740;
    oscillator.connect(gain);
    oscillator.start(context.currentTime + offset);
    oscillator.stop(context.currentTime + offset + 0.14);
  });
  window.setTimeout(() => void context.close?.(), 900);
}
function RealtimeInboxAlerts() {
  const { account, auth } = usePage().props;
  const { subscribe } = useRealtime();
  const { addToast } = useToast();
  const processedEvents = useRef(/* @__PURE__ */ new Set());
  const activeCallIntervals = useRef(/* @__PURE__ */ new Map());
  const user = auth?.user;
  const quiet = isQuietHours(user);
  const soundEnabled = Boolean(user?.notify_sound_enabled ?? true) && !quiet;
  const inAppEnabled = Boolean(user?.notify_in_app_enabled ?? true);
  const browserNotificationsEnabled = typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
  const isInboxPage = typeof window !== "undefined" && window.location.pathname.startsWith("/app/conversations");
  const trimProcessedEvents = useCallback(() => {
    if (processedEvents.current.size <= 160) return;
    processedEvents.current = new Set(Array.from(processedEvents.current).slice(-80));
  }, []);
  const showBrowserNotification = useCallback((tag, title, body, conversationId) => {
    if (!browserNotificationsEnabled) return;
    const notification = new Notification(title, {
      body,
      tag,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      silent: false,
      renotify: true
    });
    notification.onclick = () => {
      window.focus();
      if (conversationId) {
        router.get(route("app.whatsapp.conversations.index", { conversation: conversationId }), {}, {
          preserveState: true,
          preserveScroll: true
        });
      }
      notification.close();
    };
  }, [browserNotificationsEnabled]);
  const notifyMessage = useCallback((event) => {
    const message = event.message;
    if (!message || message.direction !== "inbound") return;
    const eventId = `global-message-${event.conversation_id || "x"}-${message.id || Date.now()}`;
    if (processedEvents.current.has(eventId)) return;
    processedEvents.current.add(eventId);
    trimProcessedEvents();
    const contact = event.contact?.name || event.contact?.wa_id || "WhatsApp contact";
    const preview = message.text_body || message.type || "New WhatsApp message";
    if (inAppEnabled) {
      addToast({
        title: "New WhatsApp message",
        description: `${contact}: ${preview}`,
        variant: "info",
        duration: 3500,
        source: "realtime-inbox"
      });
    }
    if (soundEnabled) {
      playTone();
    }
    showBrowserNotification(eventId, `New message from ${contact}`, preview, event.conversation_id);
  }, [addToast, inAppEnabled, showBrowserNotification, soundEnabled, trimProcessedEvents]);
  const stopCallRing = useCallback((callId) => {
    const interval = activeCallIntervals.current.get(callId);
    if (interval) {
      window.clearInterval(interval);
      activeCallIntervals.current.delete(callId);
    }
  }, []);
  const notifyCall = useCallback((event) => {
    const call = event.call;
    if (!call?.id) return;
    const callId = String(call.id);
    const status = String(call.status || "").toLowerCase();
    if (call.direction !== "inbound" || !actionableCallStatuses.has(status)) {
      stopCallRing(callId);
      return;
    }
    const eventId = `global-call-${callId}-${status}`;
    const caller = call.contact_name || call.phone_number || "WhatsApp caller";
    if (!processedEvents.current.has(eventId)) {
      processedEvents.current.add(eventId);
      trimProcessedEvents();
      if (inAppEnabled) {
        addToast({
          title: "Incoming WhatsApp call",
          description: String(caller),
          variant: "info",
          duration: 7e3,
          source: "realtime-call"
        });
      }
      showBrowserNotification(eventId, "Incoming WhatsApp call", String(caller));
    }
    if (soundEnabled && !activeCallIntervals.current.has(callId)) {
      playRingPattern();
      activeCallIntervals.current.set(callId, window.setInterval(playRingPattern, 3500));
    }
  }, [addToast, inAppEnabled, showBrowserNotification, soundEnabled, stopCallRing, trimProcessedEvents]);
  const notifyMetaLead = useCallback((event) => {
    if (!user?.notify_leads_enabled) return;
    const lead = event.lead || {};
    const eventId = `global-meta-lead-${lead.id || Date.now()}`;
    if (processedEvents.current.has(eventId)) return;
    processedEvents.current.add(eventId);
    trimProcessedEvents();
    const title = "New Meta lead";
    const description = `${lead.name || "Meta lead"}${lead.form_name ? ` from ${lead.form_name}` : ""}`;
    if (inAppEnabled) {
      addToast({
        title,
        description,
        variant: "info",
        duration: 6e3,
        source: "meta-leads"
      });
    }
    if (soundEnabled) {
      playTone();
    }
    showBrowserNotification(eventId, title, description);
  }, [addToast, inAppEnabled, showBrowserNotification, soundEnabled, trimProcessedEvents, user?.notify_leads_enabled]);
  const channel = useMemo(() => account?.id ? `account.${account.id}.whatsapp.inbox` : null, [account?.id]);
  useEffect(() => {
    if (!channel || isInboxPage) return;
    const unsubscribeMessage = subscribe(channel, ".whatsapp.message.created", notifyMessage);
    const unsubscribeCall = subscribe(channel, ".whatsapp.call.updated", notifyCall);
    const unsubscribeMetaLead = subscribe(channel, ".meta.lead.created", notifyMetaLead);
    return () => {
      unsubscribeMessage();
      unsubscribeCall();
      unsubscribeMetaLead();
      activeCallIntervals.current.forEach((interval) => window.clearInterval(interval));
      activeCallIntervals.current.clear();
    };
  }, [channel, isInboxPage, notifyCall, notifyMessage, notifyMetaLead, subscribe]);
  return null;
}
function AppShell({ children, fullscreen = false }) {
  const { account, navigation, auth, ziggy } = usePage().props;
  const currentRoute = window.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentRoute]);
  useEffect(() => {
    if (ziggy) {
      window.Ziggy = ziggy;
    }
  }, [ziggy]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return /* @__PURE__ */ jsx(BrandingWrapper, { children: /* @__PURE__ */ jsxs("div", { className: "flex h-[100dvh] overflow-hidden bg-waify-bg text-waify-text dark:bg-waify-dark-bg dark:text-waify-dark-text", children: [
    !fullscreen && /* @__PURE__ */ jsx(
      Sidebar,
      {
        navigation: navigation || [],
        currentRoute,
        account,
        isOpen: sidebarOpen,
        onClose: () => setSidebarOpen(false),
        onCollapseChange: setSidebarCollapsed
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: `flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ${fullscreen ? "" : sidebarCollapsed ? "lg:pl-16" : "lg:pl-60"}`, children: [
      !fullscreen && /* @__PURE__ */ jsx(
        Topbar,
        {
          user: auth?.user,
          onMenuClick: () => setSidebarOpen(!sidebarOpen)
        }
      ),
      /* @__PURE__ */ jsx("main", { className: fullscreen ? "flex-1 overflow-hidden" : "waify-scrollbar flex-1 overflow-y-auto p-4 lg:p-6", children })
    ] }),
    /* @__PURE__ */ jsx(CookieConsentBanner, {}),
    /* @__PURE__ */ jsx(AnalyticsScripts, {}),
    /* @__PURE__ */ jsx(RealtimeInboxAlerts, {})
  ] }) });
}
export {
  AppShell as A
};
