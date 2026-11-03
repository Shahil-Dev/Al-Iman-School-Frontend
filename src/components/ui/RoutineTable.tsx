"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { FaCalendarAlt, FaEdit, FaPrint, FaTrashAlt } from "react-icons/fa";
import {
  CORE_DAYS,
  DAY_LABEL,
  DAY_ORDER,
  normalizeDay,
  todayKey,
  toMinutes,
} from "@/src/lib/routineUtils";

export interface RoutineItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId?: string;
  subject?: { id?: string; name?: string; code?: string } | null;
}

interface RoutineTableProps {
  routines: RoutineItem[];
  isBn: boolean;
  className?: string;
  sectionName?: string;
  canEdit?: boolean;
  onEdit?: (item: RoutineItem) => void;
  onDelete?: (item: RoutineItem) => void;
}

// Soft colors so each subject is easy to spot in the grid
const SUBJECT_STYLES = [
  "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25",
  "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/25",
  "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25",
  "bg-violet-500/10 text-violet-800 dark:text-violet-300 border-violet-500/25",
  "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/25",
  "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/25",
  "bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/25",
  "bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/25",
];

const styleFor = (key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return SUBJECT_STYLES[hash % SUBJECT_STYLES.length];
};

export default function RoutineTable({
  routines,
  isBn,
  className,
  sectionName,
  canEdit = false,
  onEdit,
  onDelete,
}: RoutineTableProps) {
  const today = todayKey();

  const { periods, days, cells } = useMemo(() => {
    const periodMap = new Map<
      string,
      { key: string; start: string; end: string; startMin: number; endMin: number }
    >();
    const cellMap: Record<string, RoutineItem[]> = {};

    routines.forEach((item) => {
      const start = (item.startTime || "").trim();
      const end = (item.endTime || "").trim();
      const periodKey = `${start}|${end}`;

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          key: periodKey,
          start,
          end,
          startMin: toMinutes(start),
          endMin: toMinutes(end),
        });
      }

      const cellKey = `${normalizeDay(item.day)}__${periodKey}`;
      if (!cellMap[cellKey]) cellMap[cellKey] = [];
      cellMap[cellKey].push(item);
    });

    const sortedPeriods = Array.from(periodMap.values()).sort(
      (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
    );

    const visibleDays = DAY_ORDER.filter(
      (day) =>
        CORE_DAYS.includes(day) ||
        routines.some((item) => normalizeDay(item.day) === day),
    );

    return { periods: sortedPeriods, days: visibleDays, cells: cellMap };
  }, [routines]);

  return (
    <div
      id="routine-print"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden !important; }
          #routine-print, #routine-print * { visibility: visible !important; }
          #routine-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }
          .routine-no-print { display: none !important; }
        }
      `}</style>

      {/* School header */}
      <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 px-6 py-6 text-center text-white">
        <button
          type="button"
          onClick={() => window.print()}
          className="routine-no-print absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/20"
        >
          <FaPrint />
          <span>{isBn ? "প্রিন্ট" : "Print"}</span>
        </button>

        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight underline-offset-4 hover:underline sm:text-2xl"
        >
          {isBn ? "আল-ঈমান স্কুল এন্ড কলেজ" : "Al-Iman School and College"}
        </Link>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-100/90">
          {isBn ? "ক্লাস রুটিন" : "Class Routine"}
        </p>

        {(className || sectionName) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            {className && (
              <span className="rounded-full bg-white/15 px-3 py-1">
                {isBn ? "শ্রেণি: " : "Class: "}
                {className}
              </span>
            )}
            {sectionName && (
              <span className="rounded-full bg-white/15 px-3 py-1">
                {isBn ? "সেকশন: " : "Section: "}
                {sectionName}
              </span>
            )}
          </div>
        )}
      </div>

      {routines.length === 0 ? (
        <div className="space-y-2 px-6 py-14 text-center">
          <FaCalendarAlt className="mx-auto text-3xl text-muted-foreground/40" />
          <p className="text-xs font-medium text-muted-foreground">
            {isBn
              ? "এই শ্রেণি ও সেকশনের জন্য কোনো রুটিন সেটআপ করা হয়নি।"
              : "No routine has been set up for this class and section."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="sticky left-0 z-10 w-28 border-b border-r border-border bg-muted px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isBn ? "দিন / সময়" : "Day / Time"}
                </th>
                {periods.map((period) => (
                  <th
                    key={period.key}
                    className="border-b border-r border-border px-2 py-3 text-center font-mono text-[10px] font-bold text-foreground last:border-r-0"
                  >
                    <span className="block">{period.start}</span>
                    <span className="block text-muted-foreground">to</span>
                    <span className="block">{period.end}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const isToday = day === today;
                return (
                  <tr
                    key={day}
                    className={`border-b border-border last:border-b-0 ${
                      isToday ? "bg-primary/5" : ""
                    }`}
                  >
                    <th
                      scope="row"
                      className={`sticky left-0 z-10 border-r border-border px-3 py-3 text-left text-xs font-bold ${
                        isToday ? "bg-primary/10 text-primary" : "bg-card text-foreground"
                      }`}
                    >
                      <span className="block">
                        {isBn ? DAY_LABEL[day].bn : DAY_LABEL[day].en}
                      </span>
                      {isToday && (
                        <span className="mt-0.5 inline-block rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold text-primary-foreground">
                          {isBn ? "আজ" : "Today"}
                        </span>
                      )}
                    </th>

                    {periods.map((period) => {
                      const items = cells[`${day}__${period.key}`] || [];
                      return (
                        <td
                          key={period.key}
                          className="border-r border-border p-1.5 align-middle last:border-r-0"
                        >
                          {items.length === 0 ? (
                            <span className="block text-center text-muted-foreground/40">
                              —
                            </span>
                          ) : (
                            <div className="space-y-1.5">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className={`group relative rounded-lg border px-2 py-2 text-center ${styleFor(
                                    item.subject?.id || item.subject?.name || item.id,
                                  )}`}
                                >
                                  <span className="block text-[12px] font-bold leading-tight">
                                    {item.subject?.name || "—"}
                                  </span>
                                  {item.subject?.code && (
                                    <span className="mt-0.5 block font-mono text-[10px] opacity-70">
                                      {item.subject.code}
                                    </span>
                                  )}

                                  {canEdit && (
                                    <div className="routine-no-print mt-1.5 flex justify-center gap-1 sm:absolute sm:right-1 sm:top-1 sm:mt-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                                      <button
                                        type="button"
                                        onClick={() => onEdit?.(item)}
                                        aria-label={isBn ? "সম্পাদনা" : "Edit"}
                                        className="grid h-6 w-6 place-items-center rounded-md bg-background/80 text-amber-600 transition hover:bg-amber-500 hover:text-white"
                                      >
                                        <FaEdit className="text-[10px]" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onDelete?.(item)}
                                        aria-label={isBn ? "মুছুন" : "Delete"}
                                        className="grid h-6 w-6 place-items-center rounded-md bg-background/80 text-destructive transition hover:bg-destructive hover:text-white"
                                      >
                                        <FaTrashAlt className="text-[10px]" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}