import { notFound } from "next/navigation";
import RecruitmentTransitionScreen from "@/features/group/components/RecruitmentTransitionScreen";

export default function RecruitmentTransitionPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <RecruitmentTransitionScreen groupName="금요일의 사람들" />;
}
