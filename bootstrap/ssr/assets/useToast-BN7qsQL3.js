import { useState, useCallback, useEffect } from "react";
let toastIdCounter = 0;
const toastListeners = /* @__PURE__ */ new Set();
let toasts = [];
const recentToastSignatures = /* @__PURE__ */ new Map();
const TOAST_DEDUPE_WINDOW_MS = 6e3;
const TOAST_EVENT_DEDUPE_WINDOW_MS = 1e4;
const FLASH_AFTER_LOCAL_SUPPRESS_MS = 3500;
const GENERIC_TITLES = /* @__PURE__ */ new Set(["success", "error", "warning", "info", "status"]);
const recentEventSignatures = /* @__PURE__ */ new Map();
const recentLocalVariantAt = /* @__PURE__ */ new Map();
function normalizeToastMessage(toast) {
  const normalize = (value) => value.trim().toLowerCase().replace(/\b(successfully|successful|success)\b/g, "").replace(/\bfailed to\b/g, "").replace(/\bunable to\b/g, "").replace(/[.!?]+$/g, "").replace(/\s+/g, " ").trim();
  const title = normalize(toast.title || "");
  const description = normalize(toast.description || "");
  if (!title && !description) {
    return "";
  }
  if (description && GENERIC_TITLES.has(title.toLowerCase())) {
    return description.toLowerCase();
  }
  if (title && description) {
    return `${title} | ${description}`.toLowerCase();
  }
  return description || title;
}
function useToast() {
  const [localToasts, setLocalToasts] = useState(toasts);
  const addToast = useCallback((toast2) => {
    const now = Date.now();
    const variant = toast2.variant || "info";
    if (toast2.source === "flash") {
      const recentLocalAt = recentLocalVariantAt.get(variant);
      if (recentLocalAt && now - recentLocalAt < FLASH_AFTER_LOCAL_SUPPRESS_MS) {
        return `guarded-flash-${variant}`;
      }
    } else {
      recentLocalVariantAt.set(variant, now);
      if (recentLocalVariantAt.size > 20) {
        for (const [key, at] of recentLocalVariantAt.entries()) {
          if (now - at > FLASH_AFTER_LOCAL_SUPPRESS_MS * 2) {
            recentLocalVariantAt.delete(key);
          }
        }
      }
    }
    const canonicalMessage = normalizeToastMessage(toast2);
    const signature = canonicalMessage || `${variant}|${toast2.title || ""}|${toast2.description || ""}`;
    const eventSignature = `${variant}|${signature}`;
    const eventSeenAt = recentEventSignatures.get(eventSignature);
    if (eventSeenAt && now - eventSeenAt < TOAST_EVENT_DEDUPE_WINDOW_MS) {
      return `guarded-${eventSignature}`;
    }
    recentEventSignatures.set(eventSignature, now);
    if (recentEventSignatures.size > 400) {
      for (const [key, at] of recentEventSignatures.entries()) {
        if (now - at > TOAST_EVENT_DEDUPE_WINDOW_MS * 2) {
          recentEventSignatures.delete(key);
        }
      }
    }
    const recent = recentToastSignatures.get(signature);
    if (recent && now - recent.at < TOAST_DEDUPE_WINDOW_MS) {
      return recent.id;
    }
    if (recentToastSignatures.size > 200) {
      for (const [key, value] of recentToastSignatures.entries()) {
        if (now - value.at > TOAST_DEDUPE_WINDOW_MS * 2) {
          recentToastSignatures.delete(key);
        }
      }
    }
    const id = `toast-${++toastIdCounter}`;
    const newToast = {
      id,
      duration: 5e3,
      ...toast2
    };
    toasts = [...toasts, newToast];
    recentToastSignatures.set(signature, { id, at: now });
    toastListeners.forEach((listener) => listener(toasts));
    setLocalToasts(toasts);
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    return id;
  }, []);
  const removeToast = useCallback((id) => {
    toasts = toasts.filter((t) => t.id !== id);
    toastListeners.forEach((listener) => listener(toasts));
    setLocalToasts(toasts);
  }, []);
  const toast = {
    success: (message, description) => {
      addToast({ title: message, description, variant: "success" });
    },
    error: (message, description) => {
      addToast({ title: message, description, variant: "error" });
    },
    warning: (message, description) => {
      addToast({ title: message, description, variant: "warning" });
    },
    info: (message, description) => {
      addToast({ title: message, description, variant: "info" });
    }
  };
  useEffect(() => {
    const listener = (newToasts) => {
      setLocalToasts(newToasts);
    };
    toastListeners.add(listener);
    setLocalToasts(toasts);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);
  return {
    toasts: localToasts,
    addToast,
    removeToast,
    toast
  };
}
export {
  useToast as u
};
