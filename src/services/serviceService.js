import {
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
  getServicesBySalonApi
} from "../api/serviceApi";

// GET ALL
export const getServicesBySalon = async (salonId) => {
  const res = await getServicesBySalonApi(salonId);
  return res.data;
};

// CREATE
export const createService = async (data) => {
  const res = await createServiceApi(data);
  return res.data;
};

// UPDATE
export const updateService = async (id, data) => {
  const res = await updateServiceApi(id, data);
  return res.data;
};

// DELETE
export const deleteServiceById = async (id) => {
  const res = await deleteServiceApi(id);
  return res.data;
};