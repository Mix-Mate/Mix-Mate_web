"use client";

import { useRouter } from "next/navigation";
import type {
  PatchNoteItem,
  PatchNoteType,
} from "@/features/patch-note/data/patch-notes";
import { getPatchNoteTypes } from "@/features/patch-note/data/patch-notes";
import MobileFrame from "@/shared/ui/MobileFrame";
import Header from "@/shared/ui/Header";
import styles from "./PatchNoteDetailScreen.module.css";

const TYPE_CLASS: Record<PatchNoteType, string> = {
  New: styles.newBadge,
  Changed: styles.changedBadge,
  Fixed: styles.fixedBadge,
  Improved: styles.improvedBadge,
  Security: styles.securityBadge,
  Deprecated: styles.deprecatedBadge,
  Removed: styles.removedBadge,
};

interface PatchNoteDetailScreenProps {
  note: PatchNoteItem;
}

export default function PatchNoteDetailScreen({
  note,
}: PatchNoteDetailScreenProps) {
  const router = useRouter();

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="patch-note-detail-screen"
    >
      <Header title={note.version} onBack={() => router.back()} />

      <main className={styles.main}>
        <article className={styles.document}>
          <div className={styles.metaRow}>
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

          <header className={styles.documentHeader}>
            <h2>{note.title}</h2>
            <p>{note.summary}</p>
            <time dateTime={note.date}>{note.date}</time>
          </header>

          <div className={styles.sectionList}>
            {note.changes.map((change) => (
              <section
                key={`${change.type}-${change.title}`}
                className={styles.sectionBlock}
              >
                <div className={styles.changeHeading}>
                  <span
                    className={`${styles.typeBadge} ${TYPE_CLASS[change.type]}`}
                  >
                    {change.type}
                  </span>
                  <h3>{change.title}</h3>
                </div>
                <p>{change.description}</p>
                {change.details && change.details.length > 0 && (
                  <ul>
                    {change.details.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </main>
    </MobileFrame>
  );
}
