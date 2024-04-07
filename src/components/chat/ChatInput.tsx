import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import styles from "./ChatInput.module.scss";
import useChat from "~/contexts/ChatProvider";
import CommonButton from "../common/CommonButton";

const ChatInput: DefaultComponentInterface = ({ className }) => {
  const { register, onSubmit } = useChat();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className={cx(className, styles.container)}>
      <textarea
        {...register("content")}
        className={styles.input}
        placeholder="Chat"
        required
        onKeyDown={handleKeyDown}
      ></textarea>
      <div className={styles.buttons}>
        <CommonButton className={styles.button}>Submit</CommonButton>
      </div>
    </form>
  );
};

export default ChatInput;
