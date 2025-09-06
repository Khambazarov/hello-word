import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchBrowserLanguage } from "../utils/browserLanguage.js";

import robot from "../assets/robot.png";
import { EmailIcon } from "./_AllSVGs";

const browserLanguage = fetchBrowserLanguage();

export const ForgotPw = () => {
  const navigate = useNavigate();
  const [translations, setTranslations] = useState(
    getTranslations(browserLanguage)
  );

  async function handleResetPw(e) {
    e.preventDefault();
    const email = e.target.email.value.toLowerCase().trim();

    toast.loading(translations.toast.forgotPw.waiting);

    const response = await fetch("/api/users/forgot-pw", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    toast.dismiss();

    if (response.ok) {
      toast.success(translations.toast.forgotPw.success);
      setTimeout(() => navigate("/new-pw"), 2000);
    } else if (response.status === 404) {
      toast.error(translations.toast.forgotPw.errorNotFound);
    } else if (response.status === 401) {
      toast.error(translations.toast.forgotPw.errorKeyNotCorrect);
    } else {
      toast.error(translations.toast.forgotPw.errorFailed);
    }
  }

  return (
    <div className="min-h-screen dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700 rounded-full mb-4">
              <img className="h-12 w-12" src={robot} alt="robot" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Reset Password Form */}
          <form
            onSubmit={handleResetPw}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {translations.forgotPw.title}
              </h2>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm">
                  <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                    How it works:
                  </p>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                    <li>
                      • Enter the email address associated with your account
                    </li>
                    <li>• Check your inbox for a password reset email</li>
                    <li>
                      • Follow the instructions in the email to reset your
                      password
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                {translations.forgotPw.emailTitle}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  placeholder={translations.forgotPw.emailPlaceholder}
                  className="w-full pl-10 pr-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Send Email Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>{translations.forgotPw.sendEmailBtn}</span>
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
              <span>{translations.forgotPw.backToLogin}</span>
            </Link>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};
