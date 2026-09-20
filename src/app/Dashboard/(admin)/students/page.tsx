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
} from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { StudentService } from "@/src/Services/studentService";
import academicService from "@/src/Services/academicService";

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

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await StudentService.getAllStudents({
        searchTerm: searchTerm || undefined,
        classId: selectedClassId !== "ALL" ? selectedClassId : undefined,
      });
      setStudents(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedClassId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 400); // Debounce search
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
    try {
      await StudentService.updateStudent(selectedStudent.id, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone,
        address: editFormData.address,
        rollNo: Number(editFormData.rollNo),
      });

      setIsEditing(false);
      setIsDetailsModalOpen(false);
      fetchStudents(); // Refresh List
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update student profile");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Action
  const handleDeleteStudent = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this student profile permanently?",
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await StudentService.deleteStudent(id);
      setIsDetailsModalOpen(false);
      fetchStudents(); // Refresh List
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete student");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2.5">
            <FaUserGraduate className="text-primary text-2xl" />
            <span>
              {language === "bn"
                ? "শিক্ষার্থী ব্যবস্থাপনা"
                : "Student Management"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {language === "bn"
              ? "লাইভ ব্যাকেন্ড থেকে শিক্ষার্থীদের তথ্য ফিল্টার, বিস্তারিত দেখা ও পরিচালনা করুন"
              : "Search, filter by dynamic class, view details and manage students"}
          </p>
        </div>
      </div>

      {/* Search & Dynamic Class Filter Bar */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search Bar */}
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <input
              type="text"
              placeholder={
                language === "bn"
                  ? "নাম, রোল বা আইডি দিয়ে খুঁজুন..."
                  : "Search by name, roll or ID..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          {/* Right: Dynamic Class Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FaFilter className="text-muted-foreground text-xs shrink-0" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 font-semibold cursor-pointer"
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
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b border-border font-semibold">
                <th className="p-4">Roll / ID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class & Section</th>
                <th className="p-4">Guardian Phone</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <FaSpinner className="animate-spin text-lg text-primary" />
                      <span>Loading live student records...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-8 text-destructive font-semibold"
                  >
                    {error}
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-bold text-foreground">
                        Roll: {student.rollNo}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {student.studentIdNo}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {student.firstName?.charAt(0) || "S"}
                        </div>
                        <span className="font-semibold text-foreground">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {student.class?.name || "N/A"} (
                      {student.section?.name || "N/A"})
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {student.phone || student.parent?.phone || "N/A"}
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <Button
                        onClick={() => handleOpenDetails(student)}
                        variant="outline"
                        className="px-3 py-1.5 h-auto text-[11px] rounded-xl flex items-center gap-1.5 inline-flex"
                      >
                        <FaEye className="text-primary text-xs" />
                        <span>
                          {language === "bn" ? "বিস্তারিত" : "Details"}
                        </span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-8 text-muted-foreground font-medium"
                  >
                    No student records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comprehensive Student Details & Action Modal */}
      {isDetailsModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-xl w-full bg-card border-border shadow-2xl rounded-2xl overflow-hidden my-8">
            {/* Modal Topbar */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <FaUserGraduate className="text-primary text-lg" />
                <h3 className="text-sm font-bold text-foreground">
                  {isEditing
                    ? "Edit Student Information"
                    : "Student Detailed Profile"}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                  {selectedStudent.photoUrl ? (
                    <img
                      src={selectedStudent.photoUrl}
                      alt="Student"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    selectedStudent.firstName?.charAt(0) || "S"
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-base font-bold text-foreground">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    ID:{" "}
                    <span className="font-semibold text-foreground">
                      {selectedStudent.studentIdNo}
                    </span>
                  </p>
                  <p className="text-[11px] text-primary font-semibold">
                    {selectedStudent.class?.name} | Section:{" "}
                    {selectedStudent.section?.name} | Roll:{" "}
                    {selectedStudent.rollNo}
                  </p>
                </div>
              </div>

              {/* View Mode vs Edit Mode */}
              {!isEditing ? (
                /* READ-ONLY DETAILS VIEW */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1.5 mb-1">
                        <FaUser className="text-xs text-primary" /> Gender & DOB
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {selectedStudent.gender || "N/A"} |{" "}
                        {selectedStudent.dob
                          ? new Date(selectedStudent.dob).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1.5 mb-1">
                        <FaPhone className="text-xs text-primary" /> Phone
                        Number
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {selectedStudent.phone || "No phone provided"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1.5 mb-1">
                      <FaMapMarkerAlt className="text-xs text-primary" />{" "}
                      Residential Address
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      {selectedStudent.address || "No address on record"}
                    </p>
                  </div>

                  {/* Guardian Section */}
                  {selectedStudent.parent && (
                    <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
                      <h5 className="text-xs font-bold text-foreground">
                        Parent / Guardian Details
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">
                            Father Name
                          </span>
                          <span className="font-semibold text-foreground">
                            {selectedStudent.parent.fatherName || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">
                            Mother Name
                          </span>
                          <span className="font-semibold text-foreground">
                            {selectedStudent.parent.motherName || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Action Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      onClick={() => handleDeleteStudent(selectedStudent.id)}
                      disabled={actionLoading}
                      variant="destructive"
                      className="px-4 py-2 text-xs rounded-xl flex items-center gap-1.5"
                    >
                      {actionLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrashAlt />
                      )}
                      <span>Delete Profile</span>
                    </Button>

                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary text-primary-foreground px-4 py-2 text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM VIEW */
                <form onSubmit={handleUpdateStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.firstName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full p-2.5 text-xs rounded-xl border border-input bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.lastName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full p-2.5 text-xs rounded-xl border border-input bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Roll Number
                      </label>
                      <input
                        type="number"
                        required
                        value={editFormData.rollNo}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            rollNo: e.target.value,
                          })
                        }
                        className="w-full p-2.5 text-xs rounded-xl border border-input bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full p-2.5 text-xs rounded-xl border border-input bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>

                  {/* Edit Form Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-primary text-primary-foreground px-4 py-2 text-xs rounded-xl flex items-center gap-1.5"
                    >
                      {actionLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSave />
                      )}
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
