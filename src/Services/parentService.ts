import axiosInstance from "@/src/lib/axiosInstance";

export interface IParentRegisterPayload {
  fatherName: string;
  motherName: string;
  email: string;
  password: string;
  phone: string;
  occupation?: string;
}

export const ParentService = {
  registerParent: async (payload: IParentRegisterPayload) => {
    const response = await axiosInstance.post("/parents/register", payload);
    return response.data;
  },
};