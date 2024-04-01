import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import styles from "./ChatInput.module.scss";
import useChat from "~/contexts/ChatProvider";

const ChatInput: DefaultComponentInterface = ({ className }) => {
  const { register, onSubmit } = useChat();
  return (
    <form onSubmit={onSubmit} className={cx(className, styles.container)}>
      <textarea
        {...register("content")}
        className={styles.input}
        placeholder="Chat"
      ></textarea>
      <button className={styles.button}>Submit</button>
    </form>
  );
};

export default ChatInput;
