import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./MobileFrame.module.css";

interface MobileFrameProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  viewportClassName?: string;
  /** 실제 기기 높이(100dvh)에 맞춰 프레임을 꽉 채움. 컨텐츠가 고정 px 높이가 아니라
   * flex로 남은 공간을 채우도록 짜여있는 화면에서만 사용할 것. */
  fillHeight?: boolean;
}

export default function MobileFrame({
  children,
  className,
  viewportClassName,
  fillHeight = false,
  ...props
}: MobileFrameProps) {
  return (
    <main
      className={clsx(
        styles.viewport,
        fillHeight && styles.fillHeight,
        viewportClassName,
      )}
    >
      <section
        className={clsx(styles.phone, fillHeight && styles.fillHeight, className)}
        {...props}
      >
        {children}
      </section>
    </main>
  );
}
