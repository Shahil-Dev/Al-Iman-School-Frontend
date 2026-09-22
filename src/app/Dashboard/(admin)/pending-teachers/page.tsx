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
  FaEye,
  FaBuilding,
  FaBook,
  FaVenusMars,
  FaTint,
  FaUser,
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
  const [selectedTeacher, setSelectedTeacher] = useState<PendingTeacher | null>(null);
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

      // Remove approved teacher from UI list & close modal
      setTeachers((prev) => prev.filter((t) => t.id !== teacherProfileId));
      if (selectedTeacher?.id === teacherProfileId) {
        setSelectedTeacher(null);
      }
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
            Review detailed teacher applications and approve qualified candidates for Al-Iman School.
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
                  {/* Teacher Profile Quick View */}
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

                  {/* Summary Attributes */}
                  <div className="space-y-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 truncate">
                      <FaEnvelope className="text-[#c9a961] shrink-0" />
                      <span className="truncate">{teacher.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-[#c9a961] shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  </div>

                  {/* Action Buttons: Show Details & Approve */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="bg-card hover:bg-muted text-foreground border border-border h-9 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <FaEye className="text-xs text-[#c9a961]" />
                      <span>Show Details</span>
                    </Button>

                    <Button
                      onClick={() => handleApprove(teacher.id)}
                      disabled={approvingId === teacher.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      {approvingId === teacher.id ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : (
                        <>
                          <FaUserCheck className="text-xs" />
                          <span>Approve</span>
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

      {/* Detail Modal Dialog */}
      <AnimatePresence>
        {selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="p-5 bg-muted/40 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-bold text-base">
                  <FaUser className="text-[#c9a961]" />
                  <span>Teacher Application Details</span>
                </div>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Profile Avatar & Primary Info */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="w-16 h-16 rounded-xl bg-card border border-border overflow-hidden flex items-center justify-center text-[#c9a961] font-bold text-2xl shrink-0">
                    {selectedTeacher.photoUrl ? (
                      <img
                        src={selectedTeacher.photoUrl}
                        alt={selectedTeacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedTeacher.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{selectedTeacher.name}</h3>
                    <p className="text-xs text-[#c9a961] font-bold mt-0.5">{selectedTeacher.designation}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Applied: {new Date(selectedTeacher.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9a961]">
                    Professional Info
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-card p-3 rounded-xl border border-border">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Department</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaBook className="text-[#c9a961]" /> {selectedTeacher.department || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Qualification</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaGraduationCap className="text-[#c9a961]" /> {selectedTeacher.qualification || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal & Verification Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9a961]">
                    Personal Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-card p-3 rounded-xl border border-border">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Email</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5 truncate">
                        <FaEnvelope className="text-[#c9a961] shrink-0" /> {selectedTeacher.user.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Phone</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaPhone className="text-[#c9a961]" /> {selectedTeacher.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Gender</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaVenusMars className="text-[#c9a961]" /> {selectedTeacher.gender}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Blood Group</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaTint className="text-[#c9a961]" /> {selectedTeacher.bloodGroup || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">NID / Passport</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaIdCard className="text-[#c9a961]" /> {selectedTeacher.nidOrPassport || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-3">
                <Button
                  onClick={() => setSelectedTeacher(null)}
                  className="bg-card hover:bg-muted text-foreground border border-border text-xs px-4 h-9 rounded-xl"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleApprove(selectedTeacher.id)}
                  disabled={approvingId === selectedTeacher.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 h-9 rounded-xl font-bold flex items-center gap-2"
                >
                  {approvingId === selectedTeacher.id ? (
                    <FaSpinner className="animate-spin text-xs" />
                  ) : (
                    <>
                      <FaUserCheck />
                      <span>Approve Teacher</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}