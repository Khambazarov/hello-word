import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { BackButtonIcon } from "./_AllSVGs.jsx";
import {
  getAvatarUrl,
  createAvatarErrorHandler,
} from "../utils/avatarHelper.js";
import { fetchUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";

import robot from "../assets/robot.png";

/* ----------------------------- Helpers ----------------------------- */
function isDeletedOrUnknown(name) {
  return name === "deletedUser" || !name;
}

export const ChatSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const cancelBtnRef = useRef(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);

  // i18n
  const [language, setLanguage] = useState("en");
  const [t, setT] = useState(getTranslations("en"));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userData = await fetchUserLanguage();
        const lang = userData?.language || "en";
        if (mounted) {
          setLanguage(lang);
          setT(getTranslations(lang));
        }
      } catch (e) {
        // still fall back to 'en'
        console.debug("language load failed:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ----------------------------- Data ----------------------------- */
  const { data, error, isLoading } = useQuery({
    queryKey: ["chatroom", id],
    queryFn: async () => {
      const res = await fetch(`/api/chatrooms/chats/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const msg = `Failed to fetch chat data (${res.status})`;
        throw new Error(msg);
      }
      return res.json();
    },
    staleTime: 15_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: "always",
    retry: 1,
  });

  const partnerName = data?.partnerName;
  const partnerAvatar = data?.partnerAvatar;
  const isGroupChat = Boolean(data?.isGroupChat ?? data?.groupName);

  // Redirect-Guard: wenn es doch eine Gruppe ist, auf GroupSettings umleiten
  useEffect(() => {
    if (isGroupChat) {
      navigate(`/chatarea/groups/${id}/settings`, { replace: true });
    }
  }, [isGroupChat, id, navigate]);

  /* ---------------------------- Mutations ---------------------------- */
  const deleteChatMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/chatrooms/chats/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        let message = `Failed to delete chat (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson?.errorMessage) message = errJson.errorMessage;
        } catch {
          // ignore json parse
        }
        throw new Error(message);
      }
      return response.json();
    },
    onSuccess: () => {
      // Cache aufräumen
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      queryClient.removeQueries({ queryKey: ["chatroom", id], exact: true });
      toast.success(t.feedback?.success?.general?.deleted || "Deleted");
      navigate("/chatarea");
    },
    onError: (e) => {
      const msg = e?.message?.includes("(401)")
        ? t.feedback?.errors?.general?.sessionExpired || "Session expired"
        : e?.message ||
          (t.feedback?.errors?.general?.operationFailed ?? "Operation failed");
      toast.error(msg);
      if (e?.message?.includes("(401)")) {
        navigate("/login");
      }
    },
  });

  /* -------------------------- Modal UX & A11y -------------------------- */
  useEffect(() => {
    if (!showDeleteModal) return;

    if (!deleteChatMutation.isPending) {
      cancelBtnRef.current?.focus();
    } else {
      // Dialog fokusierbar machen:
      dialogRef.current?.setAttribute("tabindex", "-1");
      dialogRef.current?.focus();
    }

    const onKeyDown = (e) => {
      if (e.key === "Escape" && !deleteChatMutation.isPending) {
        setShowDeleteModal(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showDeleteModal, deleteChatMutation.isPending]);

  useEffect(() => {
    if (!showDeleteModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showDeleteModal]);

  // Close-Handler einmalig, stabil
  const closeModal = useCallback(() => {
    if (!deleteChatMutation.isPending) {
      setShowDeleteModal(false);

      // nach dem Unmount in den nächsten Tick
      setTimeout(() => {
        openerRef.current?.focus();
      }, 0);
    }
  }, [deleteChatMutation.isPending]);

  /* ----------------------------- Handlers ----------------------------- */
  // const handleDeleteChat = () => setShowDeleteModal(true);
  const handleDeleteChat = () => {
    openerRef.current = document.activeElement;
    setShowDeleteModal(true);
  };
  const confirmDeleteChat = () => deleteChatMutation.mutate();

  /* ------------------ Anti-Flash: NACH allen Hooks -------------------- */
  const suppressRender = !isLoading && isGroupChat;
  if (suppressRender) return null;

  /* ------------------------------ UI ---------------------------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="mt-6">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || data?.errorMessage) {
    const is401 =
      (error?.message && String(error.message).includes("(401)")) ||
      data?.status === 401;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            {t.chat?.area?.errorLoadingChatrooms || "Could not load chats"}
          </p>
          <div className="mt-4 flex gap-3 justify-center">
            <button
              onClick={() => navigate("/chatarea")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.ui?.tooltips?.backToChatList || "Back to Chat List"}
            </button>
            {is401 && (
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common?.relogin || "Sign in again"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-16 pl-6 pr-2 max-w-4xl mx-auto">
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 overflow-hidden">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
              <img
                className="w-full h-full object-cover"
                src={
                  isDeletedOrUnknown(partnerName)
                    ? robot
                    : getAvatarUrl(partnerAvatar, partnerName)
                }
                alt="avatar"
                onError={
                  isDeletedOrUnknown(partnerName)
                    ? undefined
                    : createAvatarErrorHandler(partnerName)
                }
              />
            </div>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            {t.content?.settings?.title || "Settings"}
          </h1>

          <button
            onClick={() => navigate(`/chatarea/chats/${id}`)}
            className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={t.ui?.tooltips?.backToChat || "Back to Chat"}
            aria-label={t.ui?.tooltips?.backToChat || "Back to Chat"}
          >
            <BackButtonIcon />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Chat Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t.chat?.settings?.directChat || "Chat Info"}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      isDeletedOrUnknown(partnerName)
                        ? robot
                        : getAvatarUrl(partnerAvatar, partnerName)
                    }
                    alt="avatar"
                    onError={
                      isDeletedOrUnknown(partnerName)
                        ? undefined
                        : createAvatarErrorHandler(partnerName)
                    }
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {partnerName || t.chat?.area?.noUsername || "Unknown"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.chat?.settings?.directChat || "Direct Chat"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t.ui?.navigation?.pages?.preferences || "Preferences"}
            </h2>

            {/* Delete Chat */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                    {t.chat?.settings?.deleteChat || "Delete Chat"}
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                    {t.chat?.settings?.thisWillPermanentlyDelete ||
                      "This will permanently delete all messages and cannot be undone."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDeleteChat}
                disabled={deleteChatMutation.isPending}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {deleteChatMutation.isPending ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                    {t.common?.processing || "Processing..."}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {t.chat?.settings?.deleteChat || "Delete Chat"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={!deleteChatMutation.isPending ? closeModal : undefined}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-desc"
            aria-busy={deleteChatMutation.isPending}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    id="delete-dialog-title"
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {t.chat?.settings?.deleteChat || "Delete Chat"}
                  </h3>
                  <p
                    id="delete-dialog-desc"
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {t.chat?.settings?.confirmDeleteChat ||
                      "Are you sure you want to delete this chat?"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t.chat?.settings?.thisWillPermanentlyDelete ||
                    "This will permanently delete all messages and cannot be undone."}
                </p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {t.content?.profile?.username || "Username"}:{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {partnerName || t.chat?.area?.noUsername || "Unknown"}
                  </span>
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                <button
                  type="button"
                  ref={cancelBtnRef}
                  onClick={closeModal}
                  disabled={deleteChatMutation.isPending}
                  autoFocus
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                >
                  {t.common?.cancel || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteChat}
                  disabled={deleteChatMutation.isPending}
                  aria-disabled={deleteChatMutation.isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed"
                >
                  {deleteChatMutation.isPending ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                      <span>{t.common?.processing || "Processing..."}</span>
                    </>
                  ) : (
                    <span>{t.chat?.settings?.deleteChat || "Delete Chat"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
