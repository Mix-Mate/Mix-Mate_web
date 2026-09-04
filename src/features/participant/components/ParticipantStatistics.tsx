"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { normalizeProfileMbti } from "@/shared/lib/profile-labels";
import type { AdminParticipant } from "../types/participant.types";
import styles from "./ParticipantStatistics.module.css";

interface ParticipantStatisticsProps {
  participants: AdminParticipant[];
}

interface SegmentData {
  label: string;
  count: number;
  percent: number;
}

interface DistributionData {
  title: string;
  subtitle: string;
  centerLabel: string;
  highlight: SegmentData;
  segments: SegmentData[];
}

const RADIUS = 43;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const COUNT_UP_DURATION = 760;

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function useAnimatedNumber(target: number, delay = 0) {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);

  useEffect(() => {
    const safeTarget = Number.isFinite(target) ? Math.max(0, target) : 0;
    const startValue = valueRef.current;
    let animationFrameId = 0;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;

      const elapsed = Math.max(0, timestamp - startTime - delay);
      const progress = Math.min(elapsed / COUNT_UP_DURATION, 1);
      const nextValue = Math.round(
        startValue + (safeTarget - startValue) * easeOutCubic(progress),
      );

      valueRef.current = nextValue;
      setValue(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [delay, target]);

  return value;
}

function CountUp({
  value,
  suffix = "",
  delay = 0,
}: {
  value: number;
  suffix?: string;
  delay?: number;
}) {
  const animatedValue = useAnimatedNumber(value, delay);

  return (
    <>
      {animatedValue}
      {suffix}
    </>
  );
}

function getPercent(count: number, total: number) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

function countBy<T extends string>(
  participants: AdminParticipant[],
  getKey: (participant: AdminParticipant) => T | undefined,
) {
  return participants.reduce<Record<T, number>>(
    (acc, participant) => {
      const key = getKey(participant);
      if (!key) return acc;

      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

const DEPARTMENT_PREVIEW_COUNT = 7;

function getDepartmentStats(participants: AdminParticipant[]) {
  const counts = countBy(participants, (participant) => participant.department);

  return Object.entries(counts)
    .sort((first, second) => second[1] - first[1])
    .map(([label, count]) => ({
      label,
      count,
      percent: getPercent(count, participants.length),
    }));
}

function DonutChart({
  percent,
  label,
}: {
  percent: number;
  label: string;
}) {
  const chartId = useId();
  const animatedPercent = useAnimatedNumber(percent, 180);
  const primaryGradientId = `${chartId}-primary`;
  const secondaryGradientId = `${chartId}-secondary`;
  const safePercent = Math.min(100, Math.max(0, percent));
  const primaryArc = (CIRCUMFERENCE * safePercent) / 100;
  const secondaryArc = CIRCUMFERENCE - primaryArc;
  const primaryStyle = {
    "--arc": primaryArc,
    "--rest": CIRCUMFERENCE - primaryArc,
  } as CSSProperties;
  const secondaryStyle = {
    "--arc": secondaryArc,
    "--rest": CIRCUMFERENCE - secondaryArc,
    "--offset": -primaryArc,
  } as CSSProperties;

  return (
    <div className={styles.donutWrap} aria-label={`${label} ${percent}%`}>
      <svg className={styles.donut} viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id={primaryGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#84c5ff" />
            <stop offset="100%" stopColor="#256ad3" />
          </linearGradient>
          <linearGradient
            id={secondaryGradientId}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#d8f0ff" />
            <stop offset="100%" stopColor="#67b8f4" />
          </linearGradient>
        </defs>
        <circle className={styles.donutTrack} cx="60" cy="60" r={RADIUS} />
        <circle
          className={styles.donutPrimary}
          cx="60"
          cy="60"
          r={RADIUS}
          stroke={`url(#${primaryGradientId})`}
          style={primaryStyle}
        />
        <circle
          className={styles.donutSecondary}
          cx="60"
          cy="60"
          r={RADIUS}
          stroke={`url(#${secondaryGradientId})`}
          style={secondaryStyle}
        />
      </svg>
      <div className={styles.donutCenter}>
        <strong>{animatedPercent}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function DistributionCard({ data }: { data: DistributionData }) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h3>{data.title}</h3>
        <p>{data.subtitle}</p>
      </header>

      <div className={styles.chartRow}>
        <DonutChart
          percent={data.highlight.percent}
          label={data.centerLabel}
        />

        <div className={styles.legendList}>
          {data.segments.map((segment, index) => (
            <div className={styles.legendItem} key={segment.label}>
              <div className={styles.legendTop}>
                <span>
                  <i
                    className={
                      index === 0 ? styles.primaryDot : styles.secondaryDot
                    }
                  />
                  {segment.label}
                </span>
                <strong>
                  <CountUp value={segment.count} suffix="명" delay={160} />
                </strong>
              </div>
              <div className={styles.progressTrack}>
                <span
                  className={index === 0 ? styles.primaryBar : styles.secondaryBar}
                  style={{ width: `${segment.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ParticipantStatistics({
  participants,
}: ParticipantStatisticsProps) {
  const [tableOpen, setTableOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);

  const statistics = useMemo(() => {
    const total = participants.length;
    const genderCounts = countBy(participants, (participant) =>
      participant.gender === "male" ? "male" : "female",
    );
    const mbtiCounts = countBy(participants, (participant) => {
      const mbti = normalizeProfileMbti(participant.mbti);

      if (!mbti) return undefined;
      return mbti.startsWith("I") ? "introvert" : "extrovert";
    });
    const roleCounts = countBy(participants, (participant) => participant.role);
    const newCounts = countBy(participants, (participant) =>
      participant.isNew ? "new" : "existing",
    );

    const distributions: DistributionData[] = [
      {
        title: "성별",
        subtitle: "남녀 구성 비율",
        centerLabel: "남성",
        highlight: {
          label: "남성",
          count: genderCounts.male ?? 0,
          percent: getPercent(genderCounts.male ?? 0, total),
        },
        segments: [
          {
            label: "남성",
            count: genderCounts.male ?? 0,
            percent: getPercent(genderCounts.male ?? 0, total),
          },
          {
            label: "여성",
            count: genderCounts.female ?? 0,
            percent: getPercent(genderCounts.female ?? 0, total),
          },
        ],
      },
      {
        title: "MBTI 성향",
        subtitle: "내향(I) · 외향(E)",
        centerLabel: "내향형",
        highlight: {
          label: "내향형 (I)",
          count: mbtiCounts.introvert ?? 0,
          percent: getPercent(mbtiCounts.introvert ?? 0, total),
        },
        segments: [
          {
            label: "내향형 (I)",
            count: mbtiCounts.introvert ?? 0,
            percent: getPercent(mbtiCounts.introvert ?? 0, total),
          },
          {
            label: "외향형 (E)",
            count: mbtiCounts.extrovert ?? 0,
            percent: getPercent(mbtiCounts.extrovert ?? 0, total),
          },
        ],
      },
      {
        title: "직급",
        subtitle: "일반 · 운영진",
        centerLabel: "일반",
        highlight: {
          label: "일반",
          count: roleCounts.general ?? 0,
          percent: getPercent(roleCounts.general ?? 0, total),
        },
        segments: [
          {
            label: "일반",
            count: roleCounts.general ?? 0,
            percent: getPercent(roleCounts.general ?? 0, total),
          },
          {
            label: "운영진",
            count: roleCounts.staff ?? 0,
            percent: getPercent(roleCounts.staff ?? 0, total),
          },
        ],
      },
      {
        title: "신입 여부",
        subtitle: "신입 · 기존",
        centerLabel: "신입",
        highlight: {
          label: "신입",
          count: newCounts.new ?? 0,
          percent: getPercent(newCounts.new ?? 0, total),
        },
        segments: [
          {
            label: "신입",
            count: newCounts.new ?? 0,
            percent: getPercent(newCounts.new ?? 0, total),
          },
          {
            label: "기존",
            count: newCounts.existing ?? 0,
            percent: getPercent(newCounts.existing ?? 0, total),
          },
        ],
      },
    ];

    return {
      total,
      genderPercent: getPercent(genderCounts.male ?? 0, total),
      mbtiPercent: getPercent(mbtiCounts.introvert ?? 0, total),
      rolePercent: getPercent(roleCounts.general ?? 0, total),
      newPercent: getPercent(newCounts.new ?? 0, total),
      departments: getDepartmentStats(participants),
      distributions,
    };
  }, [participants]);
  const visibleDepartments = departmentOpen
    ? statistics.departments
    : statistics.departments.slice(0, DEPARTMENT_PREVIEW_COUNT);
  const hasHiddenDepartments =
    statistics.departments.length > DEPARTMENT_PREVIEW_COUNT;

  return (
    <div className={styles.statistics}>
      <section className={styles.summaryCard}>
        <p className={styles.eyebrow}>전체 참여자 현황</p>
        <strong className={styles.total}>
          <CountUp value={statistics.total} suffix="명" />
        </strong>
        <p className={styles.summaryDescription}>
          성별 · MBTI · 역할 · 가입 여부 · 소속 기준 분포
        </p>

        <div className={styles.quickGrid}>
          <article>
            <span>성별</span>
            <strong>
              남성 <CountUp value={statistics.genderPercent} suffix="%" />
            </strong>
          </article>
          <article>
            <span>MBTI 성향</span>
            <strong>
              내향형 <CountUp value={statistics.mbtiPercent} suffix="%" />
            </strong>
          </article>
          <article>
            <span>직급</span>
            <strong>
              일반 <CountUp value={statistics.rolePercent} suffix="%" />
            </strong>
          </article>
          <article>
            <span>신입 여부</span>
            <strong>
              신입 <CountUp value={statistics.newPercent} suffix="%" />
            </strong>
          </article>
        </div>
      </section>

      {statistics.distributions.map((distribution) => (
        <DistributionCard key={distribution.title} data={distribution} />
      ))}

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.departmentHeader}>
            <div>
              <h3>소속</h3>
              <p>
                학과별 분포 · 총{" "}
                <CountUp value={statistics.departments.length} />개 학과
              </p>
            </div>
            <span>
              <CountUp value={statistics.total} suffix="명" />
            </span>
          </div>
        </header>

        <div className={styles.departmentList}>
          {visibleDepartments.map((department) => (
            <div className={styles.departmentItem} key={department.label}>
              <span>{department.label}</span>
              <div className={styles.departmentTrack}>
                <i style={{ width: `${department.percent}%` }} />
              </div>
              <strong>
                <CountUp value={department.count} suffix="명" delay={160} />
              </strong>
            </div>
          ))}
          {hasHiddenDepartments && (
            <button
              type="button"
              className={styles.departmentMoreButton}
              aria-expanded={departmentOpen}
              onClick={() => setDepartmentOpen((open) => !open)}
            >
              {departmentOpen ? "접기" : "..."}
            </button>
          )}
        </div>
      </section>

      <section className={styles.tableCard}>
        <button
          type="button"
          className={styles.tableToggle}
          aria-expanded={tableOpen}
          onClick={() => setTableOpen((open) => !open)}
        >
          데이터 표로 보기
          <ChevronDown
            aria-hidden="true"
            size={18}
            strokeWidth={1.8}
            className={tableOpen ? styles.openIcon : ""}
          />
        </button>

        {tableOpen && (
          <table className={styles.table}>
            <colgroup>
              <col className={styles.categoryColumn} />
              <col className={styles.labelColumn} />
              <col className={styles.countColumn} />
              <col className={styles.percentColumn} />
            </colgroup>
            <thead>
              <tr>
                <th>항목</th>
                <th>구분</th>
                <th>인원</th>
                <th>비율</th>
              </tr>
            </thead>
            <tbody>
              {statistics.distributions.flatMap((distribution) =>
                distribution.segments.map((segment, index) => (
                  <tr key={`${distribution.title}-${segment.label}`}>
                    <td className={styles.categoryCell}>
                      {index === 0 ? distribution.title : ""}
                    </td>
                    <td className={styles.labelCell}>
                      <span
                        className={
                          index === 0
                            ? styles.tablePrimaryDot
                            : styles.tableSecondaryDot
                        }
                        aria-hidden="true"
                      />
                      <span>{segment.label}</span>
                    </td>
                    <td className={styles.countCell}>
                      <CountUp value={segment.count} suffix="명" />
                    </td>
                    <td className={styles.percentCell}>
                      <CountUp value={segment.percent} suffix="%" />
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
