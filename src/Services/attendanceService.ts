import axiosInstance from "@/src/lib/axiosInstance";

export interface ISingleAttendanceInput {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export interface ITakeAttendancePayload {
  date: string; // YYYY-MM-DD
  classId: string;
  sectionId: string;
  attendances: ISingleAttendanceInput[];
}

export const takeAttendance = async (payload: ITakeAttendancePayload) => {
  const response = await axiosInstance.post("/attendances", payload);
  return response.data;
};

export const getSectionAttendance = async (
  classId: string,
  sectionId: string,
  date: string
) => {
  const response = await axiosInstance.get("/attendances", {
    params: { classId, sectionId, date },
  });
  return response.data;
};

export const getStudentAttendanceSummary = async (studentId: string) => {
  const response = await axiosInstance.get(`/attendances/summary/${studentId}`);
  return response.data;
};

export const attendanceService = {
  takeAttendance,
  getSectionAttendance,
  getStudentAttendanceSummary,
};

export default attendanceService;