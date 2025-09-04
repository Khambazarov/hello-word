import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { BackButtonIcon } from "./_AllSVGs";

export const InviteToGroup = () => {
  const [usernames, setUsernames] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: groupData, isLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groupchats/${groupId}/members`);
      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }
      return response.json();
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-between items-center pl-2 sticky top-0 bg-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/chatarea/chats/${groupId}`)}
            className="cursor-pointer pr-4"
          >
            <BackButtonIcon />
          </button>
          <h1 className="md:text-base xl:text-2xl text-white tracking-widest font-bold">
            Invite to {groupData?.groupInfo?.name}
          </h1>
        </div>
      </header>

      <div className="flex-grow p-6">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Current Members ({groupData?.memberCount})
            </h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {groupData?.members?.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <img
                    src={`https://robohash.org/${member.username}`}
                    alt={member.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {member.username}
                    {groupData?.admins?.some(
                      (admin) => admin._id === member._id
                    ) && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                    {groupData?.groupInfo?.creator?._id === member._id && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Creator
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invite Users
              </label>
              <textarea
                value={usernames}
                onChange={(e) => setUsernames(e.target.value)}
                placeholder="Enter usernames separated by commas (e.g., john, jane, mike)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple usernames with commas
              </p>
            </div>

            <button
              type="submit"
              disabled={isInviting || !usernames.trim()}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${
                isInviting || !usernames.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
              }`}
            >
              {isInviting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Inviting...
                </div>
              ) : (
                "Send Invitations"
              )}
            </button>
          </form>
        </div>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};
