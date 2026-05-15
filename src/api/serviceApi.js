import api from "./axios";

// 🔹 Create Service
export const createServiceApi = (data) => {
  return api.post("/service", data);
};

// 🔹 Update Service
export const updateServiceApi = (id, data) => {
  return api.put(`/service/${id}`, data);
};

// 🔹 Delete Service
export const deleteServiceApi = (id) => {
  return api.delete(`/service/${id}`);
};

// 🔹 Get Services by Salon
export const getServicesBySalonApi = (salonId) => {
  return api.get(`/service/salon/${salonId}`);
};