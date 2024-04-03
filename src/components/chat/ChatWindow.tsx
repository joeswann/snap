import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import { useChat } from "~/contexts/ChatProvider";
import styles from "./ChatWindow.module.scss";
import CommonMarkdown from "../common/CommonMarkdown";

const ChatWindow: DefaultComponentInterface = ({ className }) => {
  const { messages } = useChat();
  return (
    <div className={cx(className, styles.container)}>
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
