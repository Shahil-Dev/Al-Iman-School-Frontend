import axiosInstance from "@/src/lib/axiosInstance";

export interface IAdmissionFilterParams {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  classId?: string;
  searchTerm?: string;
}


export const getAllAdmissions = async (params?: IAdmissionFilterParams) => {
  const response = await axiosInstance.get("/admissions", { params });
  return response.data;
};


export const approveAdmission = async (
  id: string,
  payload?: { sectionId?: string; rollNo?: number }
) => {
  const response = await axiosInstance.patch(`/admissions/approve/${id}`, payload);
  return response.data;
};


export const rejectAdmission = async (id: string, reason: string) => {
  const response = await axiosInstance.patch(`/admissions/reject/${id}`, { reason });
  return response.data;
};

export const admissionApi = {
  getAllAdmissions,
  approveAdmission,
  rejectAdmission,
};