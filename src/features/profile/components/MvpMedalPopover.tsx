"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, Lock } from "lucide-react";
import clsx from "clsx";
import {
  MVP_BADGE_TIERS,
  getMvpBadgeTier,
  getMvpBadgeTierInfo,
} from "@/shared/lib/mvp-badge";
import MvpMedalAngular from "@/shared/ui/MvpMedalAngular";
import styles from "./MvpMedalPopover.module.css";

const EDGE_GAP = 12;
const TRIGGER_SIZE = 36;
const HERO_SIZE = 64;

interface MvpMedalPopoverProps {
  mvpCount: number;
}

export default function MvpMedalPopover({ mvpCount }: MvpMedalPopoverProps) {
  const tier = getMvpBadgeTier(mvpCount);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("scroll", close, true);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const root = rootRef.current;
    if (!open || !card || !root) return;

    const frame = root.closest<HTMLElement>("[data-mobile-frame]");
    const boundary = (frame ?? document.documentElement).getBoundingClientRect();
    const anchor = root.getBoundingClientRect();
    const cardWidth = card.offsetWidth;
    const naturalLeft = anchor.left + anchor.width / 2 - cardWidth / 2;
    const minLeft = boundary.left + EDGE_GAP;
    const maxLeft = boundary.right - EDGE_GAP - cardWidth;
    const clampedLeft = Math.min(Math.max(naturalLeft, minLeft), maxLeft);

    card.style.setProperty("--mvp-popover-shift", `${clampedLeft - naturalLeft}px`);
  }, [open]);

  if (!tier) return null;

  const tierInfo = getMvpBadgeTierInfo(tier);
  const nextTierInfo = MVP_BADGE_TIERS.find((info) => info.tier > tier);

  return (
    <div ref={rootRef} className={styles.root} data-tier={tier}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${tierInfo.name} MVP 메달 상세 보기`}
        onClick={() => setOpen((value) => !value)}
      >
        <MvpMedalAngular tier={tier} size={TRIGGER_SIZE} />
      </button>

      {open && (
        <>
          <span className={styles.caret} aria-hidden="true" />
          <div
            ref={cardRef}
            className={styles.card}
            role="dialog"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <div className={styles.hero}>
              <span className={styles.heroRing}>
                <MvpMedalAngular tier={tier} size={HERO_SIZE} />
              </span>
            </div>

            <div className={styles.body}>
              <h3 id={titleId} className={styles.title}>
                {tierInfo.name} MVP
              </h3>
              <p id={descriptionId} className={styles.description}>
                지금까지 MVP로 {mvpCount}번 뽑혔어요.
              </p>

              <div className={styles.divider} />

              <span className={styles.sectionLabel}>등급 안내</span>
              <ol className={styles.tierList}>
                {MVP_BADGE_TIERS.map((info) => {
                  const unlocked = mvpCount >= info.minCount;
                  const isCurrent = info.tier === tier;
                  const isNext = info.tier === nextTierInfo?.tier;

                  return (
                    <li
                      key={info.tier}
                      className={clsx(
                        styles.tierRow,
                        unlocked && styles.tierUnlocked,
                        isCurrent && styles.tierCurrent,
                      )}
                    >
                      <span className={styles.tierMarker}>
                        {unlocked ? (
                          <Check size={12} strokeWidth={2.6} />
                        ) : (
                          <Lock size={11} strokeWidth={2.2} />
                        )}
                      </span>
                      <span className={styles.tierName}>{info.name}</span>
                      <span className={styles.tierMeta}>
                        {isNext
                          ? `${info.minCount - mvpCount}번 더 필요`
                          : `${info.minCount}회`}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
