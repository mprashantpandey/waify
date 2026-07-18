import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { Inbox, Users, Search } from "lucide-react";
import ErrorFrame, { defaultBackAction, defaultDashboardAction } from "./ErrorFrame-BFHludVa.js";
import "./BrandLogo-TeztHB0m.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./Button-BJftGNki.js";
function NotFound() {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isInboxPath = path.includes("/conversations");
  const isContactPath = path.includes("/contacts");
  const title = isInboxPath ? "Conversation not found" : isContactPath ? "Contact not found" : "Page not found";
  const description = isInboxPath ? "This conversation may have been deleted, moved to another workspace, or may not be available to your role." : isContactPath ? "This contact may have been deleted, moved to another workspace, or may not be available to your role." : "This page may have moved, been deleted, or may not be available for your workspace.";
  const actions = [defaultBackAction(), defaultDashboardAction()];
  if (isInboxPath && typeof route !== "undefined") {
    actions.push({ label: "Inbox", href: route("app.whatsapp.conversations.index"), icon: Inbox, primary: true });
  }
  if (isContactPath && typeof route !== "undefined") {
    actions.push({ label: "Contacts", href: route("app.contacts.index"), icon: Users, primary: true });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Page not found" }),
    /* @__PURE__ */ jsx(
      ErrorFrame,
      {
        code: "404",
        title,
        description,
        icon: Search,
        accent: "green",
        actions
      }
    )
  ] });
}
export {
  NotFound as default
};
