import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { getAvatarUrl, createAvatarErrorHandler } from "../utils/avatarHelper";
import { fetchUserLanguage } from "../utils/api";
import { getTranslations } from "../utils/languageHelper";

// kleine Helper für Platzhalter-Strings: "Hi {user}"
const fmt = (s, dict) =>
  typeof s === "string"
    ? s.replace(/\{(\w+)\}/g, (_, k) => dict?.[k] ?? "")
    : s;

// sicheres i18n mit Fallback und leeren Strings
const i18n = (tpl, fallback, vars = {}) =>
  typeof tpl === "string" && tpl.trim() ? fmt(tpl, vars) : fallback;

export const GroupSettings = () => {
  // --------------------------- i18n ---------------------------
  const [language, setLanguage] = useState("en");
  const [t, setT] = useState(getTranslations("en"));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await fetchUserLanguage();
        const lang = user?.language || "en";
        if (mounted) {
          setLanguage(lang);
          setT(getTranslations(lang));
        }
      } catch (e) {
        // fallback bleibt "en"
        console.debug("language load failed:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // --------------------------- Local state ---------------------------
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);

  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --------------------------- Data fetching ---------------------------
  const { data: groupData, isLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groupchats/${groupId}/members`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch group data");
      return response.json();
    },
  });

  const { data: chatData } = useQuery({
    queryKey: ["chatroom", groupId],
    queryFn: async () => {
      const response = await fetch(`/api/chatrooms/chats/${groupId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch chatroom");
      return response.json();
    },
  });

  // Set initial values
  useEffect(() => {
    if (groupData) {
      setNewGroupName(groupData.groupInfo?.name || "");
      setNewGroupDescription(groupData.groupInfo?.description || "");
    }
  }, [groupData]);

  // --------------------------- Mutations ---------------------------
  const updateGroupMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await fetch(`/api/groupchats/${groupId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errorMessage || "Failed to update group");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(
        t.feedback?.success?.group?.updated || "Group updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["chatroom", groupId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (username) => {
      const response = await fetch(`/api/groupchats/${groupId}/promote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errorMessage || "Failed to promote user");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const username = data?.newAdmin ?? "User";
      toast.success(
        i18n(
          t.group?.settings?.promotedToAdmin,
          `${username} promoted to admin`,
          { user: username }
        )
      );

      // toast.success(
      //   fmt(t.group?.settings?.promotedToAdmin, { user: data.newAdmin }) ||
      //     `${data.newAdmin} promoted to adminxxx`
      // );
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
    },
    onError: (error) => toast.error(error.message),
  });

  const demoteMutation = useMutation({
    mutationFn: async (username) => {
      const response = await fetch(`/api/groupchats/${groupId}/demote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errorMessage || "Failed to demote admin");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const demoted = data?.demotedAdmin ?? "User";
      toast.success(
        i18n(
          t.group?.settings?.demotedToMember,
          `${demoted} demoted to member`,
          { user: demoted }
        )
      );
      // toast.success(
      //   fmt(t.group?.settings?.demotedToMember, {
      //     user: data.demotedAdmin,
      //   }) || `${data.demotedAdmin} demoted to member`
      // );
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
    },
    onError: (error) => toast.error(error.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (username) => {
      const response = await fetch(
        `/api/groupchats/${groupId}/members/${username}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errorMessage || "Failed to remove member");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const removed = data?.removedUser ?? "User";
      toast.success(
        i18n(t.group?.settings?.removedUser, `${removed} removed from group`, {
          user: removed,
        })
      );
      // toast.success(
      //   fmt(t.group?.settings?.removedUser, { user: data.removedUser }) ||
      //     `${data.removedUser} removed from group`
      // );
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
    },
    onError: (error) => toast.error(error.message),
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/groupchats/${groupId}/leave`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errorMessage || "Failed to leave group");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(
        t.group?.settings?.leftGroup || "Successfully left the group"
      );
      navigate("/chatarea");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/chatrooms/groupchats/${groupId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errorMessage || "Failed to delete group");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(t.group?.settings?.deleted || "Group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      navigate("/chatarea");
    },
    onError: (error) => toast.error(error.message),
  });

  const uploadGroupImageMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch(`/api/upload/group-image/${groupId}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to upload image");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(
        t.group?.settings?.imageUpdated || "Group image updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["chatroom", groupId] });
    },
    onError: (error) => toast.error(error.message),
  });

  // --------------------------- Handlers ---------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("groupImage", file);
      uploadGroupImageMutation.mutate(formData);
    }
  };

  const handleUpdateGroup = () => {
    const updates = {};
    const trimmedGroupName = newGroupName.trim();

    if (trimmedGroupName.length < 2) {
      toast.error(
        t.feedback?.errors?.group?.nameMustBeTwoChars ||
          "Group name must be at least 2 characters long"
      );
      return;
    }
    if (trimmedGroupName.length > 20) {
      toast.error(
        t.feedback?.errors?.group?.nameTooLong ||
          "Group name cannot exceed 20 characters"
      );
      return;
    }

    if (trimmedGroupName !== groupData.groupInfo.name) {
      updates.groupName = trimmedGroupName;
    }

    const trimmedDescription = newGroupDescription.trim();
    if (trimmedDescription !== groupData.groupInfo.description) {
      updates.groupDescription = trimmedDescription;
    }

    if (Object.keys(updates).length > 0) {
      updateGroupMutation.mutate(updates);
    } else {
      // toast(t.common?.noChangesToSave || "No changes to save", {
      toast(
        t.feedback?.errors?.general?.noChangesToSave || "No changes to save",
        {
          icon: "ℹ️",
          style: { background: "#3b82f6", color: "#ffffff" },
        }
      );
    }
  };

  // --------------------------- A11y: Focus & Modals ---------------------------
  const confirmCancelRef = useRef(null);
  const deleteCancelRef = useRef(null);
  const openerRef = useRef(null);

  const openConfirm = (member) => {
    openerRef.current = document.activeElement;
    setMemberToRemove(member);
    setShowConfirmModal(true);
  };
  const openDeleteGroup = () => {
    openerRef.current = document.activeElement;
    setShowDeleteGroupModal(true);
  };

  const anyModalOpen = showConfirmModal || showDeleteGroupModal;

  useEffect(() => {
    if (!anyModalOpen) return;

    if (showConfirmModal) confirmCancelRef.current?.focus();
    if (showDeleteGroupModal) deleteCancelRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (!removeMemberMutation.isLoading && !deleteGroupMutation.isLoading) {
          setShowConfirmModal(false);
          setShowDeleteGroupModal(false);
          setMemberToRemove(null);
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      openerRef.current?.focus?.();
    };
  }, [
    anyModalOpen,
    showConfirmModal,
    showDeleteGroupModal,
    removeMemberMutation.isLoading,
    deleteGroupMutation.isLoading,
  ]);

  // --------------------------- Render: Loading ---------------------------
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --------------------------- Derived ---------------------------
  const userPermissions = chatData?.userPermissions || {};
  const isOwner = !!(userPermissions.isOwner || userPermissions.isOwner);
  const isAdmin = !!userPermissions.isAdmin;

  // --------------------------- UI ---------------------------
  return (
    <div className="min-h-screen dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
              <img
                src={getAvatarUrl(
                  groupData?.groupInfo?.image,
                  groupData?.groupInfo?.name || "Group"
                )}
                alt={t.group?.settings?.altGroup || "Group"}
                className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-800"
                onError={createAvatarErrorHandler(
                  groupData?.groupInfo?.name || "Group"
                )}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.group?.settings?.title || "Group Settings"}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/chatarea/chats/${groupId}`)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group"
                title={t.ui?.tooltips?.backToGroup || "Back to Group"}
                aria-label={t.ui?.tooltips?.backToGroup || "Back to Group"}
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
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center p-6 max-w-7xl mx-auto w-full">
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t.group?.settings?.subtitle ||
              "Customize your group experience and manage member permissions"}
          </p>
        </div>

        <div className="w-full max-w-4xl space-y-6 sm:space-y-8">
          {/* Group Information Card */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
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
                  {t.group?.settings?.groupInformation || "Group Information"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.group?.settings?.basicGroupDetails ||
                    "Basic group details and settings"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Group Avatar */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                    <img
                      src={getAvatarUrl(
                        groupData?.groupInfo?.image,
                        groupData?.groupInfo?.name || "Group"
                      )}
                      alt={t.group?.settings?.altGroup || "Group"}
                      className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-800"
                      onError={createAvatarErrorHandler(
                        groupData?.groupInfo?.name || "Group"
                      )}
                    />
                  </div>
                  {isAdmin && (
                    <label
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                      title={t.group?.settings?.changeImage || "Change image"}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </label>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {groupData?.groupInfo?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center sm:justify-start">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    {groupData?.memberCount}{" "}
                    {t.group?.settings?.membersLabel || "members"}
                  </p>
                </div>
              </div>

              {/* Editable fields (Admins) */}
              {isAdmin ? (
                <>
                  {/* Group Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.group?.settings?.groupName || "Group Name"}
                      <span className="text-xs text-gray-500 ml-1">
                        ({t.common?.required || "Required"})
                      </span>
                    </label>
                    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                            newGroupName.trim().length < 2 ||
                            newGroupName.trim().length > 20
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          maxLength={20}
                          placeholder={
                            t.group?.settings?.groupNamePlaceholder ||
                            "Enter group name..."
                          }
                        />
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs">
                            {newGroupName.trim().length < 2 &&
                              newGroupName.trim().length > 0 && (
                                <span className="text-red-500">
                                  {t.feedback?.errors?.group?.nameTooShort ||
                                    "Name must be at least 2 characters"}
                                </span>
                              )}
                            {newGroupName.trim().length === 0 && (
                              <span className="text-red-500">
                                {t.feedback?.errors?.group
                                  ?.groupNameIsRequired || "Name is required"}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {newGroupName.length}/20
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleUpdateGroup}
                        disabled={
                          newGroupName.trim().length < 2 ||
                          newGroupName.trim().length > 20
                        }
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full sm:w-auto"
                      >
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{t.common?.save || "Save"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Group Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.group?.settings?.groupDescription ||
                        "Group Description"}
                      <span className="text-xs text-gray-500 ml-1">
                        ({t.common?.optional || "Optional"})
                      </span>
                    </label>
                    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <textarea
                          value={newGroupDescription}
                          onChange={(e) =>
                            setNewGroupDescription(e.target.value)
                          }
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                          rows={3}
                          maxLength={200}
                          placeholder={
                            t.group?.settings?.groupDescriptionPlaceholder ||
                            "Enter group description..."
                          }
                        />
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {newGroupDescription.length}/200
                        </div>
                      </div>
                      <button
                        onClick={handleUpdateGroup}
                        disabled={
                          newGroupName.trim().length < 2 ||
                          newGroupName.trim().length > 20
                        }
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed self-start flex items-center justify-center space-x-2 w-full sm:w-auto"
                      >
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{t.common?.save || "Save"}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm">
                      <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                        {t.group?.settings?.memberAccessTitle ||
                          "Member Access"}
                      </p>
                      <p className="text-amber-700 dark:text-amber-300">
                        {t.group?.settings?.memberAccessText ||
                          "Only admins can modify group settings. Contact a group admin to make changes."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Members Card */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-full mr-3">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    {t.group?.settings?.membersTitle || "Group Members"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {groupData?.memberCount}{" "}
                    {t.group?.settings?.membersLabel || "members"}{" "}
                    {t.group?.settings?.total || "total"}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => navigate(`/chatarea/groups/${groupId}/invite`)}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm w-full sm:w-auto"
                >
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>
                    {t.group?.settings?.inviteMembers || "Invite Members"}
                  </span>
                </button>
              )}
            </div>

            <div className="space-y-2 sm:space-y-3">
              {groupData?.members?.map((member) => {
                const memberIsAdmin = groupData?.admins?.some(
                  (admin) => admin._id === member._id
                );
                const memberIsOwner =
                  groupData?.groupInfo?.owner?._id === member._id;

                const labels = {
                  owner:
                    t.group?.settings?.owner ||
                    t.system?.permissions?.owner ||
                    "Owner",
                  admin:
                    t.group?.settings?.admin ||
                    t.system?.permissions?.admin ||
                    "Admin",
                  member: t.system?.permissions?.member || "Member",
                };

                return (
                  <div
                    key={member._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={getAvatarUrl(member.avatar, member.username)}
                          alt={member.username}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                          onError={createAvatarErrorHandler(member.username)}
                        />
                        {memberIsOwner && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full p-0.5 sm:p-1">
                            <svg
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                          {member.username}
                        </p>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                          {memberIsOwner && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-0.5 sm:py-1 rounded-full font-medium">
                              {t.roles?.owner || "Owner"}
                            </span>
                          )}
                          {memberIsAdmin && !memberIsOwner && (
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 sm:py-1 rounded-full font-medium">
                              {t.roles?.admin || "Admin"}
                            </span>
                          )}
                          {!memberIsAdmin && !memberIsOwner && (
                            <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300 px-2 py-0.5 sm:py-1 rounded-full font-medium">
                              {t.roles?.member || "Member"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {((isOwner && !memberIsOwner) ||
                      (isAdmin && !memberIsAdmin && !memberIsOwner)) && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {isOwner && !memberIsAdmin && !memberIsOwner && (
                          <button
                            onClick={() =>
                              promoteMutation.mutate(member.username)
                            }
                            className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                              />
                            </svg>
                            <span>
                              {t.group?.settings?.promote || "Promote"}
                            </span>
                          </button>
                        )}

                        {isOwner && memberIsAdmin && !memberIsOwner && (
                          <button
                            onClick={() =>
                              demoteMutation.mutate(member.username)
                            }
                            className="px-3 py-1.5 text-xs sm:text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-1"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                            <span>{t.group?.settings?.demote || "Demote"}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setMemberToRemove(member);
                            setShowConfirmModal(true);
                          }}
                          className="px-3 py-1.5 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg
                            className="w-3 h-3"
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
                          <span>{t.group?.settings?.remove || "Remove"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Actions Card */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full mr-3">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                  {t.group?.settings?.actionsTitle || "Group Actions"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {t.group?.settings?.actionsSubtitle ||
                    "Manage your group membership"}
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {!isOwner && (
                <>
                  <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-xs sm:text-sm">
                        <p className="text-red-800 dark:text-red-200 font-medium mb-1">
                          {t.group?.settings?.leaveGroupTitle || "Leave Group"}
                        </p>
                        <p className="text-red-700 dark:text-red-300">
                          {t.group?.settings?.leaveGroupText ||
                            "You will no longer be able to access this group or its messages."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Native confirm, lokalisiert:
                      const question =
                        t.group?.settings?.confirmLeaveGroup ||
                        t.group?.settings?.confirmLeave ||
                        "Are you sure you want to leave this group?";
                      if (confirm(question)) {
                        leaveGroupMutation.mutate();
                      }
                    }}
                    className="w-full px-4 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-semibold text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                    <span>
                      {t.group?.settings?.leaveGroupBtn || "Leave Group"}
                    </span>
                  </button>
                </>
              )}

              {isOwner && (
                <>
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-xs sm:text-sm">
                        <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
                          {t.group?.settings?.ownerPrivilegesTitle ||
                            "Owner Privileges"}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t.group?.settings?.ownerPrivilegesText ||
                            "As the group Owner, you cannot leave the group. You can transfer ownership or delete the group."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete Group */}
                  <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012-2h4a1 1 0 110 2v6a1 1 0 11-2 0V9a1 1 0 00-2 0v4a1 1 0 11-2 0V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-xs sm:text-sm">
                        <p className="text-red-800 dark:text-red-200 font-medium mb-1">
                          {t.group?.settings?.deleteGroupTitle ||
                            "Delete Group"}
                        </p>
                        <p className="text-red-700 dark:text-red-300">
                          {t.group?.settings?.deleteGroupText ||
                            "Permanently delete this group and all its messages. This action cannot be undone."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={openDeleteGroup}
                    className="w-full px-4 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-semibold text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                    <span>
                      {t.group?.settings?.deleteGroupBtn || "Delete Group"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Remove Member Modal */}
      {showConfirmModal && memberToRemove && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={
            !removeMemberMutation.isLoading
              ? () => {
                  setShowConfirmModal(false);
                  setMemberToRemove(null);
                }
              : undefined
          }
          aria-labelledby="remove-dialog-title"
          aria-describedby="remove-dialog-desc"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-busy={removeMemberMutation.isLoading}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mr-4">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    id="remove-dialog-title"
                    className="text-lg font-bold text-gray-900 dark:text-white"
                  >
                    {t.group?.settings?.removeMemberTitle || "Remove Member"}
                  </h3>
                  <p
                    id="remove-dialog-desc"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {t.group?.settings?.thisActionCannotBeUndone ||
                      "This action cannot be undone"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {fmt(
                    t.group?.settings?.removeMemberQuestion ||
                      "Are you sure you want to remove {user} from this group?",
                    { user: memberToRemove.username }
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  ref={confirmCancelRef}
                  onClick={() => {
                    setShowConfirmModal(false);
                    setMemberToRemove(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {t.common?.cancel || "Cancel"}
                </button>
                <button
                  onClick={() => {
                    removeMemberMutation.mutate(memberToRemove.username);
                    setShowConfirmModal(false);
                    setMemberToRemove(null);
                  }}
                  disabled={removeMemberMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {removeMemberMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t.common?.processing || "Processing..."}</span>
                    </>
                  ) : (
                    <>
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>
                        {t.group?.settings?.removeMemberBtn || "Remove Member"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteGroupModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={
            !deleteGroupMutation.isLoading
              ? () => setShowDeleteGroupModal(false)
              : undefined
          }
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-busy={deleteGroupMutation.isLoading}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mr-4">
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    id="delete-dialog-title"
                    className="text-lg font-bold text-gray-900 dark:text-white"
                  >
                    {t.group?.settings?.deleteGroupTitle || "Delete Group"}
                  </h3>
                  <p
                    id="delete-dialog-desc"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {t.group?.settings?.thisActionCannotBeUndone ||
                      "This action cannot be undone"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-3">
                  {fmt(
                    t.group?.settings?.deleteGroupQuestion ||
                      "Are you sure you want to permanently delete “{name}”?",
                    { name: groupData?.groupInfo?.name }
                  )}
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-xs text-red-800 dark:text-red-200">
                      <p className="font-medium mb-1">
                        {t.group?.settings?.willPermanently ||
                          "This will permanently:"}
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>
                          {t.group?.settings?.deletePointMessages ||
                            "Delete all group messages"}
                        </li>
                        <li>
                          {fmt(
                            t.group?.settings?.deletePointMembers ||
                              "Remove all {count} members",
                            { count: groupData?.memberCount }
                          )}
                        </li>
                        <li>
                          {t.group?.settings?.deletePointData ||
                            "Delete all group data and settings"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  ref={deleteCancelRef}
                  onClick={() => setShowDeleteGroupModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {t.common?.cancel || "Cancel"}
                </button>
                <button
                  onClick={() => {
                    deleteGroupMutation.mutate();
                    setShowDeleteGroupModal(false);
                  }}
                  disabled={deleteGroupMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteGroupMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t.common?.processing || "Processing..."}</span>
                    </>
                  ) : (
                    <>
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>
                        {t.group?.settings?.deleteGroupBtn || "Delete Group"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-center" />
    </div>
  );
};
