import type { ReactNode } from "react";
import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAccessGuard>{children}</AdminAccessGuard>;
}
