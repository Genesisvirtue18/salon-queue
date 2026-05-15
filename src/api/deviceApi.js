import api from "./axios";

// 🔥 Pair Device
export const pairDeviceApi = (deviceCode) => {
  return api.post(
    "/device/pair",
    { deviceCode },
    { withCredentials: true } // 🔥 IMPORTANT for cookies
  );
};