"use client";

import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaSpinner,
  FaGraduationCap,
  FaSave,
  FaLock,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { academicService } from "@/src/Services/academicService";
import { attendanceService } from "@/src/Services/attendanceService";
import { toast } from "sonner";
import axiosInstance from "@/src/lib/axiosInstance";

export default function AttendanceManagementPage() {
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);

  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, "PRESENT" | "ABSENT" | "LATE">
  >({});
  
  // 🔒 Lock system: Track statuses already saved in DB
  const [savedAttendanceMap, setSavedAttendanceMap] = useState<
    Record<string, "PRESENT" | "ABSENT" | "LATE">
  >({});

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load Classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await academicService.getAllClasses();
        const data = res?.data || res || [];
        setClassesList(Array.isArray(data) ? data : []);
      } catch (err: any) {
        toast.error("Failed to load classes!");
      }
    };
    loadClasses();
  }, []);

  // Filter sections when class changes
  useEffect(() => {
    if (selectedClass) {
      const cls = classesList.find((c) => c.id === selectedClass);
      setSectionsList(cls?.sections || []);
      setSelectedSection("");
    } else {
      setSectionsList([]);
    }
  }, [selectedClass, classesList]);

  // Load Students and Existing Attendance
  const handleLoadStudents = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error("Please select both Class and Section!");
      return;
    }

    setLoading(true);
    try {
      const studentRes = await axiosInstance.get("/students", {
        params: { classId: selectedClass, sectionId: selectedSection },
      });
      const rawStudents = studentRes?.data?.data || studentRes?.data || [];

      // Fetch existing attendance for chosen date
      const existingAttRes = await attendanceService.getSectionAttendance(
        selectedClass,
        selectedSection,
        attendanceDate
      );
      const existingData = existingAttRes?.data || [];

      const existingMap: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
      existingData.forEach((att: any) => {
        existingMap[att.studentId] = att.status;
      });

      const initialMap: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
      rawStudents.forEach((stu: any) => {
        initialMap[stu.id] = existingMap[stu.id] || "PRESENT";
      });

      setStudents(rawStudents);
      setAttendanceMap(initialMap);
      setSavedAttendanceMap(existingMap); // Store current saved database state
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch student attendance data!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE"
  ) => {
    // 🔒 Security Check: If already saved as PRESENT, lock modifications
    if (savedAttendanceMap[studentId] === "PRESENT") {
      toast.warning("This student is already marked as PRESENT and cannot be changed!");
      return;
    }

    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: "PRESENT" | "ABSENT" | "LATE") => {
    const updatedMap: Record<string, "PRESENT" | "ABSENT" | "LATE"> = { ...attendanceMap };
    
    students.forEach((stu) => {
      // Only change if not locked as PRESENT
      if (savedAttendanceMap[stu.id] !== "PRESENT") {
        updatedMap[stu.id] = status;
      }
    });

    setAttendanceMap(updatedMap);
  };

  const handleSubmitAttendance = async () => {
    if (students.length === 0) {
      toast.error("No students found to mark attendance!");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting attendance & triggering WhatsApp alerts...");

    try {
      const payload = {
        date: attendanceDate,
        classId: selectedClass,
        sectionId: selectedSection,
        attendances: Object.keys(attendanceMap).map((stuId) => ({
          studentId: stuId,
          status: attendanceMap[stuId],
        })),
      };

      const res = await attendanceService.takeAttendance(payload);

      // Lock current state in memory after successful save
      const newlySavedMap = { ...savedAttendanceMap };
      Object.keys(attendanceMap).forEach((stuId) => {
        newlySavedMap[stuId] = attendanceMap[stuId];
      });
      setSavedAttendanceMap(newlySavedMap);

      toast.success("Attendance saved & WhatsApp notifications sent!", {
        id: toastId,
      });
    } catch (err: any) {
      console.error("❌ Attendance Submission Error:", err?.response?.data || err);
      toast.error(
        err?.response?.data?.message || "Failed to submit attendance!",
        { id: toastId }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaGraduationCap />
            <span>Digital Attendance Management</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1">
            Select Class, Section, and Date to mark attendance. Absent notifications will automatically send via WhatsApp.
          </p>
        </div>
      </div>

      {/* Control / Selection Panel */}
      <Card className="border-border shadow-sm rounded-2xl">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Class *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
            >
              <option value="">Choose Class...</option>
              {classesList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Select Section *</label>
            <select
              value={selectedSection}
              disabled={!selectedClass}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold disabled:opacity-50"
            >
              <option value="">Choose Section...</option>
              {sectionsList.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Attendance Date *</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleLoadStudents}
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold h-10"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaCalendarAlt />} Load Student List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student List & Attendance Table */}
      {students.length > 0 && (
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
          <div className="p-4 bg-muted/50 border-b border-border flex justify-between items-center text-xs">
            <span className="font-bold">Total Students: {students.length}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAll("PRESENT")}
                className="text-[11px] h-7"
              >
                Mark All Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAll("ABSENT")}
                className="text-[11px] h-7"
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Student ID</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5 text-center">Status Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((stu) => {
                  const currentStatus = attendanceMap[stu.id] || "PRESENT";
                  const isLockedPresent = savedAttendanceMap[stu.id] === "PRESENT";

                  return (
                    <tr key={stu.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3.5 font-bold">{stu.rollNo}</td>
                      <td className="p-3.5 font-mono text-emerald-700 font-bold">
                        {stu.studentIdNo}
                      </td>
                      <td className="p-3.5 font-semibold flex items-center gap-2">
                        <span>{stu.firstName} {stu.lastName}</span>
                        {isLockedPresent && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FaLock size={8} /> Verified Present
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(stu.id, "PRESENT")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold border transition-all ${
                            currentStatus === "PRESENT"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-background text-muted-foreground border-input hover:bg-emerald-50"
                          }`}
                        >
                          <FaCheck /> Present
                        </button>

                        <button
                          type="button"
                          disabled={isLockedPresent}
                          onClick={() => handleStatusChange(stu.id, "ABSENT")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold border transition-all ${
                            currentStatus === "ABSENT"
                              ? "bg-rose-600 text-white border-rose-600"
                              : "bg-background text-muted-foreground border-input hover:bg-rose-50"
                          } ${isLockedPresent ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                        >
                          <FaTimes /> Absent
                        </button>

                        <button
                          type="button"
                          disabled={isLockedPresent}
                          onClick={() => handleStatusChange(stu.id, "LATE")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold border transition-all ${
                            currentStatus === "LATE"
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-background text-muted-foreground border-input hover:bg-amber-50"
                          } ${isLockedPresent ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                        >
                          <FaClock /> Late
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>

          <div className="p-4 border-t bg-muted/30 flex justify-end">
            <Button
              onClick={handleSubmitAttendance}
              disabled={submitting}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2 rounded-xl text-xs flex items-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}{" "}
              Save & Send WhatsApp Alerts
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}