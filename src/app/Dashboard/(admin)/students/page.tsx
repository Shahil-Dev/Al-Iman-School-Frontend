"use client";

import React, { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaUserGraduate,
  FaEdit,
  FaTrashAlt,
  FaFilter,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@base-ui/react";

// মক ডাটা (পরবর্তীতে ব্যাকেন্ড API সাথে সংযুক্ত হবে)
const initialStudents = [
  {
    id: "STU-1001",
    roll: "01",
    name: "Mohammad Abdullah",
    class: "Class 8",
    section: "A",
    guardianPhone: "+880 1812-345678",
    status: "ACTIVE",
  },
  {
    id: "STU-1002",
    roll: "02",
    name: "Fatima Zahra",
    class: "Class 8",
    section: "A",
    guardianPhone: "+880 1711-987654",
    status: "ACTIVE",
  },
  {
    id: "STU-1003",
    roll: "05",
    name: "Yusuf Hassan",
    class: "Class 7",
    section: "B",
    guardianPhone: "+880 1913-223344",
    status: "INACTIVE",
  },
];

export default function StudentManagementPage() {
  const { language } = useLanguage();
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Student
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    class: "Class 8",
    section: "A",
    guardianPhone: "",
  });

  // Search and Filter Logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll.includes(searchTerm) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClass === "ALL" || student.class === selectedClass;

    return matchesSearch && matchesClass;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent = {
      id: `STU-${1000 + students.length + 1}`,
      roll: formData.roll,
      name: formData.name,
      class: formData.class,
      section: formData.section,
      guardianPhone: formData.guardianPhone,
      status: "ACTIVE",
    };

    setStudents([newStudent, ...students]);
    setIsAddModalOpen(false);
    setFormData({ name: "", roll: "", class: "Class 8", section: "A", guardianPhone: "" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.id !== id));
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
              {language === "bn" ? "শিক্ষার্থী ব্যবস্থাপনা" : "Student Management"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {language === "bn"
              ? "স্কুলের সকল শিক্ষার্থীর তথ্য দেখুন, ফিল্টার ও এডিট করুন"
              : "Manage, search, and register students in Al-Iman School"}
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm"
        >
          <FaPlus />
          <span>{language === "bn" ? "নতুন শিক্ষার্থী যোগ করুন" : "Add New Student"}</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <Input
              type="text"
              placeholder={language === "bn" ? "নাম বা রোল দিয়ে খুঁজুন..." : "Search by name or roll..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FaFilter className="text-muted-foreground text-xs shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-40"
            >
              <option value="ALL">{language === "bn" ? "সকল ক্লাস" : "All Classes"}</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
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
                <th className="p-4">ID / Roll</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class & Section</th>
                <th className="p-4">Guardian Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground font-medium">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-foreground">{student.roll}</span>
                      <span className="block text-[10px] text-muted-foreground">{student.id}</span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">{student.name}</td>
                    <td className="p-4">
                      {student.class} ({student.section})
                    </td>
                    <td className="p-4 text-muted-foreground">{student.guardianPhone}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          student.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        title="Edit Student"
                        className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        title="Delete Student"
                        className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors"
                      >
                        <FaTrashAlt className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground font-medium">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-card border-border shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Add New Student</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mohammad Ali"
                  className="w-full p-2.5 text-xs rounded-xl border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Roll No
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.roll}
                    onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                    placeholder="e.g. 05"
                    className="w-full p-2.5 text-xs rounded-xl border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Class
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-input bg-background text-foreground"
                  >
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Guardian Phone Number
                </label>
                <Input
                  type="text"
                  required
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  placeholder="e.g. +880 1812-000000"
                  className="w-full p-2.5 text-xs rounded-xl border border-input bg-background"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 py-2 text-xs rounded-xl"
                >
                  Save Student
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}