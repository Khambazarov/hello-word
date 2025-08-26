import { useState, useRef, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";

import EmojiPicker from "emoji-picker-react";

import { io } from "socket.io-client";

import { cn } from "../utils/cn.js";
import { formatTimestamp } from "../utils/formatTimestamp.js";
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

  const mediaRecorderRef = useRef(null);
  const textareaRef = useRef(null);
  const lastMessageRef = useRef(null);
  const messagesEndRef = useRef(null);

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
  const partnerName = data?.partnerName;
  const unreadMessagesCount = data?.unreadMessagesCount;

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

  const getMimeType = (extension) => {
    if (typeof extension !== "string") {
      console.error("Ungültige Dateiendung:", extension);
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

    if (partnerName === "deletedUser" || partnerName === undefined) {
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
    const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("message", (message) => {
      if (message.chatroom !== id) return;

      queryClient.setQueryData(["chatroom", id], (prevData) => {
        if (!prevData) {
          return { chatroomMessages: [message] };
        }

        const updatedData = {
          ...prevData,
          unreadMessagesCount: nearBottom
            ? 0
            : prevData.unreadMessagesCount + 1,
          chatroomMessages: [...prevData.chatroomMessages, message],
        };

        if (!nearBottom) {
          playAudio(audioReceive);
        }
        return updatedData;
      });
    });

    socket.on("message-update", ({ updatedMessage }) => {
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
    });

    socket.on("message-delete", ({ deletedMessage }) => {
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
    });

    return () => {
      socket.off("message");
      socket.off("message-update");
      socket.off("message-delete");
    };
  }, [id, queryClient, nearBottom, partnerName]);

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
      setNearBottom(bottomDistance < 50);
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

  if ((data === undefined && !isLoading) || data?.errorMessage) {
    return <Navigate to={"/404"}></Navigate>;
  }

  function handleEmojiPicker() {
    setShowEmojiPicker(!showEmojiPicker);
  }

  function handleEmojiClick(emojiObject, event) {
    const emoji = emojiObject.emoji || emojiObject.imgUrl;
    if (!emoji) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const text = textareaRef.current.value;
    const newText =
      text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);
    textareaRef.current.value = newText;

    const inputEvent = new Event("input", { bubbles: true });
    textareaRef.current.dispatchEvent(inputEvent);

    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        cursorPosition + emoji.length,
        cursorPosition + emoji.length
      );
    }, 0);
  }

  if (formatTimestampsIsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{translations.chatroom.loading || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col dark:bg-[#1d232a] dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-between  items-center pl-2 sticky top-0 bg-gray-700">
        <div className="relative aspect-square h-12 border-2 border-gray-100 bg-gray-400 rounded-full mt-2 mr-2 overflow-hidden hover:scale-120 duration-300 z-10">
          <img
            className={cn(
              "transition-all absolute inset-0 w-full h-full object-cover transform duration-300 hover:scale-170 z-50",
              isLoading && "opacity-0"
            )}
            src={
              partnerName === "deletedUser" || !partnerName
                ? robot
                : `https://robohash.org/${partnerName}`
            }
            alt="avatar"
          />
        </div>
        <h1 className="md:text-base xl:text-3xl text-white tracking-widest font-bold absolute left-1/2 transform -translate-x-1/2">
          {partnerName}
        </h1>

        <button
          onClick={() => navigate("/chatarea")}
          className="cursor-pointer pr-4 scr"
        >
          <BackButtonIcon />
        </button>
      </header>
      <div className="flex flex-col h-full flex-grow ">
        {unreadMessagesCount > 0 && (
          <button
            onClick={() =>
              messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
            }
            className="cursor-pointer dark:bg-white/10 bg-gray-700 shadow-lg shadow-blue-900/30 backdrop-blur-[5.5px] text-xl rounded-[10px] border border-white/20 text-amber-400 sticky top-[50%] mx-auto px-8 py-1 font-bold dark:hover:bg-white/20 hover:bg-gray-600 transition-colors animate-bounce"
          >
            {unreadMessagesCount === 1
              ? `↓ ${unreadMessagesCount} ${translations.chatroom.unreadMessage}`
              : `↓ ${unreadMessagesCount} ${translations.chatroom.unreadMessages}`}
          </button>
        )}
        {Array.isArray(chatroomMessages) &&
          chatroomMessages.map((message, index) => (
            <div
              className={cn(
                "px-4 pt-2 mx-2 my-6 rounded-xl w-fit max-w-[75%] dark:text-gray-100 text-gray-900  dark:bg-transparent",
                isAudioUrl(message.content) &&
                  message.sender.username === currentUsername
                  ? "ml-auto"
                  : isAudioUrl(message.content) &&
                      message.sender.username !== currentUsername
                    ? ""
                    : message.sender.username === currentUsername
                      ? "border-2 border-blue-400  bg-blue-50 rounded-br-none ml-auto"
                      : "border-2 border-amber-400  bg-amber-50 rounded-bl-none"
              )}
              key={message._id}
              ref={
                index === chatroomMessages.length - 1 ? lastMessageRef : null
              }
            >
              {isAudioUrl(message.content) ? (
                <audio controls className="border-0">
                  <source
                    src={message.content}
                    type={getMimeType(message.content)}
                  />
                  Your browser does not support the audio element.
                </audio>
              ) : isImageUrl(message.content) ? (
                <img src={message.content} alt="uploaded" />
              ) : (
                <p className="break-words whitespace-pre-line min-w-40">
                  {message.content}
                </p>
              )}
              <span className="pt-1 flex justify-end text-[12px] dark:text-gray-400 text-gray-600">
                {message.createdAt !== message.updatedAt
                  ? `( ${translations.chatroom.timestampUpdateText} ) ${formatTimestamp(message.createdAt, language)}`
                  : `${formatTimestamp(message.createdAt, language)}`}
              </span>
              {message.sender.username === currentUsername && (
                <div className="relative">
                  <button
                    onClick={() => handleEditMessage(message)}
                    className="absolute -left-3 top-1 dark:text-gray-400 text-gray-700"
                  >
                    {!isImageUrl(message.content) &&
                      !isAudioUrl(message.content) && <EditMessageIcon />}
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message)}
                    className="absolute top-1 -right-3 dark:text-gray-400 text-gray-700"
                  >
                    <DeleteMessageIcon />
                  </button>
                </div>
              )}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
      <Toaster />
      <form onSubmit={handleSendMessage} className="sticky bottom-0">
        {showEmojiPicker && (
          <div
            className="fixed left-0"
            style={{ bottom: `${textareaHeight + 16}px` }}
          >
            <EmojiPicker
              className=""
              width={500}
              theme="auto"
              reactionsDefaultOpen={true}
              onEmojiClick={handleEmojiClick}
              customEmojis={customEmojis}
            />
          </div>
        )}

        <div className="flex items-center py-4 rounded bg-gray-700">
          {window.innerWidth >= 1024 && (
            <label className="my-auto cursor-pointer text-gray-400 ml-2 hover:text-white hover:scale-120 duration-300">
              <img
                src={Emojis}
                alt="Emojis picker"
                width={32}
                onClick={handleEmojiPicker}
              />
            </label>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />

          <label
            htmlFor="image-upload"
            className="cursor-pointer mx-3 material-symbols-outlined text-white"
          >
            add
          </label>

          <textarea
            name="textarea"
            id="textarea"
            rows={1}
            onInput={handleInput}
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            autoFocus={window.innerWidth >= 1024}
            className="[scrollbar-width:thin] resize-none min-h-8 block mx-3 p-2 w-full text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Hello, Word! …"
          />

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`material-symbols-outlined absolute right-16 flex items-center cursor-pointer ${
              isRecording
                ? "text-red-500 animate-pulse"
                : "dark:text-white text-gray-700"
            }`}
          >
            {isRecording ? "settings_voice" : "mic"}
          </button>

          <button
            type="submit"
            onClick={() => setShowEmojiPicker(false)}
            className="inline-flex justify-center pr-3 text-[rgb(229,47,64)] cursor-pointer"
          >
            <SendMessageIcon />
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </div>
  );
};
