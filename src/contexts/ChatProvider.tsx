"use client";
import { useContext, useState } from "react";
import { createContext } from "react";
import { useForm } from "react-hook-form";

import { DefaultComponentInterface } from "../types/components";
import { ChatStoreType } from "~/store/useChatStore";
import { OutputMessage } from "~/lib/ai/types";
import { fetchMessages } from "~/lib/ai/messages";

export const ChatContext = createContext<
  | (ChatStoreType & {
      onSubmit: () => void;
      reset: () => void;
      register: any;
    })
  | null
>(null);

export const ChatProvider: DefaultComponentInterface = ({ children }) => {
  const { handleSubmit, reset: formReset, register } = useForm();
  const [messages, setMessages] = useState<OutputMessage[]>([]);

  const onSubmit = handleSubmit(async (data) => {
    if (data.content === "") return;
    formReset();
    await fetchMessages(
      [...messages, { role: "user", content: data.content }],
      setMessages,
    );
  });

  const reset = () => {
    console.log("reset");
    formReset();
    setMessages([]);
  };
  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        onSubmit,
        reset,
        register,
      }}
    >
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
