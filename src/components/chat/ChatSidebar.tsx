import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import CommonButton from "../common/CommonButton";
import useChat from "~/contexts/ChatProvider";

export const ChatSidebar: DefaultComponentInterface = ({ className }) => {
  const { setMessages } = useChat();
  const reset = () => setMessages([]);

  return (
    <div className={cx(className)}>
      {/* <CommonButton onClick={reset}>New Chat</CommonButton> */}
    </div>
  );
};
