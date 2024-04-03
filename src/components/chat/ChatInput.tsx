import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import styles from "./ChatInput.module.scss";
import useChat from "~/contexts/ChatProvider";
import CommonButton from "../common/CommonButton";

const ChatInput: DefaultComponentInterface = ({ className }) => {
  const { register, onSubmit, setMessages } = useChat();

  const reset = (e: any) => {
    e.prevenDefault();
    setMessages([]);
  };
  return (
    <form onSubmit={onSubmit} className={cx(className, styles.container)}>
      <textarea
        {...register("content")}
        className={styles.input}
        placeholder="Chat"
        required
      ></textarea>
      <div className={styles.buttons}>
        <CommonButton className={styles.button} onClick={reset}>
          Reset
        </CommonButton>

        <CommonButton className={styles.button}>Submit</CommonButton>
      </div>
    </form>
  );
};

export default ChatInput;
