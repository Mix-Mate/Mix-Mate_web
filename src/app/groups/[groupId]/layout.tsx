import type { ReactNode } from "react";
import AdminGroupQueryProvider from "@/features/group/components/AdminGroupQueryProvider";
import GroupStatusPollingBoundary from "@/features/group/components/GroupStatusPollingBoundary";

export default function GroupLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGroupQueryProvider>
      <GroupStatusPollingBoundary>{children}</GroupStatusPollingBoundary>
    </AdminGroupQueryProvider>
  );
}
