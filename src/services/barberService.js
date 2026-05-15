import {
  createBarberApi,
  updateBarberApi,
  deleteBarberApi,
  getBarbersBySalonApi,
  updateBarberStatusApi,
  getBarberProfile,
  getBarberBookingsApi,
  updateBookingStatusApi,
  getBarberAnalyticsApi,
  getBarberHistoryApi,
  getAvailableBarbersApi
} from "../api/barberApi";

// GET ALL
export const getBarbersBySalon = async (salonId) => {
  const res = await getBarbersBySalonApi(salonId);
  return res.data;
};

// CREATE
export const createBarber = async (data) => {
  try{
  const res = await createBarberApi(data);
  return res.data;
  }catch (err) {
    throw err
  }
};

// UPDATE
export const updateBarber = async (id, data) => {
  try{
  const res = await updateBarberApi(id, data);
  return res.data;
  }catch (err) {
    throw err
  }
};

// DELETE
export const deleteBarberById = async (id) => {
  const res = await deleteBarberApi(id);
  return res.data;
};

// STATUS UPDATE
export const updateBarberStatus = async (id, status) => {
  const res = await updateBarberStatusApi(id, status);
  return res.data;
};

export const fetchBarberprofile = async () => {
  try {
    const res = await  getBarberProfile();
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch barber profile";
  }
};

export const fetchBarberBookings = async () => {
  try {
    const res = await getBarberBookingsApi();
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch bookings";
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const res = await updateBookingStatusApi(bookingId, status);
    return res.data;
  } catch (err) {
    throw err;  // ✅ KEEP ORIGINAL AXIOS ERROR
  }
};

export const fetchBarberAnalytics = async () => {
  const res = await getBarberAnalyticsApi();
  return res.data;
};

export const fetchBarberHistory = async (date = null) => {
  const res = await getBarberHistoryApi(date);
  return res.data;
};

export const fetchOtherBarbers = async () => {
  try {
    const res = await getAvailableBarbersApi();
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch barbers";
  }
};