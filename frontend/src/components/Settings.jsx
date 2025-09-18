import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { fetchUserLanguage, updateUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";

import robot from "../assets/robot.png";
import {
  PasswordIcon,
  UkFlag,
  GermanFlag,
  TrashIcon,
  SettingsIcon,
  LanguageIcon,
  AudioVolumeIcon,
  WarningIcon,
  RussianFlag,
} from "./_AllSVGs";

import {
  BackBtnHeader,
  BackToChatBtn,
  ChangePasswordBtn,
  DeleteAccountBtn,
  EyeToggleIcon,
} from "./_Buttons.jsx";
import { PasswordInput, RadioInput } from "./_Inputs.jsx";
import { AuthError } from "./AuthError.jsx";

export const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // UI & form state
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // settings state
  const [volume, setVolume] = useState("middle");
  const [language, setLanguage] = useState("en");

  const translations = useMemo(() => getTranslations(language), [language]);

  // --- Query: initial settings --------------
  const {
    data: userSettings,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["userSettings"],
    queryFn: fetchUserLanguage,
    staleTime: 60 * 1000, // 1 minute
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    onError: () => {
      const t = getTranslations("en");
      toast.error(
        t.feedback.toast.settings.errorFailedLoad ?? "Failed to load settings."
      );
    },
  });

  useEffect(() => {
    if (!userSettings) return;
    setVolume(userSettings.volume ?? "middle");
    setLanguage(userSettings.language ?? "en");
  }, [userSettings]);

  // --- Mutations ---------------------------
  // --- Volume ---------------------------
  const mVolume = useMutation({
    mutationFn: async (newVolume) => {
      const response = await fetch(`/api/users/volume`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ volume: newVolume }),
      });
      if (!response.ok) throw new Error("Failed to change volume.");
      return response.json();
    },
    onSuccess: (data, variables) => {
      const nextVolume = data?.volume ?? variables;
      setVolume(nextVolume);

      const t = getTranslations(language);
      toast.success(
        t.feedback.toast.settings.successUpdate ?? "Updated successfully!"
      );
      queryClient.setQueryData(["userSettings"], (prev) => ({
        ...(prev ?? {}),
        volume: nextVolume,
      }));
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: () => {
      const t = getTranslations(language);
      toast.error(
        t.feedback.toast.settings.errorFailedChange ?? "Update failed."
      );
    },
  });

  function handleVolumeChange(newVolume) {
    mVolume.mutate(newVolume);
  }

  // --- Language ---------------------------
  const mLanguage = useMutation({
    mutationFn: updateUserLanguage,

    onSuccess: (data, variables) => {
      const candidate =
        data?.language ??
        (typeof variables === "string" ? variables : variables?.language);
      const newLang = candidate ?? language;

      setLanguage(newLang);
      const t = getTranslations(newLang);
      toast.success(
        t.feedback.toast.settings.successUpdate ?? "Updated successfully!"
      );
      queryClient.setQueryData(["userSettings"], (prev) => ({
        ...(prev ?? {}),
        language: newLang,
      }));

      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: () => {
      const t = getTranslations(language);
      toast.error(
        t.feedback.toast.settings.errorFailedChange ?? "Update failed."
      );
    },
  });

  function handleLanguageSelection(newLanguage) {
    mLanguage.mutate(newLanguage);
  }

  // --- Password ---------------------------
  const mPassword = useMutation({
    mutationFn: async ({ oldPassword, newPassword }) => {
      const response = await fetch(`/api/users/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!response.ok) throw new Error("Failed to change password.");
      return response.json();
    },
    onSuccess: () => {
      const t = getTranslations(language);
      toast.success(
        t.feedback.toast.settings.successUpdate ?? "Updated successfully!"
      );
      setCurrentPassword("");
      setNewPassword("");
      setShowPassword(false);
    },
    onError: () => {
      const t = getTranslations(language);
      toast.error(
        t.feedback.toast.settings.errorFailedChange ?? "Update failed."
      );
    },
  });

  // --- Account Deletion ---------------------------
  const mDeleteAccount = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/delete`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete account");
      return response.json();
    },
    onSuccess: () => {
      const t = getTranslations(language);
      toast.success(
        t.feedback.toast.settings.successAccountDelete ??
          "Account deleted successfully!"
      );
      setShowConfirm(false);
      navigate("/");
    },
    onError: () => {
      const t = getTranslations(language);
      toast.error(
        t.feedback.toast.settings.errorAccountDelete ??
          "Account deletion failed."
      );
    },
  });

  // --- Handlers ---------------------------
  function changePassword(e) {
    e.preventDefault();
    const oldPassword = currentPassword.trim();
    const nextPassword = newPassword.trim();

    if (nextPassword.length < 6) {
      toast.error(
        translations.feedback.toast.settings.errorInvalidPassword ??
          "Password is too short (6+ characters)."
      );
      return;
    }

    mPassword.mutate({ oldPassword, newPassword: nextPassword });
  }

  // --- Loading ---------------------------
  if (isLoading) {
    return (
      <div className="min-h-svh flex flex-col dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center h-16 px-1 max-w-4xl mx-auto">
            {/* Avatar links */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                  <img
                    className="w-full h-full object-cover"
                    src={robot}
                    alt="Settings Avatar"
                  />
                </div>
              </div>
            </div>
            {/* Titel mittig */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight text-center">
                {translations.content?.settings?.title ?? "Settings"}
              </h1>
            </div>
            {/* Buttons rechts */}
            <div className="flex items-center space-x-0 flex-1 justify-end">
              <BackBtnHeader />
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {translations?.content?.settings?.loadingSettings ??
              "Loading settings..."}
          </p>
        </div>
      </div>
    );
  }

  if (
    (error &&
      (String(error.message || "").includes("(401)") ||
        error.status === 401)) ||
    userSettings?.errorMessage === "User is not Authenticated"
  ) {
    return <AuthError translations={translations} />;
  }

  // --- Main Render ---------------------------
  return (
    <div className="min-h-screen dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center h-16 px-1 max-w-4xl mx-auto">
          {/* Avatar links */}
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                <img
                  className="w-full h-full object-cover"
                  src={robot}
                  alt="Settings Avatar"
                />
              </div>
            </div>
          </div>
          {/* Titel mittig */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight text-center">
              {translations?.content?.settings?.title ?? "Settings"}
            </h1>
          </div>
          {/* Buttons rechts */}
          <div className="flex items-center space-x-0 flex-1 justify-end">
            <BackBtnHeader />
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center p-6 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          {/* <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2"></h1> */}
          <p className="text-balance text-gray-600 dark:text-gray-400">
            {translations?.content?.settings?.description ??
              "Set up your preferences and manage your account with ease."}
          </p>
        </div>

        <div className="w-full grid gap-6 md:grid-cols-2">
          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-3">
                <LanguageIcon className="text-purple-600 dark:text-purple-400" />
              </div>

              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {translations?.content?.settings?.selectLangTitle ??
                  "Language Settings"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {translations?.content?.settings?.selectLangDescription ??
                  "Choose your preferred language for the app interface."}
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <RadioInput
                  name="language"
                  value="en"
                  checked={language === "en"}
                  onChange={handleLanguageSelection}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div className="ml-3 flex items-center gap-3">
                  <UkFlag />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {translations?.content?.settings?.lang?.en ?? "EN"}
                  </span>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <RadioInput
                  name="language"
                  value="de"
                  checked={language === "de"}
                  onChange={handleLanguageSelection}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div className="ml-3 flex items-center gap-3">
                  <GermanFlag />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {translations?.content?.settings?.lang?.de ?? "DE"}
                  </span>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <RadioInput
                  name="language"
                  value="ru"
                  checked={language === "ru"}
                  onChange={handleLanguageSelection}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div className="ml-3 flex items-center gap-3">
                  <RussianFlag />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {translations?.content?.settings?.lang?.ru ?? "RU"}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Volume Settings */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
                <AudioVolumeIcon />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {translations?.content?.settings?.volumeTitle ??
                  "Select Audio Volume"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {translations?.content?.settings?.adjustVolume ??
                  "Adjust the volume for notification sounds."}
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "silent",
                  icon: "🔇",
                  label:
                    translations?.content?.settings?.volume?.silent ?? "Silent",
                },
                {
                  value: "middle",
                  icon: "🔉",
                  label:
                    translations?.content?.settings?.volume?.middle ?? "Normal",
                },
                {
                  value: "full",
                  icon: "🔊",
                  label:
                    translations?.content?.settings?.volume?.loud ?? "Loud",
                },
              ].map((vol) => (
                <label
                  key={vol.value}
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <RadioInput
                    name="audioVolume"
                    value={vol.value}
                    checked={volume === vol.value}
                    onChange={handleVolumeChange}
                    className="text-green-600 focus:ring-green-500"
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
        <div className="w-full mt-8 grid gap-6 md:grid-cols-2 items-stretch">
          {/* Password Change */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-3">
                <PasswordIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {translations?.content?.settings?.changePwTitle ??
                  "Change Password"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {translations?.content?.settings?.changePwDescription ??
                  "6+ characters, incl. uppercase, lowercase & numbers"}
              </p>
            </div>

            <form
              onSubmit={changePassword}
              className="space-y-4 flex flex-col flex-1"
            >
              <div>
                <label
                  htmlFor="oldPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {translations?.content?.settings?.currentPwTitle ??
                    "Current Password"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <PasswordIcon />
                  </div>
                  <PasswordInput
                    type={showPassword ? "text" : "password"}
                    name="oldPassword"
                    id="oldPassword"
                    autoComplete="current-password"
                    placeholder={
                      translations?.content?.settings?.currentPwPlaceholder ??
                      "Current Password"
                    }
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    minLength={6}
                    required
                  />
                  <EyeToggleIcon
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    toggled={showPassword}
                    onToggle={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {translations?.content?.settings?.newPwTitle ??
                    "New Password"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <PasswordIcon />
                  </div>
                  <PasswordInput
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    autoComplete="new-password"
                    placeholder={
                      translations?.content?.settings?.newPwPlaceholder ??
                      "Strong Password"
                    }
                    value={newPassword}
                    onChange={setNewPassword}
                    minLength={6}
                    required
                  />
                  <EyeToggleIcon
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    toggled={showPassword}
                    onToggle={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  />
                </div>
              </div>

              <ChangePasswordBtn disabled={mPassword.isPending}>
                {mPassword.isPending
                  ? (translations?.content?.saving ?? "Saving...") // .saving
                  : (translations?.content?.settings?.changePwBtn ??
                    "Change Password")}
              </ChangePasswordBtn>
            </form>
          </div>

          {/* Account Deletion */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-red-200 dark:border-red-700 p-6 flex flex-col h-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mb-3">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                {translations?.content?.settings?.deleteAccountTitle ??
                  "Delete Account"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {translations?.content?.settings?.deleteAccountDescription ??
                  "Permanently delete your account and all associated data."}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3 py-4">
                <WarningIcon className="w-8 h-8 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />

                <div className="text-sm">
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    {translations?.content?.settings?.warningTitle ??
                      "Warning!"}
                  </p>
                  <p className="text-red-700 dark:text-red-300 mt-1">
                    {translations?.content?.settings?.warningDescription ??
                      "This action cannot be undone. All your chats, messages, and account data will be permanently deleted."}
                  </p>
                </div>
              </div>
            </div>

            <DeleteAccountBtn
              onClick={() => setShowConfirm(true)}
              disabled={mDeleteAccount.isPending}
            >
              {translations?.content?.settings?.deleteBtn ?? "Delete Account"}
            </DeleteAccountBtn>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center mt-8 pt-6 border-t w-full border-gray-200 dark:border-gray-600">
          <BackToChatBtn>
            {translations?.content?.profile?.backToChat ?? "Back to Chat"}
          </BackToChatBtn>
        </div>

        <Toaster position="bottom-center" />
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <WarningIcon className="w-16 h-16 text-red-600 dark:text-red-400 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {translations?.content?.settings?.prompt?.title ??
                  "Delete Account?"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {translations?.content?.settings?.prompt?.description ??
                  "Are you sure you want to delete your account? This action cannot be undone."}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors     focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                  autoFocus
                >
                  {translations?.content?.settings?.prompt?.cancelBtn ??
                    "Cancel"}
                </button>
                <button
                  onClick={() => mDeleteAccount.mutate()}
                  disabled={mDeleteAccount.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  {translations?.content?.settings?.prompt?.deleteBtn ??
                    "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
