"use client";
import styles from "./ChatHeader.module.scss";
import CommonButton from "../common/CommonButton";
import { DefaultComponentInterface } from "~/types/components";
import useChat from "~/contexts/ChatProvider";
import classNames from "classnames";

const ChatHeader: DefaultComponentInterface = ({ className }) => {
  const { reset } = useChat();
  return (
    <header className={classNames(className, styles.header)}>
      <h1>Snap</h1>
      <CommonButton className={styles.button} onClick={() => reset()}>
        New Chat
      </CommonButton>
    </header>
  );
};

export default ChatHeader;
