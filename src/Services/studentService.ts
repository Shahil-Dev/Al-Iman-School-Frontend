import axiosInstance from "@/src/lib/axiosInstance";

export interface IStudentFilterParams {
  searchTerm?: string;
  classId?: string;
  sectionId?: string;
}

export interface IStudentUpdatePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  rollNo?: number;
  gender?: string;
  dob?: string;
  classId?: string;
  sectionId?: string;
}

export const getAllStudents = async (params?: IStudentFilterParams) => {
  const response = await axiosInstance.get("/students", { params });
  return response.data;
};

export const getSingleStudent = async (id: string) => {
  const response = await axiosInstance.get(`/students/${id}`);
  return response.data;
};

export const updateStudent = async (id: string, payload: IStudentUpdatePayload) => {
  const response = await axiosInstance.patch(`/students/${id}`, payload);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await axiosInstance.delete(`/students/${id}`);
  return response.data;
};

export const StudentService = {
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};