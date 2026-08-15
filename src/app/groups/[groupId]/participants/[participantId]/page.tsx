import ParticipantProfileScreen from "@/screens/common/ParticipantProfileScreen";

interface ParticipantProfilePageProps {
  params: Promise<{
    groupId: string;
    participantId: string;
  }>;
}

export default async function ParticipantProfilePage({
  params,
}: ParticipantProfilePageProps) {
  const { groupId, participantId } = await params;

  return (
    <ParticipantProfileScreen
      groupId={groupId}
      participantId={participantId}
    />
  );
}
