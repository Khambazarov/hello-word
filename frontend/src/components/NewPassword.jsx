import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchBrowserLanguage } from "../utils/browserLanguage.js";

import robot from "../assets/robot.png";
import {
  EmailIcon,
  EyeClosedIcon,
  EyeOpenedIcon,
  KeyIcon,
  PasswordIcon,
} from "./_AllSVGs";

const browserLanguage = fetchBrowserLanguage();

export const NewPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [translations, setTranslations] = useState(
    getTranslations(browserLanguage)
  );

  async function handleNewPw(e) {
    e.preventDefault();
    const email = e.target.email.value.toLowerCase().trim();
    const key = e.target.key.value.trim();
    const newPw = e.target.newPw.value.trim();

    toast.loading(translations.feedback.toast.auth.newPw.waiting);

    const response = await fetch("/api/users/new-pw", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, key, newPw }),
    });

    setTimeout(() => toast.dismiss(), 1000);

    if (response.ok) {
      toast.success(translations.feedback.toast.auth.newPw.success);
      setTimeout(() => navigate("/"), 2000);
    } else if (response.status === 404) {
      setTimeout(
        () => toast.error(translations.feedback.toast.auth.newPw.errorNotFound),
        1300
      );
    } else if (response.status === 401) {
      setTimeout(
        () =>
          toast.error(
            translations.feedback.toast.auth.newPw.errorKeyNotCorrect
          ),
        1300
      );
    } else {
      setTimeout(
        () => toast.error(translations.feedback.toast.auth.newPw.error),
        1300
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full p-1 mb-4">
            <img
              className="w-full h-full rounded-full bg-white p-2"
              src={robot}
              alt="robot"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
            {translations.auth.newPw?.title || "Reset Your Password"}
          </h1>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {translations.auth.newPw?.infoText ||
                  "Enter your email, the 8-character reset key from your email, and your new password."}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleNewPw} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {translations.auth.newPw.emailTitle || "Email"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  placeholder={
                    translations.auth.newPw.emailPlaceholder ||
                    "Your email address"
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Reset Key Field */}
            <div>
              <label
                htmlFor="key"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {translations.auth.newPw.resetKeyTitle || "Verification Code"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon />
                </div>
                <input
                  type="text"
                  name="key"
                  id="key"
                  placeholder={
                    translations.auth.newPw.resetKeyPlaceholder ||
                    "8-character code"
                  }
                  minLength={8}
                  maxLength={8}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {translations.auth.newPw?.resetKeyHelper ||
                  "8 characters exactly as received in your email"}
              </p>
            </div>

            {/* New Password Field */}
            <div>
              <label
                htmlFor="newPw"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {translations.auth.newPw.pwTitle || "New Password"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PasswordIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPw"
                  id="newPw"
                  placeholder={
                    translations.auth.newPw.pwPlaceholder || "Strong Password"
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOpenedIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {translations.auth.newPw?.pwHelper || "Minimum 6 characters"}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {translations.auth.newPw.setBtn || "Change Password"}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              {translations.auth.newPw.backToLogin || "Back to Login"}
            </Link>
          </div>
        </div>

        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </div>
    </div>
  );
};
