import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import ProgressScreen from "@/screens/admin/ProgressScreen";

export default function ProgressPage() {
  return (
    <AdminAccessGuard>
      <ProgressScreen />
    </AdminAccessGuard>
  );
}
