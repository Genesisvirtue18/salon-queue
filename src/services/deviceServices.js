import { pairDeviceApi } from "../api/deviceApi";

export const pairDevice = async (deviceCode) => {
  try {
    const res = await pairDeviceApi(deviceCode);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Invalid device code";
  }
};