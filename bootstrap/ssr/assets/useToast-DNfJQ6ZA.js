import { useState, useCallback } from "react";
let toastIdCounter = 0;
const toastListeners = /* @__PURE__ */ new Set();
let toasts = [];
function useToast() {
  const [localToasts, setLocalToasts] = useState(toasts);
  const addToast = useCallback((toast2) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast = {
      id,
      duration: 5e3,
      ...toast2
    };
    toasts = [...toasts, newToast];
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
  useState(() => {
    const listener = (newToasts) => {
      setLocalToasts(newToasts);
    };
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  });
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
