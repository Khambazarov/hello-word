import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import EmojiPicker from "emoji-picker-react";
import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";
import {
  getAvatarUrl,
  createAvatarErrorHandler,
} from "../utils/avatarHelper.js";

import robot from "../assets/robot.png";
import Emojis from "../assets/add_reaction.svg";
import flagOfCircassians from "../assets/flag_of_circassians.png";
import fingerSnap from "../assets/finger-snap.mp3";
import positiveNotification from "../assets/positive-notification.wav";
import { BackButtonIcon, SendMessageIcon } from "./_AllSVGs";

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

export const NewChatroom = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(40);
  const [image, setImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const navigate = useNavigate();
  const { username } = useParams();
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["newChatroom"],
    queryFn: fetchUserLanguage,
  });

  // Lade Benutzerinformationen direkt über API
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo", username],
    queryFn: async () => {
      const response = await fetch(`/api/users/search?username=${username}`, {
        credentials: "include",
      });
      if (!response.ok) {
        // Fallback: Versuche es über Chatroom-Daten
        const chatroomsResponse = await fetch(`/api/chatrooms/chats`, {
          credentials: "include",
        });
        if (chatroomsResponse.ok) {
          const chatroomsData = await chatroomsResponse.json();
          const partnerInfo = chatroomsData?.chatrooms?.find(
            (chatroom) =>
              !chatroom.isGroupChat && chatroom.usernames?.includes(username)
          );
          return { avatar: partnerInfo?.partnerAvatar };
        }
        return { avatar: null };
      }
      return response.json();
    },
    enabled: !!username,
  });

  const [translations, setTranslations] = useState(
    getTranslations(data?.language || "en")
  );

  useEffect(() => {
    if (data?.language) {
      setTranslations(getTranslations(data.language));
    }
  }, [data]);

  // Audio-Lautstärke basierend auf User-Einstellungen
  const volume = data?.volume;
  audioSend.volume = volume === "silent" ? 0 : volume === "middle" ? 0.5 : 1;
  audioReceive.volume = volume === "silent" ? 0 : volume === "middle" ? 0.5 : 1;

  const mutation = useMutation({
    mutationFn: async (userInput) => {
      const response = await fetch(`/api/chatrooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partnerName: username,
          content: userInput,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["chatroom", data.chatroomId]);
      navigate(`/chatarea/chats/${data.chatroomId}`);
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
      mutation.mutate(data.url);
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
      mutation.mutate(data.url);
      setImage(null);
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
      toast.error(
        translations.toast?.chatroom?.audioNotSupported || "Audio not supported"
      );
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

  function handleSendMessage(e) {
    e.preventDefault();
    const userInput = e.target.textarea.value
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
    if (userInput.trim() === "") return null;

    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      uploadImageMutation.mutate(formData);
    } else {
      mutation.mutate(userInput);
    }

    e.target.textarea.value = "";
    e.target.textarea.style.height = "auto";
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{translations.newChatroom.loading || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-between  items-center pl-2 sticky top-0 bg-gray-700">
        <img
          className="relative mt-2 mr-2 overflow-hidden hover:scale-120 duration-300 z-50 aspect-square h-12 border-2 border-gray-100 bg-gray-400 rounded-full"
          src={getAvatarUrl(userInfo?.avatar, username)}
          alt="avatar"
          onError={createAvatarErrorHandler(username)}
        />
        <h1 className="md:text-base xl:text-3xl text-white tracking-widest font-bold absolute left-1/2 transform -translate-x-1/2">
          {username}
        </h1>

        <button
          onClick={() => navigate("/chatarea")}
          className="cursor-pointer pr-4"
        >
          <BackButtonIcon />
        </button>
      </header>
      <div className="relative flex flex-col h-full flex-grow">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-nowrap text-2xl text-center">
          <h2>{translations.newChatroom.firstMessage}</h2>
          <h2>
            {translations.newChatroom.to} {username}
          </h2>
        </div>
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

        <div className="flex items-center py-2 rounded bg-gray-700">
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
            className="[scrollbar-width:thin] resize-none min-h-8 block mx-3 p-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Hello, word! …"
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
