"use client";

import React, { useEffect, useState } from "react";
import {
  FaChalkboardTeacher,
  FaSpinner,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBook,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaBuilding,
  FaIdCard,
  FaVenusMars,
  FaTint,
  FaUser,
  FaEdit,
  FaTrashAlt,
  FaSave,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/src/lib/axiosInstance";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

type Teacher = {
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

export default function AllTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all teachers from backend
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/teachers");
      setTeachers(res.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load teachers list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Execute Delete Action
  const confirmDeleteTeacher = async () => {
    if (!deletingTeacher) return;

    try {
      setDeletingId(deletingTeacher.id);
      await axiosInstance.delete(`/teachers/${deletingTeacher.id}`);
      setTeachers((prev) => prev.filter((item) => item.id !== deletingTeacher.id));
      if (selectedTeacher?.id === deletingTeacher.id) setSelectedTeacher(null);
      setDeletingTeacher(null);
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "শিক্ষকের প্রোফাইল ডিলিট করা সম্ভব হয়নি।"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Update Teacher Submit
  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    try {
      setIsUpdating(true);
      const payload = {
        name: editingTeacher.name,
        designation: editingTeacher.designation,
        department: editingTeacher.department,
        qualification: editingTeacher.qualification,
        phone: editingTeacher.phone,
        gender: editingTeacher.gender,
        bloodGroup: editingTeacher.bloodGroup,
        nidOrPassport: editingTeacher.nidOrPassport,
      };

      const res = await axiosInstance.patch(
        `/teachers/${editingTeacher.id}`,
        payload
      );

      const updatedData = res.data?.data || payload;

      setTeachers((prev) =>
        prev.map((item) =>
          item.id === editingTeacher.id ? { ...item, ...updatedData } : item
        )
      );

      setEditingTeacher(null);
      if (selectedTeacher?.id === editingTeacher.id) {
        setSelectedTeacher({ ...selectedTeacher, ...updatedData });
      }
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "শিক্ষকের তথ্য আপডেট করা সম্ভব হয়নি।"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter teachers by search query
  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(term) ||
      teacher.user?.email?.toLowerCase().includes(term) ||
      teacher.phone?.includes(term) ||
      (teacher.department &&
        teacher.department.toLowerCase().includes(term)) ||
      teacher.designation?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-foreground">
            <FaChalkboardTeacher className="text-[#c9a961]" />
            <span>শিক্ষক তালিকা (All Teachers)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            প্রতিষ্ঠানের সকল শিক্ষকমণ্ডলীর তালিকা, প্রোফাইল ও বিস্তারিত তথ্য একনজরে দেখুন।
          </p>
        </div>

        {/* Total Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            মোট শিক্ষক: {teachers.length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
        <input
          type="text"
          placeholder="নাম, ইমেইল, মোবাইল বা ডিপার্টমেন্ট দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <FaSpinner className="animate-spin text-2xl text-[#c9a961]" />
          <p className="text-xs text-muted-foreground">শিক্ষকদের তথ্য লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/10 p-6 text-center text-xs text-destructive rounded-2xl">
          {error}
        </Card>
      ) : filteredTeachers.length === 0 ? (
        <Card className="border-border bg-card/50 shadow-sm rounded-2xl p-12 text-center">
          <FaUser className="mx-auto text-4xl text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">কোনো শিক্ষক পাওয়া যায়নি</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {searchTerm ? "আপনার অনুসন্ধান অনুযায়ী কোনো তথ্য মেলেনি।" : "এখনো কোনো শিক্ষক নিবন্ধিত হয়নি।"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border shadow-md hover:shadow-lg transition-all rounded-2xl bg-card overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  {/* Avatar & Status Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center text-[#c9a961] font-bold text-lg">
                        {teacher.photoUrl ? (
                          <img
                            src={teacher.photoUrl}
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          teacher.name?.charAt(0) || "T"
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-foreground truncate">{teacher.name}</h3>
                        <p className="text-xs text-[#c9a961] font-semibold">{teacher.designation}</p>
                      </div>
                    </div>

                    {/* Approval Badge */}
                    {teacher.user?.isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0">
                        <FaCheckCircle className="text-[9px]" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold shrink-0">
                        <FaClock className="text-[9px]" /> Pending
                      </span>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    {teacher.department && (
                      <div className="flex items-center gap-2 truncate">
                        <FaBook className="text-[#c9a961] shrink-0" />
                        <span className="truncate">{teacher.department}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 truncate">
                      <FaEnvelope className="text-[#c9a961] shrink-0" />
                      <span className="truncate">{teacher.user?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-[#c9a961] shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="flex-1 bg-card hover:bg-muted text-foreground border border-border h-9 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <FaEye className="text-xs text-[#c9a961]" />
                      <span>ভিউ</span>
                    </Button>
                    <Button
                      onClick={() => setEditingTeacher(teacher)}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-9 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1 px-3"
                      title="শিক্ষক তথ্য এডিট করুন"
                    >
                      <FaEdit className="text-xs" />
                    </Button>
                    <Button
                      onClick={() => setDeletingTeacher(teacher)}
                      className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 h-9 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1 px-3"
                      title="শিক্ষক অ্যাকাউন্ট মুছে ফেলুন"
                    >
                      <FaTrashAlt className="text-xs" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Teacher Full Profile Modal */}
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
                  <span>শিক্ষকের পূর্ণাঙ্গ প্রোফাইল</span>
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
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="w-16 h-16 rounded-xl bg-card border border-border overflow-hidden flex items-center justify-center text-[#c9a961] font-bold text-2xl shrink-0">
                    {selectedTeacher.photoUrl ? (
                      <img
                        src={selectedTeacher.photoUrl}
                        alt={selectedTeacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedTeacher.name?.charAt(0) || "T"
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{selectedTeacher.name}</h3>
                    <p className="text-xs text-[#c9a961] font-bold mt-0.5">{selectedTeacher.designation}</p>
                    <div className="mt-1.5">
                      {selectedTeacher.user?.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          <FaCheckCircle /> Approved Account
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          <FaClock /> Approval Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9a961]">
                    পেশাগত যোগ্যতা ও বিভাগ
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-card p-3 rounded-xl border border-border">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">ডিপার্টমেন্ট</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaBuilding className="text-[#c9a961]" /> {selectedTeacher.department || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">যোগ্যতা (Qualification)</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaGraduationCap className="text-[#c9a961]" /> {selectedTeacher.qualification || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9a961]">
                    ব্যক্তিগত ও যোগাযোগের তথ্য
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-card p-3 rounded-xl border border-border">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">ইমেইল</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5 truncate">
                        <FaEnvelope className="text-[#c9a961] shrink-0" /> {selectedTeacher.user?.email || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">ফোন নম্বর</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaPhone className="text-[#c9a961]" /> {selectedTeacher.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">জেন্ডার</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaVenusMars className="text-[#c9a961]" /> {selectedTeacher.gender}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">রক্তের গ্রুপ</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaTint className="text-[#c9a961]" /> {selectedTeacher.bloodGroup || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">NID / পাসপোর্ট নম্বর</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <FaIdCard className="text-[#c9a961]" /> {selectedTeacher.nidOrPassport || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end">
                <Button
                  onClick={() => setSelectedTeacher(null)}
                  className="bg-card hover:bg-muted text-foreground border border-border text-xs px-5 h-9 rounded-xl font-semibold"
                >
                  বন্ধ করুন (Close)
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Teacher Modal */}
      <AnimatePresence>
        {editingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden relative"
            >
              <div className="p-5 bg-muted/40 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-bold text-base">
                  <FaEdit className="text-[#c9a961]" />
                  <span>শিক্ষকের তথ্য সম্পাদনা (Edit Teacher)</span>
                </div>
                <button
                  onClick={() => setEditingTeacher(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleUpdateTeacher} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">শিক্ষকের নাম</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">পদবী (Designation)</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.designation}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">ডিপার্টমেন্ট</label>
                    <input
                      type="text"
                      value={editingTeacher.department || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">ফোন নম্বর</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.phone}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">যোগ্যতা (Qualification)</label>
                    <input
                      type="text"
                      value={editingTeacher.qualification || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, qualification: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">জেন্ডার</label>
                    <select
                      value={editingTeacher.gender}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">রক্তের গ্রুপ</label>
                    <input
                      type="text"
                      value={editingTeacher.bloodGroup || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">NID / পাসপোর্ট নম্বর</label>
                  <input
                    type="text"
                    value={editingTeacher.nidOrPassport || ""}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, nidOrPassport: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => setEditingTeacher(null)}
                    className="bg-card hover:bg-muted text-foreground border border-border text-xs px-4 h-9 rounded-xl font-semibold"
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-primary text-primary-foreground hover:opacity-90 text-xs px-5 h-9 rounded-xl font-semibold flex items-center gap-1.5"
                  >
                    {isUpdating ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>আপডেট হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="text-xs" />
                        <span>সংরক্ষণ করুন</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔴 Custom Delete Confirmation Alert Modal */}
      <AnimatePresence>
        {deletingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-card border border-destructive/30 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden relative"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive border border-destructive/20 mx-auto flex items-center justify-center text-2xl">
                  <FaExclamationTriangle />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground">
                    শিক্ষক প্রোফাইল মুছে ফেলতে চান?
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    আপনি কি নিশ্চিত যে শিক্ষক <span className="font-bold text-foreground">"{deletingTeacher.name}"</span> এর প্রোফাইল এবং সম্পর্কিত ব্যবহারকারী অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান?
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl border border-border text-left text-xs space-y-1">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">ইমেইল:</span> {deletingTeacher.user?.email}</p>
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">পদবী:</span> {deletingTeacher.designation}</p>
                </div>

                <p className="text-[11px] text-destructive font-medium">
                  ⚠️ এই প্রক্রিয়াটি আর কখনো ফিরিয়ে আনা সম্ভব হবে না।
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    disabled={!!deletingId}
                    onClick={() => setDeletingTeacher(null)}
                    className="flex-1 bg-card hover:bg-muted text-foreground border border-border h-10 rounded-xl text-xs font-semibold"
                  >
                    বাতিল করুন
                  </Button>
                  <Button
                    type="button"
                    disabled={!!deletingId}
                    onClick={confirmDeleteTeacher}
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
                  >
                    {deletingId ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>মুছে ফেলা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <FaTrashAlt className="text-xs" />
                        <span>হ্যাঁ, মুছে ফেলুন</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}