"use client";

import React, { useEffect, useState } from "react";
import {
  FaChalkboardTeacher,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaUser,
  FaEdit,
  FaTrashAlt,
  FaSave,
  FaCamera,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axiosInstance from "@/src/lib/axiosInstance";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

type Teacher = {
  id: string;
  name: string;
  designation: string;
  department?: string | null;
  qualification?: string | null;
  phone: string;
  nidOrPassport?: string | null;
  gender: string;
  bloodGroup?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  classTeacherOf?: { id: string; name: string } | null;
  user: {
    id: string;
    email: string;
    isApproved: boolean;
  };
};

type ClassOption = {
  id: string;
  name: string;
  hasClassTeacher?: boolean;
};

type EditForm = {
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  qualification: string;
  gender: string;
  bloodGroup: string;
  nidOrPassport: string;
  classTeacherOfId: string;
};

const initialOf = (name?: string) =>
  (Array.from((name || "").trim())[0] || "T").toUpperCase();

// Shrinks a selected photo before it is sent as Base64
const compressImage = (file: File, max = 400): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > max) {
            height = Math.round((height * max) / width);
            width = max;
          }
        } else if (height > max) {
          width = Math.round((width * max) / height);
          height = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });

const inputClass =
  "w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function AllTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/teachers/admin/all");
      setTeachers(res.data?.data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "শিক্ষকদের তালিকা লোড করা যায়নি।",
      );
    } finally {
      setLoading(false);
    }
  };

  // Class list flags the classes that already have a class teacher
  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get("/academic/public/classes");
      setClasses(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load classes", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setNewPhoto(null);
    setPhotoName("");
    setForm({
      name: teacher.name || "",
      email: teacher.user?.email || "",
      phone: teacher.phone || "",
      designation: teacher.designation || "",
      department: teacher.department || "",
      qualification: teacher.qualification || "",
      gender: teacher.gender || "MALE",
      bloodGroup: teacher.bloodGroup || "",
      nidOrPassport: teacher.nidOrPassport || "",
      classTeacherOfId: teacher.classTeacherOf?.id || "",
    });
  };

  const closeEdit = () => {
    if (isUpdating) return;
    setEditingTeacher(null);
    setForm(null);
    setNewPhoto(null);
    setPhotoName("");
  };

  const setField = (field: keyof EditForm, value: string) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("অনুগ্রহ করে একটি ছবি (JPG/PNG) নির্বাচন করুন।");
      return;
    }

    try {
      setNewPhoto(await compressImage(file));
      setPhotoName(file.name);
    } catch {
      toast.error("ছবিটি প্রসেস করা যায়নি, অন্য ছবি চেষ্টা করুন।");
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !form) return;

    try {
      setIsUpdating(true);

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        designation: form.designation.trim(),
        department: form.department.trim(),
        qualification: form.qualification.trim(),
        gender: form.gender,
        bloodGroup: form.bloodGroup.trim(),
        nidOrPassport: form.nidOrPassport.trim(),
        // null removes the class teacher assignment
        classTeacherOfId: form.classTeacherOfId || null,
      };
      if (newPhoto) payload.photoUrl = newPhoto;

      const res = await axiosInstance.patch(
        `/teachers/${editingTeacher.id}`,
        payload,
      );
      const updated = res.data?.data;

      if (updated) {
        setTeachers((prev) =>
          prev.map((item) =>
            item.id === editingTeacher.id ? { ...item, ...updated } : item,
          ),
        );
      } else {
        await fetchTeachers();
      }

      await fetchClasses();
      toast.success("শিক্ষকের তথ্য সফলভাবে আপডেট হয়েছে।");
      setEditingTeacher(null);
      setForm(null);
      setNewPhoto(null);
      setPhotoName("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "শিক্ষকের তথ্য আপডেট করা সম্ভব হয়নি।",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDeleteTeacher = async () => {
    if (!deletingTeacher) return;

    try {
      setDeletingId(deletingTeacher.id);
      await axiosInstance.delete(`/teachers/${deletingTeacher.id}`);
      setTeachers((prev) =>
        prev.filter((item) => item.id !== deletingTeacher.id),
      );
      await fetchClasses();
      toast.success("শিক্ষকের প্রোফাইল মুছে ফেলা হয়েছে।");
      setDeletingTeacher(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "শিক্ষকের প্রোফাইল ডিলিট করা সম্ভব হয়নি।",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      teacher.name?.toLowerCase().includes(term) ||
      teacher.designation?.toLowerCase().includes(term) ||
      teacher.classTeacherOf?.name?.toLowerCase().includes(term) ||
      teacher.phone?.includes(term) ||
      teacher.user?.email?.toLowerCase().includes(term)
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
            প্রতিটি শিক্ষকের নাম, পদবী ও ক্লাস টিচারের দায়িত্ব দেখুন। সব তথ্য
            এডিট করা যাবে।
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold self-start md:self-auto">
          মোট শিক্ষক: {teachers.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
        <input
          type="text"
          placeholder="নাম, পদবী, ক্লাস, ফোন বা ইমেইল দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <FaSpinner className="animate-spin text-2xl text-[#c9a961]" />
          <p className="text-xs text-muted-foreground">
            শিক্ষকদের তথ্য লোড হচ্ছে...
          </p>
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/10 p-6 text-center text-xs text-destructive rounded-2xl">
          {error}
        </Card>
      ) : filteredTeachers.length === 0 ? (
        <Card className="border-border bg-card/50 shadow-sm rounded-2xl p-12 text-center">
          <FaUser className="mx-auto text-4xl text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">
            কোনো শিক্ষক পাওয়া যায়নি
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {searchTerm
              ? "আপনার অনুসন্ধান অনুযায়ী কোনো তথ্য মেলেনি।"
              : "এখনো কোনো শিক্ষক অনুমোদিত হয়নি।"}
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
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center text-[#c9a961] font-bold text-lg select-none">
                      {teacher.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={teacher.photoUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initialOf(teacher.name)
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {teacher.name}
                      </h3>
                      <p className="text-xs text-[#c9a961] font-semibold truncate">
                        {teacher.designation}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                      ক্লাস টিচার
                    </span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <FaChalkboardTeacher className="text-[#c9a961] shrink-0" />
                      {teacher.classTeacherOf?.name || "নেই"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => openEdit(teacher)}
                      className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-9 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                      title="শিক্ষকের তথ্য এডিট করুন"
                    >
                      <FaEdit className="text-xs" />
                      <span>এডিট</span>
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

      {/* Edit Teacher Modal */}
      <AnimatePresence>
        {editingTeacher && form && (
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
                  <span>শিক্ষকের তথ্য সম্পাদনা</span>
                </div>
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={isUpdating}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <form
                onSubmit={handleUpdateTeacher}
                className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
              >
                {/* Photo */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center text-[#c9a961] font-bold text-2xl select-none">
                    {newPhoto || editingTeacher.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(newPhoto || editingTeacher.photoUrl) as string}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initialOf(form.name)
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/40 text-xs text-foreground cursor-pointer hover:border-[#c9a961] transition-all">
                    <FaCamera className="text-[#c9a961]" />
                    <span>{photoName || "ছবি পরিবর্তন করুন"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      শিক্ষকের নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      পদবী (Designation) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.designation}
                      onChange={(e) => setField("designation", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    ক্লাস টিচার (কোন ক্লাসের)
                  </label>
                  <select
                    value={form.classTeacherOfId}
                    onChange={(e) =>
                      setField("classTeacherOfId", e.target.value)
                    }
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">নেই (সাধারণ শিক্ষক)</option>
                    {classes.map((cls) => {
                      const takenByOther =
                        Boolean(cls.hasClassTeacher) &&
                        cls.id !== editingTeacher.classTeacherOf?.id;
                      return (
                        <option
                          key={cls.id}
                          value={cls.id}
                          disabled={takenByOther}
                        >
                          {cls.name}
                          {takenByOther
                            ? " (ইতিমধ্যে ক্লাস টিচার নির্ধারিত)"
                            : ""}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    একটি ক্লাসের একজনই ক্লাস টিচার হতে পারেন।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      ডিপার্টমেন্ট
                    </label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setField("department", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      যোগ্যতা (Qualification)
                    </label>
                    <input
                      type="text"
                      value={form.qualification}
                      onChange={(e) =>
                        setField("qualification", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      ফোন নম্বর *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      ইমেইল (লগইন) *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      জেন্ডার
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setField("gender", e.target.value)}
                      className={inputClass}
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      রক্তের গ্রুপ
                    </label>
                    <input
                      type="text"
                      value={form.bloodGroup}
                      onChange={(e) => setField("bloodGroup", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    NID / পাসপোর্ট নম্বর
                  </label>
                  <input
                    type="text"
                    value={form.nidOrPassport}
                    onChange={(e) => setField("nidOrPassport", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    onClick={closeEdit}
                    disabled={isUpdating}
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

      {/* Delete Confirmation Modal */}
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
                    আপনি কি নিশ্চিত যে শিক্ষক{" "}
                    <span className="font-bold text-foreground">
                      &quot;{deletingTeacher.name}&quot;
                    </span>{" "}
                    ({deletingTeacher.designation}) এর প্রোফাইল এবং লগইন
                    অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান?
                  </p>
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
