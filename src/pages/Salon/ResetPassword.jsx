import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, role, resetToken } = location.state || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if no state
  React.useEffect(() => {
    if (!username) {
      navigate("/forgot-password");
    }
  }, [username, navigate]);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    checkPasswordStrength(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Test mode - show success
      alert(`✅ Password reset successful!\n\nYou can now login with your new password.`);
      
      // Navigate to login page
      navigate("/login");
      
    } catch (err) {
      alert("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "Very Weak";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-red-500";
    if (passwordStrength === 1) return "bg-orange-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-teal-100/20 to-teal-50 p-3">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-56 h-56 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Reset Password Card */}
      <div className="relative z-10 bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-teal-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-4">
          <div className="flex justify-center mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-center text-white">
            Create New Password
          </h1>
          <p className="text-center text-teal-100 text-xs mt-1">
            {role === "OWNER" ? "Email" : "Username"}: {username}
          </p>
        </div>

        {/* Content */}
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-teal-800 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full border border-teal-200 rounded-md px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-teal-50/30 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength
                            ? getStrengthColor()
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Password strength: <span className="font-semibold">{getStrengthText()}</span>
                  </p>
                  <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                    <li className={newPassword.length >= 6 ? "text-green-600" : ""}>
                      • At least 6 characters
                    </li>
                    <li className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "text-green-600" : ""}>
                      • Uppercase & lowercase letters
                    </li>
                    <li className={/[0-9]/.test(newPassword) ? "text-green-600" : ""}>
                      • At least one number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-teal-800 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full border border-teal-200 rounded-md px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-teal-50/30"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match!</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-2 rounded-md font-semibold transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-teal-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-teal-400 text-[10px]">secure reset</span>
              </div>
            </div>

            {/* Back to Login */}
            <button
              onClick={() => navigate("/login")}
              className="w-full text-teal-600 hover:text-teal-700 text-xs font-medium transition flex items-center justify-center gap-1"
            >
              ← Back to Login
            </button>
          </form>
        </div>

        {/* Footer Accent */}
        <div className="h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600"></div>
      </div>
    </div>
  );
};

export default ResetPassword;