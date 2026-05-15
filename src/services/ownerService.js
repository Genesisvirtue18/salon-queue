import { 
  getOwnerDashboard,
  requestUpdateApi,
  verifyUpdateApi
} from "../api/ownerApi";

export const handleGetDashboard = async () => {
  const response = await getOwnerDashboard();
  return response.data;
};

// 🔹 Step 1: Send OTP
export const requestUpdateService = async (data) => {
  try {
    const res = await requestUpdateApi(data);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to send OTP";
  }
};

// 🔹 Step 2: Verify OTP
export const verifyUpdateService = async (otp) => {
  try {
    const res = await verifyUpdateApi(otp);
    return res.data;
  } catch (err) {
    throw err.response?.data || "OTP verification failed";
  }
};


