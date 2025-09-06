import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { fetchUserLanguage, updateUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";

import robot from "../assets/robot.png";
import {
  BackButtonIcon,
  EyeClosedIcon,
  EyeOpenedIcon,
  PasswordIcon,
  UkFlag,
  GermanFlag,
} from "./_AllSVGs";

export const Settings = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [volume, setVolume] = useState(null);
  const queryClient = useQueryClient();

  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState(getTranslations("en"));

  function changePassword(e) {
    e.preventDefault();
    const oldPassword = e.target.oldPassword.value.trim();
    const newPassword = e.target.newPassword.value.trim();
    newPasswordMutation.mutate({ oldPassword, newPassword });
    e.target.oldPassword.value = "";
    e.target.newPassword.value = "";
  }

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: fetchUserLanguage,
    onSuccess: (data) => {
      setVolume(data.volume || "middle");
      setLanguage(data.language || "en");
      setTranslations(getTranslations(data.language || "en"));
    },
  });

  useEffect(() => {
    if (userSettings && userSettings.volume) {
      setVolume(userSettings.volume);
    }
  }, [userSettings]);

  useEffect(() => {
    if (userSettings && userSettings.language) {
      setLanguage(userSettings.language);
    }
  }, [userSettings]);

  useEffect(() => {
    if (language) {
      const loadedTranslations = getTranslations(language);
      setTranslations(loadedTranslations);
    }
  }, [language]);

  const handleAudioVolume = useMutation({
    mutationFn: async (newVolume) => {
      const response = await fetch(`/api/users/volume`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ volume: newVolume }),
      });
      if (!response.ok) throw new Error("Failed to change volume.");
      return response.json();
    },
    onSuccess: (data) => {
      setVolume(data.volume || "middle");
      toast.success(translations.toast.settings.successUpdate);
      queryClient.invalidateQueries(["userSettings"]);
    },
    onError: () => {
      toast.error(translations.toast.settings.errorFailedChange);
    },
  });

  const handleVolumeChange = (newVolume) => {
    handleAudioVolume.mutate(newVolume);
  };

  const handleLanguageChange = useMutation({
    mutationFn: updateUserLanguage,
    onSuccess: (data) => {
      setLanguage(data.language || "en");
      setTranslations(getTranslations(data.language || "en"));
      queryClient.invalidateQueries(["userSettings"]);
      toast.success(
        getTranslations(data.language || "en").toast.settings.successUpdate
      );
    },
    onError: (data) => {
      toast.error(
        getTranslations(data.language || "en").toast.settings.errorFailedChange
      );
    },
  });

  const handleLanguageSelection = (newLanguage) => {
    handleLanguageChange.mutate(newLanguage);
  };

  const newPasswordMutation = useMutation({
    mutationFn: async ({ oldPassword, newPassword }) => {
      const response = await fetch(`/api/users/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!response.ok) throw new Error("Failed to change password.");
      return response.json();
    },
    onSuccess: () => {
      toast.success(translations.toast.settings.successUpdate);
    },
    onError: () => {
      toast.error(translations.toast.settings.errorFailedChange);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/delete`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete account");
      return response.json();
    },
    onSuccess: () => {
      toast.success(translations.toast.settings.successAccountDelete);
      setShow(false);
      navigate("/");
    },
    onError: () => {
      toast.error(translations.toast.settings.errorAccountDelete);
    },
  });

  if (
    isLoading ||
    volume === null ||
    language === null ||
    translations === null
  ) {
    return (
      <div className="min-h-svh flex flex-col dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
        <header className="xl:h-25 z-10 h-16 flex justify-center items-center pl-2 sticky top-0 bg-gray-700">
          <h1 className="flex text-white items-center tracking-widest text-sm md:text-base xl:text-3xl">
            Hello, Word!
          </h1>
          <img
            className="h-12 absolute left-1/2 transform -translate-x-1/2 xl:h-16"
            src={robot}
            alt="robot"
          />
          <button
            onClick={() => navigate("/chatarea")}
            className="cursor-pointer absolute right-4"
          >
            <BackButtonIcon />
          </button>
        </header>
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {translations.settings.loadingSettings || "Loading settings..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-center items-center sticky top-0 bg-gray-700 shadow-md">
        <h1 className="md:text-base xl:text-2xl text-white tracking-widest font-bold">
          Settings
        </h1>
        <button
          onClick={() => navigate("/chatarea")}
          className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
          title="Back to Chat"
        >
          <BackButtonIcon />
        </button>
      </header>

      <div className="flex flex-col items-center p-6 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {/* {translations.settings.selectLangTitle || "Settings"} */}
          </h1>
          <p className="text-balance text-gray-600 dark:text-gray-400">
            Customize your experience with language, audio, and security
            preferences
          </p>
        </div>

        <div className="w-full grid gap-6 md:grid-cols-2">
          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-3">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {translations.settings.selectLangTitle || "Language Settings"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your preferred language
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={language === "en"}
                  onChange={(e) => handleLanguageSelection(e.target.value)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2"
                />
                <div className="ml-3 flex items-center gap-3">
                  <UkFlag />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {translations.settings.lang.en}
                  </span>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="de"
                  checked={language === "de"}
                  onChange={(e) => handleLanguageSelection(e.target.value)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2"
                />
                <div className="ml-3 flex items-center gap-3">
                  <GermanFlag />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {translations.settings.lang.de}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Volume Settings */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.168 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.168l4.215-3.824zm2.344 2.443a1 1 0 011.273-.983 6.002 6.002 0 010 10.928 1 1 0 11-.95-1.764 4.002 4.002 0 000-7.404 1 1 0 01-.323-1.777z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {translations.settings.volumeTitle}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set notification sound volume
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "silent",
                  icon: "🔇",
                  label: translations.settings.volume.silent,
                },
                {
                  value: "middle",
                  icon: "🔉",
                  label: translations.settings.volume.middle,
                },
                {
                  value: "full",
                  icon: "🔊",
                  label: translations.settings.volume.loud,
                },
              ].map((vol) => (
                <label
                  key={vol.value}
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="audioVolume"
                    value={vol.value}
                    checked={volume === vol.value}
                    onChange={(e) => handleVolumeChange(e.target.value)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                  />
                  <div className="ml-3 flex items-center gap-3">
                    <span className="text-xl">{vol.icon}</span>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                      {vol.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="w-full mt-8 grid gap-6 md:grid-cols-2">
          {/* Password Change */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-3">
                <svg
                  className="w-6 h-6 text-orange-600 dark:text-orange-400"
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
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {translations.settings.changePwTitle}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your account password
              </p>
            </div>

            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label
                  htmlFor="oldPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {translations.settings.currentPwTitle}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <PasswordIcon />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="oldPassword"
                    id="oldPassword"
                    autoComplete="current-password"
                    placeholder={translations.settings.currentPwPlaceholder}
                    minLength={6}
                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOpenedIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {translations.settings.newPwTitle}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <PasswordIcon />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    autoComplete="new-password"
                    placeholder={translations.settings.newPwPlaceholder}
                    minLength={6}
                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOpenedIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{translations.settings.changePwBtn}</span>
              </button>
            </form>
          </div>

          {/* Account Deletion */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-red-200 dark:border-red-700 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mb-3">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                {translations.settings.deleteAccountTitle}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm">
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    Warning!
                  </p>
                  <p className="text-red-700 dark:text-red-300 mt-1">
                    This action cannot be undone. All your chats, messages, and
                    account data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShow(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>{translations.settings.deleteBtn}</span>
            </button>
          </div>
        </div>

        <Toaster position="bottom-center" />
      </div>

      {/* Confirmation Modal */}
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.863-.833-2.634 0L3.5 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {translations.settings.prompt.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShow(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  {translations.settings.prompt.cancelBtn}
                </button>
                <button
                  onClick={() => deleteAccountMutation.mutate()}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  {translations.settings.prompt.deleteBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
