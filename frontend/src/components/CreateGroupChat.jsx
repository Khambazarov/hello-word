import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";
import { AuthError } from "./AuthError.jsx";

export const CreateGroupChat = () => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const formRef = useRef(null);

  const { data, error } = useQuery({
    queryKey: ["userLanguage"],
    queryFn: fetchUserLanguage,
  });

  const [translations, setTranslations] = useState(getTranslations("en"));
  useEffect(() => {
    setTranslations(getTranslations(data?.language || "en"));
  }, [data?.language]);

  const createGroupMutation = useMutation({
    mutationFn: async (groupData) => {
      const response = await fetch("/api/groupchats/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        toast.dismiss();
        toast.error(
          translations?.feedback?.toast?.chat?.existChatroom
            ?.errorFailedToFind || "Failed to create group"
        );
        const error = await response.json();
        throw new Error(error.errorMessage || "Failed to create group");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Group created successfully!");
      navigate(`/chatarea/chats/${data.groupChatId}`);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsCreating(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (groupName.length > 50) {
      toast.error("Group name too long (max 50 characters)");
      return;
    }

    if (groupDescription.length > 200) {
      toast.error("Group description too long (max 200 characters)");
      return;
    }

    setIsCreating(true);
    createGroupMutation.mutate({
      groupName: groupName.trim(),
      groupDescription: groupDescription.trim(),
      initialMessage: initialMessage.trim(),
    });
  };

  if (
    (error &&
      (String(error.message || "").includes("(401)") ||
        error.status === 401)) ||
    data?.errorMessage === "User is not Authenticated"
  ) {
    return <AuthError translations={translations} />;
  }

  return (
    <div className="min-h-screen dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button */}
            <button
              onClick={() => navigate("/chatarea")}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group"
              title="Back to Chat Area"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h1 className="text-nowrap text-xl font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">
              Create Group Chat
            </h1>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-xl">
          {/* Header Section */}
          <div className="text-center my-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Group Chat
            </h1> */}
            <p className="text-balance text-gray-600 dark:text-gray-400 text-lg">
              Set up a new group and invite your friends
            </p>
          </div>

          {/* Create Group Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-4"
          >
            {/* Info Box */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
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
                  <p className="text-green-800 dark:text-green-200 font-medium mb-1">
                    Getting started:
                  </p>
                  <ul className="text-balance text-green-700 dark:text-green-300 space-y-1">
                    <li>• Choose a memorable name for your group</li>
                    <li>
                      • Add an optional description to explain the group's
                      purpose
                    </li>
                    <li>• Send a welcome message to greet new members</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Gruppenname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group Name
                <span className="text-xs text-gray-500"> (Required)</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                maxLength={50}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {groupName.length}/50
              </div>
            </div>

            {/* Gruppenbeschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group Description
                <span className="text-xs text-gray-500"> (Optional)</span>
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Describe your group..."
                maxLength={200}
                rows={2}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {groupDescription.length}/200
              </div>
            </div>

            {/* Erste Nachricht */}
            {/* Welcome Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Welcome Message
                <span className="text-xs text-gray-500"> (Optional)</span>
              </label>
              <textarea
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Write a welcome message for your group..."
                rows={3}
                className="w-full text-sm px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 dark:text-gray-400">
                <p>This message will be sent when the group is created</p>
                <div>
                  {initialMessage.length !== 0 && initialMessage.length}
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              type="submit"
              disabled={isCreating || !groupName.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isCreating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Creating Group...</span>
                </>
              ) : (
                <>
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Create Group Chat</span>
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="text-center my-4">
            <p className="text-sm text-balance text-gray-500 dark:text-gray-400">
              You'll be able to invite members and customize settings after
              creating the group.
            </p>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};
