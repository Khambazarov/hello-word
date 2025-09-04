import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";
import { BackButtonIcon, SendMessageIcon } from "./_AllSVGs";

export const CreateGroupChat = () => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const formRef = useRef(null);

  const { data } = useQuery({
    queryKey: ["userLanguage"],
    queryFn: fetchUserLanguage,
  });

  const translations = getTranslations(data?.language || "en");

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

  return (
    <div className="min-h-svh flex flex-col dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-between items-center pl-2 sticky top-0 bg-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/chatarea")}
            className="cursor-pointer pr-4"
          >
            <BackButtonIcon />
          </button>
          <h1 className="md:text-base xl:text-2xl text-white tracking-widest font-bold">
            Create Group Chat
          </h1>
        </div>
      </header>

      <div className="flex-grow p-6">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Gruppenname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {groupName.length}/50
              </div>
            </div>

            {/* Gruppenbeschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Description (Optional)
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Describe your group..."
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {groupDescription.length}/200
              </div>
            </div>

            {/* Erste Nachricht */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Welcome Message (Optional)
              </label>
              <textarea
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Write a welcome message for your group..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCreating || !groupName.trim()}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${
                isCreating || !groupName.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
              }`}
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center">
                  <SendMessageIcon />
                  <span className="ml-2">Create Group</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};
