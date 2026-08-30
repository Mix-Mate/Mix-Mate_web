import type { Metadata } from "next";
import MyPageScreen from "@/screens/mypage/MyPageScreen";

export const metadata: Metadata = {
  title: "마이페이지 | MixMate",
  description: "MixMate 마이페이지",
};

export default function MyPage() {
  return <MyPageScreen />;
}
