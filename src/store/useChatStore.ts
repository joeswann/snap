import { useRef } from "react";
import { create } from "zustand";
import { OutputMessage } from "~/lib/ai/types";

export type ChatStateType = {
  messages: OutputMessage[];
};

export type ChatStoreType = ChatStateType & {
  setMessages: (messages: ChatStateType["messages"]) => void;
};

export const useChatStore = () => {
  const store = useRef(
    create<ChatStoreType>()((set) => ({
      messages: [],

      setMessages(messages) {
        set({ messages });
      },
    })),
  ).current;

  return store;
};
