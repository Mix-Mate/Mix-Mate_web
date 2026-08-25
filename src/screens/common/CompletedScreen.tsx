"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import Button from "@/shared/ui/Button";
import MobileFrame from "@/shared/ui/MobileFrame";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import backgroundGlow from "@/shared/assets/session-completed/background-glow.svg";
import iconPartyPopper from "@/shared/assets/session-completed/icon-party-popper.svg";
import sparklesTop from "@/shared/assets/session-completed/sparkles-top.svg";
import sparklesBottom from "@/shared/assets/session-completed/sparkles-bottom.svg";
import statusCheckIcon from "@/shared/assets/session-completed/status-check-icon.svg";
import styles from "./CompletedScreen.module.css";

export default function CompletedScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
    group?.myRole === "HOST" ? "ADMIN" : "USER",
  );

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      fillHeight
      data-testid="completed-screen"
      data-group-id={params.groupId}
    >
      <main className={styles.content}>
        <div className={styles.illustration}>
          <Image
            src={backgroundGlow}
            alt=""
            aria-hidden="true"
            className={styles.backgroundGlow}
            unoptimized
          />
          <div className={styles.iconTile}>
            <Image
              src={iconPartyPopper}
              alt=""
              width={44}
              height={44}
              unoptimized
            />
          </div>
          <Image
            src={sparklesTop}
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
            className={styles.sparklesTop}
            unoptimized
          />
          <Image
            src={sparklesBottom}
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
            className={styles.sparklesBottom}
            unoptimized
          />
        </div>

        <div className={styles.message}>
          <div className={styles.headingGroup}>
            <p className={styles.eyebrow}>모임 종료</p>
            <h2 className={styles.title}>
              모든 술자리가
              <br />
              종료되었습니다
            </h2>
          </div>
          <p className={styles.body}>
            함께한 모든 순간이 좋은 추억으로
            <br />
            오래 남기를 바랍니다.
          </p>
        </div>

        <div className={styles.statusCard}>
          <Image
            src={statusCheckIcon}
            alt=""
            aria-hidden="true"
            width={44}
            height={44}
            unoptimized
          />
          <div className={styles.statusText}>
            <p className={styles.statusMeta}>{snapshot.groupName}</p>
            <p className={styles.statusLabel}>
              {snapshot.round}차 술자리까지 모두 완료
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <Button onClick={() => router.replace("/")}>
          메인 홈으로 돌아가기
        </Button>
      </footer>
    </MobileFrame>
  );
}
