import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { u as useRealtime, T as Topbar } from "./RealtimeProvider-DfTOxbgl.js";
import { B as BrandingWrapper } from "./BrandingWrapper-B2Mh0bYb.js";
import { T as Toaster, G as GlobalFlashHandler } from "./GlobalFlashHandler-DdgICiVx.js";
import { MessageSquare, X, LayoutDashboard, Building2, Users, CreditCard, Puzzle, FileText, BarChart3, LifeBuoy, Activity, Shield, Settings } from "lucide-react";
import { B as Button } from "./Button-BocaoVWt.js";
import axios from "axios";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { c as cn } from "./utils-H80jjgLf.js";
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
function PlatformLiveChatWidget() {
  const { branding, ai } = usePage().props;
  const { subscribe } = useRealtime();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadSlug, setActiveThreadSlug] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [assistLoading, setAssistLoading] = useState(false);
  const loadThreads = async () => {
    const res = await axios.get(route("platform.support.live.list"), {
      headers: { Accept: "application/json" }
    });
    const data = res.data;
    setThreads(data.threads || []);
    if ((!activeThreadSlug || !data.threads?.some((t) => t.slug === activeThreadSlug)) && data.threads?.length) {
      setActiveThreadSlug(data.threads[0].slug);
    }
  };
  const loadThread = async (threadSlug) => {
    setLoading(true);
    const res = await axios.get(route("platform.support.live.thread", { thread: threadSlug }), {
      headers: { Accept: "application/json" }
    });
    const data = res.data;
    setThread(data.thread);
    setMessages(data.messages || []);
    setLoading(false);
  };
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    loadThreads().then(() => {
      if (activeThreadSlug) {
        return loadThread(activeThreadSlug);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [open]);
  useEffect(() => {
    if (!open || !activeThreadSlug) return;
    loadThread(activeThreadSlug);
  }, [activeThreadSlug]);
  useEffect(() => {
    if (!open) return;
    const unsubscribe = subscribe("platform.support", "support.message.created", () => {
      loadThreads();
    });
    return () => unsubscribe();
  }, [open, subscribe]);
  useEffect(() => {
    if (!thread?.workspace?.id) return;
    const channel = `workspace.${thread.workspace.id}.support.thread.${thread.id}`;
    const unsubscribe = subscribe(channel, "support.message.created", (payload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) {
          return prev;
        }
        return [...prev, payload];
      });
    });
    return () => {
      unsubscribe();
    };
  }, [subscribe, thread?.id, thread?.workspace?.id]);
  const sendMessage = async () => {
    if (!draft.trim() && attachments.length === 0 || !thread?.id) return;
    const payload = new FormData();
    if (draft.trim()) {
      payload.append("message", draft.trim());
    }
    payload.append("thread_id", String(thread.id));
    attachments.forEach((file) => payload.append("attachments[]", file));
    setDraft("");
    setAttachments([]);
    const res = await axios.post(route("platform.support.live.message"), payload, {
      headers: { Accept: "application/json" }
    });
    const data = res.data;
    const newMessage = data.message;
    if (newMessage) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    }
    loadThreads();
  };
  const generateSuggestion = async () => {
    if (!thread?.id) return;
    setAssistLoading(true);
    try {
      const res = await axios.post(
        route("platform.support.assistant", { thread: thread.slug ?? thread.id }),
        { action: "reply" },
        { headers: { Accept: "application/json" } }
      );
      const suggestion = res.data?.suggestion;
      if (suggestion) {
        setDraft(suggestion);
      }
    } catch (error) {
      addToast({
        title: "AI Assistant",
        description: error?.response?.data?.error || "AI assistant is disabled.",
        variant: "error"
      });
    } finally {
      setAssistLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-6 right-6 z-40", children: [
    !open && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen(true),
        className: "flex items-center gap-2 rounded-full bg-gray-900 text-white px-4 py-3 shadow-lg hover:bg-gray-800 transition",
        children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Support Live" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "w-[28rem] max-w-[95vw] rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Support Inbox" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80", children: thread?.workspace?.name ? `Workspace: ${thread.workspace.name}` : "Live conversations" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setOpen(false), className: "p-1 hover:opacity-80", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800", children: branding?.support_email ? `Primary support email: ${branding.support_email}` : "Reply to keep the thread active." }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-5 gap-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-span-2 border-r border-gray-200 dark:border-gray-800 max-h-[26rem] overflow-y-auto", children: [
          threads.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-4 text-xs text-gray-500 dark:text-gray-400", children: "No active live chats." }),
          threads.map((t) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveThreadSlug(t.slug),
              className: `w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 ${activeThreadSlug === t.slug ? "bg-gray-50 dark:bg-gray-800/60" : ""}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-900 dark:text-gray-100", children: t.workspace?.name ?? "Workspace" }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-gray-500 dark:text-gray-400 truncate", children: t.subject })
              ]
            },
            t.id
          ))
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-span-3 flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "h-64 overflow-y-auto px-4 py-3 space-y-3", children: [
            loading && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Loading latest conversation..." }),
            !loading && messages.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "No messages yet. Open the support inbox for more details." }),
            thread?.status === "closed" && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2", children: "This chat is closed." }),
            messages.map((message) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: `rounded-lg px-3 py-2 text-xs leading-relaxed ${message.sender_type === "admin" ? "bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"}`,
                children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider opacity-60 mb-1", children: message.sender_type === "admin" ? "Support" : "Tenant" }),
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
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: draft,
                onChange: (e) => setDraft(e.target.value),
                rows: 2,
                className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 text-sm",
                placeholder: "Reply to tenant..."
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                multiple: true,
                onChange: (e) => setAttachments(Array.from(e.target.files || [])),
                className: "block w-full text-xs text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              ai?.enabled && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: generateSuggestion, disabled: assistLoading || !thread, children: assistLoading ? "Generating..." : "AI Suggest" }),
              thread?.status === "open" && /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  onClick: async () => {
                    if (!thread) return;
                    await axios.post(route("platform.support.close", { thread: thread.slug ?? thread.id }));
                    setThread({ ...thread, status: "closed" });
                    loadThreads();
                  },
                  children: "Close Chat"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  onClick: sendMessage,
                  disabled: draft.trim().length === 0 && attachments.length === 0 || !thread || thread?.status === "closed",
                  children: "Send"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function PlatformShell({ children, auth }) {
  const { branding, ziggy } = usePage().props;
  const platformName = branding?.platform_name || "Platform";
  const logoUrl = branding?.logo_url;
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
  const navigation = [
    {
      name: "Dashboard",
      href: route("platform.dashboard"),
      icon: LayoutDashboard
    },
    {
      name: "Workspaces",
      href: route("platform.workspaces.index"),
      icon: Building2
    },
    {
      name: "Users",
      href: route("platform.users.index"),
      icon: Users
    },
    {
      name: "Plans",
      href: route("platform.plans.index"),
      icon: CreditCard
    },
    {
      name: "Modules",
      href: route("platform.modules.index"),
      icon: Puzzle
    },
    {
      name: "Subscriptions",
      href: route("platform.subscriptions.index"),
      icon: FileText
    },
    {
      name: "Analytics",
      href: route("platform.analytics"),
      icon: BarChart3
    },
    {
      name: "Templates",
      href: route("platform.templates.index"),
      icon: FileText
    },
    {
      name: "Support",
      href: route("platform.support.hub"),
      icon: LifeBuoy
    },
    {
      name: "Activity Logs",
      href: route("platform.activity-logs"),
      icon: Activity
    },
    {
      name: "System Health",
      href: route("platform.system-health"),
      icon: Shield
    },
    {
      name: "Settings",
      href: route("platform.settings"),
      icon: Settings
    }
  ];
  const sidebarContent = /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800", children: [
      logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: platformName, className: "h-8 w-auto" }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", children: platformName })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSidebarOpen(false),
          className: "lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-gray-700 dark:text-gray-300" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-4 py-4 space-y-1", children: navigation.map((item) => {
      const Icon = item.icon;
      const isActive = currentRoute.startsWith(item.href);
      return /* @__PURE__ */ jsxs(
        Link,
        {
          href: item.href,
          className: cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          ),
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }),
            item.name
          ]
        },
        item.name
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-gray-200 dark:border-gray-800", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate", children: auth?.user?.name }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: auth?.user?.email })
      ] }) }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("profile.edit"),
          className: "mt-2 block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
          children: "Profile Settings"
        }
      )
    ] })
  ] });
  return /* @__PURE__ */ jsxs(BrandingWrapper, { children: [
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-950", children: [
      sidebarOpen && /* @__PURE__ */ jsx(
        "div",
        {
          className: "lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity",
          onClick: () => setSidebarOpen(false)
        }
      ),
      /* @__PURE__ */ jsx(
        "aside",
        {
          className: cn(
            "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          ),
          children: sidebarContent
        }
      ),
      /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800", children: sidebarContent }),
      /* @__PURE__ */ jsxs("div", { className: "lg:pl-64", children: [
        /* @__PURE__ */ jsx(
          Topbar,
          {
            workspace: null,
            workspaces: [],
            user: auth?.user || null,
            onMenuClick: () => setSidebarOpen(!sidebarOpen)
          }
        ),
        /* @__PURE__ */ jsx("main", { className: "p-4 lg:p-6", children })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(GlobalFlashHandler, {}),
    /* @__PURE__ */ jsx(PlatformLiveChatWidget, {})
  ] });
}
export {
  PlatformShell as P
};
