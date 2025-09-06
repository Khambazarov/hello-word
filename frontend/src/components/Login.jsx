import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchBrowserLanguage } from "../utils/browserLanguage.js";

import robot from "../assets/robot.png";
import AppLogo from "./AppLogo.jsx";
import {
  EmailIcon,
  EyeClosedIcon,
  EyeOpenedIcon,
  PasswordIcon,
  LoginTabIcon,
  RegisterTabIcon,
} from "./_AllSVGs";

const browserLanguage = fetchBrowserLanguage();

export const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [translations, setTranslations] = useState(
    getTranslations(browserLanguage)
  );

  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value.toLowerCase().trim();
    const password = e.target.password.value.trim();

    toast.loading(translations.toast.login.waiting);

    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    toast.dismiss();

    if (response.ok && data.isVerified === true) {
      toast.success(translations.toast.login.success);
      setTimeout(() => navigate("/chatarea"), 2000);
    } else if (data.isVerified === false) {
      toast.error(translations.toast.login.errorLoginVerify);
    } else if (response.status === 404) {
      toast.error(translations.toast.login.errorUsernameOrPw);
    } else {
      toast.error(translations.toast.login.errorFailedLogin);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <AppLogo
                className="w-52 h-36 text-gray-700 dark:text-gray-300"
                showAnimation={true}
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed px-2 sm:px-0">
                Sign in to continue to Hello, Word!
              </p>
            </div>
          </div>

          {/* Modern Form Container mit Tab-Navigation */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
            {/* Sleek Tab Navigation */}
            <div className="relative">
              <div
                className="flex bg-gradient-to-r from-gray-50/90 to-gray-100/90 dark:from-gray-900/50 dark:to-gray-800/50"
                role="tablist"
              >
                <button
                  type="button"
                  onClick={() => {
                    // Nur setzen wenn nicht bereits aktiv
                    if (activeTab !== "login") {
                      setActiveTab("login");
                    }
                  }}
                  role="tab"
                  tabIndex={activeTab === "login" ? 0 : -1}
                  aria-selected={activeTab === "login"}
                  aria-controls="login-panel"
                  className={`flex-1 py-5 px-6 text-sm font-semibold transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${
                    activeTab === "login"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <div
                    className={`absolute inset-0 transition-all duration-300 ${
                      activeTab === "login"
                        ? "bg-white dark:bg-gray-800 shadow-xl"
                        : "bg-transparent group-hover:bg-white/60 dark:group-hover:bg-gray-700/50"
                    }`}
                  ></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <LoginTabIcon />
                    <span>Login</span>
                  </div>
                  {activeTab === "login" && (
                    <div className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-full"></div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    navigate("/register");
                  }}
                  role="tab"
                  tabIndex={activeTab === "register" ? 0 : -1}
                  aria-selected={activeTab === "register"}
                  aria-controls="register-panel"
                  className={`flex-1 py-5 px-6 text-sm font-semibold transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${
                    activeTab === "register"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <div
                    className={`absolute inset-0 transition-all duration-300 ${
                      activeTab === "register"
                        ? "bg-white dark:bg-gray-800 shadow-xl"
                        : "bg-transparent group-hover:bg-white/60 dark:group-hover:bg-gray-700/50"
                    }`}
                  ></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <RegisterTabIcon />
                    <span>Register</span>
                  </div>
                  {activeTab === "register" && (
                    <div className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-full"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Modern Login Form */}
            <div className="min-h-[680px] flex flex-col">
              <form
                onSubmit={handleLogin}
                className="p-6 sm:p-8 space-y-4 sm:space-y-6 flex-1"
                id="login-panel"
                role="tabpanel"
                aria-labelledby="login-tab"
              >
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {translations.login.title}
                  </h2>
                  <p className="text-balance text-gray-500 dark:text-gray-400 mt-2 text-xs sm:text-sm leading-relaxed px-1 sm:px-0">
                    Please sign in to your account to continue
                  </p>
                </div>{" "}
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {translations.login.emailTitle}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <EmailIcon />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      placeholder={translations.login.emailPlaceholder}
                      className="w-full pl-12 pr-4 py-4 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 placeholder:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/70"
                      required
                      autoFocus
                    />
                  </div>
                </div>{" "}
                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {translations.login.pwTitle}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <PasswordIcon />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      autoComplete="current-password"
                      placeholder={translations.login.pwPlaceholder}
                      minLength={6}
                      className="w-full pl-12 pr-14 py-4 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 placeholder:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/70"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:text-indigo-500 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOpenedIcon /> : <EyeClosedIcon />}
                    </button>
                  </div>
                </div>
                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-pw")}
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 text-sm hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 group"
                  >
                    <svg
                      className="w-4 h-4 mr-1 group-hover:translate-x-0.5 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    {translations.login.forgotPw}
                  </button>
                </div>{" "}
                {/* Login Button */}
                <div className="pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900 group"
                  >
                    <svg
                      className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>{translations.login.loginBtn}</span>
                  </button>
                </div>
              </form>

              {/* Additional Action - Email Verification Only */}
              <div className="px-6 sm:px-8 pb-6">
                <Link
                  to="/register/verify"
                  className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5 mr-2 group-hover:scale-110 transition-transform duration-300"
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
                  <span className="relative text-xs sm:text-sm text-nowrap">
                    {translations.login.notYetVerified}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};
