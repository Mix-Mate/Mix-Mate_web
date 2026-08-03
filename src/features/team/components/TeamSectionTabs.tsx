import styles from "./team.module.css";

type TeamSection = "team" | "members" | "play";

interface TeamSectionTabsProps {
  groupId: string;
  activeSection: TeamSection;
  onNavigate: (href: string) => void;
}

export default function TeamSectionTabs({
  groupId,
  activeSection,
  onNavigate,
}: TeamSectionTabsProps) {
  const sections: Array<{
    id: TeamSection;
    label: string;
    href: string;
  }> = [
    { id: "team", label: "내 조", href: `/groups/${groupId}/team` },
    {
      id: "members",
      label: "멤버",
      href: `/groups/${groupId}/team?tab=members`,
    },
    { id: "play", label: "함께 즐기기", href: `/groups/${groupId}/play` },
  ];

  return (
    <nav className={styles.tabs} aria-label="그룹 메뉴">
      {sections.map((section) => {
        const isActive = section.id === activeSection;

        return (
          <button
            key={section.id}
            type="button"
            className={isActive ? styles.activeTab : styles.tab}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onNavigate(section.href)}
          >
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
