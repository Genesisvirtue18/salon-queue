import api from "./axios";

export const getPublicServices = () => {
  return api.get("/public/services", {
    withCredentials: true
  });
};

export const getPublicBarbers = () => {
  return api.get("/public/barbers", {
    withCredentials: true
  });
};

export const getBarbersByServices = (serviceIds) => {
  return api.post("/public/barbers/by-services", serviceIds, {
  });
};

export const createBookingApi = (data) => {
  return api.post("/public/booking", data, {
    withCredentials: true
  });
};

export const getAllSalons = () => {
  return api.get("/public/salons"); // no auth needed
};

