import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import AssignmentSetupScreen from "@/screens/admin/AssignmentSetupScreen";

export default function AssignmentSetupPage() {
  return (
    <AdminAccessGuard>
      <AssignmentSetupScreen />
    </AdminAccessGuard>
  );
}
