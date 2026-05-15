import api from "./axios";

// ✅ Create Salon (Multipart)
export const createSalon = (formData) =>
  api.post("/salon", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getSalonBySlugApi = (slug) => {
  return api.get(`/salon/slug/${slug}`);
};

// ✅ Get Bookings by Salon
// export const getSalonBookingsApi = (salonId) => {
//   return api.get(`/owner/salon/${salonId}/bookings`);
// };

export const getSalonBookingsApi = (salonId, date) => {
  return api.get(`/owner/salon/${salonId}/bookings`, {
    params: { date } // yyyy-MM-dd
  });
};

// 🔥 UPDATE SALON (Multipart)
export const updateSalonApi = (id, formData) =>
  api.put(`/salon/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });