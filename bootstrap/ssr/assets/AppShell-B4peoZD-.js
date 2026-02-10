import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { X, Megaphone, Activity, Users, Settings, LifeBuoy, CreditCard, BarChart3, Zap, Sparkles, Bot, Inbox, FileText, MessageCircle, Puzzle, LayoutDashboard, MessageSquare, AlertCircle, User, ArrowRight } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import { u as useRealtime, T as Topbar } from "./RealtimeProvider-Dletx5Ny.js";
import { T as Toaster, G as GlobalFlashHandler } from "./GlobalFlashHandler-CNoF0uzm.js";
import { B as BrandingWrapper } from "./BrandingWrapper-B2Mh0bYb.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import { C as CookieConsentBanner, A as AnalyticsScripts } from "./CookieConsentBanner-BJ5KL4CC.js";
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
  Megaphone
};
function Sidebar({ navigation, currentRoute, account, isOpen = false, onClose }) {
  const { branding } = usePage().props;
  const platformName = branding?.platform_name || "WACP";
  const logoUrl = branding?.logo_url;
  const groupedNav = navigation.reduce((acc, item) => {
    const group = item.group || "other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
  const groupLabels = {
    core: "Core",
    messaging: "Messaging",
    automation: "Automation",
    ai: "AI",
    growth: "Growth",
    billing: "Billing"
  };
  const renderNavItem = (item, index) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;
    let href = "#";
    try {
      if (account) {
        href = route(item.href, {});
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
    const isActive = currentRoute.includes(item.href.replace("app.", ""));
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href,
        className: cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
          isActive ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1"
        ),
        children: [
          /* @__PURE__ */ jsx(Icon, { className: cn(
            "h-5 w-5 transition-transform duration-200",
            isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
            !isActive && "group-hover:scale-110"
          ) }),
          /* @__PURE__ */ jsx("span", { className: cn(
            isActive ? "font-semibold" : "font-medium"
          ), children: item.label })
        ]
      },
      `${item.href}-${item.label}-${index}`
    );
  };
  const sidebarContent = /* @__PURE__ */ jsx("nav", { className: "flex-1 overflow-y-auto p-6 space-y-8", children: Object.entries(groupedNav).map(([group, items]) => {
    const validItems = items.map(renderNavItem).filter((item) => item !== null);
    if (validItems.length === 0) {
      return null;
    }
    return /* @__PURE__ */ jsxs("div", { children: [
      groupLabels[group] && /* @__PURE__ */ jsx("h3", { className: "px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3", children: groupLabels[group] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: validItems })
    ] }, group);
  }).filter(Boolean) });
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
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800", children: [
            logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-8 w-auto" }) : /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: platformName }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                "aria-label": "Close sidebar",
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-gray-700 dark:text-gray-300", "aria-hidden": true })
              }
            )
          ] }),
          sidebarContent
        ]
      }
    ),
    /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800", children: logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-8 w-auto" }) : /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: platformName }) }),
      sidebarContent
    ] })
  ] });
}
const isImage = (attachment) => {
  if (attachment.mime_type) {
    return attachment.mime_type.startsWith("image/");
  }
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.file_name);
};
const isPdf = (attachment) => {
  if (attachment.mime_type) {
    return attachment.mime_type === "application/pdf";
  }
  return /\.pdf$/i.test(attachment.file_name);
};
function LiveChatWidget() {
  const { account, branding, supportSettings } = usePage().props;
  const { subscribe } = useRealtime();
  const liveChatEnabled = supportSettings?.live_chat_enabled ?? true;
  if (!liveChatEnabled) {
    return null;
  }
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [requestingHuman, setRequestingHuman] = useState(false);
  const supportContacts = useMemo(() => {
    return {
      email: branding?.support_email,
      phone: branding?.support_phone
    };
  }, [branding?.support_email, branding?.support_phone]);
  useEffect(() => {
    if (!open || !account?.slug) {
      return;
    }
    let active = true;
    setLoading(true);
    window.axios.get(route("app.support.live", {}), {
      headers: { Accept: "application/json" }
    }).then((res) => {
      const data = res.data;
      if (!active) return;
      setThread(data.thread);
      setMessages(data.messages || []);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [open, account?.slug]);
  useEffect(() => {
    if (!thread || !account?.id) return;
    const channel = `account.${account.id}.support.thread.${thread.id}`;
    try {
      console.log("[LiveChatWidget] Subscribing to channel", { channel, threadId: thread.id, accountId: account.id });
      const unsubscribe = subscribe(channel, "support.message.created", (payload) => {
        console.log("[LiveChatWidget] Received message", { payload, channel });
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) {
            return prev;
          }
          return [...prev, payload];
        });
      });
      return () => {
        try {
          unsubscribe();
        } catch (error) {
          console.warn("[LiveChatWidget] Error unsubscribing from channel", error);
        }
      };
    } catch (error) {
      console.error("[LiveChatWidget] Failed to subscribe to support channel", {
        channel,
        threadId: thread.id,
        accountId: account.id,
        error
      });
      return () => {
      };
    }
  }, [subscribe, thread?.id, account?.id]);
  const sendMessage = async () => {
    if (!draft.trim() && attachments.length === 0 || !account?.slug) return;
    const payload = new FormData();
    if (draft.trim()) {
      payload.append("message", draft.trim());
    }
    payload.append("subject", thread?.subject ?? "Live chat");
    if (thread?.id && thread.status !== "closed") {
      payload.append("thread_id", String(thread.id));
    }
    attachments.forEach((file) => payload.append("attachments[]", file));
    setDraft("");
    setAttachments([]);
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    const res = await window.axios.post(
      route("app.support.live.message", {}),
      payload,
      {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrfToken || window.axios.defaults.headers.common["X-CSRF-TOKEN"] || ""
        },
        withCredentials: true
      }
    );
    const data = res.data;
    if (data.thread) {
      setThread(data.thread);
    }
    const newMessage = data.message;
    if (newMessage) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    }
    const botMessage = data.bot;
    if (botMessage) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === botMessage.id)) {
          return prev;
        }
        return [...prev, botMessage];
      });
    }
  };
  const closeLiveChat = async () => {
    if (!account?.slug) return;
    await window.axios.post(
      route("app.support.live.close", {}),
      {},
      { headers: { Accept: "application/json" } }
    );
    setThread((prev) => prev ? { ...prev, status: "closed" } : prev);
  };
  const startNewChat = () => {
    setThread(null);
    setMessages([]);
    setDraft("");
    setAttachments([]);
  };
  const requestHuman = async () => {
    if (!account?.slug) return;
    setRequestingHuman(true);
    try {
      const res = await window.axios.post(
        route("app.support.live.request-human", {}),
        {},
        { headers: { Accept: "application/json" } }
      );
      const data = res.data;
      if (data.thread) {
        setThread(data.thread);
      }
    } finally {
      setRequestingHuman(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-6 right-6 z-40", children: [
    !open && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen(true),
        className: "flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-3 shadow-lg hover:bg-blue-700 transition",
        children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Live Chat" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "w-80 max-w-[90vw] rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Support Live Chat" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs opacity-90", children: "We typically reply in a few minutes" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setOpen(false), className: "p-1 hover:opacity-80", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800", children: supportContacts.email || supportContacts.phone ? `Email ${supportContacts.email ?? "—"}${supportContacts.phone ? ` · ${supportContacts.phone}` : ""}` : "Share details and we will assist you." }),
      /* @__PURE__ */ jsxs("div", { className: "h-64 overflow-y-auto px-4 py-3 space-y-3", children: [
        loading && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Loading chat..." }),
        !loading && messages.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Start a conversation with our support team." }),
        thread?.mode === "human" && /* @__PURE__ */ jsx("div", { className: "text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2", children: "A live agent has been requested. We will join shortly." }),
        thread?.status === "closed" && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2", children: "This chat is closed. Start a new conversation anytime." }),
        messages.map((message) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `rounded-lg px-3 py-2 text-xs leading-relaxed ${message.sender_type === "admin" || message.sender_type === "bot" ? "bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100" : message.sender_type === "system" ? "bg-amber-50 dark:bg-amber-900/30 text-gray-900 dark:text-gray-100" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider opacity-60 mb-1", children: message.sender_type === "admin" ? "Support" : message.sender_type === "bot" ? "Assistant" : message.sender_type === "system" ? "System" : "You" }),
              message.body,
              message.attachments && message.attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1", children: message.attachments.map((attachment) => /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: attachment.url,
                    target: "_blank",
                    rel: "noreferrer",
                    className: "block text-[11px] text-blue-600 dark:text-blue-300 hover:underline",
                    children: attachment.file_name
                  }
                ),
                isImage(attachment) && /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: attachment.url,
                    alt: attachment.file_name,
                    className: "max-h-32 rounded-md border border-gray-200 dark:border-gray-700"
                  }
                ),
                isPdf(attachment) && /* @__PURE__ */ jsxs("details", { className: "text-[11px] text-gray-600 dark:text-gray-300", children: [
                  /* @__PURE__ */ jsx("summary", { className: "cursor-pointer", children: "Preview PDF" }),
                  /* @__PURE__ */ jsx(
                    "iframe",
                    {
                      src: attachment.url,
                      className: "mt-2 h-36 w-full rounded-md border border-gray-200 dark:border-gray-700"
                    }
                  )
                ] })
              ] }, attachment.id)) })
            ]
          },
          message.id
        ))
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-800 p-3 space-y-2", children: [
        thread?.status !== "closed" && thread?.mode !== "human" && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: requestHuman,
            disabled: requestingHuman,
            className: "text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline",
            children: requestingHuman ? "Requesting live agent..." : "Talk to a live agent"
          }
        ) }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: draft,
            onChange: (e) => setDraft(e.target.value),
            rows: 2,
            disabled: thread?.status === "closed",
            className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 text-sm disabled:opacity-60",
            placeholder: thread?.status === "closed" ? "Start a new chat to send messages." : "Type your message..."
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            multiple: true,
            disabled: thread?.status === "closed",
            onChange: (e) => setAttachments(Array.from(e.target.files || [])),
            className: "block w-full text-xs text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700 disabled:opacity-60"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          thread?.status === "closed" && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: startNewChat, children: "New Chat" }),
          thread?.status === "open" && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: closeLiveChat, children: "End Chat" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              onClick: sendMessage,
              disabled: draft.trim().length === 0 && attachments.length === 0 || thread?.status === "closed",
              children: "Send"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function ProfileIncompleteModal() {
  const { auth } = usePage().props;
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const user = auth?.user;
  const profileComplete = auth?.profile_complete ?? true;
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("profile_incomplete_dismissed") === "true";
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);
  useEffect(() => {
    if (profileComplete) {
      setDismissed(false);
      sessionStorage.removeItem("profile_incomplete_dismissed");
    }
    if (!profileComplete && !dismissed && user) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [profileComplete, dismissed, user]);
  const handleDismiss = () => {
    setDismissed(true);
    setIsOpen(false);
    sessionStorage.setItem("profile_incomplete_dismissed", "true");
  };
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  if (currentPath === "/profile" || currentPath.startsWith("/profile/") || currentPath.startsWith("/platform")) {
    return null;
  }
  if (!isOpen || profileComplete) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-white/20 rounded-lg", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "Complete Your Profile" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleDismiss,
          className: "p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5", "aria-hidden": true })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs(Alert, { variant: "warning", children: [
        /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-sm mb-1", children: "Profile Incomplete" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Please complete your profile to access all features. The following information is required:" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 pl-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full ${user?.name ? "bg-green-500" : "bg-red-500"}` }),
          /* @__PURE__ */ jsxs("span", { className: user?.name ? "text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-gray-100", children: [
            "Full Name ",
            user?.name ? "✓" : "(Required)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full ${user?.email ? "bg-green-500" : "bg-red-500"}` }),
          /* @__PURE__ */ jsxs("span", { className: user?.email ? "text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-gray-100", children: [
            "Email Address ",
            user?.email ? "✓" : "(Required)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full ${user?.phone ? "bg-green-500" : "bg-red-500"}` }),
          /* @__PURE__ */ jsxs("span", { className: user?.phone ? "text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-gray-100", children: [
            "Phone Number ",
            user?.phone ? "✓" : "(Required)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleDismiss,
          className: "text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
          children: "I'll do it later"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("profile.edit"),
          className: "flex items-center gap-2",
          children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg", children: [
            "Complete Profile",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
          ] })
        }
      )
    ] })
  ] }) });
}
function AppShell({ children }) {
  const { account, navigation, auth, ziggy } = usePage().props;
  const currentRoute = window.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  return /* @__PURE__ */ jsx(BrandingWrapper, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950", children: [
    /* @__PURE__ */ jsx(
      Sidebar,
      {
        navigation: navigation || [],
        currentRoute,
        account,
        isOpen: sidebarOpen,
        onClose: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "lg:pl-72", children: [
      /* @__PURE__ */ jsx(
        Topbar,
        {
          user: auth?.user,
          onMenuClick: () => setSidebarOpen(!sidebarOpen)
        }
      ),
      /* @__PURE__ */ jsx("main", { className: "p-4 lg:p-6", children })
    ] }),
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(GlobalFlashHandler, {}),
    /* @__PURE__ */ jsx(LiveChatWidget, {}),
    /* @__PURE__ */ jsx(ProfileIncompleteModal, {}),
    /* @__PURE__ */ jsx(CookieConsentBanner, {}),
    /* @__PURE__ */ jsx(AnalyticsScripts, {})
  ] }) });
}
export {
  AppShell as A
};
