import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import RosterDownloadScreen from "@/screens/common/RosterDownloadScreen";

export default function RosterDownloadPage() {
  return (
    <AdminAccessGuard>
      <RosterDownloadScreen />
    </AdminAccessGuard>
  );
}
