import { Suspense } from "react";
import GroupJoinScreen from "@/screens/group/GroupJoinScreen";

export default function GroupJoinPage() {
  return (
    <Suspense fallback={null}>
      <GroupJoinScreen />
    </Suspense>
  );
}
