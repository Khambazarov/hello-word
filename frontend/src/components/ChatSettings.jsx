import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { BackButtonIcon } from "./_AllSVGs.jsx";
import {
  getAvatarUrl,
  createAvatarErrorHandler,
} from "../utils/avatarHelper.js";
import robot from "../assets/robot.png";

export const ChatSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, error, isLoading } = useQuery({
    queryKey: ["chatroom", id],
    queryFn: async () => {
      const response = await fetch(`/api/chatrooms/chats/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chat data");
      }
      return response.json();
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/chatrooms/chats/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || "Failed to delete chat");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Chat deleted successfully!");
      navigate("/chatarea");
    },
    onError: (error) => {
      toast.error(`Failed to delete chat: ${error.message}`);
    },
  });

  const handleDeleteChat = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = () => {
    deleteChatMutation.mutate();
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading chat settings...
          </p>
        </div>
      </div>
    );
  }

  if (error || data?.errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Error loading chat settings
          </p>
          <button
            onClick={() => navigate("/chatarea")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Chat List
          </button>
        </div>
      </div>
    );
  }

  const partnerName = data?.partnerName;
  const partnerAvatar = data?.partnerAvatar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                <img
                  className="w-full h-full object-cover"
                  src={
                    partnerName === "deletedUser" || !partnerName
                      ? robot
                      : getAvatarUrl(partnerAvatar, partnerName)
                  }
                  alt="avatar"
                  onError={
                    partnerName === "deletedUser" || !partnerName
                      ? undefined
                      : createAvatarErrorHandler(partnerName)
                  }
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                Chat Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {partnerName || "Unknown User"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/chatarea/chats/${id}`)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Back to Chat"
          >
            <BackButtonIcon />
          </button>
        </div>
      </header>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Chat Info Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Chat Information
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      partnerName === "deletedUser" || !partnerName
                        ? robot
                        : getAvatarUrl(partnerAvatar, partnerName)
                    }
                    alt="avatar"
                    onError={
                      partnerName === "deletedUser" || !partnerName
                        ? undefined
                        : createAvatarErrorHandler(partnerName)
                    }
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {partnerName || "Unknown User"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Direct Chat
                </p>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h2>

            {/* Delete Chat Section */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                    Delete Chat
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                    Permanently delete this chat and all messages. This action
                    cannot be undone.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDeleteChat}
                disabled={deleteChatMutation.isPending}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {deleteChatMutation.isPending ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-2 animate-spin"
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
                    Deleting...
                  </>
                ) : (
                  <>
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Chat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Chat
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Are you sure you want to delete this chat with{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {partnerName || "Unknown User"}
                  </span>
                  ? This will permanently remove all messages and conversation
                  history.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                  disabled={deleteChatMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteChat}
                  disabled={deleteChatMutation.isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed"
                >
                  {deleteChatMutation.isPending ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
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
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span>Delete Chat</span>
                    </>
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
