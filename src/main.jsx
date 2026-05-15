// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import 'leaflet/dist/leaflet.css';
// import { AuthProvider } from './context/AuthContext'; // ✅ ADD THIS



// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <AuthProvider>   {/* ✅ WRAP APP */}
//       <App />
//     </AuthProvider>
//   </StrictMode>,
// )


// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
