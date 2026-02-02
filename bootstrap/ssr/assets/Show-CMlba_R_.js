import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { u as useRealtime, B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { ArrowLeft, Phone, WifiOff, Wifi, X, Menu, Send, Smile, Paperclip, Image, MapPin, FileText, Zap, Clock, CheckCheck, Check } from "lucide-react";
import { c as cn } from "./utils-H80jjgLf.js";
import { M as MessageSkeleton } from "./Skeleton-D-MdPNCd.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import axios from "axios";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "laravel-echo";
import "pusher-js";
import "clsx";
import "tailwind-merge";
function ConversationsShow({
  workspace,
  conversation: initialConversation,
  messages: initialMessages,
  templates
}) {
  const { subscribe, connected } = useRealtime();
  const { addToast } = useToast();
  const [messages, setMessages] = useState(initialMessages);
  const [conversation, setConversation] = useState(initialConversation);
  const [loading, setLoading] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [locationInput, setLocationInput] = useState({ label: "", lat: "", lng: "" });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [recentEmojis, setRecentEmojis] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(null);
  const lastMessageIdRef = useRef(Math.max(...initialMessages.map((m) => m.id), 0));
  const processedMessageIds = useRef(new Set(initialMessages.map((m) => m.id)));
  const { data, setData, post, processing, errors, reset } = useForm({
    message: ""
  });
  const emojiList = ["😀", "😁", "😂", "🤣", "😍", "😘", "😊", "🥰", "😎", "🤝", "👍", "🙏", "🎉", "🔥", "✨", "💡", "😢", "😮", "😡", "🤔", "😅", "🙌", "✅", "❌"];
  const quickReplies = [
    { id: "greeting", label: "Greeting", text: "Hi! How can I help you today?" },
    { id: "followup", label: "Follow-up", text: "Just checking in—did that solve the issue?" },
    { id: "thanks", label: "Thanks", text: "Thanks for reaching out! We’re on it." },
    { id: "handover", label: "Handover", text: "I’m looping in a specialist to assist you." }
  ];
  const availableTemplates = templates || [];
  const appendMessage = (text) => {
    setData("message", `${data.message || ""}${text}`);
  };
  useEffect(() => {
    const stored = localStorage.getItem("waify.recentEmojis");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentEmojis(parsed.slice(0, 12));
        }
      } catch (error) {
        console.warn("[Emoji] Failed to parse recent emojis");
      }
    }
  }, []);
  const handleEmojiSelect = (emoji) => {
    appendMessage(emoji);
    setRecentEmojis((prev) => {
      const next = [emoji, ...prev.filter((item) => item !== emoji)].slice(0, 12);
      localStorage.setItem("waify.recentEmojis", JSON.stringify(next));
      return next;
    });
  };
  const insertMessage = (text) => {
    setData("message", text);
  };
  const handleAttachmentChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = "";
    addToast({
      title: "Attachment added",
      description: "Attachments will be supported for sending soon.",
      variant: "info"
    });
  };
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  const sendLocation = useCallback(async () => {
    const { label, lat, lng } = locationInput;
    if (!lat || !lng) {
      addToast({ title: "Location needed", description: "Add latitude and longitude.", variant: "warning" });
      return;
    }
    try {
      await axios.post(
        route("app.whatsapp.conversations.send-location", {
          workspace: workspace.slug,
          conversation: conversation.id
        }),
        {
          latitude: Number(lat),
          longitude: Number(lng),
          name: label || null,
          address: null
        }
      );
      addToast({ title: "Location sent", variant: "success" });
      setShowLocation(false);
      setLocationInput({ label: "", lat: "", lng: "" });
    } catch (error) {
      addToast({
        title: "Failed to send location",
        description: error?.response?.data?.message || "Please try again",
        variant: "error"
      });
    }
  }, [addToast, conversation.id, locationInput, workspace.slug]);
  const sendAttachments = useCallback(async (caption) => {
    if (attachments.length === 0) return;
    for (let i = 0; i < attachments.length; i += 1) {
      const file = attachments[i];
      const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
      const formData = new FormData();
      formData.append("type", fileType);
      formData.append("attachment", file);
      if (caption && i === 0) {
        formData.append("caption", caption);
      }
      try {
        await axios.post(
          route("app.whatsapp.conversations.send-media", {
            workspace: workspace.slug,
            conversation: conversation.id
          }),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" }
          }
        );
      } catch (error) {
        addToast({
          title: "Failed to send attachment",
          description: error?.response?.data?.message || "Please try again",
          variant: "error"
        });
        return;
      }
    }
    addToast({ title: "Attachments sent", variant: "success" });
    setAttachments([]);
  }, [addToast, attachments, conversation.id, workspace.slug]);
  const sendTemplate = useCallback(async () => {
    if (!selectedTemplate) return;
    try {
      await axios.post(
        route("app.whatsapp.conversations.send-template", {
          workspace: workspace.slug,
          conversation: conversation.id
        }),
        {
          template_id: selectedTemplate.id,
          variables: templateVariables
        }
      );
      addToast({ title: "Template sent", variant: "success" });
      setSelectedTemplate(null);
      setTemplateVariables([]);
      setShowTemplates(false);
    } catch (error) {
      addToast({
        title: "Failed to send template",
        description: error?.response?.data?.message || "Please try again",
        variant: "error"
      });
    }
  }, [addToast, conversation.id, selectedTemplate, templateVariables, workspace.slug]);
  const checkScrollPosition = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    setShouldAutoScroll(isNearBottom);
  }, []);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition();
    return () => container.removeEventListener("scroll", checkScrollPosition);
  }, [checkScrollPosition]);
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, shouldAutoScroll]);
  useEffect(() => {
    if (!workspace?.id || !conversation?.id) return;
    const conversationChannel = `private-workspace.${workspace.id}.whatsapp.conversation.${conversation.id}`;
    const unsubscribeMessageCreated = subscribe(
      conversationChannel,
      ".whatsapp.message.created",
      (data2) => {
        const newMessage = data2.message;
        if (newMessage && !processedMessageIds.current.has(newMessage.id)) {
          processedMessageIds.current.add(newMessage.id);
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
          lastMessageIdRef.current = Math.max(lastMessageIdRef.current, newMessage.id);
          if (newMessage.direction === "inbound") {
            addToast({
              title: "New message",
              description: newMessage.text_body?.substring(0, 50) || "New message received",
              variant: "info",
              duration: 3e3
            });
          }
        }
      }
    );
    const unsubscribeMessageUpdated = subscribe(
      conversationChannel,
      ".whatsapp.message.updated",
      (data2) => {
        setMessages(
          (prev) => prev.map(
            (msg) => msg.id === data2.message.id ? {
              ...msg,
              status: data2.message.status,
              error_message: data2.message.error_message,
              sent_at: data2.message.sent_at,
              delivered_at: data2.message.delivered_at,
              read_at: data2.message.read_at
            } : msg
          )
        );
      }
    );
    const unsubscribeConversationUpdated = subscribe(
      conversationChannel,
      ".whatsapp.conversation.updated",
      (data2) => {
        if (data2.conversation) {
          setConversation((prev) => ({
            ...prev,
            status: data2.conversation.status ?? prev.status
          }));
        }
      }
    );
    return () => {
      unsubscribeMessageCreated();
      unsubscribeMessageUpdated();
      unsubscribeConversationUpdated();
    };
  }, [workspace?.id, conversation?.id, subscribe, addToast]);
  useEffect(() => {
    if (connected || !workspace?.id || !conversation?.id) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      return;
    }
    const poll = async () => {
      try {
        const response = await axios.get(
          route("app.whatsapp.inbox.conversation.stream", {
            workspace: workspace.slug,
            conversation: conversation.id
          }),
          {
            params: {
              after_message_id: lastMessageIdRef.current
            }
          }
        );
        if (response.data.new_messages?.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = response.data.new_messages.filter(
              (m) => !existingIds.has(m.id)
            );
            return [...prev, ...newMessages].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
          lastMessageIdRef.current = Math.max(
            ...response.data.new_messages.map((m) => m.id),
            lastMessageIdRef.current
          );
        }
        if (response.data.updated_messages?.length > 0) {
          setMessages(
            (prev) => prev.map((msg) => {
              const updated = response.data.updated_messages.find(
                (um) => um.id === msg.id
              );
              return updated ? { ...msg, ...updated } : msg;
            })
          );
        }
        if (response.data.conversation) {
          setConversation((prev) => ({ ...prev, ...response.data.conversation }));
        }
      } catch (error) {
        console.error("[Conversation] Polling error:", error);
      }
    };
    const interval = setInterval(poll, 15e3);
    setPollingInterval(interval);
    poll();
    return () => {
      clearInterval(interval);
    };
  }, [connected, workspace?.id, workspace?.slug, conversation?.id]);
  const handleSend = useCallback(async () => {
    if (processing) return;
    const trimmed = data.message.trim();
    if (attachments.length > 0) {
      await sendAttachments(trimmed || void 0);
      reset("message");
      return;
    }
    if (!trimmed) return;
    post(
      route("app.whatsapp.conversations.send", {
        workspace: workspace.slug,
        conversation: conversation.id
      }),
      {
        onSuccess: () => {
          reset("message");
          addToast({
            title: "Message sent",
            variant: "success",
            duration: 2e3
          });
        },
        onError: (errors2) => {
          addToast({
            title: "Failed to send message",
            description: errors2.message || "Please try again",
            variant: "error"
          });
        }
      }
    );
  }, [processing, data.message, attachments.length, sendAttachments, post, workspace.slug, conversation.id, reset, addToast]);
  const submit = (e) => {
    e.preventDefault();
    handleSend();
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (e.key.toLowerCase() === "e") {
          e.preventDefault();
          setShowEmojiBar((prev) => !prev);
        }
        if (e.key.toLowerCase() === "k") {
          e.preventDefault();
          setShowQuickReplies((prev) => !prev);
        }
        if (e.key.toLowerCase() === "t") {
          e.preventDefault();
          setShowTemplates((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen, handleSend]);
  const getStatusIcon = (message) => {
    if (message.direction === "inbound") return null;
    switch (message.status) {
      case "sent":
        return /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-gray-400" });
      case "delivered":
        return /* @__PURE__ */ jsx(CheckCheck, { className: "h-3.5 w-3.5 text-gray-400" });
      case "read":
        return /* @__PURE__ */ jsx(CheckCheck, { className: "h-3.5 w-3.5 text-blue-500" });
      case "failed":
        return /* @__PURE__ */ jsx("span", { className: "text-xs text-red-500 font-medium", children: "Failed" });
      default:
        return /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-gray-400" });
    }
  };
  const renderMessageBody = (message) => {
    const payload = message.payload || {};
    if (message.type === "image" && payload.link) {
      return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: payload.link,
            alt: "Image attachment",
            className: "max-h-48 rounded-lg border border-gray-200 object-cover"
          }
        ),
        message.text_body && /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: message.text_body })
      ] });
    }
    if (message.type === "video" && payload.link) {
      return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("video", { controls: true, className: "max-h-48 rounded-lg border border-gray-200 w-full", children: /* @__PURE__ */ jsx("source", { src: payload.link }) }),
        message.text_body && /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: message.text_body })
      ] });
    }
    if (message.type === "document" && payload.link) {
      return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: payload.link,
            target: "_blank",
            rel: "noreferrer",
            className: "inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800",
            children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
              payload.filename || "Document"
            ]
          }
        ),
        message.text_body && /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: message.text_body })
      ] });
    }
    if (message.type === "location" && payload.latitude && payload.longitude) {
      const mapUrl = `https://maps.google.com/?q=${payload.latitude},${payload.longitude}`;
      return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: mapUrl,
            target: "_blank",
            rel: "noreferrer",
            className: "inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800",
            children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
              "View location"
            ]
          }
        ),
        payload.name && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700", children: payload.name }),
        payload.address && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: payload.address })
      ] });
    }
    return message.text_body ? /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap break-words leading-relaxed", children: message.text_body }) : null;
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${conversation.contact.name || conversation.contact.wa_id} - Inbox` }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-[#075E54] text-white", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: route("app.whatsapp.conversations.index", { workspace: workspace.slug }),
              className: "inline-flex items-center text-sm font-medium text-white/90 hover:text-white transition-colors",
              "aria-label": "Back to conversations",
              children: [
                /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Back" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0", children: conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-base sm:text-lg font-semibold truncate", children: conversation.contact.name || conversation.contact.wa_id }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-white/80", children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: conversation.contact.wa_id }),
              /* @__PURE__ */ jsx("span", { className: "text-white/60", children: "•" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: conversation.connection.name }),
              !connected && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "text-white/60", children: "•" }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(WifiOff, { className: "h-3 w-3 text-amber-200" }),
                  "Polling"
                ] })
              ] }),
              connected && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Wifi, { className: "h-3 w-3 text-green-200" }),
                "Live"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline-flex rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wide", children: conversation.status }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMobileDrawerOpen(!mobileDrawerOpen),
              className: "lg:hidden p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors",
              "aria-label": "Toggle menu",
              children: mobileDrawerOpen ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
            }
          )
        ] })
      ] }),
      mobileDrawerOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden",
            onClick: () => setMobileDrawerOpen(false),
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden p-6 border-l border-gray-200 dark:border-gray-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: "Conversation Info" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setMobileDrawerOpen(false),
                className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg", children: conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900 dark:text-gray-100", children: conversation.contact.name || "Unknown" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: conversation.contact.wa_id })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Connection" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: conversation.connection.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Status" }),
                /* @__PURE__ */ jsx(Badge, { variant: conversation.status === "open" ? "success" : "default", className: "px-3 py-1", children: conversation.status })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: messagesContainerRef,
          className: "flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#efeae2] dark:bg-gray-950 focus:outline-none",
          style: {
            backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "16px 16px"
          },
          tabIndex: 0,
          children: [
            loading ? /* @__PURE__ */ jsx(Fragment, { children: [...Array(3)].map((_, i) => /* @__PURE__ */ jsx(MessageSkeleton, {}, i)) }) : messages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
              /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 dark:bg-gray-900 mb-4 shadow-sm", children: /* @__PURE__ */ jsx(Send, { className: "h-8 w-8 text-gray-400" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 font-medium mb-1", children: "No messages yet" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 dark:text-gray-500", children: "Start the conversation!" })
            ] }) : messages.map((message, index) => {
              const showDateSeparator = index === 0 || new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
              return /* @__PURE__ */ jsxs("div", { children: [
                showDateSeparator && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center my-4", children: /* @__PURE__ */ jsx("div", { className: "px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400", children: new Date(message.created_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }) }) }),
                /* @__PURE__ */ jsx("div", { className: cn("flex", message.direction === "outbound" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: cn(
                      "max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm",
                      message.direction === "outbound" ? "bg-[#d9fdd3] text-gray-900 rounded-tr-md" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-md"
                    ),
                    children: [
                      renderMessageBody(message),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1.5 mt-2", children: [
                        /* @__PURE__ */ jsx("span", { className: cn(
                          "text-[11px]",
                          message.direction === "outbound" ? "text-gray-600" : "text-gray-500 dark:text-gray-400"
                        ), children: new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        }) }),
                        getStatusIcon(message)
                      ] })
                    ]
                  }
                ) })
              ] }, message.id);
            }),
            /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-800 bg-[#f0f2f5] dark:bg-gray-900 p-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setShowEmojiBar((prev) => !prev),
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  children: [
                    /* @__PURE__ */ jsx(Smile, { className: "h-3.5 w-3.5" }),
                    "Emoji"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => fileInputRef.current?.click(),
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  children: [
                    /* @__PURE__ */ jsx(Paperclip, { className: "h-3.5 w-3.5" }),
                    "Attach"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => fileInputRef.current?.click(),
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  children: [
                    /* @__PURE__ */ jsx(Image, { className: "h-3.5 w-3.5" }),
                    "Photo/Video"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setShowLocation((prev) => !prev),
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
                    "Location"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setShowTemplates((prev) => !prev),
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  children: [
                    /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
                    "Templates"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setShowQuickReplies((prev) => !prev),
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  children: [
                    /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
                    "Quick Replies"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  multiple: true,
                  accept: "image/*,video/*,application/pdf",
                  className: "hidden",
                  onChange: handleAttachmentChange
                }
              )
            ] }),
            showEmojiBar && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 mb-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 p-3 text-lg shadow-lg dark:border-gray-700 dark:bg-gray-800", children: [
              /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: emojiSearch,
                  onChange: (e) => setEmojiSearch(e.target.value),
                  placeholder: "Search emojis",
                  className: "rounded-xl text-sm"
                }
              ) }),
              recentEmojis.length > 0 && /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500", children: "Recent" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: recentEmojis.map((emoji) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleEmojiSelect(emoji),
                    className: "rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700",
                    children: emoji
                  },
                  `recent-${emoji}`
                )) })
              ] }),
              (emojiSearch.trim() ? emojiList.filter((emoji) => emoji.includes(emojiSearch.trim())) : emojiList).map((emoji) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleEmojiSelect(emoji),
                  className: "rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700",
                  children: emoji
                },
                emoji
              ))
            ] })
          ] }),
          showLocation && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: locationInput.label,
                  onChange: (e) => setLocationInput((prev) => ({ ...prev, label: e.target.value })),
                  placeholder: "Label (optional)",
                  className: "rounded-xl"
                }
              ),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: locationInput.lat,
                  onChange: (e) => setLocationInput((prev) => ({ ...prev, lat: e.target.value })),
                  placeholder: "Latitude",
                  className: "rounded-xl"
                }
              ),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: locationInput.lng,
                  onChange: (e) => setLocationInput((prev) => ({ ...prev, lng: e.target.value })),
                  placeholder: "Longitude",
                  className: "rounded-xl"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowLocation(false), children: "Cancel" }),
              /* @__PURE__ */ jsx(Button, { type: "button", onClick: sendLocation, className: "bg-[#25D366] hover:bg-[#1DAA57] text-white", children: "Send Location" })
            ] })
          ] }),
          showQuickReplies && /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800", children: /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: quickReplies.map((reply) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                insertMessage(reply.text);
                setShowQuickReplies(false);
              },
              className: "w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700",
              children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: reply.label }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: reply.text })
              ]
            },
            reply.id
          )) }) }),
          showTemplates && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
              availableTemplates.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No approved templates found for this connection." }),
              availableTemplates.map((template) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setSelectedTemplate(template);
                    setTemplateVariables(
                      Array.from({ length: template.variable_count || 0 }, () => "")
                    );
                  },
                  className: cn(
                    "w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700",
                    selectedTemplate?.id === template.id ? "border-emerald-400 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:text-emerald-100" : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ),
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold", children: template.name }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: template.body_text || "Template message" })
                  ]
                },
                template.id
              ))
            ] }),
            selectedTemplate && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Fill template variables" }),
              templateVariables.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "This template has no variables." }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
                selectedTemplate.header_count > 0 && /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Header variables" }),
                  templateVariables.slice(0, selectedTemplate.header_count).map((value, index) => /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      value,
                      onChange: (e) => {
                        const next = [...templateVariables];
                        next[index] = e.target.value;
                        setTemplateVariables(next);
                      },
                      placeholder: `Header variable ${index + 1}`,
                      className: "rounded-xl"
                    },
                    `${selectedTemplate.id}-header-${index}`
                  ))
                ] }),
                selectedTemplate.body_count > 0 && /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Body variables" }),
                  templateVariables.slice(
                    selectedTemplate.header_count,
                    selectedTemplate.header_count + selectedTemplate.body_count
                  ).map((value, index) => /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      value,
                      onChange: (e) => {
                        const next = [...templateVariables];
                        next[selectedTemplate.header_count + index] = e.target.value;
                        setTemplateVariables(next);
                      },
                      placeholder: `Body variable ${index + 1}`,
                      className: "rounded-xl"
                    },
                    `${selectedTemplate.id}-body-${index}`
                  ))
                ] }),
                selectedTemplate.button_count > 0 && /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Button variables" }),
                  templateVariables.slice(
                    selectedTemplate.header_count + selectedTemplate.body_count,
                    selectedTemplate.variable_count
                  ).map((value, index) => /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      value,
                      onChange: (e) => {
                        const next = [...templateVariables];
                        next[selectedTemplate.header_count + selectedTemplate.body_count + index] = e.target.value;
                        setTemplateVariables(next);
                      },
                      placeholder: `Button variable ${index + 1}`,
                      className: "rounded-xl"
                    },
                    `${selectedTemplate.id}-button-${index}`
                  ))
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "secondary",
                    onClick: () => {
                      setSelectedTemplate(null);
                      setTemplateVariables([]);
                    },
                    children: "Clear"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    onClick: sendTemplate,
                    className: "bg-[#25D366] hover:bg-[#1DAA57] text-white",
                    children: "Send Template"
                  }
                )
              ] })
            ] })
          ] }),
          attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: attachments.map((file, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300",
              children: [
                /* @__PURE__ */ jsx("span", { className: "truncate max-w-[160px]", children: file.name }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => removeAttachment(index), className: "text-gray-400 hover:text-gray-600", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
              ]
            },
            `${file.name}-${index}`
          )) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              TextInput,
              {
                value: data.message,
                onChange: (e) => setData("message", e.target.value),
                placeholder: "Type a message",
                className: "flex-1 rounded-full bg-white dark:bg-gray-800",
                disabled: processing,
                autoFocus: true,
                "aria-label": "Message input"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                disabled: processing || !data.message.trim() && attachments.length === 0,
                "aria-label": "Send message",
                className: "bg-[#25D366] hover:bg-[#1DAA57] text-white rounded-full px-5",
                children: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        errors.message && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-2", role: "alert", children: errors.message })
      ] })
    ] })
  ] });
}
export {
  ConversationsShow as default
};
