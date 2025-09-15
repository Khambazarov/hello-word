import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { BackButtonIcon } from "./_AllSVGs";
import { fetchUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";
import { fetchBrowserLanguage } from "../utils/browserLanguage.js";

export const InviteToGroup = () => {
  const [usernames, setUsernames] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [translations, setTranslations] = useState({});

  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const userData = await fetchUserLanguage();
        const userLanguage = userData?.language || fetchBrowserLanguage();
        setTranslations(getTranslations(userLanguage));
      } catch (error) {
        console.error("Failed to fetch user language:", error);
        const browserLanguage = fetchBrowserLanguage();
        setTranslations(getTranslations(browserLanguage));
      }
    };
    loadLanguage();
  }, []);

  const { data: groupData, isLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      const response = await fetch(`/api/chatrooms/chats/${groupId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }
      const data = await response.json();
      return data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (usernameList) => {
      const response = await fetch(`/api/groupchats/${groupId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usernames: usernameList }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errorMessage || "Failed to invite users");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Successfully invited ${data.invitedUsers.join(", ")}`);
      queryClient.invalidateQueries(["groupMembers", groupId]);
      queryClient.invalidateQueries(["chatroom", groupId]);
      setUsernames("");
      setIsInviting(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsInviting(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!usernames.trim()) {
      toast.error("Please enter usernames to invite");
      return;
    }

    const usernameList = usernames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (usernameList.length === 0) {
      toast.error("Please enter valid usernames");
      return;
    }

    setIsInviting(true);
    inviteMutation.mutate(usernameList);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
        {/* Modern Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side - Back button and title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/chatarea/chats/${groupId}`)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group"
                  title="Back to Group"
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
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {translations.groupChat.inviteMembers}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {translations.groupChat.loadingGroupInfo}
                  </p>
                </div>
              </div>

              {/* Right side - Loading placeholder */}
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading group data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/chatarea/chats/${groupId}`)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group"
                title="Back to Group"
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
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Invite Members
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add new members to {groupData?.groupInfo?.name}
                </p>
              </div>
            </div>

            {/* Right side - Group info */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <span>{groupData?.memberCount} members</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-0.5">
                <img
                  src={
                    groupData?.groupInfo?.image ||
                    `https://robohash.org/${groupData?.groupInfo?.name}`
                  }
                  alt="Group"
                  className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center p-6 max-w-7xl mx-auto w-full">
        {/* Header Section - Simplified */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Invite New Members
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Expand your group by inviting friends and colleagues to join the
            conversation
          </p>
        </div>

        <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-2">
          {/* Current Members Section */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full mr-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Current Members
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {groupData?.memberCount} members in this group
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {groupData?.members?.map((member) => {
                const memberIsAdmin = groupData?.admins?.some(
                  (admin) => admin._id === member._id
                );
                const memberIsOwner =
                  groupData?.groupInfo?.owner?._id === member._id;

                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                        <img
                          src={
                            member.avatar
                              ? member.avatar.startsWith("http")
                                ? member.avatar
                                : `/uploads/${member.avatar}`
                              : `https://robohash.org/${member.username}`
                          }
                          alt={member.username}
                          className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-800"
                          onError={(e) => {
                            console.log(
                              `Avatar failed to load for ${member.username}:`,
                              member.avatar
                            );
                            console.log(
                              `Trying to load:`,
                              member.avatar
                                ? member.avatar.startsWith("http")
                                  ? member.avatar
                                  : `/uploads/${member.avatar}`
                                : `https://robohash.org/${member.username}`
                            );
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      {memberIsOwner && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Owner
                        </span>
                      )}
                      {memberIsAdmin && !memberIsOwner && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invite Form Section */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full mr-3">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
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
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Invite New Members
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add users to your group
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
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
                    How to invite:
                  </p>
                  <ul className="text-green-700 dark:text-green-300 space-y-1">
                    <li>• Enter usernames separated by commas</li>
                    <li>• Users must have accounts to receive invitations</li>
                    <li>• Multiple users can be invited at once</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usernames to Invite
                  <span className="text-xs text-gray-500 ml-1">(Required)</span>
                </label>
                <textarea
                  value={usernames}
                  onChange={(e) => setUsernames(e.target.value)}
                  placeholder="Enter usernames separated by commas&#10;Example: john, jane, mike"
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-balance text-xs text-gray-500 dark:text-gray-400">
                    Separate multiple usernames with commas
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {(() => {
                      const count = usernames
                        .split(",")
                        .filter((name) => name.trim().length > 0).length;
                      return `${count} ${count !== 1 ? "users" : "user"}`;
                    })()}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isInviting || !usernames.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {isInviting ? (
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
                    <span>Sending Invitations...</span>
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span>
                      {translations.groupChat?.sendInvitations ||
                        "Send Invitations"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};
