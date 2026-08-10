"use client";

import { useParams, useRouter } from "next/navigation";
import PlayMenu from "@/features/play/components/PlayMenu";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import PlayScreenLayout from "./PlayScreenLayout";

export default function PlayMenuScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();

  return (
    <PlayScreenLayout
      backHref={groupRoutes.home(params.groupId)}
      testId="play-menu-screen"
    >
      <PlayMenu
        groupId={params.groupId}
        onNavigate={(href) => router.push(href)}
      />
    </PlayScreenLayout>
  );
}
