"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaEye,
  FaPhoneAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { academicService } from "@/src/Services/academicService";
import { admissionApi } from "@/src/Services/admissionApi";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                              */
/* -------------------------------------------------------------------------- */

// One accent (emerald) for identity + actions. Status colors are semantic only.
const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_STYLE: Record<string, { label: string; text: string; dot: string }> = {
  PENDING: { label: "Pending", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-600" },
  REJECTED: { label: "Rejected", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-600" },
};

// Shared by the column header and every row so they always line up.
const ROW_COLS =
  "grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.5fr)_minmax(0,0.9fr)_15.5rem]";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const formatDate = (value: any) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "N/A";

type DocItem = { url: string; name: string; isImage: boolean };
const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i;

// Accepts ["url"], [{ url | fileUrl | path | src, name | fileName | title, type | mimeType }] or a single value.
const normalizeDocs = (docs: any): DocItem[] => {
  const list = Array.isArray(docs) ? docs : docs ? [docs] : [];
  return list
    .map((d: any, i: number) => {
      const isStr = typeof d === "string";
      const url: string = (isStr ? d : d?.url || d?.fileUrl || d?.path || d?.src) || "";
      const rawName: string = isStr ? "" : d?.name || d?.fileName || d?.title || d?.label || "";
      let fileName = "";
      try {
        fileName = decodeURIComponent(url.split("?")[0].split("/").pop() || "");
      } catch {
        fileName = "";
      }
      const name = rawName || fileName || `Document ${i + 1}`;
      const mime = isStr ? "" : String(d?.mimeType || d?.type || "");
      const isImage =
        mime.startsWith("image/") || IMAGE_RE.test(url) || IMAGE_RE.test(name) || url.includes("/image/upload/");
      return { url, name, isImage };
    })
    .filter((d: DocItem) => d.url);
};

const initialsOf = (name?: string) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/* -------------------------------------------------------------------------- */
/*  Small internal pieces                                                      */
/* -------------------------------------------------------------------------- */

function StatusMark({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { label: status, text: "text-muted-foreground", dot: "bg-muted-foreground" };
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${s.text}`}>
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${s.dot} ${status === "PENDING" ? "adm-breathe" : ""}`}
      />
      {s.label}
    </span>
  );
}

function Cell({ label, children, className = "" }: { label?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label && <span className="mb-1 block text-xs text-muted-foreground xl:hidden">{label}</span>}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

function RowField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-xs leading-5 text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

function Avatar({ src, name, className = "" }: { src?: string; name?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const base = `shrink-0 overflow-hidden bg-muted ${className}`;

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`${base} grid select-none place-items-center font-semibold text-emerald-800 dark:text-emerald-300`}
      >
        {initialsOf(name)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name ? `Photo of ${name}` : "Applicant photo"}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`${base} object-cover`}
    />
  );
}

/** Rendered inside the drawer's dialog node, so the drawer's focus trap and Escape handling cover it. */
function ImageLightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const [failed, setFailed] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => closeBtn.current?.focus(), []);

  return (
    <div
      className="adm-fade fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/85 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeBtn}
        type="button"
        onClick={onClose}
        aria-label="Close image preview"
        className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 ${focusRing}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {failed ? (
        <p className="max-w-sm text-center text-sm text-white/80">
          This image couldn&rsquo;t be loaded.{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Open the original file
          </a>
        </p>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          onError={() => setFailed(true)}
          className="adm-pop max-h-[80vh] max-w-full rounded-lg object-contain"
        />
      )}
      <p className="max-w-full truncate text-sm text-white/80">{name}</p>
    </div>
  );
}

/** Focus management, Escape to close, focus trap and scroll lock for dialogs. */
function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => !el.hasAttribute("disabled"));

    (node?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0])?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, []);

  return ref;
}

/* ----------------------------- Detail drawer ------------------------------ */

