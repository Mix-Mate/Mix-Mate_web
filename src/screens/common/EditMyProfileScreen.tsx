"use client";

import { useParams, useRouter } from "next/navigation";
import GroupProfileForm from "@/features/profile/components/GroupProfileForm";
import { useMyGroupProfileQuery } from "@/features/profile/hooks/useMyGroupProfileQuery";
import { useUpdateMyProfileMutation } from "@/features/profile/hooks/useUpdateMyProfileMutation";
import useToast from "@/shared/hooks/useToast";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./EditMyProfileScreen.module.css";

export default function EditMyProfileScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const { data } = useMyGroupProfileQuery(params.groupId);
  const { mutate, isPending } = useUpdateMyProfileMutation();
  const { message: toast, showToast } = useToast();

  if (!data) {
    return (
      <MobileFrame
        className={styles.screenFrame}
        viewportClassName={styles.pageViewport}
      >
        <Header title="내 프로필 수정" onBack={() => router.back()} />
      </MobileFrame>
    );
  }

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
    >
      <Header title="내 프로필 수정" onBack={() => router.back()} />

      <main className={styles.content}>
        <InfoBanner className={styles.notice}>
          <p>수정한 정보는 현재 그룹의 프로필에 반영됩니다.</p>
        </InfoBanner>

        <GroupProfileForm
          mode="edit"
          initialProfile={data}
          isSubmitting={isPending}
          submitLabel="변경사항 저장"
          onSubmit={async (profile) => {
            const result = await mutate({
              groupId: params.groupId,
              profile,
            });

            showToast(
              result.ok
                ? "프로필이 저장되었습니다."
                : result.savedLocally
                  ? `${result.message} 임시 저장했습니다.`
                  : result.message,
            );
          }}
        />
      </main>

      {toast && <Toast className={styles.toast}>{toast}</Toast>}
    </MobileFrame>
  );
}
