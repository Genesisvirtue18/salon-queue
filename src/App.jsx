// import { useState } from 'react'
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import './App.css'
// import Home from './pages/Home'
// import Welcome from './pages/queue/welcome'
// import CustomerDetails from './pages/queue/CustomerDetails'
// import SelectServiceBarber from './pages/queue/SelectServiceBarber'
// import OwnerDashboard from './pages/owner/ownersalons';
// import SalonDashboard from './pages/Salon/SalonDashboard';
// import BarberDashboard from './pages/Barber/BarberDashboard';
// import PreviousBooking from './pages/queue/PreviousBooking';
// import DevicePairing from './pages/queue/DevicePairing';
// import ProtectedRoute from "./Routes/ProtectedRoutes";

// import { useEffect } from "react";
// import { toast } from "react-hot-toast"; // or your toast lib







// function App() {
//   const [count, setCount] = useState(0)
  

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         {/* Kiosk Customer Flow */}
//         <Route path="/kiosk" element={<Welcome />} />
//         <Route path="/kiosk/customer" element={<CustomerDetails />} />
//         <Route path="/kiosk/previous-booking" element={<PreviousBooking />} />
//         <Route path="/device/pair" element={<DevicePairing />} />

//         <Route path="/kiosk/services" element={<SelectServiceBarber />} />
        
//         <Route path="/owner/dashboard" element={<OwnerDashboard />} />
//         <Route path="/salon/:slug" element={<SalonDashboard />} />
//         <Route path="/barber/dashboard" element={<BarberDashboard />} /> 

    


//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App


import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

import Home from './pages/Home'
import Welcome from './pages/queue/welcome'
import CustomerDetails from './pages/queue/CustomerDetails'
import SelectServiceBarber from './pages/queue/SelectServiceBarber'
import OwnerDashboard from './pages/owner/ownersalons';
import SalonDashboard from './pages/Salon/SalonDashboard';
import BarberDashboard from './pages/Barber/BarberDashboard';
import PreviousBooking from './pages/queue/PreviousBooking';
import DevicePairing from './pages/queue/DevicePairing';
import ForgotPassword from './pages/Salon/ForgotPassword';
import ResetPassword from './pages/Salon/ResetPassword';




function App() {

  useEffect(() => {
  const expiredHandler = () => {
    toast.error("Session expired. Please login again.");
  };

  const logoutHandler = () => {
    toast.success("Logged out successfully");
  };

  window.addEventListener("session-expired", expiredHandler);
  window.addEventListener("logout-success", logoutHandler);

  return () => {
    window.removeEventListener("session-expired", expiredHandler);
    window.removeEventListener("logout-success", logoutHandler);
  };
}, []);

  // 🔥 GLOBAL SESSION LISTENER
  useEffect(() => {
    const handler = () => {
      toast.error("Session expired. Please login again.");
    };

    window.addEventListener("session-expired", handler);

    return () => {
      window.removeEventListener("session-expired", handler);
    };
  }, []);

  return (
    <>
      {/* 🔥 TOASTER (MANDATORY) */}
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* PUBLIC */}
        <Route path="/kiosk" element={<Welcome />} />
        <Route path="/kiosk/customer" element={<CustomerDetails />} />
        <Route path="/kiosk/previous-booking" element={<PreviousBooking />} />
        <Route path="/device/pair" element={<DevicePairing />} />
        <Route path="/kiosk/services" element={<SelectServiceBarber />} />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* PRIVATE */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/salon/:slug" element={<SalonDashboard />} />
        <Route path="/barber/dashboard" element={<BarberDashboard />} />
      </Routes>
    </>
  );
}

export default App;