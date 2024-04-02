"use client";

import { useContext, useEffect } from "react";
import { createContext } from "react";
import { DefaultComponentInterface } from "../types/components";
import { ChatStoreType, useChatStore } from "~/store/useChatStore";
import { useForm } from "react-hook-form";
import { AdditionTool, additionToolDescription } from "~/lib/ai/tools/addition";
import ToolUser from "~/lib/ai/base";

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

  const additionTool = new AdditionTool();
  const toolUser = new ToolUser([additionTool]);

  const onSubmit = handleSubmit(async (data) => {
    const messages = await toolUser.useTools(
      [...chatStore.messages, { role: "user", content: data.content }],
      [additionToolDescription],
      0,
      "automatic",
    );

    chatStore.setMessages(messages as any);
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
