import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { usePage, router, Head, Link } from "@inertiajs/react";
import { useState, useEffect, useRef, useCallback, useMemo, Fragment as Fragment$1 } from "react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { Wifi, WifiOff, BellRing, X, CheckSquare, Edit3, Search, Star, MessageSquare, Clock, Zap, User, ArrowLeft, ChevronDown, MoreVertical, RotateCcw, CheckCircle, Flag, UserX, Trash2, PanelRight, Play, AlertCircle, FileText, Pause, Lock, Reply, Phone, ClipboardList, Image, Mic, File as File$1, MapPin, ExternalLink, Plus, ShoppingBag, Send, Sparkles, Check, Smile, Paperclip, StickyNote, CreditCard, Film, CheckCheck, Link2 } from "lucide-react";
import { u as useRealtime } from "./RealtimeProvider-D1qLzQY9.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import { i as isSameAccountId } from "./utils-B2ZNUmII.js";
import axios from "axios";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-CZn0jBQL.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./CookieConsentBanner-X10ew4Dy.js";
import "laravel-echo";
import "pusher-js";
import "clsx";
import "tailwind-merge";
function Skeleton({ className = "" }) {
  return /* @__PURE__ */ jsx("div", { className: `waify-skeleton ${className}` });
}
function ConversationSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-10 rounded-full" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-32" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-16" })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-2/3" })
    ] })
  ] }) });
}
function shortcutFromButtonLabel(label) {
  return label.toLowerCase().replace(/[^a-z0-9\s_-]/g, "").replace(/[\s-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "button";
}
const callSessionSdpFrom = (value) => {
  const candidates = [
    value?.session?.sdp,
    value?.call?.metadata?.call?.session?.sdp,
    value?.call?.metadata?.connect_response?.session?.sdp,
    value?.call?.metadata?.connect_response?.calls?.[0]?.session?.sdp,
    value?.metadata?.call?.session?.sdp,
    value?.metadata?.connect_response?.session?.sdp,
    value?.metadata?.connect_response?.calls?.[0]?.session?.sdp,
    value?.metadata?.first_sdp,
    value?.metadata?.latest_sdp
  ];
  return candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length > 0) || null;
};
const isIncomingActionableCall = (call) => {
  if (!call) return false;
  return call.direction === "inbound" && ["received", "ringing", "queued"].includes(call.status);
};
const isIncomingVisibleCall = (call) => {
  if (!call) return false;
  return call.direction === "inbound" && ["received", "ringing", "queued", "initiated", "answered"].includes(call.status);
};
const mergeCallRecords = (current, incoming) => {
  if (!incoming.length) return current;
  const byId = new Map(current.map((call) => [Number(call.id), call]));
  incoming.forEach((call) => {
    if (!call?.id) return;
    byId.set(Number(call.id), { ...byId.get(Number(call.id)) ?? {}, ...call });
  });
  return Array.from(byId.values()).sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()).slice(0, 100);
};
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
      slug: value?.contact?.slug ?? null,
      wa_id: waId,
      name: name || waId || "Unknown",
      display_phone: value?.contact?.display_phone ?? null,
      is_unresolved_lid: Boolean(value?.contact?.is_unresolved_lid ?? false),
      email: value?.contact?.email ?? null,
      phone: value?.contact?.phone ?? null,
      company: value?.contact?.company ?? null,
      notes: value?.contact?.notes ?? null,
      status: value?.contact?.status ?? null,
      source: value?.contact?.source ?? null,
      ctwa: value?.contact?.ctwa ?? null,
      tags: Array.isArray(value?.contact?.tags) ? value.contact.tags : []
    },
    status: String(value.status ?? "open"),
    last_message_preview: value.last_message_preview ?? null,
    last_message_at: value.last_message_at ?? null,
    last_inbound_message_at: value.last_inbound_message_at ?? null,
    connection: {
      id: connectionId,
      name: String(value?.connection?.name ?? "Unknown"),
      slug: value?.connection?.slug ? String(value.connection.slug) : void 0,
      calling_status: value?.connection?.calling_status ?? null,
      calling_enabled: Boolean(value?.connection?.calling_enabled ?? false),
      calling_webhook_subscribed: Boolean(value?.connection?.calling_webhook_subscribed ?? false)
    },
    assigned_to: value.assigned_to == null ? null : Number(value.assigned_to),
    priority: value.priority ?? null,
    automation_state: value.automation_state ?? null,
    automation_processing: Boolean(value.automation_processing ?? false),
    automation_processing_mode: value.automation_processing_mode ?? null,
    bot_paused: Boolean(value.bot_paused ?? false),
    bot_paused_reason: value.bot_paused_reason ?? null,
    handoff_status: value.handoff_status ?? null,
    handoff_reason: value.handoff_reason ?? null,
    unread_count: Number(value.unread_count ?? value.unread ?? 0)
  };
};
const normalizeConversationList = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeConversation).filter((item) => item !== null);
};
const contactDisplayPhone = (conversation) => {
  if (!conversation) return "";
  return conversation.contact.display_phone || conversation.contact.phone || conversation.contact.wa_id || "";
};
const conversationSourceLabel = (conversation) => {
  if (!conversation) return "WhatsApp";
  if (conversation.contact.ctwa?.source_type || conversation.contact.ctwa?.source || conversation.contact.ctwa?.ctwa_clid) {
    return "Click-to-WhatsApp";
  }
  const source = String(conversation.contact.source || "").trim();
  if (!source) return "WhatsApp";
  return source.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};
const conversationSlaLabel = (conversation) => {
  if (!conversation?.last_message_at) return { label: "No SLA", tone: "muted" };
  if (conversation.status === "closed") return { label: "Resolved", tone: "ok" };
  const timestamp = new Date(conversation.last_message_at).getTime();
  if (!Number.isFinite(timestamp)) return { label: "No SLA", tone: "muted" };
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 6e4));
  if (minutes >= 1440) return { label: `${Math.floor(minutes / 1440)}d`, tone: "danger" };
  if (minutes >= 240) return { label: `${Math.floor(minutes / 60)}h`, tone: "warn" };
  if (minutes >= 60) return { label: `${Math.floor(minutes / 60)}h`, tone: "ok" };
  return { label: `${Math.max(1, minutes)}m`, tone: "ok" };
};
const slaClasses = (tone) => {
  const classes = {
    muted: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
    ok: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    warn: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    danger: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
  };
  return classes[tone];
};
const formatReplyWindowRemaining = (milliseconds) => {
  const minutes = Math.max(1, Math.ceil(milliseconds / 6e4));
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder > 0 ? `${hours}h ${remainder}m left` : `${hours}h left`;
  }
  return `${minutes}m left`;
};
const customerServiceWindowFor = (conversation, messages = [], nowMs = Date.now()) => {
  const latestInboundFromMessages = [...messages].reverse().find((message) => message.direction === "inbound")?.created_at ?? null;
  const lastInboundAt = latestInboundFromMessages ?? conversation?.last_inbound_message_at ?? null;
  if (!lastInboundAt) {
    return {
      state: "none",
      isOpen: false,
      label: "Template required",
      detail: "No recent customer message found. Send an approved template to start the chat.",
      lastInboundAt: null,
      expiresAt: null,
      tone: "muted"
    };
  }
  const inboundTime = new Date(lastInboundAt).getTime();
  if (!Number.isFinite(inboundTime)) {
    return {
      state: "none",
      isOpen: false,
      label: "Template required",
      detail: "Latest customer message time is unavailable. Use an approved template.",
      lastInboundAt,
      expiresAt: null,
      tone: "muted"
    };
  }
  const expiresAtMs = inboundTime + 24 * 60 * 60 * 1e3;
  const remainingMs = expiresAtMs - nowMs;
  const expiresAt = new Date(expiresAtMs).toISOString();
  if (remainingMs <= 0) {
    return {
      state: "closed",
      isOpen: false,
      label: "24h window closed",
      detail: "Meta allows free-form replies only within 24 hours of the customer message. Use an approved template.",
      lastInboundAt,
      expiresAt,
      tone: "danger"
    };
  }
  const closingSoon = remainingMs <= 2 * 60 * 60 * 1e3;
  return {
    state: closingSoon ? "closing" : "open",
    isOpen: true,
    label: `Reply window ${formatReplyWindowRemaining(remainingMs)}`,
    detail: `Free-form replies allowed until ${new Date(expiresAtMs).toLocaleString()}.`,
    lastInboundAt,
    expiresAt,
    tone: closingSoon ? "warn" : "ok"
  };
};
const conversationModeLabel = (conversation) => {
  if (!conversation) return "No chat selected";
  if (conversation.automation_processing) return conversation.automation_processing_mode === "ai" ? "AI replying" : "Bot replying";
  if (conversation.bot_paused || conversation.handoff_status === "manual") return "Manual mode";
  if (conversation.automation_state) return "Automation waiting";
  return "Bot ready";
};
const timelineBadgeForMessage = (message) => {
  if (isCallTranscriptMessage(message)) {
    return null;
  }
  if (message.type === "template") {
    return {
      label: "Template sent",
      icon: FileText,
      classes: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
    };
  }
  if (message.type === "interactive") {
    const interactiveType = String(message.payload?.interactive_type ?? message.payload?.interactive?.type ?? "");
    const isPayment = interactiveType === "payment" || message.payload?.payment_link || message.payload?.payment_order_id;
    const isProduct = interactiveType.includes("product") || message.payload?.catalog_product_id || message.payload?.product_id;
    const isForm = interactiveType === "flow" || message.payload?.flow_id;
    return {
      label: isPayment ? "Payment link" : isProduct ? "Product shared" : isForm ? "WhatsApp form" : interactiveType === "list" ? "List sent" : "Buttons sent",
      icon: isPayment ? CreditCard : isProduct ? ShoppingBag : ClipboardList,
      classes: isPayment ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200" : "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200"
    };
  }
  if (message.status === "failed") {
    return {
      label: "Send failed",
      icon: AlertCircle,
      classes: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200"
    };
  }
  return null;
};
const EMOJI_QUICK = ["👍", "🙏", "😊", "🎉", "✅", "❤️", "🔥", "👋"];
const HOVER_REACTIONS = ["👍", "❤️", "😂", "🙏"];
const QUICK_REPLIES = [
  { id: "catalog", label: "Send catalog", text: "Hi {{name}}, I will send the latest catalog right away." },
  { id: "tracking", label: "Tracking update", text: "Your order is being checked. I will share the tracking link shortly." },
  { id: "callback", label: "Callback", text: "Can I arrange a quick call with our team to help you faster?" },
  { id: "thanks", label: "Thank you", text: "Thanks for confirming. Let me know if you need anything else." }
];
const INBOX_LABELS = [
  { id: "vip", label: "VIP", color: "emerald" },
  { id: "order", label: "Order", color: "blue" },
  { id: "support", label: "Support", color: "purple" },
  { id: "lead", label: "Lead", color: "amber" }
];
const getConversationLabels = (conversation) => {
  const labels = /* @__PURE__ */ new Set();
  const contactTagNames = (conversation.contact.tags ?? []).map((tag) => tag.name.toLowerCase());
  if (conversation.priority === "urgent") labels.add("vip");
  if (contactTagNames.includes("vip")) labels.add("vip");
  if ((conversation.last_message_preview || "").toLowerCase().match(/order|shipping|tracking|delivery/)) labels.add("order");
  if (contactTagNames.includes("order")) labels.add("order");
  if ((conversation.last_message_preview || "").toLowerCase().match(/help|issue|problem|support/)) labels.add("support");
  if (contactTagNames.includes("support")) labels.add("support");
  if (conversation.status === "pending") labels.add("lead");
  if (contactTagNames.includes("lead")) labels.add("lead");
  return Array.from(labels);
};
const labelClasses = (color) => {
  const classes = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
  };
  return classes[color] ?? classes.emerald;
};
const isCallTranscriptMessage = (message) => message.payload?.source === "voice_bridge" || message.payload?.voice_session_id != null;
const callTranscriptSpeaker = (message) => {
  if (message.direction === "inbound") return "Caller";
  if (message.payload?.source === "ai_agent") return "AI agent";
  return "Agent";
};
const noteToTimelineMessage = (note) => ({
  id: `note-${note.id}`,
  direction: "inbound",
  type: "internal_note",
  text_body: note.note,
  payload: {
    note_id: note.id,
    created_by: note.created_by
  },
  status: "saved",
  created_at: note.created_at
});
const auditToTimelineMessage = (event) => ({
  id: `audit-${event.id}`,
  direction: "inbound",
  type: "automation_status",
  text_body: event.description,
  payload: {
    audit_id: event.id,
    event_type: event.event_type,
    meta: event.meta ?? {},
    actor: event.actor ?? null
  },
  status: event.event_type,
  created_at: event.created_at
});
const normalizeChatMessage = (value) => {
  if (!value || value.id == null) return null;
  return {
    id: value.id,
    direction: value.direction === "outbound" ? "outbound" : "inbound",
    type: String(value.type ?? "text"),
    text_body: value.text_body ?? value.text ?? null,
    payload: value.payload ?? {},
    status: value.status ?? void 0,
    meta_message_id: value.meta_message_id ?? null,
    created_at: value.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: value.updated_at ?? null,
    sent_at: value.sent_at ?? null,
    delivered_at: value.delivered_at ?? null,
    read_at: value.read_at ?? null,
    reply_to: value.reply_to ?? value.payload?.reply?.preview ?? value.payload?.context?.preview ?? null,
    reply_to_message_id: value.reply_to_message_id ?? value.payload?.reply?.message_id ?? null,
    reply_to_meta_message_id: value.reply_to_meta_message_id ?? value.payload?.reply?.meta_message_id ?? value.payload?.context?.id ?? null
  };
};
const isRenderableMessageUpdate = (message) => {
  if (message.type && message.type !== "text") return true;
  if (message.text_body) return true;
  if (message.payload && Object.keys(message.payload).length > 0) return true;
  return false;
};
const messageTimestamp = (message) => {
  const timestamp = new Date(message.created_at).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};
