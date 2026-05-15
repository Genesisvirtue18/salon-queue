import {
  registerOwner,
  verifyOtp,
  resendRegisterOtp,
  loginOwner,
  loginSalon,
  loginBarber,logoutApi
} from "../api/authApi";

export const handleRegister = async (data) => {
  try {
    const res = await registerOwner(data);
    return res.data;
  } catch (err) {
    throw err
  }
};

export const handleResendRegisterOtp = async (data) => {
  try {
    const res = await resendRegisterOtp(data);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "Failed to resend OTP";
  }
};

export const handleVerifyOtp = async (data) => {
  try {
    const res = await verifyOtp(data);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "OTP verification failed";
  }
};

export const handleLogin = async (data) => {
  try {
    const res = await loginOwner(data);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "Login failed";
  }
};

export const handleSalonLogin = async (data) => {
  try {
    const res = await loginSalon(data);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "Salon login failed";
  }
};

export const handleBarberLogin = async (data) => {
  try {
    const res = await loginBarber(data);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "Barber login failed";
  }
};

export const logoutUser = async () => {
  const res = await logoutApi();
  return res.data;
};