import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";

import EmojiPicker from "emoji-picker-react";

import socketManager from "../utils/socketManager.js";

import { cn } from "../utils/cn.js";
import { formatTimestamp } from "../utils/formatTimestamp.js";
import {
  getAvatarUrl,
  createAvatarErrorHandler,
} from "../utils/avatarHelper.js";
import {
  BackButtonIcon,
  DeleteMessageIcon,
  EditMessageIcon,
  SendMessageIcon,
} from "./_AllSVGs.jsx";

import robot from "../assets/robot.png";
import Emojis from "../assets/add_reaction.svg";
import fingerSnap from "../assets/finger-snap.mp3";
import positiveNotification from "../assets/positive-notification.wav";
import flagOfCircassians from "../assets/flag_of_circassians.png";

const customEmojis = [
  {
    names: ["Flagge – Circassia"],
    imgUrl: flagOfCircassians,
    id: "flag_of_circassians",
  },
];

// Function to parse custom emojis in message content
const parseCustomEmojis = (content) => {
  if (!content) return content;

  let parsedContent = content;

  // Replace custom emoji codes with img tags
  customEmojis.forEach((emoji) => {
    const emojiCode = `:${emoji.id}:`;
    const imgTag = `<img src="${emoji.imgUrl}" alt="${emoji.names[0]}" style="width: 1.2em; height: 1.2em; display: inline; vertical-align: middle; margin: 0 2px;" title="${emoji.names[0]}" />`;
    parsedContent = parsedContent.replace(new RegExp(emojiCode, "g"), imgTag);
  });

  return parsedContent;
};

const audioSend = new Audio(fingerSnap);
const audioReceive = new Audio(positiveNotification);

function playAudio(audio) {
  try {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  } catch (error) {
    console.error("Audio playback failed:", error);
  }
}

