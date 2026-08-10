import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Toast.module.css";

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Toast({ children, className, ...props }: ToastProps) {
  return (
    <div className={clsx(styles.toast, className)} role="status" {...props}>
      {children}
    </div>
  );
}
