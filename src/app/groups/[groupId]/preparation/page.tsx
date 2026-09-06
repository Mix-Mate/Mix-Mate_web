import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import AdminPreparationScreen from "@/screens/admin/AdminPreparationScreen";

export default function PreparationPage() {
  return (
    <AdminAccessGuard>
      <AdminPreparationScreen />
    </AdminAccessGuard>
  );
}
