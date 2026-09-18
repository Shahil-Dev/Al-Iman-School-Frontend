"use client";

import { AcademicService,  ResourceType} from "@/src/Services/academicService";
import React, { useState, useEffect } from "react";

export default function AcademicManagementPage() {
  const [activeTab, setActiveTab] = useState<ResourceType>("classes");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Relational data list for dropdowns
  const [yearsList, setYearsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);

  // Individual Form States matching Zod Schema
  const [yearInput, setYearInput] = useState<string>("");
  const [isCurrentYear, setIsCurrentYear] = useState<boolean>(false);

  const [classNameInput, setClassNameInput] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");

  const [sectionNameInput, setSectionNameInput] = useState<string>("");
  const [selectedClassIdForSection, setSelectedClassIdForSection] = useState<string>("");

  const [subjectNameInput, setSubjectNameInput] = useState<string>("");
  const [subjectCodeInput, setSubjectCodeInput] = useState<string>("");
  const [fullMarksInput, setFullMarksInput] = useState<number>(100);
  const [selectedClassIdForSubject, setSelectedClassIdForSubject] = useState<string>("");

  // Fetch Tab Items
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await AcademicService.getAll(activeTab);
      setItems(res.data || res || []);
    } catch (err: any) {
      console.error(`Failed to fetch ${activeTab}:`, err);
      setErrorMsg(err?.response?.data?.message || `Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fetch Academic Years and Classes for dropdown selection
  const fetchDropdownData = async () => {
    try {
      const yearsRes = await AcademicService.getAll("years");
      setYearsList(yearsRes.data || yearsRes || []);

      const classesRes = await AcademicService.getAll("classes");
      setClassesList(classesRes.data || classesRes || []);
    } catch (err) {
      console.error("Error fetching options for dropdowns:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, [activeTab]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    let payload: any = {};

    // Construct Payload based on active tab and Zod Schema requirements
    if (activeTab === "years") {
      if (!yearInput) return setErrorMsg("Please provide a valid year.");
      payload = {
        year: Number(yearInput),
        isCurrent: isCurrentYear,
      };
    } else if (activeTab === "classes") {
      if (!classNameInput || !selectedYearId) {
        return setErrorMsg("Class name and Academic Year are required.");
      }
      payload = {
        name: classNameInput,
        academicYearId: selectedYearId,
      };
    } else if (activeTab === "sections") {
      if (!sectionNameInput || !selectedClassIdForSection) {
        return setErrorMsg("Section name and Class selection are required.");
      }
      payload = {
        name: sectionNameInput,
        classId: selectedClassIdForSection,
      };
    } else if (activeTab === "subjects") {
      if (!subjectNameInput || !subjectCodeInput || !selectedClassIdForSubject) {
        return setErrorMsg("Subject name, code, and class selection are required.");
      }
      payload = {
        name: subjectNameInput,
        code: subjectCodeInput,
        fullMarks: Number(fullMarksInput),
        classId: selectedClassIdForSubject,
      };
    }

    try {
      await AcademicService.create(activeTab, payload);
      
      // Reset Form Inputs
      setYearInput("");
      setClassNameInput("");
      setSectionNameInput("");
      setSubjectNameInput("");
      setSubjectCodeInput("");

      fetchData(); // Reload table data
      fetchDropdownData(); // Refresh dropdown lists
    } catch (err: any) {
      console.error(`Failed to create ${activeTab}:`, err);
      setErrorMsg(err?.response?.data?.message || "Failed to create entry");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Academic Management</h1>

      {/* Dynamic Tab Switcher */}
      <div className="flex gap-3 mb-6 border-b pb-3">
        {(["classes", "sections", "subjects", "years"] as ResourceType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error Alert Display */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Dynamic Form based on Active Tab */}
      <form onSubmit={handleSubmit} className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-900 mb-8 grid gap-4">
        <h2 className="text-xl font-semibold capitalize">Add New {activeTab.slice(0, -1)}</h2>

        {/* 1. ACADEMIC YEAR FORM */}
        {activeTab === "years" && (
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="number"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              placeholder="e.g. 2026"
              className="border p-3 rounded-lg flex-1 dark:bg-gray-800 dark:text-white"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrentYear}
                onChange={(e) => setIsCurrentYear(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Is Current Year?</span>
            </label>
          </div>
        )}

        {/* 2. ACADEMIC CLASS FORM */}
        {activeTab === "classes" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
              placeholder="Class Name (e.g. Class 10)"
              className="border p-3 rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="border p-3 rounded-lg dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Academic Year</option>
              {yearsList.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. ACADEMIC SECTION FORM */}
        {activeTab === "sections" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={sectionNameInput}
              onChange={(e) => setSectionNameInput(e.target.value)}
              placeholder="Section Name (e.g. Section A)"
              className="border p-3 rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <select
              value={selectedClassIdForSection}
              onChange={(e) => setSelectedClassIdForSection(e.target.value)}
              className="border p-3 rounded-lg dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Class</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4. ACADEMIC SUBJECT FORM */}
        {activeTab === "subjects" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={subjectNameInput}
              onChange={(e) => setSubjectNameInput(e.target.value)}
              placeholder="Subject Name (e.g. Mathematics)"
              className="border p-3 rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              value={subjectCodeInput}
              onChange={(e) => setSubjectCodeInput(e.target.value)}
              placeholder="Subject Code (e.g. MATH101)"
              className="border p-3 rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <input
              type="number"
              value={fullMarksInput}
              onChange={(e) => setFullMarksInput(Number(e.target.value))}
              placeholder="Full Marks (default 100)"
              className="border p-3 rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <select
              value={selectedClassIdForSubject}
              onChange={(e) => setSelectedClassIdForSubject(e.target.value)}
              className="border p-3 rounded-lg dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Class</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors w-fit"
        >
          Create {activeTab.slice(0, -1)}
        </button>
      </form>

      {/* GET Items Display */}
      {loading ? (
        <p className="text-gray-500">Loading {activeTab} data...</p>
      ) : (
        <div className="grid gap-3">
          {items.length === 0 ? (
            <p className="text-gray-400">No {activeTab} found.</p>
          ) : (
            items.map((item: any) => (
              <div
                key={item.id || item._id}
                className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-white dark:bg-gray-800"
              >
                <div>
                  <span className="font-medium text-lg block">
                    {item.name || item.title || item.year}
                  </span>
                  {item.code && <span className="text-sm text-gray-500">Code: {item.code}</span>}
                </div>
                <span className="text-xs text-gray-400">ID: {item.id || item._id}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}