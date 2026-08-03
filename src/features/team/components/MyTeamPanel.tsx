import { Info } from "lucide-react";
import type { MyTeamData, TeamMemberSummary } from "../types/team.types";
import TeamMemberList from "./TeamMemberList";
import styles from "./team.module.css";

interface MyTeamPanelProps {
  team: MyTeamData;
  onMemberSelect: (member: TeamMemberSummary) => void;
}

export default function MyTeamPanel({
  team,
  onMemberSelect,
}: MyTeamPanelProps) {
  return (
    <section className={styles.teamPanel} aria-labelledby="team-members-title">
      <header className={styles.panelHeader}>
        <h2 id="team-members-title">같은 조 멤버</h2>
        <span>
          {team.teamNumber}조 · {team.members.length}명
        </span>
      </header>

      <div className={styles.infoBanner}>
        <Info aria-hidden="true" size={16} strokeWidth={1.8} />
        <p>
          현재 자리에서 같은 조로 배정된 멤버입니다.
          <br />
          멤버를 탭하면 프로필을 확인할 수 있습니다.
        </p>
      </div>

      <TeamMemberList members={team.members} onSelect={onMemberSelect} />
    </section>
  );
}
