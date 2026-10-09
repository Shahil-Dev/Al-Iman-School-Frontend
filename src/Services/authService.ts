import axiosInstance from "../lib/axiosInstance";

// Student Login Function (Only using studentCode)
export const studentLogin = async (payload: { studentCode: string }) => {
  const response = await axiosInstance.post("/auth/student-login", payload);
  return response.data;
};

// Password or Security Credentials Change (if applicable)
export const changePassword = async (payload: {
  oldPassword?: string;
  newPassword?: string;
}) => {
  const response = await axiosInstance.patch("/auth/change-password", payload);
  return response.data;
};

export const authService = {
  studentLogin,
  changePassword,
};

export default authService;