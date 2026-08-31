import { ChevronRight, Dices, Users, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import styles from "./session.module.css";

interface SessionMenuGridProps {
  groupId: string;
  round: 1 | 2;
  onNavigate: (href: string) => void;
}

interface SessionMenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export default function SessionMenuGrid({
  groupId,
  round,
  onNavigate,
}: SessionMenuGridProps) {
  const menuItems: SessionMenuItem[] = [
    {
      title: "같은 조 보기",
      href: groupRoutes.teamMembers(groupId),
      icon: UsersRound,
    },
    {
      title: "참가자 목록",
      // TODO(participants-integration): 참가자 목록 담당자의 페이지가 완성되면 이 경로에서 연결된다.
      href: groupRoutes.participants(groupId, round),
      icon: Users,
    },
    {
      title: "함께 즐기기",
      href: groupRoutes.play(groupId),
      icon: Dices,
    },
  ];

  return (
    <nav className={styles.menuList} aria-label="그룹 홈 메뉴">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.href}
            type="button"
            className={styles.menuCard}
            onClick={() => onNavigate(item.href)}
          >
            <span className={styles.menuIcon}>
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            </span>
            <span className={styles.menuText}>
              <strong>{item.title}</strong>
            </span>
            <ChevronRight aria-hidden="true" size={20} strokeWidth={1.8} />
          </button>
        );
      })}
    </nav>
  );
}
