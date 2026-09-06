import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./MobileFrame.module.css";

interface MobileFrameProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  viewportClassName?: string;
  fitViewport?: boolean;
}

export default function MobileFrame({
  children,
  className,
  viewportClassName,
  fitViewport = false,
  ...props
}: MobileFrameProps) {
  return (
    <main
      className={clsx(
        styles.viewport,
        fitViewport && styles.fitViewport,
        viewportClassName,
      )}
    >
      <section
        className={clsx(
          styles.phone,
          fitViewport && styles.fitPhone,
          className,
        )}
        {...props}
      >
        {children}
      </section>
    </main>
  );
}
