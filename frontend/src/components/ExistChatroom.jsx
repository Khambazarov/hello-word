import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";
import { BackButtonIcon, UserIcon } from "./_AllSVGs";
import { AuthError } from "./AuthError.jsx";

export const ExistChatroom = (e) => {
  const navigate = useNavigate();
  const partnerNameRef = useRef(null);
  const [username, setUsername] = useState("");

  const { data, error, isLoading } = useQuery({
    queryKey: ["existChatroom"],
    queryFn: fetchUserLanguage,
  });

  const [translations, setTranslations] = useState(getTranslations("en"));
  useEffect(() => {
    setTranslations(getTranslations(data?.language || "en"));
  }, [data?.language]);

  const existChatroomMutation = useMutation({
    mutationFn: async (username) => {
      const response = await fetch(`/api/chatrooms/exist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.status === 404) {
        toast.dismiss();
        toast.error(
          translations.feedback.toast.chat.existChatroom.errorUserNotFound ||
            "User not found. Please check the username and try again."
        );
        throw new Error("Failed to create chatroom");
      }

      if (response.status === 401) {
        toast.dismiss();
        toast.error(
          translations.feedback.toast.chat.existChatroom.errorSearchYourself
        );
        throw new Error("Failed to create chatroom");
      }

      if (!response.ok) {
        toast.dismiss();
        toast.error(
          translations.feedback.toast.chat.existChatroom.errorFailedToFind
        );
        throw new Error("Failed to create chatroom");
      }
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      if (data.chatroom !== "new-chatroom") {
        navigate(`/chatarea/chats/${data.chatroom}`);
        toast.dismiss();
        toast.success(
          `${translations.feedback.toast.chat.existChatroom.alreadyChatted} ${partnerNameRef.current.value}`
        );
        return;
      } else {
        navigate(`/chatarea/chats/new-chatroom/${data.partnerName}`);
        return;
      }
    },
    onError: (error) => {
      console.error("Failed to create chatroom", error);
    },
  });

  function handleExistChatroom(e) {
    e.preventDefault();
    const username = e.target.username.value.trim();
    if (username === "") {
      toast.dismiss();
      toast.error(
        translations.feedback.toast.chat.existChatroom.errorNameRequired
      );
      return;
    }
    existChatroomMutation.mutate(username);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {translations.chat.existing.loading || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (
      (error &&
        (String(error.message || "").includes("(401)") ||
          error.status === 401)) ||
      data?.errorMessage === "User is not Authenticated"
    ) {
      return <AuthError translations={translations} />;
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button */}
            <button
              onClick={() => navigate("/chatarea")}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group"
              title={translations.ui.buttons.backToChatroom || "Back to Chats"}
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

            <h1 className="font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">
              {translations?.chat?.existing?.title ?? "Start New Chat"}
            </h1>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-6">
        <div className="w-full max-w-xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {translations?.chat?.existing?.subtitle ??
                "Connect with friends by searching their username"}
            </p>
          </div>

          {/* Main Form */}
          <form
            onSubmit={handleExistChatroom}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-6"
          >
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
                    {translations?.chat?.existing?.howItWorksTitle ??
                      "How it works:"}
                  </p>
                  <ul className="text-balance text-blue-700 dark:text-blue-300 space-y-1">
                    <li>
                      •{" "}
                      {translations?.chat?.existing?.step1 ??
                        "Enter the exact username of the person you want to chat with"}
                    </li>
                    <li>
                      •{" "}
                      {translations?.chat?.existing?.step2 ??
                        "If you've chatted before, you'll go to your existing conversation"}
                    </li>
                    <li>
                      •{" "}
                      {translations?.chat?.existing?.step3 ??
                        "If you already have a chat with this user, you will be redirected to it"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {`${translations?.chat?.existing?.searchUserTitle ?? "Search by Username"} `}
                <span className="text-xs text-gray-500">
                  ({translations?.ui?.forms?.required ?? "(required)"})
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder={
                    translations?.chat?.existing?.placeholder ??
                    "e.g., John.Doe"
                  }
                  autoComplete="off"
                  spellCheck="false"
                  autoCapitalize="none"
                  autoCorrect="off"
                  minLength={2}
                  maxLength={30}
                  className="w-full pl-10 pr-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  autoFocus
                  ref={partnerNameRef}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {translations?.chat?.existing?.placeholderHelpText ??
                  "Make sure to enter the exact username."}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                existChatroomMutation.isLoading || username.trim().length < 2
              }
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              {existChatroomMutation.isLoading ? (
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
                  <span>Searching...</span>
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>
                    {translations?.chat?.existing?.createChatroomBtn ??
                      "Start Chat"}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="text-center my-4">
            <p className="text-sm text-balance text-gray-500 dark:text-gray-400">
              {translations?.chat?.existing?.needHelpText ??
                "Need help? Make sure you have the correct username spelling."}
            </p>
          </div>
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
  );
};
