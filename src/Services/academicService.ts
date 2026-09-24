import axiosInstance from "@/src/lib/axiosInstance";

// --- Types ---
export interface ICreateAcademicYearPayload {
  year: number; // e.g., 2026
  title?: string; // e.g., "Academic Year 2026"
}

export interface ICreateClassPayload {
  name: string; // e.g., "Class 6"
  academicYearId: string; // Mandatory reference to AcademicYear ID
}

export interface ICreateSectionPayload {
  name: string; // e.g., "Section A"
  classId: string; // Reference to Class ID
}

// --- Academic Year API Calls ---
export const createAcademicYear = async (payload: ICreateAcademicYearPayload) => {
  const response = await axiosInstance.post("/academic/create-year", payload);
  return response.data;
};

export const getAllAcademicYears = async () => {
  const response = await axiosInstance.get("/academic/years");
  return response.data;
};

// --- Academic Class API Calls ---
export const createClass = async (payload: ICreateClassPayload) => {
  const response = await axiosInstance.post("/academic/create-class", payload);
  return response.data;
};

export const getAllClasses = async () => {
  const response = await axiosInstance.get("/academic/classes");
  return response.data;
};

// --- Academic Section API Calls ---
export const createSection = async (payload: ICreateSectionPayload) => {
  const response = await axiosInstance.post("/academic/create-section", payload);
  return response.data;
};

export const getAllSections = async () => {
  const response = await axiosInstance.get("/academic/sections");
  return response.data;
};

export const academicService = {
  createAcademicYear,
  getAllAcademicYears,
  createClass,
  getAllClasses,
  createSection,
  getAllSections,
};

export default academicService;