import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import HistoryPositionTracker from "@/shared/lib/navigation/HistoryPositionTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "MixMate",
  description: "모임의 시작부터 마무리까지, MixMate",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* 상태바·주소창 등 브라우저가 직접 칠하는 영역을 화면 배경색과 맞춘다.
     (--color-surface와 같은 값. CSS 변수는 메타 태그에서 못 쓰므로 직접 지정) */
  themeColor: "#fcfcff",
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
