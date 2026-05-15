import { useState } from "react";
import { handleGetDashboard } from "../services/ownerService";
import { requestUpdateService, verifyUpdateService } from "../services/ownerService";

export const useOwner = () => {
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      return await handleGetDashboard();
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD HERE (INSIDE HOOK)
  const requestUpdate = async (data) => {
    return await requestUpdateService(data);
  };

  const verifyUpdate = async (otp) => {
    return await verifyUpdateService(otp);
  };

  // ✅ SINGLE RETURN
  return {
    fetchDashboard,
    loading,
    requestUpdate,
    verifyUpdate,
  };
};

