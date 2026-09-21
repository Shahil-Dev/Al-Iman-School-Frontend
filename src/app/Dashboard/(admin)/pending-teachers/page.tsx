"use client";

import React, { useEffect, useState } from "react";
import {
  FaUserCheck,
  FaSpinner,
  FaUserClock,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaGraduationCap,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/src/lib/axiosInstance";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

type PendingTeacher = {
  id: string;
  name: string;
  designation: string;
  department?: string;
  qualification?: string;
  phone: string;
  nidOrPassport?: string;
  gender: string;
  bloodGroup?: string;
  photoUrl?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    isApproved: boolean;
  };
};

export default function PendingTeachersPage() {
  const [teachers, setTeachers] = useState<PendingTeacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch all pending teacher requests
  const fetchPendingTeachers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/teachers/pending-teachers");
      setTeachers(res.data.data || []);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load pending teachers.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  // Approve a pending teacher
  const handleApprove = async (teacherProfileId: string) => {
    try {
      setApprovingId(teacherProfileId);
      setMessage(null);

      await axiosInstance.patch(`/teachers/approve/${teacherProfileId}`);

      setMessage({
        type: "success",
        text: "Teacher approved successfully! Account is now active.",
      });

      // Remove approved teacher from UI list
      setTeachers((prev) => prev.filter((t) => t.id !== teacherProfileId));
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to approve teacher.",
      });
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-foreground">
            <FaUserClock className="text-[#c9a961]" />
            <span>Pending Teacher Approvals</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review and approve pending teacher registration applications for Al-Iman School.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-[#c9a961]/10 border border-[#c9a961]/20 text-[#c9a961] text-xs font-bold w-fit">
          Total Pending: {teachers.length}
        </div>
      </div>

      {/* Alert Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 border border-destructive/20 text-destructive"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-sm shrink-0" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="hover:opacity-70">
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <FaSpinner className="animate-spin text-2xl text-[#c9a961]" />
          <p className="text-xs text-muted-foreground">Loading pending applications...</p>
        </div>
      ) : teachers.length === 0 ? (
        <Card className="border-border bg-card/50 shadow-sm rounded-2xl p-12 text-center">
          <FaCheckCircle className="mx-auto text-4xl text-emerald-500/60 mb-3" />
          <h3 className="text-base font-bold text-foreground">No Pending Teacher Applications</h3>
          <p className="text-xs text-muted-foreground mt-1">
            All teacher registration requests have been reviewed and processed.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-border shadow-md hover:shadow-lg transition-all rounded-2xl bg-card overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  {/* Teacher Card Top Details */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center text-[#c9a961] font-bold text-lg">
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        teacher.name.charAt(0)
                      )}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h3 className="text-sm font-bold text-foreground truncate">{teacher.name}</h3>
                      <p className="text-xs text-[#c9a961] font-semibold">{teacher.designation}</p>
                      {teacher.department && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {teacher.department}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Fields */}
                  <div className="space-y-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 truncate">
                      <FaEnvelope className="text-[#c9a961] shrink-0" />
                      <span className="truncate">{teacher.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-[#c9a961] shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                    {teacher.qualification && (
                      <div className="flex items-center gap-2 truncate">
                        <FaGraduationCap className="text-[#c9a961] shrink-0" />
                        <span className="truncate">{teacher.qualification}</span>
                      </div>
                    )}
                    {teacher.nidOrPassport && (
                      <div className="flex items-center gap-2 truncate">
                        <FaIdCard className="text-[#c9a961] shrink-0" />
                        <span className="truncate">NID: {teacher.nidOrPassport}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleApprove(teacher.id)}
                      disabled={approvingId === teacher.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {approvingId === teacher.id ? (
                        <>
                          <FaSpinner className="animate-spin text-xs" />
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <FaUserCheck className="text-xs" />
                          <span>Approve Teacher</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}