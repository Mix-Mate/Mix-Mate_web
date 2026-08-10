import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./MobileFrame.module.css";

interface MobileFrameProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  viewportClassName?: string;
}

export default function MobileFrame({
  children,
  className,
  viewportClassName,
  ...props
}: MobileFrameProps) {
  return (
    <main className={clsx(styles.viewport, viewportClassName)}>
      <section className={clsx(styles.phone, className)} {...props}>
        {children}
      </section>
    </main>
  );
}
