import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { HardDrive, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function StorageTab({ data, setData, errors }) {
  const [showSecret, setShowSecret] = useState(false);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(HardDrive, { className: "h-5 w-5" }),
      "Storage Configuration"
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "storage.default", value: "Default Driver" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "storage.default",
            value: data.storage?.default || "local",
            onChange: (e) => setData("storage.default", e.target.value),
            className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "local", children: "Local" }),
              /* @__PURE__ */ jsx("option", { value: "public", children: "Public" }),
              /* @__PURE__ */ jsx("option", { value: "s3", children: "Amazon S3" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["storage.default"] })
      ] }) }),
      data.storage?.default === "s3" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "storage.s3_key", value: "S3 Access Key" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "storage.s3_key",
              type: "text",
              value: data.storage?.s3_key || "",
              onChange: (e) => setData("storage.s3_key", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["storage.s3_key"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "storage.s3_secret", value: "S3 Secret Key" }),
          /* @__PURE__ */ jsxs("div", { className: "relative mt-1", children: [
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "storage.s3_secret",
                type: showSecret ? "text" : "password",
                value: data.storage?.s3_secret || "",
                onChange: (e) => setData("storage.s3_secret", e.target.value),
                className: "pr-10"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowSecret(!showSecret),
                className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                children: showSecret ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors["storage.s3_secret"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "storage.s3_region", value: "S3 Region" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "storage.s3_region",
              type: "text",
              value: data.storage?.s3_region || "",
              onChange: (e) => setData("storage.s3_region", e.target.value),
              className: "mt-1",
              placeholder: "us-east-1"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["storage.s3_region"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "storage.s3_bucket", value: "S3 Bucket" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "storage.s3_bucket",
              type: "text",
              value: data.storage?.s3_bucket || "",
              onChange: (e) => setData("storage.s3_bucket", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["storage.s3_bucket"] })
        ] })
      ] })
    ] })
  ] });
}
export {
  StorageTab as default
};
