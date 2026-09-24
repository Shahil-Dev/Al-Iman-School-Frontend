import axiosInstance from "@/src/lib/axiosInstance";

export interface IAdmissionPayload {
  // Personal Information
  studentName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  religion: string;
  country: string;
  bloodGroup?: string;
  nationality: string;
  birthRegNo?: string;

  // Parents Information
  fatherName: string;
  fatherOccupation?: string;
  fatherNid?: string;
  motherName: string;
  motherOccupation?: string;
  motherNid?: string;
  guardianName?: string;
  guardianOccupation?: string;

  // Contact Information
  phone: string;
  altPhone?: string;
  email: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianAddress?: string;

  // Additional & Health Information
  passportNo?: string;
  passportExpiryDate?: string;
  height?: string;
  weight?: string;
  healthConditions?: string[];
  siblingStudentId?: string;
  admitOtherKids?: boolean;

  // Address
  presentAddress: string;
  permanentAddress: string;
  sameAsPresent?: boolean;

  // Previous Education & Media
  prevInstituteName?: string;
  prevInstituteAddress?: string;
  references?: string;
  photoUrl?: string;

  // Academic Target & Payment
  classId: string;
  paymentMethod: "CASH" | "BKASH" | "NAGAD" | "SSLCOMMERZ";
  senderPhone: string;
  amount: number;
  transactionId: string;
}

export interface IAdmissionFilterParams {
  status?: string;
  classId?: string;
  searchTerm?: string;
}

export const submitAdmission = async (payload: IAdmissionPayload) => {
  const response = await axiosInstance.post("/admissions/apply", payload);
  return response.data;
};

export const trackAdmissionStatus = async (identifier: string) => {
  const response = await axiosInstance.get(`/admissions/track/${identifier}`);
  return response.data;
};

// getAllApplications (Updated Function Name & Clean Params Filter)
export const getAllApplications = async (params?: IAdmissionFilterParams) => {
  const cleanParams: Record<string, string> = {};

  if (params?.status && params.status !== "ALL") {
    cleanParams.status = params.status;
  }
  if (params?.classId && params.classId !== "ALL") {
    cleanParams.classId = params.classId;
  }
  if (params?.searchTerm && params.searchTerm.trim() !== "") {
    cleanParams.searchTerm = params.searchTerm.trim();
  }

  const response = await axiosInstance.get("/admissions", {
    params: cleanParams,
  });
  return response.data;
};

export const approveAdmission = async (
  id: string,
  payload?: { sectionId?: string; rollNo?: number }
) => {
  const response = await axiosInstance.patch(`/admissions/approve/${id}`, payload || {});
  return response.data;
};

export const rejectAdmission = async (id: string, reason: string) => {
  const response = await axiosInstance.patch(`/admissions/reject/${id}`, { reason });
  return response.data;
};

export const admissionApi = {
  submitAdmission,
  trackAdmissionStatus,
  getAllApplications, // Updated export reference
  getAllAdmissions: getAllApplications, // Alias included for safety
  approveAdmission,
  rejectAdmission,
};

export default admissionApi;