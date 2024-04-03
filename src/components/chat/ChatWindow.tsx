import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import { useChat } from "~/contexts/ChatProvider";
import styles from "./ChatWindow.module.scss";
import CommonMarkdown from "../common/CommonMarkdown";

const ChatWindow: DefaultComponentInterface = ({ className }) => {
  const { messages } = useChat();
  return (
    <div className={cx(className, styles.container)}>
      {messages.length === 0 && (
        <div className={styles.message}>
          <CommonMarkdown>
            Welcome to Snap! You can start chatting by typing in the chat input
            below.
          </CommonMarkdown>
        </div>
      )}
      {messages.map((message) => (
        <div
          className={cx(styles.message, styles[`message--${message.role}`])}
          key={message.content}
        >
          <CommonMarkdown>{message.content}</CommonMarkdown>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
