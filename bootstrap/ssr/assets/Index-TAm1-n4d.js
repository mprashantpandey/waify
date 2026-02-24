import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, router, Head, Link } from "@inertiajs/react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { Plus, Wifi, WifiOff, Search, X, MessageSquare, Phone } from "lucide-react";
import { u as useRealtime } from "./RealtimeProvider-Dletx5Ny.js";
import { C as ConversationSkeleton } from "./Skeleton-D-MdPNCd.js";
import { E as EmptyState } from "./EmptyState-B0nbB491.js";
import { u as useToast } from "./useToast-C5ECijgs.js";
import { i as isSameAccountId } from "./utils-B2ZNUmII.js";
import axios from "axios";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "laravel-echo";
import "pusher-js";
import "clsx";
import "tailwind-merge";
const normalizeConversation = (value) => {
  if (!value || value.id == null) return null;
  const id = Number(value.id);
  const connectionId = Number(value?.connection?.id);
  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(connectionId) || connectionId < 1) {
    return null;
  }
  const waId = String(value?.contact?.wa_id ?? "").trim();
  const name = String(value?.contact?.name ?? waId ?? "").trim();
  return {
    id,
    account_id: value.account_id,
    contact: {
      id: Number(value?.contact?.id ?? 0),
      wa_id: waId,
      name: name || waId || "Unknown"
    },
    status: String(value.status ?? "open"),
    last_message_preview: value.last_message_preview ?? null,
    last_message_at: value.last_message_at ?? null,
    connection: {
      id: connectionId,
      name: String(value?.connection?.name ?? "Unknown")
    },
    assigned_to: value.assigned_to == null ? null : Number(value.assigned_to),
    priority: value.priority ?? null
  };
};
const normalizeConversationList = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeConversation).filter((item) => item !== null);
};
function ConversationsIndex({
  account,
  conversations: initialConversations,
  connections,
  agents: initialAgents = [],
  filters: initialFilters = { search: "" }
}) {
  const { subscribe, connected } = useRealtime();
  const { addToast } = useToast();
  const { auth } = usePage().props;
  const currentUserId = auth?.user?.id;
  const notifyAssignmentEnabled = auth?.user?.notify_assignment_enabled ?? true;
  const soundEnabled = auth?.user?.notify_sound_enabled ?? true;
  const [conversations, setConversations] = useState(
    normalizeConversationList(initialConversations?.data)
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search ?? "");
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status ?? "all");
  const [connectionFilter, setConnectionFilter] = useState(
    initialFilters?.connection_id !== void 0 && initialFilters?.connection_id !== "all" ? Number(initialFilters.connection_id) : "all"
  );
  const [assigneeFilter, setAssigneeFilter] = useState(
    initialFilters?.assignee ?? "all"
  );
  const [assigningId, setAssigningId] = useState(null);
  const agents = Array.isArray(initialAgents) ? initialAgents : [];
  const lastPollRef = useRef(/* @__PURE__ */ new Date());
  const processedMessageIds = useRef(/* @__PURE__ */ new Set());
  const assignmentStateRef = useRef(
    new Map(normalizeConversationList(initialConversations?.data).map((c) => [c.id, c.assigned_to ?? null]))
  );
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextRef = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextRef) return;
      const context = new AudioContextRef();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.04;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
    } catch (error) {
      console.warn("[Notifications] Unable to play sound");
    }
  }, [soundEnabled]);
  const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const api = typeof window !== "undefined" && window.axios ? window.axios : axios;
  const fetchInboxStreamAndMerge = useCallback(() => {
    if (!account?.id) return;
    const since = new Date(Date.now() - 2 * 60 * 1e3).toISOString();
    api.get(route("app.whatsapp.inbox.stream", {}), { params: { since } }).then((response) => {
      const list = response.data?.updated_conversations;
      if (!list?.length) return;
      const currentAccountId = account?.id;
      setConversations((prev) => {
        const byId = new Map(prev.map((c) => [c.id, c]));
        list.forEach((conv) => {
          const normalized = normalizeConversation(conv);
          if (!normalized) return;
          if (currentAccountId != null && normalized.account_id != null && !isSameAccountId(normalized.account_id, currentAccountId)) {
            return;
          }
          byId.set(normalized.id, normalized);
        });
        return Array.from(byId.values()).sort((a, b) => {
          const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return timeB - timeA;
        });
      });
      lastPollRef.current = new Date(response.data?.server_time || /* @__PURE__ */ new Date());
    }).catch((err) => console.warn("[Inbox] Stream fetch failed:", err?.message));
  }, [account?.id]);
  useEffect(() => {
    setConversations(normalizeConversationList(initialConversations?.data));
  }, [initialConversations]);
  const lastSearchRef = useRef(initialFilters?.search ?? "");
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery === lastSearchRef.current) return;
      lastSearchRef.current = searchQuery;
      router.get(route("app.whatsapp.conversations.index", {}), {
        search: searchQuery || void 0,
        assignee: assigneeFilter !== "all" ? assigneeFilter : void 0,
        status: statusFilter !== "all" ? statusFilter : void 0,
        connection_id: connectionFilter !== "all" ? connectionFilter : void 0
      }, { preserveState: true });
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const lastFiltersRef = useRef({ assignee: assigneeFilter, status: statusFilter, connection_id: connectionFilter });
  useEffect(() => {
    if (lastFiltersRef.current.assignee === assigneeFilter && lastFiltersRef.current.status === statusFilter && lastFiltersRef.current.connection_id === connectionFilter) {
      return;
    }
    lastFiltersRef.current = { assignee: assigneeFilter, status: statusFilter, connection_id: connectionFilter };
    router.get(route("app.whatsapp.conversations.index", {}), {
      search: searchQuery || void 0,
      assignee: assigneeFilter !== "all" ? assigneeFilter : void 0,
      status: statusFilter !== "all" ? statusFilter : void 0,
      connection_id: connectionFilter !== "all" ? connectionFilter : void 0
    }, { preserveState: true });
  }, [assigneeFilter, statusFilter, connectionFilter]);
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (conv.account_id != null && account?.id != null && !isSameAccountId(conv.account_id, account.id)) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = conv.contact.name?.toLowerCase().includes(query);
        const matchesWaId = conv.contact.wa_id?.toLowerCase().includes(query);
        const matchesPreview = conv.last_message_preview?.toLowerCase().includes(query);
        if (!matchesName && !matchesWaId && !matchesPreview) {
          return false;
        }
      }
      if (statusFilter !== "all" && conv.status !== statusFilter) {
        return false;
      }
      if (connectionFilter !== "all" && conv.connection.id !== connectionFilter) {
        return false;
      }
      if (assigneeFilter === "me") {
        if (currentUserId == null || conv.assigned_to !== currentUserId) return false;
      } else if (assigneeFilter === "unassigned") {
        if (conv.assigned_to != null) return false;
      }
      return true;
    });
  }, [conversations, account?.id, searchQuery, statusFilter, connectionFilter, assigneeFilter, currentUserId]);
  const applyConversationUpdated = (prev, updated) => {
    const index = prev.findIndex((c) => c.id === updated.id);
    if (index >= 0) {
      const newList = [...prev];
      newList[index] = updated;
      return newList.sort((a, b) => {
        const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return timeB - timeA;
      });
    } else {
      return [updated, ...prev].sort((a, b) => {
        const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return timeB - timeA;
      });
    }
  };
  const applyMessageCreated = (prev, data) => {
    const convId = data.conversation_id;
    const index = prev.findIndex((c) => c.id === convId);
    if (index >= 0) {
      const updated = { ...prev[index] };
      updated.last_message_preview = data.message?.text_body ?? data.message?.text ?? data.message?.body ?? "New message";
      updated.last_message_at = data.message?.created_at ?? data.message?.timestamp ?? (/* @__PURE__ */ new Date()).toISOString();
      const newList = [...prev];
      newList[index] = updated;
      return newList.sort((a, b) => {
        const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return timeB - timeA;
      });
    }
    return prev;
  };
  useEffect(() => {
    if (!account?.id) return;
    const channel = `account.${account.id}.whatsapp.inbox`;
    const unsubscribeConversationUpdated = subscribe(
      channel,
      ".whatsapp.conversation.updated",
      (data) => {
        const eventId = `conv-updated-${data.conversation?.id}-${data.conversation?.updated_at || data.conversation?.last_message_at || ""}`;
        if (!processedMessageIds.current.has(eventId)) {
          processedMessageIds.current.add(eventId);
          const conv = data.conversation || {};
          const incoming = normalizeConversation({
            ...conv,
            assigned_to: conv.assignee_id ?? conv.assigned_to ?? null,
            last_message_at: conv.last_message_at ?? conv.last_activity_at ?? null
          });
          if (!incoming) return;
          if (account?.id != null && incoming.account_id != null && !isSameAccountId(incoming.account_id, account.id)) {
            return;
          }
          setConversations((prev) => applyConversationUpdated(prev, incoming));
          if (currentUserId && notifyAssignmentEnabled && incoming.assigned_to === currentUserId) {
            const previous = assignmentStateRef.current.get(incoming.id);
            if (previous !== incoming.assigned_to) {
              addToast({
                title: "Conversation assigned",
                description: "A chat was assigned to you.",
                variant: "info",
                duration: 3e3
              });
              playNotificationSound();
            }
          }
          assignmentStateRef.current.set(incoming.id, incoming.assigned_to ?? null);
          if (processedMessageIds.current.size > 100) {
            const ids = Array.from(processedMessageIds.current);
            processedMessageIds.current = new Set(ids.slice(-50));
          }
        }
      }
    );
    const unsubscribeMessageCreated = subscribe(
      channel,
      ".whatsapp.message.created",
      (data) => {
        const eventId = `msg-created-${data.message?.id}-${data.conversation_id}`;
        if (!processedMessageIds.current.has(eventId)) {
          processedMessageIds.current.add(eventId);
          setConversations((prev) => {
            const hadConversation = prev.some((c) => c.id === data.conversation_id);
            const updated = applyMessageCreated(prev, data);
            if (!hadConversation && data.conversation_id) {
              fetchInboxStreamAndMerge();
            }
            return updated;
          });
          if (data.message?.direction === "inbound") {
            addToast({
              title: "New message",
              description: `From ${data.contact?.name || data.message?.from}`,
              variant: "info",
              duration: 3e3
            });
          }
          if (processedMessageIds.current.size > 100) {
            const ids = Array.from(processedMessageIds.current);
            processedMessageIds.current = new Set(ids.slice(-50));
          }
        }
      }
    );
    return () => {
      unsubscribeConversationUpdated();
      unsubscribeMessageCreated();
    };
  }, [account?.id, subscribe, addToast, currentUserId, notifyAssignmentEnabled, playNotificationSound, fetchInboxStreamAndMerge]);
  useEffect(() => {
    if (!account?.id) return;
    const interval = setInterval(fetchInboxStreamAndMerge, 2e4);
    fetchInboxStreamAndMerge();
    return () => clearInterval(interval);
  }, [account?.id, fetchInboxStreamAndMerge]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Inbox" }),
    /* @__PURE__ */ jsx("div", { className: "h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]", children: /* @__PURE__ */ jsxs("div", { className: "grid h-full lg:grid-cols-[360px_1fr] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl", children: [
      /* @__PURE__ */ jsxs("section", { className: "flex flex-col border-r border-gray-200 dark:border-gray-800", children: [
        /* @__PURE__ */ jsx("div", { className: "px-5 py-4 bg-[#075E54] text-white", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-white/70", children: "WhatsApp" }),
              /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Chats" })
            ] }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("app.whatsapp.conversations.new"),
                className: "shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30",
                "aria-label": "Start new conversation",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                  "New chat"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-2 text-xs", children: connected ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1", children: [
            /* @__PURE__ */ jsx(Wifi, { className: "h-3 w-3" }),
            "Live"
          ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1", children: [
            /* @__PURE__ */ jsx(WifiOff, { className: "h-3 w-3" }),
            "Polling"
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "search",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                placeholder: "Search or start new chat",
                className: "pl-9 rounded-full bg-white dark:bg-gray-800"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                className: "rounded-full border-gray-300 shadow-sm focus:border-[#25D366] focus:ring-[#25D366] dark:bg-gray-800 dark:border-gray-700 text-xs px-3 py-1.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All" }),
                  /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                  /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
                ]
              }
            ),
            connections && connections.length > 0 && /* @__PURE__ */ jsxs(
              "select",
              {
                value: connectionFilter,
                onChange: (e) => setConnectionFilter(e.target.value === "all" ? "all" : Number(e.target.value)),
                className: "rounded-full border-gray-300 shadow-sm focus:border-[#25D366] focus:ring-[#25D366] dark:bg-gray-800 dark:border-gray-700 text-xs px-3 py-1.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All numbers" }),
                  connections.map((conn) => /* @__PURE__ */ jsx("option", { value: conn.id, children: conn.name }, conn.id))
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: assigneeFilter,
                onChange: (e) => setAssigneeFilter(e.target.value),
                className: "rounded-full border-gray-300 shadow-sm focus:border-[#25D366] focus:ring-[#25D366] dark:bg-gray-800 dark:border-gray-700 text-xs px-3 py-1.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All assignees" }),
                  /* @__PURE__ */ jsx("option", { value: "me", children: "Assigned to me" }),
                  /* @__PURE__ */ jsx("option", { value: "unassigned", children: "Unassigned" })
                ]
              }
            ),
            (searchQuery || statusFilter !== "all" || connectionFilter !== "all" || assigneeFilter !== "all") && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setConnectionFilter("all");
                  setAssigneeFilter("all");
                },
                className: "ml-auto text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 inline-flex items-center gap-1",
                "aria-label": "Clear filters",
                children: [
                  /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
                  "Clear"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "p-2", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(ConversationSkeleton, {}, i)) }) : filteredConversations.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx(
          EmptyState,
          {
            icon: MessageSquare,
            title: searchQuery || statusFilter !== "all" || connectionFilter !== "all" || assigneeFilter !== "all" ? "No chats match your filters" : "No chats yet",
            description: searchQuery || statusFilter !== "all" || connectionFilter !== "all" || assigneeFilter !== "all" ? "Try clearing filters or start a new conversation." : "Start a conversation from New chat or when a contact messages you.",
            action: searchQuery || statusFilter !== "all" || connectionFilter !== "all" || assigneeFilter !== "all" ? /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                onClick: () => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setConnectionFilter("all");
                  setAssigneeFilter("all");
                },
                children: "Clear filters"
              }
            ) : /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.conversations.new"), children: /* @__PURE__ */ jsxs(Button, { className: "bg-[#25D366] hover:bg-[#20BD5A] text-white", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2", "aria-hidden": true }),
              "New chat"
            ] }) })
          }
        ) }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: filteredConversations.map((conversation) => {
          const assigneeName = conversation.assigned_to ? agents.find((a) => a.id === conversation.assigned_to)?.name ?? "—" : "—";
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: "group flex items-start gap-2 px-4 py-3 hover:bg-[#f0f2f5] dark:hover:bg-gray-800 transition-colors",
              children: [
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: route("app.whatsapp.conversations.show", { conversation: conversation.id }),
                    className: "min-w-0 flex-1 flex items-start gap-3",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "h-11 w-11 shrink-0 rounded-full bg-[#25D366] text-white flex items-center justify-center font-semibold text-lg", children: conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0) }),
                      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                          /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-gray-900 dark:text-gray-100", children: conversation.contact.name || conversation.contact.wa_id }),
                          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-500 dark:text-gray-400 shrink-0 ml-1", children: formatTime(conversation.last_message_at) })
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: conversation.last_message_preview || "No messages yet" }) }),
                        /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2 flex-wrap", children: [
                          /* @__PURE__ */ jsx(Badge, { variant: conversation.status === "open" ? "success" : "default", className: "px-2 py-0.5 text-[10px]", children: conversation.status }),
                          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-400", children: "•" }),
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[11px] text-gray-500", children: [
                            /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" }),
                            conversation.connection.name
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-400", children: "•" }),
                          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-500", title: "Assignee", children: assigneeName })
                        ] })
                      ] })
                    ]
                  }
                ),
                agents.length > 0 && /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "shrink-0 pt-0.5",
                    onClick: (e) => e.preventDefault(),
                    onMouseDown: (e) => e.stopPropagation(),
                    children: /* @__PURE__ */ jsxs(
                      "select",
                      {
                        value: conversation.assigned_to ?? "",
                        disabled: assigningId === conversation.id,
                        onChange: (e) => {
                          const val = e.target.value;
                          const assignedTo = val === "" ? null : Number(val);
                          setAssigningId(conversation.id);
                          setConversations(
                            (prev) => prev.map(
                              (c) => c.id === conversation.id ? { ...c, assigned_to: assignedTo } : c
                            )
                          );
                          router.post(
                            route("app.whatsapp.conversations.update", { conversation: conversation.id }),
                            { assigned_to: assignedTo },
                            {
                              preserveState: true,
                              preserveScroll: true,
                              onFinish: () => setAssigningId(null)
                            }
                          );
                        },
                        className: "rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-[11px] py-1 px-2 max-w-[120px] truncate focus:border-[#25D366] focus:ring-[#25D366]",
                        title: "Assign to",
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                          agents.map((a) => /* @__PURE__ */ jsx("option", { value: a.id, children: a.name }, a.id))
                        ]
                      }
                    )
                  }
                )
              ]
            },
            conversation.id
          );
        }) }) })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "hidden lg:flex flex-col items-center justify-center bg-[#efeae2] dark:bg-gray-950", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-md px-8", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto mb-5 h-16 w-16 rounded-2xl bg-white/70 dark:bg-gray-900 flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-8 w-8 text-[#075E54]" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: "WhatsApp Inbox" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Select a chat to start messaging. Your conversations update live as messages arrive." })
      ] }) })
    ] }) })
  ] });
}
export {
  ConversationsIndex as default
};
