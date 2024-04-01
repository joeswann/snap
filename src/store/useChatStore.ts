import { useRef } from "react";
import { create } from "zustand";
import { Messages } from "~/lib/ai/client";
import { useForm } from "react-hook-form";

export type ChatStateType = {
  messages: Messages;
};

export type ChatStoreType = ChatStateType & {
  setMessages: (messages: ChatStateType["messages"]) => void;
};

export const useChatStore = () => {
  const store = useRef(
    create<ChatStoreType>()((set, get) => ({
      messages: [],

      setMessages(messages) {
        set({ messages });
      },
    })),
  ).current;

  return store;
};
