import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { useState, useRef, useMemo, useEffect } from "react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { u as useRealtime, B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { Wifi, WifiOff, Search, X, MessageSquare, Phone } from "lucide-react";
import { C as ConversationSkeleton } from "./Skeleton-D-MdPNCd.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import axios from "axios";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-BocaoVWt.js";
import "laravel-echo";
import "pusher-js";
function ConversationsIndex({
  workspace,
  conversations: initialConversations,
  connections
}) {
  const { subscribe, connected } = useRealtime();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState(initialConversations.data);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [connectionFilter, setConnectionFilter] = useState("all");
  const [pollingInterval, setPollingInterval] = useState(null);
  const lastPollRef = useRef(/* @__PURE__ */ new Date());
  const processedMessageIds = useRef(/* @__PURE__ */ new Set());
  const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
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
      return true;
    });
  }, [conversations, searchQuery, statusFilter, connectionFilter]);
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
      updated.last_message_preview = data.message?.text || data.message?.body || "New message";
      updated.last_message_at = data.message?.timestamp || (/* @__PURE__ */ new Date()).toISOString();
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
    if (!workspace?.id) return;
    const channel = `private-workspace.${workspace.id}.whatsapp.inbox`;
    const unsubscribeConversationUpdated = subscribe(
      channel,
      ".whatsapp.conversation.updated",
      (data) => {
        const eventId = `conv-updated-${data.conversation?.id}-${Date.now()}`;
        if (!processedMessageIds.current.has(eventId)) {
          processedMessageIds.current.add(eventId);
          setConversations((prev) => applyConversationUpdated(prev, data.conversation));
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
            const updated = applyMessageCreated(prev, data);
            if (data.message?.direction === "inbound") {
              addToast({
                title: "New message",
                description: `From ${data.contact?.name || data.message?.from}`,
                variant: "info",
                duration: 3e3
              });
            }
            return updated;
          });
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
  }, [workspace?.id, subscribe, addToast]);
  useEffect(() => {
    if (connected || !workspace?.id) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      return;
    }
    const poll = async () => {
      try {
        const response = await axios.get(
          route("app.whatsapp.inbox.stream", { workspace: workspace.slug }),
          {
            params: {
              since: lastPollRef.current.toISOString()
            }
          }
        );
        if (response.data.updated_conversations?.length > 0) {
          setConversations((prev) => {
            let updated = [...prev];
            response.data.updated_conversations.forEach((conv) => {
              const index = updated.findIndex((c) => c.id === conv.id);
              if (index >= 0) {
                updated[index] = conv;
              } else {
                updated.unshift(conv);
              }
            });
            return updated.sort((a, b) => {
              const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
              const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
              return timeB - timeA;
            });
          });
        }
        lastPollRef.current = new Date(response.data.server_time || /* @__PURE__ */ new Date());
      } catch (error) {
        console.error("[Inbox] Polling error:", error);
      }
    };
    const interval = setInterval(poll, 3e4);
    setPollingInterval(interval);
    poll();
    return () => {
      clearInterval(interval);
    };
  }, [connected, workspace?.id, workspace?.slug]);
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
        /* @__PURE__ */ jsx("div", { className: "px-5 py-4 bg-[#075E54] text-white", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-white/70", children: "WhatsApp" }),
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Chats" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-xs", children: connected ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1", children: [
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
            (searchQuery || statusFilter !== "all" || connectionFilter !== "all") && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setConnectionFilter("all");
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
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "p-2", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(ConversationSkeleton, {}, i)) }) : filteredConversations.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-10 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-6 w-6 text-gray-400" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: searchQuery || statusFilter !== "all" || connectionFilter !== "all" ? "No chats match your filters." : "No chats yet." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: filteredConversations.map((conversation) => /* @__PURE__ */ jsx(
          Link,
          {
            href: route("app.whatsapp.conversations.show", {
              workspace: workspace.slug,
              conversation: conversation.id
            }),
            className: "group block px-4 py-3 hover:bg-[#f0f2f5] dark:hover:bg-gray-800 transition-colors",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-full bg-[#25D366] text-white flex items-center justify-center font-semibold text-lg", children: conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-gray-900 dark:text-gray-100", children: conversation.contact.name || conversation.contact.wa_id }),
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-500 dark:text-gray-400", children: formatTime(conversation.last_message_at) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: conversation.last_message_preview || "No messages yet" }) }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Badge, { variant: conversation.status === "open" ? "success" : "default", className: "px-2 py-0.5 text-[10px]", children: conversation.status }),
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-400", children: "•" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[11px] text-gray-500", children: [
                    /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" }),
                    conversation.connection.name
                  ] })
                ] })
              ] })
            ] })
          },
          conversation.id
        )) }) })
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
