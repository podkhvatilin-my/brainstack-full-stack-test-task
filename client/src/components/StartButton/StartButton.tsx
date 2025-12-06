import styles from "./StartButton.module.css";

interface StartButtonProps {
  onStart: () => void;
}

export const StartButton = (props: StartButtonProps) => {
  const { onStart } = props;

  return (
    <button type="button" onClick={onStart} className={styles.button}>
      Start Camera
    </button>
  );
};
