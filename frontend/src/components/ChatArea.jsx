import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import socketManager from "../utils/socketManager.js";
import { cn } from "../utils/cn.js";
import { fetchUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";
import {
  getAvatarUrl,
  createAvatarErrorHandler,
} from "../utils/avatarHelper.js";

import robot from "../assets/robot.png";
import notification from "../assets/positive-notification.wav";
import { formatTimestamp } from "../utils/formatTimestamp.js";
import { truncateText } from "../utils/truncateText.js";
import { AuthError } from "./AuthError.jsx";

/* ----------------------------- Helpers (local) ---------------------------- */

// Erlaubten Host robust validieren
function isAllowedHost(raw) {
  try {
    const u = new URL(raw);
    return u.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".svg", ".gif", ".bmp", ".webp"];
const AUDIO_EXT = [".webm", ".mp3", ".mp4", ".wav", ".aac"];

function isImageUrl(url) {
  const l = (url || "").toLowerCase();
  return isAllowedHost(l) && IMAGE_EXT.some((ext) => l.endsWith(ext));
}
function isAudioUrl(url) {
  const l = (url || "").toLowerCase();
  return isAllowedHost(l) && AUDIO_EXT.some((ext) => l.endsWith(ext));
}

function getLatestTimestamp(timestamps) {
  if (!Array.isArray(timestamps) || timestamps.length === 0) return undefined;
  // Kopie sortieren, um Mutationen zu vermeiden
  return [...timestamps].sort((a, b) => new Date(b) - new Date(a))[0];
}

/* ------------------------------ UI Components ---------------------------- */

function ListSkeleton({ rows = 6 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center p-4 animate-pulse",
            i !== rows - 1 && "border-b border-gray-200 dark:border-gray-700"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 ml-4">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded ml-2" />
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- Page ---------------------------------- */

export const ChatArea = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [menuOpen, setMenuOpen] = useState(false);
  const [maxLength, setMaxLength] = useState(20);
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState(getTranslations("en"));

  const audioReceiveRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userData = await fetchUserLanguage();
        const userLanguage = userData?.language || "en";
        if (mounted) {
          setLanguage(userLanguage);
          setTranslations(getTranslations(userLanguage));
        }
      } catch (error) {
        console.error("Failed to fetch user language:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------ react-query ----------------------------- */
  const {
    data: chatroomsData,
    error: chatroomsError,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["chatrooms"],
    queryFn: async () => {
      const response = await fetch(`/api/chatrooms/chats`, {
        credentials: "include",
      });
      if (!response.ok) {
        // Durchreichen spezifischer Fehlercodes (z. B. 401)
        const msg = `Failed to fetch chatrooms (${response.status})`;
        throw new Error(msg);
      }
      return response.json();
    },
    // Stabilität & Nutzererlebnis
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    retry: 2,
  });

  const volume = chatroomsData?.volume || "middle";

  /* ------------------------------ Audio Setup ----------------------------- */
  useEffect(() => {
    if (!audioReceiveRef.current) {
      audioReceiveRef.current = new Audio(notification);
    }
    audioReceiveRef.current.volume =
      volume === "silent" ? 0 : volume === "middle" ? 0.5 : 1;

    // iOS/Browser: einmalige User-Interaktion „aktiviert“ Audio-Context
    const initializeAudio = () => {
      // Wir brauchen hier kein Play—nur den Unlock durch Interaktion.
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

  /* -------------------------- Initial scroll to top ----------------------- */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ----------------------------- Responsive max --------------------------- */
  useEffect(() => {
    const updateMaxLength = () => {
      setMaxLength(window.innerWidth >= 1280 ? 80 : 20);
    };
    updateMaxLength();
    window.addEventListener("resize", updateMaxLength);
    return () => window.removeEventListener("resize", updateMaxLength);
  }, []);

  /* ------------------------------ Logout flow ----------------------------- */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to logout");
      return response.json();
    },
    onSuccess: () => navigate("/"),
    onError: (error) => console.error("Failed to logout", error),
  });

  /* ----------------------------- Socket wiring ---------------------------- */
  const invalidateChatrooms = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
  }, [queryClient]);

  // 1) Audio-Playback stabil ausführen (leise bei Blockaden)
  const playIncoming = useCallback(() => {
    if (!audioReceiveRef.current) return;
    audioReceiveRef.current
      .play()
      .catch((err) =>
        console.debug("Audio playback skipped:", err?.message || err)
      );
  }, []);

  // 2) Ableitung: haben wir Chats?
  const hasChats = !!chatroomsData?.chatrooms;

  // 3) Einziger Socket-Effect: idempotent, mit zentralem Cleanup
  useEffect(() => {
    if (!hasChats) return;

    // Vor neuer Registrierung: alte Listener dieser Komponente entfernen
    socketManager.removeAllListeners("ChatArea");

    const ensureConnection = async () => {
      try {
        await socketManager.connect();

        const handleMessage = () => {
          invalidateChatrooms();
          playIncoming();
        };
        const handleMessageUpdate = () => invalidateChatrooms();
        const handleMessageDelete = () => invalidateChatrooms();

        socketManager.addListener("message", handleMessage, "ChatArea");
        socketManager.addListener(
          "message-update",
          handleMessageUpdate,
          "ChatArea"
        );
        socketManager.addListener(
          "message-delete",
          handleMessageDelete,
          "ChatArea"
        );
      } catch (error) {
        console.error("Failed to connect socket in ChatArea:", error);
      }
    };

    ensureConnection();

    // Zentrales Cleanup für diese Komponente/SCOPE
    return () => {
      socketManager.removeAllListeners("ChatArea");
    };
  }, [hasChats, invalidateChatrooms, playIncoming]);

  /* --------------------------- Menu A11y & outside ------------------------ */
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

  const t = translations; // Alias

  /* --------------------------------- Render ------------------------------- */
  if (chatroomsError) {
    if (
      String(chatroomsError.message || "").includes("(401)") ||
      chatroomsError.status === 401 ||
      chatroomsError?.errorMessage === "User is not Authenticated"
    ) {
      return <AuthError translations={translations} />;
    }
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-red-600 dark:text-red-400 mb-4">
          {t.chat?.area?.errorLoadingChatrooms ||
            "Could not load conversations."}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"
          aria-label="Loading"
        />
        <p className="text-gray-600 dark:text-gray-300">
          {t.chat?.area?.loading || "Loading…"}
        </p>
        <div className="mt-6 w-full">
          <ListSkeleton rows={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="[scrollbar-width:thin] dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300 pb-16 xl:pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                  <img
                    src={robot}
                    alt="Hello Word Robot"
                    className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-800"
                    loading="lazy"
                    aria-label="App Logo"
                  />
                </div>
                <div>
                  <h1
                    aria-label="Application Name"
                    className="text-xl font-bold text-gray-900 dark:text-white tracking-wide"
                  >
                    {t?.chat?.area?.branding || "Hello Word"}
                  </h1>
                </div>
              </div>
            </div>

            {/* Right: User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls="user-menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                  <img
                    src={getAvatarUrl(
                      chatroomsData?.currentUserAvatar,
                      chatroomsData?.currentUsername || "User"
                    )}
                    alt="User Avatar"
                    className={cn(
                      "w-full h-full rounded-full object-cover bg-white dark:bg-gray-800 transition-all duration-200 group-hover:scale-105",
                      isLoading && "opacity-50"
                    )}
                    onError={createAvatarErrorHandler(
                      chatroomsData?.currentUsername || "User"
                    )}
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {chatroomsData?.currentUsername || "…"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.common?.online || "Online"}
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
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div
                  id="user-menu"
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {chatroomsData?.currentUsername}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.ui?.navigation?.menu?.manageAccount ||
                        "Manage your account"}
                    </p>
                  </div>

                  {/* Items */}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setMenuOpen(false);
                    }}
                    role="menuitem"
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {t.ui?.navigation?.menu?.profile}
                  </button>

                  <button
                    onClick={() => {
                      navigate("/settings");
                      setMenuOpen(false);
                    }}
                    role="menuitem"
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                    {t.ui?.navigation?.menu?.settings}
                  </button>

                  <button
                    onClick={() => {
                      navigate("/about-us");
                      setMenuOpen(false);
                    }}
                    role="menuitem"
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t.ui?.navigation?.menu?.aboutUs}
                  </button>

                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    {t.ui?.navigation?.menu?.privacy}
                    <svg
                      className="w-3 h-3 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                      role="menuitem"
                      disabled={logoutMutation.isPending}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                        logoutMutation.isPending &&
                          "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {logoutMutation.isPending
                        ? t.common?.loggingOut || "Logging out…"
                        : t.ui?.navigation?.menu?.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="text-center mb-4 overflow-hidden [animation:fade-out-collapse_1000ms_ease-out_2000ms_forwards] motion-reduce:[animation:none] [will-change:opacity,transform]">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {t.chat?.area?.title.replace(
                "{user}",
                chatroomsData?.currentUsername
              ) || "Your Conversations"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {chatroomsData?.chatrooms.length > 0
                ? t.chat?.area?.subtitle || "Stay connected with friends"
                : ""}
              {isFetching && (
                <span className="ml-2 text-xs opacity-70">
                  {t?.common?.loading || "Refreshing…"}
                </span>
              )}
            </p>
          </div>

          {/* Chat List */}
          {chatroomsData?.chatrooms?.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {chatroomsData.chatrooms.map((chatroom, index) => {
                const title = chatroom.isGroupChat
                  ? chatroom.groupName
                  : chatroom.usernames?.join(", ") ||
                    t.chat?.area?.noUsername ||
                    "Chat";
                const latestTs = getLatestTimestamp(chatroom.timestamps);
                const lastContent = chatroom?.lastMessage?.content;

                return (
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
                            src={getAvatarUrl(
                              chatroom.isGroupChat
                                ? chatroom.groupImage
                                : chatroom.partnerAvatar,
                              title
                            )}
                            alt="Chat Avatar"
                            onError={createAvatarErrorHandler(title)}
                            loading="lazy"
                          />
                          {chatroom.isGroupChat && (
                            <span
                              className="absolute -bottom-1 -right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-600 text-white ring-2 ring-white dark:ring-gray-900 shadow text-[10px] font-semibold leading-none select-none"
                              aria-label={`${chatroom.memberCount} members`}
                              title={`${chatroom.memberCount} members`}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                              </svg>
                              <span>
                                {chatroom.memberCount > 9
                                  ? "9+"
                                  : chatroom.memberCount}
                              </span>
                            </span>
                          )}
                        </div>

                        {chatroom.unreadMessagesCount > 0 && (
                          <div
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium"
                            aria-label={`${chatroom.unreadMessagesCount} unread`}
                          >
                            {chatroom.unreadMessagesCount > 99
                              ? "99+"
                              : chatroom.unreadMessagesCount}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 ml-4 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                            {title}
                          </h3>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {latestTs && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimestamp(latestTs, language)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Last Message */}
                        <div className="flex items-center">
                          {chatroom.isDeletedAccount ? (
                            <span className="text-sm text-red-500 italic">
                              {t.chat?.area?.deletedAccount}
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
                                  aria-hidden="true"
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
                                {isImageUrl(lastContent) ? (
                                  <span className="inline-flex items-center space-x-1">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>
                                      {t.chat?.area?.sentImage ||
                                        "Sent an image"}
                                    </span>
                                  </span>
                                ) : isAudioUrl(lastContent) ? (
                                  <span className="inline-flex items-center space-x-1">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                      />
                                    </svg>
                                    <span>
                                      {t.chat?.area?.sentAudioMessage ||
                                        "Sent an audio message"}
                                    </span>
                                  </span>
                                ) : (
                                  truncateText(lastContent || "", maxLength)
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                              {t.chat?.area?.noMessages || "No messages yet"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="ml-2 flex-shrink-0" aria-hidden="true">
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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                {t.chat?.area?.noConversationsTitle || "No conversations yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t.chat?.area?.noConversationsText ||
                  "Start your first conversation or create a group chat"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/chatarea/exist")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title={t.chat?.area?.startNewChat || "Start New Chat"}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {t.chat?.area?.startNewChat || "Start New Chat"}
                </button>
                <button
                  onClick={() => navigate("/chatarea/groups/create")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title={t.chat?.area?.createGroup || "Create Group"}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {t.chat?.area?.createGroup || "Create Group"}
                </button>
              </div>
            </div>
          )}

          {/* Floating Actions */}
          <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
            <button
              onClick={() => navigate("/chatarea/groups/create")}
              className="group w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500"
              title={
                t.chat?.area?.createGroupChatTooltip || "Create Group Chat"
              }
              aria-label={
                t.chat?.area?.createGroupChatTooltip || "Create Group Chat"
              }
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              className="group w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={t.chat?.area?.addPerson || "Add Person"}
              aria-label={t.chat?.area?.addPerson || "Add Person"}
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
      </main>
    </div>
  );
};
