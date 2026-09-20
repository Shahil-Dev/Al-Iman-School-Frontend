import axiosInstance from "@/src/lib/axiosInstance";


export const getAllClasses = async () => {
  const response = await axiosInstance.get("/academic/classes");
  return response.data;
};


export const getClassById = async (id: string) => {
  const response = await axiosInstance.get(`/academic/classes/${id}`);
  return response.data;
};


export const getAllSections = async (classId?: string) => {
  const response = await axiosInstance.get("/academic/sections", {
    params: { classId },
  });
  return response.data;
};


export const createClass = async (payload: { name: string; code?: string }) => {
  const response = await axiosInstance.post("/academic/classes", payload);
  return response.data;
};

export const academicService = {
  getAllClasses,
  getClassById,
  getAllSections,
  createClass,
};

export default academicService;