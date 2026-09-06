import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import AddParticipantScreen from "@/screens/admin/AddParticipantScreen";

export default function AddParticipantPage() {
  return (
    <AdminAccessGuard>
      <AddParticipantScreen />
    </AdminAccessGuard>
  );
}
