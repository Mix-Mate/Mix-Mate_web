import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import GroupEditScreen from "@/screens/admin/GroupEditScreen";

export default function GroupEditPage() {
  return (
    <AdminAccessGuard>
      <GroupEditScreen />
    </AdminAccessGuard>
  );
}
