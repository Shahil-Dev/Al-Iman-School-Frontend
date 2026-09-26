"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function StudentMarksheetPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [marksheetData, setMarksheetData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${API_BASE_URL}/exams`, {
          headers: { Authorization: `${token}` },
        });
        setExams(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch exams", err);
      }
    };
    fetchExams();
  }, []);

  const handleFetchMarksheet = async () => {
    if (!selectedExam) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const user = JSON.parse(localStorage.getItem("user") || "{}"); // Logged in student ID

      const res = await axios.get(
        `${API_BASE_URL}/marks/marksheet/${selectedExam}/${user.studentProfileId || user.id}`,
        { headers: { Authorization: `${token}` } },
      );

      setMarksheetData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch marksheet", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Academic Marksheet & Result
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex gap-4 items-center">
        <select
          className="border p-2 rounded-md w-64"
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="">-- Select Exam Term --</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleFetchMarksheet}
          disabled={loading || !selectedExam}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Fetching..." : "View Marksheet"}
        </button>
      </div>

      {marksheetData && (
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="text-center border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              AL-IMAN SCHOOL & COLLEGE
            </h2>
            <p className="text-sm text-gray-500">
              Academic Transcript / Marksheet
            </p>
          </div>

          {/* Student Info Header */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md text-sm">
            <div>
              <p>
                <strong>Student Name:</strong>{" "}
                {marksheetData.marks[0]?.student?.firstName}{" "}
                {marksheetData.marks[0]?.student?.lastName}
              </p>
              <p>
                <strong>Roll No:</strong>{" "}
                {marksheetData.marks[0]?.student?.rollNo}
              </p>
            </div>
            <div>
              <p>
                <strong>Class:</strong>{" "}
                {marksheetData.marks[0]?.student?.class?.name}
              </p>
              <p>
                <strong>Section:</strong>{" "}
                {marksheetData.marks[0]?.student?.section?.name}
              </p>
            </div>
          </div>

          {/* Marks Table */}
          <table className="w-full border-collapse border border-gray-300 text-left mb-6">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border p-3">Subject</th>
                <th className="border p-3 text-center">Full Marks</th>
                <th className="border p-3 text-center">MT Marks</th>
                <th className="border p-3 text-center">Terminal Marks</th>
                <th className="border p-3 text-center">Total Obtained</th>
                <th className="border p-3 text-center">Grade</th>
                <th className="border p-3 text-center">Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {marksheetData.marks.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-3 font-medium">
                    {item.subject?.name}
                  </td>
                  <td className="border p-3 text-center">{item.fullMarks}</td>
                  <td className="border p-3 text-center">
                    {item.mtMarks || 0}
                  </td>
                  <td className="border p-3 text-center">{item.terminal}</td>
                  <td className="border p-3 text-center font-bold">
                    {item.totalMarks}
                  </td>
                  <td className="border p-3 text-center font-bold text-blue-600">
                    {item.grade}
                  </td>
                  <td className="border p-3 text-center">
                    {item.gradePoint.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* GPA Summary */}
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm text-gray-600">
                Total Obtained Marks:{" "}
                <span className="font-bold text-gray-900">
                  {marksheetData.totalObtainedMarks}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Result Status:
                <span
                  className={`font-bold ml-1 ${marksheetData.resultStatus === "Passed" ? "text-green-600" : "text-red-600"}`}
                >
                  {marksheetData.resultStatus}
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">GPA</span>
              <h3 className="text-3xl font-extrabold text-blue-700">
                {marksheetData.gpa.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
