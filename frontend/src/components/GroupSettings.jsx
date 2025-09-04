import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { BackButtonIcon } from "./_AllSVGs";

export const GroupSettings = () => {
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

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
    onSuccess: (data) => {
      setNewGroupName(data.groupInfo.name || "");
      setNewGroupDescription(data.groupInfo.description || "");
    },
  });

  const { data: chatData } = useQuery({
    queryKey: ["chatroom", groupId],
    queryFn: async () => {
      const response = await fetch(`/api/chatrooms/chats/${groupId}`);
      return response.json();
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await fetch(`/api/groupchats/${groupId}/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errorMessage || "Failed to update group");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Group updated successfully");
      queryClient.invalidateQueries(["groupMembers", groupId]);
      queryClient.invalidateQueries(["chatroom", groupId]);
      setEditingName(false);
      setEditingDescription(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (username) => {
      const response = await fetch(`/api/groupchats/${groupId}/promote`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errorMessage || "Failed to promote user");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`${data.newAdmin} promoted to admin`);
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (username) => {
      const response = await fetch(
        `/api/groupchats/${groupId}/members/${username}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errorMessage || "Failed to remove member");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`${data.removedUser} removed from group`);
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/groupchats/${groupId}/leave`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errorMessage || "Failed to leave group");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Successfully left the group");
      navigate("/chatarea");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadGroupImageMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch(`/api/upload/group-image/${groupId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Group image updated successfully");
      queryClient.invalidateQueries(["groupMembers", groupId]);
      queryClient.invalidateQueries(["chatroom", groupId]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("groupImage", file);
      uploadGroupImageMutation.mutate(formData);
    }
  };

  const handleUpdateGroup = () => {
    const updates = {};

    if (newGroupName !== groupData.groupInfo.name) {
      updates.groupName = newGroupName;
    }

    if (newGroupDescription !== groupData.groupInfo.description) {
      updates.groupDescription = newGroupDescription;
    }

    if (Object.keys(updates).length > 0) {
      updateGroupMutation.mutate(updates);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userPermissions = chatData?.userPermissions || {};
  const isCreator = userPermissions.isCreator;
  const isAdmin = userPermissions.isAdmin;

  return (
    <div className="min-h-svh flex flex-col dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-center items-center sticky top-0 bg-gray-700">
        <h1 className="md:text-base xl:text-2xl text-white tracking-widest font-bold">
          Group Settings
        </h1>
        <button
          onClick={() => navigate(`/chatarea/chats/${groupId}`)}
          className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2"
        >
          <BackButtonIcon />
        </button>
      </header>

      <div className="flex-grow p-6 max-w-4xl mx-auto w-full">
        {/* Gruppeninfo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <img
                src={
                  groupData?.groupInfo?.image ||
                  `https://robohash.org/${groupData?.groupInfo?.name}`
                }
                alt="Group"
                className="w-20 h-20 rounded-full object-cover"
              />
              {isAdmin && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </label>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {groupData?.groupInfo?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {groupData?.memberCount} members
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-4">
              {/* Gruppenname bearbeiten */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    maxLength={50}
                  />
                  <button
                    onClick={handleUpdateGroup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Gruppenbeschreibung bearbeiten */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Description
                </label>
                <div className="flex space-x-2">
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <button
                    onClick={handleUpdateGroup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 self-start"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mitgliederliste */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Members ({groupData?.memberCount})
            </h3>
            {isAdmin && (
              <button
                onClick={() => navigate(`/chatarea/groups/${groupId}/invite`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Invite Members
              </button>
            )}
          </div>

          <div className="space-y-3">
            {groupData?.members?.map((member) => {
              const memberIsAdmin = groupData?.admins?.some(
                (admin) => admin._id === member._id
              );
              const memberIsCreator =
                groupData?.groupInfo?.creator?._id === member._id;

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://robohash.org/${member.username}`}
                      alt={member.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {member.username}
                      </p>
                      <div className="flex space-x-2">
                        {memberIsCreator && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Creator
                          </span>
                        )}
                        {memberIsAdmin && !memberIsCreator && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAdmin && !memberIsCreator && (
                    <div className="flex space-x-2">
                      {isCreator && !memberIsAdmin && (
                        <button
                          onClick={() =>
                            promoteMutation.mutate(member.username)
                          }
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Make Admin
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (
                            confirm(`Remove ${member.username} from group?`)
                          ) {
                            removeMemberMutation.mutate(member.username);
                          }
                        }}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Gruppenaktionen */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Group Actions
          </h3>

          {!isCreator && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to leave this group?")) {
                  leaveGroupMutation.mutate();
                }
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Leave Group
            </button>
          )}

          {isCreator && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              As the group creator, you cannot leave the group. Transfer
              ownership first or delete the group.
            </div>
          )}
        </div>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};
