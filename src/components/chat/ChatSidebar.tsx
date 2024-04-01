import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";

export const ChatSidebar: DefaultComponentInterface = ({ className }) => {
  return <div className={cx(className)}>Chat </div>;
};
