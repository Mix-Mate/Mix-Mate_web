import type { ReactNode } from "react";
import AdminGroupQueryProvider from "@/features/group/components/AdminGroupQueryProvider";

export default function GroupLayout({ children }: { children: ReactNode }) {
  return <AdminGroupQueryProvider>{children}</AdminGroupQueryProvider>;
}
