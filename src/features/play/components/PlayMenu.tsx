import { ChevronRight, MessageCircle, Scale, Shuffle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./play.module.css";

interface PlayMenuProps {
  groupId: string;
  onNavigate: (href: string) => void;
}

interface PlayMenuItem {
  title: string;
  description: string;
  path: "games" | "small-talk" | "balance";
  icon: LucideIcon;
}

const menuItems: PlayMenuItem[] = [
  {
    title: "랜덤 술게임",
    description: "우리 조에 어울리는 게임을 랜덤으로 추천해드려요.",
    path: "games",
    icon: Shuffle,
  },
  {
    title: "스몰토크",
    description: "어색함을 풀어줄 다양한 대화 주제를 만나보세요.",
    path: "small-talk",
    icon: MessageCircle,
  },
  {
    title: "밸런스 게임",
    description: "가볍게 선택하고 서로의 취향을 알아가보세요.",
    path: "balance",
    icon: Scale,
  },
];

export default function PlayMenu({ groupId, onNavigate }: PlayMenuProps) {
  return (
    <section className={styles.playMenu} aria-labelledby="play-menu-title">
      <header className={styles.menuIntro}>
        <h2 id="play-menu-title">우리끼리 즐기기</h2>
        <p>어색함을 풀고 더 즐거운 시간을 만들어보세요.</p>
      </header>

      <div className={styles.menuCards}>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              className={styles.menuCard}
              onClick={() => onNavigate(`/groups/${groupId}/play/${item.path}`)}
            >
              <span className={styles.menuIcon}>
                <Icon aria-hidden="true" size={24} strokeWidth={1.7} />
              </span>
              <span className={styles.menuText}>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <ChevronRight aria-hidden="true" size={18} strokeWidth={1.7} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
