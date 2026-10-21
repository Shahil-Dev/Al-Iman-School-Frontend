"use client";

import React from "react";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaHourglassHalf,
} from "react-icons/fa";

interface InvoiceStatusBadgeProps {
  invoice: any;
  isBn: boolean;
}

export default function InvoiceStatusBadge({
  invoice,
  isBn,
}: InvoiceStatusBadgeProps) {
  const hasPendingTx = invoice.transactions?.some(
    (t: any) => t.status === "PENDING_APPROVAL",
  );

  const base =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border";

  if (invoice.status === "PAID") {
    return (
      <span
        className={`${base} bg-emerald-500/10 text-emerald-600 border-emerald-500/20`}
      >
        <FaCheckCircle /> {isBn ? "পরিশোধিত" : "PAID"}
      </span>
    );
  }

  if (hasPendingTx) {
    return (
      <span
        className={`${base} bg-amber-500/10 text-amber-600 border-amber-500/20`}
      >
        <FaClock /> {isBn ? "অনুমোদনের অপেক্ষায়" : "Pending Approval"}
      </span>
    );
  }

  if (invoice.status === "PARTIAL") {
    return (
      <span
        className={`${base} bg-sky-500/10 text-sky-600 border-sky-500/20`}
      >
        <FaHourglassHalf /> {isBn ? "আংশিক পরিশোধিত" : "PARTIAL"}
      </span>
    );
  }

  if (invoice.status === "OVERDUE") {
    return (
      <span
        className={`${base} bg-destructive/10 text-destructive border-destructive/20`}
      >
        <FaExclamationCircle /> {isBn ? "মেয়াদোত্তীর্ণ বকেয়া" : "OVERDUE"}
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-destructive/10 text-destructive border-destructive/20`}
    >
      <FaExclamationCircle /> {isBn ? "বকেয়া" : "UNPAID"}
    </span>
  );
}