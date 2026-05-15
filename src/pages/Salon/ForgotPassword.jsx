import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("OWNER");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP Modal States
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [dummyOtp, setDummyOtp] = useState("");
  const inputRefs = useRef([]);

  // Generate random 6-digit OTP for testing
  const generateDummyOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setDummyOtp(otp);
    console.log("📱 Test OTP:", otp);
    return otp;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username) {
      alert("Please enter your username/email");
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate dummy OTP
      const otp = generateDummyOtp();
      
      // Show success message with OTP (for testing)
      alert(`✅ Test Mode: OTP sent successfully!\n\nYour verification code is: ${otp}\n\n(Check console for OTP as well)`);
      
      // Open OTP modal
      setShowOtpPopup(true);
      startCountdown();
      setOtpError("");
      
    } catch (err) {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const otp = generateDummyOtp();
      alert(`✅ Test Mode: New OTP sent!\n\nYour verification code is: ${otp}`);
      startCountdown();
      setOtpError("");
      setOtpCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setOtpError("Failed to resend OTP");
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyOtpAndComplete = async () => {
    const otp = otpCode.join("");
    if (otp.length !== 6) {
      setOtpError("Please enter complete 6-digit code");
      return;
    }

    if (otp !== dummyOtp) {
      setOtpError("Invalid OTP code. Please try again.");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOtpPopup(false);
      
      // Navigate to reset password page with user data
      navigate("/reset-password", {
        state: { 
          username, 
          role,
          resetToken: "dummy-reset-token-123" // For testing
        }
      });
    } catch (err) {
      setOtpError("Verification failed. Please try again.");
    }
  };

  const handleOtpChange = (index, e) => {
    const value = e.target.value;
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    setOtpError("");
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const autoFillTestOtp = () => {
    if (dummyOtp) {
      const otpDigits = dummyOtp.split('');
      setOtpCode(otpDigits);
    }
  };

  useEffect(() => {
    if (showOtpPopup && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [showOtpPopup]);

  const OtpPopup = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4" onClick={() => setShowOtpPopup(false)}>
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700 transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Code</h2>
            <p className="text-gray-400 text-sm">
              We've sent a 6-digit code to<br />
              <span className="text-teal-500 font-medium">{username}</span>
            </p>
            <div className="mt-2 text-xs text-yellow-500 bg-yellow-500/10 inline-block px-2 py-1 rounded">
              🧪 Test Mode: Check console for OTP
            </div>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={otpCode[index]}
                onChange={(e) => handleOtpChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-600 rounded-xl text-white focus:border-teal-500 focus:outline-none"
              />
            ))}
          </div>

          {otpError && (
            <p className="text-red-500 text-sm text-center mb-4">{otpError}</p>
          )}

          <button
            onClick={verifyOtpAndComplete}
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Verify & Reset Password
          </button>

          {dummyOtp && (
            <button
              onClick={autoFillTestOtp}
              className="w-full mt-2 text-teal-400 text-sm hover:text-teal-300 transition-colors"
            >
              🔧 Auto-fill Test OTP
            </button>
          )}

          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              Didn't receive code?{" "}
              {countdown > 0 ? (
                <span className="text-gray-500">Resend in {countdown}s</span>
              ) : (
                <button
                  onClick={sendOtp}
                  className="text-teal-400 hover:text-teal-300 font-medium"
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>

          <button
            onClick={() => setShowOtpPopup(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-teal-100/20 to-teal-50 p-3">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-56 h-56 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-teal-100">
        <div className="bg-teal-600 px-5 py-3">
          <h1 className="text-lg font-bold text-center text-white">
            Forgot Password
          </h1>
          <p className="text-center text-teal-100 text-xs mt-0.5">
            Reset your password
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            <button
              onClick={() => setRole("OWNER")}
              className={`py-1.5 rounded-md text-xs font-medium transition ${
                role === "OWNER"
                  ? "bg-teal-500 text-white"
                  : "bg-teal-50 text-teal-700 border border-teal-200"
              }`}
            >
              Owner
            </button>
            <button
              onClick={() => setRole("MANAGER")}
              className={`py-1.5 rounded-md text-xs font-medium transition ${
                role === "MANAGER"
                  ? "bg-teal-500 text-white"
                  : "bg-teal-50 text-teal-700 border border-teal-200"
              }`}
            >
              Manager
            </button>
            <button
              onClick={() => setRole("BARBER")}
              className={`py-1.5 rounded-md text-xs font-medium transition ${
                role === "BARBER"
                  ? "bg-teal-500 text-white"
                  : "bg-teal-50 text-teal-700 border border-teal-200"
              }`}
            >
              Barber
            </button>
          </div>

          <div className="mb-3 text-center">
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
              🧪 Test Mode Active
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-semibold text-teal-800 mb-1">
              {role === "OWNER" ? "Email" : "Username"}
            </label>
            <input
              type="text"
              placeholder={role === "OWNER" ? "test@example.com" : "Enter username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-teal-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-teal-50/30"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-1.5 rounded-md mt-4 text-sm font-semibold transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-teal-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-teal-400 text-[10px]">or</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full text-teal-600 hover:text-teal-700 text-xs font-medium transition"
          >
            ← Back to Login
          </button>
        </div>
      </div>

      {showOtpPopup && <OtpPopup />}
    </div>
  );
};

export default ForgotPassword;