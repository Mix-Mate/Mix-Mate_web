import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import EndVoteScreen from "@/screens/admin/EndVoteScreen";

export default function VoteEndPage() {
  return (
    <AdminAccessGuard>
      <EndVoteScreen />
    </AdminAccessGuard>
  );
}
