import AdminGroupQueryProvider from "@/features/group/components/AdminGroupQueryProvider";
import VoteResultScreen from "@/screens/common/VoteResultScreen";

export default function VoteResultPage() {
  return (
    <AdminGroupQueryProvider>
      <VoteResultScreen />
    </AdminGroupQueryProvider>
  );
}
