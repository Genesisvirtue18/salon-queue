import {
  deleteBookingApi,
  transferQueueApi
 
} from "../api/bookingApi";

// 🔥 Delete booking
export const deleteBookingService = async (id) => {
  try {
    const res = await deleteBookingApi(id);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to delete booking";
  }
};

export const transferQueueService = async (fromId, toId) => {
  try {
    const res = await transferQueueApi(fromId, toId);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Transfer failed";
  }
};

// 🔥 Get salon bookings
// export const getBookingsService = async (salonId, date) => {
//   try {
//     const res = await getBookingsApi(salonId, date);
//     return res.data;
//   } catch (err) {
//     throw err.response?.data || "Failed to fetch bookings";
//   }
// };

// // 🔥 Get barber bookings
// export const getBarberBookingsService = async (barberId, date) => {
//   try {
//     const res = await getBarberBookingsApi(barberId, date);
//     return res.data;
//   } catch (err) {
//     throw err.response?.data || "Failed to fetch barber bookings";
//   }
// };