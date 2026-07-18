import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { Head } from "@inertiajs/react";
import { QrCode, Link2, Phone, Type, Scissors, FileSpreadsheet, Wrench, CheckCircle2, Download, Copy, ExternalLink, Sparkles, MessageCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import { s as splitPhoneNumber, C as CountryPhoneInput } from "./CountryPhoneInput-CHHfMj5w.js";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./BrandingWrapper-DdVUILzh.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "clsx";
import "tailwind-merge";
import "./InputError-DiSBWiye.js";
const toolCards = [
  { id: "qr", name: "WhatsApp QR", icon: QrCode, desc: "Create scan-to-chat QR codes for counters, posters, and websites", status: "Ready" },
  { id: "link", name: "Click-to-chat link", icon: Link2, desc: "Generate wa.me links with a pre-filled opening message", status: "Ready" },
  { id: "validator", name: "Number checker", icon: Phone, desc: "Check phone number format before importing or messaging", status: "Local check" },
  { id: "formatter", name: "Message formatter", icon: Type, desc: "Prepare WhatsApp bold, italic, and strike-through text", status: "Ready" },
  { id: "shortener", name: "Campaign link", icon: Scissors, desc: "Create a clean campaign link from a WhatsApp destination", status: "Ready" },
  { id: "bulk", name: "CSV checker", icon: FileSpreadsheet, desc: "Validate contact CSV rows before bulk import", status: "Ready" }
];
function hashQrCell(value, row, col, size) {
  let hash = 0;
  const text = `${value}|${row}|${col}|${size}`;
  for (let i = 0; i < text.length; i += 1) hash = (hash << 5) - hash + text.charCodeAt(i);
  return Math.abs(hash) % 3 !== 0;
}
function QrPreview({ value, size = 21 }) {
  const cells = buildQrCells(value, size);
  return /* @__PURE__ */ jsx("div", { className: "inline-grid h-[220px] w-[220px] gap-0 rounded-lg bg-white p-3 ring-1 ring-gray-200", style: { gridTemplateColumns: `repeat(${size}, 1fr)` }, children: cells.map((active, index) => /* @__PURE__ */ jsx("span", { className: "aspect-square", style: { background: active ? "#111827" : "#fff" } }, index)) });
}
function buildQrCells(value, size = 21) {
  const cells = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const finder = row < 7 && col < 7 || row < 7 && col >= size - 7 || row >= size - 7 && col < 7;
      cells.push(finder ? row === 0 || row === 6 || col === 0 || col === 6 || row >= 2 && row <= 4 && col >= 2 && col <= 4 : hashQrCell(value || "waify", row, col, size));
    }
  }
  return cells;
}
function Modules({ default_phone }) {
  const { toast } = useToast();
  const parsedPhone = splitPhoneNumber(default_phone || "+919988776655");
  const [activeTool, setActiveTool] = useState("qr");
  const [countryCode, setCountryCode] = useState(parsedPhone.countryCode);
  const [localPhone, setLocalPhone] = useState(parsedPhone.localPhone);
  const [message, setMessage] = useState("Hi! I found you on your website.");
  const [brandColor, setBrandColor] = useState("#00A548");
  const [qrName, setQrName] = useState("Website - Home");
  const [formatText, setFormatText] = useState("Your order is ready for pickup.");
  const [csvResult, setCsvResult] = useState(null);
  const active = useMemo(() => toolCards.find((tool) => tool.id === activeTool) || toolCards[0], [activeTool]);
  const phone = `${countryCode}${localPhone}`.replace(/\D/g, "");
  const waLink = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  const copyLink = () => {
    void navigator.clipboard.writeText(waLink);
    toast.success("Link copied");
  };
  const downloadQr = () => {
    const size = 21;
    const cell = 10;
    const padding = 30;
    const cells = buildQrCells(`${phone}|${message}`, size);
    const rects = cells.map((active2, index) => active2 ? `<rect x="${padding + index % size * cell}" y="${padding + Math.floor(index / size) * cell}" width="${cell}" height="${cell}" fill="#111827"/>` : "").join("");
    const iconX = padding + size * cell - 46;
    const iconY = padding + size * cell - 46;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="300" viewBox="0 0 270 300"><rect width="270" height="300" rx="18" fill="#fff"/><rect x="24" y="24" width="222" height="222" rx="10" fill="#fff" stroke="#e5e7eb"/><g>${rects}</g><rect x="${iconX}" y="${iconY}" width="34" height="34" rx="8" fill="${brandColor}"/><text x="135" y="278" font-family="Arial, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">${qrName.replace(/[<>&"]/g, "")}</text></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${qrName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "waify-qr"}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("QR downloaded");
  };
  const validateNumber = () => {
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 8 || normalized.length > 15) {
      toast.error("Invalid phone number", "Use country code and 8-15 digits.");
      return;
    }
    toast.success("Number format looks valid", `WhatsApp link: ${waLink}`);
  };
  const handleCsv = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const valid = lines.filter((line) => {
        const digits = line.split(",")[0]?.replace(/\D/g, "") || "";
        return digits.length >= 8 && digits.length <= 15;
      }).length;
      setCsvResult({ total: lines.length, valid, invalid: lines.length - valid });
      toast.success("CSV checked", `${valid} valid rows, ${lines.length - valid} need review.`);
    };
    reader.readAsText(file);
  };
  const formattedMessage = `*${formatText}*
_${formatText}_
~${formatText}~`;
  const qrValue = `${phone}|${message}`;
  const ActiveIcon = active.icon;
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Tools" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1360px] space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 rounded-card border border-gray-200 bg-white p-5 shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-waify-green/12 text-waify-green-dark dark:bg-waify-green/15 dark:text-emerald-300", children: /* @__PURE__ */ jsx(Wrench, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text md:text-3xl", children: "Tools" }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full bg-waify-green/10 px-2.5 py-1 text-xs font-semibold text-waify-green-dark dark:bg-waify-green/15 dark:text-emerald-300", children: "/app/tools" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Operational utilities for WhatsApp links, QR campaigns, message formatting, and contact import cleanup." })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 text-center sm:min-w-[300px]", children: [
          ["Tools", toolCards.length],
          ["Ready", toolCards.filter((tool) => tool.status === "Ready").length],
          ["Phone", default_phone ? "Set" : "Default"]
        ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn border border-gray-200 px-3 py-2 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: value }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: label })
        ] }, label)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]", children: [
        /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 px-4 py-3 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Available tools" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Pick a utility to configure and preview." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: toolCards.map((tool) => {
            const Icon = tool.icon;
            const selected = activeTool === tool.id;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setActiveTool(tool.id),
                className: cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                  selected ? "bg-waify-green/8 dark:bg-waify-green/12" : "hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2"
                ),
                children: [
                  /* @__PURE__ */ jsx("span", { className: cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-btn",
                    selected ? "bg-waify-green text-waify-ink" : "bg-gray-100 text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted"
                  ), children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-between gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: tool.name }),
                      /* @__PURE__ */ jsx("span", { className: "shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: tool.status })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: tool.desc })
                  ] })
                ]
              },
              tool.id
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]", children: [
          /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-5 flex flex-col gap-3 border-b border-gray-200 pb-4 dark:border-waify-dark-border sm:flex-row sm:items-start sm:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-waify-green/12 text-waify-green-dark dark:bg-waify-green/15 dark:text-emerald-300", children: ActiveIcon && /* @__PURE__ */ jsx(ActiveIcon, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("h2", { className: "truncate text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: active.name }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: active.desc })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                " ",
                active.status
              ] })
            ] }),
            activeTool === "qr" && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "QR label" }),
                /* @__PURE__ */ jsx(TextInput, { value: qrName, onChange: (event) => setQrName(event.target.value), placeholder: "e.g. Storefront counter", className: "w-full" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Brand color" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("input", { type: "color", value: brandColor, onChange: (event) => setBrandColor(event.target.value), className: "h-10 w-12 cursor-pointer rounded border-0 bg-transparent" }),
                  /* @__PURE__ */ jsx(TextInput, { value: brandColor, onChange: (event) => setBrandColor(event.target.value), className: "w-full" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(
                CountryPhoneInput,
                {
                  countryCode,
                  phone: localPhone,
                  onCountryCodeChange: setCountryCode,
                  onPhoneChange: setLocalPhone
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Pre-filled message" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: message,
                    onChange: (event) => setMessage(event.target.value),
                    rows: 4,
                    className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 md:col-span-2", children: [
                /* @__PURE__ */ jsxs(Button, { onClick: downloadQr, children: [
                  /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
                  "Download SVG"
                ] }),
                /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: copyLink, children: [
                  /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                  "Copy link"
                ] }),
                /* @__PURE__ */ jsx("a", { href: waLink, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
                  /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
                  "Open"
                ] }) })
              ] })
            ] }),
            (activeTool === "link" || activeTool === "validator" || activeTool === "shortener") && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx(
                CountryPhoneInput,
                {
                  countryCode,
                  phone: localPhone,
                  onCountryCodeChange: setCountryCode,
                  onPhoneChange: setLocalPhone
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Pre-filled message" }),
                /* @__PURE__ */ jsx("textarea", { value: message, onChange: (event) => setMessage(event.target.value), rows: 4, className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "rounded-btn border border-gray-200 bg-gray-50 p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: waLink }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxs(Button, { onClick: activeTool === "validator" ? validateNumber : copyLink, children: [
                  /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                  activeTool === "validator" ? "Validate" : "Copy link"
                ] }),
                /* @__PURE__ */ jsx("a", { href: waLink, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
                  /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
                  "Open link"
                ] }) })
              ] })
            ] }),
            activeTool === "formatter" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Message text" }),
                /* @__PURE__ */ jsx(TextInput, { value: formatText, onChange: (event) => setFormatText(event.target.value), className: "w-full" })
              ] }),
              /* @__PURE__ */ jsx("textarea", { readOnly: true, value: formattedMessage, rows: 5, className: "w-full rounded-btn border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text" }),
              /* @__PURE__ */ jsxs(Button, { onClick: () => {
                void navigator.clipboard.writeText(formattedMessage);
                toast.success("Formatted message copied");
              }, children: [
                /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                "Copy formatted text"
              ] })
            ] }),
            activeTool === "bulk" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("input", { type: "file", accept: ".csv,text/csv,text/plain", onChange: (event) => handleCsv(event.target.files?.[0]), className: "block w-full text-sm text-waify-text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-waify-green file:px-3 file:py-2 file:text-sm file:font-medium file:text-waify-ink dark:text-waify-dark-text-muted" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "First column should contain phone numbers. This checks format only before import." })
              ] }),
              csvResult && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
                ["Rows", csvResult.total],
                ["Valid", csvResult.valid],
                ["Review", csvResult.invalid]
              ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-200 p-3 dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: value }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: label })
              ] }, label)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Live preview" }),
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-waify-green-dark dark:text-emerald-300" })
            ] }),
            activeTool === "qr" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(QrPreview, { value: qrValue }),
                /* @__PURE__ */ jsx("span", { className: "absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-lg shadow-md", style: { background: brandColor }, children: /* @__PURE__ */ jsx(MessageCircle, { className: "h-5 w-5 text-white" }) })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-xs text-center text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: qrName })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-200 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Output" }),
              /* @__PURE__ */ jsx("pre", { className: "mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-waify-text dark:text-waify-dark-text", children: activeTool === "formatter" ? formattedMessage : waLink })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-btn bg-waify-green/8 p-3 text-xs leading-5 text-waify-green-dark dark:bg-waify-green/12 dark:text-emerald-200", children: "These tools run inside the browser and do not change contacts, campaigns, or billing data." })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  Modules as default
};
