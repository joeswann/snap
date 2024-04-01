"use client";
import { ChatSidebar } from "./ChatSidebar";
import styles from "./ChatApp.module.scss";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import { ChatProvider } from "~/contexts/ChatProvider";

const ChatApp = () => {
  return (
    <ChatProvider>
      <div className={styles.container}>
        <ChatSidebar className={styles.sidebar} />
        <ChatWindow className={styles.window} />
        <ChatInput className={styles.input} />
      </div>
    </ChatProvider>
  );
};

export default ChatApp;
