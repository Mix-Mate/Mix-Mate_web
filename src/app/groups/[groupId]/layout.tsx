import type { ReactNode } from "react";
import AdminGroupQueryProvider from "@/features/group/components/AdminGroupQueryProvider";
import GroupStatusNavigationBoundary from "@/features/group/components/GroupStatusNavigationBoundary";

export default function GroupLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGroupQueryProvider>
      <GroupStatusNavigationBoundary>{children}</GroupStatusNavigationBoundary>
    </AdminGroupQueryProvider>
  );
}
