import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import AdminParticipantStatisticsScreen from "@/screens/admin/AdminParticipantStatisticsScreen";

export default function ParticipantStatisticsPage() {
  return (
    <AdminAccessGuard>
      <AdminParticipantStatisticsScreen />
    </AdminAccessGuard>
  );
}
