import api from "./axios";

// 🔹 CREATE
export const createBarberApi = (data) => {
  return api.post("/barber", data);
};

// 🔹 UPDATE
export const updateBarberApi = (id, data) => {
  return api.put(`/barber/${id}`, data);
};

// 🔹 DELETE
export const deleteBarberApi = (id) => {
  return api.delete(`/barber/${id}`);
};

// 🔹 GET ALL BY SALON
export const getBarbersBySalonApi = (salonId) => {
  return api.get(`/barber/salon/${salonId}`);
};

export const getBarberProfile = () => {
  return api.get("/barber/profile", {
  });
};

// 🔹 UPDATE STATUS
export const updateBarberStatusApi = (id, status) => {
  return api.patch(`/barber/${id}/status`, { status });
};

// 🔹 GET MY BOOKINGS (QUEUE)
export const getBarberBookingsApi = () => {
  return api.get("/barber/bookings", {
  });
};

export const updateBookingStatusApi = (bookingId, status) => {
  return api.patch(
    `/barber/booking/${bookingId}/status`,
    { status },
 
  );
};

export const getBarberAnalyticsApi = () => {
  return api.get("/barber/analytics");
};

export const getBarberHistoryApi = (date) => {
  const url = date
    ? `/barber/history?date=${date}`
    : `/barber/history`;

  return api.get(url);
};

export const getAvailableBarbersApi = () => {
  return api.get("/barber/available");
};