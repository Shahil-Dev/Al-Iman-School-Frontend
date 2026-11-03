"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FaExclamationTriangle,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaTrashAlt,
} from "react-icons/fa";
import { toast } from "sonner";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/context/LanguageContext";
import { academicService } from "@/src/Services/academicService";

import {
  DAY_LABEL,
  FORM_DAYS,
  normalizeDay,
  to12h,
  to24h,
  toMinutes,
} from "@/src/lib/routineUtils";
import RoutineTable, { RoutineItem } from "./RoutineTable";

type SlotPayload = {
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
};

type SlotModalState = { mode: "create" | "edit"; slot?: RoutineItem } | null;

const inputClass =
  "w-full rounded-xl border border-input bg-background p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary";

/* -------------------------------------------------------------------------- */
/*  Add / edit period dialog                                                   */
/* -------------------------------------------------------------------------- */

function SlotModal({
  mode,
  slot,
  subjects,
  existing,
  isBn,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  slot?: RoutineItem;
  subjects: any[];
  existing: RoutineItem[];
  isBn: boolean;
  onClose: () => void;
  onSave: (payload: SlotPayload) => Promise<void>;
}) {
  const [day, setDay] = useState(normalizeDay(slot?.day) || FORM_DAYS[1]);
  const [start, setStart] = useState(to24h(slot?.startTime) || "09:00");
  const [end, setEnd] = useState(to24h(slot?.endTime) || "09:45");
  const [subjectId, setSubjectId] = useState(
    slot?.subjectId || slot?.subject?.id || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startMin = toMinutes(to12h(start));
    const endMin = toMinutes(to12h(end));

    if (!subjectId) {
      setError(isBn ? "বিষয় নির্বাচন করুন।" : "Please select a subject.");
      return;
    }
    if (!start || !end || endMin <= startMin) {
      setError(
        isBn
          ? "শেষের সময় শুরুর সময়ের পরে হতে হবে।"
          : "The end time must be after the start time.",
      );
      return;
    }

    // A section cannot have two classes at the same time
    const clash = existing.some(
      (item) =>
        item.id !== slot?.id &&
        normalizeDay(item.day) === day &&
        toMinutes(item.startTime) < endMin &&
        startMin < toMinutes(item.endTime),
    );
    if (clash) {
      setError(
        isBn
          ? "এই দিনে ওই সময়ে ইতিমধ্যে অন্য ক্লাস আছে।"
          : "Another period already exists at this time on this day.",
      );
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSave({
        day,
        startTime: to12h(start),
        endTime: to12h(end),
        subjectId,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (isBn ? "রুটিন সংরক্ষণ করা যায়নি।" : "Could not save the period."),
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 p-3">
          <h3 className="text-xs font-bold text-foreground">
            {mode === "edit"
              ? isBn
                ? "পিরিয়ড সম্পাদনা"
                : "Edit Period"
              : isBn
                ? "নতুন পিরিয়ড যোগ করুন"
                : "Add New Period"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1 text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-foreground">
              {isBn ? "দিন *" : "Day *"}
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className={inputClass}
            >
              {FORM_DAYS.map((d) => (
                <option key={d} value={d}>
                  {isBn ? DAY_LABEL[d].bn : DAY_LABEL[d].en}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-foreground">
                {isBn ? "শুরুর সময় *" : "Start Time *"}
              </label>
              <input
                type="time"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-foreground">
                {isBn ? "শেষের সময় *" : "End Time *"}
              </label>
              <input
                type="time"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-bold text-foreground">
              {isBn ? "বিষয় *" : "Subject *"}
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className={inputClass}
            >
              <option value="">
                {isBn ? "-- বিষয় সিলেক্ট করুন --" : "-- Select Subject --"}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                  {subject.code ? ` (${subject.code})` : ""}
                </option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="mt-1 text-[10px] text-amber-600">
                {isBn
                  ? "এই শ্রেণির জন্য কোনো বিষয় নেই। আগে বিষয় সেটআপ করুন।"
                  : "This class has no subjects yet. Set up subjects first."}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2 text-[11px] text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl bg-muted py-2.5 font-bold text-foreground transition hover:bg-muted/80 disabled:opacity-50"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <span>{isBn ? "সংরক্ষণ করুন" : "Save"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Manager                                                                    */
/* -------------------------------------------------------------------------- */

export default function RoutineManager({ canEdit }: { canEdit: boolean }) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [error, setError] = useState("");

  const [slotModal, setSlotModal] = useState<SlotModalState>(null);
  const [deleting, setDeleting] = useState<RoutineItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const selectedClass = classes.find((c) => c.id === classId);
  const sections: any[] = selectedClass?.sections || [];
  const subjects: any[] = selectedClass?.subjects || [];
  const selectedSection = sections.find((s) => s.id === sectionId);

  useEffect(() => {
    academicService
      .getAllClasses()
      .then((res) => {
        const list = res?.data || res || [];
        const loaded = Array.isArray(list) ? list : [];
        setClasses(loaded);
        if (loaded.length > 0) {
          setClassId(loaded[0].id);
          setSectionId(loaded[0].sections?.[0]?.id || "");
        }
      })
      .catch(() =>
        setError(isBn ? "শ্রেণির তালিকা লোড করা যায়নি।" : "Could not load classes."),
      )
      .finally(() => setLoadingClasses(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoutines = useCallback(async () => {
    if (!classId || !sectionId) {
      setRoutines([]);
      return;
    }
    setLoadingRoutines(true);
    setError("");
    try {
      const res = await academicService.getClassRoutine(classId, sectionId);
      const list = res?.data || [];
      setRoutines(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setRoutines([]);
      setError(
        err?.response?.data?.message ||
          (isBn ? "রুটিন লোড করা যায়নি।" : "Could not load the routine."),
      );
    } finally {
      setLoadingRoutines(false);
    }
  }, [classId, sectionId, isBn]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleClassChange = (id: string) => {
    const next = classes.find((c) => c.id === id);
    setClassId(id);
    setSectionId(next?.sections?.[0]?.id || "");
  };

  const handleSave = async (payload: SlotPayload) => {
    if (slotModal?.mode === "edit" && slotModal.slot) {
      await academicService.updateRoutineSlot(slotModal.slot.id, payload);
      toast.success(isBn ? "পিরিয়ড আপডেট হয়েছে।" : "Period updated.");
    } else {
      await academicService.createRoutineSlot({ ...payload, classId, sectionId });
      toast.success(isBn ? "নতুন পিরিয়ড যোগ হয়েছে।" : "Period added.");
    }
    setSlotModal(null);
    await loadRoutines();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await academicService.deleteRoutineSlot(deleting.id);
      toast.success(isBn ? "পিরিয়ড মুছে ফেলা হয়েছে।" : "Period deleted.");
      setDeleting(null);
      await loadRoutines();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          (isBn ? "পিরিয়ড মুছা যায়নি।" : "Could not delete the period."),
      );
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-end">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {isBn ? "শ্রেণি" : "Class"}
              </label>
              <select
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={loadingClasses}
                className={inputClass}
              >
                {classes.length === 0 && (
                  <option value="">
                    {loadingClasses
                      ? isBn
                        ? "লোড হচ্ছে..."
                        : "Loading..."
                      : isBn
                        ? "কোনো শ্রেণি নেই"
                        : "No classes"}
                  </option>
                )}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {isBn ? "সেকশন" : "Section"}
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId || sections.length === 0}
                className={inputClass}
              >
                {sections.length === 0 && (
                  <option value="">
                    {isBn ? "এই শ্রেণিতে কোনো সেকশন নেই" : "No sections in this class"}
                  </option>
                )}
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setSlotModal({ mode: "create" })}
              disabled={!classId || !sectionId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              <FaPlus />
              <span>{isBn ? "পিরিয়ড যোগ করুন" : "Add Period"}</span>
            </button>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      {loadingClasses || loadingRoutines ? (
        <div className="flex items-center justify-center gap-2 p-12 text-xs text-muted-foreground">
          <FaSpinner className="animate-spin text-lg text-primary" />
          <span>{isBn ? "রুটিন লোড হচ্ছে..." : "Loading routine..."}</span>
        </div>
      ) : (
        <RoutineTable
          routines={routines}
          isBn={isBn}
          className={selectedClass?.name}
          sectionName={selectedSection?.name}
          canEdit={canEdit}
          onEdit={(item :any) => setSlotModal({ mode: "edit", slot: item })}
          onDelete={(item :any) => setDeleting(item)}
        />
      )}

      {slotModal && (
        <SlotModal
          mode={slotModal.mode}
          slot={slotModal.slot}
          subjects={subjects}
          existing={routines}
          isBn={isBn}
          onClose={() => setSlotModal(null)}
          onSave={handleSave}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-2xl text-destructive">
              <FaExclamationTriangle />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                {isBn ? "পিরিয়ড মুছে ফেলবেন?" : "Delete this period?"}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {deleting.subject?.name} · {deleting.startTime} - {deleting.endTime}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setDeleting(null)}
                className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={confirmDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-xs font-semibold text-white transition hover:bg-destructive/90 disabled:opacity-60"
              >
                {deleteBusy ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
                <span>{isBn ? "মুছে ফেলুন" : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}