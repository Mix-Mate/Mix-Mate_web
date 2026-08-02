"use client";

import { useParams, useRouter } from "next/navigation";
import PlayMenu from "@/features/play/components/PlayMenu";
import PlayScreenLayout from "./PlayScreenLayout";

export default function PlayMenuScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();

  return (
    <PlayScreenLayout
      backHref={`/groups/${params.groupId}/home`}
      testId="play-menu-screen"
    >
      <PlayMenu
        groupId={params.groupId}
        onNavigate={(href) => router.push(href)}
      />
    </PlayScreenLayout>
  );
}
