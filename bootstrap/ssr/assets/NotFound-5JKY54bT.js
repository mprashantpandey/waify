import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { Inbox, Users, ArrowLeft, Home } from "lucide-react";
import { B as Button } from "./Button-ymbdH_NY.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function NotFound() {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isConversationNotFound = path.startsWith("/app/conversations/") && path !== "/app/conversations";
  const isContactNotFound = path.startsWith("/app/contacts/") && path !== "/app/contacts";
  const title = isConversationNotFound ? "Conversation not found" : isContactNotFound ? "Contact not found" : "Page not found";
  const message = isConversationNotFound ? "This conversation may have been deleted or you may not have access. Try opening the inbox again." : isContactNotFound ? "This contact may have been deleted or you may not have access. Try opening contacts again." : "The page you requested could not be found.";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4", children: [
    /* @__PURE__ */ jsx(Head, { title: "Page not found" }),
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-6xl font-bold text-gray-200 dark:text-gray-700", children: "404" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: message }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex justify-center gap-4 flex-wrap", children: [
        isConversationNotFound && typeof route !== "undefined" && /* @__PURE__ */ jsx(Link, { href: route("app.whatsapp.conversations.index"), children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Inbox, { className: "h-4 w-4 mr-2" }),
          "Back to Inbox"
        ] }) }),
        isContactNotFound && typeof route !== "undefined" && /* @__PURE__ */ jsx(Link, { href: route("app.contacts.index"), children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 mr-2" }),
          "Back to Contacts"
        ] }) }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => window.history.back(), variant: "secondary", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
          "Go back"
        ] }),
        /* @__PURE__ */ jsx(Link, { href: typeof route !== "undefined" ? route("app.dashboard") : "/app/dashboard", children: /* @__PURE__ */ jsxs(Button, { variant: isConversationNotFound || isContactNotFound ? "secondary" : "primary", children: [
          /* @__PURE__ */ jsx(Home, { className: "h-4 w-4 mr-2" }),
          "Dashboard"
        ] }) })
      ] })
    ] })
  ] });
}
export {
  NotFound as default
};
