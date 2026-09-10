import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./TabNavigation.module.css";

export interface TabNavigationItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

interface TabNavigationProps<TItem extends TabNavigationItem> {
  items: readonly TItem[];
  activeItemId: TItem["id"];
  ariaLabel: string;
  onSelect: (item: TItem) => void;
  className?: string;
}

export default function TabNavigation<TItem extends TabNavigationItem>({
  items,
  activeItemId,
  ariaLabel,
  onSelect,
  className,
}: TabNavigationProps<TItem>) {
  const activeIndex = Math.max(
    items.findIndex((item) => item.id === activeItemId),
    0,
  );

  return (
    <nav className={clsx(styles.tabs, className)} aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.id === activeItemId;

        return (
          <button
            key={item.id}
            type="button"
            className={clsx(
              styles.tab,
              isActive && styles.activeTab,
              item.disabled && styles.disabledTab,
            )}
            aria-current={isActive ? "page" : undefined}
            disabled={item.disabled}
            onClick={() => onSelect(item)}
          >
            {item.label}
          </button>
        );
      })}
      {items.length > 0 && (
        <span
          className={styles.indicator}
          aria-hidden="true"
          style={{
            width: `${100 / items.length}%`,
            transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
          }}
        />
      )}
    </nav>
  );
}
