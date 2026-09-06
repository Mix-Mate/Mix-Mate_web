import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import FixedMemberSetupScreen from "@/screens/admin/FixedMemberSetupScreen";

export default function FixedMembersPage() {
  return (
    <AdminAccessGuard>
      <FixedMemberSetupScreen />
    </AdminAccessGuard>
  );
}
