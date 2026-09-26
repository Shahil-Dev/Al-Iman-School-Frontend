"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function MarkEntryPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  // Selected filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<{ [studentId: string]: { mtMarks: number; terminal: number } }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Safely extract auth token from LocalStorage or Cookies
  const getAuthHeaders = () => {
    let token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token");

    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )accessToken=([^;]+)"));
      if (match) token = match[2];
    }

    if (!token) {
      console.warn("⚠️ No Access Token found! Please log in as SUPER_ADMIN or TEACHER.");
      return { headers: {} };
    }

    const cleanToken = token.replace(/^Bearer\s+/i, "");

    return {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    };
  };

  // 1. Load Classes and Exams
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const config = getAuthHeaders();

        const [classRes, examRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/academic/classes`, config),
          axios.get(`${API_BASE_URL}/exams`, config),
        ]);

        setClasses(classRes.data.data || []);
        setExams(examRes.data.data || []);
      } catch (err: any) {
        console.error("Error fetching initial dropdown data:", err);
        if (err.response?.status === 401) {
          toast.error("Session expired or Unauthorized! Make sure you are logged in as SUPER_ADMIN or TEACHER.");
        }
      }
    };
    fetchInitialData();
  }, []);

  // 2. Load Sections and Subjects when Class changes
  useEffect(() => {
    if (!selectedClass) return;
    const fetchClassDetails = async () => {
      try {
        const config = getAuthHeaders();

        const [secRes, subRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/academic/sections?classId=${selectedClass}`, config),
          axios.get(`${API_BASE_URL}/subjects?classId=${selectedClass}`, config),
        ]);

        setSections(secRes.data.data || []);
        setSubjects(subRes.data.data || []);
      } catch (err) {
        console.error("Error fetching sections/subjects:", err);
      }
    };
    fetchClassDetails();
  }, [selectedClass]);

  // 3. Load Students List
  const handleLoadStudents = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject || !selectedExam) {
      toast.error("Please select Class, Section, Subject, and Exam Term!");
      return;
    }

    setLoading(true);
    try {
      const config = getAuthHeaders();

      const studentRes = await axios.get(
        `${API_BASE_URL}/students?classId=${selectedClass}&sectionId=${selectedSection}`,
        config
      );

      const fetchedStudents = studentRes.data.data || [];
      setStudents(fetchedStudents);

      const initialMarks: any = {};
      fetchedStudents.forEach((st: any) => {
        initialMarks[st.id] = { mtMarks: 0, terminal: 0 };
      });
      setMarksData(initialMarks);
    } catch (err) {
      toast.error("Failed to load students list!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (studentId: string, field: "mtMarks" | "terminal", value: string) => {
    const numVal = Math.max(0, Number(value) || 0);
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numVal,
      },
    }));
  };

  // 4. Save All Marks
  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) return;

    setSubmitting(true);
    try {
      const config = getAuthHeaders();

      const payload = {
        examId: selectedExam,
        subjectId: selectedSubject,
        marks: students.map((st) => ({
          studentId: st.id,
          mtMarks: marksData[st.id]?.mtMarks || 0,
          terminal: marksData[st.id]?.terminal || 0,
        })),
      };

      await axios.post(`${API_BASE_URL}/marks/save-bulk-marks`, payload, config);
      toast.success("Marks saved and GPA calculated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save marks!");
    } finally {
      setSubmitting(false);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Exam & Result Entry Module</h1>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Select Class</label>
          <select
            className="w-full border p-2 rounded-md text-black"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Choose Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Select Section</label>
          <select
            className="w-full border p-2 rounded-md text-black"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">-- Choose Section --</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Select Subject</label>
          <select
            className="w-full border p-2 rounded-md text-black"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- Choose Subject --</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} (Full Marks: {sub.fullMarks})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Select Exam Term</label>
          <select
            className="w-full border p-2 rounded-md text-black"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            <option value="">-- Choose Exam --</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleLoadStudents}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition mb-6 font-medium"
      >
        {loading ? "Loading Students..." : "Load Student List"}
      </button>

      {/* Marks Table */}
      {students.length > 0 && (
        <form onSubmit={handleSubmitMarks} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Entering Marks for: <span className="text-blue-600">{currentSubject?.name}</span> (Full Marks: {currentSubject?.fullMarks || 100})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border p-3">Roll</th>
                  <th className="border p-3">Student Name</th>
                  <th className="border p-3">Student ID</th>
                  {currentSubject?.hasMT !== false && <th className="border p-3">MT Marks</th>}
                  <th className="border p-3">Terminal / Exam Marks</th>
                  <th className="border p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => {
                  const mt = marksData[st.id]?.mtMarks || 0;
                  const term = marksData[st.id]?.terminal || 0;
                  const total = mt + term;

                  return (
                    <tr key={st.id} className="hover:bg-gray-50">
                      <td className="border p-3 font-semibold">{st.rollNo}</td>
                      <td className="border p-3">{st.firstName} {st.lastName}</td>
                      <td className="border p-3 text-sm text-gray-500">{st.studentIdNo}</td>
                      {currentSubject?.hasMT !== false && (
                        <td className="border p-3">
                          <input
                            type="number"
                            min="0"
                            className="border p-1 rounded w-24 text-black"
                            value={marksData[st.id]?.mtMarks || ""}
                            onChange={(e) => handleInputChange(st.id, "mtMarks", e.target.value)}
                          />
                        </td>
                      )}
                      <td className="border p-3">
                        <input
                          type="number"
                          min="0"
                          required
                          className="border p-1 rounded w-28 text-black"
                          value={marksData[st.id]?.terminal || ""}
                          onChange={(e) => handleInputChange(st.id, "terminal", e.target.value)}
                        />
                      </td>
                      <td className="border p-3 font-bold text-blue-600">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-right">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition text-lg font-medium"
            >
              {submitting ? "Saving Marks..." : "Save All Marks & Calculate GPA"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}