export const Chatroom = () => {
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(40);
  const [image, setImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [nearBottom, setNearBottom] = useState(true);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState("");

  const mediaRecorderRef = useRef(null);
  const textareaRef = useRef(null);
  const lastMessageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const processedEditMessagesRef = useRef(new Set());

  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: formatTimestamps, isLoading: formatTimestampsIsLoading } =
    useQuery({
      queryKey: ["formatTimestamps"],
      queryFn: fetchUserLanguage,
    });

  const { data, error, isLoading } = useQuery({
    queryKey: ["chatroom", id],
    queryFn: async () => {
      const response = await fetch(`/api/chatrooms/chats/${id}`);
      return response.json();
    },
  });

  const language = formatTimestamps?.language;
  const [translations, setTranslations] = useState(
    getTranslations(language || "en")
  );

  useEffect(() => {
    if (language) {
      setTranslations(getTranslations(language));
    }
  }, [language]);

  const volume = data?.volume;
  audioSend.volume = volume === "silent" ? 0 : volume === "middle" ? 0.5 : 1;
  audioReceive.volume = volume === "silent" ? 0 : volume === "middle" ? 0.5 : 1;

  const chatroomMessages = data?.chatroomMessages;
  const currentUsername = data?.currentUsername;
  const currentUserId = data?.currentUserId;
  const partnerName = data?.partnerName;
  const partnerAvatar = data?.partnerAvatar;
  const unreadMessagesCount = data?.unreadMessagesCount;

  // Gruppenchat-spezifische Daten
  const isGroupChat = data?.isGroupChat || false;
  const groupInfo = data?.groupInfo;
  const members = data?.members || [];
  const admins = data?.admins || [];
  const userPermissions = data?.userPermissions || {};

  const { mutate: markAsRead } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/chatrooms/chats/${id}/mark-as-read`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }
      return response.json();
    },
    onError: (error) => {
      toast.error(translations.toast.existChatroom.errorServer);
      console.error(error.message);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (userInput) => {
      const response = await fetch(`/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatroom: id, content: userInput }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["chatroom", id]);
      textareaRef.current.value = "";
      playAudio(audioSend);
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const uploadAudioMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch(`/api/upload/audio`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }
      return response.json();
    },
    onSuccess: (data) => {
      sendMessageMutation.mutate(data.url);
      setAudioBlob(null);
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch(`/api/upload/image`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      return response.json();
    },
    onSuccess: (data) => {
      sendMessageMutation.mutate(data.url);
      setImage(null);
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }) => {
      const response = await fetch(`/api/messages/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId, content }),
      });
      if (!response.ok) {
        throw new Error("Failed to edit message");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["chatroom", id]);
      setEditingMessage(null);
      textareaRef.current.value = "";
      playAudio(audioSend);
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }) => {
      const response = await fetch(`/api/messages/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId, content }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete message");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["chatroom", id]);
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const updateGroupDescriptionMutation = useMutation({
    mutationFn: async ({ description }) => {
      const response = await fetch(`/api/chatrooms/groups/${id}/description`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error response:", errorData);
        throw new Error(
          `Failed to update group description: ${errorData.errorMessage || "Unknown error"}`
        );
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["chatroom", id]);
      toast.success("Group description updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update group description: ${error.message}`);
    },
  });

  const getMimeType = (extension) => {
    // Handle invalid inputs (like event objects)
    if (typeof extension !== "string" || !extension) {
      console.warn(
        "Invalid extension provided, using default .webm:",
        extension
      );
      return "audio/webm";
    }

    const mimeTypes = {
      ".webm": "audio/webm",
      ".mp3": "audio/mpeg",
      ".mp4": "audio/mp4",
      ".wav": "audio/wav",
      ".aac": "audio/aac",
    };

    const extensionLower = extension.toLowerCase();
    return mimeTypes[extensionLower] || "audio/webm";
  };

  const startRecording = async (extension = ".webm") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: getMimeType(extension),
      });
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = getMimeType(extension);
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        if (audioBlob.size > 0) {
          setAudioBlob(audioBlob);
          handleAudioUpload(audioBlob);
        } else {
          console.error("AudioBlob ist leer. Aufnahme fehlgeschlagen.");
          toast.error("Audioaufnahme fehlgeschlagen.");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Mikrofonzugriff fehlgeschlagen:", error);
      toast.error(translations.toast.chatroom.audioNotSupported);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      console.error("MediaRecorder ist nicht initialisiert.");
    }
  };

  const handleAudioUpload = (audioBlob) => {
    if (!audioBlob) {
      console.error("Kein AudioBlob vorhanden. Aufnahme fehlgeschlagen.");
      toast.error("Keine gültige Audiodatei gefunden.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob);

    uploadAudioMutation.mutate(formData, {
      onSuccess: () => {
        setAudioBlob(null);
      },
      onError: (error) => {
        console.error("Fehler beim Hochladen der Audiodatei:", error);
        toast.error("Fehler beim Hochladen der Audiodatei.");
      },
    });
  };

  function handleImageChange(e) {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      uploadImageMutation.mutate(formData);
    }
  }

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

  function handleSendMessage(e) {
    e.preventDefault();
    const userInput = e.target.textarea.value
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
    if (userInput.trim() === "") return null;

    // Für normale Chats: Prüfen ob Partner gelöscht wurde
    if (
      !isGroupChat &&
      (partnerName === "deletedUser" || partnerName === undefined)
    ) {
      e.target.textarea.value = "";
      toast.dismiss();
      toast.error(translations.toast.existChatroom.errorDeletedUser, {
        position: "bottom-center",
      });
      return;
    }

    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      uploadImageMutation.mutate(formData);
    } else if (editingMessage) {
      editMessageMutation.mutate({
        messageId: editingMessage._id,
        content: userInput,
      });
    } else {
      sendMessageMutation.mutate(userInput);
    }

    e.target.textarea.style.height = "auto";
    messagesEndRef.current.scrollIntoView({ behavior: "auto" });
  }

  function handleKeyDown(event) {
    if (window.innerWidth >= 1024 && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      setShowEmojiPicker(false);
      handleSendMessage({
        preventDefault: () => {},
        target: { textarea: textareaRef.current },
      });
    }
  }

  function handleInput(event) {
    const textarea = event.target;
    textarea.style.height = "auto";
    const maxHeight = 150;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  }

  const latestMessageId =
    chatroomMessages?.length > 0 ? chatroomMessages.at(-1)._id : null;

  useEffect(() => {
    // Nur Socket erstellen wenn Chatroom-ID verfügbar ist
    if (!id) return;

    // Socket verbinden oder wiederverwenden
    socketManager
      .connect()
      .then(() => {
        // Event-Listener für Chatroom registrieren
        const handleMessage = (message) => {
          if (message.chatroom !== id) return;

          queryClient.setQueryData(["chatroom", id], (prevData) => {
            if (!prevData) {
              return { chatroomMessages: [message] };
            }

            // Prüfen ob Nachricht bereits existiert (verhindert Duplikate)
            const messageExists = prevData.chatroomMessages?.some(
              (existing) => existing._id === message._id
            );

            if (messageExists) {
              return prevData; // Keine Änderung wenn Nachricht bereits existiert
            }

            const updatedData = {
              ...prevData,
              unreadMessagesCount: nearBottom
                ? 0
                : prevData.unreadMessagesCount + 1,
              chatroomMessages: [...(prevData.chatroomMessages || []), message],
            };

            if (!nearBottom) {
              playAudio(audioReceive);
            }
            return updatedData;
          });
        };

        const handleMessageUpdate = ({ updatedMessage }) => {
          if (updatedMessage.chatroom.toString() !== id) return;

          queryClient.setQueryData(["chatroom", id], (prevData) => {
            if (!prevData) return prevData;

            const updatedMessages = prevData.chatroomMessages.map((message) =>
              message._id === updatedMessage._id ? updatedMessage : message
            );

            return {
              ...prevData,
              chatroomMessages: updatedMessages,
            };
          });
        };

        const handleMessageDelete = ({ deletedMessage }) => {
          if (deletedMessage.chatroom.toString() !== id) return;

          queryClient.setQueryData(["chatroom", id], (prevData) => {
            if (!prevData) return prevData;

            const deletedMessages = prevData.chatroomMessages.filter(
              (message) => message._id !== deletedMessage._id
            );

            return {
              ...prevData,
              chatroomMessages: deletedMessages,
            };
          });
        };

        // Listener mit eindeutiger Component-ID registrieren (einmal pro Chat)
        const componentId = `Chatroom-${id}`;
        socketManager.addListener("message", handleMessage, componentId);
        socketManager.addListener(
          "message-update",
          handleMessageUpdate,
          componentId
        );
        socketManager.addListener(
          "message-delete",
          handleMessageDelete,
          componentId
        );
      })
      .catch((error) => {
        console.error("Failed to connect socket in Chatroom:", error);
      });

    return () => {
      const componentId = `Chatroom-${id}`;
      socketManager.removeAllListeners(componentId);
    };
  }, [id, queryClient, nearBottom]);

  useEffect(() => {
    if (messagesEndRef.current && nearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [chatroomMessages, nearBottom]);

  useEffect(() => {
    function onscroll() {
      const position = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      const bottomDistance = scrollHeight - (position + viewportHeight);
      setNearBottom(bottomDistance < 100);
    }

    window.addEventListener("scroll", onscroll);

    return () => window.removeEventListener("scroll", onscroll);
  }, []);

  useEffect(() => {
    if (nearBottom && latestMessageId) {
      markAsRead();
      queryClient.setQueryData(["chatroom", id], (prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          unreadMessagesCount: 0,
        };
      });
    }
  }, [nearBottom, latestMessageId, markAsRead, queryClient, id]);

  // Mark edited messages as seen - optimized approach
  const markEditAsSeen = useCallback(
    async (messageId) => {
      if (processedEditMessagesRef.current.has(messageId)) return;

      processedEditMessagesRef.current.add(messageId);

      try {
        const response = await fetch(`/api/messages/mark-edit-seen`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId }),
        });

        if (response.ok) {
          queryClient.invalidateQueries(["chatroom", id]);
        }
      } catch (error) {
        console.error("Failed to mark edit as seen:", error);
      } finally {
        // Clean up after a delay to prevent immediate re-processing
        setTimeout(() => {
          processedEditMessagesRef.current.delete(messageId);
        }, 5000);
      }
    },
    [queryClient, id]
  );

  // Only mark messages from OTHER users, not own messages
  useEffect(() => {
    if (!chatroomMessages || !currentUserId) return;

    const editedMessagesToMark = chatroomMessages.filter((message) => {
      const isEdited = message.createdAt !== message.updatedAt;

      // Check if sender exists first, then check if it's own message
      if (!isEdited || !message.sender) return false;

      const isOwnMessage = message.sender._id === currentUserId;

      // Only process messages from other users
      if (isOwnMessage) return false;

      if (isGroupChat) {
        // Check if current user ID is in the editSeenBy array
        return !message.editSeenBy?.some((user) => user._id === currentUserId);
      } else {
        // For 1-to-1 chats: check if current user has seen the partner's edit
        return !message.editSeenByPartner;
      }
    });

    if (editedMessagesToMark.length === 0) return;

    // Mark messages as seen after a delay, but only if not already processed
    const timeoutIds = editedMessagesToMark.map((message) =>
      setTimeout(() => markEditAsSeen(message._id), 2000)
    );

    // Cleanup timeouts on unmount or dependency change
    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [chatroomMessages, currentUserId, isGroupChat, markEditAsSeen]);

  function handleEditMessage(message) {
    setEditingMessage(message);
    textareaRef.current.value = message.content;
    textareaRef.current.focus();
    textareaRef.current.style.outline = "2px solid yellow";

    setTimeout(() => {
      textareaRef.current.style.outline = "";
    }, 3000);
  }

  function handleDeleteMessage(message) {
    deleteMessageMutation.mutate({ messageId: message._id });
  }

  function handleEditDescription() {
    setTempDescription(groupInfo?.description || "");
    setEditingDescription(true);
  }

  function handleSaveDescription() {
    updateGroupDescriptionMutation.mutate({
      description: tempDescription.trim(),
    });
    setEditingDescription(false);
  }

  function handleCancelDescription() {
    setEditingDescription(false);
    setTempDescription("");
  }

  if ((data === undefined && !isLoading) || data?.errorMessage) {
    return <Navigate to={"/404"}></Navigate>;
  }

  function handleEmojiPicker() {
    setShowEmojiPicker(!showEmojiPicker);
  }

  function handleEmojiClick(emojiObject, event) {
    let emojiToInsert;

    // Handle custom emojis (like the Circassian flag)
    if (emojiObject.imgUrl) {
      // For custom emojis, use a special format that we can parse later
      emojiToInsert = `:${emojiObject.id}:`;
    } else {
      // For regular emojis
      emojiToInsert = emojiObject.emoji;
    }

    if (!emojiToInsert) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const text = textareaRef.current.value;
    const newText =
      text.slice(0, cursorPosition) +
      emojiToInsert +
      text.slice(cursorPosition);
    textareaRef.current.value = newText;

    const inputEvent = new Event("input", { bubbles: true });
    textareaRef.current.dispatchEvent(inputEvent);

    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        cursorPosition + emojiToInsert.length,
        cursorPosition + emojiToInsert.length
      );
    }, 0);
  }

  if (formatTimestampsIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {translations.chatroom.loading || "Loading chat..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                <img
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300",
                    isLoading && "opacity-0"
                  )}
                  src={
                    isGroupChat
                      ? getAvatarUrl(
                          groupInfo?.image,
                          groupInfo?.name || "Group"
                        )
                      : partnerName === "deletedUser" || !partnerName
                        ? robot
                        : getAvatarUrl(partnerAvatar, partnerName)
                  }
                  alt="avatar"
                  onError={
                    isGroupChat
                      ? createAvatarErrorHandler(groupInfo?.name || "Group")
                      : partnerName === "deletedUser" || !partnerName
                        ? undefined
                        : createAvatarErrorHandler(partnerName)
                  }
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                {isGroupChat ? groupInfo?.name : partnerName}
              </h1>
              {isGroupChat && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {members?.length}{" "}
                  {members?.length === 1 ? "member" : "members"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isGroupChat && userPermissions?.canInvite && (
              <button
                onClick={() => navigate(`/chatarea/groups/${id}/invite`)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {translations.chatroom?.invite || "Invite"}
              </button>
            )}

            {/* Settings Button - für Gruppenchats und 1-zu-1 Chats */}
            <button
              onClick={() =>
                navigate(
                  isGroupChat
                    ? `/chatarea/groups/${id}/settings`
                    : `/chatarea/chats/${id}/settings`
                )
              }
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isGroupChat ? "Group Settings" : "Chat Settings"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={() => navigate("/chatarea")}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Back to Chat List"
            >
              <BackButtonIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Group Description Section - only for group chats */}
      {isGroupChat && (
        <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            {editingDescription ? (
              <div className="flex items-center space-x-3">
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Add a group description..."
                  maxLength={200}
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  autoFocus
                />
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={handleSaveDescription}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                    title="Save description"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelDescription}
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                    title="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {groupInfo?.description ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {groupInfo.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No group description yet.
                    </p>
                  )}
                </div>
                {(userPermissions?.canEdit ||
                  userPermissions?.isAdmin ||
                  userPermissions?.isCreator) && (
                  <button
                    onClick={handleEditDescription}
                    className="ml-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit description"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {editingDescription && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {tempDescription.length}/200
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 pb-24">
        <div className="px-4 py-6 max-w-4xl mx-auto">
          {unreadMessagesCount > 0 && (
            <div className="sticky top-4 z-10 flex justify-center mb-4">
              <button
                onClick={() =>
                  messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-colors inline-flex items-center space-x-2 animate-bounce"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  {unreadMessagesCount === 1
                    ? `${unreadMessagesCount} ${translations.chatroom.unreadMessage}`
                    : `${unreadMessagesCount} ${translations.chatroom.unreadMessages}`}
                </span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            {Array.isArray(chatroomMessages) &&
              chatroomMessages.map((message, index) => {
                // System-Nachrichten anders darstellen
                if (message.isSystemMessage) {
                  return (
                    <div
                      key={`system-${message._id}`}
                      className="flex justify-center"
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 max-w-[80%] text-center border border-gray-200 dark:border-gray-600">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: parseCustomEmojis(message.content),
                          }}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTimestamp(message.createdAt, language)}
                        </div>
                      </div>
                    </div>
                  );
                }

                const isOwnMessage =
                  message.sender && message.sender._id === currentUserId;
                const isAudio = isAudioUrl(message.content);
                const isImage = isImageUrl(message.content);
                const isEdited = message.createdAt !== message.updatedAt;

                // Check if edited message should be highlighted (not seen by relevant users)
                // Only highlight messages from OTHER users, not own messages
                const shouldHighlightEdit =
                  isEdited &&
                  !isOwnMessage &&
                  (() => {
                    if (isGroupChat) {
                      // In group chats: highlight until current user has seen the edit
                      return !message.editSeenBy?.some(
                        (user) => user._id === currentUserId
                      );
                    } else {
                      // In 1-to-1 chats: highlight until current user has seen the edit from partner
                      return !message.editSeenByPartner;
                    }
                  })();

                return (
                  <div
                    key={`message-${message._id}`}
                    className={cn(
                      "flex",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                    ref={
                      index === chatroomMessages.length - 1
                        ? lastMessageRef
                        : null
                    }
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-6 relative group transition-all duration-300",
                        // Nur Text-Nachrichten bekommen einen Hintergrund
                        !isImage &&
                          !isAudio &&
                          (isOwnMessage
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-sm"),
                        // Audio-Nachrichten: weniger Padding
                        isAudio && "p-0",
                        // Image/Audio-Nachrichten: transparenter Hintergrund
                        (isImage || isAudio) &&
                          (isOwnMessage
                            ? "text-white"
                            : "text-gray-900 dark:text-white"),
                        // Highlight für bearbeitete Nachrichten
                        shouldHighlightEdit && [
                          "border-2 border-amber-400 dark:border-amber-500",
                          "shadow-lg shadow-amber-400/30 dark:shadow-amber-500/30",
                          "animate-pulse",
                          "ring-2 ring-amber-400/20 dark:ring-amber-500/20",
                          // Für Audio/Image Nachrichten: spezielle Border-Behandlung
                          isImage && "ring-offset-2 ring-offset-transparent",
                          isAudio && "ring-offset-2 ring-offset-transparent",
                        ]
                      )}
                    >
                      {/* Für Gruppenchats: Sender-Name anzeigen */}
                      {isGroupChat && !isOwnMessage && message.sender && (
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {message.sender.username}
                        </div>
                      )}

                      <div className="message-content">
                        {isAudio ? (
                          <audio controls className="max-w-full">
                            <source
                              src={message.content}
                              type={getMimeType(message.content)}
                            />
                            Your browser does not support the audio element.
                          </audio>
                        ) : isImage ? (
                          <img
                            src={message.content}
                            alt="uploaded"
                            className="max-w-full h-auto rounded-lg"
                          />
                        ) : (
                          <div
                            className="break-words whitespace-pre-line"
                            dangerouslySetInnerHTML={{
                              __html: parseCustomEmojis(message.content),
                            }}
                          />
                        )}
                      </div>

                      <div
                        className={cn(
                          "text-xs mt-2 flex items-center justify-end space-x-1",
                          isOwnMessage
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {isEdited && (
                          <div className="flex items-center space-x-1">
                            {shouldHighlightEdit && (
                              <div className="w-2 h-2 bg-amber-400 dark:bg-amber-500 rounded-full animate-pulse"></div>
                            )}
                            <span
                              className={cn(
                                "italic",
                                shouldHighlightEdit &&
                                  "text-amber-600 dark:text-amber-400 font-medium"
                              )}
                            >
                              {translations.chatroom.timestampUpdateText ||
                                "edited"}
                            </span>
                          </div>
                        )}
                        <span>
                          {formatTimestamp(message.createdAt, language)}
                        </span>
                      </div>

                      {/* Edit/Delete Buttons - mit Gruppenchat-Berechtigungen */}
                      {(() => {
                        // Für normale 1-zu-1 Chats: nur eigene Nachrichten
                        if (!isGroupChat) {
                          return isOwnMessage;
                        }

                        // Für Gruppenchats: Berechtigungen basierend auf Rollen
                        const canEdit = isOwnMessage; // Nur eigene Nachrichten bearbeiten

                        const canDelete =
                          isOwnMessage || // Eigene Nachrichten
                          userPermissions.isCreator || // Creator kann alle löschen
                          (userPermissions.isAdmin &&
                            !admins.some(
                              (admin) =>
                                admin.username === message.sender.username
                            ) &&
                            message.sender.username !==
                              groupInfo?.creator?.username); // Admin kann Member-Nachrichten löschen

                        return canEdit || canDelete;
                      })() && (
                        <div
                          className={cn(
                            "absolute top-1/2 transform -translate-y-1/2 flex flex-col space-y-8 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity",
                            isOwnMessage
                              ? isImage
                                ? "-left-0" // 4px Abstand bei Images für eigene Nachrichten
                                : "-left-8" // 4px Abstand bei Text/Audio für eigene Nachrichten
                              : "-right-8" // 4px Abstand rechts für andere User
                          )}
                        >
                          {/* Edit Button - nur für eigene Nachrichten */}
                          {isOwnMessage &&
                            !isImage &&
                            !isAudio &&
                            !message.isSystemMessage && (
                              <button
                                onClick={() => handleEditMessage(message)}
                                className="p-1 bg-white/90 dark:bg-gray-800/90 text-gray-800 hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-400 rounded-full shadow-lg transition-colors backdrop-blur-sm border border-gray-200 dark:border-gray-600"
                                title="Edit message"
                              >
                                <EditMessageIcon />
                              </button>
                            )}
                          {/* Delete Button - mit erweiterten Berechtigungen für Gruppenchats */}
                          {(() => {
                            if (!isGroupChat) {
                              return isOwnMessage; // In 1-zu-1 Chats nur eigene Nachrichten
                            }

                            const canDelete =
                              isOwnMessage || // Eigene Nachrichten
                              userPermissions.isCreator || // Creator kann alle löschen
                              (userPermissions.isAdmin &&
                                !admins.some(
                                  (admin) =>
                                    admin.username === message.sender.username
                                ) &&
                                message.sender.username !==
                                  groupInfo?.creator?.username); // Admin kann Member-Nachrichten löschen

                            return canDelete;
                          })() && (
                            <button
                              onClick={() => handleDeleteMessage(message)}
                              className="p-1 bg-white/90 dark:bg-gray-800/90 text-gray-800 hover:text-red-700 dark:text-gray-200 dark:hover:text-red-400 rounded-full shadow-lg transition-colors backdrop-blur-sm border border-gray-200 dark:border-gray-600"
                              title={
                                isOwnMessage
                                  ? "Delete message"
                                  : isGroupChat && userPermissions.isCreator
                                    ? "Delete message (Creator privilege)"
                                    : isGroupChat && userPermissions.isAdmin
                                      ? "Delete message (Admin privilege)"
                                      : "Delete message"
                              }
                            >
                              <DeleteMessageIcon />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
          <div ref={messagesEndRef} />

          {/* Scroll to bottom button */}
          {!nearBottom && (
            <div className="fixed bottom-30 right-1 z-10 animate-bounce">
              <button
                onClick={() =>
                  messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105"
                title="Scroll to bottom"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
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

      {/* Chat Input - Sticky at bottom */}
      <div className="sticky bottom-0 z-20 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                className="absolute bottom-full left-0 mb-2 z-50"
                style={{
                  maxHeight: "300px",
                  overflow: "hidden",
                }}
              >
                <EmojiPicker
                  width={Math.min(500, window.innerWidth - 32)}
                  height={300}
                  theme="auto"
                  reactionsDefaultOpen={true}
                  onEmojiClick={handleEmojiClick}
                  customEmojis={customEmojis}
                />
              </div>
            )}

            <div className="flex items-end space-x-3 bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 border border-gray-200 dark:border-gray-600">
              {/* Emoji Button - nur auf Desktop */}
              {window.innerWidth >= 1024 && (
                <button
                  type="button"
                  onClick={handleEmojiPicker}
                  className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                  title="Add emoji"
                >
                  <img src={Emojis} alt="Emojis" className="w-6 h-6" />
                </button>
              )}

              {/* Image Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors cursor-pointer"
                title="Upload image"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  name="textarea"
                  id="textarea"
                  rows={1}
                  onInput={handleInput}
                  ref={textareaRef}
                  onKeyDown={handleKeyDown}
                  autoFocus={window.innerWidth >= 1024}
                  className="w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 max-h-32 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                  placeholder="Hello, Word! …"
                  style={{ minHeight: "40px" }}
                />
              </div>

              {/* Voice Recording */}
              <button
                type="button"
                onClick={
                  isRecording ? stopRecording : () => startRecording(".webm")
                }
                className={cn(
                  "flex-shrink-0 p-2 rounded-xl transition-all",
                  isRecording
                    ? "text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
                title={isRecording ? "Stop recording" : "Start voice recording"}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {isRecording ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 7a1 1 0 10-2 0v6a1 1 0 102 0V7z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
              </button>

              {/* Send Button */}
              <button
                type="submit"
                onClick={() => setShowEmojiPicker(false)}
                className="flex-shrink-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  sendMessageMutation.isPending || editMessageMutation.isPending
                }
                title="Send message"
              >
                {sendMessageMutation.isPending ||
                editMessageMutation.isPending ? (
                  <svg
                    className="w-6 h-6 animate-spin"
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
                ) : (
                  <SendMessageIcon />
                )}
              </button>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Recording...</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
