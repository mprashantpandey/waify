import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { usePage, router, Link } from "@inertiajs/react";
import { Menu, Sun, Moon, Shield, LifeBuoy, User, LogOut } from "lucide-react";
import { useState, useEffect, useContext, createContext } from "react";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
function Topbar({ user, onMenuClick }) {
  const { impersonation, accounts, account } = usePage().props;
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true" || !localStorage.getItem("darkMode") && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16 px-4 lg:pl-80", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
      onMenuClick && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onMenuClick,
          className: "lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors",
          "aria-label": "Open menu",
          children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5", "aria-hidden": true })
        }
      ),
      account && accounts?.length > 1 && /* @__PURE__ */ jsxs("div", { className: "relative hidden sm:block", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowAccountMenu(!showAccountMenu),
            className: "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
            children: [
              /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
              /* @__PURE__ */ jsx("span", { className: "max-w-[160px] truncate", children: "Switch Account" })
            ]
          }
        ),
        showAccountMenu && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "fixed inset-0 z-10",
              onClick: () => setShowAccountMenu(false)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20", children: [
            /* @__PURE__ */ jsx("div", { className: "px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400", children: "Switch Account" }),
            accounts.map((acct) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setShowAccountMenu(false);
                  router.post(route("app.accounts.switch", { account: acct.id }));
                },
                className: "w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-emerald-500" }),
                  /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: acct.name }),
                  account?.id === acct.id && /* @__PURE__ */ jsx(Badge, { variant: "success", className: "text-xs px-2 py-0.5", children: "Current" })
                ]
              },
              acct.id
            ))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggleDarkMode,
          className: "p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-110",
          children: darkMode ? /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" })
        }
      ),
      user && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowUserMenu(!showUserMenu),
            className: "flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
            children: /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg", children: user.name.charAt(0).toUpperCase() })
          }
        ),
        showUserMenu && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "fixed inset-0 z-10",
              onClick: () => setShowUserMenu(false)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 backdrop-blur-lg", children: [
            /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg", children: user.name.charAt(0).toUpperCase() }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 truncate", children: user.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: user.email })
              ] }),
              user.is_super_admin && /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "flex items-center gap-1 text-xs px-2 py-0.5", children: [
                /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
                "Admin"
              ] })
            ] }) }),
            user.is_super_admin && /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("platform.dashboard"),
                className: "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
                  "Platform Panel"
                ]
              }
            ),
            user.is_super_admin && /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("platform.support.hub"),
                className: "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(LifeBuoy, { className: "h-4 w-4" }),
                  "Support Inbox"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("app.support.hub", {}),
                className: "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(LifeBuoy, { className: "h-4 w-4" }),
                  "Support"
                ]
              }
            ),
            impersonation?.active && /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("impersonate.leave"),
                method: "post",
                className: "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
                  "Stop Impersonation"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("profile.edit"),
                className: "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
                  "Profile"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("logout"),
                method: "post",
                className: "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                  "Logout"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
const RealtimeContext = createContext(null);
function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
}
export {
  Topbar as T,
  useRealtime as u
};
