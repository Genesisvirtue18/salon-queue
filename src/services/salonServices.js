import { createSalon } from "../api/salonApi";
import { getSalonBySlugApi } from "../api/salonApi";
import { updateSalonApi,getSalonBookingsApi } from "../api/salonApi";



export const handleCreateSalon = async (formData) => {
  try {
    const response = await createSalon(formData);
    return response.data;
  }catch (err) {
    throw err
  }
};


// 🔹 Get Salon by Slug
export const getSalonBySlug = async (slug) => {
  try {
    const res = await getSalonBySlugApi(slug);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch salon";
  }
};


// 🔹 Update Salon
export const updateSalon = async (id, formData) => {
  try {
    const res = await updateSalonApi(id, formData);
    return res.data;
  } catch (err) {
    throw err
  }
};

// 🔹 Get Salon Bookings
// export const getSalonBookingsService = async (salonId) => {
//   try {
//     const res = await getSalonBookingsApi(salonId);
//     return res.data;
//   } catch (err) {
//     throw err.response?.data || "Failed to fetch bookings";
//   }
// };

export const getSalonBookingsService = async (salonId, date) => {
  try {
    const res = await getSalonBookingsApi(salonId, date);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch bookings";
  }
};