const sortMessages = (messages) => [...messages].sort((a, b) => messageTimestamp(a) - messageTimestamp(b));
const isOptimisticMatch = (optimistic, incoming) => {
  if (!String(optimistic.id).startsWith("optimistic-")) return false;
  if (String(incoming.id).startsWith("optimistic-")) return false;
  if (optimistic.direction !== incoming.direction || optimistic.type !== incoming.type) return false;
  if ((optimistic.text_body ?? "") !== (incoming.text_body ?? "")) return false;
  return Math.abs(messageTimestamp(optimistic) - messageTimestamp(incoming)) < 12e4;
};
const isSameProviderMessage = (existing, incoming) => {
  if (!existing.meta_message_id || !incoming.meta_message_id) return false;
  return String(existing.meta_message_id) === String(incoming.meta_message_id);
};
const canReactToMessage = (message) => Boolean(message.meta_message_id) && !message.optimistic && !String(message.id).startsWith("note-") && !["internal_note", "reaction"].includes(message.type) && !isCallTranscriptMessage(message);
const emptyContactGallery = () => ({
  media: [],
  documents: [],
  links: [],
  counts: {
    media: 0,
    documents: 0,
    links: 0,
    total: 0
  }
});
const messageStatusIcon = (message) => {
  if (message.optimistic || message.status === "queued") {
    return /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5", "aria-label": "Sending" });
  }
  if (message.status === "failed") {
    return /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5 text-red-500", "aria-label": "Failed" });
  }
  if (message.read_at || message.status === "read") {
    return /* @__PURE__ */ jsx(CheckCheck, { className: "h-3.5 w-3.5 text-sky-500", "aria-label": "Read" });
  }
  if (message.delivered_at || message.status === "delivered") {
    return /* @__PURE__ */ jsx(CheckCheck, { className: "h-3.5 w-3.5", "aria-label": "Delivered" });
  }
  return /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5", "aria-label": "Sent" });
};
const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
const AUDIO_EXTENSIONS = /* @__PURE__ */ new Set(["aac", "m4a", "mp4", "mp3", "amr", "ogg", "oga", "wav", "wave"]);
const VIDEO_EXTENSIONS = /* @__PURE__ */ new Set(["mp4", "mov", "3gp", "3gpp"]);
const IMAGE_EXTENSIONS = /* @__PURE__ */ new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const fileExtension = (file) => {
  const name = file.name || "";
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() || "").toLowerCase() : "";
};
const isRecordedVoiceFile = (file) => file.name.startsWith("voice-message-");
const messageReplyPreview = (message) => {
  if (!message) return null;
  if (message.text_body) return message.text_body.slice(0, 160);
  const payload = message.payload || {};
  const filename = payload.filename || payload.document?.filename || payload.media?.filename;
  if (filename) return String(filename).slice(0, 160);
  if (message.type === "audio") return payload.voice ? "Voice message" : "Audio message";
  if (message.type === "image") return "Image message";
  if (message.type === "video") return "Video message";
  if (message.type === "document") return "Document message";
  if (message.type === "location") return "Location message";
  return `${message.type || "Message"} message`;
};
const messageReplyMetaId = (message) => {
  if (!message) return null;
  return message.meta_message_id || message.payload?.context?.id || message.payload?.reply?.meta_message_id || null;
};
let lameLoader = null;
const loadLameEncoder = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Voice encoder is only available in the browser."));
  }
  const existing = window.lamejs?.Mp3Encoder;
  if (existing) {
    return Promise.resolve(window.lamejs);
  }
  if (!lameLoader) {
    lameLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/vendor/lame.all.js";
      script.async = true;
      script.onload = () => {
        const lame = window.lamejs;
        if (lame?.Mp3Encoder) {
          resolve(lame);
        } else {
          reject(new Error("Voice encoder did not initialize."));
        }
      };
      script.onerror = () => reject(new Error("Voice encoder could not be loaded."));
      document.head.appendChild(script);
    });
  }
  return lameLoader;
};
const flattenAudioSamples = (chunks) => {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const samples = new Float32Array(length);
  let offset = 0;
  chunks.forEach((chunk) => {
    samples.set(chunk, offset);
    offset += chunk.length;
  });
  return samples;
};
const floatTo16BitPcm = (samples) => {
  const pcm = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    pcm[index] = sample < 0 ? sample * 32768 : sample * 32767;
  }
  return pcm;
};
const encodeMp3 = (lame, samples, sampleRate) => {
  const encoder = new lame.Mp3Encoder(1, sampleRate, 64);
  const pcm = floatTo16BitPcm(samples);
  const chunks = [];
  const blockSize = 1152;
  for (let offset = 0; offset < pcm.length; offset += blockSize) {
    const buffer = encoder.encodeBuffer(pcm.subarray(offset, offset + blockSize));
    if (buffer.length > 0) {
      chunks.push(buffer.slice().buffer);
    }
  }
  const flush = encoder.flush();
  if (flush.length > 0) {
    chunks.push(flush.slice().buffer);
  }
  return new Blob(chunks, { type: "audio/mpeg" });
};
const formatAudioTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};
function ChatAudioPlayer({
  src,
  title,
  outbound,
  voice = false,
  onPreview
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () => setCurrentTime(audio.currentTime || 0);
    const loaded = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const ended = () => setPlaying(false);
    audio.addEventListener("timeupdate", sync);
    audio.addEventListener("loadedmetadata", loaded);
    audio.addEventListener("durationchange", loaded);
    audio.addEventListener("ended", ended);
    return () => {
      audio.removeEventListener("timeupdate", sync);
      audio.removeEventListener("loadedmetadata", loaded);
      audio.removeEventListener("durationchange", loaded);
      audio.removeEventListener("ended", ended);
    };
  }, [src]);
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };
  const seek = (value) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const nextTime = Number(value) / 100 * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };
  const progress = duration ? Math.min(100, Math.max(0, currentTime / duration * 100)) : 0;
  const label = voice ? "Voice message" : title || "Audio message";
  return /* @__PURE__ */ jsxs("div", { className: `mb-2 min-w-[240px] max-w-[320px] rounded-lg px-3 py-2 ring-1 ${outbound ? "bg-white/45 ring-emerald-900/10 dark:bg-white/10 dark:ring-white/10" : "bg-gray-50 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700"}`, children: [
    /* @__PURE__ */ jsx("audio", { ref: audioRef, src, preload: "metadata", className: "hidden" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: toggle,
          className: `flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition ${outbound ? "bg-waify-green text-white hover:bg-waify-green-dark" : "bg-waify-green-soft text-waify-green-dark hover:bg-waify-green-soft/80 dark:bg-waify-green/15 dark:text-waify-green"}`,
          "aria-label": playing ? "Pause audio" : "Play audio",
          children: playing ? /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 translate-x-px" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "truncate text-xs font-semibold", children: label }),
          onPreview && /* @__PURE__ */ jsx("button", { type: "button", onClick: onPreview, className: "text-[10px] font-medium opacity-70 transition hover:opacity-100", children: "Preview" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "100",
            value: progress,
            onChange: (event) => seek(event.target.value),
            className: "mt-1 h-1.5 w-full cursor-pointer accent-waify-green",
            "aria-label": "Audio progress"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex justify-between text-[10px] opacity-70", children: [
          /* @__PURE__ */ jsx("span", { children: formatAudioTime(currentTime) }),
          /* @__PURE__ */ jsx("span", { children: formatAudioTime(duration) })
        ] })
      ] })
    ] })
  ] });
}
function ChatVideoCard({
  src,
  title,
  outbound,
  onPreview
}) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const loaded = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    video.addEventListener("loadedmetadata", loaded);
    video.addEventListener("durationchange", loaded);
    return () => {
      video.removeEventListener("loadedmetadata", loaded);
      video.removeEventListener("durationchange", loaded);
    };
  }, [src]);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: onPreview,
      className: `mb-2 block w-full min-w-[240px] max-w-[320px] overflow-hidden rounded-lg text-left shadow-sm ring-1 transition hover:scale-[1.01] ${outbound ? "bg-white/45 ring-emerald-900/10 dark:bg-white/10 dark:ring-white/10" : "bg-gray-50 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-video bg-slate-900", children: [
          /* @__PURE__ */ jsx(
            "video",
            {
              ref: videoRef,
              src,
              preload: "metadata",
              muted: true,
              playsInline: true,
              className: "h-full w-full object-cover"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/20", children: /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm", children: /* @__PURE__ */ jsx(Play, { className: "h-5 w-5 translate-x-px" }) }) }),
          duration > 0 && /* @__PURE__ */ jsx("span", { className: "absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white", children: formatAudioTime(duration) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2", children: [
          /* @__PURE__ */ jsx(Film, { className: "h-4 w-4 flex-shrink-0 opacity-70" }),
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-xs font-semibold", children: title || "Video message" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium opacity-70", children: "Preview" })
        ] })
      ]
    }
  );
}
function ContactGalleryPanel({
  gallery,
  loading,
  onPreview
}) {
  const [activeTab, setActiveTab] = useState("media");
  const tabs = [
    { id: "media", label: "Media", count: gallery.counts.media, icon: Image },
    { id: "documents", label: "Docs", count: gallery.counts.documents, icon: FileText },
    { id: "links", label: "Links", count: gallery.counts.links, icon: Link2 }
  ];
  const items = activeTab === "media" ? gallery.media : activeTab === "documents" ? gallery.documents : gallery.links;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1 rounded-lg bg-gray-50 p-1 dark:bg-slate-800", children: tabs.map(({ id, label, count, icon: Icon }) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setActiveTab(id),
        className: `flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${activeTab === id ? "bg-white text-waify-text shadow-sm dark:bg-slate-900 dark:text-waify-dark-text" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
        children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsx("span", { children: label }),
          /* @__PURE__ */ jsx("span", { className: "rounded bg-gray-100 px-1 text-[10px] dark:bg-slate-700", children: count })
        ]
      },
      id
    )) }),
    loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [0, 1, 2].map((item) => /* @__PURE__ */ jsx("div", { className: "h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" }, item)) }) : items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-dashed border-gray-200 p-5 text-center dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted", children: activeTab === "links" ? /* @__PURE__ */ jsx(Link2, { className: "h-4 w-4" }) : activeTab === "documents" ? /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Image, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs font-medium text-waify-text dark:text-waify-dark-text", children: [
        "No ",
        activeTab === "documents" ? "documents" : activeTab,
        " yet"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: "Shared items from this chat will appear here." })
    ] }) : activeTab === "media" ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: items.map((item) => {
      const title = item.filename || item.title || `${item.type} message`;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => item.url && onPreview(item),
          disabled: !item.url,
          className: "group relative aspect-square overflow-hidden rounded-lg bg-gray-100 text-left ring-1 ring-gray-100 transition hover:ring-waify-green/40 disabled:cursor-not-allowed dark:bg-slate-800 dark:ring-slate-700",
          title,
          children: [
            item.url && ["image", "sticker"].includes(item.type) ? /* @__PURE__ */ jsx("img", { src: item.url, alt: title, className: "h-full w-full object-cover transition group-hover:scale-105" }) : /* @__PURE__ */ jsx("span", { className: "flex h-full w-full items-center justify-center text-waify-text-muted dark:text-waify-dark-text-muted", children: item.type === "video" ? /* @__PURE__ */ jsx(Film, { className: "h-5 w-5" }) : item.type === "audio" ? /* @__PURE__ */ jsx(Mic, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Image, { className: "h-5 w-5" }) }),
            item.type === "video" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-1 right-1 rounded bg-black/60 p-1 text-white", children: /* @__PURE__ */ jsx(Play, { className: "h-3 w-3" }) }),
            !item.url && /* @__PURE__ */ jsx("span", { className: "absolute inset-x-1 bottom-1 truncate rounded bg-black/55 px-1 py-0.5 text-[9px] text-white", children: "Not downloaded" })
          ]
        },
        item.id
      );
    }) }) : activeTab === "documents" ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: items.map((item) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => item.url && onPreview(item),
        disabled: !item.url,
        className: "flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 text-left transition hover:border-waify-green/40 disabled:cursor-not-allowed dark:border-waify-dark-border dark:bg-slate-800",
        children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-900 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsx(File$1, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("span", { className: "block truncate text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: item.filename || item.title || "Document" }),
            /* @__PURE__ */ jsxs("span", { className: "block text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              item.file_size ? formatFileSize(item.file_size) : item.mime_type || "Document",
              item.created_at ? ` · ${new Date(item.created_at).toLocaleDateString()}` : ""
            ] })
          ] }),
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5 flex-shrink-0 text-waify-text-muted" })
        ]
      },
      item.id
    )) }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: items.map((item) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: item.url || "#",
        target: "_blank",
        rel: "noreferrer",
        className: "flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 text-left transition hover:border-waify-green/40 dark:border-waify-dark-border dark:bg-slate-800",
        children: [
          /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-900 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsx(Link2, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("span", { className: "block truncate text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: item.title || item.url }),
            /* @__PURE__ */ jsx("span", { className: "block truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: item.url }),
            item.created_at && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: new Date(item.created_at).toLocaleString() })
          ] })
        ]
      },
      item.id
    )) })
  ] });
}
function InboxCallingPanel({
  conversation,
  calling,
  calls,
  callingReady
}) {
  const status = conversation.connection.calling_enabled ? "enabled" : conversation.connection.calling_status || "unknown";
  const setupUrl = calling.setup_url || (typeof route !== "undefined" ? route("app.whatsapp-calls.index") : "/app/whatsapp-calls");
  const { addToast } = useToast();
  const [callBusy, setCallBusy] = useState(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const contactWaId = String(conversation.contact.wa_id || "").replace(/\D+/g, "");
  const canStartOutbound = callingReady && Boolean(calling.outbound_enabled ?? true);
  const connectionRouteKey = conversation.connection.slug || conversation.connection.id;
  const aiBridgeMode = ["ai_first", "ai_only"].includes(calling.routing_mode || "");
  const stopLocalCall = () => {
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }
  };
  const createPeer = async () => {
    stopLocalCall();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteStream) return;
      const audio = remoteAudioRef.current || new Audio();
      audio.autoplay = true;
      audio.srcObject = remoteStream;
      remoteAudioRef.current = audio;
      void audio.play().catch(() => void 0);
    };
    peerRef.current = peer;
    localStreamRef.current = stream;
    return peer;
  };
  const waitForRemoteAnswer = async (callId, peer) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 2e3));
      const response = await axios.get(route("app.whatsapp-calls.calls.show", { call: callId }), { headers: { Accept: "application/json" } });
      const sdp = callSessionSdpFrom(response.data);
      if (sdp && peer.signalingState !== "stable") {
        await peer.setRemoteDescription({ type: "answer", sdp });
        addToast({ title: "WhatsApp call connected", variant: "success" });
        return;
      }
    }
    addToast({
      title: "Call is waiting",
      description: "Meta has not returned the call answer yet. The call will still appear in call history.",
      variant: "info"
    });
  };
  const checkCallPermission = async () => {
    if (!contactWaId) return;
    setCallBusy("permission-check");
    try {
      const response = await axios.post(route("app.whatsapp-calls.connections.call-permission.check", { connection: connectionRouteKey }), { to: contactWaId }, { headers: { Accept: "application/json" } });
      addToast({
        title: "Permission checked",
        description: response.data?.permission?.status || response.data?.message || "WhatsApp returned the current call permission.",
        variant: "success"
      });
    } catch (error) {
      addToast({ title: "Permission check failed", description: error?.response?.data?.message || "Please retry after checking Meta Calling setup.", variant: "error" });
    } finally {
      setCallBusy(null);
    }
  };
  const requestCallPermission = async () => {
    if (!contactWaId) return;
    setCallBusy("permission-request");
    try {
      await axios.post(route("app.whatsapp-calls.connections.call-permission.request", { connection: connectionRouteKey }), {
        to: contactWaId,
        message: "Can we call you on WhatsApp about this conversation?"
      }, { headers: { Accept: "application/json" } });
      addToast({ title: "Call permission request sent", variant: "success" });
    } catch (error) {
      addToast({ title: "Permission request failed", description: error?.response?.data?.message || "Please retry after checking Meta Calling setup.", variant: "error" });
    } finally {
      setCallBusy(null);
    }
  };
  const startOutboundCall = async () => {
    if (!canStartOutbound || !contactWaId) return;
    setCallBusy("start");
    try {
      if (aiBridgeMode) {
        await axios.post(route("app.whatsapp-calls.connections.calls.start", { connection: connectionRouteKey }), {
          to: contactWaId,
          bridge_mode: "ai"
        }, { headers: { Accept: "application/json" } });
        addToast({ title: "AI voice call queued", description: "The voice bridge worker will connect the WhatsApp call.", variant: "success" });
        return;
      }
      const peer = await createPeer();
      const offer = await peer.createOffer({ offerToReceiveAudio: true });
      await peer.setLocalDescription(offer);
      const response = await axios.post(route("app.whatsapp-calls.connections.calls.start", { connection: connectionRouteKey }), {
        to: contactWaId,
        sdp: offer.sdp,
        sdp_type: "offer",
        bridge_mode: "browser"
      }, { headers: { Accept: "application/json" } });
      addToast({ title: "WhatsApp call started", description: "Waiting for Meta to return the call answer.", variant: "success" });
      const immediateAnswer = callSessionSdpFrom(response.data);
      if (immediateAnswer) {
        await peer.setRemoteDescription({ type: "answer", sdp: immediateAnswer });
      } else if (response.data?.call?.id) {
        void waitForRemoteAnswer(Number(response.data.call.id), peer);
      }
    } catch (error) {
      stopLocalCall();
      addToast({ title: "WhatsApp call failed", description: error?.response?.data?.message || error?.message || "Please retry after checking microphone permission.", variant: "error" });
    } finally {
      setCallBusy(null);
    }
  };
  const acceptInboundCall = async (call) => {
    const offerSdp = callSessionSdpFrom(call);
    if (!offerSdp) {
      addToast({ title: "Cannot answer yet", description: "This call webhook did not include a WebRTC offer from Meta.", variant: "warning" });
      return;
    }
    setCallBusy(`accept-${call.id}`);
    try {
      const peer = await createPeer();
      await peer.setRemoteDescription({ type: "offer", sdp: offerSdp });
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await axios.post(route("app.whatsapp-calls.calls.accept", { call: call.id }), {
        sdp: answer.sdp,
        sdp_type: "answer"
      }, { headers: { Accept: "application/json" } });
      addToast({ title: "WhatsApp call answered", variant: "success" });
    } catch (error) {
      stopLocalCall();
      addToast({ title: "Answer failed", description: error?.response?.data?.message || error?.message || "Please retry.", variant: "error" });
    } finally {
      setCallBusy(null);
    }
  };
  const postCallAction = async (call, action) => {
    setCallBusy(`${action}-${call.id}`);
    try {
      await axios.post(route(`app.whatsapp-calls.calls.${action}`, { call: call.id }), {}, { headers: { Accept: "application/json" } });
      if (action === "terminate") stopLocalCall();
      addToast({ title: action === "reject" ? "Call rejected" : "Call ended", variant: "success" });
    } catch (error) {
      addToast({ title: "Call action failed", description: error?.response?.data?.message || "Please retry.", variant: "error" });
    } finally {
      setCallBusy(null);
    }
  };
  useEffect(() => stopLocalCall, [conversation.id]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-slate-800", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "WhatsApp Calling" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: conversation.connection.name })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: callingReady ? "success" : status === "not_eligible" ? "danger" : "warning", children: callingReady ? "ready" : status.replaceAll("_", " ") })
      ] }),
      /* @__PURE__ */ jsxs("dl", { className: "mt-3 space-y-2 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Module" }),
          /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: calling.enabled ? "Enabled" : "Off" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Route" }),
          /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: (calling.routing_mode || "ai_first").replaceAll("_", " ") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Calls webhook" }),
          /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: conversation.connection.calling_webhook_subscribed ? "Subscribed" : "Not subscribed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-2", children: [
        callingReady ? /* @__PURE__ */ jsx("div", { className: "rounded-btn bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-800 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20", children: "WhatsApp Calling enabled" }) : /* @__PURE__ */ jsx(Link, { href: setupUrl, className: "inline-flex h-9 items-center justify-center rounded-btn bg-waify-green px-3 text-sm font-medium text-white transition hover:bg-waify-green-dark", children: "Configure WhatsApp calling" }),
        callingReady && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: checkCallPermission, disabled: Boolean(callBusy), className: "inline-flex h-9 items-center justify-center rounded-btn bg-white px-3 text-sm font-medium text-waify-text ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 disabled:opacity-60 dark:bg-slate-900 dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-slate-800", children: "Check call permission" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: requestCallPermission, disabled: Boolean(callBusy), className: "inline-flex h-9 items-center justify-center rounded-btn bg-white px-3 text-sm font-medium text-waify-text ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 disabled:opacity-60 dark:bg-slate-900 dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-slate-800", children: "Request WhatsApp call" }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: startOutboundCall, disabled: !canStartOutbound || Boolean(callBusy), className: "inline-flex h-9 items-center justify-center gap-2 rounded-btn bg-waify-green px-3 text-sm font-medium text-white transition hover:bg-waify-green-dark disabled:opacity-60", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
            "Start WhatsApp call"
          ] })
        ] }),
        callingReady && /* @__PURE__ */ jsx(Link, { href: setupUrl, className: "inline-flex h-9 items-center justify-center rounded-btn bg-white px-3 text-sm font-medium text-waify-text ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 dark:bg-slate-900 dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-slate-800", children: "Calling settings" })
      ] })
    ] }),
    calls.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-dashed border-gray-200 p-5 text-center dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs font-medium text-waify-text dark:text-waify-dark-text", children: "No WhatsApp call events" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: "Incoming call webhooks for this contact will appear here." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: calls.map((call) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-100 bg-white p-3 text-xs dark:border-waify-dark-border dark:bg-slate-800", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-semibold capitalize text-waify-text dark:text-waify-dark-text", children: [
            call.direction,
            " call"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-waify-text-muted dark:text-waify-dark-text-muted", children: call.created_at ? new Date(call.created_at).toLocaleString() : "-" })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: ["completed", "answered"].includes(call.status) ? "success" : ["failed", "missed", "rejected"].includes(call.status) ? "danger" : "warning", children: call.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
        "Routed to ",
        call.agent?.name || call.routed_to || call.route_mode || "not routed",
        call.duration_seconds ? ` · ${Math.round(call.duration_seconds / 60)} min` : ""
      ] }),
      callingReady && ["received", "ringing", "queued", "initiated", "answered"].includes(call.status) && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
        call.direction === "inbound" && ["received", "ringing", "queued"].includes(call.status) && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => acceptInboundCall(call), disabled: Boolean(callBusy), className: "inline-flex h-8 items-center rounded-btn bg-waify-green px-3 text-[11px] font-medium text-white disabled:opacity-60", children: "Answer" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => postCallAction(call, "reject"), disabled: Boolean(callBusy), className: "inline-flex h-8 items-center rounded-btn bg-white px-3 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-200 disabled:opacity-60 dark:bg-slate-900 dark:text-red-300 dark:ring-red-500/30", children: "Reject" })
        ] }),
        ["initiated", "answered", "ringing"].includes(call.status) && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => postCallAction(call, "terminate"), disabled: Boolean(callBusy), className: "inline-flex h-8 items-center rounded-btn bg-white px-3 text-[11px] font-medium text-waify-text ring-1 ring-inset ring-gray-200 disabled:opacity-60 dark:bg-slate-900 dark:text-waify-dark-text dark:ring-waify-dark-border", children: "End call" })
      ] }),
      call.summary && /* @__PURE__ */ jsx("p", { className: "mt-2 line-clamp-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: call.summary })
    ] }, call.id)) })
  ] });
}
function IncomingCallScreen({
  call,
  conversation,
  callingReady,
  onCallUpdated,
  onClose
}) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(null);
  const [localStatus, setLocalStatus] = useState(call.status);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  useEffect(() => {
    setLocalStatus(call.status);
  }, [call.status]);
  const stopLocalCall = () => {
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }
  };
  useEffect(() => stopLocalCall, []);
  const createPeer = async () => {
    stopLocalCall();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteStream) return;
      const audio = remoteAudioRef.current || new Audio();
      audio.autoplay = true;
      audio.srcObject = remoteStream;
      remoteAudioRef.current = audio;
      void audio.play().catch(() => void 0);
    };
    peerRef.current = peer;
    localStreamRef.current = stream;
    return peer;
  };
  const acceptCall = async () => {
    const offerSdp = callSessionSdpFrom(call);
    if (!offerSdp) {
      addToast({ title: "Cannot answer yet", description: "Meta has not sent the call WebRTC offer yet.", variant: "warning" });
      return;
    }
    setBusy("answer");
    try {
      const peer = await createPeer();
      await peer.setRemoteDescription({ type: "offer", sdp: offerSdp });
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      const response = await axios.post(route("app.whatsapp-calls.calls.accept", { call: call.id }), {
        sdp: answer.sdp,
        sdp_type: "answer"
      }, { headers: { Accept: "application/json" } });
      const updated = response.data?.call;
      if (updated) onCallUpdated(updated);
      setLocalStatus("answered");
      addToast({ title: "Call answered", variant: "success" });
    } catch (error) {
      stopLocalCall();
      addToast({ title: "Answer failed", description: error?.response?.data?.message || error?.message || "Please retry.", variant: "error" });
    } finally {
      setBusy(null);
    }
  };
  const postAction = async (action) => {
    setBusy(action === "reject" ? "reject" : "end");
    try {
      const response = await axios.post(route(`app.whatsapp-calls.calls.${action}`, { call: call.id }), {}, { headers: { Accept: "application/json" } });
      const updated = response.data?.call;
      if (updated) onCallUpdated(updated);
      stopLocalCall();
      setLocalStatus(action === "reject" ? "rejected" : "completed");
      addToast({ title: action === "reject" ? "Call rejected" : "Call ended", variant: "success" });
      onClose();
    } catch (error) {
      addToast({ title: "Call action failed", description: error?.response?.data?.message || "Please retry.", variant: "error" });
    } finally {
      setBusy(null);
    }
  };
  const displayName = conversation?.contact.name || call.contact_name || call.phone_number || "WhatsApp caller";
  const displayPhone = conversation?.contact.wa_id || call.phone_number || "";
  const isAnswered = localStatus === "answered";
  const isActionable = isIncomingActionableCall({ ...call, status: localStatus });
  const isAiRouted = call.routed_to === "ai_agent" || ["ai_first", "ai_only"].includes(String(call.route_mode || ""));
  const statusText = isAnswered ? isAiRouted ? `AI connected${call.agent?.name ? `: ${call.agent.name}` : ""}` : "Connected" : `${localStatus.replaceAll("_", " ")} incoming`;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[360] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "relative flex min-h-[560px] w-full max-w-sm flex-col overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-2xl ring-1 ring-white/10", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-500/35 to-transparent" }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex flex-1 flex-col items-center px-6 py-8 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex w-full items-center justify-between text-xs text-white/60", children: [
        /* @__PURE__ */ jsx("span", { children: "WhatsApp call" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15", "aria-label": "Hide call screen", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        isActionable && /* @__PURE__ */ jsx("span", { className: "absolute inset-0 animate-ping rounded-full bg-emerald-400/30" }),
        /* @__PURE__ */ jsx("div", { className: "relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 text-4xl font-semibold shadow-xl shadow-emerald-950/40", children: (String(displayName).trim().charAt(0) || "C").toUpperCase() })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "mt-6 max-w-full truncate text-2xl font-semibold", children: displayName }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-white/65", children: displayPhone }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80", children: statusText }),
      isAnswered && isAiRouted && /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-xs text-xs leading-5 text-white/55", children: "AI is handling this call. Switch routing to human first if agents should answer before AI." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-auto grid w-full grid-cols-3 gap-4 pb-2", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", disabled: true, className: "flex flex-col items-center gap-2 text-xs text-white/45", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-white/10", children: /* @__PURE__ */ jsx(Mic, { className: "h-5 w-5" }) }),
          "Mute"
        ] }),
        isActionable ? /* @__PURE__ */ jsxs("button", { type: "button", onClick: acceptCall, disabled: !callingReady || Boolean(busy), className: "flex flex-col items-center gap-2 text-xs font-medium text-white disabled:opacity-60", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-950/50", children: /* @__PURE__ */ jsx(Phone, { className: "h-6 w-6" }) }),
          busy === "answer" ? "Answering" : "Answer"
        ] }) : /* @__PURE__ */ jsxs("button", { type: "button", disabled: true, className: "flex flex-col items-center gap-2 text-xs font-medium text-white/55", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-white/10", children: /* @__PURE__ */ jsx(Phone, { className: "h-6 w-6" }) }),
          "Connected"
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => void postAction(isActionable ? "reject" : "terminate"), disabled: Boolean(busy), className: "flex flex-col items-center gap-2 text-xs font-medium text-white disabled:opacity-60", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-950/50", children: /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5 rotate-[135deg]" }) }),
          isActionable ? busy === "reject" ? "Rejecting" : "Reject" : busy === "end" ? "Ending" : "End"
        ] })
      ] })
    ] })
  ] }) });
}
const resolveMediaType = (file) => {
  const mime = (file.type || "").toLowerCase();
  const extension = fileExtension(file);
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/") || mime === "application/ogg") return "audio";
  if (mime.startsWith("video/")) return "video";
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (AUDIO_EXTENSIONS.has(extension) && extension !== "mp4") return "audio";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  return "document";
};
const LOCATION_MAP_WIDTH = 336;
const LOCATION_MAP_HEIGHT = 192;
const LOCATION_TILE_SIZE = 256;
const clampLocationLat = (lat) => Math.max(-85, Math.min(85, lat));
const clampLocationLng = (lng) => ((lng + 180) % 360 + 360) % 360 - 180;
const locationToWorldPixel = (lat, lng, zoom) => {
  const scale = LOCATION_TILE_SIZE * 2 ** zoom;
  const clampedLat = clampLocationLat(lat);
  const sin = Math.sin(clampedLat * Math.PI / 180);
  return {
    x: (clampLocationLng(lng) + 180) / 360 * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  };
};
const worldPixelToLocation = (x, y, zoom) => {
  const scale = LOCATION_TILE_SIZE * 2 ** zoom;
  const lng = x / scale * 360 - 180;
  const n = Math.PI - 2 * Math.PI * y / scale;
  const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return {
    lat: clampLocationLat(lat),
    lng: clampLocationLng(lng)
  };
};
const locationMapTiles = (center) => {
  const centerPixel = locationToWorldPixel(center.lat, center.lng, center.zoom);
  const minX = Math.floor((centerPixel.x - LOCATION_MAP_WIDTH / 2) / LOCATION_TILE_SIZE);
  const maxX = Math.floor((centerPixel.x + LOCATION_MAP_WIDTH / 2) / LOCATION_TILE_SIZE);
  const minY = Math.floor((centerPixel.y - LOCATION_MAP_HEIGHT / 2) / LOCATION_TILE_SIZE);
  const maxY = Math.floor((centerPixel.y + LOCATION_MAP_HEIGHT / 2) / LOCATION_TILE_SIZE);
  const tileCount = 2 ** center.zoom;
  const tiles = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      if (y < 0 || y >= tileCount) continue;
      const wrappedX = (x % tileCount + tileCount) % tileCount;
      tiles.push({
        key: `${center.zoom}-${x}-${y}`,
        url: `https://tile.openstreetmap.org/${center.zoom}/${wrappedX}/${y}.png`,
        left: x * LOCATION_TILE_SIZE - (centerPixel.x - LOCATION_MAP_WIDTH / 2),
        top: y * LOCATION_TILE_SIZE - (centerPixel.y - LOCATION_MAP_HEIGHT / 2)
      });
    }
  }
  return tiles;
};
function ConversationsIndex({
  account,
  conversations: initialConversations,
  connections,
  agents: initialAgents = [],
  templates = [],
  catalog_products: catalogProducts = [],
  saved_buttons: savedButtons = [],
  saved_lists: savedLists = [],
  saved_forms: savedForms = [],
  ai_agents: aiAgents = [],
  filters: initialFilters = { search: "" },
  ai_available: aiAvailable = false,
  whatsapp_calling: whatsappCalling = { enabled: false },
  recent_calls: recentCalls = [],
  selected_conversation_id: selectedConversationId = null,
  new_chat_open: newChatOpen = false
}) {
  const { subscribe, connected } = useRealtime();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { auth, workspace_permissions } = usePage().props;
  const currentUserId = auth?.user?.id;
  const canDeleteChats = Boolean(workspace_permissions?.["chats.delete"]);
  const notifyAssignmentEnabled = auth?.user?.notify_assignment_enabled ?? true;
  const soundEnabled = auth?.user?.notify_sound_enabled ?? true;
  const aiSuggestionsEnabled = auth?.user?.ai_suggestions_enabled ?? false;
  const platformAiEnabled = Boolean(usePage().props?.ai?.enabled ?? false);
  const [conversations, setConversations] = useState(
    normalizeConversationList(initialConversations?.data)
  );
  const [recentCallsState, setRecentCallsState] = useState(Array.isArray(recentCalls) ? recentCalls : []);
  const [dismissedCallIds, setDismissedCallIds] = useState(/* @__PURE__ */ new Set());
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "denied"
  );
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search ?? "");
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status ?? "all");
  const [connectionFilter, setConnectionFilter] = useState(
    initialFilters?.connection_id !== void 0 && initialFilters?.connection_id !== "all" ? Number(initialFilters.connection_id) : "all"
  );
  const [labelFilter, setLabelFilter] = useState("all");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(/* @__PURE__ */ new Set());
  const [assigneeFilter, setAssigneeFilter] = useState(
    initialFilters?.assignee ?? "all"
  );
  const [assigningId, setAssigningId] = useState(null);
  const [activeId, setActiveId] = useState(selectedConversationId ? Number(selectedConversationId) : null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [mobileContactPanelOpen, setMobileContactPanelOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "active",
    notes: ""
  });
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const [contactTab, setContactTab] = useState("profile");
  const [showNewChat, setShowNewChat] = useState(Boolean(newChatOpen));
  const [newChatForm, setNewChatForm] = useState({
    name: "",
    wa_id: "",
    connection_id: connections?.[0]?.id ? String(connections[0].id) : ""
  });
  const [creatingChat, setCreatingChat] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [loadingConversationId, setLoadingConversationId] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [mediaPreview, setMediaPreview] = useState(null);
  const [galleryByConversation, setGalleryByConversation] = useState({});
  const [galleryLoadingId, setGalleryLoadingId] = useState(null);
  const [replyWindowNow, setReplyWindowNow] = useState(() => Date.now());
  const [messageDraft, setMessageDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [selectedAiAgentId, setSelectedAiAgentId] = useState(
    aiAgents.length > 0 ? aiAgents[0].id : "default"
  );
  const [aiAgentMenuOpen, setAiAgentMenuOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showInteractiveComposer, setShowInteractiveComposer] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState("buttons");
  const [savedButtonOptions, setSavedButtonOptions] = useState(Array.isArray(savedButtons) ? savedButtons : []);
  const [newInteractiveButtonLabel, setNewInteractiveButtonLabel] = useState("");
  const [savingInteractiveButton, setSavingInteractiveButton] = useState(false);
  const [interactiveDraft, setInteractiveDraft] = useState({
    header_text: "",
    body_text: "How can we help you?",
    footer_text: "",
    buttons: ["Talk to sales", "Support"],
    saved_button_ids: [],
    list_id: "",
    list_button_text: "Choose",
    rows: ["Pricing", "Book demo", "Talk to support"],
    form_id: "",
    form_button_text: "Open form",
    product_id: "",
    catalog_id: "",
    product_retailer_id: "",
    cta_display_text: "Open link",
    cta_url: "",
    payment_amount: "",
    payment_description: "WhatsApp payment request",
    payment_button_text: "Pay now",
    payment_expire_after_days: "",
    contact_name: "Zyptos Support",
    contact_phone: "",
    contact_email: ""
  });
  const [attachments, setAttachments] = useState([]);
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [filePickerAccept, setFilePickerAccept] = useState();
  const [locationInput, setLocationInput] = useState({ label: "", latitude: "", longitude: "" });
  const [locationMap, setLocationMap] = useState({ lat: 28.6139, lng: 77.209, zoom: 12 });
  const [locationSearch, setLocationSearch] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [recordingVoice, setRecordingVoice] = useState(false);
  useEffect(() => {
    setSavedButtonOptions(Array.isArray(savedButtons) ? savedButtons : []);
  }, [savedButtons]);
  const messagesEndRef = useRef(null);
  const attachmentPreviewRef = useRef(null);
  const fileInputRef = useRef(null);
  const voiceStreamRef = useRef(null);
  const voiceAudioContextRef = useRef(null);
  const voiceProcessorRef = useRef(null);
  const voiceSourceRef = useRef(null);
  const voiceSamplesRef = useRef([]);
  const agents = Array.isArray(initialAgents) ? initialAgents : [];
  const lastPollRef = useRef(new Date(Date.now() - 15e3));
  const messagesByConversationRef = useRef({});
  const conversationFetchSequenceRef = useRef({});
  const conversationStatusCursorRef = useRef({});
  const processedMessageIds = useRef(/* @__PURE__ */ new Set());
  const browserNotificationIds = useRef(/* @__PURE__ */ new Set());
  const browserCallNotificationIds = useRef(/* @__PURE__ */ new Set());
  const assignmentStateRef = useRef(
    new Map(normalizeConversationList(initialConversations?.data).map((c) => [c.id, c.assigned_to ?? null]))
  );
  const handoffStateRef = useRef(
    new Map(normalizeConversationList(initialConversations?.data).map((c) => [c.id, c.handoff_status ?? null]))
  );
  useEffect(() => {
    messagesByConversationRef.current = messagesByConversation;
  }, [messagesByConversation]);
  useEffect(() => {
    const interval = window.setInterval(() => setReplyWindowNow(Date.now()), 6e4);
    return () => window.clearInterval(interval);
  }, []);
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextRef = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextRef) return;
      const context = new AudioContextRef();
      const gain = context.createGain();
      gain.gain.value = 0.12;
      gain.connect(context.destination);
      [0, 0.16].forEach((offset, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = index === 0 ? 880 : 1174;
        oscillator.connect(gain);
        oscillator.start(context.currentTime + offset);
        oscillator.stop(context.currentTime + offset + 0.14);
      });
      window.setTimeout(() => void context.close?.(), 420);
    } catch (error) {
    }
  }, [soundEnabled]);
  const playCallRing = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextRef = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextRef) return;
      const context = new AudioContextRef();
      const gain = context.createGain();
      gain.gain.value = 0.045;
      gain.connect(context.destination);
      [0, 0.18, 0.42].forEach((offset, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = index === 1 ? 720 : 560;
        oscillator.connect(gain);
        oscillator.start(context.currentTime + offset);
        oscillator.stop(context.currentTime + offset + 0.14);
      });
    } catch (error) {
    }
  }, [soundEnabled]);
  const requestBrowserNotifications = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      addToast({ title: "Browser notifications unavailable", description: "This browser does not support notifications.", variant: "warning" });
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      playNotificationSound();
    }
    addToast({
      title: permission === "granted" ? "Browser notifications enabled" : "Browser notifications blocked",
      description: permission === "granted" ? "Incoming messages and calls will show browser alerts and play sound." : "Enable notifications from browser site settings to receive call alerts.",
      variant: permission === "granted" ? "success" : "warning"
    });
  }, [addToast, playNotificationSound]);
  const showBrowserNotification = useCallback((id, title, body, conversationId) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (browserNotificationIds.current.has(id)) return;
    browserNotificationIds.current.add(id);
    if (browserNotificationIds.current.size > 80) {
      const ids = Array.from(browserNotificationIds.current);
      browserNotificationIds.current = new Set(ids.slice(-40));
    }
    const notification = new Notification(title, {
      body,
      tag: id,
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
  }, []);
  const notifyInboundMessage = useCallback((payload) => {
    const title = payload.contactName ? `New message from ${payload.contactName}` : "New WhatsApp message";
    const description = payload.preview || "Open inbox to reply.";
    addToast({
      title: "New message",
      description: payload.contactName ? `From ${payload.contactName}` : description,
      variant: "info",
      duration: 3e3
    });
    playNotificationSound();
    if (notificationPermission === "granted" || typeof Notification !== "undefined" && Notification.permission === "granted") {
      showBrowserNotification(payload.id, title, description, payload.conversationId);
    }
  }, [addToast, notificationPermission, playNotificationSound, showBrowserNotification]);
  const notifyIncomingCall = useCallback((call, conversation) => {
    const id = `call-${call.id}-${call.status}`;
    if (browserCallNotificationIds.current.has(id)) return;
    browserCallNotificationIds.current.add(id);
    if (browserCallNotificationIds.current.size > 50) {
      const ids = Array.from(browserCallNotificationIds.current);
      browserCallNotificationIds.current = new Set(ids.slice(-25));
    }
    const caller = conversation?.contact.name || call.contact_name || call.phone_number || "WhatsApp caller";
    addToast({
      title: "Incoming WhatsApp call",
      description: String(caller),
      variant: "info",
      duration: 6e3
    });
    playCallRing();
    showBrowserNotification(id, "Incoming WhatsApp call", String(caller), conversation?.id);
  }, [addToast, playCallRing, showBrowserNotification]);
  const parseMessageDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const formatTime = (value) => {
    const date = parseMessageDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat(void 0, { hour: "2-digit", minute: "2-digit" }).format(date);
  };
  const formatDateKey = (value) => {
    const date = parseMessageDate(value);
    if (!date) return "unknown";
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };
  const formatDateLabel = (value) => {
    const date = parseMessageDate(value);
    if (!date) return "Unknown date";
    const today = /* @__PURE__ */ new Date();
    const yesterday = /* @__PURE__ */ new Date();
    yesterday.setDate(today.getDate() - 1);
    if (formatDateKey(value) === formatDateKey(today.toISOString())) return "Today";
    if (formatDateKey(value) === formatDateKey(yesterday.toISOString())) return "Yesterday";
    return new Intl.DateTimeFormat(void 0, {
      day: "2-digit",
      month: "short",
      year: date.getFullYear() === today.getFullYear() ? void 0 : "numeric"
    }).format(date);
  };
  const formatExactDateTime = (value) => {
    const date = parseMessageDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat(void 0, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };
  const formatRelative = (value) => {
    if (!value) return "";
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.max(1, Math.round(diff / 6e4));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };
  const api = typeof window !== "undefined" && window.axios ? window.axios : axios;
  const fetchInboxStreamAndMerge = useCallback(() => {
    if (!account?.id) return;
    const since = lastPollRef.current.toISOString();
    api.get(route("app.whatsapp.inbox.stream", {}), { params: { since } }).then((response) => {
      const list = response.data?.updated_conversations;
      const currentAccountId = account?.id;
      if (list?.length) {
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
      }
      const notifications = Array.isArray(response.data?.new_message_notifications) ? response.data.new_message_notifications : [];
      notifications.forEach((item) => {
        const conversationId = Number(item.conversation_id);
        const eventId = `poll-inbound-${conversationId}-${item.last_activity_at || ""}`;
        if (!Number.isFinite(conversationId) || processedMessageIds.current.has(eventId)) return;
        processedMessageIds.current.add(eventId);
        notifyInboundMessage({
          id: eventId,
          conversationId,
          contactName: item.contact?.name || item.contact?.wa_id || null,
          preview: item.last_message_preview || null,
          activeConversationId: activeId
        });
      });
      const updatedCalls = Array.isArray(response.data?.updated_calls) ? response.data.updated_calls : [];
      if (updatedCalls.length) {
        setRecentCallsState((prev) => mergeCallRecords(prev, updatedCalls));
      }
      const serverTime = new Date(response.data?.server_time || /* @__PURE__ */ new Date()).getTime();
      lastPollRef.current = new Date((Number.isFinite(serverTime) ? serverTime : Date.now()) - 1e4);
    }).catch((err) => {
    });
  }, [account?.id, activeId, notifyInboundMessage]);
  useEffect(() => {
    setConversations(normalizeConversationList(initialConversations?.data));
  }, [initialConversations]);
  useEffect(() => {
    setRecentCallsState(Array.isArray(recentCalls) ? recentCalls : []);
  }, [recentCalls]);
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
      if (starredOnly && conv.priority !== "urgent") {
        return false;
      }
      if (labelFilter !== "all" && !getConversationLabels(conv).includes(labelFilter)) {
        return false;
      }
      return true;
    });
  }, [conversations, account?.id, searchQuery, statusFilter, connectionFilter, assigneeFilter, currentUserId, starredOnly, labelFilter]);
  const activeConversation = useMemo(() => {
    return filteredConversations.find((conversation) => conversation.id === activeId) ?? filteredConversations[0] ?? null;
  }, [filteredConversations, activeId]);
  const activeMessages = activeConversation ? messagesByConversation[activeConversation.id] ?? [] : [];
  const activeConversationLoading = Boolean(activeConversation && loadingConversationId === activeConversation.id);
  const activeAutomationState = activeConversation?.automation_state ?? null;
  const activeBotIsReplying = Boolean(activeConversation?.automation_processing);
  const activeManualMode = Boolean(activeConversation?.bot_paused || activeConversation?.handoff_status === "manual");
  const activeAgentName = activeConversation?.assigned_to ? agents.find((agent) => agent.id === activeConversation.assigned_to)?.name ?? "Assigned" : "Unassigned";
  const activeLabels = activeConversation ? getConversationLabels(activeConversation) : [];
  const activeDisplayMessages = activeMessages.filter((message) => message.type !== "reaction");
  const activeTimelineMessages = activeMessages.filter((message) => !["internal_note", "reaction"].includes(message.type));
  const activeNotes = activeMessages.filter((message) => message.type === "internal_note");
  const firstAttachment = attachments[0] ?? null;
  const attachmentSummary = firstAttachment ? `${firstAttachment.name || "Attachment"}${attachments.length > 1 ? ` +${attachments.length - 1}` : ""}` : null;
  const activeMessageReactions = useMemo(() => {
    const reactions = {};
    const byMetaId = /* @__PURE__ */ new Map();
    activeMessages.forEach((message) => {
      if (message.meta_message_id) {
        byMetaId.set(message.meta_message_id, message);
      }
    });
    activeMessages.filter((message) => message.type === "reaction").forEach((message) => {
      const emoji = message.payload?.reaction?.emoji || message.text_body;
      const targetLocalId = message.payload?.reaction?.target_local_message_id;
      const targetMetaId = message.payload?.reaction?.message_id;
      const target = targetLocalId ? activeMessages.find((item) => String(item.id) === String(targetLocalId)) : targetMetaId ? byMetaId.get(String(targetMetaId)) : null;
      if (emoji && target) {
        reactions[String(target.id)] = emoji;
      }
    });
    return reactions;
  }, [activeMessages]);
  const activeInboundCount = activeTimelineMessages.filter((message) => message.direction === "inbound").length;
  const activeOutboundCount = activeTimelineMessages.filter((message) => message.direction === "outbound").length;
  const activeGallery = activeConversation ? galleryByConversation[activeConversation.id] ?? emptyContactGallery() : emptyContactGallery();
  const activeMediaCount = activeGallery.counts.total || activeTimelineMessages.filter((message) => ["image", "video", "document", "audio", "sticker"].includes(message.type)).length;
  const activeCalls = activeConversation ? recentCallsState.filter((call) => {
    const callPhone = String(call.phone_number || "").replace(/\D+/g, "");
    const contactPhone = String(activeConversation.contact.wa_id || "").replace(/\D+/g, "");
    return callPhone === contactPhone && (!call.whatsapp_connection_id || call.whatsapp_connection_id === activeConversation.connection.id);
  }) : [];
  const incomingCall = useMemo(
    () => recentCallsState.find((call) => isIncomingVisibleCall(call) && !dismissedCallIds.has(Number(call.id))) ?? null,
    [recentCallsState, dismissedCallIds]
  );
  const incomingCallConversation = useMemo(() => {
    if (!incomingCall) return null;
    const callPhone = String(incomingCall.phone_number || "").replace(/\D+/g, "");
    return conversations.find((conversation) => {
      const contactPhone = String(conversation.contact.wa_id || "").replace(/\D+/g, "");
      return callPhone === contactPhone && (!incomingCall.whatsapp_connection_id || incomingCall.whatsapp_connection_id === conversation.connection.id);
    }) ?? null;
  }, [conversations, incomingCall]);
  const callingReady = Boolean(whatsappCalling?.enabled && activeConversation && (activeConversation.connection.calling_enabled || whatsappCalling.calling_eligibility_status === "eligible" || Number(whatsappCalling.whatsapp_connection_id) === activeConversation.connection.id && whatsappCalling.calling_webhook_subscribed));
  const incomingCallingReady = Boolean(whatsappCalling?.enabled && incomingCall && (incomingCallConversation?.connection.calling_enabled || whatsappCalling.calling_eligibility_status === "eligible" || incomingCallConversation && Number(whatsappCalling.whatsapp_connection_id) === incomingCallConversation.connection.id && whatsappCalling.calling_webhook_subscribed || whatsappCalling.calling_webhook_subscribed));
  useEffect(() => {
    if (!incomingCall || !isIncomingActionableCall(incomingCall)) return;
    notifyIncomingCall(incomingCall, incomingCallConversation);
    const interval = window.setInterval(() => {
      const current = recentCallsState.find((call) => Number(call.id) === Number(incomingCall.id));
      if (!current || !isIncomingActionableCall(current) || dismissedCallIds.has(Number(incomingCall.id))) {
        window.clearInterval(interval);
        return;
      }
      playCallRing();
    }, 3500);
    return () => window.clearInterval(interval);
  }, [incomingCall?.id, incomingCall?.status, incomingCallConversation?.id, notifyIncomingCall, playCallRing, recentCallsState, dismissedCallIds]);
  const activeReplyWindow = customerServiceWindowFor(activeConversation, activeTimelineMessages, replyWindowNow);
  const freeFormReplyBlocked = !noteMode && !activeReplyWindow.isOpen;
  const lastInboundAt = activeReplyWindow.lastInboundAt;
  const lastOutboundAt = [...activeTimelineMessages].reverse().find((message) => message.direction === "outbound")?.created_at ?? null;
  const selectedAiAgent = selectedAiAgentId === "default" ? null : aiAgents.find((agent) => agent.id === selectedAiAgentId) ?? null;
  const selectedAiAgentLabel = selectedAiAgent?.name ?? "Default assistant";
  const pickedLocation = useMemo(() => {
    const latitude = Number(locationInput.latitude);
    const longitude = Number(locationInput.longitude);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
  }, [locationInput.latitude, locationInput.longitude]);
  const pickedLocationMapUrl = pickedLocation ? `https://www.google.com/maps/search/?api=1&query=${pickedLocation.latitude},${pickedLocation.longitude}` : null;
  const locationTiles = useMemo(() => locationMapTiles(locationMap), [locationMap]);
  useEffect(() => {
    if (!activeConversation) {
      setActiveId(null);
      return;
    }
    if (activeId !== activeConversation.id) {
      setActiveId(activeConversation.id);
    }
  }, [activeConversation, activeId]);
  useEffect(() => {
    if (selectedConversationId) {
      setActiveId(Number(selectedConversationId));
      setMobileShowDetail(true);
    }
  }, [selectedConversationId]);
  useEffect(() => {
    if (!activeConversation || galleryByConversation[activeConversation.id]) {
      return;
    }
    let cancelled = false;
    setGalleryLoadingId(activeConversation.id);
    axios.get(route("app.whatsapp.conversations.gallery", { conversation: activeConversation.id })).then((response) => {
      if (cancelled) return;
      setGalleryByConversation((current) => ({
        ...current,
        [activeConversation.id]: {
          media: Array.isArray(response.data?.media) ? response.data.media : [],
          documents: Array.isArray(response.data?.documents) ? response.data.documents : [],
          links: Array.isArray(response.data?.links) ? response.data.links : [],
          counts: {
            media: Number(response.data?.counts?.media ?? 0),
            documents: Number(response.data?.counts?.documents ?? 0),
            links: Number(response.data?.counts?.links ?? 0),
            total: Number(response.data?.counts?.total ?? 0)
          }
        }
      }));
    }).catch(() => {
      if (cancelled) return;
      setGalleryByConversation((current) => ({
        ...current,
        [activeConversation.id]: emptyContactGallery()
      }));
    }).finally(() => {
      if (!cancelled) {
        setGalleryLoadingId(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeConversation, galleryByConversation]);
  useEffect(() => {
    if (newChatOpen) {
      setShowNewChat(true);
    }
  }, [newChatOpen]);
  const mergeMessages = useCallback((conversationId, incoming) => {
    if (!incoming.length) return;
    setMessagesByConversation((prev) => {
      const existing = prev[conversationId] ?? [];
      const byId = /* @__PURE__ */ new Map();
      existing.forEach((message) => byId.set(String(message.id), message));
      incoming.forEach((message) => {
        for (const [id2, existingMessage] of byId) {
          if (isOptimisticMatch(existingMessage, message) || isSameProviderMessage(existingMessage, message)) {
            byId.delete(id2);
          }
        }
        const id = String(message.id);
        const current = byId.get(id);
        byId.set(id, current ? { ...current, ...message, payload: message.payload ?? current.payload } : message);
      });
      const next = {
        ...prev,
        [conversationId]: sortMessages(Array.from(byId.values()))
      };
      messagesByConversationRef.current = next;
      return next;
    });
  }, []);
  const patchMessage = useCallback((conversationId, incoming) => {
    setMessagesByConversation((prev) => {
      const existing = prev[conversationId] ?? [];
      const index = existing.findIndex((message) => String(message.id) === String(incoming.id));
      if (index === -1) {
        if (!isRenderableMessageUpdate(incoming)) {
          return prev;
        }
        const next2 = {
          ...prev,
          [conversationId]: sortMessages([...existing, incoming])
        };
        messagesByConversationRef.current = next2;
        return next2;
      }
      const updated = [...existing];
      updated[index] = { ...updated[index], ...incoming, payload: incoming.payload ?? updated[index].payload };
      const next = {
        ...prev,
        [conversationId]: sortMessages(updated)
      };
      messagesByConversationRef.current = next;
      return next;
    });
  }, []);
  const fetchConversationMessages = useCallback((conversationId, reset = false) => {
    const sequence = (conversationFetchSequenceRef.current[conversationId] ?? 0) + 1;
    conversationFetchSequenceRef.current[conversationId] = sequence;
    if (reset) {
      setLoadingConversationId(conversationId);
    }
    const current = reset ? [] : messagesByConversationRef.current[conversationId] ?? [];
    const afterMessageId = current.map((message) => Number(message.id)).filter((id) => Number.isFinite(id)).reduce((max, id) => Math.max(max, id), 0);
    const afterNoteId = current.map((message) => String(message.id).match(/^note-(\d+)$/)?.[1]).filter((id) => Boolean(id)).map((id) => Number(id)).filter((id) => Number.isFinite(id)).reduce((max, id) => Math.max(max, id), 0);
    const afterAuditId = current.map((message) => String(message.id).match(/^audit-(\d+)$/)?.[1]).filter((id) => Boolean(id)).map((id) => Number(id)).filter((id) => Number.isFinite(id)).reduce((max, id) => Math.max(max, id), 0);
    const afterUpdatedAt = conversationStatusCursorRef.current[conversationId];
    return axios.get(route("app.whatsapp.inbox.conversation.stream", { conversation: conversationId }), {
      params: {
        after_message_id: reset ? 0 : afterMessageId,
        after_note_id: reset ? 0 : afterNoteId,
        after_audit_id: reset ? 0 : afterAuditId,
        after_updated_at: reset ? void 0 : afterUpdatedAt
      }
    }).then((response) => {
      if (!reset && conversationFetchSequenceRef.current[conversationId] !== sequence) {
        return;
      }
      if (response.data?.server_time) {
        const serverTime = new Date(response.data.server_time).getTime();
        if (Number.isFinite(serverTime)) {
          conversationStatusCursorRef.current[conversationId] = new Date(serverTime - 3e4).toISOString();
        }
      }
      const incoming = Array.isArray(response.data?.new_messages) ? response.data.new_messages.map(normalizeChatMessage).filter(Boolean) : [];
      const incomingNotes = Array.isArray(response.data?.new_notes) ? response.data.new_notes.map(noteToTimelineMessage) : [];
      const incomingAuditEvents = Array.isArray(response.data?.new_audit_events) ? response.data.new_audit_events.map(auditToTimelineMessage) : [];
      const timelineItems = sortMessages([...incoming, ...incomingNotes, ...incomingAuditEvents]);
      mergeMessages(conversationId, timelineItems);
      const updatedMessages = Array.isArray(response.data?.updated_messages) ? response.data.updated_messages.map(normalizeChatMessage).filter(Boolean) : [];
      updatedMessages.forEach((message) => patchMessage(conversationId, message));
      const updatedConversation = response.data?.conversation;
      if (updatedConversation?.id) {
        const normalizedUpdated = normalizeConversation({
          ...activeConversation,
          ...updatedConversation,
          contact: activeConversation?.contact,
          connection: activeConversation?.connection
        });
        const patch = normalizedUpdated ?? updatedConversation;
        setConversations((current2) => current2.map((conversation) => conversation.id === Number(updatedConversation.id) ? { ...conversation, ...patch } : conversation));
      }
    }).catch((error) => {
    }).finally(() => {
      if (reset && conversationFetchSequenceRef.current[conversationId] === sequence) {
        setLoadingConversationId((current2) => current2 === conversationId ? null : current2);
      }
    });
  }, [activeConversation, mergeMessages, patchMessage]);
  useEffect(() => {
    if (!activeConversation) return;
    fetchConversationMessages(activeConversation.id, true);
    setActionsMenuOpen(false);
  }, [activeConversation?.id]);
  useEffect(() => {
    if (!activeConversation?.id) return;
    const interval = setInterval(() => {
      if (loadingConversationId === activeConversation.id) return;
      fetchConversationMessages(activeConversation.id);
    }, 3e3);
    return () => clearInterval(interval);
  }, [activeConversation?.id, fetchConversationMessages, loadingConversationId]);
  useEffect(() => {
    if (!account?.id || !activeConversation?.id) return;
    const channel = `account.${account.id}.whatsapp.conversation.${activeConversation.id}`;
    const unsubscribeMessageCreated = subscribe(channel, ".whatsapp.message.created", (data) => {
      const message = normalizeChatMessage(data.message);
      if (!message) return;
      mergeMessages(activeConversation.id, [message]);
    });
    const unsubscribeMessageUpdated = subscribe(channel, ".whatsapp.message.updated", (data) => {
      const message = normalizeChatMessage(data.message);
      if (!message) return;
      patchMessage(activeConversation.id, message);
    });
    const unsubscribeNoteAdded = subscribe(channel, ".whatsapp.note.added", (data) => {
      if (!data?.note) return;
      mergeMessages(activeConversation.id, [noteToTimelineMessage(data.note)]);
    });
    const unsubscribeAuditAdded = subscribe(channel, ".whatsapp.audit.added", (data) => {
      if (!data?.audit_event) return;
      mergeMessages(activeConversation.id, [auditToTimelineMessage(data.audit_event)]);
    });
    const unsubscribeConversationUpdated = subscribe(channel, ".whatsapp.conversation.updated", (data) => {
      const incoming = normalizeConversation(data.conversation);
      if (!incoming) return;
      setConversations((prev) => applyConversationUpdated(prev, incoming));
    });
    return () => {
      unsubscribeMessageCreated();
      unsubscribeMessageUpdated();
      unsubscribeNoteAdded();
      unsubscribeAuditAdded();
      unsubscribeConversationUpdated();
    };
  }, [account?.id, activeConversation?.id, subscribe, mergeMessages, patchMessage]);
  useEffect(() => {
    if (!activeConversation?.id) return;
    const hasUnreadInbound = activeTimelineMessages.some((message) => message.direction === "inbound" && !message.read_at);
    if (!hasUnreadInbound) return;
    const timeout = window.setTimeout(() => {
      axios.post(route("app.whatsapp.conversations.read", { conversation: activeConversation.id })).catch((error) => {
      });
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [activeConversation?.id, activeTimelineMessages.length]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [activeConversation?.id, activeMessages.length]);
  const showReplyWindowClosedToast = () => {
    addToast({
      title: activeReplyWindow.state === "closed" ? "24-hour reply window closed" : "Template required",
      description: "Meta only allows normal replies inside the 24-hour customer service window. Send an approved template instead.",
      variant: "warning",
      duration: 6e3
    });
    setShowTemplates(true);
    setShowQuickReplies(false);
    setShowInteractiveComposer(false);
  };
  const sendInlineMessage = () => {
    if (!activeConversation || sendingMessage) return;
    if (!noteMode && activeBotIsReplying) {
      addToast({
        title: "Bot is replying",
        description: "Switch this chat to Manual if you want to take over now.",
        variant: "warning"
      });
      return;
    }
    if (!noteMode && !activeReplyWindow.isOpen) {
      showReplyWindowClosedToast();
      return;
    }
    if (!noteMode && attachments.length > 0) {
      sendAttachments(messageDraft.trim() || void 0);
      return;
    }
    if (!messageDraft.trim()) return;
    const body = messageDraft.trim();
    if (noteMode) {
      setMessageDraft("");
      setSendingMessage(true);
      axios.post(route("app.whatsapp.conversations.notes.store", { conversation: activeConversation.id }), { note: body }).then((response) => {
        const note = response.data?.note;
        mergeMessages(activeConversation.id, [noteToTimelineMessage({
          id: Number(note?.id ?? Date.now()),
          note: note?.note ?? body,
          created_at: note?.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
          created_by: note?.created_by ?? null
        })]);
        addToast({ title: "Note added", variant: "success" });
        fetchConversationMessages(activeConversation.id);
      }).catch((error) => {
        setMessageDraft(body);
        addToast({
          title: "Note not saved",
          description: error?.response?.data?.message || "Please try again.",
          variant: "error"
        });
      }).finally(() => setSendingMessage(false));
      return;
    }
    const replyPreview = messageReplyPreview(replyTo);
    const payload = {
      message: body,
      ...replyTo?.id && typeof replyTo.id === "number" ? { reply_message_id: replyTo.id } : {}
    };
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      direction: "outbound",
      type: "text",
      text_body: body,
      status: "queued",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      optimistic: true,
      reply_to: replyPreview,
      reply_to_message_id: replyTo?.id ?? null,
      reply_to_meta_message_id: messageReplyMetaId(replyTo)
    };
    setMessageDraft("");
    setReplyTo(null);
    setSendingMessage(true);
    mergeMessages(activeConversation.id, [optimistic]);
    setConversations((prev) => prev.map(
      (conversation) => conversation.id === activeConversation.id ? { ...conversation, last_message_preview: body, last_message_at: optimistic.created_at } : conversation
    ));
    axios.post(route("app.whatsapp.conversations.send", { conversation: activeConversation.id }), payload, {
      headers: { Accept: "application/json" }
    }).then((response) => {
      const sentMessage = normalizeChatMessage(response.data?.data?.message);
      if (sentMessage) {
        mergeMessages(activeConversation.id, [sentMessage]);
      }
      fetchConversationMessages(activeConversation.id);
    }).catch((error) => {
      const failedMessage = normalizeChatMessage(error?.response?.data?.data?.message);
      if (failedMessage) {
        patchMessage(activeConversation.id, failedMessage);
      }
      addToast({
        title: "Message not sent",
        description: error?.response?.data?.message_detail || error?.response?.data?.error || error?.response?.data?.message || "Please try again.",
        variant: "error"
      });
      fetchConversationMessages(activeConversation.id);
    }).finally(() => {
      setSendingMessage(false);
    });
  };
  const createNewChat = () => {
    if (creatingChat) return;
    setCreatingChat(true);
    router.post(route("app.whatsapp.conversations.store"), newChatForm, {
      preserveScroll: true,
      onSuccess: () => {
        setShowNewChat(false);
        setNewChatForm({
          name: "",
          wa_id: "",
          connection_id: connections?.[0]?.id ? String(connections[0].id) : ""
        });
        addToast({ title: "Chat created", variant: "success" });
      },
      onError: (errors) => {
        addToast({
          title: "Chat not created",
          description: String(errors.wa_id || errors.connection_id || errors.name || "Check the contact details and try again."),
          variant: "error"
        });
      },
      onFinish: () => setCreatingChat(false)
    });
  };
  const deleteConversation = async () => {
    if (!activeConversation || deletingConversationId) return;
    const confirmed = await confirm({
      title: "Delete chat",
      message: `Delete chat with ${activeConversation.contact.name || activeConversation.contact.wa_id}? This removes the conversation history from this workspace.`,
      confirmText: "Delete chat",
      variant: "danger"
    });
    if (!confirmed) return;
    const conversationId = activeConversation.id;
    setDeletingConversationId(conversationId);
    router.delete(route("app.whatsapp.conversations.destroy", { conversation: conversationId }), {
      preserveScroll: true,
      onSuccess: () => {
        setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
        setMessagesByConversation((current) => {
          const next = { ...current };
          delete next[conversationId];
          return next;
        });
        setActiveId(null);
        setActionsMenuOpen(false);
        addToast({ title: "Chat deleted", variant: "success" });
      },
      onError: () => addToast({ title: "Chat not deleted", description: "Please try again.", variant: "error" }),
      onFinish: () => setDeletingConversationId(null)
    });
  };
  const insertQuickReply = (text) => {
    const firstName = activeConversation?.contact.name?.split(" ")[0] || "there";
    setMessageDraft(text.replace("{{name}}", firstName));
    setShowQuickReplies(false);
  };
  const applyTemplate = (template) => {
    if (!activeConversation) return;
    if ((template.variable_count ?? 0) > 0) {
      setMessageDraft((template.body_text || template.name).replace(/\{\{\d+\}\}/g, activeConversation.contact.name?.split(" ")[0] || "there"));
      setShowTemplates(false);
      addToast({ title: "Template added to composer", description: "Review variables before sending.", variant: "info" });
      return;
    }
    setSendingMessage(true);
    router.post(route("app.whatsapp.conversations.send-template", { conversation: activeConversation.id }), {
      template_id: template.id,
      variables: []
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setShowTemplates(false);
        fetchConversationMessages(activeConversation.id, true);
      },
      onError: (errors) => addToast({
        title: "Template not sent",
        description: errors?.template || "Please try again.",
        variant: "error"
      }),
      onFinish: () => setSendingMessage(false)
    });
  };
  const canUseAiSuggest = Boolean(aiAvailable && aiSuggestionsEnabled && platformAiEnabled);
  const saveInteractiveButton = async () => {
    const label = newInteractiveButtonLabel.trim();
    if (!label || savingInteractiveButton) return;
    setSavingInteractiveButton(true);
    try {
      const response = await axios.post(route("app.quick-replies.store"), {
        type: "button",
        label,
        shortcut: shortcutFromButtonLabel(label),
        message: label,
        is_active: true
      }, { headers: { Accept: "application/json" } });
      const saved = response.data?.data;
      if (saved?.id) {
        setSavedButtonOptions((current) => {
          const withoutDuplicate = current.filter((button) => Number(button.id) !== Number(saved.id));
          return [saved, ...withoutDuplicate];
        });
        setInteractiveDraft((current) => ({
          ...current,
          saved_button_ids: [...current.saved_button_ids.filter((id) => Number(id) !== Number(saved.id)), Number(saved.id)].slice(-3)
        }));
        setNewInteractiveButtonLabel("");
        addToast({ title: "Button saved", description: `"${label}" is now available for interactive messages.`, variant: "success" });
      }
    } catch (error) {
      addToast({
        title: "Button not saved",
        description: error?.response?.data?.message || Object.values(error?.response?.data?.errors || {})?.flat()?.[0] || "Check the label and try again.",
        variant: "error"
      });
    } finally {
      setSavingInteractiveButton(false);
    }
  };
  const deleteSavedInteractiveButton = async (button) => {
    const confirmed = await confirm({
      title: "Delete saved button",
      message: `Delete "${button.button_text || button.label}" from saved buttons? This also removes it from Quick Replies.`,
      confirmText: "Delete button",
      variant: "danger"
    });
    if (!confirmed) return;
    try {
      await axios.delete(route("app.quick-replies.destroy", { quickReply: button.id }), {
        headers: { Accept: "application/json" }
      });
      setSavedButtonOptions((current) => current.filter((item) => Number(item.id) !== Number(button.id)));
      setInteractiveDraft((current) => ({
        ...current,
        saved_button_ids: current.saved_button_ids.filter((id) => Number(id) !== Number(button.id))
      }));
      addToast({ title: "Button deleted", description: `"${button.button_text || button.label}" was removed.`, variant: "success" });
    } catch (error) {
      addToast({
        title: "Button not deleted",
        description: error?.response?.data?.message || "Open Quick Replies to manage this button.",
        variant: "error"
      });
    }
  };
  const sendInteractiveMessage = async () => {
    if (!activeConversation || sendingMessage) return;
    if (!activeReplyWindow.isOpen) {
      showReplyWindowClosedToast();
      return;
    }
    setSendingMessage(true);
    const body = interactiveDraft.body_text.trim();
    try {
      let endpoint = "";
      let payload = {};
      if (interactiveMode === "buttons") {
        const selectedSavedButtons = savedButtonOptions.filter((button) => interactiveDraft.saved_button_ids.includes(Number(button.id))).map((button) => button.button_text || button.label).filter(Boolean);
        const buttons = selectedSavedButtons.map((text, index) => ({ id: `btn_${index + 1}_${text.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40)}`, text: text.trim() })).filter((button) => button.text);
        endpoint = route("app.whatsapp.conversations.send-buttons", { conversation: activeConversation.id });
        payload = {
          body_text: body,
          header_text: interactiveDraft.header_text.trim() || void 0,
          footer_text: interactiveDraft.footer_text.trim() || void 0,
          buttons
        };
      } else if (interactiveMode === "list") {
        endpoint = route("app.whatsapp.conversations.send-list", { conversation: activeConversation.id });
        payload = { list_id: Number(interactiveDraft.list_id) };
      } else if (interactiveMode === "form") {
        const form = savedForms.find((item) => String(item.id) === String(interactiveDraft.form_id));
        endpoint = route("app.whatsapp.conversations.send-flow", { conversation: activeConversation.id });
        payload = {
          flow_id: form?.meta_flow_id || "",
          body_text: body || `Please complete this WhatsApp form: ${form?.name || "Form"}`,
          header_text: interactiveDraft.header_text.trim() || void 0,
          footer_text: interactiveDraft.footer_text.trim() || void 0,
          cta: interactiveDraft.form_button_text.trim() || "Open form",
          flow_action: "navigate"
        };
      } else if (interactiveMode === "product") {
        endpoint = route("app.whatsapp.conversations.send-product", { conversation: activeConversation.id });
        payload = {
          mode: "single",
          product_id: Number(interactiveDraft.product_id),
          body_text: body || "Here is the product.",
          footer_text: interactiveDraft.footer_text.trim() || void 0
        };
      } else if (interactiveMode === "link") {
        endpoint = route("app.whatsapp.conversations.send-cta-url", { conversation: activeConversation.id });
        payload = {
          body_text: body,
          header_text: interactiveDraft.header_text.trim() || void 0,
          footer_text: interactiveDraft.footer_text.trim() || void 0,
          display_text: interactiveDraft.cta_display_text.trim() || "Open link",
          url: interactiveDraft.cta_url.trim()
        };
      } else if (interactiveMode === "payment") {
        endpoint = route("app.whatsapp.conversations.send-payment-link", { conversation: activeConversation.id });
        payload = {
          amount: interactiveDraft.payment_amount,
          currency: "INR",
          description: interactiveDraft.payment_description.trim() || "WhatsApp payment request",
          body_text: body || void 0,
          display_text: interactiveDraft.payment_button_text.trim() || "Pay now",
          expire_after_days: interactiveDraft.payment_expire_after_days ? Number(interactiveDraft.payment_expire_after_days) : void 0
        };
      } else {
        endpoint = route("app.whatsapp.conversations.send-contact-card", { conversation: activeConversation.id });
        payload = {
          formatted_name: interactiveDraft.contact_name.trim(),
          phone: interactiveDraft.contact_phone.trim(),
          email: interactiveDraft.contact_email.trim() || void 0
        };
      }
      const response = await axios.post(endpoint, payload, { headers: { Accept: "application/json" } });
      const sentMessage = response.data?.data?.message;
      if (sentMessage) {
        mergeMessages(activeConversation.id, [sentMessage]);
      }
      setShowInteractiveComposer(false);
      addToast({
        title: interactiveMode === "form" ? "Form sent" : interactiveMode === "product" ? "Product sent" : interactiveMode === "payment" ? "Payment link sent" : interactiveMode === "link" ? "Link button sent" : interactiveMode === "contact" ? "Contact card sent" : "Interactive message sent",
        variant: "success"
      });
      fetchConversationMessages(activeConversation.id, true);
    } catch (error) {
      addToast({
        title: "Interactive message not sent",
        description: error?.response?.data?.error || error?.response?.data?.message || "Check the fields and try again.",
        variant: "error"
      });
    } finally {
      setSendingMessage(false);
    }
  };
  const openFilePicker = (accept) => {
    setFilePickerAccept(accept);
    setShowAttachments(false);
    window.setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.accept = accept ?? "";
        fileInputRef.current.click();
      }
    }, 0);
  };
  const addPickedFiles = (files) => {
    if (!files?.length) {
      addToast({ title: "No file selected", description: "Choose an image, video, audio, or document to attach.", variant: "info" });
      return;
    }
    const picked = Array.from(files);
    const usableFiles = picked.filter((file) => file.size > 0 && (file.name || file.type));
    if (usableFiles.length === 0) {
      addToast({ title: "File not attached", description: "The selected file appears to be empty or unavailable.", variant: "warning" });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setNoteMode(false);
    setShowEmoji(false);
    setShowTemplates(false);
    setShowQuickReplies(false);
    setShowInteractiveComposer(false);
    setShowLocationPicker(false);
    setShowAttachments(false);
    setAttachments((current) => [...current, ...usableFiles]);
    addToast({
      title: usableFiles.length > 1 ? "Files attached" : "File attached",
      description: usableFiles.length === 1 ? usableFiles[0].name || "Ready to send." : `${usableFiles.length} files ready to send.`,
      variant: "success",
      duration: 1600
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  useEffect(() => {
    if (attachments.length > 0) {
      attachmentPreviewRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [attachments.length]);
  const removeAttachment = (index) => {
    setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };
  const sendAttachments = async (caption) => {
    if (!activeConversation || attachments.length === 0 || sendingMessage) return;
    if (!activeReplyWindow.isOpen) {
      showReplyWindowClosedToast();
      return;
    }
    setSendingMessage(true);
    for (let index = 0; index < attachments.length; index += 1) {
      const file = attachments[index];
      const fileType = resolveMediaType(file);
      const formData = new FormData();
      formData.append("type", fileType);
      formData.append("attachment", file);
      if (fileType === "audio" && isRecordedVoiceFile(file)) {
        formData.append("is_voice", "1");
      }
      if (replyTo?.id && typeof replyTo.id === "number") {
        formData.append("reply_message_id", String(replyTo.id));
      }
      if (caption && index === 0) {
        formData.append("caption", caption);
      }
      try {
        const response = await axios.post(
          route("app.whatsapp.conversations.send-media", { conversation: activeConversation.id }),
          formData,
          { headers: { "Content-Type": "multipart/form-data", Accept: "application/json" } }
        );
        const sentMessage = response.data?.data?.message;
        if (sentMessage) {
          mergeMessages(activeConversation.id, [sentMessage]);
        }
      } catch (error) {
        addToast({
          title: "Attachment not sent",
          description: error?.response?.data?.message || error?.response?.data?.errors?.attachment?.[0] || "Please try another file.",
          variant: "error"
        });
        setSendingMessage(false);
        return;
      }
    }
    addToast({ title: attachments.length > 1 ? "Attachments sent" : "Attachment sent", variant: "success" });
    setAttachments([]);
    setMessageDraft("");
    setReplyTo(null);
    setSendingMessage(false);
    fetchConversationMessages(activeConversation.id, true);
  };
  const handleAiSuggest = () => {
    if (!activeConversation || aiSuggestLoading) return;
    if (!canUseAiSuggest) {
      addToast({
        title: "AI suggestion unavailable",
        description: !aiSuggestionsEnabled ? "Enable AI suggestions in AI settings." : !platformAiEnabled ? "AI is disabled in platform settings." : "AI is not available on this plan.",
        variant: "warning"
      });
      return;
    }
    setAiSuggestLoading(true);
    axios.post(route("app.whatsapp.conversations.ai-suggest", { conversation: activeConversation.id }), {
      agent_id: selectedAiAgentId === "default" ? null : selectedAiAgentId
    }).then((response) => {
      const suggestion = response.data?.suggestion;
      if (typeof suggestion === "string" && suggestion.trim()) {
        const normalized = suggestion.trim();
        setMessageDraft(normalized);
        const agentName = response.data?.agent?.name;
        addToast({ title: "AI suggestion added", description: agentName ? `${agentName} drafted this reply.` : "Review before sending.", variant: "info" });
      }
    }).catch((error) => {
      addToast({
        title: "AI suggestion failed",
        description: error?.response?.data?.error || error?.message || "Please try again.",
        variant: "error"
      });
    }).finally(() => setAiSuggestLoading(false));
  };
  const selectLocation = (latitude, longitude, label) => {
    const lat = Number(latitude.toFixed(6));
    const lng = Number(longitude.toFixed(6));
    setLocationInput((current) => ({
      label: label ?? current.label,
      latitude: String(lat),
      longitude: String(lng)
    }));
    setLocationMap((current) => ({
      ...current,
      lat,
      lng,
      zoom: Math.max(current.zoom, 14)
    }));
  };
  const searchLocations = async () => {
    const query = locationSearch.trim();
    if (!query) {
      setLocationResults([]);
      return;
    }
    setLocationSearching(true);
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: query,
          format: "jsonv2",
          limit: 5
        }
      });
      const results = Array.isArray(response.data) ? response.data.map((item) => {
        const lat = Number(item.lat);
        const lng = Number(item.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
          label: String(item.display_name || query),
          lat,
          lng
        };
      }).filter(Boolean) : [];
      setLocationResults(results);
      if (results.length === 0) {
        addToast({ title: "No location found", description: "Try a more specific place, address, or landmark.", variant: "info" });
      }
    } catch {
      addToast({ title: "Location search failed", description: "Use current location or enter coordinates manually.", variant: "warning" });
    } finally {
      setLocationSearching(false);
    }
  };
  const handleLocationMapClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerPixel = locationToWorldPixel(locationMap.lat, locationMap.lng, locationMap.zoom);
    const worldX = centerPixel.x + (event.clientX - rect.left - rect.width / 2);
    const worldY = centerPixel.y + (event.clientY - rect.top - rect.height / 2);
    const location = worldPixelToLocation(worldX, worldY, locationMap.zoom);
    selectLocation(location.lat, location.lng);
  };
  const useCurrentLocationForPicker = () => {
    if (!navigator.geolocation) {
      addToast({ title: "Location unavailable", description: "This browser does not support location sharing.", variant: "warning" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectLocation(position.coords.latitude, position.coords.longitude, locationInput.label || "Current location");
      },
      () => {
        addToast({ title: "Location blocked", description: "Allow location access to use your current location.", variant: "warning" });
      },
      { enableHighAccuracy: true, timeout: 1e4 }
    );
  };
  const sendLocation = (latitude, longitude, label = "Shared location") => {
    if (!activeConversation) return;
    if (!activeReplyWindow.isOpen) {
      showReplyWindowClosedToast();
      return;
    }
    setSendingMessage(true);
    axios.post(route("app.whatsapp.conversations.send-location", { conversation: activeConversation.id }), {
      latitude,
      longitude,
      name: label,
      address: null
    }).then(() => {
      addToast({ title: "Location sent", variant: "success" });
      setShowLocationPicker(false);
      setLocationInput({ label: "", latitude: "", longitude: "" });
      setLocationResults([]);
      setLocationSearch("");
      fetchConversationMessages(activeConversation.id, true);
    }).catch((error) => {
      addToast({
        title: "Location not sent",
        description: error?.response?.data?.message || "Check the coordinates and try again.",
        variant: "error"
      });
    }).finally(() => setSendingMessage(false));
  };
  const sendManualLocation = () => {
    const latitude = Number(locationInput.latitude);
    const longitude = Number(locationInput.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      addToast({ title: "Coordinates needed", description: "Enter valid latitude and longitude.", variant: "warning" });
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      addToast({ title: "Coordinates invalid", description: "Latitude must be between -90 and 90, longitude between -180 and 180.", variant: "warning" });
      return;
    }
    sendLocation(latitude, longitude, locationInput.label || "Shared location");
  };
  const updateConversationMeta = (updates) => {
    if (!activeConversation) return;
    const previous = activeConversation;
    const conversationUpdates = { ...updates };
    delete conversationUpdates.tag;
    setConversations((current) => current.map((conversation) => conversation.id === activeConversation.id ? { ...conversation, ...conversationUpdates } : conversation));
    axios.post(route("app.whatsapp.conversations.update", { conversation: activeConversation.id }), updates, {
      headers: { Accept: "application/json" }
    }).then((response) => {
      const updated = response.data?.conversation;
      if (!updated) return;
      setConversations((current) => current.map((conversation) => conversation.id === activeConversation.id ? {
        ...conversation,
        status: Object.prototype.hasOwnProperty.call(updated, "status") ? updated.status : conversation.status,
        assigned_to: Object.prototype.hasOwnProperty.call(updated, "assigned_to") ? updated.assigned_to : conversation.assigned_to,
        priority: Object.prototype.hasOwnProperty.call(updated, "priority") ? updated.priority : conversation.priority,
        contact: {
          ...conversation.contact,
          ...updated.contact ?? {},
          tags: updated.contact?.tags ?? conversation.contact.tags ?? []
        }
      } : conversation));
    }).catch(() => {
      setConversations((current) => current.map((conversation) => conversation.id === previous.id ? previous : conversation));
      addToast({ title: "Conversation update failed", description: "Please try again.", variant: "error" });
    });
  };
  const addConversationLabel = (labelId) => {
    const label = INBOX_LABELS.find((item) => item.id === labelId);
    if (!label) return;
    if (labelId === "vip") {
      updateConversationMeta({ priority: "urgent", tag: label.label });
    } else {
      updateConversationMeta({ tag: label.label });
    }
    addToast({ title: `${label.label} added`, variant: "success", duration: 1200 });
  };
  const stopAutomation = async () => {
    if (!activeConversation?.automation_state) return;
    const confirmed = await confirm({
      title: "Stop automation?",
      message: "This clears the current automation journey for this chat. Future messages can still trigger a new flow.",
      confirmText: "Stop automation",
      cancelText: "Keep running",
      variant: "danger"
    });
    if (!confirmed) return;
    axios.post(route("app.whatsapp.conversations.automation.stop", { conversation: activeConversation.id })).then((response) => {
      const updated = response.data?.conversation;
      setConversations((current) => current.map((conversation) => conversation.id === activeConversation.id ? { ...conversation, automation_state: updated?.automation_state ?? null } : conversation));
      fetchConversationMessages(activeConversation.id);
      addToast({ title: "Automation stopped", variant: "success" });
    }).catch(() => {
      addToast({ title: "Could not stop automation", description: "Please try again.", variant: "error" });
    });
  };
  const toggleBotPaused = async (paused) => {
    if (!activeConversation) return;
    axios.post(route("app.whatsapp.conversations.bot.toggle", { conversation: activeConversation.id }), {
      paused,
      reason: paused ? "Paused by agent from inbox" : null,
      assign_to_me: paused
    }).then((response) => {
      const updated = response.data?.conversation ?? {};
      setConversations((current) => current.map((conversation) => conversation.id === activeConversation.id ? {
        ...conversation,
        assigned_to: Object.prototype.hasOwnProperty.call(updated, "assigned_to") ? updated.assigned_to : conversation.assigned_to,
        automation_state: updated.automation_state ?? null,
        automation_processing: Boolean(updated.automation_processing ?? false),
        automation_processing_mode: updated.automation_processing_mode ?? null,
        bot_paused: Boolean(updated.bot_paused ?? false),
        bot_paused_reason: updated.bot_paused_reason ?? null,
        handoff_status: updated.handoff_status ?? null,
        handoff_reason: updated.handoff_reason ?? null
      } : conversation));
      fetchConversationMessages(activeConversation.id);
      addToast({ title: paused ? "Bot paused" : "Bot resumed", variant: "success" });
    }).catch(() => {
      addToast({ title: "Bot setting failed", description: "Please try again.", variant: "error" });
    });
  };
  const toggleSelectedConversation = (conversationId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };
  const setReaction = (message, reaction) => {
    if (!activeConversation) return;
    if (!canReactToMessage(message)) {
      if (!message.meta_message_id && !message.optimistic) {
        fetchConversationMessages(activeConversation.id, true);
      }
      addToast({
        title: "Reaction not sent",
        description: message.optimistic ? "Wait until this outgoing message is sent." : "Reactions work only on messages that exist in WhatsApp. Notes, generated drafts, and unsynced system messages cannot receive reactions.",
        variant: "warning"
      });
      return;
    }
    setMessageReactions((current) => ({ ...current, [String(message.id)]: reaction }));
    axios.post(route("app.whatsapp.conversations.send-reaction", { conversation: activeConversation.id }), {
      message_id: message.id,
      emoji: reaction
    }).then((response) => {
      const sentMessage = response.data?.data?.message;
      if (sentMessage) {
        mergeMessages(activeConversation.id, [sentMessage]);
      }
      addToast({ title: "Reaction sent", description: reaction, variant: "success", duration: 1200 });
    }).catch((error) => {
      setMessageReactions((current) => {
        const next = { ...current };
        delete next[String(message.id)];
        return next;
      });
      addToast({
        title: "Reaction not sent",
        description: error?.response?.data?.message || "Please try again.",
        variant: "error"
      });
    });
  };
  const retryMessage = (message) => {
    if (!activeConversation || message.status !== "failed" || sendingMessage) return;
    setSendingMessage(true);
    axios.post(route("app.whatsapp.conversations.retry-message", {
      conversation: activeConversation.id,
      message: message.id
    })).then((response) => {
      const sentMessage = response.data?.data?.message;
      if (sentMessage) {
        patchMessage(activeConversation.id, sentMessage);
      }
      fetchConversationMessages(activeConversation.id);
      addToast({ title: "Message resent", variant: "success" });
    }).catch((error) => {
      const retryError = error?.response?.data?.error || error?.response?.data?.message || "Please try again.";
      addToast({
        title: "Retry failed",
        description: retryError,
        variant: "error"
      });
    }).finally(() => setSendingMessage(false));
  };
  const contactRouteKey = activeConversation?.contact.slug || activeConversation?.contact.id;
  const contactHref = contactRouteKey ? route("app.contacts.index", { contact: contactRouteKey }) : null;
  const openContactEditor = () => {
    if (!activeConversation?.contact?.id) return;
    setContactForm({
      name: activeConversation.contact.name || "",
      email: activeConversation.contact.email || "",
      phone: activeConversation.contact.is_unresolved_lid ? "" : activeConversation.contact.phone || activeConversation.contact.wa_id || "",
      company: activeConversation.contact.company || "",
      status: activeConversation.contact.status || "active",
      notes: activeConversation.contact.notes || ""
    });
    setEditingContact(true);
  };
  const saveContactDetails = () => {
    if (!activeConversation?.contact?.id || savingContact) return;
    const contactId = activeConversation.contact.id;
    const contactRouteKey2 = activeConversation.contact.slug || contactId;
    const updates = {
      name: contactForm.name.trim() || activeConversation.contact.wa_id,
      email: contactForm.email.trim() || null,
      phone: contactForm.phone.trim() || null,
      company: contactForm.company.trim() || null,
      status: contactForm.status || "active",
      notes: contactForm.notes.trim() || null
    };
    setSavingContact(true);
    router.put(route("app.contacts.update", { contact: contactRouteKey2 }), updates, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setConversations((current) => current.map((conversation) => conversation.contact.id === contactId ? { ...conversation, contact: { ...conversation.contact, ...updates } } : conversation));
        setEditingContact(false);
        addToast({ title: "Contact updated", description: "Details are saved in the inbox and contact record.", variant: "success" });
      },
      onError: (errors) => {
        const firstError = Object.values(errors || {})[0];
        addToast({
          title: "Contact update failed",
          description: (typeof firstError === "string" ? firstError : null) || "Please check the fields and try again.",
          variant: "error"
        });
      },
      onFinish: () => setSavingContact(false)
    });
  };
  const toggleVoiceRecording = async () => {
    if (recordingVoice) {
      const context = voiceAudioContextRef.current;
      const sampleRate = context?.sampleRate || 44100;
      const samples = flattenAudioSamples(voiceSamplesRef.current);
      voiceProcessorRef.current?.disconnect();
      voiceSourceRef.current?.disconnect();
      voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
      context?.close().catch(() => void 0);
      voiceProcessorRef.current = null;
      voiceSourceRef.current = null;
      voiceStreamRef.current = null;
      voiceAudioContextRef.current = null;
      voiceSamplesRef.current = [];
      setRecordingVoice(false);
      if (samples.length < sampleRate / 2) {
        addToast({ title: "Voice message too short", description: "Record at least half a second.", variant: "warning" });
        return;
      }
      try {
        const lame = await loadLameEncoder();
        const blob = encodeMp3(lame, samples, sampleRate);
        if (blob.size < 256) {
          throw new Error("Encoded voice message is empty.");
        }
        const file = new File([blob], `voice-message-${Date.now()}.mp3`, { type: "audio/mpeg" });
        setAttachments((current) => [...current, file]);
        addToast({ title: "Voice message ready", description: "Press Send to deliver it.", variant: "success" });
      } catch (error) {
        addToast({
          title: "Voice message not created",
          description: error?.message || "Please upload an MP3 audio file instead.",
          variant: "error"
        });
      }
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !AudioContextClass) {
      addToast({ title: "Voice recording unavailable", description: "This browser does not support audio recording.", variant: "warning" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContextClass();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      voiceSamplesRef.current = [];
      processor.onaudioprocess = (event) => {
        voiceSamplesRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };
      source.connect(processor);
      processor.connect(context.destination);
      voiceStreamRef.current = stream;
      voiceAudioContextRef.current = context;
      voiceSourceRef.current = source;
      voiceProcessorRef.current = processor;
      setRecordingVoice(true);
    } catch (error) {
      addToast({ title: "Microphone blocked", description: "Allow microphone access to record a voice message.", variant: "warning" });
    }
  };
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
    const incomingConversation = normalizeConversation(data.conversation);
    if (index >= 0) {
      const updated = {
        ...prev[index],
        ...incomingConversation ?? {}
      };
      updated.last_message_preview = incomingConversation?.last_message_preview ?? data.message?.text_body ?? data.message?.text ?? data.message?.body ?? "New message";
      updated.last_message_at = incomingConversation?.last_message_at ?? data.message?.created_at ?? data.message?.timestamp ?? (/* @__PURE__ */ new Date()).toISOString();
      updated.last_inbound_message_at = incomingConversation?.last_inbound_message_at ?? (data.message?.direction === "inbound" ? data.message?.created_at : updated.last_inbound_message_at) ?? null;
      const newList = [...prev];
      newList[index] = updated;
      return newList.sort((a, b) => {
        const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return timeB - timeA;
      });
    }
    if (incomingConversation) {
      return [incomingConversation, ...prev].sort((a, b) => {
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
          const previousHandoff = handoffStateRef.current.get(incoming.id);
          if (incoming.handoff_status === "manual" && previousHandoff !== "manual") {
            addToast({
              title: "Human takeover needed",
              description: `${incoming.contact.name || incoming.contact.wa_id} was moved to Manual mode.`,
              variant: "warning",
              duration: 5e3
            });
            playNotificationSound();
            showBrowserNotification(`handoff-${incoming.id}-${Date.now()}`, "Chat needs human attention", incoming.contact.name || incoming.contact.wa_id, incoming.id);
          }
          handoffStateRef.current.set(incoming.id, incoming.handoff_status ?? null);
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
            const hasConversationPayload = Boolean(normalizeConversation(data.conversation));
            const updated = applyMessageCreated(prev, data);
            if (!hadConversation && !hasConversationPayload && data.conversation_id) {
              fetchInboxStreamAndMerge();
            }
            return updated;
          });
          const message = normalizeChatMessage(data.message);
          const conversationId = Number(data.conversation_id);
          if (message && Number.isFinite(conversationId)) {
            mergeMessages(conversationId, [message]);
          }
          if (data.message?.direction === "inbound") {
            notifyInboundMessage({
              id: eventId,
              conversationId: Number(data.conversation_id),
              contactName: data.contact?.name || data.contact?.wa_id || null,
              preview: data.message?.text_body || data.message?.type || null,
              activeConversationId: activeId
            });
          }
          if (processedMessageIds.current.size > 100) {
            const ids = Array.from(processedMessageIds.current);
            processedMessageIds.current = new Set(ids.slice(-50));
          }
        }
      }
    );
    const unsubscribeCallUpdated = subscribe(
      channel,
      ".whatsapp.call.updated",
      (data) => {
        const call = data?.call;
        if (!call?.id) return;
        setRecentCallsState((prev) => mergeCallRecords(prev, [call]));
        if (isIncomingActionableCall(call)) {
          fetchInboxStreamAndMerge();
        }
      }
    );
    return () => {
      unsubscribeConversationUpdated();
      unsubscribeMessageCreated();
      unsubscribeCallUpdated();
    };
  }, [account?.id, subscribe, addToast, currentUserId, notifyAssignmentEnabled, playNotificationSound, showBrowserNotification, fetchInboxStreamAndMerge, notifyInboundMessage, activeId, mergeMessages]);
  useEffect(() => {
    if (!account?.id) return;
    const interval = setInterval(fetchInboxStreamAndMerge, 3e3);
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
    /* @__PURE__ */ jsx("div", { className: "h-[calc(100vh-8rem)] w-full min-w-0 overflow-hidden lg:h-[calc(100vh-6rem)]", children: /* @__PURE__ */ jsxs("div", { className: `grid h-full w-full min-w-0 overflow-hidden rounded-card border border-gray-100 bg-white shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none lg:grid-cols-[minmax(320px,360px)_minmax(0,1fr)] ${showContactPanel ? "xl:grid-cols-[360px_minmax(0,1fr)_320px]" : "xl:grid-cols-[360px_minmax(0,1fr)]"}`, children: [
      /* @__PURE__ */ jsxs("section", { className: `${mobileShowDetail ? "hidden lg:flex" : "flex"} min-h-0 min-w-0 w-full flex-col border-r border-gray-100 bg-white dark:border-waify-dark-border dark:bg-slate-900`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 border-b border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h1", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Inbox" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                filteredConversations.length,
                " conversations"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxs("span", { className: `mr-1 hidden items-center gap-1 rounded-full px-2 py-1 text-[11px] sm:inline-flex ${connected ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`, children: [
                connected ? /* @__PURE__ */ jsx(Wifi, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(WifiOff, { className: "h-3 w-3" }),
                connected ? "Live" : "Polling"
              ] }),
              notificationPermission !== "granted" && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => void requestBrowserNotifications(), className: "inline-flex h-9 items-center gap-1 rounded-btn bg-emerald-50 px-2 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/15", title: "Enable browser notifications", children: [
                /* @__PURE__ */ jsx(BellRing, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Alerts" })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                setBulkMode(!bulkMode);
                setSelectedIds(/* @__PURE__ */ new Set());
              }, className: `flex h-9 w-9 items-center justify-center rounded-btn transition ${bulkMode ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green" : "text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text"}`, title: bulkMode ? "Exit bulk select" : "Bulk select", children: bulkMode ? /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(CheckSquare, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowNewChat(true), className: "flex h-9 w-9 items-center justify-center rounded-btn text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text", title: "New chat", children: /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
            /* @__PURE__ */ jsx(TextInput, { type: "search", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search name or message...", className: "pl-9 dark:bg-slate-800" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs("select", { className: "flex-1 rounded-btn border-gray-200 px-3 py-1.5 text-xs shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800", children: [
              /* @__PURE__ */ jsx("option", { children: "Newest first" }),
              /* @__PURE__ */ jsx("option", { children: "Priority" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setStarredOnly(!starredOnly),
                className: `flex h-9 w-9 items-center justify-center rounded-btn transition ${starredOnly ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800"}`,
                "aria-label": "Starred only",
                children: /* @__PURE__ */ jsx(Star, { className: `h-4 w-4 ${starredOnly ? "fill-amber-400" : ""}` })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 flex items-center gap-2 overflow-x-auto", children: [
            ["all", "All"],
            ["mine", "Mine"],
            ["unassigned", "Unassigned"],
            ["starred", "Starred"],
            ["closed", "Resolved"]
          ].map(([value, label]) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                if (value === "mine") {
                  setAssigneeFilter("me");
                  setStatusFilter("all");
                  setStarredOnly(false);
                } else if (value === "unassigned") {
                  setAssigneeFilter("unassigned");
                  setStatusFilter("all");
                  setStarredOnly(false);
                } else if (value === "starred") {
                  setStarredOnly(true);
                  setAssigneeFilter("all");
                  setStatusFilter("all");
                } else {
                  setStatusFilter(value);
                  setAssigneeFilter("all");
                  setStarredOnly(false);
                }
              },
              className: `h-7 flex-shrink-0 rounded-full px-2.5 text-[11px] font-medium transition ${value === "mine" && assigneeFilter === "me" || value === "unassigned" && assigneeFilter === "unassigned" || value === "starred" && starredOnly || value === statusFilter && !starredOnly && assigneeFilter === "all" ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800"}`,
              children: label
            },
            value
          )) }),
          /* @__PURE__ */ jsx("div", { className: "-mx-1 mt-2 flex gap-1 overflow-x-auto px-1", children: [{ id: "all", label: "All labels", count: filteredConversations.length }, ...INBOX_LABELS.map((label) => ({ ...label, count: conversations.filter((conversation) => getConversationLabels(conversation).includes(label.id)).length }))].map((label) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setLabelFilter(label.id),
              className: `h-7 flex-shrink-0 rounded-full px-2.5 text-[11px] font-medium transition ${labelFilter === label.id ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800"}`,
              children: [
                label.label,
                label.count > 0 && /* @__PURE__ */ jsx("span", { className: "ml-1 opacity-70", children: label.count })
              ]
            },
            label.id
          )) }),
          bulkMode && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              selectedIds.size,
              " selected"
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSelectedIds(new Set(filteredConversations.map((conversation) => conversation.id))), className: "font-medium text-waify-green-dark dark:text-waify-green", children: "Select visible" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2", children: [
            connections && connections.length > 0 && /* @__PURE__ */ jsxs("select", { value: connectionFilter, onChange: (e) => setConnectionFilter(e.target.value === "all" ? "all" : Number(e.target.value)), className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800", children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All numbers" }),
              connections.map((conn) => /* @__PURE__ */ jsx("option", { value: conn.id, children: conn.name }, conn.id))
            ] }),
            /* @__PURE__ */ jsxs("select", { value: assigneeFilter, onChange: (e) => setAssigneeFilter(e.target.value), className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800", children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All assignees" }),
              /* @__PURE__ */ jsx("option", { value: "me", children: "Mine" }),
              /* @__PURE__ */ jsx("option", { value: "unassigned", children: "Unassigned" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "p-2", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(ConversationSkeleton, {}, i)) }) : filteredConversations.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx(EmptyState, { icon: MessageSquare, title: "No conversations", description: "Try another filter or start a new conversation." }) }) : filteredConversations.map((conversation) => {
          const isActive = activeConversation?.id === conversation.id;
          const isSelected = selectedIds.has(conversation.id);
          const assigneeName = conversation.assigned_to ? agents.find((a) => a.id === conversation.assigned_to)?.name ?? "Assigned" : "Unassigned";
          const labels = getConversationLabels(conversation);
          const unreadCount = Number(conversation.unread_count ?? 0);
          const sla = conversationSlaLabel(conversation);
          const replyWindow = customerServiceWindowFor(conversation, [], replyWindowNow);
          const sourceLabel = conversationSourceLabel(conversation);
          const modeLabel = conversationModeLabel(conversation);
          return /* @__PURE__ */ jsxs("div", { className: `flex w-full items-start gap-2 border-b border-gray-50 px-3 py-2.5 text-left transition dark:border-waify-dark-border ${isActive ? "bg-waify-green-soft/60 dark:bg-emerald-950/40" : "hover:bg-gray-50 dark:hover:bg-slate-800"}`, children: [
            bulkMode && /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: isSelected,
                onChange: () => toggleSelectedConversation(conversation.id),
                className: "mt-3 rounded border-gray-300 text-waify-green focus:ring-waify-green/30 dark:border-waify-dark-border dark:bg-slate-800",
                "aria-label": `Select ${conversation.contact.name || conversation.contact.wa_id}`
              }
            ),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
              if (bulkMode) {
                toggleSelectedConversation(conversation.id);
                return;
              }
              setActiveId(conversation.id);
              setMobileShowDetail(true);
            }, className: "flex min-w-0 flex-1 items-start gap-2.5 text-left", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative flex-shrink-0", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-waify-green text-sm font-semibold text-white", children: conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0) }),
                /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" }),
                conversation.priority === "urgent" && /* @__PURE__ */ jsx("span", { className: "absolute -left-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" }),
                unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-waify-green px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900", children: unreadCount > 9 ? "9+" : unreadCount })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: conversation.contact.name || conversation.contact.wa_id }),
                  /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: formatRelative(conversation.last_message_at) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: conversation.last_message_preview || "No messages yet" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex min-w-0 items-center gap-1 overflow-hidden", children: [
                  /* @__PURE__ */ jsxs("span", { className: `inline-flex flex-shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${slaClasses(sla.tone)}`, children: [
                    /* @__PURE__ */ jsx(Clock, { className: "h-2.5 w-2.5" }),
                    sla.label
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: `inline-flex flex-shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${slaClasses(replyWindow.tone)}`, title: replyWindow.detail, children: [
                    /* @__PURE__ */ jsx(MessageSquare, { className: "h-2.5 w-2.5" }),
                    replyWindow.state === "closed" ? "Template required" : replyWindow.state === "none" ? "No window" : replyWindow.label.replace("Reply window ", "")
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-300", children: sourceLabel }),
                  /* @__PURE__ */ jsx("span", { className: `min-w-0 truncate rounded-full px-1.5 py-0.5 text-[10px] font-medium ${conversation.assigned_to ? "bg-white text-waify-text-muted ring-1 ring-gray-100 dark:bg-slate-900 dark:text-waify-dark-text-muted dark:ring-slate-700" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`, children: assigneeName })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-1", children: [
                  conversation.priority === "urgent" && /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 fill-amber-400 text-amber-500" }),
                  /* @__PURE__ */ jsx(Badge, { variant: conversation.status === "open" ? "success" : conversation.status === "pending" ? "warning" : "default", className: "px-2 py-0.5 text-[10px]", children: conversation.status }),
                  /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${conversation.automation_processing ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200" : conversation.bot_paused || conversation.handoff_status === "manual" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : conversation.automation_state ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300"}`, children: [
                    conversation.automation_processing ? /* @__PURE__ */ jsx(Zap, { className: "h-2.5 w-2.5" }) : conversation.bot_paused || conversation.handoff_status === "manual" ? /* @__PURE__ */ jsx(User, { className: "h-2.5 w-2.5" }) : /* @__PURE__ */ jsx(Zap, { className: "h-2.5 w-2.5" }),
                    modeLabel
                  ] }),
                  labels.slice(0, 2).map((labelId) => {
                    const label = INBOX_LABELS.find((item) => item.id === labelId);
                    return label ? /* @__PURE__ */ jsx("span", { className: `rounded-md px-1.5 py-0.5 text-[10px] font-medium ${labelClasses(label.color)}`, children: label.label }, label.id) : null;
                  })
                ] })
              ] })
            ] })
          ] }, conversation.id);
        }) })
      ] }),
      /* @__PURE__ */ jsx("section", { className: `${mobileShowDetail ? "flex" : "hidden lg:flex"} min-h-0 min-w-0 w-full flex-col bg-gray-50/80 dark:bg-slate-950`, children: activeConversation ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-h-14 flex-shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-3 py-1.5 dark:border-waify-dark-border dark:bg-slate-900", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMobileShowDetail(false), className: "flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden", "aria-label": "Back", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-waify-green text-sm font-semibold text-white", children: activeConversation.contact.name?.charAt(0).toUpperCase() || "C" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text sm:text-base", children: activeConversation.contact.name || activeConversation.contact.wa_id }),
              /* @__PURE__ */ jsx(Badge, { variant: activeConversation.status === "open" ? "success" : activeConversation.status === "pending" ? "warning" : "default", className: "hidden px-2 py-0.5 text-[10px] sm:inline-flex", children: activeConversation.status })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate", children: contactDisplayPhone(activeConversation) }),
              /* @__PURE__ */ jsx("span", { className: "h-1 w-1 flex-shrink-0 rounded-full bg-gray-300 dark:bg-slate-600" }),
              /* @__PURE__ */ jsx("span", { className: "hidden truncate md:inline", children: conversationSourceLabel(activeConversation) }),
              /* @__PURE__ */ jsx("span", { className: "hidden h-1 w-1 flex-shrink-0 rounded-full bg-gray-300 md:inline-block dark:bg-slate-600" }),
              /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
                "Assigned: ",
                activeAgentName
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => updateConversationMeta({ priority: activeConversation.priority === "urgent" ? "normal" : "urgent" }), className: `flex h-8 w-8 items-center justify-center rounded-md transition ${activeConversation.priority === "urgent" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" : "text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text"}`, title: "Star", children: /* @__PURE__ */ jsx(Star, { className: `h-4 w-4 ${activeConversation.priority === "urgent" ? "fill-amber-400" : ""}` }) }),
          agents.length > 0 && /* @__PURE__ */ jsxs("label", { className: "relative hidden sm:block", children: [
            /* @__PURE__ */ jsx(User, { className: "pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
            /* @__PURE__ */ jsxs("select", { value: activeConversation.assigned_to ?? "", disabled: assigningId === activeConversation.id, onChange: (e) => {
              const assignedTo = e.target.value === "" ? null : Number(e.target.value);
              setAssigningId(activeConversation.id);
              updateConversationMeta({ assigned_to: assignedTo });
              setAssigningId(null);
            }, className: "h-8 max-w-[140px] rounded-btn border-gray-200 bg-white pl-7 pr-7 text-xs font-medium text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
              agents.map((agent) => /* @__PURE__ */ jsx("option", { value: agent.id, children: agent.id === currentUserId ? "You" : agent.name }, agent.id))
            ] }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setActionsMenuOpen((open) => !open), className: `flex h-8 w-8 items-center justify-center rounded-md transition ${actionsMenuOpen ? "bg-gray-100 text-waify-text dark:bg-slate-800 dark:text-waify-dark-text" : "text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text"}`, title: "More", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }),
            actionsMenuOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-card bg-white py-1 text-xs shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                updateConversationMeta({ status: activeConversation.status === "closed" ? "open" : "closed" });
                setActionsMenuOpen(false);
              }, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
                activeConversation.status === "closed" ? /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
                activeConversation.status === "closed" ? "Reopen" : "Resolve"
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                addToast({ title: "Snoozed", description: "Conversation snoozed for 1 hour.", variant: "info" });
                setActionsMenuOpen(false);
              }, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
                "Snooze 1 hour"
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                updateConversationMeta({ priority: "urgent" });
                setActionsMenuOpen(false);
              }, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
                /* @__PURE__ */ jsx(Flag, { className: "h-4 w-4" }),
                "Mark urgent"
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                updateConversationMeta({ assigned_to: null });
                setActionsMenuOpen(false);
              }, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
                /* @__PURE__ */ jsx(UserX, { className: "h-4 w-4" }),
                "Unassign"
              ] }),
              canDeleteChats && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                setActionsMenuOpen(false);
                deleteConversation();
              }, disabled: deletingConversationId === activeConversation.id, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-500/10", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                "Delete chat"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMobileContactPanelOpen(true), className: `flex h-8 w-8 items-center justify-center rounded-md transition xl:hidden ${mobileContactPanelOpen ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800"}`, title: "Contact details", children: /* @__PURE__ */ jsx(PanelRight, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowContactPanel(!showContactPanel), className: `hidden h-8 w-8 items-center justify-center rounded-md transition xl:flex ${showContactPanel ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800"}`, title: "Contact details", children: /* @__PURE__ */ jsx(PanelRight, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 border-b border-gray-100 bg-gray-50/90 px-3 py-1.5 dark:border-waify-dark-border dark:bg-slate-800/95", children: /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-1.5 overflow-x-auto waify-scrollbar", children: [
          /* @__PURE__ */ jsxs("span", { className: `inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold ${activeBotIsReplying ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200" : activeManualMode ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : activeAutomationState ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200"}`, children: [
            activeManualMode ? /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3" }),
            conversationModeLabel(activeConversation)
          ] }),
          /* @__PURE__ */ jsxs("span", { className: `inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium ${slaClasses(conversationSlaLabel(activeConversation).tone)}`, children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
            "SLA ",
            conversationSlaLabel(activeConversation).label
          ] }),
          /* @__PURE__ */ jsxs("span", { className: `inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold ${slaClasses(activeReplyWindow.tone)}`, title: activeReplyWindow.detail, children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-3 w-3" }),
            activeReplyWindow.label
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-medium text-waify-text-muted ring-1 ring-gray-100 dark:bg-slate-900 dark:text-waify-dark-text-muted dark:ring-slate-700", children: [
            /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
            activeAgentName
          ] }),
          activeConversation.priority && /* @__PURE__ */ jsxs("span", { className: "inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 text-[11px] text-red-700 dark:bg-red-500/10 dark:text-red-300", children: [
            /* @__PURE__ */ jsx(Flag, { className: "h-3 w-3" }),
            " ",
            activeConversation.priority
          ] }),
          /* @__PURE__ */ jsx("span", { className: "h-5 w-px flex-shrink-0 bg-gray-200 dark:bg-slate-700" }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => updateConversationMeta({ status: activeConversation.status === "closed" ? "open" : "closed" }), className: `inbox-resolve-btn inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition ${activeConversation.status === "closed" ? "is-resolved bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-slate-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300"}`, children: [
            activeConversation.status === "closed" ? /* @__PURE__ */ jsx(RotateCcw, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }),
            activeConversation.status === "closed" ? "Reopen" : "Resolve"
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleBotPaused(!activeManualMode), className: `inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition ${activeManualMode ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300"}`, children: [
            activeManualMode ? /* @__PURE__ */ jsx(Play, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
            activeManualMode ? "Resume bot" : "Manual"
          ] }),
          INBOX_LABELS.filter((label) => !getConversationLabels(activeConversation).includes(label.id)).slice(0, 2).map((label) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => addConversationLabel(label.id), className: "inbox-label-add hidden flex-shrink-0 px-1.5 text-[10px] text-waify-text-muted hover:text-waify-green-dark dark:text-waify-dark-text-muted lg:inline-flex", children: [
            "+ ",
            label.label
          ] }, label.id))
        ] }) }),
        activeBotIsReplying && /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 font-semibold", children: [
            /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
            activeConversation.automation_processing_mode === "ai" ? "AI is replying" : "Bot is replying"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: "Human sending is blocked for a few seconds to avoid duplicate replies." }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleBotPaused(true), className: "inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-[11px] font-medium text-purple-700 shadow-sm ring-1 ring-purple-100 transition hover:bg-purple-100 dark:bg-slate-900 dark:text-purple-200 dark:ring-purple-500/20", children: [
            /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
            "Take over"
          ] })
        ] }),
        activeManualMode && /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 font-semibold", children: [
            /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
            "Manual mode"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: activeConversation.handoff_reason || activeConversation.bot_paused_reason || "Automation and AI autopilot will not reply in this chat." }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleBotPaused(false), className: "inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700", children: [
            /* @__PURE__ */ jsx(Play, { className: "h-3 w-3" }),
            "Resume"
          ] })
        ] }),
        !activeReplyWindow.isOpen && /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 font-semibold", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
            activeReplyWindow.state === "closed" ? "24-hour window closed" : "Template required"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: activeReplyWindow.detail }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
            setShowTemplates(true);
            setShowQuickReplies(false);
            setShowInteractiveComposer(false);
          }, className: "inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-[11px] font-medium text-red-700 shadow-sm ring-1 ring-red-100 transition hover:bg-red-100 dark:bg-slate-900 dark:text-red-200 dark:ring-red-500/20", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3" }),
            "Templates"
          ] })
        ] }),
        activeAutomationState && /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 font-semibold", children: [
            /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
            "Automation waiting"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1 truncate", children: [
            activeAutomationState.flow_name,
            activeAutomationState.waiting_node_label ? ` · ${activeAutomationState.waiting_node_label}` : "",
            (activeAutomationState.invalid_replies ?? 0) > 0 ? ` · ${activeAutomationState.invalid_replies} unmatched reply` : ""
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: stopAutomation, className: "inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-[11px] font-medium text-red-600 shadow-sm ring-1 ring-emerald-100 transition hover:bg-red-50 dark:bg-slate-900 dark:text-red-300 dark:ring-emerald-500/20 dark:hover:bg-red-500/10", children: [
            /* @__PURE__ */ jsx(Pause, { className: "h-3 w-3" }),
            "Stop"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "chat-bg min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-2xl space-y-3", children: [
          activeDisplayMessages.length === 0 && activeConversationLoading ? /* @__PURE__ */ jsxs("div", { className: "py-16 text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-waify-green/30 border-t-waify-green" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Loading messages" })
          ] }) : activeDisplayMessages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "py-16 text-center", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "mx-auto mb-3 h-10 w-10 text-gray-300" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "No messages loaded" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Messages for this chat will appear here." })
          ] }) : activeDisplayMessages.map((message, index) => {
            const previousMessage = activeDisplayMessages[index - 1];
            const showDateSeparator = !previousMessage || formatDateKey(previousMessage.created_at) !== formatDateKey(message.created_at);
            const dateSeparator = showDateSeparator ? /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("span", { className: "rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-waify-text-muted shadow-sm dark:bg-slate-800/90 dark:text-waify-dark-text-muted", children: formatDateLabel(message.created_at) }) }) : null;
            if (message.type === "automation_status") {
              const eventType = String(message.payload?.event_type ?? "");
              const isRunning = eventType.endsWith("_running") || eventType === "ai_replying";
              const isFailed = eventType.endsWith("_failed");
              const isSkipped = eventType.endsWith("_skipped");
              const statusClass = isFailed ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" : isSkipped ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
              return /* @__PURE__ */ jsxs(Fragment$1, { children: [
                dateSeparator,
                /* @__PURE__ */ jsx("div", { className: "flex justify-center px-2", children: /* @__PURE__ */ jsxs("div", { className: `inline-flex max-w-[92%] items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium shadow-sm sm:max-w-[70%] ${statusClass}`, children: [
                  isRunning ? /* @__PURE__ */ jsx("span", { className: "h-2 w-2 animate-pulse rounded-full bg-current" }) : isFailed ? /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: message.text_body }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] opacity-75", title: formatExactDateTime(message.created_at), children: formatTime(message.created_at) })
                ] }) })
              ] }, message.id);
            }
            if (message.type === "internal_note") {
              const author = message.payload?.created_by?.name ?? "Team note";
              return /* @__PURE__ */ jsxs(Fragment$1, { children: [
                dateSeparator,
                /* @__PURE__ */ jsx("div", { className: "flex justify-center px-2", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[92%] rounded-lg border border-waify-border bg-white px-3 py-2 text-xs text-waify-text shadow-sm dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text sm:max-w-[70%]", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center gap-1.5 font-semibold text-waify-text dark:text-waify-dark-text", children: [
                    /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5 text-waify-text-muted dark:text-waify-dark-text-muted" }),
                    "Internal note"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap break-words", children: message.text_body }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center justify-between gap-3 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: author }),
                    /* @__PURE__ */ jsx("span", { title: formatExactDateTime(message.created_at), children: formatTime(message.created_at) })
                  ] })
                ] }) })
              ] }, message.id);
            }
            const outbound = message.direction === "outbound";
            const isCallTranscript = isCallTranscriptMessage(message);
            const mediaPayload = message.payload?.[message.type] ?? {};
            const text = message.text_body || (message.type === "template" ? "Template message" : message.type === "location" ? "Location shared" : "");
            const mediaUrl = message.payload?.media?.local_url || message.payload?.link || message.payload?.url || mediaPayload?.link || mediaPayload?.url;
            const mediaId = message.payload?.media?.id || message.payload?.media_id || mediaPayload?.id;
            const filename = message.payload?.filename || mediaPayload?.filename || message.payload?.document?.filename || "Attachment";
            const timelineBadge = timelineBadgeForMessage(message);
            return /* @__PURE__ */ jsxs(Fragment$1, { children: [
              dateSeparator,
              /* @__PURE__ */ jsx("div", { className: `flex ${outbound ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxs("div", { className: `group relative max-w-[82%] rounded-lg px-4 py-2.5 text-sm shadow-sm ${isCallTranscript ? "ring-1 ring-emerald-200 dark:ring-emerald-500/30" : ""} ${outbound ? "bg-[#DCF8C6] text-waify-text dark:bg-[#005C4B] dark:text-white" : "bg-white text-waify-text dark:bg-[#202C33] dark:text-waify-dark-text"}`, children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: `inbox-message-actionbar pointer-events-none absolute top-1 z-20 flex items-center gap-1 overflow-x-auto rounded-full bg-white/95 px-1.5 py-1 opacity-0 shadow-pop ring-1 ring-gray-100 transition group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-slate-800/95 dark:ring-slate-700 ${outbound ? "right-1" : "left-1"}`,
                    onClick: (event) => event.stopPropagation(),
                    onMouseDown: (event) => event.preventDefault(),
                    children: [
                      canReactToMessage(message) && /* @__PURE__ */ jsxs(Fragment, { children: [
                        HOVER_REACTIONS.map((reaction) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setReaction(message, reaction), className: "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-base transition hover:bg-gray-100 dark:hover:bg-slate-700", "aria-label": `React ${reaction}`, children: reaction }, reaction)),
                        /* @__PURE__ */ jsx("span", { className: "h-5 w-px bg-gray-100 dark:bg-slate-700" })
                      ] }),
                      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setReplyTo(message), className: "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-700 dark:hover:text-waify-dark-text", "aria-label": "Reply", children: /* @__PURE__ */ jsx(Reply, { className: "h-3.5 w-3.5" }) })
                    ]
                  }
                ),
                (messageReactions[String(message.id)] || activeMessageReactions[String(message.id)]) && /* @__PURE__ */ jsx("span", { className: `absolute -bottom-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-sm shadow-sm ring-1 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700 ${outbound ? "left-2" : "right-2"}`, children: messageReactions[String(message.id)] || activeMessageReactions[String(message.id)] }),
                message.reply_to && /* @__PURE__ */ jsx("div", { className: "mb-2 border-l-2 border-waify-green bg-white/45 px-2 py-1 text-[11px] text-waify-text-muted dark:bg-black/10 dark:text-waify-dark-text-muted", children: message.reply_to }),
                timelineBadge && (() => {
                  const TimelineIcon = timelineBadge.icon;
                  return /* @__PURE__ */ jsxs("div", { className: `mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${timelineBadge.classes}`, children: [
                    /* @__PURE__ */ jsx(TimelineIcon, { className: "h-3 w-3" }),
                    timelineBadge.label
                  ] });
                })(),
                isCallTranscript && /* @__PURE__ */ jsxs("div", { className: `mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${outbound ? "bg-white/50 text-emerald-800 dark:bg-white/10 dark:text-emerald-100" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"}`, children: [
                  /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" }),
                  "Call transcript · ",
                  callTranscriptSpeaker(message)
                ] }),
                message.type === "interactive" && /* @__PURE__ */ jsxs("div", { className: "mb-2 rounded-lg bg-white/50 p-3 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center gap-2 font-semibold", children: [
                    /* @__PURE__ */ jsx(ClipboardList, { className: "h-4 w-4" }),
                    message.payload?.interactive_type === "flow" ? "Form" : message.payload?.interactive_type === "list" ? "List message" : "Reply buttons"
                  ] }),
                  message.payload?.header_text && /* @__PURE__ */ jsx("div", { className: "mb-1 font-medium", children: message.payload.header_text }),
                  /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap", children: message.text_body }),
                  message.payload?.buttons && /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: message.payload.buttons.map((button) => /* @__PURE__ */ jsx("span", { className: "rounded-full bg-waify-green-soft px-2 py-1 text-[11px] font-medium text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: button.text }, button.id || button.text)) }),
                  message.payload?.interactive?.action?.sections?.[0]?.rows && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1", children: message.payload.interactive.action.sections[0].rows.slice(0, 4).map((row) => /* @__PURE__ */ jsx("div", { className: "rounded-md bg-white/60 px-2 py-1 dark:bg-slate-900/50", children: row.title }, row.id)) }),
                  message.payload?.flow_id && /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-md bg-white/60 px-2 py-1 dark:bg-slate-900/50", children: [
                    "Flow ID: ",
                    message.payload.flow_id
                  ] })
                ] }),
                message.type === "image" && mediaUrl && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMediaPreview({ type: "image", url: mediaUrl, title: filename, filename }), className: "mb-2 block overflow-hidden rounded-md text-left", children: /* @__PURE__ */ jsx("img", { src: mediaUrl, alt: filename, className: "max-h-64 w-full object-cover" }) }),
                message.type === "image" && !mediaUrl && /* @__PURE__ */ jsx("div", { className: "mb-2 flex min-h-32 items-center justify-center rounded-md bg-white/50 px-3 py-6 text-center text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10", children: /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Image, { className: "mx-auto mb-2 h-6 w-6 text-waify-text-muted dark:text-waify-dark-text-muted" }),
                  /* @__PURE__ */ jsx("div", { className: "font-medium", children: "Image received" }),
                  mediaId && /* @__PURE__ */ jsxs("div", { className: "mt-1 max-w-48 truncate text-[10px] opacity-70", children: [
                    "Meta media ID: ",
                    mediaId
                  ] })
                ] }) }),
                message.type === "sticker" && mediaUrl && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMediaPreview({ type: "sticker", url: mediaUrl, title: "Sticker", filename: "Sticker" }), className: "mb-2 block w-fit overflow-hidden rounded-md text-left", children: /* @__PURE__ */ jsx("img", { src: mediaUrl, alt: "Sticker", className: "max-h-40 max-w-40 object-contain" }) }),
                message.type === "sticker" && !mediaUrl && /* @__PURE__ */ jsx("div", { className: "mb-2 flex min-h-28 items-center justify-center rounded-md bg-white/50 px-3 py-5 text-center text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10", children: /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Image, { className: "mx-auto mb-2 h-6 w-6 text-waify-text-muted dark:text-waify-dark-text-muted" }),
                  /* @__PURE__ */ jsx("div", { className: "font-medium", children: "Sticker received" }),
                  mediaId && /* @__PURE__ */ jsxs("div", { className: "mt-1 max-w-48 truncate text-[10px] opacity-70", children: [
                    "Meta media ID: ",
                    mediaId
                  ] })
                ] }) }),
                message.type === "video" && mediaUrl && /* @__PURE__ */ jsx(
                  ChatVideoCard,
                  {
                    src: mediaUrl,
                    title: filename,
                    outbound,
                    onPreview: () => setMediaPreview({ type: "video", url: mediaUrl, title: filename, filename })
                  }
                ),
                message.type === "video" && !mediaUrl && /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-md bg-white/50 px-3 py-3 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10", children: [
                  /* @__PURE__ */ jsx(Image, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1 truncate", children: [
                    "Video received",
                    mediaId ? ` (${mediaId})` : ""
                  ] })
                ] }),
                message.type === "audio" && mediaUrl && /* @__PURE__ */ jsx(
                  ChatAudioPlayer,
                  {
                    src: mediaUrl,
                    title: filename,
                    outbound,
                    voice: Boolean(message.payload?.voice || mediaPayload?.voice),
                    onPreview: () => setMediaPreview({ type: "audio", url: mediaUrl, title: filename, filename })
                  }
                ),
                message.type === "audio" && !mediaUrl && /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-md bg-white/50 px-3 py-3 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10", children: [
                  /* @__PURE__ */ jsx(Mic, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1 truncate", children: [
                    mediaPayload?.voice ? "Voice message received" : "Audio received",
                    mediaId ? ` (${mediaId})` : ""
                  ] })
                ] }),
                message.type === "document" && mediaUrl && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setMediaPreview({ type: "document", url: mediaUrl, title: filename, filename }), className: "mb-2 flex w-full items-center gap-2 rounded-md bg-white/50 px-3 py-2 text-left text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10", children: [
                  /* @__PURE__ */ jsx(File$1, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: filename })
                ] }),
                message.type === "document" && !mediaUrl && /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-md bg-white/50 px-3 py-3 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10", children: [
                  /* @__PURE__ */ jsx(File$1, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1 truncate", children: [
                    filename,
                    mediaId ? ` (${mediaId})` : ""
                  ] })
                ] }),
                message.type === "location" && /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-md bg-white/50 px-3 py-2 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsx("span", { children: message.payload?.name || text })
                ] }),
                text && /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap break-words", children: text }),
                /* @__PURE__ */ jsxs("div", { className: `mt-1.5 flex items-center justify-end gap-1 text-[10px] ${outbound ? "text-gray-600 dark:text-emerald-100" : "text-waify-text-muted dark:text-waify-dark-text-muted"}`, children: [
                  /* @__PURE__ */ jsx("span", { title: formatExactDateTime(message.created_at), children: formatTime(message.created_at) }),
                  outbound && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                    messageStatusIcon(message),
                    message.status === "failed" && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => retryMessage(message), className: "ml-1 rounded px-1 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10", children: "Retry" })
                  ] })
                ] })
              ] }) })
            ] }, message.id);
          }),
          /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-20 flex-shrink-0 border-t border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-slate-900", children: [
          replyTo && /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-md border-l-2 border-waify-green bg-gray-50 px-3 py-2 dark:bg-slate-800", children: [
            /* @__PURE__ */ jsx(Reply, { className: "h-3.5 w-3.5 flex-shrink-0 text-waify-text-muted dark:text-waify-dark-text-muted" }),
            /* @__PURE__ */ jsx("p", { className: "min-w-0 flex-1 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: messageReplyPreview(replyTo) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setReplyTo(null), className: "rounded p-1 text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-700", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
          ] }),
          showQuickReplies && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 right-0 z-20 mx-3 mb-1 max-h-48 overflow-y-auto rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700", children: [
            /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-3 py-2 text-xs font-semibold text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "Quick replies" }),
            QUICK_REPLIES.map((reply) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => insertQuickReply(reply.text), className: "w-full border-b border-gray-50 px-3 py-2.5 text-left transition last:border-0 hover:bg-gray-50 dark:border-waify-dark-border dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-waify-text dark:text-waify-dark-text", children: reply.label }),
              /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: reply.text })
            ] }, reply.id))
          ] }),
          showTemplates && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 right-0 z-20 mx-3 mb-1 max-h-56 overflow-y-auto rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700", children: [
            /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-3 py-2 text-xs font-semibold text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "Approved templates" }),
            templates.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-6 text-center text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "No approved templates found." }) : templates.slice(0, 8).map((template) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => applyTemplate(template), className: "w-full border-b border-gray-50 px-3 py-2.5 text-left transition last:border-0 hover:bg-gray-50 dark:border-waify-dark-border dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "truncate text-xs font-medium text-waify-text dark:text-waify-dark-text", children: template.name }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: template.language })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-0.5 line-clamp-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: template.body_text || "Template message" })
            ] }, template.id))
          ] }),
          showInteractiveComposer && /* @__PURE__ */ jsxs("div", { className: "fixed bottom-20 left-3 right-3 z-50 flex max-h-[min(420px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700 sm:absolute sm:bottom-full sm:left-12 sm:right-auto sm:mb-2 sm:w-[420px] sm:max-h-[430px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Interactive message" }),
                /* @__PURE__ */ jsx("p", { className: "mt-0.5 hidden truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted sm:block", children: "Saved buttons, lists, forms, products, links, payments, or contact cards." })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowInteractiveComposer(false), className: "rounded-md p-1 text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-shrink-0 gap-1 overflow-x-auto border-b border-gray-100 bg-gray-50 px-2 py-1.5 dark:border-waify-dark-border dark:bg-slate-800/70 waify-scrollbar", children: [
              ["buttons", "Buttons"],
              ["list", "List"],
              ["form", "Form"],
              ["product", "Product"],
              ["link", "Link"],
              ["payment", "Payment"],
              ["contact", "Contact"]
            ].map(([mode, label]) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setInteractiveMode(mode), className: `h-7 flex-shrink-0 rounded-md px-2.5 text-[11px] font-medium transition ${interactiveMode === mode ? "bg-white text-waify-green-dark shadow-sm dark:bg-slate-950 dark:text-waify-green" : "text-waify-text-muted hover:bg-white/70 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-950/70 dark:hover:text-waify-dark-text"}`, children: label }, mode)) }),
            /* @__PURE__ */ jsxs("div", { className: "grid min-h-0 flex-1 gap-1.5 overflow-y-auto p-2.5 waify-scrollbar", children: [
              !["payment", "contact", "product"].includes(interactiveMode) && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.header_text, onChange: (event) => setInteractiveDraft((current) => ({ ...current, header_text: event.target.value })), placeholder: "Header (optional)", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsx("textarea", { value: interactiveDraft.body_text, onChange: (event) => setInteractiveDraft((current) => ({ ...current, body_text: event.target.value })), placeholder: "Message body", rows: 2, className: "resize-none rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" })
              ] }),
              interactiveMode === "buttons" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 rounded-btn border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-[11px] dark:border-waify-dark-border dark:bg-slate-800", children: [
                  /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate text-waify-text-muted dark:text-waify-dark-text-muted", children: "Create quick button labels here, or manage the full saved list." }),
                  /* @__PURE__ */ jsxs(Link, { href: route("app.quick-replies.index"), className: "inline-flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium text-waify-green-dark hover:bg-white dark:text-waify-green dark:hover:bg-slate-950", children: [
                    "Manage",
                    /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: newInteractiveButtonLabel,
                      onChange: (event) => setNewInteractiveButtonLabel(event.target.value.slice(0, 20)),
                      onKeyDown: (event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveInteractiveButton();
                        }
                      },
                      placeholder: "Save new button text",
                      maxLength: 20,
                      className: "min-w-0 flex-1 rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                    }
                  ),
                  /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: saveInteractiveButton, disabled: savingInteractiveButton || !newInteractiveButtonLabel.trim(), children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
                    "Save"
                  ] })
                ] }),
                savedButtonOptions.length > 0 && /* @__PURE__ */ jsxs("div", { className: "max-h-32 overflow-y-auto rounded-btn border border-gray-100 bg-gray-50 p-1.5 dark:border-waify-dark-border dark:bg-slate-800 waify-scrollbar", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    /* @__PURE__ */ jsx("span", { children: "Saved buttons" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      interactiveDraft.saved_button_ids.length,
                      "/3 selected"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "grid gap-1 sm:grid-cols-2", children: savedButtonOptions.slice(0, 24).map((button) => {
                    const active = interactiveDraft.saved_button_ids.includes(Number(button.id));
                    return /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] ring-1 ${active ? "bg-waify-green text-white ring-waify-green" : "bg-white text-waify-text-muted ring-gray-100 dark:bg-slate-950 dark:text-waify-dark-text-muted dark:ring-slate-700"}`,
                        children: [
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => setInteractiveDraft((current) => {
                                const exists = current.saved_button_ids.includes(Number(button.id));
                                const next = exists ? current.saved_button_ids.filter((id) => id !== Number(button.id)) : [...current.saved_button_ids, Number(button.id)].slice(0, 3);
                                return { ...current, saved_button_ids: next };
                              }),
                              className: "min-w-0 flex-1 truncate text-left font-medium",
                              title: active ? "Remove from this message" : "Add to this message",
                              children: button.button_text || button.label
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => void deleteSavedInteractiveButton(button),
                              className: `flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition ${active ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-waify-text-muted hover:bg-red-50 hover:text-red-600 dark:text-waify-dark-text-muted dark:hover:bg-red-500/10 dark:hover:text-red-300"}`,
                              title: "Delete saved button",
                              "aria-label": `Delete ${button.button_text || button.label}`,
                              children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
                            }
                          )
                        ]
                      },
                      button.id
                    );
                  }) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "Select up to 3 buttons for this message. Add/edit/delete the full library from Quick Replies." })
              ] }),
              interactiveMode === "list" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("select", { value: interactiveDraft.list_id, onChange: (event) => setInteractiveDraft((current) => ({ ...current, list_id: event.target.value })), className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text", children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Choose saved list" }),
                  savedLists.filter((list) => !list.connection_id || list.connection_id === activeConversation?.connection.id).map((list) => /* @__PURE__ */ jsx("option", { value: list.id, children: list.name }, list.id))
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "Lists are sent from saved WhatsApp list templates only." })
              ] }),
              interactiveMode === "form" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("select", { value: interactiveDraft.form_id, onChange: (event) => setInteractiveDraft((current) => ({ ...current, form_id: event.target.value })), className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text", children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Choose saved form" }),
                  savedForms.filter((form) => !form.connection_id || form.connection_id === activeConversation?.connection.id).map((form) => /* @__PURE__ */ jsxs("option", { value: form.id, children: [
                    form.name,
                    form.status && form.status !== "published" ? ` (${form.status})` : ""
                  ] }, form.id))
                ] }),
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.form_button_text, onChange: (event) => setInteractiveDraft((current) => ({ ...current, form_button_text: event.target.value })), placeholder: "Button label", maxLength: 30, className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "Sends an official WhatsApp Flow form inside WhatsApp. Custom surveys and Meta lead forms are not shown here." })
              ] }),
              interactiveMode === "product" && /* @__PURE__ */ jsx(Fragment, { children: catalogProducts.length > 0 ? /* @__PURE__ */ jsx("div", { className: "max-h-44 overflow-y-auto rounded-btn border border-gray-100 bg-gray-50 p-1 dark:border-waify-dark-border dark:bg-slate-800", children: catalogProducts.filter((product) => product.catalog_id && product.retailer_id).slice(0, 20).map((product) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setInteractiveDraft((current) => ({ ...current, product_id: String(product.id) })),
                  className: `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${String(product.id) === String(interactiveDraft.product_id) ? "bg-waify-green/10 ring-1 ring-waify-green/30" : "hover:bg-white dark:hover:bg-slate-950"}`,
                  children: [
                    product.image_url ? /* @__PURE__ */ jsx("img", { src: product.image_url, alt: "", className: "h-7 w-7 rounded object-cover" }) : /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded bg-white text-waify-text-muted dark:bg-slate-950 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "h-3.5 w-3.5" }) }),
                    /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "block truncate font-medium text-waify-text dark:text-waify-dark-text", children: product.name }),
                      /* @__PURE__ */ jsxs("span", { className: "block truncate text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                        product.retailer_id || product.sku,
                        " · ",
                        product.source || "catalog"
                      ] })
                    ] })
                  ]
                },
                product.id
              )) }) : /* @__PURE__ */ jsx("p", { className: "rounded-btn border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200", children: "No synced products yet. Connect and sync Meta Catalog from Integrations first." }) }),
              interactiveMode === "link" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.cta_display_text, onChange: (event) => setInteractiveDraft((current) => ({ ...current, cta_display_text: event.target.value })), placeholder: "Button label", maxLength: 20, className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.cta_url, onChange: (event) => setInteractiveDraft((current) => ({ ...current, cta_url: event.target.value })), placeholder: "https://example.com", inputMode: "url", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" })
              ] }),
              interactiveMode === "payment" && /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.payment_amount, onChange: (event) => setInteractiveDraft((current) => ({ ...current, payment_amount: event.target.value })), placeholder: "Amount in INR", inputMode: "decimal", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.payment_expire_after_days, onChange: (event) => setInteractiveDraft((current) => ({ ...current, payment_expire_after_days: event.target.value })), placeholder: "Expires in days", inputMode: "numeric", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.payment_description, onChange: (event) => setInteractiveDraft((current) => ({ ...current, payment_description: event.target.value })), placeholder: "Payment description", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text sm:col-span-2" }),
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.payment_button_text, onChange: (event) => setInteractiveDraft((current) => ({ ...current, payment_button_text: event.target.value })), placeholder: "Button label", maxLength: 20, className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text sm:col-span-2" })
              ] }),
              interactiveMode === "contact" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.contact_name, onChange: (event) => setInteractiveDraft((current) => ({ ...current, contact_name: event.target.value })), placeholder: "Contact name", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.contact_phone, onChange: (event) => setInteractiveDraft((current) => ({ ...current, contact_phone: event.target.value })), placeholder: "Contact phone with country code", inputMode: "tel", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsx("input", { value: interactiveDraft.contact_email, onChange: (event) => setInteractiveDraft((current) => ({ ...current, contact_email: event.target.value })), placeholder: "Email (optional)", inputMode: "email", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" })
              ] }),
              !["payment", "contact", "product"].includes(interactiveMode) && /* @__PURE__ */ jsx("input", { value: interactiveDraft.footer_text, onChange: (event) => setInteractiveDraft((current) => ({ ...current, footer_text: event.target.value })), placeholder: "Footer (optional)", className: "rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 items-center justify-end gap-2 border-t border-gray-100 bg-white px-3 py-2 dark:border-waify-dark-border dark:bg-slate-900", children: [
              /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => setShowInteractiveComposer(false), children: "Cancel" }),
              /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", onClick: sendInteractiveMessage, disabled: sendingMessage || !["contact", "payment", "form"].includes(interactiveMode) && !interactiveDraft.body_text.trim() && interactiveMode !== "list" || interactiveMode === "buttons" && interactiveDraft.saved_button_ids.length === 0 || interactiveMode === "list" && !interactiveDraft.list_id || interactiveMode === "form" && !interactiveDraft.form_id || interactiveMode === "product" && !interactiveDraft.product_id || interactiveMode === "link" && !interactiveDraft.cta_url.trim() || interactiveMode === "payment" && !interactiveDraft.payment_amount.trim() || interactiveMode === "contact" && (!interactiveDraft.contact_name.trim() || !interactiveDraft.contact_phone.trim()), children: [
                /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
                "Send ",
                interactiveMode === "form" ? "form" : interactiveMode === "payment" ? "payment link" : interactiveMode === "link" ? "link" : interactiveMode === "contact" ? "contact" : interactiveMode
              ] })
            ] })
          ] }),
          showEmoji && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-3 z-20 mb-1 flex gap-1 rounded-card bg-white p-2 shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700", children: EMOJI_QUICK.map((emoji) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
            setMessageDraft((draft) => draft + emoji);
            setShowEmoji(false);
          }, className: "h-8 w-8 rounded-md text-lg transition hover:bg-gray-100 dark:hover:bg-slate-800", children: emoji }, emoji)) }),
          showAttachments && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-12 z-20 mb-1 w-48 overflow-hidden rounded-card bg-white py-1 shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700", children: [
            [
              ["Photo or video", "image/*,video/*", Image],
              ["Audio or voice", "audio/aac,audio/mp4,audio/mpeg,audio/amr,audio/ogg,audio/wav,.aac,.m4a,.mp3,.amr,.ogg,.wav", Mic],
              ["Document", ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip", File$1]
            ].map(([label, accept, Icon]) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => openFilePicker(accept), className: "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-waify-text transition hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-waify-text-muted dark:text-waify-dark-text-muted" }),
              label
            ] }, label)),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
              setShowAttachments(false);
              setShowLocationPicker(true);
            }, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-waify-text transition hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-waify-text-muted dark:text-waify-dark-text-muted" }),
              "Location"
            ] })
          ] }),
          showLocationPicker && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 right-0 z-20 mx-3 mb-1 max-h-[78vh] overflow-y-auto rounded-card bg-white p-3 shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700 sm:left-12 sm:right-auto sm:w-[380px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Send location" }),
                /* @__PURE__ */ jsx("div", { className: "text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: "Search, use current, or click the map." })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowLocationPicker(false), className: "rounded-md p-1 text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: locationSearch,
                    onChange: (event) => setLocationSearch(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void searchLocations();
                      }
                    },
                    placeholder: "Search address or landmark",
                    className: "min-w-0 flex-1 rounded-btn border-gray-200 px-3 py-2 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                  }
                ),
                /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => void searchLocations(), disabled: locationSearching, children: locationSearching ? /* @__PURE__ */ jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-waify-text-muted border-t-transparent" }) : /* @__PURE__ */ jsx(Search, { className: "h-3.5 w-3.5" }) })
              ] }),
              locationResults.length > 0 && /* @__PURE__ */ jsx("div", { className: "max-h-28 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-1 dark:border-waify-dark-border dark:bg-slate-800/70", children: locationResults.map((result) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    selectLocation(result.lat, result.lng, result.label.split(",").slice(0, 2).join(", "));
                    setLocationResults([]);
                  },
                  className: "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-[11px] text-waify-text transition hover:bg-white dark:text-waify-dark-text dark:hover:bg-slate-900",
                  children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-waify-green" }),
                    /* @__PURE__ */ jsx("span", { className: "line-clamp-2", children: result.label })
                  ]
                },
                `${result.lat}-${result.lng}-${result.label}`
              )) }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  role: "button",
                  tabIndex: 0,
                  onClick: handleLocationMapClick,
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectLocation(locationMap.lat, locationMap.lng);
                    }
                  },
                  className: "relative h-48 cursor-crosshair overflow-hidden rounded-xl border border-gray-200 bg-slate-100 dark:border-waify-dark-border dark:bg-slate-800",
                  "aria-label": "Click map to choose a location",
                  children: [
                    locationTiles.map((tile) => /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: tile.url,
                        alt: "",
                        draggable: false,
                        className: "absolute h-64 w-64 select-none",
                        style: { left: tile.left, top: tile.top }
                      },
                      tile.key
                    )),
                    /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center", children: [
                      /* @__PURE__ */ jsx(MapPin, { className: "h-8 w-8 fill-waify-green text-waify-green drop-shadow" }),
                      /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-waify-green shadow" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "absolute right-2 top-2 flex overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-gray-200 dark:bg-slate-900 dark:ring-waify-dark-border", children: [
                      /* @__PURE__ */ jsx("button", { type: "button", onClick: (event) => {
                        event.stopPropagation();
                        setLocationMap((current) => ({ ...current, zoom: Math.min(18, current.zoom + 1) }));
                      }, className: "flex h-7 w-7 items-center justify-center text-sm font-semibold text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800", children: "+" }),
                      /* @__PURE__ */ jsx("button", { type: "button", onClick: (event) => {
                        event.stopPropagation();
                        setLocationMap((current) => ({ ...current, zoom: Math.max(3, current.zoom - 1) }));
                      }, className: "flex h-7 w-7 items-center justify-center border-l border-gray-100 text-sm font-semibold text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:text-waify-dark-text dark:hover:bg-slate-800", children: "-" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 right-2 rounded bg-white/85 px-1.5 py-0.5 text-[9px] text-waify-text-muted dark:bg-slate-950/80 dark:text-waify-dark-text-muted", children: "OpenStreetMap" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: locationInput.label,
                  onChange: (event) => setLocationInput((current) => ({ ...current, label: event.target.value })),
                  placeholder: "Location name",
                  className: "rounded-btn border-gray-200 px-3 py-2 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: locationInput.latitude,
                    onChange: (event) => setLocationInput((current) => ({ ...current, latitude: event.target.value })),
                    placeholder: "Latitude",
                    inputMode: "decimal",
                    className: "rounded-btn border-gray-200 px-3 py-2 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: locationInput.longitude,
                    onChange: (event) => setLocationInput((current) => ({ ...current, longitude: event.target.value })),
                    placeholder: "Longitude",
                    inputMode: "decimal",
                    className: "rounded-btn border-gray-200 px-3 py-2 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                  }
                )
              ] }),
              pickedLocationMapUrl && /* @__PURE__ */ jsxs("a", { href: pickedLocationMapUrl, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-[11px] font-medium text-waify-green-dark hover:underline dark:text-waify-green", children: [
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" }),
                "Preview in Google Maps"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: useCurrentLocationForPicker, disabled: sendingMessage, children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
                  "Use current"
                ] }),
                /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", onClick: sendManualLocation, disabled: sendingMessage, children: "Send location" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              multiple: true,
              accept: filePickerAccept,
              className: "sr-only",
              tabIndex: -1,
              onChange: (event) => addPickedFiles(event.target.files)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mb-1 flex flex-wrap items-center gap-1.5", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setNoteMode(!noteMode), className: `whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium transition ${noteMode ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800"}`, children: [
              /* @__PURE__ */ jsx(Lock, { className: "mr-1 inline h-3 w-3" }),
              noteMode ? "Note mode" : "Add note"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleAiSuggest, disabled: aiSuggestLoading, className: "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-purple-600 transition hover:bg-purple-50 disabled:opacity-60 dark:text-purple-300 dark:hover:bg-purple-500/10", children: [
              aiSuggestLoading ? /* @__PURE__ */ jsx("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-purple-300 border-t-transparent" }) : /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
              aiSuggestLoading ? "Thinking" : "AI suggest"
            ] }),
            aiAgents.length > 0 && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setAiAgentMenuOpen((open) => !open),
                  className: "flex h-6 max-w-[180px] items-center gap-1.5 rounded-md border border-purple-100 bg-purple-50 px-2 text-[11px] font-medium text-purple-700 transition hover:border-purple-200 hover:bg-purple-100 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200 dark:hover:bg-purple-500/15",
                  "aria-haspopup": "listbox",
                  "aria-expanded": aiAgentMenuOpen,
                  children: [
                    /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 flex-shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate", children: selectedAiAgentLabel }),
                    /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3 flex-shrink-0" })
                  ]
                }
              ),
              aiAgentMenuOpen && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 z-50 mb-2 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-purple-100 bg-white shadow-pop dark:border-purple-500/20 dark:bg-slate-900", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "AI agent" }),
                /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto p-1", children: [
                  { id: "default", name: "Default assistant", role: "Platform AI", tone: "fallback", avatar: null },
                  ...aiAgents
                ].map((agent) => {
                  const isSelected = selectedAiAgentId === agent.id;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setSelectedAiAgentId(agent.id);
                        setAiAgentMenuOpen(false);
                      },
                      className: `flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition ${isSelected ? "bg-purple-50 text-purple-800 dark:bg-purple-500/10 dark:text-purple-200" : "text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800"}`,
                      role: "option",
                      "aria-selected": isSelected,
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700 dark:bg-purple-500/15 dark:text-purple-200", children: agent.avatar || (agent.name || "AI").charAt(0).toUpperCase() }),
                        /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ jsx("span", { className: "block truncate text-xs font-semibold", children: agent.name }),
                          /* @__PURE__ */ jsx("span", { className: "mt-0.5 block truncate text-[10px] capitalize text-waify-text-muted dark:text-waify-dark-text-muted", children: [agent.role, agent.tone].filter(Boolean).join(" · ") || "Assistant" })
                        ] }),
                        isSelected && /* @__PURE__ */ jsx(Check, { className: "mt-1 h-3.5 w-3.5 flex-shrink-0" })
                      ]
                    },
                    agent.id
                  );
                }) })
              ] })
            ] })
          ] }),
          attachments.length > 0 && /* @__PURE__ */ jsxs("div", { ref: attachmentPreviewRef, className: "mb-2 rounded-card border border-waify-green/30 bg-waify-green-soft/70 p-2 shadow-sm dark:border-waify-green/30 dark:bg-waify-green/10", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-xs font-semibold text-waify-green-dark dark:text-waify-green", children: [
                attachments.length,
                " file",
                attachments.length === 1 ? "" : "s",
                " ready to send"
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setAttachments([]), className: "text-[11px] font-medium text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text", children: "Clear" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: attachments.map((file, index) => /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2 rounded-btn bg-white px-2.5 py-2 text-xs shadow-sm ring-1 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700", children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-900 dark:text-waify-dark-text-muted", children: file.type.startsWith("image/") ? /* @__PURE__ */ jsx(Image, { className: "h-4 w-4" }) : file.type.startsWith("audio/") ? /* @__PURE__ */ jsx(Mic, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(File$1, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("span", { className: "block truncate font-medium text-waify-text dark:text-waify-dark-text", children: file.name }),
                /* @__PURE__ */ jsxs("span", { className: "block text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  file.type || "file",
                  " · ",
                  formatFileSize(file.size)
                ] })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => removeAttachment(index), className: "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-gray-200", "aria-label": `Remove ${file.name}`, children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
            ] }, `${file.name}-${index}`)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `flex items-end gap-1.5 rounded-btn px-2.5 py-1.5 ${noteMode ? "bg-white ring-1 ring-waify-border dark:bg-slate-800 dark:ring-waify-dark-border" : "bg-gray-50 dark:bg-slate-800"}`, children: [
            !noteMode && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
              setShowEmoji(!showEmoji);
              setShowAttachments(false);
              setShowLocationPicker(false);
              setShowTemplates(false);
              setShowQuickReplies(false);
            }, className: "flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-700", children: /* @__PURE__ */ jsx(Smile, { className: "h-4 w-4" }) }),
            !noteMode && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setShowAttachments(!showAttachments);
                  setShowLocationPicker(false);
                  setShowEmoji(false);
                  setShowTemplates(false);
                  setShowQuickReplies(false);
                },
                className: `relative flex h-8 w-8 items-center justify-center rounded-md transition ${attachments.length > 0 ? "bg-waify-green text-white" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-700"}`,
                title: attachments.length > 0 ? `${attachments.length} file${attachments.length === 1 ? "" : "s"} attached` : "Attach file",
                children: [
                  /* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4" }),
                  attachments.length > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-waify-green-dark shadow-sm ring-1 ring-waify-green/20", children: attachments.length })
                ]
              }
            ),
            attachmentSummary && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => attachmentPreviewRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
                className: "hidden min-w-0 max-w-[180px] items-center gap-1 rounded-md bg-waify-green-soft px-2 py-1 text-[11px] font-medium text-waify-green-dark ring-1 ring-waify-green/20 dark:bg-waify-green/10 dark:text-waify-green sm:flex",
                title: attachmentSummary,
                children: [
                  /* @__PURE__ */ jsx(File$1, { className: "h-3 w-3 flex-shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: attachmentSummary })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                rows: 1,
                value: messageDraft,
                onChange: (event) => setMessageDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendInlineMessage();
                  }
                },
                placeholder: noteMode ? "Write an internal note..." : activeBotIsReplying ? "Bot is replying - take over to send manually" : !activeReplyWindow.isOpen ? "24h window closed - use an approved template" : "Type a message...",
                disabled: !noteMode && (activeBotIsReplying || !activeReplyWindow.isOpen),
                className: "max-h-24 flex-1 resize-none border-0 bg-transparent py-1 text-sm text-waify-text outline-none ring-0 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-waify-dark-text"
              }
            ),
            !noteMode && /* @__PURE__ */ jsx("button", { type: "button", onClick: toggleVoiceRecording, className: `flex h-8 w-8 items-center justify-center rounded-md transition ${recordingVoice ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-700"}`, title: recordingVoice ? "Stop recording" : "Record voice message", children: /* @__PURE__ */ jsx(Mic, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", onClick: sendInlineMessage, disabled: sendingMessage || !noteMode && activeBotIsReplying || !messageDraft.trim() && attachments.length === 0 && !freeFormReplyBlocked, children: [
              noteMode ? /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
              sendingMessage ? "Sending" : activeBotIsReplying && !noteMode ? "Bot replying" : freeFormReplyBlocked ? "Template" : noteMode ? "Save" : "Send"
            ] })
          ] }),
          !noteMode && /* @__PURE__ */ jsx("div", { className: "mt-1 flex items-center gap-1 overflow-x-auto px-1 pb-0.5 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted waify-scrollbar", children: [
            { label: "Template", icon: FileText, active: showTemplates, onClick: () => {
              setShowTemplates(!showTemplates);
              setShowQuickReplies(false);
              setShowInteractiveComposer(false);
              setShowEmoji(false);
              setShowAttachments(false);
              setShowLocationPicker(false);
            } },
            { label: "Quick replies", icon: Zap, active: showQuickReplies, onClick: () => {
              setShowQuickReplies(!showQuickReplies);
              setShowTemplates(false);
              setShowInteractiveComposer(false);
              setShowEmoji(false);
              setShowAttachments(false);
              setShowLocationPicker(false);
            } },
            { label: "Interactive", icon: ClipboardList, active: showInteractiveComposer && !["payment", "product"].includes(interactiveMode), onClick: () => {
              setInteractiveMode(interactiveMode === "payment" || interactiveMode === "product" ? "buttons" : interactiveMode);
              setShowInteractiveComposer(!showInteractiveComposer || ["payment", "product"].includes(interactiveMode));
              setShowTemplates(false);
              setShowQuickReplies(false);
              setShowEmoji(false);
              setShowAttachments(false);
              setShowLocationPicker(false);
            } }
          ].map((item) => {
            const Icon = item.icon;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: item.onClick,
                className: `inline-flex h-6 flex-shrink-0 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium transition ${item.active ? "bg-waify-green-soft text-waify-green-dark ring-1 ring-waify-green/15 dark:bg-waify-green/10 dark:text-waify-green" : "hover:bg-gray-100 hover:text-waify-text dark:hover:bg-slate-800 dark:hover:text-waify-dark-text"}`,
                children: [
                  /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
                  item.label
                ]
              },
              item.label
            );
          }) })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsx(EmptyState, { icon: MessageSquare, title: "Select a conversation", description: "Choose a chat from the list or start a new one." }) }) }),
      showContactPanel && activeConversation && /* @__PURE__ */ jsxs("aside", { className: "hidden min-h-0 flex-col border-l border-gray-100 bg-white dark:border-waify-dark-border dark:bg-slate-900 xl:flex", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex h-10 flex-shrink-0 items-center justify-between border-b border-gray-100 px-3 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Contact details" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowContactPanel(false), className: "flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 p-4 text-center dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-waify-green text-2xl font-semibold text-white", children: activeConversation.contact.name?.charAt(0).toUpperCase() || "C" }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 font-semibold text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.name || "Unknown contact" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: contactDisplayPhone(activeConversation) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setContactTab("calls"), className: `flex h-8 w-8 items-center justify-center rounded-md transition ${callingReady ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-gray-50 text-waify-text-muted hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`, title: "WhatsApp calls", children: /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
              setContactTab("notes");
              setNoteMode(true);
            }, className: "flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text", children: /* @__PURE__ */ jsx(StickyNote, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: openContactEditor, className: "flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text", title: "Edit contact", children: /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }) }),
            contactHref ? /* @__PURE__ */ jsx(Link, { href: contactHref, className: "flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-2 pt-2 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-6 gap-1", children: [
          ["profile", User, "Profile"],
          ["media", Paperclip, "Media"],
          ["calls", Phone, "Calls"],
          ["notes", StickyNote, "Notes"],
          ["activity", RotateCcw, "Activity"],
          ["orders", ShoppingBag, "Orders"]
        ].map(([id, Icon, label]) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setContactTab(id),
            className: `flex flex-col items-center gap-1 rounded-md px-1.5 py-2 text-[10px] font-medium transition ${contactTab === id ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
              label
            ]
          },
          id
        )) }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto p-4", children: [
          contactTab === "profile" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "mb-1.5 text-[10px] font-medium uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Tags" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: activeLabels.length > 0 ? activeLabels.map((labelId) => {
                const label = INBOX_LABELS.find((item) => item.id === labelId);
                return label ? /* @__PURE__ */ jsx("span", { className: `rounded-md px-2 py-0.5 text-[11px] font-medium ${labelClasses(label.color)}`, children: label.label }, label.id) : null;
              }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "No labels" }) })
            ] }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Phone" }),
                /* @__PURE__ */ jsx("dd", { className: "max-w-[160px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text", children: contactDisplayPhone(activeConversation) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Email" }),
                /* @__PURE__ */ jsx("dd", { className: "max-w-[160px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.email || "-" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Company" }),
                /* @__PURE__ */ jsx("dd", { className: "max-w-[160px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.company || "-" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Source" }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium capitalize text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.ctwa ? "Click-to-WhatsApp ad" : (activeConversation.contact.source || "WhatsApp").replaceAll("_", " ") })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Contact status" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium capitalize text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.status || "active" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Status" }),
                /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx(Badge, { variant: activeConversation.status === "open" ? "success" : "default", children: activeConversation.status }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Assigned" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: activeAgentName })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Channel" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: activeConversation.connection.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Messages" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: activeTimelineMessages.length })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Media" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: activeMediaCount })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Last activity" }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: activeConversation.last_message_at ? new Date(activeConversation.last_message_at).toLocaleString() : "-" })
              ] })
            ] }),
            activeConversation.contact.ctwa && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Click-to-WhatsApp Ad" }),
                activeConversation.contact.ctwa.source_url && /* @__PURE__ */ jsxs("a", { href: activeConversation.contact.ctwa.source_url, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-emerald-700 hover:underline dark:text-emerald-300", children: [
                  "Open ",
                  /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
                ] })
              ] }),
              activeConversation.contact.ctwa.headline && /* @__PURE__ */ jsx("p", { className: "font-medium", children: activeConversation.contact.ctwa.headline }),
              activeConversation.contact.ctwa.body && /* @__PURE__ */ jsx("p", { className: "mt-1 leading-relaxed text-emerald-800 dark:text-emerald-200", children: activeConversation.contact.ctwa.body }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-1 text-[11px] text-emerald-700 dark:text-emerald-300", children: [
                activeConversation.contact.ctwa.source_id && /* @__PURE__ */ jsxs("div", { children: [
                  "Ad/Post ID: ",
                  activeConversation.contact.ctwa.source_id
                ] }),
                activeConversation.contact.ctwa.ctwa_clid && /* @__PURE__ */ jsxs("div", { className: "truncate", children: [
                  "Click ID: ",
                  activeConversation.contact.ctwa.ctwa_clid
                ] }),
                activeConversation.contact.ctwa.captured_at && /* @__PURE__ */ jsxs("div", { children: [
                  "Captured: ",
                  new Date(activeConversation.contact.ctwa.captured_at).toLocaleString()
                ] })
              ] })
            ] }),
            activeConversation.contact.notes && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-waify-text dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-1 text-[10px] font-medium uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Contact notes" }),
              /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap break-words", children: activeConversation.contact.notes })
            ] })
          ] }),
          contactTab === "notes" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("textarea", { value: noteMode ? messageDraft : "", onChange: (event) => {
              setNoteMode(true);
              setMessageDraft(event.target.value);
            }, rows: 3, placeholder: "Add internal note...", className: "w-full resize-none rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-slate-800" }),
            /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => {
              setNoteMode(true);
              sendInlineMessage();
            }, disabled: !noteMode || !messageDraft.trim(), children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              " Add note"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200", children: "Internal notes are saved to this conversation and visible to your team only." }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: activeNotes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "No saved notes yet." }) : [...activeNotes].reverse().map((note) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-100 bg-white p-3 text-xs shadow-sm dark:border-waify-dark-border dark:bg-slate-800", children: [
              /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap break-words text-waify-text dark:text-waify-dark-text", children: note.text_body }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between gap-2 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx("span", { className: "truncate", children: note.payload?.created_by?.name ?? "Team note" }),
                /* @__PURE__ */ jsx("span", { children: new Date(note.created_at).toLocaleString() })
              ] })
            ] }, note.id)) })
          ] }),
          contactTab === "media" && /* @__PURE__ */ jsx(
            ContactGalleryPanel,
            {
              gallery: activeGallery,
              loading: galleryLoadingId === activeConversation.id,
              onPreview: (item) => {
                if (!item.url) return;
                setMediaPreview({
                  type: item.type,
                  url: item.url,
                  title: item.filename || item.title || `${item.type} message`,
                  filename: item.filename || item.title || void 0
                });
              }
            }
          ),
          contactTab === "calls" && /* @__PURE__ */ jsx(
            InboxCallingPanel,
            {
              conversation: activeConversation,
              calling: whatsappCalling,
              calls: activeCalls,
              callingReady
            }
          ),
          contactTab === "activity" && /* @__PURE__ */ jsx("div", { className: "space-y-4 text-xs", children: [
            ["Conversation opened", activeConversation.last_message_at],
            [`${activeInboundCount} inbound messages`, lastInboundAt],
            [`${activeOutboundCount} outbound messages`, lastOutboundAt],
            [`Assigned to ${activeAgentName}`, activeConversation.last_message_at]
          ].map(([item, time]) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300", children: /* @__PURE__ */ jsx(RotateCcw, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: item }),
              /* @__PURE__ */ jsx("div", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: time ? new Date(String(time)).toLocaleString() : "-" })
            ] })
          ] }, item)) }),
          contactTab === "orders" && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsx(EmptyState, { icon: ShoppingBag, title: "No linked orders", description: "Orders will appear here when ecommerce integrations attach order metadata to this contact." }) })
        ] })
      ] }),
      mobileContactPanelOpen && activeConversation && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[250] flex justify-end xl:hidden", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": "Close contact details",
            className: "absolute inset-0 bg-black/40",
            onClick: () => setMobileContactPanelOpen(false)
          }
        ),
        /* @__PURE__ */ jsxs("aside", { className: "relative flex h-full w-full max-w-sm flex-col bg-white shadow-pop dark:bg-slate-900", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-100 px-4 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Contact details" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMobileContactPanelOpen(false), className: "flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 p-4 text-center dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-waify-green text-2xl font-semibold text-white", children: activeConversation.contact.name?.charAt(0).toUpperCase() || "C" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 font-semibold text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.name || "Unknown contact" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: contactDisplayPhone(activeConversation) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-center gap-1", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setContactTab("calls"), className: `flex h-8 w-8 items-center justify-center rounded-md transition ${callingReady ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-gray-50 text-waify-text-muted hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`, title: "WhatsApp calls", children: /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                setContactTab("notes");
                setNoteMode(true);
              }, className: "flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text", children: /* @__PURE__ */ jsx(StickyNote, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: openContactEditor, className: "flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text", title: "Edit contact", children: /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }) }),
              contactHref ? /* @__PURE__ */ jsx(Link, { href: contactHref, className: "flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-2 pt-2 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-6 gap-1", children: [
            ["profile", User, "Profile"],
            ["media", Paperclip, "Media"],
            ["calls", Phone, "Calls"],
            ["notes", StickyNote, "Notes"],
            ["activity", RotateCcw, "Activity"],
            ["orders", ShoppingBag, "Orders"]
          ].map(([id, Icon, label]) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setContactTab(id),
              className: `flex flex-col items-center gap-1 rounded-md px-1.5 py-2 text-[10px] font-medium transition ${contactTab === id ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green" : "text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800"}`,
              children: [
                /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
                label
              ]
            },
            id
          )) }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto p-4", children: [
            contactTab === "profile" && /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Phone" }),
                /* @__PURE__ */ jsx("dd", { className: "max-w-[180px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text", children: contactDisplayPhone(activeConversation) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Email" }),
                /* @__PURE__ */ jsx("dd", { className: "max-w-[180px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.email || "-" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Company" }),
                /* @__PURE__ */ jsx("dd", { className: "max-w-[180px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.company || "-" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Contact status" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium capitalize text-waify-text dark:text-waify-dark-text", children: activeConversation.contact.status || "active" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Status" }),
                /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx(Badge, { variant: activeConversation.status === "open" ? "success" : "default", children: activeConversation.status }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Assigned" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: activeAgentName })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Channel" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: activeConversation.connection.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Messages" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: activeTimelineMessages.length })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Media" }),
                /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: activeMediaCount })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Last activity" }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: activeConversation.last_message_at ? new Date(activeConversation.last_message_at).toLocaleString() : "-" })
              ] })
            ] }),
            contactTab === "notes" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("textarea", { value: noteMode ? messageDraft : "", onChange: (event) => {
                setNoteMode(true);
                setMessageDraft(event.target.value);
              }, rows: 3, placeholder: "Add internal note...", className: "w-full resize-none rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-slate-800" }),
              /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => {
                setNoteMode(true);
                sendInlineMessage();
              }, disabled: !noteMode || !messageDraft.trim(), children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                " Add note"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: activeNotes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "No saved notes yet." }) : [...activeNotes].reverse().map((note) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-100 bg-white p-3 text-xs shadow-sm dark:border-waify-dark-border dark:bg-slate-800", children: [
                /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap break-words text-waify-text dark:text-waify-dark-text", children: note.text_body }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between gap-2 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: note.payload?.created_by?.name ?? "Team note" }),
                  /* @__PURE__ */ jsx("span", { children: new Date(note.created_at).toLocaleString() })
                ] })
              ] }, note.id)) })
            ] }),
            contactTab === "media" && /* @__PURE__ */ jsx(
              ContactGalleryPanel,
              {
                gallery: activeGallery,
                loading: galleryLoadingId === activeConversation.id,
                onPreview: (item) => {
                  if (!item.url) return;
                  setMediaPreview({
                    type: item.type,
                    url: item.url,
                    title: item.filename || item.title || `${item.type} message`,
                    filename: item.filename || item.title || void 0
                  });
                }
              }
            ),
            contactTab === "calls" && /* @__PURE__ */ jsx(
              InboxCallingPanel,
              {
                conversation: activeConversation,
                calling: whatsappCalling,
                calls: activeCalls,
                callingReady
              }
            ),
            contactTab === "activity" && /* @__PURE__ */ jsx("div", { className: "space-y-4 text-xs", children: [
              ["Conversation opened", activeConversation.last_message_at],
              [`${activeInboundCount} inbound messages`, lastInboundAt],
              [`${activeOutboundCount} outbound messages`, lastOutboundAt],
              [`Assigned to ${activeAgentName}`, activeConversation.last_message_at]
            ].map(([item, time]) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300", children: /* @__PURE__ */ jsx(RotateCcw, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: item }),
                /* @__PURE__ */ jsx("div", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: time ? new Date(String(time)).toLocaleString() : "-" })
              ] })
            ] }, item)) }),
            contactTab === "orders" && /* @__PURE__ */ jsx(EmptyState, { icon: ShoppingBag, title: "No linked orders", description: "Orders will appear here when ecommerce integrations attach order metadata to this contact." })
          ] })
        ] })
      ] })
    ] }) }),
    incomingCall && /* @__PURE__ */ jsx(
      IncomingCallScreen,
      {
        call: incomingCall,
        conversation: incomingCallConversation,
        callingReady: incomingCallingReady,
        onCallUpdated: (call) => setRecentCallsState((prev) => mergeCallRecords(prev, [call])),
        onClose: () => setDismissedCallIds((prev) => /* @__PURE__ */ new Set([...prev, Number(incomingCall.id)]))
      }
    ),
    editingContact && activeConversation && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-lg overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-waify-dark-border dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Edit contact" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: contactDisplayPhone(activeConversation) })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEditingContact(false), className: "flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800", "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 px-5 py-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: contactForm.name,
              onChange: (event) => setContactForm((current) => ({ ...current, name: event.target.value })),
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Phone" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: contactForm.phone,
              onChange: (event) => setContactForm((current) => ({ ...current, phone: event.target.value })),
              inputMode: "tel",
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: contactForm.email,
              onChange: (event) => setContactForm((current) => ({ ...current, email: event.target.value })),
              type: "email",
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Company" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: contactForm.company,
              onChange: (event) => setContactForm((current) => ({ ...current, company: event.target.value })),
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Status" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: contactForm.status,
              onChange: (event) => setContactForm((current) => ({ ...current, status: event.target.value })),
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800",
              children: [
                /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                /* @__PURE__ */ jsx("option", { value: "inactive", children: "Inactive" }),
                /* @__PURE__ */ jsx("option", { value: "blocked", children: "Blocked" }),
                /* @__PURE__ */ jsx("option", { value: "opt_out", children: "Opted out" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Notes" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: contactForm.notes,
              onChange: (event) => setContactForm((current) => ({ ...current, notes: event.target.value })),
              rows: 4,
              className: "w-full resize-none rounded-btn border border-waify-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-waify-dark-border dark:bg-slate-800/60", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setEditingContact(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { type: "button", onClick: saveContactDetails, disabled: savingContact || !contactForm.name.trim(), children: [
          /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
          savingContact ? "Saving" : "Save contact"
        ] })
      ] })
    ] }) }),
    showNewChat && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[240] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-waify-dark-border dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "New chat" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "The contact is saved automatically." })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowNewChat(false), className: "flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800", "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 px-5 py-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Contact name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: newChatForm.name,
              onChange: (event) => setNewChatForm((current) => ({ ...current, name: event.target.value })),
              placeholder: "Customer name",
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "WhatsApp number" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: newChatForm.wa_id,
              onChange: (event) => setNewChatForm((current) => ({ ...current, wa_id: event.target.value })),
              placeholder: "919999999999",
              inputMode: "tel",
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "WhatsApp connection" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: newChatForm.connection_id,
              onChange: (event) => setNewChatForm((current) => ({ ...current, connection_id: event.target.value })),
              className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select connection" }),
                (connections || []).map((connection) => /* @__PURE__ */ jsx("option", { value: connection.id, children: connection.name }, connection.id))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-waify-dark-border dark:bg-slate-800/60", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowNewChat(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { type: "button", onClick: createNewChat, disabled: creatingChat || !newChatForm.wa_id.trim() || !newChatForm.connection_id, children: [
          /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
          creatingChat ? "Creating" : "Create chat"
        ] })
      ] })
    ] }) }),
    mediaPreview && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl dark:border-waify-dark-border dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: mediaPreview.title }),
          /* @__PURE__ */ jsx("div", { className: "text-xs capitalize text-waify-text-muted dark:text-waify-dark-text-muted", children: mediaPreview.type })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("a", { href: mediaPreview.url, target: "_blank", rel: "noreferrer", className: "flex h-9 w-9 items-center justify-center rounded-md text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text", "aria-label": "Open media in new tab", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMediaPreview(null), className: "flex h-9 w-9 items-center justify-center rounded-md text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text", "aria-label": "Close media preview", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 overflow-auto bg-gray-50 p-4 dark:bg-slate-950", children: [
        ["image", "sticker"].includes(mediaPreview.type) && /* @__PURE__ */ jsx("img", { src: mediaPreview.url, alt: mediaPreview.filename || mediaPreview.title, className: "mx-auto max-h-[72vh] max-w-full rounded-lg object-contain" }),
        mediaPreview.type === "video" && /* @__PURE__ */ jsx("video", { controls: true, autoPlay: true, className: "mx-auto max-h-[72vh] max-w-full rounded-lg", children: /* @__PURE__ */ jsx("source", { src: mediaPreview.url }) }),
        mediaPreview.type === "audio" && /* @__PURE__ */ jsx("div", { className: "mx-auto flex min-h-48 max-w-xl items-center justify-center rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900", children: /* @__PURE__ */ jsx("audio", { controls: true, autoPlay: true, className: "w-full", children: /* @__PURE__ */ jsx("source", { src: mediaPreview.url }) }) }),
        mediaPreview.type === "document" && /* @__PURE__ */ jsx("iframe", { src: mediaPreview.url, title: mediaPreview.title, className: "h-[72vh] w-full rounded-lg border border-gray-200 bg-white dark:border-waify-dark-border" })
      ] })
    ] }) })
  ] });
}
export {
  ConversationsIndex as default
};
