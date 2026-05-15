import api from "./axios";

// ✅ Get Owner Dashboard
export const getOwnerDashboard = () =>
  api.get("/owner/dashboard");

// 🔹 Request Update (Send OTP)
export const requestUpdateApi = (data) => {
  return api.post("/owner/request-update", data);
};

// 🔹 Verify OTP + Update
export const verifyUpdateApi = (otp) => {
  return api.post("/owner/verify-update", { otp });
};