function ApplicationDrawer({
  app,
  processing,
  onClose,
  onApprove,
  onReject,
}: {
  app: any;
  processing: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const docs = normalizeDocs(app.documents);

  const openPreview = (url: string, name: string) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setPreview({ url, name });
  };
  const closePreview = () => {
    setPreview(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  // Escape closes the preview first, then the drawer.
  const ref = useDialog(() => (preview ? closePreview() : onClose()));
  const titleId = useId();

  const copyTrx = async () => {
    try {
      await navigator.clipboard.writeText(String(app.transactionId));
      toast.success("Transaction ID copied");
    } catch {
      toast.error("Couldn't copy automatically. Select the ID and copy it manually.");
    }
  };

  return (
    <div
      className="adm-fade fixed inset-0 z-50 bg-black/50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="adm-drawer absolute inset-y-0 right-0 flex w-full flex-col border-l border-border bg-background sm:max-w-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex min-w-0 items-start gap-4">
            {app.photoUrl ? (
              <button
                type="button"
                onClick={() => openPreview(app.photoUrl, `Photo of ${app.studentName}`)}
                aria-label="View applicant photo full size"
                className={`rounded-xl transition-transform duration-300 hover:scale-[1.03] ${focusRing}`}
              >
                <Avatar src={app.photoUrl} name={app.studentName} className="h-16 w-16 rounded-xl text-lg" />
              </button>
            ) : (
              <Avatar name={app.studentName} className="h-16 w-16 rounded-xl text-lg" />
            )}
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">{app.applicationNo}</p>
            <h2 id={titleId} className="mt-1 break-words text-xl font-semibold tracking-tight">
              {app.studentName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <StatusMark status={app.status} />
              <span className="text-sm text-muted-foreground">
                Applying to {app.class?.name || "N/A"}, submitted {formatDate(app.createdAt)}
              </span>
            </div>
          </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application details"
            className={`-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${focusRing}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-9 overflow-y-auto px-6 py-7">
          <section aria-labelledby={`${titleId}-applicant`}>
            <h3 id={`${titleId}-applicant`} className="mb-4 text-sm font-semibold">
              Applicant
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Gender">{app.gender || "N/A"}</Field>
              <Field label="Date of birth">{formatDate(app.dateOfBirth)}</Field>
              <Field label="Religion">{app.religion || "N/A"}</Field>
              <Field label="Country">{app.country || "N/A"}</Field>
              <Field label="Blood group">{app.bloodGroup || "N/A"}</Field>
              <Field label="Target class">{app.class?.name || "N/A"}</Field>
            </dl>
          </section>

          <section aria-labelledby={`${titleId}-family`}>
            <h3 id={`${titleId}-family`} className="mb-4 text-sm font-semibold">
              Parents and contact
            </h3>
            <dl className="divide-y divide-border border-y border-border py-0">
              <div className="py-3">
                <RowField label="Father">
                  {app.fatherName}
                  <span className="text-muted-foreground"> ({app.fatherOccupation || "N/A"})</span>
                </RowField>
              </div>
              <div className="py-3">
                <RowField label="Mother">
                  {app.motherName}
                  <span className="text-muted-foreground"> ({app.motherOccupation || "N/A"})</span>
                </RowField>
              </div>
              <div className="py-3">
                <RowField label="Phone">{app.phone}</RowField>
                <RowField label="Email">{app.email}</RowField>
                <RowField label="Guardian phone">{app.guardianPhone}</RowField>
              </div>
              <div className="py-3">
                <RowField label="Present address">{app.presentAddress}</RowField>
              </div>
            </dl>
          </section>

          <section aria-labelledby={`${titleId}-docs`}>
            <h3 id={`${titleId}-docs`} className="mb-4 text-sm font-semibold">
              Documents{docs.length > 0 && <span className="ml-1.5 font-normal text-muted-foreground">{docs.length}</span>}
            </h3>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents were uploaded with this application.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3">
                {docs.map((d, i) => (
                  <li key={`${d.url}-${i}`} className="min-w-0">
                    {d.isImage ? (
                      <button
                        type="button"
                        onClick={() => openPreview(d.url, d.name)}
                        className={`group block w-full text-left ${focusRing} rounded-lg`}
                      >
                        <span className="block aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={d.url}
                            alt={d.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          />
                        </span>
                        <span className="mt-1.5 block truncate text-xs text-muted-foreground">{d.name}</span>
                      </button>
                    ) : (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex aspect-[4/3] flex-col justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/60 ${focusRing}`}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-muted-foreground">
                          <path d="M7 3h7l5 5v13H7V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium">{d.name}</span>
                          <span className="text-xs text-muted-foreground">Opens in a new tab</span>
                        </span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby={`${titleId}-payment`}
            className="rounded-lg border border-emerald-700/25 bg-emerald-50/70 p-5 dark:border-emerald-400/20 dark:bg-emerald-950/30"
          >
            <h3 id={`${titleId}-payment`} className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Verify this payment
            </h3>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="min-w-0 break-all font-mono text-lg font-semibold tracking-tight text-emerald-800 dark:text-emerald-300">
                {app.transactionId}
              </p>
              <button
                type="button"
                onClick={copyTrx}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50 ${focusRing}`}
              >
                Copy ID
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-emerald-700/15 pt-4 dark:border-emerald-400/15">
              <Field label="Method">{app.paymentMethod}</Field>
              <Field label="Sender phone">{app.senderPhone}</Field>
              <Field label="Amount">
                <span className="tabular-nums">{app.amount}</span> BDT
              </Field>
            </dl>

            <div className="mt-4 border-t border-emerald-700/15 pt-4 dark:border-emerald-400/15">
              {app.paymentScreenshot ? (
                <button
                  type="button"
                  onClick={() => openPreview(app.paymentScreenshot, `Payment screenshot for ${app.transactionId}`)}
                  className={`group block w-full rounded-lg text-left ${focusRing}`}
                >
                  <span className="block max-h-56 overflow-hidden rounded-lg border border-emerald-700/20 bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={app.paymentScreenshot}
                      alt={`Payment screenshot for transaction ${app.transactionId}`}
                      loading="lazy"
                      decoding="async"
                      className="max-h-56 w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </span>
                  <span className="mt-2 block text-xs text-emerald-800 dark:text-emerald-300">
                    Payment screenshot. Click to enlarge and compare the ID and amount.
                  </span>
                </button>
              ) : (
                <p className="text-sm text-amber-700 dark:text-amber-400">No payment screenshot was attached.</p>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {app.status === "PENDING" && (
            <>
              <Button
                variant="ghost"
                disabled={processing}
                onClick={onReject}
                className="text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                Reject
              </Button>
              <Button
                disabled={processing}
                onClick={onApprove}
                className="bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
              >
                {processing ? "Approving…" : "Approve admission"}
              </Button>
            </>
          )}
        </div>

        {preview && <ImageLightbox url={preview.url} name={preview.name} onClose={closePreview} />}
      </div>
    </div>
  );
}

/* ----------------------------- Reject dialog ------------------------------ */

function RejectDialog({
  app,
  reason,
  setReason,
  processing,
  onCancel,
  onConfirm,
}: {
  app: any;
  reason: string;
  setReason: (v: string) => void;
  processing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useDialog(onCancel);
  const titleId = useId();
  const fieldId = useId();

  return (
    <div
      className="adm-fade fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="adm-pop w-full max-w-md rounded-xl border border-border bg-background p-6"
      >
        <h3 id={titleId} className="text-lg font-semibold tracking-tight">
          Reject {app.studentName}&rsquo;s application
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The applicant gets an email with your reason, so keep it specific enough for them to fix and reapply.
        </p>

        <label htmlFor={fieldId} className="mt-5 block text-sm font-medium">
          Reason for rejection
        </label>
        <textarea
          id={fieldId}
          data-autofocus
          rows={4}
          required
          placeholder="e.g. The transaction ID doesn't match any payment, or it was already used on another application."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={`mt-2 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 ${focusRing}`}
        />

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={processing || !reason.trim()} onClick={onConfirm}>
            {processing ? "Rejecting…" : "Reject application"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                             */
/* -------------------------------------------------------------------------- */

export default function AdminAdmissionManagementPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load Applications & Classes
  const fetchData = async (term: string = searchTerm) => {
    setLoading(true);
    try {
      // Build clean query parameters without "ALL" literal values
      const queryParams: any = {};
      if (statusFilter && statusFilter !== "ALL") queryParams.status = statusFilter;
      if (classFilter && classFilter !== "ALL") queryParams.classId = classFilter;
      if (term && term.trim() !== "") queryParams.searchTerm = term.trim();

      const [appRes, classRes] = await Promise.all([
        admissionApi.getAllApplications(queryParams),
        academicService.getAllClasses(),
      ]);

      // Extracting correctly nested data array
      const rawApplications = appRes?.data || appRes || [];
      const applicationsData = Array.isArray(rawApplications) ? rawApplications : rawApplications.data || [];

      const rawClasses = classRes?.data || classRes || [];
      const classesData = Array.isArray(rawClasses) ? rawClasses : rawClasses.data || [];

      setApplications(applicationsData);
      setClassesList(classesData);
    } catch (err: any) {
      console.error("Error loading admissions:", err);
      toast.error(err?.response?.data?.message || "Failed to load admission data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, classFilter]);

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm("");
    if (statusFilter === "ALL" && classFilter === "ALL") {
      fetchData("");
    } else {
      setStatusFilter("ALL");
      setClassFilter("ALL");
    }
  };

  // Approve Application Handler
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const toastId = toast.loading("Approving admission & creating student profile...");

    try {
      await admissionApi.approveAdmission(id);
      toast.success("Admission approved successfully! Student account created.", { id: toastId });
      setSelectedApp(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve admission", { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Application Handler
  const handleRejectSubmit = async () => {
    if (!selectedApp || !rejectReason.trim()) {
      toast.error("Please provide a valid rejection reason!");
      return;
    }

    setProcessingId(selectedApp.id);
    const toastId = toast.loading("Rejecting application & notifying student...");

    try {
      await admissionApi.rejectAdmission(selectedApp.id, rejectReason);
      toast.success("Application rejected and email notification sent.", { id: toastId });
      setIsRejectModalOpen(false);
      setSelectedApp(null);
      setRejectReason("");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject admission", { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const openReject = (app: any) => {
    setSelectedApp(app);
    setIsRejectModalOpen(true);
  };

  const cancelReject = () => {
    setIsRejectModalOpen(false);
    setRejectReason("");
  };

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const hasActiveFilters = statusFilter !== "ALL" || classFilter !== "ALL" || searchTerm.trim() !== "";

  const inputBase = `w-full rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-foreground/25 ${focusRing}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-sans text-foreground sm:px-6 lg:py-12">
      <style>{`
        @keyframes adm-rise{from{opacity:0;transform:translate3d(0,8px,0)}to{opacity:1;transform:none}}
        @keyframes adm-fade{from{opacity:0}to{opacity:1}}
        @keyframes adm-drawer{from{opacity:0;transform:translate3d(36px,0,0)}to{opacity:1;transform:none}}
        @keyframes adm-pop{from{opacity:0;transform:translate3d(0,10px,0) scale(.98)}to{opacity:1;transform:none}}
        @keyframes adm-breathe{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
        .adm-rise{animation:adm-rise .55s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i,0)*45ms)}
        .adm-fade{animation:adm-fade .2s ease-out both}
        .adm-drawer{animation:adm-drawer .45s cubic-bezier(.32,.72,0,1) both}
        .adm-pop{animation:adm-pop .35s cubic-bezier(.34,1.3,.64,1) both}
        .adm-breathe{animation:adm-breathe 2.4s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){
          .adm-rise,.adm-fade,.adm-drawer,.adm-pop,.adm-breathe{animation:none}
        }
      `}</style>

      {/* Header */}
      <header className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Admission applications</h1>
          <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">
            Check each payment against the transaction ID, then approve the student&rsquo;s enrollment or reject it
            with a reason.
          </p>
        </div>

        <div aria-live="polite" className="flex items-baseline gap-3 border-l-2 border-emerald-700 pl-4 dark:border-emerald-500">
          <span className="text-4xl font-semibold leading-none tabular-nums text-emerald-800 dark:text-emerald-300">
            {loading ? "–" : pendingCount}
          </span>
          <span className="text-sm leading-snug text-muted-foreground">
            awaiting review
            <br />
            {loading ? "loading" : `of ${applications.length} shown`}
          </span>
        </div>
      </header>

      {/* Filters */}
      <form onSubmit={handleSearch} className="mt-10 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex self-start rounded-lg bg-muted p-1"
        >
          {STATUS_OPTIONS.map((opt) => {
            const active = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${focusRing} ${
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div>
            <label htmlFor="adm-class" className="sr-only">
              Class
            </label>
            <select
              id="adm-class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className={`${inputBase} h-10 px-3 sm:w-48`}
            >
              <option value="ALL">All classes</option>
              {classesList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <label htmlFor="adm-search" className="sr-only">
              Search applications
            </label>
            <FaSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
            />
            <input
              id="adm-search"
              type="text"
              placeholder="Search by name, phone or transaction ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputBase} h-10 pl-9 pr-3`}
            />
          </div>

          <Button
            type="submit"
            className="h-10 rounded-lg bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800"
          >
            Search
          </Button>
        </div>
      </form>

      {/* List */}
      <Card className="mt-6 overflow-hidden rounded-xl border-border shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div role="status" aria-live="polite" className="divide-y divide-border">
              <span className="sr-only">Loading admission applications</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-6 px-5 py-5" aria-hidden="true">
                  <div className="h-9 w-24 rounded bg-muted motion-safe:animate-pulse" />
                  <div className="h-9 flex-1 rounded bg-muted motion-safe:animate-pulse" />
                  <div className="hidden h-9 w-40 rounded bg-muted motion-safe:animate-pulse md:block" />
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
              <FaExclamationTriangle aria-hidden="true" className="text-xl text-amber-500" />
              <p className="mt-4 text-base font-semibold">No applications match these filters</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Try a different status or class, or search by the exact phone number or transaction ID.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-5">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div>
              {/* Column labels (wide screens only) */}
              <div
                aria-hidden="true"
                className={`hidden gap-x-6 border-b border-border bg-muted/50 px-5 py-3 text-xs font-medium text-muted-foreground xl:grid ${ROW_COLS}`}
              >
                <span>Application</span>
                <span>Student</span>
                <span>Class</span>
                <span>Payment</span>
                <span>Status</span>
                <span />
              </div>

              <ul>
                {applications.map((app, i) => {
                  const busy = processingId === app.id;
                  return (
                    <li
                      key={app.id}
                      style={{ "--i": Math.min(i, 10) } as React.CSSProperties}
                      className={`adm-rise group relative grid gap-x-6 gap-y-4 border-t border-border px-5 py-5 transition-colors first:border-t-0 hover:bg-muted/40 xl:items-center ${ROW_COLS}`}
                    >
                      {/* Pending rows carry a rail so the queue reads at a glance */}
                      {app.status === "PENDING" && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-amber-500"
                        />
                      )}

                      <Cell label="Application">
                        <span className="block font-mono text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                          {app.applicationNo}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(app.createdAt)}</span>
                      </Cell>

                      <Cell label="Student">
                        <div className="flex items-center gap-3">
                          <Avatar src={app.photoUrl} name={app.studentName} className="h-10 w-10 rounded-full text-xs" />
                          <div className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{app.studentName}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <FaPhoneAlt aria-hidden="true" className="text-[9px]" /> {app.phone}
                            </span>
                          </div>
                        </div>
                      </Cell>

                      <Cell label="Class">
                        <span className="text-sm font-medium">{app.class?.name || "N/A"}</span>
                      </Cell>

                      <Cell label="Payment">
                        <span className="block truncate font-mono text-sm font-semibold">{app.transactionId}</span>
                        <span className="text-xs text-muted-foreground">
                          {app.paymentMethod}, <span className="tabular-nums">{app.amount}</span> BDT from{" "}
                          {app.senderPhone}
                        </span>
                        {!app.paymentScreenshot && (
                          <span className="mt-0.5 block text-xs text-amber-700 dark:text-amber-400">
                            No screenshot attached
                          </span>
                        )}
                      </Cell>

                      <Cell label="Status">
                        <StatusMark status={app.status} />
                      </Cell>

                      <div className="col-span-2 flex flex-wrap items-center gap-1.5 xl:col-span-1 xl:justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)} className="h-8 rounded-md">
                          <FaEye aria-hidden="true" className="mr-1.5" /> View
                        </Button>

                        {app.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() => handleApprove(app.id)}
                              className="h-8 rounded-md bg-emerald-700 text-white hover:bg-emerald-800"
                            >
                              {busy ? <FaSpinner aria-hidden="true" className="mr-1.5 animate-spin" /> : null}
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              onClick={() => openReject(app)}
                              className="h-8 rounded-md text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details drawer */}
      {selectedApp && !isRejectModalOpen && (
        <ApplicationDrawer
          app={selectedApp}
          processing={processingId === selectedApp.id}
          onClose={() => setSelectedApp(null)}
          onApprove={() => handleApprove(selectedApp.id)}
          onReject={() => setIsRejectModalOpen(true)}
        />
      )}

      {/* Reject reason dialog */}
      {isRejectModalOpen && selectedApp && (
        <RejectDialog
          app={selectedApp}
          reason={rejectReason}
          setReason={setRejectReason}
          processing={processingId === selectedApp.id}
          onCancel={cancelReject}
          onConfirm={handleRejectSubmit}
        />
      )}
    </div>
  );
}