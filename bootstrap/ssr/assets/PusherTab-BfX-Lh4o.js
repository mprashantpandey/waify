import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Radio, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function PusherTab({ data, setData, errors }) {
  const [showSecret, setShowSecret] = useState(false);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Radio, { className: "h-5 w-5" }),
      "Pusher Configuration"
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "pusher.app_id", value: "App ID" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "pusher.app_id",
            type: "text",
            value: data.pusher?.app_id || "",
            onChange: (e) => setData("pusher.app_id", e.target.value),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["pusher.app_id"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "pusher.key", value: "Key" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "pusher.key",
            type: "text",
            value: data.pusher?.key || "",
            onChange: (e) => setData("pusher.key", e.target.value),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["pusher.key"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "pusher.secret", value: "Secret" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "pusher.secret",
              type: showSecret ? "text" : "password",
              value: data.pusher?.secret || "",
              onChange: (e) => setData("pusher.secret", e.target.value),
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
        /* @__PURE__ */ jsx(InputError, { message: errors["pusher.secret"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "pusher.cluster", value: "Cluster" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "pusher.cluster",
            type: "text",
            value: data.pusher?.cluster || "",
            onChange: (e) => setData("pusher.cluster", e.target.value),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["pusher.cluster"] })
      ] })
    ] }) })
  ] });
}
export {
  PusherTab as default
};
