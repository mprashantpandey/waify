import { jsx, jsxs } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { MessageSquare, ExternalLink, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
const TWILIO_VERIFY_DOCS = "https://www.twilio.com/docs/verify/api";
const MSG91_OTP_DOCS = "https://docs.msg91.com/otp/sendotp";
function SmsTab({ data, setData, errors }) {
  const sms = data.sms ?? {};
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [showMsg91Authkey, setShowMsg91Authkey] = useState(false);
  const provider = sms.provider ?? "";
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5" }),
        "SMS provider (2FA & OTP)"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Choose an SMS provider to send verification codes (e.g. phone verification, 2FA OTP). When disabled, OTP may be sent via email fallback only." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "sms.provider", children: "Provider" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "sms.provider",
            value: provider,
            onChange: (e) => setData("sms", { ...sms, provider: e.target.value }),
            className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 max-w-xs",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "None (email fallback only)" }),
              /* @__PURE__ */ jsx("option", { value: "twilio_verify", children: "Twilio Verify (2FA / OTP)" }),
              /* @__PURE__ */ jsx("option", { value: "msg91", children: "MSG91 (OTP)" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors["sms.provider"] })
      ] }),
      provider === "twilio_verify" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Twilio Verify" }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: TWILIO_VERIFY_DOCS,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1",
              children: [
                "API docs ",
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
          "Uses Verify API v2: create a Verification Service in Twilio Console, then send SMS via Verifications and check via VerificationCheck. Base URL: ",
          /* @__PURE__ */ jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "https://verify.twilio.com/v2/" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sms.twilio_account_sid", children: "Account SID" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "sms.twilio_account_sid",
                value: sms.twilio_account_sid ?? "",
                onChange: (e) => setData("sms", { ...sms, twilio_account_sid: e.target.value }),
                placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                className: "mt-1 font-mono text-sm"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["sms.twilio_account_sid"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sms.twilio_auth_token", children: "Auth Token" }),
            /* @__PURE__ */ jsxs("div", { className: "relative mt-1", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "sms.twilio_auth_token",
                  type: showTwilioToken ? "text" : "password",
                  value: sms.twilio_auth_token ?? "",
                  onChange: (e) => setData("sms", { ...sms, twilio_auth_token: e.target.value }),
                  placeholder: "••••••••",
                  className: "pr-10 font-mono text-sm"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowTwilioToken((v) => !v),
                  className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400",
                  "aria-label": showTwilioToken ? "Hide token" : "Show token",
                  children: showTwilioToken ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: errors["sms.twilio_auth_token"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sms.twilio_verify_service_sid", children: "Verify Service SID" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "sms.twilio_verify_service_sid",
                value: sms.twilio_verify_service_sid ?? "",
                onChange: (e) => setData("sms", { ...sms, twilio_verify_service_sid: e.target.value }),
                placeholder: "VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                className: "mt-1 font-mono text-sm max-w-md"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: "Create in Twilio Console → Verify → Services, or via Verify API Create Service." }),
            /* @__PURE__ */ jsx(InputError, { message: errors["sms.twilio_verify_service_sid"] })
          ] })
        ] })
      ] }),
      provider === "msg91" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: "MSG91" }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: MSG91_OTP_DOCS,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1",
              children: [
                "SendOTP docs ",
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
          "MSG91 Send OTP API: authkey and mobile (E.164). Optional: sender, otp, otp_expiry, otp_length. Endpoint: ",
          /* @__PURE__ */ jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "https://api.msg91.com/api/sendotp.php" }),
          " or use the newer POST SendOTP from docs."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sms.msg91_authkey", children: "Auth key" }),
            /* @__PURE__ */ jsxs("div", { className: "relative mt-1", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "sms.msg91_authkey",
                  type: showMsg91Authkey ? "text" : "password",
                  value: sms.msg91_authkey ?? "",
                  onChange: (e) => setData("sms", { ...sms, msg91_authkey: e.target.value }),
                  placeholder: "Your MSG91 authentication key",
                  className: "pr-10"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowMsg91Authkey((v) => !v),
                  className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400",
                  "aria-label": showMsg91Authkey ? "Hide" : "Show",
                  children: showMsg91Authkey ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: errors["sms.msg91_authkey"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sms.msg91_sender_id", children: "Sender ID" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "sms.msg91_sender_id",
                value: sms.msg91_sender_id ?? "SMSIND",
                onChange: (e) => setData("sms", { ...sms, msg91_sender_id: e.target.value }),
                placeholder: "SMSIND",
                className: "mt-1 max-w-[140px]"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: "Max 11 chars; shown to recipient." }),
            /* @__PURE__ */ jsx(InputError, { message: errors["sms.msg91_sender_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sms.msg91_otp_expiry_minutes", children: "OTP expiry (minutes)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "sms.msg91_otp_expiry_minutes",
                type: "number",
                min: 1,
                max: 1440,
                value: sms.msg91_otp_expiry_minutes ?? 10,
                onChange: (e) => setData("sms", { ...sms, msg91_otp_expiry_minutes: parseInt(e.target.value, 10) || 10 }),
                className: "mt-1 w-24"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["sms.msg91_otp_expiry_minutes"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sms.msg91_otp_length", children: "OTP length (digits)" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "sms.msg91_otp_length",
                value: sms.msg91_otp_length ?? 6,
                onChange: (e) => setData("sms", { ...sms, msg91_otp_length: parseInt(e.target.value, 10) }),
                className: "mt-1 rounded-md border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 w-24",
                children: [4, 5, 6, 7, 8, 9].map((n) => /* @__PURE__ */ jsx("option", { value: n, children: n }, n))
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["sms.msg91_otp_length"] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  SmsTab as default
};
