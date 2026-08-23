import AdminGroupQueryProvider from "@/features/group/components/AdminGroupQueryProvider";
import UserHomeScreen from "@/screens/user/UserHomeScreen";

export default function UserHomePage() {
  return (
    <AdminGroupQueryProvider>
      <UserHomeScreen />
    </AdminGroupQueryProvider>
  );
}
