import api from "./axios";

// ✅ Register Owner
export const registerOwner = (data) =>
  api.post("/auth/owner/register", data);

// ✅ Verify OTP
export const verifyOtp = (data) =>
  api.post("/auth/owner/verify-otp", data);

export const resendRegisterOtp = (data) =>
  api.post("/auth/owner/resend-otp", data);

export const loginOwner = (data) =>
  api.post("/auth/owner/login", data, {
    skipAuthError: true
  });

// ✅ Salon Login (🔥 FIXED)
export const loginSalon = (data) =>
  api.post("/auth/salon/login", data, {
    skipAuthError: true
  });

// ✅ Barber Login (🔥 FIXED)
export const loginBarber = (data) =>
  api.post("/auth/barber/login", data, {
    skipAuthError: true
  });
  
export const logoutApi = () => {
  return api.post("/auth/logout", {}, {
  });
};

