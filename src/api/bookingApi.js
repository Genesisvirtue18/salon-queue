import api from "./axios";

// ✅ Delete booking
export const deleteBookingApi = (id) => {
  return api.delete(`/booking/${id}`);
};

export const transferQueueApi = (fromId, toId) => {
  return api.put(`/booking/transfer-queue`, null, {
    params: {
      fromBarberId: fromId,
      toBarberId: toId
    }
  });
};

// ✅ Get bookings (optional)
// export const getBookingsApi = (salonId, date) => {
//   return api.get(`/owner/salon/${salonId}/bookings`, {
//     params: { date }
//   });
// };

// // ✅ Barber bookings (optional)
// export const getBarberBookingsApi = (barberId, date) => {
//   return api.get(`/barber/${barberId}/history`, {
//     params: { date }
//   });
// };