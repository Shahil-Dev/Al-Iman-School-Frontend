"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaSearch,
  FaUserGraduate,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaTimes,
  FaSpinner,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaSave,
  FaFilter,
  FaExclamationTriangle,
  FaHashtag,
  FaIdBadge,
  FaGraduationCap,
  FaKey,
  FaEnvelope,
} from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { StudentService } from "@/src/Services/studentService";
import { academicService } from "@/src/Services/academicService";
import { toast } from "sonner";

export default function StudentManagementPage() {
  const { language } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("ALL");

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState<any>({});

  // 1. Fetch Dynamic Classes List from Backend
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await academicService.getAllClasses();
        setClassesList(res?.data || res || []);
      } catch (err) {
        console.error("Failed to load classes for filter dropdown:", err);
      }
    }
    loadClasses();
  }, []);

  // 2. Load Students from Backend with Dynamic Search & Class Filter
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await StudentService.getAllStudents({
        searchTerm: searchTerm || undefined,
        classId: selectedClassId !== "ALL" ? selectedClassId : undefined,
      });
      setStudents(res.data || res || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to fetch students";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedClassId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  // Handle View Details
  const handleOpenDetails = (student: any) => {
    setSelectedStudent(student);
    setEditFormData({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      phone: student.phone || "",
      address: student.address || "",
      rollNo: student.rollNo || 0,
    });
    setIsEditing(false);
    setIsDetailsModalOpen(true);
  };

  // Handle Update Student Action
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setActionLoading(true);
    const toastId = toast.loading(
      language === "bn" ? "তথ্য আপডেট হচ্ছে..." : "Updating student profile..."
    );

    try {
      await StudentService.updateStudent(selectedStudent.id, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone,
        address: editFormData.address,
        rollNo: Number(editFormData.rollNo),
      });

      toast.success(
        language === "bn"
          ? "শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে!"
          : "Student profile updated successfully!",
        { id: toastId }
      );
      setIsEditing(false);
      setIsDetailsModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update student profile",
        { id: toastId }
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Delete Modal
  const handlePromptDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;

    setActionLoading(true);
    const toastId = toast.loading(
      language === "bn" ? "প্রোফাইল মোছা হচ্ছে..." : "Deleting student profile..."
    );

    try {
      await StudentService.deleteStudent(selectedStudent.id);
      toast.success(
        language === "bn"
          ? "শিক্ষার্থীর প্রোফাইল মুছে ফেলা হয়েছে!"
          : "Student profile deleted successfully!",
        { id: toastId }
      );
      setIsDeleteConfirmOpen(false);
      setIsDetailsModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete student", {
        id: toastId,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
              <FaUserGraduate className="text-xl" />
            </div>
            <span className="tracking-tight">
              {language === "bn" ? "শিক্ষার্থী ব্যবস্থাপনা" : "Student Management"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {language === "bn"
              ? "ভর্তি হওয়া শিক্ষার্থীদের তথ্য ফিল্টার, বিস্তারিত দেখা ও পরিচালনা করুন"
              : "Search, filter by class, view details and manage registered students"}
          </p>
        </div>
      </div>

      {/* Search & Dynamic Class Filter Bar */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card/80 backdrop-blur-sm transition-all duration-200">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3.5">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none transition-colors" />
            <input
              type="text"
              placeholder={
                language === "bn"
                  ? "নাম, কোড, রোল বা মোবাইল দিয়ে খুঁজুন..."
                  : "Search by name, student code, roll or phone..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-xs rounded-xl border border-border/80 bg-background/50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="p-2 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground shrink-0">
              <FaFilter className="text-xs" />
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2.5 text-xs rounded-xl border border-border/80 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-52 font-semibold cursor-pointer transition-all hover:bg-muted/30"
            >
              <option value="ALL">
                {language === "bn" ? "সকল ক্লাস (All Classes)" : "All Classes"}
              </option>
              {classesList.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Student List Data Table */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b border-border/60 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-4 pl-6">Code & Roll</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class & Section</th>
                <th className="p-4">Phone / Contact</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-12">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <FaSpinner className="animate-spin text-2xl text-primary" />
                      <span className="text-xs font-semibold">Loading student records...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center p-12">
                    <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive font-semibold border border-destructive/20 text-xs">
                      <FaExclamationTriangle className="text-base shrink-0" />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-muted/30 transition-colors duration-150 group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                          <FaIdBadge className="text-[10px]" />
                          <span>{student.studentCode || student.studentIdNo}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground/90 font-semibold tracking-tight flex items-center gap-1">
                          <FaHashtag className="text-[9px] text-primary/70" />
                          <span>Roll: {student.rollNo}</span>
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          {student.firstName?.charAt(0) || "S"}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                            {student.firstName} {student.lastName}
                          </span>
                          {student.user?.email && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <FaEnvelope className="text-[9px]" /> {student.user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/40 text-[11px] font-semibold text-foreground">
                        <FaGraduationCap className="text-primary text-xs" />
                        <span>{student.class?.name || "N/A"}</span>
                        <span className="text-muted-foreground font-normal">
                          ({student.section?.name || "N/A"})
                        </span>
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">
                      {student.phone || student.parent?.phone || "N/A"}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-1.5">
                      <Button
                        onClick={() => handleOpenDetails(student)}
                        variant="outline"
                        className="px-3 py-1.5 h-auto text-[11px] rounded-xl border-border/70 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-1.5 inline-flex shadow-2xs"
                      >
                        <FaEye className="text-primary text-xs" />
                        <span>{language === "bn" ? "বিস্তারিত" : "Details"}</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-12 text-muted-foreground font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-xs">No student records found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comprehensive Student Details Modal */}
      {isDetailsModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto transition-all animate-in fade-in duration-200">
          <Card className="max-w-xl w-full bg-card/95 border-border/80 shadow-2xl rounded-2xl overflow-hidden my-8 backdrop-blur-xl">
            <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <FaUserGraduate className="text-base" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {isEditing ? "Edit Student Information" : "Student Detailed Profile"}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/80 p-2 rounded-xl transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner overflow-hidden">
                  {selectedStudent.photoUrl ? (
                    <img
                      src={selectedStudent.photoUrl}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedStudent.firstName?.charAt(0) || "S"
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-foreground leading-tight">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    Code: <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedStudent.studentCode}</span> | ID: <span className="font-semibold text-foreground">{selectedStudent.studentIdNo}</span>
                  </p>
                  <p className="text-[11px] text-primary font-semibold flex items-center gap-1.5 pt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                      {selectedStudent.class?.name}
                    </span>
                    <span>•</span>
                    <span>Section: {selectedStudent.section?.name}</span>
                    <span>•</span>
                    <span>Roll: {selectedStudent.rollNo}</span>
                  </p>
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  {/* Student Login Credentials Card */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <p className="text-[10px] text-emerald-900 dark:text-emerald-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <FaKey className="text-xs" /> Access & Credentials
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <p><b>PIN:</b> <span className="text-emerald-700 dark:text-emerald-400 font-bold">{selectedStudent.pin || "123456"}</span></p>
                      <p><b>Email:</b> {selectedStudent.user?.email || "No Portal Account"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 transition-colors hover:border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5 mb-1.5">
                        <FaUser className="text-xs text-primary" /> Gender & DOB
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {selectedStudent.gender || "N/A"} |{" "}
                        {selectedStudent.dob
                          ? new Date(selectedStudent.dob).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 transition-colors hover:border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5 mb-1.5">
                        <FaPhone className="text-xs text-primary" /> Phone Number
                      </p>
                      <p className="text-xs font-semibold text-foreground font-mono">
                        {selectedStudent.phone || "No phone provided"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 transition-colors hover:border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5 mb-1.5">
                      <FaMapMarkerAlt className="text-xs text-primary" /> Residential Address
                    </p>
                    <p className="text-xs font-semibold text-foreground leading-relaxed">
                      {selectedStudent.address || "No address on record"}
                    </p>
                  </div>

                  {/* Parents Info */}
                  <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-2.5">
                    <h5 className="text-xs font-bold text-foreground border-b border-border/40 pb-2">
                      Parents Information
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                          Father Name
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedStudent.fatherName || selectedStudent.parent?.fatherName || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                          Mother Name
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedStudent.motherName || selectedStudent.parent?.motherName || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <Button
                      onClick={handlePromptDelete}
                      variant="destructive"
                      className="px-4 py-2 h-auto text-xs rounded-xl flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-all shadow-2xs"
                    >
                      <FaTrashAlt />
                      <span>Delete Profile</span>
                    </Button>

                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary text-primary-foreground px-4 py-2 h-auto text-xs rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-foreground">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.firstName}
                        onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                        className="w-full p-2.5 text-xs rounded-xl border border-border/80 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-foreground">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.lastName}
                        onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                        className="w-full p-2.5 text-xs rounded-xl border border-border/80 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-foreground">
                        Roll Number
                      </label>
                      <input
                        type="number"
                        required
                        value={editFormData.rollNo}
                        onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                        className="w-full p-2.5 text-xs rounded-xl border border-border/80 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-foreground">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full p-2.5 text-xs rounded-xl border border-border/80 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-border/80 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 h-auto text-xs rounded-xl border-border/80 hover:bg-muted/80 transition-all"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-primary text-primary-foreground px-4 py-2 h-auto text-xs rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                    >
                      {actionLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedStudent && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-in fade-in duration-200">
          <Card className="max-w-sm w-full bg-card/95 border-destructive/30 shadow-2xl rounded-2xl overflow-hidden p-6 text-center space-y-4 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mx-auto text-2xl shadow-xs">
              <FaExclamationTriangle />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                {language === "bn" ? "আপনি কি নিশ্চিত?" : "Are you absolutely sure?"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === "bn"
                  ? `${selectedStudent.firstName} ${selectedStudent.lastName} এর প্রোফাইল চিরতরে মুছে যাবে।`
                  : `This action will permanently delete ${selectedStudent.firstName} ${selectedStudent.lastName}'s student account and profile.`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="w-full h-auto py-2.5 text-xs rounded-xl border-border/80 hover:bg-muted/80 transition-all"
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                variant="destructive"
                className="w-full h-auto py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
                <span>{language === "bn" ? "হ্যাঁ, মুছুন" : "Confirm Delete"}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}