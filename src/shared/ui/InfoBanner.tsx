import clsx from "clsx";
import { Info } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./InfoBanner.module.css";

interface InfoBannerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function InfoBanner({
  children,
  className,
  ...props
}: InfoBannerProps) {
  return (
    <div className={clsx(styles.banner, className)} {...props}>
      <Info
        className={styles.icon}
        aria-hidden="true"
        size={18}
        strokeWidth={1.8}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
