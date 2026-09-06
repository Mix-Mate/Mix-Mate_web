import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import AdminRecruitmentScreen from "@/screens/admin/AdminRecruitmentScreen";

export default function RecruitmentPage() {
  return (
    <AdminAccessGuard>
      <AdminRecruitmentScreen />
    </AdminAccessGuard>
  );
}
