import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Zap, Layers, Database } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "react";
function PerformanceTab({ data, setData, errors }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5" }),
        "Cache Configuration"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.cache_driver", value: "Cache Driver" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "performance.cache_driver",
              value: data.performance?.cache_driver || "file",
              onChange: (e) => setData("performance.cache_driver", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "file", children: "File" }),
                /* @__PURE__ */ jsx("option", { value: "redis", children: "Redis" }),
                /* @__PURE__ */ jsx("option", { value: "memcached", children: "Memcached" }),
                /* @__PURE__ */ jsx("option", { value: "database", children: "Database" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["performance.cache_driver"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.cache_ttl", value: "Default Cache TTL (Seconds)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "performance.cache_ttl",
                type: "number",
                value: data.performance?.cache_ttl || 3600,
                onChange: (e) => setData("performance.cache_ttl", parseInt(e.target.value) || 3600),
                className: "mt-1",
                min: "60"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["performance.cache_ttl"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Enable Cache" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Use caching for improved performance" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.performance?.cache_enabled || false,
                  onChange: (e) => setData("performance.cache_enabled", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Layers, { className: "h-5 w-5" }),
        "Queue Configuration"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.queue_connection", value: "Queue Connection" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "performance.queue_connection",
              value: data.performance?.queue_connection || "database",
              onChange: (e) => setData("performance.queue_connection", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "database", children: "Database" }),
                /* @__PURE__ */ jsx("option", { value: "redis", children: "Redis" }),
                /* @__PURE__ */ jsx("option", { value: "sqs", children: "Amazon SQS" }),
                /* @__PURE__ */ jsx("option", { value: "beanstalkd", children: "Beanstalkd" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["performance.queue_connection"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.queue_max_attempts", value: "Max Attempts" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "performance.queue_max_attempts",
                type: "number",
                value: data.performance?.queue_max_attempts || 3,
                onChange: (e) => setData("performance.queue_max_attempts", parseInt(e.target.value) || 3),
                className: "mt-1",
                min: "1",
                max: "10"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["performance.queue_max_attempts"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.queue_timeout", value: "Timeout (Seconds)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "performance.queue_timeout",
                type: "number",
                value: data.performance?.queue_timeout || 90,
                onChange: (e) => setData("performance.queue_timeout", parseInt(e.target.value) || 90),
                className: "mt-1",
                min: "30"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["performance.queue_timeout"] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }),
        "Database Optimization"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.db_connection_pool", value: "Connection Pool Size" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "performance.db_connection_pool",
                type: "number",
                value: data.performance?.db_connection_pool || 10,
                onChange: (e) => setData("performance.db_connection_pool", parseInt(e.target.value) || 10),
                className: "mt-1",
                min: "5",
                max: "100"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["performance.db_connection_pool"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.query_timeout", value: "Query Timeout (Seconds)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "performance.query_timeout",
                type: "number",
                value: data.performance?.query_timeout || 30,
                onChange: (e) => setData("performance.query_timeout", parseInt(e.target.value) || 30),
                className: "mt-1",
                min: "5"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["performance.query_timeout"] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Enable Query Logging" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Log all database queries (development only)" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.performance?.query_logging_enabled || false,
                onChange: (e) => setData("performance.query_logging_enabled", e.target.checked),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5" }),
        "File Upload Limits"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.max_upload_size", value: "Max Upload Size (MB)" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "performance.max_upload_size",
              type: "number",
              value: data.performance?.max_upload_size || 10,
              onChange: (e) => setData("performance.max_upload_size", parseInt(e.target.value) || 10),
              className: "mt-1",
              min: "1",
              max: "100"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["performance.max_upload_size"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "performance.allowed_file_types", value: "Allowed File Types" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "performance.allowed_file_types",
              type: "text",
              value: data.performance?.allowed_file_types || "jpg,jpeg,png,pdf,doc,docx",
              onChange: (e) => setData("performance.allowed_file_types", e.target.value),
              className: "mt-1",
              placeholder: "jpg,jpeg,png,pdf"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Comma-separated list" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["performance.allowed_file_types"] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  PerformanceTab as default
};
