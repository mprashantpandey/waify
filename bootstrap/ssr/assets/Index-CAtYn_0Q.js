import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, useForm, Head, Link, router } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { P as PageHeader, T as ThemedIconTile, a as Toolbar, S as StatusBadge, D as Drawer } from "./Elements-EbyZDnT_.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useRealtime } from "./RealtimeProvider-D1qLzQY9.js";
import { RefreshCw, Inbox, MessageCircle, TicketCheck, Headphones, Mail, Phone, Search, Building2, Clock, UserRound, Bot, Paperclip, Sparkles, Send } from "lucide-react";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "./Badge-C65MHc2S.js";
import "@headlessui/react";
import "laravel-echo";
import "pusher-js";
function statusTone(status) {
  if (status === "closed" || status === "resolved") return "success";
  if (status === "pending" || status === "waiting") return "warning";
  if (status === "urgent" || status === "overdue") return "danger";
  if (status === "open") return "info";
  return "default";
}
function priorityTone(priority) {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  if (priority === "low") return "default";
  return "info";
}
function iconTone(status) {
  const tone = statusTone(status);
  if (tone === "success") return "green";
  if (tone === "warning") return "amber";
  if (tone === "danger") return "red";
  return "blue";
}
function isImage(attachment) {
  return attachment.mime_type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.file_name);
}
function isPdf(attachment) {
  return attachment.mime_type === "application/pdf" || /\.pdf$/i.test(attachment.file_name);
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
function PlatformSupportIndex({
  threads,
  filters,
  stats,
  selectedThread,
  messages = [],
  admins = [],
  auditLogs = []
}) {
  const { branding, auth, ai } = usePage().props;
  const { subscribe } = useRealtime();
  const { addToast } = useToast();
  const [localFilters, setLocalFilters] = useState({
    q: filters?.q || "",
    status: filters?.status || "all",
    per_page: filters?.per_page || 15
  });
  const [items, setItems] = useState(threads.data || []);
  const [drawerMessages, setDrawerMessages] = useState(messages || []);
  const [assistLoading, setAssistLoading] = useState(false);
  const [aiNote, setAiNote] = useState(null);
  const [ticketData, setTicketData] = useState({
    status: selectedThread?.status || "open",
    priority: selectedThread?.priority || "normal",
    assigned_to: selectedThread?.assigned_to ? String(selectedThread.assigned_to) : "",
    category: selectedThread?.category || "",
    tags: (selectedThread?.tags || []).join(", ")
  });
  const { data, setData, post, processing, reset } = useForm({
    message: "",
    attachments: []
  });
  useEffect(() => setItems(threads.data || []), [threads.data]);
  useEffect(() => {
    setDrawerMessages(messages || []);
    setTicketData({
      status: selectedThread?.status || "open",
      priority: selectedThread?.priority || "normal",
      assigned_to: selectedThread?.assigned_to ? String(selectedThread.assigned_to) : "",
      category: selectedThread?.category || "",
      tags: (selectedThread?.tags || []).join(", ")
    });
    setAiNote(null);
    reset();
  }, [selectedThread?.id]);
  useEffect(() => {
    const unsubscribe = subscribe("platform.support", "support.message.created", (payload) => {
      if (!payload.thread_id) return;
      setItems((prev) => {
        const index = prev.findIndex((thread) => thread.id === payload.thread_id);
        if (index === -1) return prev;
        const next = [...prev];
        const updated = { ...next[index], last_message_at: payload.created_at ?? next[index].last_message_at };
        next.splice(index, 1);
        next.unshift(updated);
        return next;
      });
    });
    return () => unsubscribe();
  }, [subscribe]);
  useEffect(() => {
    if (!selectedThread?.account?.id) return;
    const channel = `account.${selectedThread.account.id}.support.thread.${selectedThread.id}`;
    const unsubscribe = subscribe(channel, "support.message.created", (payload) => {
      if (payload.thread_id && Number(payload.thread_id) !== selectedThread.id) return;
      if (!payload.id || !payload.created_at) return;
      setDrawerMessages((prev) => {
        const map = new Map(prev.map((message) => [message.id, message]));
        map.set(payload.id, { ...map.get(payload.id), ...payload });
        return Array.from(map.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
    });
    return () => unsubscribe();
  }, [subscribe, selectedThread?.id, selectedThread?.account?.id]);
  const supportContacts = useMemo(() => ({
    email: branding?.support_email,
    phone: branding?.support_phone
  }), [branding?.support_email, branding?.support_phone]);
  const queryParams = (extra = {}) => ({
    q: localFilters.q || void 0,
    status: localFilters.status && localFilters.status !== "all" ? localFilters.status : void 0,
    per_page: localFilters.per_page || 15,
    ...extra
  });
  const applyFilters = () => {
    router.get(route("platform.support.index"), queryParams({ page: void 0 }), {
      preserveScroll: true
    });
  };
  const refresh = () => {
    router.reload({ only: ["threads", "selectedThread", "messages", "auditLogs"] });
  };
  const openTicket = (thread) => {
    router.get(route("platform.support.index"), queryParams({ ticket: thread.slug ?? thread.id, page: threads.current_page }), {
      preserveScroll: true
    });
  };
  const closeDrawer = () => {
    router.get(route("platform.support.index"), queryParams({ page: threads.current_page }), {
      preserveScroll: true
    });
  };
  const goToPage = (page) => {
    router.get(route("platform.support.index"), queryParams({ page }), {
      preserveScroll: true
    });
  };
  const submit = (event) => {
    event.preventDefault();
    if (!selectedThread) return;
    post(route("platform.support.message", { thread: selectedThread.slug ?? selectedThread.id }), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => reset()
    });
  };
  const closeThread = () => {
    if (!selectedThread) return;
    post(route("platform.support.close", { thread: selectedThread.slug ?? selectedThread.id }), { preserveScroll: true });
  };
  const updateTicket = (event) => {
    event.preventDefault();
    if (!selectedThread) return;
    router.post(
      route("platform.support.update", { thread: selectedThread.slug ?? selectedThread.id }),
      {
        status: ticketData.status,
        priority: ticketData.priority,
        assigned_to: ticketData.assigned_to || null,
        category: ticketData.category || null,
        tags: ticketData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      },
      { preserveScroll: true }
    );
  };
  const generateSuggestion = async (action) => {
    if (!selectedThread) return;
    setAssistLoading(true);
    try {
      const response = await axios.post(
        route("platform.support.assistant", { thread: selectedThread.slug ?? selectedThread.id }),
        { action },
        { headers: { Accept: "application/json" } }
      );
      const suggestion = response.data?.suggestion;
      if (suggestion && action === "reply") {
        setData("message", suggestion);
        setAiNote(null);
      } else if (suggestion) {
        setAiNote({ title: action === "summary" ? "AI summary" : "AI next steps", content: suggestion });
      }
    } catch (error) {
      addToast({
        title: "AI assistant",
        description: error?.response?.data?.error || "Unable to generate a suggestion.",
        variant: "error"
      });
    } finally {
      setAssistLoading(false);
    }
  };
  const firstResult = threads.total === 0 ? 0 : threads.per_page * (threads.current_page - 1) + 1;
  const lastResult = Math.min(threads.per_page * threads.current_page, threads.total);
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Support Requests" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Support requests",
          description: "Tenant tickets, replies, assignment, and audit activity without leaving the support inbox.",
          actions: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: refresh, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            "Refresh"
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Threads", value: stats.total, icon: Inbox }),
        /* @__PURE__ */ jsx(StatCard, { label: "Open", value: stats.open, icon: MessageCircle, tone: "blue" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Closed", value: stats.closed, icon: TicketCheck, tone: "purple" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Urgent", value: stats.urgent, icon: Headphones, tone: "amber" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "blue", children: /* @__PURE__ */ jsx(Inbox, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Support inbox" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Click a ticket to inspect the full thread in a drawer. The list remains paginated for larger data." })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Support contact" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }),
                supportContacts.email || "Not configured"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
                supportContacts.phone || "Not configured"
              ] })
            ] })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsx(
        Toolbar,
        {
          search: { value: localFilters.q || "", onChange: (value) => setLocalFilters({ ...localFilters, q: value }), placeholder: "Search tickets or workspace..." },
          filters: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.status || "all",
                onChange: (event) => setLocalFilters({ ...localFilters, status: event.target.value }),
                className: "waify-input min-w-36",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All tickets" }),
                  /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                  /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: localFilters.per_page || 15,
                onChange: (event) => setLocalFilters({ ...localFilters, per_page: Number(event.target.value) }),
                className: "waify-input min-w-28",
                children: [
                  /* @__PURE__ */ jsx("option", { value: 10, children: "10 / page" }),
                  /* @__PURE__ */ jsx("option", { value: 15, children: "15 / page" }),
                  /* @__PURE__ */ jsx("option", { value: 25, children: "25 / page" }),
                  /* @__PURE__ */ jsx("option", { value: 50, children: "50 / page" })
                ]
              }
            )
          ] }),
          actions: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: applyFilters, children: [
            /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
            "Apply"
          ] })
        }
      ),
      items.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsx(ThemedIconTile, { tone: "gray", size: "lg", children: /* @__PURE__ */ jsx(Search, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "No support requests found" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "New tenant tickets will appear here when they are created." })
      ] }) }) : /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-card border border-gray-100 bg-white shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden grid-cols-[minmax(0,1.5fr)_1fr_120px_120px_150px] gap-4 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted lg:grid", children: [
          /* @__PURE__ */ jsx("span", { children: "Ticket" }),
          /* @__PURE__ */ jsx("span", { children: "Workspace" }),
          /* @__PURE__ */ jsx("span", { children: "Status" }),
          /* @__PURE__ */ jsx("span", { children: "Priority" }),
          /* @__PURE__ */ jsx("span", { children: "Last message" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: items.map((thread) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => openTicket(thread),
            className: "grid w-full gap-4 px-4 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2 lg:grid-cols-[minmax(0,1.5fr)_1fr_120px_120px_150px] lg:items-center",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
                /* @__PURE__ */ jsx(ThemedIconTile, { tone: iconTone(thread.status), children: /* @__PURE__ */ jsx(MessageCircle, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: thread.subject }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      "#",
                      thread.id
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "Created ",
                      new Date(thread.created_at).toLocaleString()
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "truncate", children: thread.account?.name || "Unknown workspace" })
              ] }),
              /* @__PURE__ */ jsx(StatusBadge, { tone: statusTone(thread.status), dot: true, className: "w-fit capitalize", children: thread.status }),
              /* @__PURE__ */ jsx(StatusBadge, { tone: priorityTone(thread.priority), className: "w-fit capitalize", children: thread.priority || "normal" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "Never" })
            ]
          },
          thread.id
        )) })
      ] }),
      threads.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          "Showing ",
          firstResult,
          " to ",
          lastResult,
          " of ",
          threads.total
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: Array.from({ length: threads.last_page }, (_, index) => index + 1).map((page) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => goToPage(page),
            className: `h-9 min-w-9 rounded-btn px-3 text-sm font-semibold transition ${page === threads.current_page ? "bg-waify-green text-white" : "border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2"}`,
            children: page
          },
          page
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: Boolean(selectedThread),
        onClose: closeDrawer,
        title: selectedThread?.subject || "Support ticket",
        description: selectedThread?.account?.name || "Workspace ticket",
        className: "sm:max-w-5xl",
        children: selectedThread && /* @__PURE__ */ jsxs("div", { className: "grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50/80 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsx(StatusBadge, { tone: statusTone(selectedThread.status), dot: true, className: "capitalize", children: selectedThread.status }),
                /* @__PURE__ */ jsxs(StatusBadge, { tone: priorityTone(selectedThread.priority), className: "capitalize", children: [
                  selectedThread.priority || "normal",
                  " priority"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
                  "Created ",
                  new Date(selectedThread.created_at).toLocaleString()
                ] })
              ] }),
              selectedThread.account && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
                  selectedThread.account.name
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
                  selectedThread.account.owner?.name || "Owner unavailable"
                ] }),
                /* @__PURE__ */ jsx(Link, { href: route("platform.accounts.show", { account: selectedThread.account.id }), className: "font-semibold text-waify-green-dark hover:underline dark:text-emerald-300", children: "View workspace" }),
                /* @__PURE__ */ jsx(Link, { href: route("platform.accounts.impersonate", { account: selectedThread.account.id }), method: "post", className: "font-semibold text-waify-green-dark hover:underline dark:text-emerald-300", children: "Open dashboard" })
              ] })
            ] }),
            aiNote && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-bold uppercase tracking-wide", children: aiNote.title }),
              /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap", children: aiNote.content })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3", children: drawerMessages.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-10 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No messages have been added to this ticket yet." }) }) : drawerMessages.map((message) => {
              const isAdmin = message.sender_type === "admin" || message.sender_type === "bot";
              const isSystem = message.sender_type === "system";
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `rounded-card border px-4 py-3 ${isSystem ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100" : isAdmin ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100" : "border-gray-100 bg-white text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide opacity-75", children: [
                      /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                        message.sender_type === "bot" ? /* @__PURE__ */ jsx(Bot, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
                        message.sender_type === "admin" ? "Support" : message.sender_type === "bot" ? "Assistant" : message.sender_type === "system" ? "System" : "Tenant"
                      ] }),
                      /* @__PURE__ */ jsx("span", { children: new Date(message.created_at).toLocaleString() })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap text-sm", children: message.body }),
                    message.attachments && message.attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: message.attachments.map((attachment) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-current/10 bg-white/60 p-2 dark:bg-black/10", children: [
                      /* @__PURE__ */ jsxs("a", { href: attachment.url, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-xs font-semibold underline", children: [
                        /* @__PURE__ */ jsx(Paperclip, { className: "h-3.5 w-3.5" }),
                        attachment.file_name
                      ] }),
                      isImage(attachment) && /* @__PURE__ */ jsx("img", { src: attachment.url, alt: attachment.file_name, className: "mt-2 max-h-48 rounded-md border border-current/10" }),
                      isPdf(attachment) && /* @__PURE__ */ jsxs("details", { className: "mt-2 text-xs", children: [
                        /* @__PURE__ */ jsx("summary", { className: "cursor-pointer", children: "Preview PDF" }),
                        /* @__PURE__ */ jsx("iframe", { src: attachment.url, className: "mt-2 h-56 w-full rounded-md border border-current/10" })
                      ] })
                    ] }, attachment.id)) })
                  ]
                },
                message.id
              );
            }) }),
            /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: data.message,
                  onChange: (event) => setData("message", event.target.value),
                  className: "waify-input min-h-28 w-full resize-y",
                  placeholder: "Write a reply..."
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    multiple: true,
                    onChange: (event) => setData("attachments", Array.from(event.target.files || [])),
                    className: "block text-sm text-waify-text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-waify-text hover:file:bg-gray-200 dark:text-waify-dark-text-muted dark:file:bg-waify-dark-surface-2 dark:file:text-waify-dark-text"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
                  ai?.enabled && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => generateSuggestion("reply"), disabled: assistLoading, children: [
                      /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
                      "Reply"
                    ] }),
                    /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => generateSuggestion("summary"), disabled: assistLoading, children: "Summary" }),
                    /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => generateSuggestion("next_steps"), disabled: assistLoading, children: "Next steps" })
                  ] }),
                  /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: processing || selectedThread.status === "closed" || data.message.trim().length === 0 && data.attachments.length === 0, children: [
                    /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
                    processing ? "Sending..." : "Send"
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("aside", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Ticket management" }),
              /* @__PURE__ */ jsxs("form", { onSubmit: updateTicket, className: "mt-4 space-y-3", children: [
                /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
                  "Status",
                  /* @__PURE__ */ jsxs("select", { value: ticketData.status, onChange: (event) => setTicketData({ ...ticketData, status: event.target.value }), className: "waify-input mt-1 w-full", children: [
                    /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                    /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                    /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
                  "Priority",
                  /* @__PURE__ */ jsxs("select", { value: ticketData.priority, onChange: (event) => setTicketData({ ...ticketData, priority: event.target.value }), className: "waify-input mt-1 w-full", children: [
                    /* @__PURE__ */ jsx("option", { value: "low", children: "Low" }),
                    /* @__PURE__ */ jsx("option", { value: "normal", children: "Normal" }),
                    /* @__PURE__ */ jsx("option", { value: "high", children: "High" }),
                    /* @__PURE__ */ jsx("option", { value: "urgent", children: "Urgent" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
                  "Assignee",
                  /* @__PURE__ */ jsxs("select", { value: ticketData.assigned_to, onChange: (event) => setTicketData({ ...ticketData, assigned_to: event.target.value }), className: "waify-input mt-1 w-full", children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                    admins.map((admin) => /* @__PURE__ */ jsx("option", { value: admin.id, children: admin.name }, admin.id))
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
                  "Category",
                  /* @__PURE__ */ jsx("input", { value: ticketData.category, onChange: (event) => setTicketData({ ...ticketData, category: event.target.value }), className: "waify-input mt-1 w-full", placeholder: "Billing, WhatsApp, API" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
                  "Tags",
                  /* @__PURE__ */ jsx("input", { value: ticketData.tags, onChange: (event) => setTicketData({ ...ticketData, tags: event.target.value }), className: "waify-input mt-1 w-full", placeholder: "urgent, whatsapp" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2 pt-1", children: [
                  selectedThread.status === "open" && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: closeThread, children: "Close" }),
                  /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save" })
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "SLA details" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsxs("p", { children: [
                  "First response: ",
                  selectedThread.first_response_due_at ? new Date(selectedThread.first_response_due_at).toLocaleString() : "Not set"
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  "Resolution: ",
                  selectedThread.due_at ? new Date(selectedThread.due_at).toLocaleString() : "Not set"
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  "Escalation level: ",
                  selectedThread.escalation_level ?? 0
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Audit log" }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: auditLogs.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No audit entries yet." }) : auditLogs.map((log) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-100 p-3 text-sm dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: log.action.replace(/_/g, " ") }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-waify-text dark:text-waify-dark-text", children: log.user?.name || "System" }),
                log.meta && Object.keys(log.meta).length > 0 && /* @__PURE__ */ jsx("p", { className: "mt-1 break-words text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: JSON.stringify(log.meta) }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: log.created_at ? new Date(log.created_at).toLocaleString() : "No time" })
              ] }, log.id)) })
            ] }) })
          ] })
        ] })
      }
    )
  ] });
}
export {
  PlatformSupportIndex as default
};
