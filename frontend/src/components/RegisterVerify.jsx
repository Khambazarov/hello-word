import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchBrowserLanguage } from "../utils/browserLanguage.js";

import robot from "../assets/robot.png";
import { EmailIcon, KeyIcon } from "./_AllSVGs";

const browserLanguage = fetchBrowserLanguage();

export const RegisterVerify = () => {
  const navigate = useNavigate();
  const [translations, setTranslations] = useState(
    getTranslations(browserLanguage)
  );

  async function handleVerify(e) {
    e.preventDefault();
    toast.loading(translations.toast.verify.loading);

    const email = e.target.email.value.toLowerCase().trim();

    // Collect the 6-digit code from separate inputs
    let key = "";
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`key-${i}`);
      if (input && input.value) {
        key += input.value;
      }
    }

    // Validate that we have a complete 6-digit code
    if (key.length !== 6) {
      toast.dismiss();
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    const response = await fetch("/api/users/register/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, key }),
    });
    const user = await response.json();
    toast.dismiss();

    if (user.isVerified) {
      toast.success(translations.toast.verify.success);
      setTimeout(() => navigate("/"), 2000);
    } else if (response.status === 400) {
      toast.error(translations.toast.verify.errorAlreadyVerified);
    } else if (response.status === 409) {
      toast.error(translations.toast.verify.errorNoMatch);
    } else {
      toast.error(translations.toast.verify.errorServer);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <img className="h-12 w-12" src={robot} alt="robot" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Verify Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            Check your email and enter the verification code
          </p>
        </div>

        {/* Verify Form */}
        <div className="backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 shadow-2xl rounded-3xl border border-white/30 dark:border-gray-700/50 p-8 sm:p-10 space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {translations.verify.titel}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
              {translations.verify.description}
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center mt-0.5">
                <svg
                  className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-sm">
                <p className="text-emerald-800 dark:text-emerald-200 font-medium mb-2">
                  Verification steps:
                </p>
                <ul className="text-emerald-700 dark:text-emerald-300 space-y-1 text-xs sm:text-sm">
                  <li>• Enter your email address used during registration</li>
                  <li>• Check your inbox for a 6-digit verification code</li>
                  <li>• Enter the code below to activate your account</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                {translations.verify.emailTitle}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <div className="text-gray-400 dark:text-gray-500">
                    <EmailIcon />
                  </div>
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  placeholder={translations.verify.emailPlaceholder}
                  className={`w-full pl-12 pr-4 py-4 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-gray-400`}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Verification Code Input - 6 separate boxes */}
            <div>
              <label
                htmlFor="key-0"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4"
              >
                {translations.verify.key}
              </label>

              <div className="flex justify-center space-x-1 mb-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="tel"
                    id={`key-${index}`}
                    name={`key-${index}`}
                    maxLength={1}
                    autoComplete="one-time-code"
                    className="w-10 h-10 sm:w-14 sm:h-14 text-center text-xl font-bold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      e.target.value = value;

                      // Auto-focus next input or verify button
                      if (value) {
                        if (index < 5) {
                          const nextInput = document.getElementById(
                            `key-${index + 1}`
                          );
                          if (nextInput) nextInput.focus();
                        } else {
                          // After the 6th input, focus the verify button
                          const verifyButton =
                            document.getElementById("verify-button");
                          if (verifyButton) verifyButton.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to move to previous input
                      if (
                        e.key === "Backspace" &&
                        !e.target.value &&
                        index > 0
                      ) {
                        const prevInput = document.getElementById(
                          `key-${index - 1}`
                        );
                        if (prevInput) {
                          prevInput.focus();
                          prevInput.value = "";
                        }
                      }

                      // Handle paste
                      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        navigator.clipboard.readText().then((text) => {
                          const digits = text
                            .replace(/[^0-9]/g, "")
                            .slice(0, 6);
                          for (let i = 0; i < digits.length && i < 6; i++) {
                            const input = document.getElementById(`key-${i}`);
                            if (input) input.value = digits[i];
                          }
                          // Focus the next empty input, the last filled one, or the verify button
                          if (digits.length >= 6) {
                            const verifyButton =
                              document.getElementById("verify-button");
                            if (verifyButton) verifyButton.focus();
                          } else {
                            const nextIndex = Math.min(digits.length, 5);
                            const nextInput = document.getElementById(
                              `key-${nextIndex}`
                            );
                            if (nextInput) nextInput.focus();
                          }
                        });
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const paste = e.clipboardData.getData("text");
                      const digits = paste.replace(/[^0-9]/g, "").slice(0, 6);

                      for (let i = 0; i < digits.length && i < 6; i++) {
                        const input = document.getElementById(`key-${i}`);
                        if (input) input.value = digits[i];
                      }

                      // Focus the next empty input, the last filled one, or the verify button
                      if (digits.length >= 6) {
                        const verifyButton =
                          document.getElementById("verify-button");
                        if (verifyButton) verifyButton.focus();
                      } else {
                        const nextIndex = Math.min(digits.length, 5);
                        const nextInput = document.getElementById(
                          `key-${nextIndex}`
                        );
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    required
                  />
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Verify Button */}
            <button
              id="verify-button"
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{translations.verify.submitBtn}</span>
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>{translations.verify.backToLogin}</span>
            </Link>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};
