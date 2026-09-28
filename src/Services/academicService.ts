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

export interface ICreateRoutineSlotPayload {
  day: string; // e.g., "SUNDAY"
  startTime: string; // e.g., "09:00 AM"
  endTime: string; // e.g., "09:45 AM"
  classId: string; // Reference to Class ID
  sectionId: string; // Reference to Section ID
  subjectId: string; // Reference to Subject ID
  teacherId?: string; // Optional reference to Teacher ID
  roomNo?: string; // e.g., "101"
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

// --- Routine API Calls ---
export const createRoutineSlot = async (payload: ICreateRoutineSlotPayload) => {
  const response = await axiosInstance.post("/routines/create-slot", payload);
  return response.data;
};

export const getClassRoutine = async (classId: string, sectionId: string) => {
  const response = await axiosInstance.get(`/routines/${classId}/${sectionId}`);
  return response.data;
};

export const academicService = {
  createAcademicYear,
  getAllAcademicYears,
  createClass,
  getAllClasses,
  createSection,
  getAllSections,
  createRoutineSlot,
  getClassRoutine,
};

export default academicService;