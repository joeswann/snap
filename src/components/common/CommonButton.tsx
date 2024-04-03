import { DefaultComponentInterface } from "~/types/components";
import cx from "classnames";
import styles from "./CommonButton.module.scss";

const CommonButton: DefaultComponentInterface<{
  onClick?: (e: any) => void;
}> = ({ className, children, onClick }) => {
  return (
    <button onClick={onClick} className={cx(className, styles.button)}>
      {children}
    </button>
  );
};
export default CommonButton;
