// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:1009/api",
//   withCredentials: true // 🔥 for cookies
// });

// // 🔐 INTERCEPTOR (optional)
// api.interceptors.response.use(
//   res => res,
//   err => {
//     if (err.response?.status === 401) {
//       console.log("Unauthorized");
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;
// api/axios.js


import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:1009/api",
  withCredentials: true
});

let isLoggingOut = false;

export const setLogoutFlag = (value) => {
  isLoggingOut = value;
};

// 🔥 global handler
let onSessionExpired = null;
let isRedirecting = false;

export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.errorMessage || "";

    // 🔥 SKIP SILENT REQUESTS
    if (err.config?.skipAuthError) {
      return Promise.reject(err);
    }

    const isAuthError =
      status === 401 ||
      status === 403 ||
      message.includes("Unauthorized device") ||
      message.includes("token missing") ||
      message.includes("invalid token");

    if (
      isAuthError &&
      onSessionExpired &&
      !isRedirecting &&
      !isLoggingOut
    ) {
      isRedirecting = true;

      onSessionExpired();

      setTimeout(() => {
        isRedirecting = false;
      }, 1500);
    }

    return Promise.reject(err);
  }
);
export default api;
api/axios.js
