import { getPublicServices,getPublicBarbers,getBarbersByServices,createBookingApi,getAllSalons } from "../api/publicApi";

export const fetchServices = async () => {
  try {
    const res = await getPublicServices();
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch services";
  }
};

export const fetchBarbers = async () => {
  const res = await getPublicBarbers();
  return res.data;
};

export const fetchBarbersByServices = async (serviceIds) => {
  try {
    const res = await getBarbersByServices(serviceIds);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch barbers";
  }
};

export const createBooking = async (payload) => {
  try {
    const res = await createBookingApi(payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Booking failed";
  }
};

export const fetchSalons = async () => {
  try {
    const res = await getAllSalons();
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch salons";
  }
};

