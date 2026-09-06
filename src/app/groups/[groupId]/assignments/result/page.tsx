import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import AssignmentResultScreen from "@/screens/admin/AssignmentResultScreen";

export default function AssignmentResultPage() {
  return (
    <AdminAccessGuard>
      <AssignmentResultScreen />
    </AdminAccessGuard>
  );
}
