import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AddonPage, StatGrid, ServerListControls, EmptyPanel, MiniStatus } from "./Shared-BnBdIg9m.js";
import { a as Toolbar, T as ThemedIconTile, D as Drawer } from "./Elements-EbyZDnT_.js";
import { Target, UserCheck, BadgeIndianRupee, Facebook, Phone, MapPin, UserPlus, Trash2, Edit3, Settings2, RefreshCw } from "lucide-react";
import { I as Input } from "./Input-DGMAswN3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "./useToast-BN7qsQL3.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
function MetaLeads({ leads = [], filters = {}, pagination = null, metaIntegration = null }) {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const form = useForm({
    name: "",
    phone: "",
    email: "",
    city: "",
    stage: "new",
    platform: "Facebook",
    source_type: "meta_lead",
    form_name: "",
    ad_name: "",
    campaign_name: "",
    cost_per_lead: 0,
    score: 0,
    assignee_name: "",
    auto_tags: "",
    captured_at: ""
  });
  const filtered = useMemo(() => leads.filter((lead) => `${lead.name} ${lead.phone} ${lead.city}`.toLowerCase().includes(search.toLowerCase())), [leads, search]);
  const openEdit = (lead) => {
    setEditing(lead);
    form.setData({
      name: lead.name,
      phone: lead.phone || "",
      email: lead.email || "",
      city: lead.city === "Unknown" ? "" : lead.city,
      stage: lead.stage,
      platform: lead.platform,
      source_type: lead.sourceType || "meta_lead",
      form_name: lead.form,
      ad_name: lead.adName,
      campaign_name: lead.campaignName || "",
      cost_per_lead: lead.cpl,
      score: lead.score,
      assignee_name: lead.assignee === "Unassigned" ? "" : lead.assignee,
      auto_tags: (lead.autoTags || []).join(", "),
      captured_at: lead.time ? lead.time.slice(0, 16) : ""
    });
    setSelected(null);
    setFormOpen(true);
  };
  const save = () => {
    const payload = {
      ...form.data,
      auto_tags: String(form.data.auto_tags || "").split(",").map((tag) => tag.trim()).filter(Boolean)
    };
    const options = { preserveScroll: true, onSuccess: () => setFormOpen(false) };
    editing ? router.patch(route("app.meta-leads.update", editing.id), payload, options) : router.post(route("app.meta-leads.store"), payload, options);
  };
  const remove = async (lead) => {
    const confirmed = await confirm({
      title: "Delete lead",
      message: `Delete "${lead.name}" from Meta Leads?`,
      confirmText: "Delete lead",
      variant: "danger"
    });
    if (confirmed) router.delete(route("app.meta-leads.destroy", lead.id), { preserveScroll: true, onSuccess: () => setSelected(null) });
  };
  const convert = (lead) => {
    router.post(route("app.meta-leads.contact", lead.id), {}, { preserveScroll: true });
  };
  const syncMetaLeads = () => {
    router.post(route("app.integrations.sync", "meta-leads"), {}, { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Meta Leads" }),
    /* @__PURE__ */ jsxs(
      AddonPage,
      {
        title: "Meta Leads",
        description: "Leads are fetched from connected Meta Lead Ads forms through Facebook Login, sync, and provider webhooks.",
        actions: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.integrations.index"), children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
            /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4" }),
            "Meta setup"
          ] }) }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: syncMetaLeads, disabled: !metaIntegration?.connected, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            "Sync Meta leads"
          ] })
        ] }),
        children: [
          /* @__PURE__ */ jsx(Card, { className: "border-emerald-100 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: metaIntegration?.connected ? "Meta Lead Ads connected" : "Connect Meta Lead Ads" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: metaIntegration?.connected ? `${metaIntegration.pageName || "Facebook Page"}${metaIntegration.formName ? ` · ${metaIntegration.formName}` : ""}${metaIntegration.lastSyncAt ? ` · synced ${new Date(metaIntegration.lastSyncAt).toLocaleString()}` : ""}` : "Use Integrations > Meta Leads to connect Facebook, choose the Page/Form, enable auto-contact if needed, and run Sync now." }),
              metaIntegration?.lastError && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: metaIntegration.lastError })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 text-xs", children: [
              /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-white px-2.5 py-1 font-semibold text-waify-text-muted dark:bg-waify-dark-surface dark:text-waify-dark-text-muted", children: [
                metaIntegration?.forms?.length || 0,
                " forms cached"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full bg-white px-2.5 py-1 font-semibold text-waify-text-muted dark:bg-waify-dark-surface dark:text-waify-dark-text-muted", children: metaIntegration?.autoCreateContact ? "Auto-contact on" : "Auto-contact off" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(StatGrid, { stats: [
            { label: "Leads", value: leads.length, icon: Target, tone: "green" },
            { label: "Qualified", value: leads.filter((lead) => lead.stage === "qualified" || lead.stage === "won").length, icon: UserCheck, tone: "blue" },
            { label: "Avg CPL", value: `₹${Math.round((leads.reduce((sum, lead) => sum + lead.cpl, 0) || 0) / Math.max(leads.length, 1))}`, icon: BadgeIndianRupee, tone: "amber" },
            { label: "Platforms", value: new Set(leads.map((lead) => lead.platform)).size, icon: Facebook, tone: "purple" }
          ] }),
          /* @__PURE__ */ jsx(ServerListControls, { routeName: "app.meta-leads.index", filters, pagination, searchPlaceholder: "Search leads, form, ad" }),
          /* @__PURE__ */ jsx(Toolbar, { search: { value: search, onChange: setSearch, placeholder: "Filter current page" } }),
          filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyPanel, { title: "No Meta leads yet", description: metaIntegration?.connected ? "Run Sync Meta leads or wait for Meta webhook delivery from your connected lead form." : "Connect Meta Leads from Integrations to fetch real Facebook and Instagram Lead Ads submissions.", action: /* @__PURE__ */ jsx(Link, { href: route("app.integrations.index"), children: /* @__PURE__ */ jsx(Button, { children: "Open integrations" }) }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: filtered.map((lead) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-4", children: [
              /* @__PURE__ */ jsx(ThemedIconTile, { tone: lead.platform === "Instagram" ? "pink" : "blue", children: /* @__PURE__ */ jsx(Target, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("h3", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: lead.name }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  lead.phone || "No phone",
                  " · ",
                  lead.city
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm sm:grid-cols-4 xl:min-w-[560px]", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Source" }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: lead.sourceType === "ctwa" ? "CTWA" : lead.platform })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Form" }),
                /* @__PURE__ */ jsx("p", { className: "truncate font-semibold", children: lead.form })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Score" }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: lead.score })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between gap-2", children: [
                /* @__PURE__ */ jsx(MiniStatus, { status: lead.stage }),
                /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: () => setSelected(lead), children: "Open" })
              ] })
            ] })
          ] }) }, lead.id)) }),
          /* @__PURE__ */ jsx(
            Drawer,
            {
              open: Boolean(selected),
              onClose: () => setSelected(null),
              title: selected?.name || "Lead details",
              description: selected ? `${selected.platform} · ${selected.form}` : void 0,
              footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
                /* @__PURE__ */ jsxs(Button, { variant: "secondary", disabled: !selected?.phone, onClick: () => selected && convert(selected), children: [
                  /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
                  "Convert"
                ] }),
                /* @__PURE__ */ jsxs(Button, { variant: "ghost", onClick: () => selected && remove(selected), children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                  "Delete"
                ] }),
                /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => selected && openEdit(selected), children: [
                  /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
                  "Edit"
                ] }),
                /* @__PURE__ */ jsx(Button, { onClick: () => setSelected(null), children: "Close" })
              ] }),
              children: selected && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: selected.name }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: selected.adName })
                  ] }),
                  /* @__PURE__ */ jsx(MiniStatus, { status: selected.stage })
                ] }) }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
                    /* @__PURE__ */ jsxs("p", { className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                      /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
                      "Phone"
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold text-waify-text dark:text-waify-dark-text", children: selected.phone || "Not captured" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
                    /* @__PURE__ */ jsxs("p", { className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                      /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
                      "City"
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold text-waify-text dark:text-waify-dark-text", children: selected.city })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Lead score" }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold text-waify-text dark:text-waify-dark-text", children: selected.score })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Cost per lead" }),
                    /* @__PURE__ */ jsxs("p", { className: "mt-1 font-semibold text-waify-text dark:text-waify-dark-text", children: [
                      "₹",
                      selected.cpl
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Routing" }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    "Assigned to ",
                    selected.assignee || "Unassigned",
                    " from ",
                    selected.form,
                    ". Campaign ",
                    selected.campaignName || selected.adName || "not set",
                    ". Auto tags: ",
                    (selected.autoTags || []).join(", ") || "none",
                    "."
                  ] })
                ] }) })
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            Drawer,
            {
              open: formOpen,
              onClose: () => setFormOpen(false),
              title: editing ? "Edit lead" : "Add lead",
              description: "Stored in this workspace lead pipeline.",
              footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
                /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setFormOpen(false), children: "Cancel" }),
                /* @__PURE__ */ jsx(Button, { onClick: save, disabled: form.processing, children: "Save lead" })
              ] }),
              children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Name",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.name, onChange: (e) => form.setData("name", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Phone",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.phone, onChange: (e) => form.setData("phone", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Email",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "email", value: form.data.email, onChange: (e) => form.setData("email", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "City",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.city, onChange: (e) => form.setData("city", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Platform",
                  /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.platform, onChange: (e) => form.setData("platform", e.target.value), children: [
                    /* @__PURE__ */ jsx("option", { children: "Facebook" }),
                    /* @__PURE__ */ jsx("option", { children: "Instagram" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Source type",
                  /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.source_type, onChange: (e) => form.setData("source_type", e.target.value), children: [
                    /* @__PURE__ */ jsx("option", { value: "meta_lead", children: "Meta lead form" }),
                    /* @__PURE__ */ jsx("option", { value: "ctwa", children: "Click-to-WhatsApp" }),
                    /* @__PURE__ */ jsx("option", { value: "manual", children: "Manual" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Stage",
                  /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.stage, onChange: (e) => form.setData("stage", e.target.value), children: [
                    /* @__PURE__ */ jsx("option", { value: "new", children: "New" }),
                    /* @__PURE__ */ jsx("option", { value: "qualified", children: "Qualified" }),
                    /* @__PURE__ */ jsx("option", { value: "contacted", children: "Contacted" }),
                    /* @__PURE__ */ jsx("option", { value: "won", children: "Won" }),
                    /* @__PURE__ */ jsx("option", { value: "lost", children: "Lost" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Form",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.form_name, onChange: (e) => form.setData("form_name", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Ad name",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.ad_name, onChange: (e) => form.setData("ad_name", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Campaign",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.campaign_name, onChange: (e) => form.setData("campaign_name", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Auto tags",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.auto_tags, onChange: (e) => form.setData("auto_tags", e.target.value), placeholder: "ctwa, hot lead" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "CPL paise",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "number", value: form.data.cost_per_lead, onChange: (e) => form.setData("cost_per_lead", Number(e.target.value)) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Score",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "number", value: form.data.score, onChange: (e) => form.setData("score", Number(e.target.value)) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Assignee",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.assignee_name, onChange: (e) => form.setData("assignee_name", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
                  "Captured at",
                  /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "datetime-local", value: form.data.captured_at, onChange: (e) => form.setData("captured_at", e.target.value) })
                ] })
              ] })
            }
          )
        ]
      }
    )
  ] });
}
export {
  MetaLeads as default
};
