"use client";

import { useState } from "react";
import { Ban, ChevronLeft, Menu } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantPageHeaderProps {
  groupName?: string;
  participantCount: number;
  title?: string;
  backHref?: string;
  backLabel?: string;
  showMenu?: boolean;
}

export default function ParticipantPageHeader({
  groupName,
  participantCount,
  title = "참가자 목록",
  backHref,
  backLabel = "그룹 홈으로 이동",
  showMenu,
}: ParticipantPageHeaderProps) {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: group } = useAdminGroupQuery(params.groupId);

  const isHost = group?.myRole === "HOST";
  const shouldShowMenu = showMenu !== undefined ? showMenu && isHost : isHost;

  const handleNavigateBlacklist = () => {
    setMenuOpen(false);
    router.push(`/groups/${params.groupId}/admin/blacklist`);
  };

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backButton}
        aria-label={backLabel}
        onClick={() =>
          router.push(backHref ?? `/groups/${params.groupId}/home`)
        }
      >
        <ChevronLeft aria-hidden="true" size={24} strokeWidth={1.7} />
      </button>

      <div className={styles.titleArea}>
        <h1>{title}</h1>
        <p>
          {groupName ? `${groupName} · ` : ""}
          {participantCount}명
        </p>
      </div>

      {shouldShowMenu ? (
        <>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="관리자 메뉴 열기"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu aria-hidden="true" size={22} strokeWidth={1.8} />
          </button>

          {menuOpen && (
            <>
              <div
                className={styles.menuBackdrop}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className={styles.menuDropdown} role="menu">
                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  role="menuitem"
                  onClick={handleNavigateBlacklist}
                >
                  <Ban size={18} strokeWidth={2} />
                  <span>그룹 차단 목록</span>
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div />
      )}
    </header>
  );
}
