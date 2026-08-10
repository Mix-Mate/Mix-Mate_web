import TabNavigation from "@/shared/ui/TabNavigation";

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
    <TabNavigation
      items={sections}
      activeItemId={activeSection}
      ariaLabel="그룹 메뉴"
      onSelect={(section) => onNavigate(section.href)}
    />
  );
}
