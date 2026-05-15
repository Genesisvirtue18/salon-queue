// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../api/axios";
// import { logoutUser } from "../services/authService";


// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const getMe = async () => {
//     try {
//       const res = await api.get("/auth/user");
//       setUser(res.data);
//       return res.data;
//     } catch {
//       setUser(null);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getMe(); // 🔥 auto login on refresh
//   }, []);

// const logout = async () => {
//   try {
//     await api.post("/auth/logout"); // backend logout
//   } catch (err) {
//     console.error("Logout failed", err);
//   }
//   setUser(null); // clear global user
// };

//   return (
//     <AuthContext.Provider value={{ user, setUser, loading, getMe, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuthContext = () => useContext(AuthContext);


import { createContext, useContext, useEffect, useState } from "react";
import api, { setSessionExpiredHandler } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { setLogoutFlag } from "../api/axios";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔥 SESSION EXPIRED HANDLER
  const handleSessionExpired = () => {

    setUser(null);

    // ✅ replace alert with toast
    window.dispatchEvent(new CustomEvent("session-expired"));

    navigate("/", { replace: true });
  };

  // 🔥 CONNECT AXIOS → CONTEXT
  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
  }, []);

  // const getMe = async () => {
  //   try {
  //     const res = await api.get("/auth/user");
  //           skipAuthError: true // 🔥 VERY IMPORTANT

  //     setUser(res.data);
  //   } catch {
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getMe = async () => {
  try {
    const res = await api.get("/auth/user", {
      skipAuthError: true // 🔥 silent
    });

    setUser(res.data);
        return res.data; // 🔥 important

  } catch {
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    getMe();
  }, []);

  // const logout = async () => {
  //   try {
  //         setLogoutFlag(true); // 🚨 IMPORTANT
  //     await api.post("/auth/logout");
  //   } catch {}

  //   setUser(null);
  //   navigate("/");
  // };

  const logout = async () => {
  try {
    setLogoutFlag(true); // 🚨 IMPORTANT

    await api.post("/auth/logout");
  } catch {}

  setUser(null);
    window.dispatchEvent(new CustomEvent("logout-success"));

  navigate("/");

  // reset flag after short delay
  setTimeout(() => setLogoutFlag(false), 1000);
};

  return (
    <AuthContext.Provider value={{ user, loading, logout,getMe  }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);