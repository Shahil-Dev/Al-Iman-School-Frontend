"use client";

import React, { useState, useEffect } from "react";
import {
  FaGraduationCap,
  FaPlus,
  FaCalendarAlt,
  FaLayerGroup,
  FaSpinner,
  FaClock,
  FaBook,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { academicService } from "@/src/Services/academicService";
import axiosInstance from "@/src/lib/axiosInstance";
import { toast } from "sonner";

export default function AcademicManagementPage() {
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [yearForm, setYearForm] = useState({ year: new Date().getFullYear() });
  const [classForm, setClassForm] = useState({ name: "", academicYearId: "" });
  const [sectionForm, setSectionForm] = useState({ name: "", classId: "" });

  // Routine Form State
  const [routineForm, setRoutineForm] = useState({
    day: "SUNDAY",
    startTime: "09:00 AM",
    endTime: "09:45 AM",
    classId: "",
    sectionId: "",
    subjectId: "",
    roomNo: "101",
  });

  const [submittingYear, setSubmittingYear] = useState(false);
  const [submittingClass, setSubmittingClass] = useState(false);
  const [submittingSection, setSubmittingSection] = useState(false);
  const [submittingRoutine, setSubmittingRoutine] = useState(false);

  // Load All Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [yearRes, classRes, subjectRes] = await Promise.all([
        academicService.getAllAcademicYears().catch(() => ({ data: [] })),
        academicService.getAllClasses().catch(() => ({ data: [] })),
        axiosInstance.get("/subjects").catch(() => ({ data: { data: [] } })),
      ]);

      const loadedYears = yearRes?.data || yearRes || [];
      const loadedClasses = classRes?.data || classRes || [];
      const loadedSubjects = subjectRes?.data?.data || [];

      setAcademicYears(loadedYears);
      setClasses(loadedClasses);
      setSubjects(loadedSubjects);

      if (loadedYears.length > 0 && !classForm.academicYearId) {
        setClassForm((prev) => ({
          ...prev,
          academicYearId: loadedYears[0].id,
        }));
      }
      if (loadedClasses.length > 0) {
        if (!sectionForm.classId) {
          setSectionForm((prev) => ({ ...prev, classId: loadedClasses[0].id }));
        }
        if (!routineForm.classId) {
          setRoutineForm((prev) => ({ ...prev, classId: loadedClasses[0].id }));
        }
      }
    } catch (err) {
      toast.error("Failed to load academic setup data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load Sections when Class selected in Routine Form
  useEffect(() => {
    if (!routineForm.classId) {
      setSections([]);
      return;
    }
    axiosInstance
      .get(`/academic/sections?classId=${routineForm.classId}`)
      .then((res) => {
        const secList = res.data?.data || [];
        setSections(secList);
        if (secList.length > 0) {
          setRoutineForm((prev) => ({ ...prev, sectionId: secList[0].id }));
        }
      })
      .catch(() => setSections([]));
  }, [routineForm.classId]);

  // Submit Academic Year
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingYear(true);
    try {
      await academicService.createAcademicYear({ year: Number(yearForm.year) });
      toast.success("Academic Year created successfully!");
      loadData();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create academic year",
      );
    } finally {
      setSubmittingYear(false);
    }
  };

  // Submit Class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.academicYearId) {
      toast.error("Please select an Academic Year first!");
      return;
    }
    setSubmittingClass(true);
    try {
      await academicService.createClass(classForm);
      toast.success("Academic Class created successfully!");
      setClassForm({ name: "", academicYearId: classForm.academicYearId });
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create class");
    } finally {
      setSubmittingClass(false);
    }
  };

  // Submit Section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.classId) {
      toast.error("Please select a Class first!");
      return;
    }
    setSubmittingSection(true);
    try {
      await academicService.createSection(sectionForm);
      toast.success("Section created successfully!");
      setSectionForm({ name: "", classId: sectionForm.classId });
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create section");
    } finally {
      setSubmittingSection(false);
    }
  };

  // Submit Class Routine Slot
  const handleCreateRoutineSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineForm.classId || !routineForm.sectionId || !routineForm.subjectId) {
      toast.error("Please select Class, Section and Subject!");
      return;
    }
    setSubmittingRoutine(true);
    try {
      await axiosInstance.post("/routines/create-slot", routineForm);
      toast.success("Class Routine Slot created successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create routine slot",
      );
    } finally {
      setSubmittingRoutine(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaGraduationCap />
            <span>Academic Setup & Routine Management</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1">
            Create Academic Years, Classes, Sections, and Class Routines.
          </p>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Academic Year Form */}
        <Card className="border-border shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
              <FaCalendarAlt className="text-emerald-600" />
              <span>1. Create Academic Year</span>
            </h3>

            <form onSubmit={handleCreateYear} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  Year (e.g., 2026) *
                </label>
                <input
                  type="number"
                  required
                  value={yearForm.year}
                  onChange={(e) =>
                    setYearForm({ year: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-mono"
                />
              </div>
              <Button
                type="submit"
                disabled={submittingYear}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                {submittingYear ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPlus />
                )}{" "}
                Add Year
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 2. Class Form */}
        <Card className="border-border shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
              <FaGraduationCap className="text-emerald-600" />
              <span>2. Create Class</span>
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  Select Academic Year *
                </label>
                <select
                  required
                  value={classForm.academicYearId}
                  onChange={(e) =>
                    setClassForm({
                      ...classForm,
                      academicYearId: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
                >
                  <option value="">Select Year</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Class Name (e.g., Class 6) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 1 or Play"
                  value={classForm.name}
                  onChange={(e) =>
                    setClassForm({ ...classForm, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-input bg-background"
                />
              </div>

              <Button
                type="submit"
                disabled={submittingClass}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                {submittingClass ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPlus />
                )}{" "}
                Add Class
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 3. Section Form */}
        <Card className="border-border shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
              <FaLayerGroup className="text-emerald-600" />
              <span>3. Create Section</span>
            </h3>

            <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  Select Class *
                </label>
                <select
                  required
                  value={sectionForm.classId}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, classId: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Section Name (e.g., Section A) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section A"
                  value={sectionForm.name}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-input bg-background"
                />
              </div>

              <Button
                type="submit"
                disabled={submittingSection}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                {submittingSection ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPlus />
                )}{" "}
                Add Section
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 4. Class Routine Creator Form */}
      <Card className="border-border shadow-sm rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
            <FaClock className="text-emerald-600" />
            <span>4. Create Class Routine Slot</span>
          </h3>

          <form onSubmit={handleCreateRoutineSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Day *</label>
              <select
                value={routineForm.day}
                onChange={(e) => setRoutineForm({ ...routineForm, day: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
              >
                <option value="SUNDAY">Sunday</option>
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Class *</label>
              <select
                required
                value={routineForm.classId}
                onChange={(e) => setRoutineForm({ ...routineForm, classId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Section *</label>
              <select
                required
                value={routineForm.sectionId}
                onChange={(e) => setRoutineForm({ ...routineForm, sectionId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
              >
                <option value="">Select Section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Subject *</label>
              <select
                required
                value={routineForm.subjectId}
                onChange={(e) => setRoutineForm({ ...routineForm, subjectId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
              >
                <option value="">Select Subject</option>
                {subjects.map((sb) => (
                  <option key={sb.id} value={sb.id}>
                    {sb.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Start Time (e.g., 09:00 AM)</label>
              <input
                type="text"
                required
                value={routineForm.startTime}
                onChange={(e) => setRoutineForm({ ...routineForm, startTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">End Time (e.g., 09:45 AM)</label>
              <input
                type="text"
                required
                value={routineForm.endTime}
                onChange={(e) => setRoutineForm({ ...routineForm, endTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Room No</label>
              <input
                type="text"
                value={routineForm.roomNo}
                onChange={(e) => setRoutineForm({ ...routineForm, roomNo: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-mono"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={submittingRoutine}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold py-2.5"
              >
                {submittingRoutine ? <FaSpinner className="animate-spin" /> : <FaPlus />} Add Routine Slot
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Class & Section List Preview Table */}
      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b pb-2">
            Existing Classes & Sections List
          </h3>

          {loading ? (
            <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin text-emerald-600" /> Loading
              academic setup...
            </div>
          ) : classes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center p-4">
              No classes created yet. Please add Academic Year and Class above.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-xl bg-muted/40 border border-border space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-emerald-800">
                      {cls.name}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {cls.academicYear?.year || "N/A"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <span className="block font-semibold">Sections:</span>
                    <div className="flex flex-wrap gap-1">
                      {cls.sections && cls.sections.length > 0 ? (
                        cls.sections.map((sec: any) => (
                          <span
                            key={sec.id}
                            className="bg-background border px-2 py-0.5 rounded text-[11px]"
                          >
                            {sec.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] italic">
                          No sections created
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}