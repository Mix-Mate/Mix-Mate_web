import { Suspense } from "react";
import GroupExtraInfoScreen from "@/screens/group/GroupExtraInfoScreen";

interface GroupExtraInfoPageProps {
  params: Promise<{ groupId: string }> | { groupId: string };
}

export default async function GroupExtraInfoPage({
  params,
}: GroupExtraInfoPageProps) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={null}>
      <GroupExtraInfoScreen groupId={resolvedParams.groupId} />
    </Suspense>
  );
}
