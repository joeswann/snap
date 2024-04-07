import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import { useChat } from "~/contexts/ChatProvider";
import styles from "./ChatWindow.module.scss";
import CommonMarkdown from "../common/CommonMarkdown";
import { useEffect, useRef } from "react";

const ChatWindow: DefaultComponentInterface = ({ className }) => {
  const { messages } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={cx(className, styles.container)} ref={containerRef}>
      {messages.length === 0 && (
        <div className={styles.message}>
          <CommonMarkdown>
            Welcome to Snap! You can start chatting by typing in the chat input
            below.
          </CommonMarkdown>
        </div>
      )}
      {messages.map((message: any) => (
        <div
          className={cx(styles.message, styles[`message--${message.role}`])}
          key={message.content}
        >
          <CommonMarkdown>{message.content || message.text}</CommonMarkdown>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
