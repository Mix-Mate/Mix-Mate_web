import type { ComponentPropsWithRef, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "danger" | "secondary";

// ref까지 그대로 넘겨, 호출부에서 실제 button 엘리먼트를 참조할 수 있게 한다.
interface ButtonProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export default function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
