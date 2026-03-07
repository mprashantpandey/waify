import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { usePage, useForm, router } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { User, ShieldCheck, Mail, Phone, Save } from "lucide-react";
import { A as Alert } from "./Alert-C-mQ6HNk.js";
import { useState } from "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function ProfileTab() {
  const pageProps = usePage().props;
  const { auth, account } = pageProps;
  const user = auth?.user;
  const mustVerifyEmail = Boolean(pageProps.mustVerifyEmail);
  const emailVerified = Boolean(pageProps.emailVerified);
  const phoneVerificationRequired = Boolean(account?.phone_verification_required);
  const phoneVerified = Boolean(user?.phone_verified_at);
  const originalPhone = String(user?.phone || "");
  const { data, setData, patch, processing, errors, reset } = useForm({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });
  const otpForm = useForm({
    otp_code: ""
  });
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    patch(route("profile.update"), {
      preserveScroll: true,
      onSuccess: () => reset()
    });
  };
  const sendOtp = () => {
    router.post(route("app.settings.security.phone.send-code"), {}, {
      preserveScroll: true,
      onStart: () => setSendingOtp(true),
      onError: () => {
      },
      onFinish: () => setSendingOtp(false)
    });
  };
  const verifyOtp = (e) => {
    e.preventDefault();
    otpForm.post(route("app.settings.security.phone.verify-code"), {
      preserveScroll: true,
      onSuccess: () => {
        otpForm.reset("otp_code");
      },
      onError: () => {
      }
    });
  };
  const resendEmailVerification = () => {
    router.post(route("app.settings.security.resend-verification"), {}, {
      preserveScroll: true,
      onStart: () => setResendingVerification(true),
      onError: () => {
      },
      onFinish: () => setResendingVerification(false)
    });
  };
  const phoneChanged = String(data.phone || "").trim() !== originalPhone.trim();
  const canRequestOtp = !phoneChanged && !!String(data.phone || "").trim();
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Profile Information" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Update your account's profile information and email address" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
      phoneVerificationRequired && /* @__PURE__ */ jsx(Alert, { variant: "warning", className: "mb-5", children: "Your tenant requires a verified phone number to access app features." }),
      /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Email Verification" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Required for account security and password recovery trust." })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `text-sm font-medium ${emailVerified ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`, children: emailVerified ? "Verified" : mustVerifyEmail ? "Not verified" : "Optional" })
        ] }),
        !emailVerified && mustVerifyEmail && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: resendEmailVerification, children: resendingVerification ? "Sending..." : "Resend Verification Email" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 self-center", children: "Check inbox/spam for the verification link." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Phone Verification" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Verification codes are currently delivered via email fallback until SMS provider setup is enabled." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: `h-4 w-4 ${phoneVerified ? "text-green-600" : "text-amber-600"}` }),
            /* @__PURE__ */ jsx("span", { className: phoneVerified ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400", children: phoneVerified ? "Verified" : "Not verified" })
          ] })
        ] }),
        !phoneVerified && /* @__PURE__ */ jsxs("form", { onSubmit: verifyOtp, className: "space-y-3", children: [
          phoneChanged && /* @__PURE__ */ jsx(Alert, { variant: "warning", children: "You changed the phone number. Save profile changes first, then request a verification code for the new number." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                onClick: sendOtp,
                disabled: processing || sendingOtp || otpForm.processing || !canRequestOtp,
                children: sendingOtp ? "Sending..." : "Send Verification Code"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: otpForm.data.otp_code,
                  onChange: (e) => otpForm.setData("otp_code", e.target.value),
                  placeholder: "Enter OTP code",
                  className: "w-full rounded-xl"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: otpForm.errors.otp_code, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                disabled: otpForm.processing || !String(otpForm.data.otp_code || "").trim(),
                children: otpForm.processing ? "Verifying..." : "Verify Code"
              }
            )
          ] }),
          !String(data.phone || "").trim() && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-600 dark:text-amber-400", children: "Save a phone number first, then request a verification code." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Full Name", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "name",
                type: "text",
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email Address", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "email",
                type: "email",
                value: data.email,
                onChange: (e) => setData("email", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "phone", value: "Phone Number", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Phone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "phone",
                type: "tel",
                value: data.phone,
                onChange: (e) => setData("phone", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: phoneVerificationRequired,
                placeholder: "+1234567890"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.phone, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: processing,
            className: "w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
            children: processing ? "Saving..." : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
              "Save Changes"
            ] })
          }
        ) })
      ] })
    ] })
  ] }) });
}
export {
  ProfileTab as default
};
