import type { Metadata } from "next";
import type { ReactNode } from "react";
import HistoryPositionTracker from "@/shared/lib/navigation/HistoryPositionTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "MixMate",
  description: "모임의 시작부터 마무리까지, MixMate",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <HistoryPositionTracker />
        {children}
      </body>
    </html>
  );
}
