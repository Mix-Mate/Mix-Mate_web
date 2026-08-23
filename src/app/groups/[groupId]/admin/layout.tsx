import type { ReactNode } from "react";
import AdminGroupQueryProvider from "@/features/group/components/AdminGroupQueryProvider";
import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGroupQueryProvider>
      <AdminAccessGuard>{children}</AdminAccessGuard>
    </AdminGroupQueryProvider>
  );
}
