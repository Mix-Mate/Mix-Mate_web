import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import AssignmentProcessingScreen from "@/screens/admin/AssignmentProcessingScreen";

export default function AssignmentProcessingPage() {
  return (
    <AdminAccessGuard>
      <AssignmentProcessingScreen />
    </AdminAccessGuard>
  );
}
