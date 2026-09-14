export type RosterRoundType = "FIRST_ROUND" | "SECOND_ROUND";
export type RosterGrade = "FIRST" | "SECOND" | "THIRD" | "FOURTH";
export type RosterGender = "MALE" | "FEMALE";

export interface RosterMember {
  studentId: string;
  displayName: string;
  major: string;
  grade: RosterGrade;
  gender: RosterGender;
  teamNumber: number | null;
}

export interface RosterRound {
  round: RosterRoundType;
  assigned: boolean;
  members: RosterMember[];
}

export interface GroupRoster {
  groupName: string;
  rounds: RosterRound[];
}

