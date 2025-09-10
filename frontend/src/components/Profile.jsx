import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";
import { formatTimestamp } from "../utils/formatTimestamp";

import robot from "../assets/robot.png";
import { BackButtonIcon } from "./_AllSVGs";

export const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchUserLanguage,
  });

  const [language, setLanguage] = useState(data?.language || "en");
  const [translations, setTranslations] = useState(
    getTranslations(data?.language || "en")
  );

  useEffect(() => {
    if (data?.language) {
      setLanguage(data.language);
      setTranslations(getTranslations(data.language));
    }
  }, [data]);

  const uploadAvatarMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch("/api/upload/user-avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload avatar");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully!");
      // LÖSUNG: Alle relevanten Queries invalidieren + Daten refetchen
      queryClient.invalidateQueries(["profile"]);
      queryClient.invalidateQueries(["chatrooms"]); // Chatroom-Liste
      queryClient.invalidateQueries({ queryKey: ["chatroom"] }); // Alle Chatroom-Details
      queryClient.invalidateQueries({ queryKey: ["groupMembers"] }); // Alle Gruppenmitglieder
      queryClient.invalidateQueries({ queryKey: ["userInfo"] }); // Benutzerinformationen für NewChatroom

      // NEU: Auch alle möglichen Cache-Keys invalidieren
      queryClient.invalidateQueries(); // Invalidiert ALLE Queries

      // Force refetch für aktuelle Queries
      queryClient.refetchQueries(["profile"]);
      queryClient.refetchQueries(["chatrooms"]);

      // NEU: Force refetch für alle aktiven Queries
      queryClient.refetchQueries();

      // NUCLEAR OPTION: Seite nach kurzer Verzögerung neu laden
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      uploadAvatarMutation.mutate(formData);
    }
  };

  const username = data?.username;
  const usermail = data?.usermail;
  const dateOfRegistration = data?.dateOfRegistration;

  const userRegisteredAt = dateOfRegistration
    ? formatTimestamp(dateOfRegistration, language)
    : translations.content.profile.dateNotAvailable || "Date not available";

  if (isProfileLoading) {
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
                    src={
                      data?.avatar ||
                      (username ? `https://robohash.org/${username}` : robot)
                    }
                    alt="User Avatar"
                  />
                </div>
              </div>
            </div>
            {/* Titel mittig */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight text-center">
                {translations.content.profile.title || "My Profile"}
              </h1>
            </div>
            {/* Buttons rechts */}
            <div className="flex items-center space-x-0 flex-1 justify-end">
              <button
                onClick={() => navigate("/settings")}
                className="p-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Account Settings"
              >
                {/* Settings-Icon */}
                {/* ...SVG... */}
              </button>
              <button
                onClick={() => navigate("/chatarea")}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Back to Chats"
              >
                <BackButtonIcon />
              </button>
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {translations.content.profile.loading || "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

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
                  src={
                    data?.avatar ||
                    (username ? `https://robohash.org/${username}` : robot)
                  }
                  alt="User Avatar"
                />
              </div>
            </div>
          </div>
          {/* Titel mittig */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight text-center">
              {translations.content.profile.title || "My Profile"}
            </h1>
          </div>
          {/* Buttons rechts */}
          <div className="flex items-center space-x-0 flex-1 justify-end">
            <button
              onClick={() => navigate("/chatarea")}
              className="p-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Back to Chats"
            >
              <BackButtonIcon />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center p-6 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="text-balance text-gray-600 dark:text-gray-400">
            {translations.content.profile.description ||
              "Manage your personal information and account settings"}
          </p>
        </div>
        {/* Profile Card */}
        <div className="w-full max-w-3xl">
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            {/* Info Box */}
            <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg">
              <div className="flex flex-col items-center gap-3 text-indigo-700 dark:text-indigo-300">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-balance font-medium text-sm">
                  •{" "}
                  {translations.content.profile.infoText ||
                    "Click the camera icon to update your avatar"}
                </p>
                <p className="text-balance font-medium text-sm">
                  •{" "}
                  {translations.content.profile.format ||
                    "Allowed formats: JPG, PNG and GIF (max. 5MB)"}
                </p>
              </div>
            </div>

            <div className="text-center">
              {/* Avatar Section */}
              <div className="relative mx-auto mb-8 w-fit">
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-1 shadow-2xl">
                  <img
                    src={
                      data?.avatar ||
                      (username ? `https://robohash.org/${username}` : robot)
                    }
                    alt="User Avatar"
                    className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-800"
                  />
                  <label className="absolute bottom-2 right-2 bg-indigo-600 text-white rounded-full p-3 cursor-pointer hover:bg-indigo-700 shadow-lg transition-all duration-200 hover:scale-105">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadAvatarMutation.isPending}
                    />
                    {uploadAvatarMutation.isPending ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
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
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </label>
                </div>
              </div>

              {/* User Information */}
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                {/* Username Card */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {translations.content.profile.username || "Username"}
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white break-all">
                    {username || "failed_to_load username"}
                  </p>
                </div>

                {/* Email Card */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
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
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {translations.content.profile.email || "Email"}
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white break-all">
                    {usermail || "Failed to load email"}
                  </p>
                </div>

                {/* Registration Date Card */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {translations.content.profile.registered || "Member Since"}
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {userRegisteredAt || "failed to load date"}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => navigate("/chatarea")}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {translations.content.profile.backToChat || "Back to Chat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};
