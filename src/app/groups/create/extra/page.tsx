import { Suspense } from "react";
import GroupExtraInfoScreen from "@/screens/group/GroupExtraInfoScreen";

export default function GroupCreateExtraPage() {
  return (
    <Suspense fallback={null}>
      <GroupExtraInfoScreen groupId="new" />
    </Suspense>
  );
}
