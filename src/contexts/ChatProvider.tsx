"use client";
import { useContext, useEffect } from "react";
import { createContext } from "react";

import { DefaultComponentInterface } from "../types/components";
import { ChatStoreType, useChatStore } from "~/store/useChatStore";
import { useForm } from "react-hook-form";
import { fetchMessage } from "~/lib/ai/fetch";

export const ChatContext = createContext<
  | (ChatStoreType & {
      onSubmit: () => void;
      reset: () => void;
      register: any;
    })
  | null
>(null);

export const ChatProvider: DefaultComponentInterface = ({ children }) => {
  const { register, handleSubmit, reset: formReset } = useForm();
  const chatStore = useChatStore()();

  const onSubmit = handleSubmit(async (data) => {
    if (data.content === "") return;
    formReset();
    const messages = await fetchMessage([
      ...chatStore.messages,
      { role: "user", content: data.content },
    ]);

    chatStore.setMessages(messages);
  });

  const reset = () => {
    console.log("reset");
    formReset();
    chatStore.setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ ...chatStore, reset, onSubmit, register }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("Missing ChatContext.Provider in the tree");
  return context;
};

export default useChat;
