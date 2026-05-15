

import { useState } from "react";
import { updateSalon,handleCreateSalon, getSalonBySlug,getSalonBookingsService } from "../services/salonServices";

export const useSalon = () => {
  const [loading, setLoading] = useState(false);
  const [salon, setSalon] = useState(null); // ✅ IMPORTANT

  const addSalon = async (formData) => {
    setLoading(true);
    try {
      const data = await handleCreateSalon(formData);
      setSalon(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonBySlug = async (slug) => {
    setLoading(true);
    try {
      const data = await getSalonBySlug(slug);
      setSalon(data); // ✅ STORE DATA
      return data;
    } finally {
      setLoading(false);
    }
  };

//   const fetchBookings = async (salonId) => {
//   setLoading(true);
//   try {
//     return await getSalonBookingsService(salonId);
//   } finally {
//     setLoading(false);
//   }
// };

const fetchBookings = async (salonId, date) => {
  setLoading(true);
  try {
    return await getSalonBookingsService(salonId, date); // ✅ PASS DATE
  } finally {
    setLoading(false);
  }
};

  const updateSalonData = async (id, formData) => {
  setLoading(true);
  try {
    const data = await updateSalon(id, formData);

    setSalon(data); // 🔥 update UI instantly

    return data;
  } finally {
    setLoading(false);
  }
};

  return {
    salon,
    addSalon,
    fetchSalonBySlug,
      updateSalonData,
      fetchBookings,
    loading,
  };
};