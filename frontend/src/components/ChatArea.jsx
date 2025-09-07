import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import socketManager from "../utils/socketManager.js";

import { cn } from "../utils/cn.js";
import { fetchUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";

import robot from "../assets/robot.png";
import notification from "../assets/positive-notification.wav";
import { formatTimestamp } from "../utils/formatTimestamp.js";
import { truncateText } from "../utils/truncateText.js";

export const ChatArea = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [maxLength, setMaxLength] = useState(20);
  const audioReceiveRef = useRef(null);

  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState(getTranslations("en"));

  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        const userData = await fetchUserLanguage();
        const userLanguage = userData.language || "en";
        setLanguage(userLanguage);
        setTranslations(getTranslations(userLanguage));
      } catch (error) {
        console.error("Failed to fetch user language:", error);
      }
    };

    loadUserLanguage();
  }, []);

  const {
    data: chatroomsData,
    error: chatroomsError,
    isLoading,
  } = useQuery({
    queryKey: ["chatrooms"],
    queryFn: async () => {
      const response = await fetch("/api/chatrooms/chats", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chatrooms");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["chatrooms"], data);
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const volume = chatroomsData?.volume || "middle";

  useEffect(() => {
    if (!audioReceiveRef.current) {
      audioReceiveRef.current = new Audio(notification);
    }
    audioReceiveRef.current.volume =
      volume === "silent" ? 0 : volume === "middle" ? 0.5 : 1;

    const initializeAudio = () => {
      window.removeEventListener("click", initializeAudio);
      window.removeEventListener("touchstart", initializeAudio);
    };

    window.addEventListener("click", initializeAudio);
    window.addEventListener("touchstart", initializeAudio);

    return () => {
      window.removeEventListener("click", initializeAudio);
      window.removeEventListener("touchstart", initializeAudio);
    };
  }, [volume]);

  window.scrollTo(0, 0);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
      return response.json();
    },
    onSuccess: () => {
      navigate("/");
    },
    onError: (error) => {
      console.error("Failed to logout", error);
    },
  });

  useEffect(() => {
    // Nur Socket-Verbindung herstellen wenn Chatrooms-Daten verfügbar sind
    if (isLoading || !chatroomsData?.chatrooms) {
      return;
    }


    // Socket verbinden oder wiederverwenden
    socketManager.connect().then(() => {
      // Event-Listener für ChatArea registrieren
      const handleMessage = () => {
        queryClient.invalidateQueries(["chatrooms"]);
        if (audioReceiveRef.current) {
          audioReceiveRef.current.play().catch((error) => {
            console.error("Audio playback failed:", error);
          });
        }
      };

      const handleMessageUpdate = () => {
        queryClient.invalidateQueries(["chatroom"]);
      };

      const handleMessageDelete = () => {
        queryClient.invalidateQueries(["chatrooms"]);
      };

      // Listener mit eindeutiger Component-ID registrieren
      socketManager.addListener("message", handleMessage, "ChatArea");
      socketManager.addListener("message-update", handleMessageUpdate, "ChatArea");
      socketManager.addListener("message-delete", handleMessageDelete, "ChatArea");
    }).catch((error) => {
      console.error("Failed to connect socket in ChatArea:", error);
    });

    return () => {
      // Nur die Listener dieser Komponente entfernen
      socketManager.removeAllListeners("ChatArea");
    };
  }, [queryClient, isLoading, chatroomsData]);

  // Cleanup beim Verlassen der Komponente
  useEffect(() => {
    return () => {
      socketManager.removeAllListeners("ChatArea");
    };
  }, []);

  useEffect(() => {
    const updateMaxLength = () => {
      setMaxLength(window.innerWidth >= 1280 ? 80 : 20);
    };

    updateMaxLength();

    window.addEventListener("resize", updateMaxLength);

    return () => {
      window.removeEventListener("resize", updateMaxLength);
    };
  }, []);

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".svg",
    ".gif",
    ".bmp",
    ".webp",
  ];

  function isImageUrl(url) {
    return (
      url.startsWith("https://res.cloudinary.com/") &&
      imageExtensions.some((extension) => url.endsWith(extension))
    );
  }

  const audioExtensions = [".webm", ".mp3", ".mp4", ".wav", ".aac"];

  function isAudioUrl(url) {
    return (
      url.startsWith("https://res.cloudinary.com/") &&
      audioExtensions.some((extension) => url.endsWith(extension))
    );
  }

  return (
    <div className="[scrollbar-width:thin] dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300 pb-16 xl:pb-20">
      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                  <img
                    src={robot}
                    alt="Hello Word Robot"
                    className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                    Hello, Word!
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your messaging platform
                  </p>
                </div>
              </div>
            </div>

            {/* Center - Search/Actions (expandable) */}
            {/* <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/chatarea/new-group')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Group
              </button>
            </div> */}

            {/* Right side - User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                  <img
                    src={
                      chatroomsData?.currentUserAvatar ||
                      (chatroomsData?.currentUsername
                        ? `https://robohash.org/${chatroomsData?.currentUsername}`
                        : robot)
                    }
                    alt="User Avatar"
                    className={cn(
                      "w-full h-full rounded-full object-cover bg-white dark:bg-gray-800 transition-all duration-200 group-hover:scale-105",
                      isLoading && "opacity-50"
                    )}
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {chatroomsData?.currentUsername || "Loading..."}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Online
                  </p>
                </div>
                <svg
                  className={cn(
                    "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200",
                    menuOpen && "rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {chatroomsData?.currentUsername}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Manage your account
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
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
                    {translations.menu.profile}
                  </button>

                  <button
                    onClick={() => {
                      navigate("/settings");
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
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
                    {translations.menu.settings}
                  </button>

                  <button
                    onClick={() => {
                      navigate("/about-us");
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {translations.menu.aboutUs}
                  </button>

                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    {translations.menu.privacy}
                    <svg
                      className="w-3 h-3 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>

                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logoutMutation.mutate();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {translations.menu.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {translations.chatArea.loading}
            </p>
          </div>
        ) : chatroomsError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="w-16 h-16 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 dark:text-red-400">
              {translations.chatArea.errorLoadingChatrooms}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Your Conversations
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Stay connected with friends
              </p>
            </div>

            {/* Quick Actions */}
            {/* <div className="flex flex-wrap gap-3 mb-6 justify-center sm:justify-start">
              <button
                onClick={() => navigate('/chatarea/exist')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                New Chat
              </button>
              <button
                onClick={() => navigate('/chatarea/groups/create')}
                className="md:hidden inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Group
              </button>
            </div> */}

            {/* Chat List */}
            {chatroomsData?.chatrooms?.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {chatroomsData.chatrooms.map((chatroom, index) => (
                  <Link
                    key={chatroom.chatId}
                    to={`/chatarea/chats/${chatroom.chatId}`}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div
                      className={cn(
                        "flex items-center p-4",
                        index !== chatroomsData.chatrooms.length - 1 &&
                          "border-b border-gray-200 dark:border-gray-700"
                      )}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                          <img
                            className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-800"
                            src={
                              chatroom.isGroupChat
                                ? chatroom.groupImage ||
                                  `https://robohash.org/${chatroom.groupName}`
                                : chatroom.usernames?.join(", ")
                                  ? `https://robohash.org/${chatroom.usernames.join(", ")}`
                                  : robot
                            }
                            alt="Chat Avatar"
                          />
                        </div>
                        {chatroom.isGroupChat && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                          </div>
                        )}
                        {chatroom.unreadMessagesCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                            {chatroom.unreadMessagesCount > 99
                              ? "99+"
                              : chatroom.unreadMessagesCount}
                          </div>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 ml-4 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                            {chatroom.isGroupChat
                              ? chatroom.groupName
                              : (chatroom.usernames?.join(", ") ??
                                translations.chatArea.noUsername)}
                          </h3>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {chatroom.isGroupChat && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                                {chatroom.memberCount}
                              </span>
                            )}
                            {chatroom.timestamps?.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimestamp(
                                  chatroom.timestamps[0],
                                  language
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Last Message */}
                        <div className="flex items-center">
                          {chatroom.isDeletedAccount ? (
                            <span className="text-sm text-red-500 italic">
                              {translations.chatArea.deletedAccount}
                            </span>
                          ) : chatroom.lastMessage ? (
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              {chatroom.currentUserId ===
                                chatroom.lastMessage.sender && (
                                <svg
                                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              )}
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {isImageUrl(chatroom.lastMessage.content) ? (
                                  <span className="inline-flex items-center space-x-1">
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
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>
                                      {translations.chatArea.sentImage}
                                    </span>
                                  </span>
                                ) : isAudioUrl(chatroom.lastMessage.content) ? (
                                  <span className="inline-flex items-center space-x-1">
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
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                      />
                                    </svg>
                                    <span>
                                      {translations.chatArea.sentAudioMessage}
                                    </span>
                                  </span>
                                ) : (
                                  truncateText(
                                    chatroom.lastMessage.content,
                                    maxLength
                                  )
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                              {translations.chatArea.noMessages}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="ml-2 flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start your first conversation or create a group chat
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate("/chatarea/exist")}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Start New Chat
                  </button>
                  <button
                    onClick={() => navigate("/chatarea/groups/create")}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 shadow-sm"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Group
                  </button>
                </div>
              </div>
            )}

            {/* Floating Action Buttons - Modern Style */}
            <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
              <button
                onClick={() => navigate("/chatarea/groups/create")}
                className="group w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                title="Create Group Chat"
              >
                <svg
                  className="w-6 h-6 text-white"
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
              </button>
              <button
                onClick={() => navigate("/chatarea/exist")}
                className="group w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                title="Add Person"
              >
                <svg
                  className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"
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
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
