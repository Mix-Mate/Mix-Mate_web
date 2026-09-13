import type { Metadata } from "next";
import PrivacyPolicyScreen from "@/screens/common/PrivacyPolicyScreen";

export const metadata: Metadata = {
  title: "개인정보처리방침 | MixMate",
  description: "MixMate 개인정보처리방침",
};

export default function PrivacyPage() {
  return <PrivacyPolicyScreen />;
}
