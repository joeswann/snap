import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import { useChat } from "~/contexts/ChatProvider";
import styles from "./ChatWindow.module.scss";
import CommonMarkdown from "../common/CommonMarkdown";
import { useEffect, useRef } from "react";
import { OutputMessage } from "~/lib/ai/types";

const ChatWindow: DefaultComponentInterface = ({ className }) => {
  const { messages } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatContentToMarkdown = (message: OutputMessage) => {
    if (typeof message.content === "string") return message.content;

    return message.content
      .map((content) => {
        if (content.type === "text") {
          return `${content.text}`;
        }
        return (content as any).content || content.name;
      })
      .join("\n\n");
  };

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
          <CommonMarkdown>{formatContentToMarkdown(message)}</CommonMarkdown>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
