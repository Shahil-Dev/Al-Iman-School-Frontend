import axiosInstance from "../lib/axiosInstance";

export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await axiosInstance.patch("/auth/change-password", payload);
  return response.data;
};
