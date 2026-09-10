import type { Metadata } from "next";
import PatchNoteScreen from "@/screens/patch-note/PatchNoteScreen";

export const metadata: Metadata = {
  title: "패치노트 | MixMate",
  description: "MixMate 업데이트 기록",
};

export default function PatchNotesPage() {
  return <PatchNoteScreen />;
}
