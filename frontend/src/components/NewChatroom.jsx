import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import EmojiPicker from "emoji-picker-react";
import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";

import robot from "../assets/robot.png";
import Emojis from "../assets/add_reaction.svg";
import { BackButtonIcon, SendMessageIcon } from "./_AllSVGs";

export const NewChatroom = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(40);

  const navigate = useNavigate();
  const { username } = useParams();
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["newChatroom"],
    queryFn: fetchUserLanguage,
  });

  const [translations, setTranslations] = useState(
    getTranslations(data?.language || "en")
  );

  useEffect(() => {
    if (data?.language) {
      setTranslations(getTranslations(data.language));
    }
  }, [data]);

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
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  function handleSendMessage(e) {
    e.preventDefault();
    const userInput = e.target.textarea.value;

    mutation.mutate(userInput);
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
          src={username ? `https://robohash.org/${username}` : robot}
          alt="avatar"
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
          ></textarea>

          <button
            type="submit"
            onClick={() => setShowEmojiPicker(false)}
            className="inline-flex justify-center pr-3 text-[rgb(229,47,64)] cursor-pointer"
          >
            <SendMessageIcon />
          </button>
        </div>
      </form>
    </div>
  );
};
