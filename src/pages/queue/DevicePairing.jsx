import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pairDevice } from "../../services/deviceServices";

export default function DevicePairing() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handlePair = async () => {
  if (!code) {
    setError("Please enter the pairing code");
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    await pairDevice(code); // 🔥 API CALL

    // ✅ cookie is automatically stored
    navigate("/kiosk"); // redirect to client screen

  } catch (err) {
    setError(err || "Invalid pairing code");
  } finally {
    setIsLoading(false);
  }
};

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 font-raleway relative overflow-hidden px-6">
      
      {/* Decorative circles in background */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }}></div>

      {/* Main Card - Solid White */}
      <div className="max-w-sm w-full relative z-10">
        <div className="bg-white shadow-lg rounded-xl p-6">
          
          {/* Title */}
          <div className="text-center mb-5">
            <h1 className="text-xl font-semibold text-gray-800">
              Pair This Device
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter the pairing code from your salon dashboard
            </p>
          </div>

          {/* Input */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pairing Code
            </label>
            <input
              type="text"
              placeholder="Enter your pairing code"
              value={code}
              onChange={handleCodeChange}
              className={`w-full px-3 py-2 text-lg text-center font-mono tracking-widest border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                error
                  ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-300 focus:ring-teal-200 focus:border-teal-500"
              }`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 mt-1">
                {error}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Enter the code shown on the salon dashboard
            </p>
          </div>

          {/* Button */}
          <button
            onClick={handlePair}
            disabled={isLoading}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm"
            }`}
          >
            {isLoading ? "Pairing..." : "Pair Device"}
          </button>

          {/* Help Text */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Need help? Contact salon administrator
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}