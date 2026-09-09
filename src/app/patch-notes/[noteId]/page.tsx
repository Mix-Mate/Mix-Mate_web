import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPatchNoteById } from "@/features/patch-note/data/patch-notes";
import PatchNoteDetailScreen from "@/screens/patch-note/PatchNoteDetailScreen";

export const metadata: Metadata = {
  title: "패치노트 상세 | MixMate",
  description: "MixMate 패치노트 상세",
};

interface PatchNoteDetailPageProps {
  params: Promise<{
    noteId: string;
  }>;
}

export default async function PatchNoteDetailPage({
  params,
}: PatchNoteDetailPageProps) {
  const { noteId } = await params;
  const note = getPatchNoteById(noteId);

  if (!note) {
    notFound();
  }

  return <PatchNoteDetailScreen note={note} />;
}
