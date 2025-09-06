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
  UserIcon,
  LoginTabIcon,
  RegisterTabIcon,
} from "./_AllSVGs";

const browserLanguage = fetchBrowserLanguage();

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("register");
  const [formErrors, setFormErrors] = useState({});
  const [translations, setTranslations] = useState(
    getTranslations(browserLanguage)
  );

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...formErrors };

    switch (name) {
      case "email":
        if (!value) {
          errors.email = "Email address is required";
        } else if (!value.includes("@") || !value.includes(".")) {
          errors.email = "Please enter a valid email address";
        } else {
          delete errors.email;
        }
        break;
      case "username":
        if (!value) {
          errors.username = "Username is required";
        } else if (value.length < 2) {
          errors.username = "Username must be at least 2 characters";
        } else if (value.length > 20) {
          errors.username = "Username cannot exceed 20 characters";
        } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          errors.username =
            "Username can only contain letters, numbers, hyphens, and underscores";
        } else {
          delete errors.username;
        }
        break;
      case "password":
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 6) {
          errors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.password =
            "Password must contain at least one lowercase letter";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          errors.password =
            "Password must contain at least one uppercase letter";
        } else if (!/(?=.*\d)/.test(value)) {
          errors.password = "Password must contain at least one number";
        } else {
          delete errors.password;
        }
        break;
    }

    setFormErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  async function handleRegister(e) {
    e.preventDefault();
    const email = e.target.email.value.toLowerCase().trim();
    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();

    toast.loading("Waiting...");

    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        password,
        language: browserLanguage,
      }),
    });

    toast.dismiss();

    if (response.ok) {
      await response.json();
      toast.success(translations.toast.register.success);
      setTimeout(() => navigate("/register/verify"), 2000);
    } else if (response.status === 409) {
      toast.error(translations.toast.register.errorAlreadyTaken);
    } else {
      toast.error(translations.toast.register.errorServer);
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
                Join Hello, Word!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed px-2 sm:px-0">
                Create your account and start connecting with friends
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
                    setActiveTab("login");
                    navigate("/");
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
                    // Nur setzen wenn nicht bereits aktiv
                    if (activeTab !== "register") {
                      setActiveTab("register");
                    }
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

            {/* Modern Register Form */}
            <div className="min-h-[680px] flex flex-col">
              <form
                onSubmit={handleRegister}
                className="p-6 sm:p-8 space-y-4 sm:space-y-6 flex-1"
                id="register-panel"
                role="tabpanel"
                aria-labelledby="register-tab"
              >
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {translations.register.title}
                  </h2>
                  <p className="text-balance text-gray-500 dark:text-gray-400 mt-2 text-xs sm:text-sm leading-relaxed px-1 sm:px-0">
                    Fill out the form below to create your account
                  </p>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {translations.register.emailTitle}
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
                      placeholder={translations.register.emailPlaceholder}
                      className={`w-full pl-12 pr-4 py-4 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-gray-400 ${
                        formErrors.email
                          ? "border-red-300 dark:border-red-600 focus:ring-red-100 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-600 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/70"
                      }`}
                      required
                      autoFocus
                      onChange={handleInputChange}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-500 text-xs flex items-center mt-2">
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {translations.register.usernameTitle}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="username"
                      placeholder={translations.register.usernamePlaceholder}
                      minLength={2}
                      maxLength={20}
                      className={`w-full pl-12 pr-4 py-4 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-gray-400 ${
                        formErrors.username
                          ? "border-red-300 dark:border-red-600 focus:ring-red-100 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-600 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/70"
                      }`}
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  {formErrors.username ? (
                    <p className="text-red-500 text-xs flex items-center mt-2">
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formErrors.username}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start sm:items-center">
                      <svg
                        className="w-3 h-3 mr-1 mt-0.5 sm:mt-0 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 00-2 0v4a1 1 0 102 0V6zM9 16a1 1 0 112 0 1 1 0 01-2 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="leading-relaxed">
                        Choose a username with 2-20 characters (letters,
                        numbers, -, _)
                      </span>
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {translations.register.pwTitle}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <PasswordIcon />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      autoComplete="new-password"
                      placeholder={translations.register.pwPlaceholder}
                      minLength={6}
                      className={`w-full pl-12 pr-14 py-4 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-gray-400 ${
                        formErrors.password
                          ? "border-red-300 dark:border-red-600 focus:ring-red-100 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-600 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/70"
                      }`}
                      required
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200 focus:outline-none focus:text-indigo-500"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOpenedIcon /> : <EyeClosedIcon />}
                    </button>
                  </div>
                  {formErrors.password ? (
                    <p className="text-red-500 text-xs flex items-center mt-2">
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formErrors.password}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start sm:items-center">
                      <svg
                        className="w-3 h-3 mr-1 mt-0.5 sm:mt-0 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="leading-relaxed">
                        At least 6 characters with uppercase, lowercase, and
                        numbers
                      </span>
                    </p>
                  )}
                </div>

                {/* Privacy Policy Checkbox */}
                <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-xl p-4 sm:p-5">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        type="checkbox"
                        id="privacy-policy"
                        required
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                      />
                    </div>
                    <div className="text-xs sm:text-sm">
                      <label
                        htmlFor="privacy-policy"
                        className="text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed"
                      >
                        {translations.register.haveRead}{" "}
                        <Link
                          to="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium underline decoration-indigo-300 hover:decoration-indigo-500 transition-colors"
                        >
                          {translations.register.privacy}
                        </Link>{" "}
                        {translations.register.onlyGermanPrivacy}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <div className="pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900 group"
                    disabled={Object.keys(formErrors).length > 0}
                  >
                    <svg
                      className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{translations.register.submitBtn}</span>
                  </button>
                  {Object.keys(formErrors).length > 0 && (
                    <p className="text-xs text-red-500 text-center mt-2 flex items-center justify-center px-2">
                      <svg
                        className="w-3 h-3 mr-1 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Please fix the errors above to continue</span>
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Additional Action - Back to Login */}
            {/* <div className="px-8 pb-6">
              <Link
                to="/"
                className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white w-full px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <svg
                  className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300"
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
                <span className="relative">
                  {translations.register.alreadyRegistered}
                </span>
              </Link>
            </div> */}
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};
