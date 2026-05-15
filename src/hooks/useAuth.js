import { useState } from "react";
import {
  handleRegister,
  handleVerifyOtp,
  handleLogin,
  handleSalonLogin,
  handleBarberLogin,
  handleResendRegisterOtp
} from "../services/authService";

export const useAuth = () => {

  const [loading, setLoading] = useState(false);

  const register = async (data) => {
    setLoading(true);
    try {
      return await handleRegister(data);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (data) => {
  setLoading(true);

  try {
    return await handleResendRegisterOtp(data);
  } finally {
    setLoading(false);
  }
};

  const salonLogin = async (data) => {
  setLoading(true);
  try {
    return await handleSalonLogin(data);
  } finally {
    setLoading(false);
  }
};

const barberLogin = async (data) => {
  setLoading(true);
  try {
    return await handleBarberLogin(data);
  } finally {
    setLoading(false);
  }
};

  const verify = async (data) => {
    setLoading(true);
    try {
      return await handleVerifyOtp(data);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    setLoading(true);
    try {
      return await handleLogin(data);
    } finally {
      setLoading(false);
    }
  };

  return { register,resendOtp,barberLogin,salonLogin, verify, login, loading };
};

