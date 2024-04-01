"use client";
import { useContext, useEffect } from "react";
import { createContext } from "react";

import { DefaultComponentInterface } from "../types/components";
import { ChatStoreType, useChatStore } from "~/store/useChatStore";
import { useForm } from "react-hook-form";
import { fetchMessages } from "~/lib/ai/client";

export const ChatContext = createContext<
  | (ChatStoreType & {
      onSubmit: () => void;
      register: any;
    })
  | null
>(null);

export const ChatProvider: DefaultComponentInterface = ({
  children,
  ...props
}) => {
  const { register, handleSubmit, watch, reset, setValue, formState } =
    useForm();
  const chatStore = useChatStore()();

  const onSubmit = handleSubmit(async (data) => {
    const messages = await fetchMessages({
      messages: [
        ...chatStore.messages,
        { role: "user", content: data.content },
      ],
    });
    chatStore.setMessages(messages);
    reset();
  });

  return (
    <ChatContext.Provider value={{ ...chatStore, onSubmit, register }}>
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
