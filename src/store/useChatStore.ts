import { useRef } from "react";
import { create } from "zustand";
import { useForm } from "react-hook-form";
import { Messages } from "~/lib/ai/base";

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
