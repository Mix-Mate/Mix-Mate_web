"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import Header from "@/shared/ui/Header";
import {
  PATCH_NOTES,
  getPatchNoteTypes,
  type PatchNoteType,
} from "@/features/patch-note/data/patch-notes";
import { appRoutes } from "@/shared/lib/navigation/routes";
import styles from "./PatchNoteScreen.module.css";

const TYPE_CLASS: Record<PatchNoteType, string> = {
  New: styles.newBadge,
  Changed: styles.changedBadge,
  Fixed: styles.fixedBadge,
  Improved: styles.improvedBadge,
  Security: styles.securityBadge,
  Deprecated: styles.deprecatedBadge,
  Removed: styles.removedBadge,
};

export default function PatchNoteScreen() {
  const router = useRouter();

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="patch-note-screen"
    >
      <Header title="패치노트" onBack={() => router.back()} />

      <main className={styles.main}>
        <section className={styles.summary} aria-labelledby="patch-note-title">
          <span className={styles.summaryIcon} aria-hidden="true">
            <FileText size={22} strokeWidth={1.8} />
          </span>
          <div className={styles.summaryText}>
            <h2 id="patch-note-title">MixMate 업데이트 기록</h2>
            <p>새 기능, 수정 사항, 제거된 항목을 한 곳에 모았어요.</p>
          </div>
        </section>

        <section className={styles.noteList} aria-label="패치노트 목록">
          {PATCH_NOTES.length > 0 ? (
            PATCH_NOTES.map((note) => (
              <button
                key={note.id}
                type="button"
                className={styles.noteCard}
                onClick={() => router.push(appRoutes.patchNoteDetail(note.id))}
              >
                <div className={styles.noteHeader}>
                  <div className={styles.typeBadgeGroup}>
                    {getPatchNoteTypes(note).map((type) => (
                      <span
                        key={type}
                        className={`${styles.typeBadge} ${TYPE_CLASS[type]}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <span className={styles.versionBadge}>{note.version}</span>
                </div>

                <div className={styles.noteBody}>
                  <h3>{note.title}</h3>
                  <p>{note.summary}</p>
                </div>

                <div className={styles.noteFooter}>
                  <time className={styles.noteDate} dateTime={note.date}>
                    {note.date}
                  </time>
                  <ChevronRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </div>
              </button>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>아직 등록된 패치노트가 없습니다.</p>
            </div>
          )}
        </section>
      </main>
    </MobileFrame>
  );
}
