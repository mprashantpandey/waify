import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, useForm, router, Link } from "@inertiajs/react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { T as Textarea } from "./Textarea-x8GTiAvG.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { ArrowLeft, Phone, WifiOff, Wifi, X, Menu, Send, Smile, Paperclip, Image, MapPin, FileText, List, Square, Zap, Plus, Clock, CheckCheck, Check } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import { u as useRealtime } from "./RealtimeProvider-Dletx5Ny.js";
import { M as MessageSkeleton } from "./Skeleton-D-MdPNCd.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import axios from "axios";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
function ConversationsShow({
  account,
  conversation: initialConversation,
  messages: initialMessages = [],
  templates = [],
  lists = [],
  notes: initialNotes = [],
  audit_events: initialAuditEvents = [],
  agents = [],
  inbox_settings: inboxSettings = {
    auto_assign_enabled: false,
    auto_assign_strategy: "round_robin"
  }
}) {
  const pageProps = usePage().props;
  const resolvedConversation = initialConversation ?? pageProps?.conversation ?? null;
  const resolvedMessages = Array.isArray(initialMessages) ? initialMessages : Array.isArray(pageProps?.messages) ? pageProps.messages : [];
  const resolvedNotes = Array.isArray(initialNotes) ? initialNotes : Array.isArray(pageProps?.notes) ? pageProps.notes : [];
  const resolvedAuditEvents = Array.isArray(initialAuditEvents) ? initialAuditEvents : Array.isArray(pageProps?.audit_events) ? pageProps.audit_events : [];
  const resolvedAgents = Array.isArray(agents) ? agents : Array.isArray(pageProps?.agents) ? pageProps.agents : [];
  const resolvedTemplates = Array.isArray(templates) ? templates : Array.isArray(pageProps?.templates) ? pageProps.templates : [];
  const resolvedLists = Array.isArray(lists) ? lists : Array.isArray(pageProps?.lists) ? pageProps.lists : [];
  if (!resolvedConversation) {
    return /* @__PURE__ */ jsxs(AppShell, { children: [
      /* @__PURE__ */ jsx(Head, { title: "Conversation" }),
      /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-600 dark:text-gray-300", children: "Unable to load conversation data. Please refresh the page." })
    ] });
  }
  const toArray = (value) => Array.isArray(value) ? value : [];
  const normalizedMessages = resolvedMessages;
  const normalizedNotes = resolvedNotes;
  const normalizedAuditEvents = resolvedAuditEvents;
  const normalizedAgents = resolvedAgents;
  const normalizedTemplates = resolvedTemplates;
  const normalizedLists = resolvedLists;
  const { subscribe, connected } = useRealtime();
  const { addToast } = useToast();
  const { auth } = usePage().props;
  const currentUserId = auth?.user?.id;
  const notifyAssignmentEnabled = auth?.user?.notify_assignment_enabled ?? true;
  const notifyMentionEnabled = auth?.user?.notify_mention_enabled ?? true;
  const soundEnabled = auth?.user?.notify_sound_enabled ?? true;
  const [messages, setMessages] = useState(normalizedMessages);
  const [conversation, setConversation] = useState(resolvedConversation);
  const [loading, setLoading] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLists, setShowLists] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [interactiveButtons, setInteractiveButtons] = useState([
    { id: "", text: "" }
  ]);
  const [buttonBodyText, setButtonBodyText] = useState("");
  const [buttonHeaderText, setButtonHeaderText] = useState("");
  const [buttonFooterText, setButtonFooterText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [locationInput, setLocationInput] = useState({ label: "", lat: "", lng: "" });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [notes, setNotes] = useState(normalizedNotes);
  const [auditEvents, setAuditEvents] = useState(normalizedAuditEvents);
  const [noteDraft, setNoteDraft] = useState("");
  const [metaUpdating, setMetaUpdating] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(null);
  const lastMessageIdRef = useRef(Math.max(...normalizedMessages.map((m) => m.id), 0));
  const processedMessageIds = useRef(new Set(normalizedMessages.map((m) => m.id)));
  const lastNoteIdRef = useRef(Math.max(...normalizedNotes.map((n) => n.id), 0));
  const lastAuditIdRef = useRef(Math.max(...normalizedAuditEvents.map((e) => e.id), 0));
  const assignedToRef = useRef(initialConversation.assigned_to ?? null);
  const { data, setData, post, processing, errors, reset } = useForm({
    message: ""
  });
  useEffect(() => {
    if (!resolvedConversation) return;
    setConversation(resolvedConversation);
    setMessages(normalizedMessages);
    setNotes(normalizedNotes);
    setAuditEvents(normalizedAuditEvents);
    lastMessageIdRef.current = Math.max(...normalizedMessages.map((m) => m.id), 0);
    processedMessageIds.current = new Set(normalizedMessages.map((m) => m.id));
    lastNoteIdRef.current = Math.max(...normalizedNotes.map((n) => n.id), 0);
    lastAuditIdRef.current = Math.max(...normalizedAuditEvents.map((e) => e.id), 0);
  }, [
    resolvedConversation?.id,
    normalizedMessages.length,
    normalizedNotes.length,
    normalizedAuditEvents.length
  ]);
  const emojiList = ["😀", "😁", "😂", "🤣", "😍", "😘", "😊", "🥰", "😎", "🤝", "👍", "🙏", "🎉", "🔥", "✨", "💡", "😢", "😮", "😡", "🤔", "😅", "🙌", "✅", "❌"];
  const quickReplies = [
    { id: "greeting", label: "Greeting", text: "Hi! How can I help you today?" },
    { id: "followup", label: "Follow-up", text: "Just checking in—did that solve the issue?" },
    { id: "thanks", label: "Thanks", text: "Thanks for reaching out! We’re on it." },
    { id: "handover", label: "Handover", text: "I’m looping in a specialist to assist you." }
  ];
  const availableTemplates = normalizedTemplates;
  const agentMap = new Map(normalizedAgents.map((agent) => [agent.id, agent]));
  const mentionTokens = useMemo(() => {
    if (!auth?.user) return [];
    const name = auth.user.name || "";
    const email = auth.user.email || "";
    const simpleName = name.split(" ")[0] || "";
    const compactName = name.replace(/\s+/g, "");
    return [email, name, simpleName, compactName].filter(Boolean).map((token) => `@${token.toLowerCase()}`);
  }, [auth?.user]);
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
  const noteMentionsCurrentUser = useCallback(
    (noteText, authorId) => {
      if (!notifyMentionEnabled || !currentUserId) return false;
      if (authorId && authorId === currentUserId) return false;
      const text = noteText.toLowerCase();
      return mentionTokens.some((token) => text.includes(token));
    },
    [notifyMentionEnabled, currentUserId, mentionTokens]
  );
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
  const sendList = useCallback(async () => {
    if (!selectedList) {
      addToast({ title: "List needed", description: "Please select a list to send.", variant: "warning" });
      return;
    }
    try {
      await axios.post(
        route("app.whatsapp.conversations.send-list", {
          conversation: conversation.id
        }),
        {
          list_id: selectedList.id
        }
      );
      addToast({ title: "List sent", variant: "success" });
      setShowLists(false);
      setSelectedList(null);
    } catch (error) {
      addToast({
        title: "Failed to send list",
        description: error?.response?.data?.message || "Please try again",
        variant: "error"
      });
    }
  }, [addToast, conversation.id, selectedList, account.slug]);
  const sendInteractiveButtons = useCallback(async () => {
    const validButtons = interactiveButtons.filter((btn) => btn.id.trim() && btn.text.trim());
    if (validButtons.length === 0) {
      addToast({ title: "Buttons needed", description: "Please add at least one button.", variant: "warning" });
      return;
    }
    if (!buttonBodyText.trim()) {
      addToast({ title: "Body text needed", description: "Please enter body text.", variant: "warning" });
      return;
    }
    try {
      await axios.post(
        route("app.whatsapp.conversations.send-buttons", {
          conversation: conversation.id
        }),
        {
          body_text: buttonBodyText,
          buttons: validButtons,
          header_text: buttonHeaderText || null,
          footer_text: buttonFooterText || null
        }
      );
      addToast({ title: "Interactive buttons sent", variant: "success" });
      setShowButtons(false);
      setInteractiveButtons([{ id: "", text: "" }]);
      setButtonBodyText("");
      setButtonHeaderText("");
      setButtonFooterText("");
    } catch (error) {
      addToast({
        title: "Failed to send buttons",
        description: error?.response?.data?.message || "Please try again",
        variant: "error"
      });
    }
  }, [addToast, conversation.id, interactiveButtons, buttonBodyText, buttonHeaderText, buttonFooterText, account.slug]);
  const addButton = () => {
    if (interactiveButtons.length >= 3) {
      addToast({ title: "Maximum 3 buttons allowed", variant: "warning" });
      return;
    }
    setInteractiveButtons([...interactiveButtons, { id: "", text: "" }]);
  };
  const removeButton = (index) => {
    const buttons = [...interactiveButtons];
    buttons.splice(index, 1);
    if (buttons.length === 0) {
      buttons.push({ id: "", text: "" });
    }
    setInteractiveButtons(buttons);
  };
  const updateButton = (index, field, value) => {
    const buttons = [...interactiveButtons];
    buttons[index] = { ...buttons[index], [field]: value };
    setInteractiveButtons(buttons);
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
  }, [addToast, conversation.id, locationInput, account.slug]);
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
  }, [addToast, attachments, conversation.id, account.slug]);
  const sendTemplate = useCallback(async () => {
    if (!selectedTemplate) return;
    try {
      await axios.post(
        route("app.whatsapp.conversations.send-template", {
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
  }, [addToast, conversation.id, selectedTemplate, templateVariables, account.slug]);
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
    if (!account?.id || !conversation?.id) return;
    const conversationChannel = `account.${account.id}.whatsapp.conversation.${conversation.id}`;
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
            status: data2.conversation.status ?? prev.status,
            assigned_to: data2.conversation.assignee_id ?? prev.assigned_to,
            priority: data2.conversation.priority ?? prev.priority
          }));
          if (currentUserId && notifyAssignmentEnabled && data2.conversation.assignee_id === currentUserId && assignedToRef.current !== currentUserId) {
            addToast({
              title: "Conversation assigned",
              description: "This chat was assigned to you.",
              variant: "info",
              duration: 3e3
            });
            playNotificationSound();
          }
          assignedToRef.current = data2.conversation.assignee_id ?? assignedToRef.current;
        }
      }
    );
    const unsubscribeNoteAdded = subscribe(
      conversationChannel,
      ".whatsapp.note.added",
      (data2) => {
        if (data2.note) {
          setNotes((prev) => [data2.note, ...prev]);
          lastNoteIdRef.current = Math.max(lastNoteIdRef.current, data2.note.id);
          if (noteMentionsCurrentUser(data2.note.note || "", data2.note.created_by?.id)) {
            addToast({
              title: "You were mentioned",
              description: data2.note.note?.slice(0, 80) || "A note mentioned you.",
              variant: "info",
              duration: 4e3
            });
            playNotificationSound();
          }
        }
      }
    );
    const unsubscribeAuditAdded = subscribe(
      conversationChannel,
      ".whatsapp.audit.added",
      (data2) => {
        if (data2.audit_event) {
          setAuditEvents((prev) => [data2.audit_event, ...prev]);
          lastAuditIdRef.current = Math.max(lastAuditIdRef.current, data2.audit_event.id);
        }
      }
    );
    return () => {
      unsubscribeMessageCreated();
      unsubscribeMessageUpdated();
      unsubscribeConversationUpdated();
      unsubscribeNoteAdded();
      unsubscribeAuditAdded();
    };
  }, [
    account?.id,
    conversation?.id,
    subscribe,
    addToast,
    currentUserId,
    notifyAssignmentEnabled,
    noteMentionsCurrentUser,
    playNotificationSound
  ]);
  useEffect(() => {
    if (!account?.id || !conversation?.id) {
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
            conversation: conversation.id
          }),
          {
            params: {
              after_message_id: lastMessageIdRef.current,
              after_note_id: lastNoteIdRef.current,
              after_audit_id: lastAuditIdRef.current
            }
          }
        );
        const newMessagesFromServer = toArray(response.data?.new_messages);
        const updatedMessagesFromServer = toArray(response.data?.updated_messages);
        const newNotesFromServer = toArray(response.data?.new_notes);
        const newAuditEventsFromServer = toArray(response.data?.new_audit_events);
        if (newMessagesFromServer.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = newMessagesFromServer.filter(
              (m) => !existingIds.has(m.id)
            );
            return [...prev, ...newMessages].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
          lastMessageIdRef.current = Math.max(
            ...newMessagesFromServer.map((m) => m.id),
            lastMessageIdRef.current
          );
        }
        if (updatedMessagesFromServer.length > 0) {
          setMessages(
            (prev) => prev.map((msg) => {
              const updated = updatedMessagesFromServer.find(
                (um) => um.id === msg.id
              );
              return updated ? { ...msg, ...updated } : msg;
            })
          );
        }
        if (newNotesFromServer.length > 0) {
          setNotes((prev) => [...newNotesFromServer.slice().reverse(), ...prev]);
          lastNoteIdRef.current = Math.max(
            ...newNotesFromServer.map((n) => n.id),
            lastNoteIdRef.current
          );
        }
        if (newAuditEventsFromServer.length > 0) {
          setAuditEvents((prev) => [...newAuditEventsFromServer.slice().reverse(), ...prev]);
          lastAuditIdRef.current = Math.max(
            ...newAuditEventsFromServer.map((e) => e.id),
            lastAuditIdRef.current
          );
        }
        if (response.data.conversation) {
          setConversation((prev) => ({ ...prev, ...response.data.conversation }));
        }
      } catch (error) {
        console.error("[Conversation] Polling error:", error);
      }
    };
    const intervalMs = connected ? 12e3 : 7e3;
    const interval = setInterval(poll, intervalMs);
    setPollingInterval(interval);
    poll();
    return () => {
      clearInterval(interval);
    };
  }, [connected, account?.id, conversation?.id]);
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
          const msg = Array.isArray(errors2?.message) ? errors2.message[0] : errors2?.message;
          const detail = Array.isArray(errors2?.message_detail) ? errors2.message_detail[0] : errors2?.message_detail;
          const is24h = msg === "outside_24h" || typeof msg === "string" && (msg.includes("template") || msg.includes("24 hour") || msg.includes("recovery"));
          addToast({
            title: is24h ? "Use a template to start the conversation" : "Failed to send message",
            description: detail || msg || (is24h ? "Send a template message using the template button above." : "Please try again"),
            variant: "error",
            duration: 8e3
          });
          if (is24h) {
            setTimeout(() => {
              const templateSection = document.querySelector("[data-template-section]");
              templateSection?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 300);
          }
        }
      }
    );
  }, [processing, data.message, attachments.length, sendAttachments, post, account.slug, conversation.id, reset, addToast]);
  const submitNote = async () => {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    try {
      const response = await axios.post(
        route("app.whatsapp.conversations.notes.store", {
          conversation: conversation.id
        }),
        { note: trimmed }
      );
      if (response.data?.note) {
        setNotes((prev) => [response.data.note, ...prev]);
        lastNoteIdRef.current = Math.max(lastNoteIdRef.current, response.data.note.id);
      }
      setNoteDraft("");
      addToast({ title: "Note added", variant: "success" });
    } catch (error) {
      addToast({
        title: "Failed to add note",
        description: error?.response?.data?.message || "Please try again",
        variant: "error"
      });
    }
  };
  const updateConversationMeta = useCallback(
    (updates) => {
      if (metaUpdating) return;
      setMetaUpdating(true);
      router.post(
        route("app.whatsapp.conversations.update", {
          conversation: conversation.id
        }),
        updates,
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            setConversation((prev) => ({
              ...prev,
              ...updates
            }));
            addToast({
              title: "Conversation updated",
              variant: "success",
              duration: 2e3
            });
          },
          onError: (errs) => {
            addToast({
              title: "Update failed",
              description: errs?.assigned_to || errs?.status || errs?.priority || "Please try again.",
              variant: "error"
            });
          },
          onFinish: () => {
            setMetaUpdating(false);
          }
        }
      );
    },
    [addToast, conversation.id, metaUpdating]
  );
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
              href: route("app.whatsapp.conversations.index", {}),
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
                "aria-label": "Close conversation info",
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5", "aria-hidden": true })
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
      /* @__PURE__ */ jsxs("div", { className: "flex flex-1 min-h-0 overflow-hidden", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            ref: messagesContainerRef,
            className: "flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-4 bg-[#efeae2] dark:bg-gray-950 focus:outline-none",
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
        /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex lg:w-80 xl:w-96 flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-gray-200 dark:border-gray-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg", children: conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900 dark:text-gray-100", children: conversation.contact.name || "Unknown" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: conversation.contact.wa_id })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500", children: "Connection" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: conversation.connection.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500", children: "Status" }),
                /* @__PURE__ */ jsx(Badge, { variant: conversation.status === "open" ? "success" : "default", className: "px-3 py-1", children: conversation.status })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-gray-200 dark:border-gray-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Assignment & Priority" }),
              metaUpdating && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: "Saving…" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500", children: "Assignee" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: conversation.assigned_to ?? "",
                    onChange: (e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      updateConversationMeta({ assigned_to: value });
                    },
                    disabled: metaUpdating,
                    className: "mt-1 block w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                      normalizedAgents.map((agent) => /* @__PURE__ */ jsxs("option", { value: agent.id, children: [
                        agent.name,
                        " (",
                        agent.role,
                        ")"
                      ] }, agent.id))
                    ]
                  }
                ),
                conversation.assigned_to && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                  "Assigned to ",
                  agentMap.get(conversation.assigned_to)?.name || "Unknown"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500", children: "Priority" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: conversation.priority ?? "",
                    onChange: (e) => {
                      const value = e.target.value || null;
                      updateConversationMeta({ priority: value });
                    },
                    disabled: metaUpdating,
                    className: "mt-1 block w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Not set" }),
                      /* @__PURE__ */ jsx("option", { value: "low", children: "Low" }),
                      /* @__PURE__ */ jsx("option", { value: "normal", children: "Normal" }),
                      /* @__PURE__ */ jsx("option", { value: "high", children: "High" }),
                      /* @__PURE__ */ jsx("option", { value: "urgent", children: "Urgent" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500", children: "Status" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: conversation.status,
                    onChange: (e) => updateConversationMeta({ status: e.target.value }),
                    disabled: metaUpdating,
                    className: "mt-1 block w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "open", children: "Open" }),
                      /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-700 dark:text-gray-200", children: "Auto-assign" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1", children: inboxSettings?.auto_assign_enabled ? `Enabled (${inboxSettings.auto_assign_strategy.replace("_", " ")})` : "Disabled" }),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("app.settings", {}),
                    className: "mt-2 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400",
                    children: "Manage inbox settings"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-gray-200 dark:border-gray-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Internal Notes" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: notes.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  value: noteDraft,
                  onChange: (e) => setNoteDraft(e.target.value),
                  placeholder: "Add a private note...",
                  className: "min-h-[80px] rounded-xl"
                }
              ),
              /* @__PURE__ */ jsx(Button, { type: "button", onClick: submitNote, className: "w-full bg-[#25D366] hover:bg-[#1DAA57] text-white", children: "Add Note" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3", children: [
              notes.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "No notes yet." }),
              notes.map((note) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap", children: note.note }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 text-[11px] text-gray-500 dark:text-gray-400", children: [
                  note.created_by?.name || "System",
                  " • ",
                  new Date(note.created_at).toLocaleString()
                ] })
              ] }, note.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Audit Events" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: auditEvents.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              auditEvents.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "No audit events yet." }),
              auditEvents.map((event) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-gray-500", children: event.event_type.replaceAll("_", " ") }),
                event.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-700 dark:text-gray-200", children: event.description }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 text-[11px] text-gray-500 dark:text-gray-400", children: [
                  event.actor?.name || "System",
                  " • ",
                  new Date(event.created_at).toLocaleString()
                ] })
              ] }, event.id))
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-[#f0f2f5] dark:bg-gray-900 p-3 sticky bottom-0", children: [
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
                  "data-template-section": true,
                  onClick: () => setShowTemplates((prev) => !prev),
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  "aria-label": "Send template message",
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
                  onClick: () => {
                    setShowLists((prev) => !prev);
                    setShowButtons(false);
                  },
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  children: [
                    /* @__PURE__ */ jsx(List, { className: "h-3.5 w-3.5" }),
                    "Lists"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setShowButtons((prev) => !prev);
                    setShowLists(false);
                  },
                  className: "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  children: [
                    /* @__PURE__ */ jsx(Square, { className: "h-3.5 w-3.5" }),
                    "Buttons"
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
          showTemplates && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800", "data-template-section": true, children: [
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
          showLists && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
              normalizedLists.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
                "No lists available.",
                " ",
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("app.whatsapp.lists.index"),
                    className: "font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300",
                    children: "Create lists in the Lists section"
                  }
                ),
                "."
              ] }),
              normalizedLists.map((list) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setSelectedList(list),
                  className: cn(
                    "w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700",
                    selectedList?.id === list.id ? "border-emerald-400 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:text-emerald-100" : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ),
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold", children: list.name }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: list.description || list.button_text })
                  ]
                },
                list.id
              ))
            ] }),
            selectedList && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200", children: [
                "Selected List: ",
                selectedList.name
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "secondary",
                    onClick: () => {
                      setSelectedList(null);
                    },
                    children: "Clear"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    onClick: sendList,
                    className: "bg-[#25D366] hover:bg-[#1DAA57] text-white",
                    children: "Send List"
                  }
                )
              ] })
            ] })
          ] }),
          showButtons && /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block", children: "Body Text * (Max 1024 chars)" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  value: buttonBodyText,
                  onChange: (e) => setButtonBodyText(e.target.value),
                  placeholder: "Enter message body text",
                  maxLength: 1024,
                  rows: 3,
                  className: "rounded-xl"
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                buttonBodyText.length,
                "/1024 characters"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block", children: "Header Text (Optional, Max 60 chars)" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: buttonHeaderText,
                  onChange: (e) => setButtonHeaderText(e.target.value),
                  placeholder: "Optional header text",
                  maxLength: 60,
                  className: "rounded-xl"
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                buttonHeaderText.length,
                "/60 characters"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block", children: "Footer Text (Optional, Max 60 chars)" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: buttonFooterText,
                  onChange: (e) => setButtonFooterText(e.target.value),
                  placeholder: "Optional footer text",
                  maxLength: 60,
                  className: "rounded-xl"
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                buttonFooterText.length,
                "/60 characters"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300", children: "Buttons (Max 3)" }),
                interactiveButtons.length < 3 && /* @__PURE__ */ jsxs(
                  Button,
                  {
                    type: "button",
                    onClick: addButton,
                    variant: "secondary",
                    size: "sm",
                    children: [
                      /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3 mr-1" }),
                      "Add Button"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: interactiveButtons.map((button, index) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2",
                  children: [
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        value: button.id,
                        onChange: (e) => updateButton(index, "id", e.target.value),
                        placeholder: "Button ID (unique)",
                        maxLength: 256,
                        className: "flex-1 text-sm rounded-lg"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        value: button.text,
                        onChange: (e) => updateButton(index, "text", e.target.value),
                        placeholder: "Button text (max 20)",
                        maxLength: 20,
                        className: "flex-1 text-sm rounded-lg"
                      }
                    ),
                    interactiveButtons.length > 1 && /* @__PURE__ */ jsx(
                      Button,
                      {
                        type: "button",
                        onClick: () => removeButton(index),
                        variant: "ghost",
                        size: "sm",
                        children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3 text-red-500" })
                      }
                    )
                  ]
                },
                index
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  onClick: () => {
                    setShowButtons(false);
                    setInteractiveButtons([{ id: "", text: "" }]);
                    setButtonBodyText("");
                    setButtonHeaderText("");
                    setButtonFooterText("");
                  },
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  onClick: sendInteractiveButtons,
                  className: "bg-[#25D366] hover:bg-[#1DAA57] text-white",
                  children: "Send Buttons"
                }
              )
            ] })
          ] }) }),
          attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: attachments.map((file, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300",
              children: [
                /* @__PURE__ */ jsx("span", { className: "truncate max-w-[160px]", children: file.name }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => removeAttachment(index), className: "text-gray-400 hover:text-gray-600", "aria-label": `Remove ${file.name}`, children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5", "aria-hidden": true }) })
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
