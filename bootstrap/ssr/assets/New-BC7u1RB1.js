import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { ArrowLeft, Search, Loader2, MessageSquare } from "lucide-react";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "./Badge-CHx1ViYT.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function NewConversation({
  account,
  contacts,
  connections
}) {
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(connections.length === 1 ? connections[0].id : "");
  const [navigating, setNavigating] = useState(false);
  const filtered = contacts.filter(
    (c) => !search.trim() || (c.name || "").toLowerCase().includes(search.toLowerCase()) || (c.wa_id || "").includes(search)
  );
  const openChat = () => {
    if (!selectedContact) return;
    setNavigating(true);
    const url = connections.length > 1 && selectedConnectionId ? route("app.whatsapp.conversations.by-contact", {
      contact: selectedContact.slug || selectedContact.id
    }) + `?connection_id=${selectedConnectionId}` : route("app.whatsapp.conversations.by-contact", {
      contact: selectedContact.slug || selectedContact.id
    });
    router.visit(url, { onFinish: () => setNavigating(false) });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "New conversation" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("app.whatsapp.conversations.index"),
          className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Back to Inbox"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "New conversation" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Choose a contact to open or start a chat" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Select contact" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Search and pick a contact to open the conversation in Inbox" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400", "aria-hidden": true }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "search",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                placeholder: "Search contacts by name or number...",
                className: "pl-9",
                "aria-label": "Search contacts"
              }
            )
          ] }),
          connections.length > 1 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "connection", className: "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300", children: "WhatsApp number" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "connection",
                value: selectedConnectionId,
                onChange: (e) => setSelectedConnectionId(e.target.value === "" ? "" : Number(e.target.value)),
                className: "w-full rounded-md border-gray-300 shadow-sm focus:border-[#25D366] focus:ring-[#25D366] dark:bg-gray-800 dark:border-gray-700",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Select a number" }),
                  connections.map((conn) => /* @__PURE__ */ jsx("option", { value: conn.id, children: conn.name }, conn.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700", children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-sm text-gray-500 dark:text-gray-400", children: contacts.length === 0 ? "No contacts yet. Add contacts from the Contacts section." : "No contacts match your search." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: filtered.map((contact) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setSelectedContact(contact),
              className: `flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selectedContact?.id === contact.id ? "bg-[#25D366]/10 text-[#25D366] dark:bg-[#25D366]/20" : ""}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: contact.name || contact.wa_id }),
                contact.wa_id && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: contact.wa_id })
              ]
            }
          ) }, contact.id)) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: openChat,
                disabled: !selectedContact || navigating || connections.length > 1 && !selectedConnectionId,
                className: "bg-[#25D366] hover:bg-[#1DAA57] text-white",
                "aria-label": "Open chat",
                children: [
                  navigating ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 mr-2", "aria-hidden": true }),
                  "Open chat"
                ]
              }
            ),
            selectedContact && /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
              "with ",
              selectedContact.name || selectedContact.wa_id
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  NewConversation as default
};
