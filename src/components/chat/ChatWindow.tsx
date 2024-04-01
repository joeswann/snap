import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import { useChat } from "~/contexts/ChatProvider";
import styles from "./ChatWindow.module.scss";

const ChatWindow: DefaultComponentInterface = ({ className }) => {
  const { messages } = useChat();
  return (
    <div className={cx(className, styles.container)}>
      {messages.map((message) => (
        <div
          className={cx(styles.message, styles[`message--${message.role}`])}
          key={message.content}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
