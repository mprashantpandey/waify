import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { S as Switch } from "./Switch-DsHb4CWG.js";
import { useState, useMemo } from "react";
import { HelpCircle, Plus, Search, ChevronUp, GripVertical, ChevronDown, EyeOff, Tag, Copy, Trash2 } from "lucide-react";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function SupportTab({ data, setData, errors }) {
  const faqs = data.support?.faqs || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFaqs, setExpandedFaqs] = useState(/* @__PURE__ */ new Set());
  const categories = useMemo(() => {
    const cats = /* @__PURE__ */ new Set();
    faqs.forEach((faq) => {
      if (faq.category && faq.category.trim()) {
        cats.add(faq.category);
      }
    });
    return Array.from(cats).sort();
  }, [faqs]);
  const filteredFaqs = useMemo(() => {
    let filtered = [...faqs];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query) || faq.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }
    return filtered;
  }, [faqs, searchQuery, selectedCategory]);
  const updateFaq = (index, field, value) => {
    const next = [...faqs];
    next[index] = { ...next[index], [field]: value };
    setData("support", { ...data.support, faqs: next });
  };
  const addFaq = () => {
    const newOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.order || 0)) + 1 : 0;
    setData("support", {
      ...data.support,
      faqs: [...faqs, {
        question: "",
        answer: "",
        category: "",
        enabled: true,
        order: newOrder,
        tags: []
      }]
    });
  };
  const removeFaq = (index) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      const next = faqs.filter((_, idx) => idx !== index);
      setData("support", { ...data.support, faqs: next });
    }
  };
  const duplicateFaq = (index) => {
    const faqToDuplicate = faqs[index];
    const newOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.order || 0)) + 1 : 0;
    setData("support", {
      ...data.support,
      faqs: [...faqs, {
        ...faqToDuplicate,
        question: `${faqToDuplicate.question} (Copy)`,
        order: newOrder
      }]
    });
  };
  const moveFaq = (index, direction) => {
    const newFaqs = [...faqs];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newFaqs.length) return;
    const tempOrder = newFaqs[index].order || index;
    newFaqs[index].order = newFaqs[newIndex].order || newIndex;
    newFaqs[newIndex].order = tempOrder;
    [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];
    setData("support", { ...data.support, faqs: newFaqs });
  };
  const toggleFaqExpanded = (index) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFaqs(newExpanded);
  };
  const addTag = (index, tag) => {
    const faq = faqs[index];
    const tags = faq.tags || [];
    if (tag.trim() && !tags.includes(tag.trim())) {
      updateFaq(index, "tags", [...tags, tag.trim()]);
    }
  };
  const removeTag = (index, tagIndex) => {
    const faq = faqs[index];
    const tags = faq.tags || [];
    updateFaq(index, "tags", tags.filter((_, idx) => idx !== tagIndex));
  };
  const sortedFaqs = useMemo(() => {
    return [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [faqs]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Support Types" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Enable or disable support features for all users" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-6 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Live Chat Widget" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Enable the live chat widget for users. When disabled, users will not see the chat widget in their panel." })
          ] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              checked: data.support?.live_chat_enabled ?? true,
              onCheckedChange: (value) => setData("support", { ...data.support, live_chat_enabled: value })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Ticket Support" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Enable ticket support system. When disabled, users will not be able to create or view support tickets." })
          ] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              checked: data.support?.ticket_support_enabled ?? true,
              onCheckedChange: (value) => setData("support", { ...data.support, ticket_support_enabled: value })
            }
          )
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(HelpCircle, { className: "h-5 w-5" }),
            "Support FAQs"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Manage common questions shown in the Support Hub" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", onClick: addFaq, className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "Add FAQ"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "text",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-10",
                placeholder: "Search FAQs..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Category Filter" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: selectedCategory,
                onChange: (e) => setSelectedCategory(e.target.value),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All Categories" }),
                  categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Total: ",
            faqs.length
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Enabled: ",
            faqs.filter((f) => f.enabled !== false).length
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Disabled: ",
            faqs.filter((f) => f.enabled === false).length
          ] }),
          filteredFaqs.length !== faqs.length && /* @__PURE__ */ jsxs("span", { className: "text-blue-600 dark:text-blue-400", children: [
            "Showing: ",
            filteredFaqs.length
          ] })
        ] }),
        sortedFaqs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg", children: [
          /* @__PURE__ */ jsx(HelpCircle, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-1", children: "No FAQs yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-4", children: "Add your first FAQ to help users find answers quickly" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: addFaq, variant: "primary", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Add Your First FAQ"
          ] })
        ] }) : filteredFaqs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg", children: [
          /* @__PURE__ */ jsx(Search, { className: "h-8 w-8 text-gray-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "No FAQs match your search" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Try adjusting your filters" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sortedFaqs.map((faq, index) => {
          const originalIndex = faqs.findIndex((f) => f === faq);
          const isExpanded = expandedFaqs.has(originalIndex);
          const isEnabled = faq.enabled !== false;
          return /* @__PURE__ */ jsx(
            "div",
            {
              className: `rounded-lg border-2 transition-all ${isEnabled ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75"}`,
              children: /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 mt-1", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => moveFaq(originalIndex, "up"),
                      disabled: index === 0,
                      className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(GripVertical, { className: "h-5 w-5 text-gray-400" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => moveFaq(originalIndex, "down"),
                      disabled: index === sortedFaqs.length - 1,
                      className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                        !isEnabled && /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
                          /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3 mr-1" }),
                          "Disabled"
                        ] }),
                        faq.category && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
                          /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3 mr-1" }),
                          faq.category
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(Label, { htmlFor: `support.faqs.${originalIndex}.question`, className: "text-sm font-semibold", children: "Question" }),
                      /* @__PURE__ */ jsx(
                        TextInput,
                        {
                          id: `support.faqs.${originalIndex}.question`,
                          type: "text",
                          value: faq.question,
                          onChange: (e) => updateFaq(originalIndex, "question", e.target.value),
                          className: "mt-1 block w-full",
                          placeholder: "How do I connect WhatsApp?"
                        }
                      ),
                      errors?.[`support.faqs.${originalIndex}.question`] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors[`support.faqs.${originalIndex}.question`] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        checked: isEnabled,
                        onCheckedChange: (value) => updateFaq(originalIndex, "enabled", value),
                        title: isEnabled ? "Disable FAQ" : "Enable FAQ"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                      /* @__PURE__ */ jsx(Label, { htmlFor: `support.faqs.${originalIndex}.answer`, className: "text-sm font-semibold", children: "Answer" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                        faq.answer?.length || 0,
                        " characters"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        id: `support.faqs.${originalIndex}.answer`,
                        value: faq.answer,
                        onChange: (e) => updateFaq(originalIndex, "answer", e.target.value),
                        className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                        rows: isExpanded ? 6 : 3,
                        placeholder: "Go to Connections and follow the setup wizard."
                      }
                    ),
                    errors?.[`support.faqs.${originalIndex}.answer`] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors[`support.faqs.${originalIndex}.answer`] }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleFaqExpanded(originalIndex),
                        className: "mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline",
                        children: isExpanded ? "Show less" : "Show more"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx(Label, { htmlFor: `support.faqs.${originalIndex}.category`, className: "text-sm font-semibold", children: "Category" }),
                      /* @__PURE__ */ jsx(
                        TextInput,
                        {
                          id: `support.faqs.${originalIndex}.category`,
                          type: "text",
                          value: faq.category || "",
                          onChange: (e) => updateFaq(originalIndex, "category", e.target.value),
                          className: "mt-1 block w-full",
                          placeholder: "e.g., Getting Started, Billing, Technical"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold mb-1 block", children: "Tags" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mt-1", children: [
                        (faq.tags || []).map((tag, tagIndex) => /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [
                          tag,
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => removeTag(originalIndex, tagIndex),
                              className: "ml-1 hover:text-red-600",
                              children: "×"
                            }
                          )
                        ] }, tagIndex)),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "text",
                            placeholder: "Add tag...",
                            className: "text-xs border-0 bg-transparent focus:outline-none focus:ring-0 p-0",
                            onKeyDown: (e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.target;
                                if (input.value.trim()) {
                                  addTag(originalIndex, input.value);
                                  input.value = "";
                                }
                              }
                            }
                          }
                        )
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700", children: [
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        onClick: () => duplicateFaq(originalIndex),
                        className: "flex items-center gap-1",
                        children: [
                          /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
                          "Duplicate"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "secondary",
                        size: "sm",
                        onClick: () => removeFaq(originalIndex),
                        className: "flex items-center gap-1 text-red-600 hover:text-red-700",
                        children: [
                          /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }),
                          "Delete"
                        ]
                      }
                    )
                  ] })
                ] })
              ] }) })
            },
            originalIndex
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Support Settings" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Configure support notifications and SLAs" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Email Notifications" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Enable or disable all support emails." })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: data.support?.email_notifications_enabled ?? true,
                onCheckedChange: (value) => setData("support", { ...data.support, email_notifications_enabled: value })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Notify Admins" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Email platform admins on new tickets and replies." })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: data.support?.notify_admins ?? true,
                onCheckedChange: (value) => setData("support", { ...data.support, notify_admins: value })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-sm font-semibold", children: "Notify Customers" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Email tenants when agents reply." })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: data.support?.notify_customers ?? true,
                onCheckedChange: (value) => setData("support", { ...data.support, notify_customers: value })
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "support.sla_hours", children: "SLA Hours" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "support.sla_hours",
                type: "number",
                min: "1",
                value: data.support?.sla_hours ?? 48,
                onChange: (e) => setData("support", { ...data.support, sla_hours: Number(e.target.value) }),
                className: "mt-1 block w-full"
              }
            ),
            errors?.["support.sla_hours"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["support.sla_hours"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "support.first_response_hours", children: "First Response SLA (hours)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "support.first_response_hours",
                type: "number",
                min: "1",
                value: data.support?.first_response_hours ?? 4,
                onChange: (e) => setData("support", { ...data.support, first_response_hours: Number(e.target.value) }),
                className: "mt-1 block w-full"
              }
            ),
            errors?.["support.first_response_hours"] && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors["support.first_response_hours"] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SupportTab as default
};
