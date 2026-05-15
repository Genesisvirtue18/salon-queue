import { useState, useEffect, useRef } from "react";
import { useOwner } from "../../hooks/useOwner";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import dashboardIcon from "../../assets/Icons/dashboard.png";
import { useNavigate } from "react-router-dom";
import { useSalon } from "../../hooks/useSalon";
import { useAuthContext } from "../../context/AuthContext";


// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const AddSalonModal = ({
  newSalon,
  handleInputChange,
  handleImageUpload,
  setShowAddModal,
  handleAddSalon,
  showPassword,
  setShowPassword,
  setShowLocationPicker,
  passwordError = { passwordError },
  passwordStrength = { passwordStrength },
  formErrors = {},
    handleRemoveImage // ✅ CORRECT


}) => {
  //const [showPassword, setShowPassword] = useState(false);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSalon.email);
  const isUsernameValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,20}$/.test(newSalon.username);
  return (


    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn" onClick={() => setShowAddModal(false)}>


      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-teal-500 p-3 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Add New Salon</h2>
            <p className="text-teal-100 text-xs mt-0.5">Fill in the details to add a new salon</p>
          </div>
          <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

        </div>

        <div className="p-5">
          {formErrors?.general && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300">
              <p className="text-red-700 text-sm font-medium">
                ❌ {formErrors.general}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left Column */}
            <div className="space-y-4">
              {/* Salon Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Salon Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newSalon.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder="Enter salon name"
                />
                {formErrors?.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={newSalon.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder="Street address"
                />
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={newSalon.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={newSalon.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newSalon.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newSalon.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="salon@example.com"

                  />
                  {/* ❌ INVALID */}
                  {newSalon.email && !isEmailValid && (
                    <p className="text-red-500 text-xs mt-1">
                      ❌ Invalid email
                    </p>
                  )}

                  {/* ✅ VALID */}
                  {newSalon.email && isEmailValid && (
                    <p className="text-green-500 text-xs mt-1">
                      ✅ Email is valid
                    </p>
                  )}
                </div>


              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={newSalon.username}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="Username"
                  />
                  {/* ❌ INVALID */}
                  {newSalon.username && !isUsernameValid && (
                    <p className="text-red-500 text-xs mt-1">
                      Username must include letters, numbers & special character (e.g. john@123)
                    </p>
                  )}

                  {/* ✅ VALID */}
                  {newSalon.username && isUsernameValid && (
                    <p className="text-green-500 text-xs mt-1">
                      ✅ Username looks good
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={newSalon.password}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all pr-8"
                      placeholder="Min 8 chars"
                    />
                    {passwordError && (
                      <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                    )}

                    {passwordStrength && (
                      <p
                        className={`text-xs mt-1 ${passwordStrength === "Weak"
                          ? "text-red-500"
                          : passwordStrength === "Medium"
                            ? "text-yellow-500"
                            : "text-green-500"
                          }`}
                      >
                        Strength: {passwordStrength}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500"
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
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Opening & Closing Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Opening Time *
                  </label>
                  <input
                    type="time"
                    name="openingTime"
                    value={newSalon.openingTime}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Closing Time *
                  </label>
                  <input
                    type="time"
                    name="closingTime"
                    value={newSalon.closingTime}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Location on Map *
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-left hover:border-teal-400 hover:bg-teal-50 transition-all group text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                        <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm group-hover:text-teal-700">
                        {newSalon.lat && newSalon.lng ? "✓ Location Selected" : "Select Location"}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                {newSalon.lat && newSalon.lng && (
                  <p className="text-xs text-green-600 mt-1">
                    {newSalon.lat.toFixed(4)}, {newSalon.lng.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Salon Image
                </label>
               <label className="block border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-teal-400 hover:bg-teal-50 transition-all cursor-pointer">
  
  {newSalon.imagePreview ? (
    <div className="relative inline-block">
      <img
        src={newSalon.imagePreview}
        alt="Preview"
        className="h-20 w-20 object-cover rounded-lg mx-auto"
      />

      {/* ❌ Stop click propagation so remove button works */}
      <button
        onClick={(e) => {
          e.preventDefault(); // 🔥 important
          handleRemoveImage();
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
      >
        ✕
      </button>
    </div>
  ) : (
    <span className="text-teal-600 text-sm hover:text-teal-700">
      Upload Image
    </span>
  )}

  {/* 🔥 hidden input (linked to full box) */}
  <input
    type="file"
    className="hidden"
    accept="image/*"
    onChange={handleImageUpload}
  />
</label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSalon}
              className="px-5 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition shadow-md"
            >
              Add Salon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ProfileModal({
  editProfile,
  handleProfileInputChange,
  setShowProfileModal,
  handleSaveProfileClick,
  passwordError,
  confirmError,
  passwordStrength,
  otpLoading   // ✅ ADD THIS

}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4"
      onClick={() => setShowProfileModal(false)}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-teal-500 px-4 py-3 flex justify-between items-center rounded-t-lg sticky top-0">
          <div>
            <h2 className="text-base font-semibold text-white">
              Update Profile
            </h2>
            <p className="text-xs text-teal-100">
              Edit your account information
            </p>
          </div>
          <button
            onClick={() => setShowProfileModal(false)}
            className="text-white hover:text-gray-100 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={editProfile.fullName}
                onChange={handleProfileInputChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={editProfile.email}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed pr-10"
                />


              </div>


            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={editProfile.phoneNumber}
                onChange={handleProfileInputChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Leave blank to keep current"
                  value={editProfile.password}
                  onChange={handleProfileInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm pr-8 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}

                {passwordStrength && (
                  <p
                    className={`text-xs mt-1 ${passwordStrength === "Weak"
                      ? "text-red-500"
                      : passwordStrength === "Medium"
                        ? "text-yellow-500"
                        : "text-green-500"
                      }`}
                  >
                    Strength: {passwordStrength}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition"
                >
                  {showPassword ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={editProfile.confirmPassword}
                  onChange={handleProfileInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm pr-8 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
                {confirmError && (
                  <p className="text-red-500 text-xs mt-1">{confirmError}</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition"
                >
                  {showConfirmPassword ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowProfileModal(false)}
              className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfileClick}
              disabled={otpLoading}
              className="px-5 py-1.5 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {otpLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending OTP...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




export default function OwnerDashboard() {

  const { fetchDashboard, loading, requestUpdate, verifyUpdate } = useOwner();

  const [owner, setOwner] = useState(null);
  const [salons, setSalons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [pendingProfileData, setPendingProfileData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const { addSalon } = useSalon();
  const { logout } = useAuthContext();
  const [otpLoading, setOtpLoading] = useState(false);
  const countdownRef = useRef(30);
  const [formErrors, setFormErrors] = useState({});
  const [showToast, setShowToast] = useState(null);
  const [searchText, setSearchText] = useState("");
const [results, setResults] = useState([]);
const [loadingLocation, setLoadingLocation] = useState(false);







  const [editProfile, setEditProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });



  const [newSalon, setNewSalon] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    openingTime: "",
    closingTime: "",
    image: null,
    imagePreview: null,
    lat: null,
    lng: null
  });

  const handleRemoveImage = () => {
  setNewSalon(prev => ({
    ...prev,
    image: null,
    imagePreview: null
  }));
};

  const handleLogout = async () => {
    try {
      await logout(); // 🔥 calls backend logout + clears user
      navigate("/");  // 🔥 redirect to home
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const checkPasswordStrength = (password) => {
    if (!password) return "";

    let strength = 0;

    if (password.length >= 8) strength++; // 🔥 updated
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return "Weak";
    if (strength === 2 || strength === 3) return "Medium";
    if (strength === 4) return "Strong";
  };


  useEffect(() => {
    if (!showOtpModal) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOtpModal]);

  const sendOtp = async () => {
    try {
      await requestUpdate(editProfile); // 🔥 resend API
      setCountdown(30);
      alert("OTP resent successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to resend OTP");
    }
  };

  const handleOtpChange = (index, e) => {
    const value = e.target.value;

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;

    setOtpCode(newOtp);

    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newOtp = [...otpCode];

      if (otpCode[index]) {
        newOtp[index] = "";
        setOtpCode(newOtp);

        if (index > 0) {
          setTimeout(() => {
            inputRefs.current[index - 1]?.focus();
          }, 0);
        }
      } else if (index > 0) {
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 0);
      }
    }
  };



  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;

  //   setNewSalon(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));

  //   // 🔥 ADD THIS BLOCK
  //   if (name === "password") {
  //     setPasswordStrength(checkPasswordStrength(value));

  //     if (value.length < 8) {
  //       setPasswordError("Password must be at least 8 characters");
  //     } else {
  //       setPasswordError("");
  //     }
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 🔥 1. NAME (allow typing, only validate)
    if (name === "name") {
      if (/\d/.test(value)) {
        setFormErrors(prev => ({
          ...prev,
          name: "Name cannot contain numbers"
        }));
      } else {
        setFormErrors(prev => ({ ...prev, name: "" }));
      }
    }

    // 🔥 2. PHONE (only numbers)
    if (name === "phone") {
      const onlyNumbers = value.replace(/\D/g, "");

      setNewSalon(prev => ({
        ...prev,
        phone: onlyNumbers
      }));

      if (onlyNumbers.length < 10) {
        setFormErrors(prev => ({
          ...prev,
          phone: "Phone must be at least 10 digits"
        }));
      } else {
        setFormErrors(prev => ({ ...prev, phone: "" }));
      }

      return; // ✅ correct here
    }

    // 🔥 3. EMAIL (fix)
    if (name === "email") {
      setNewSalon(prev => ({
        ...prev,
        email: value
      }));

      if (!value) {
        setFormErrors(prev => ({ ...prev, email: "Email is required" }));
      } else if (!/^\S+@\S+\.\S+$/.test(value)) {
        setFormErrors(prev => ({
          ...prev,
          email: "Invalid email format"
        }));
      } else {
        setFormErrors(prev => ({ ...prev, email: "" }));
      }

      return; // ✅ prevent double update
    }

    // 🔥 4. USERNAME
    if (name === "username") {
      if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
        setFormErrors(prev => ({
          ...prev,
          username: "4-20 chars, letters, numbers, underscore only"
        }));
      } else {
        setFormErrors(prev => ({ ...prev, username: "" }));
      }
    }

    // ✅ NORMAL UPDATE (for other fields)
    setNewSalon(prev => ({
      ...prev,
      [name]: value
    }));

    // 🔥 5. PASSWORD
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));

      if (value.length < 8) {
        setPasswordError("Password must be at least 8 characters");
      } else {
        setPasswordError("");
      }
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchDashboard();

        setOwner(data.owner);
        setSalons(data.salons);
      } catch (err) {
        console.error(err);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (owner) {
      setEditProfile({
        fullName: owner.fullName,
        email: owner.email,
        phoneNumber: owner.phoneNumber,
        password: "",
        confirmPassword: ""
      });
    }
  }, [owner]);



  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSalon({ ...newSalon, image: file, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfile({ ...editProfile, profileImage: file, profileImagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;

    const updated = { ...editProfile, [name]: value };
    setEditProfile(updated);

    // 🔥 Password strength check
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));

      if (value.length < 8) {
        setPasswordError("Password must be at least 8 characters");
      } else {
        setPasswordError("");
      }
    }

    // 🔥 Confirm password check
    if (name === "confirmPassword" || name === "password") {
      if (updated.password !== updated.confirmPassword) {
        setConfirmError("Passwords do not match");
      } else {
        setConfirmError("");
      }
    }
  };



  // const handleSaveProfileClick = async () => {
  //   try {
  //     setOtpLoading(true); // 🔥 START LOADING
  //     await requestUpdate(editProfile); // ✅ FIXED

  //     setCountdown(30);       // ✅ move here

  //     setShowOtpModal(true);
  //     localStorage.setItem("otpModal", "true"); // 🔥 persist
  //     localStorage.setItem("otpStartTime", Date.now());
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to send OTP");
  //   } finally {
  //     setOtpLoading(false); // 🔥 STOP LOADING

  //   }
  // };

  const handleSaveProfileClick = async () => {

    // ✅ ONLY PASSWORD VALIDATION (no email change)

    // If user entered password → validate it
    if (editProfile.password) {

      if (editProfile.password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
      }

      if (editProfile.password !== editProfile.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    try {
      setOtpLoading(true); // 🔥 START LOADING

      await requestUpdate(editProfile); // ✅ SAME API CALL

      setCountdown(30);
      setShowOtpModal(true);

      localStorage.setItem("otpModal", "true");
      localStorage.setItem("otpStartTime", Date.now());

    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    } finally {
      setOtpLoading(false); // 🔥 STOP LOADING
    }
  };
  useEffect(() => {
    const isOtpOpen = localStorage.getItem("otpModal");
    const startTime = localStorage.getItem("otpStartTime");

    if (isOtpOpen === "true" && startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = 30 - elapsed;

      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        setCountdown(0);
      }

      setShowOtpModal(true);
    }
  }, []);


  const handleVerifyOtp = async () => {
    const enteredOtp = otpCode.join("");

    if (enteredOtp.length !== 6) {
      setOtpError("Enter 6-digit OTP");
      return;
    }

    try {
      const updatedOwner = await verifyUpdate(enteredOtp);


      alert("Profile updated successfully");
      localStorage.removeItem("otpModal");

      setOwner(updatedOwner);
      setShowOtpModal(false);
      setOtpCode(["", "", "", "", "", ""]);

    } catch (err) {
      setOtpError(err?.response?.data || "Invalid OTP");
    }
  };



  // Search Location Component - Fixed geocoder
  // const SearchLocation = () => {
  //   const map = useMap();

  //   useEffect(() => {
  //     if (!map) return;

  //     const geocoder = L.Control.geocoder({
  //       defaultMarkGeocode: false,
  //       collapsed: false
  //     }).addTo(map);

  //     geocoder.on("markgeocode", (e) => {
  //       const center = e.geocode.center;

  //       map.setView(center, 14);   // zoom to location

  //       if (window.currentMarker) {
  //         map.removeLayer(window.currentMarker);
  //       }

  //       window.currentMarker = L.marker(center).addTo(map);
  //     });

  //     return () => {
  //       map.removeControl(geocoder);
  //     };
  //   }, []);

  //   return null;
  // };

  const searchLocation = async (query) => {
  if (!query) {
    setResults([]);
    return;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();
    setResults(data);
  } catch (err) {
    console.error(err);
  }
};

const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchText(value);

  // 🔥 debounce optional (production)
  searchLocation(value);
};

const handleSelectLocation = (place) => {
  const lat = parseFloat(place.lat);
  const lng = parseFloat(place.lon);

  setNewSalon((prev) => ({
    ...prev,
    lat,
    lng
  }));

  setSearchText(place.display_name);
  setResults([]); // close dropdown
};

const handleCurrentLocation = () => {
  setLoadingLocation(true);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setNewSalon((prev) => ({
        ...prev,
        lat,
        lng
      }));

      setLoadingLocation(false);
    },
    () => {
      alert("Unable to fetch location");
      setLoadingLocation(false);
    }
  );
};

  // Location Selector Component - Handles map clicks
  const LocationSelector = () => {
    const map = useMap();

    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setNewSalon(prev => ({
          ...prev,
          lat: lat,
          lng: lng
        }));

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`📍 Selected location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();

        setTimeout(() => {
          map.removeLayer(marker);
        }, 2000);

        setShowLocationPicker(false);
      }
    });
    return null;
  };

  // Location Picker Modal with Leaflet Map and Search
 const LocationPickerModal = () => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 🔍 SEARCH API
  const searchLocation = async (query) => {
    if (!query) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 INPUT CHANGE
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    searchLocation(value);
  };

  // ✅ SELECT LOCATION
  const handleSelectLocation = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    setNewSalon((prev) => ({
      ...prev,
      lat,
      lng
    }));

    setSearchText(place.display_name);
    setResults([]);
  };

  // 📍 CURRENT LOCATION
  const handleCurrentLocation = () => {
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setNewSalon((prev) => ({
          ...prev,
          lat,
          lng
        }));

        setLoadingLocation(false);
      },
      () => {
        alert("Unable to fetch location");
        setLoadingLocation(false);
      }
    );
  };

  // 🔥 MAP CLICK SELECTOR
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        setNewSalon((prev) => ({
          ...prev,
          lat,
          lng
        }));

        setResults([]);
      }
    });
    return null;
  };

  // 🔥 AUTO MOVE MAP
  const RecenterMap = ({ lat, lng }) => {
    const map = useMap();

    useEffect(() => {
      if (lat && lng) {
        map.setView([lat, lng], 14);
      }
    }, [lat, lng]);

    return null;
  };

  const lat = newSalon.lat || 20.5937;
  const lng = newSalon.lng || 78.9629;

 return (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    onClick={() => setShowLocationPicker(false)}
  >
    <div
      className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 🔷 HEADER */}
      <div className="flex justify-between items-center px-5 py-4 border-b bg-teal-500">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        Select Salon Location
        </h2>
        <button
          onClick={() => setShowLocationPicker(false)}
          className="text-white text-xl hover:scale-110 transition"
        >
          ✕
        </button>
      </div>

      {/* 🔍 SEARCH SECTION */}
    <div className="p-4 border-b bg-gray-50 relative z-[999]">

  {/* 🔍 SEARCH INPUT */}
  <div className="flex flex-col gap-2">
    
    <input
      type="text"
      value={searchText}
      onChange={handleSearchChange}
      placeholder="Search city, address, landmark..."
      className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
    />

    {/* 📍 CURRENT LOCATION BUTTON */}
    <button
      onClick={handleCurrentLocation}
      className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white py-2 rounded-xl text-sm hover:bg-teal-600 transition"
    >
      {loadingLocation ? (
        "Fetching your location..."
      ) : (
        <>
          Use Current Location
        </>
      )}
    </button>

  </div>

  {/* 🔽 SEARCH RESULTS */}
  {results.length > 0 && (
    <div className="absolute left-0 right-0 top-[100px] bg-white shadow-xl rounded-xl mt-2 max-h-60 overflow-y-auto border">
      {results.map((place, index) => (
        <div
          key={index}
          onClick={() => handleSelectLocation(place)}
          className="px-4 py-2 text-sm hover:bg-teal-50 cursor-pointer transition border-b last:border-none"
        >
          {place.display_name}
        </div>
      ))}
    </div>
  )}

</div>

      {/* 🗺️ MAP */}
      <div className="flex-1 relative">
        <MapContainer
          center={[lat, lng]}
          zoom={lat ? 14 : 5}
          className="h-full w-full z-0"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <RecenterMap lat={lat} lng={lng} />
          <Marker position={[lat, lng]} />
          <LocationSelector />
        </MapContainer>

        {/* 📍 LOCATION BADGE */}
        {newSalon.lat && newSalon.lng && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg text-xs text-gray-700">
            📍 {newSalon.lat.toFixed(4)}, {newSalon.lng.toFixed(4)}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 border-t">
        💡 Search or click on map to set location
      </div>
    </div>
  </div>
);
};
  // OTP Modal Component
  const OtpPopup = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] " onClick={() => setShowOtpModal(false)}>
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700 transform transition-all duration-300 " onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Code</h2>
            <p className="text-gray-400 text-sm">
              We've sent a 6-digit code to your register mail<br />
              <span className="text-teal-500 font-medium">{editProfile.email}</span>
            </p>
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
            onClick={handleVerifyOtp}
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Verify & Update
          </button>

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
            // onClick={() => setShowOtpPopup(false)}
            onClick={() => {
              setShowOtpModal(false);
              localStorage.removeItem("otpModal"); // 🔥 clear
            }}
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

  // Profile Modal Component


  // const handleAddSalon = async () => {
  //   if (!newSalon.name || !newSalon.address || !newSalon.city || !newSalon.country ||
  //     !newSalon.phone || !newSalon.email || !newSalon.username || !newSalon.password ||
  //     !newSalon.openingTime || !newSalon.closingTime || !newSalon.lat || !newSalon.lng) {
  //     alert("Please fill all required fields");
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();

  //     // 🔥 DTO as JSON
  //     formData.append(
  //       "data",
  //       new Blob([JSON.stringify({
  //         name: newSalon.name,
  //         address: newSalon.address,
  //         city: newSalon.city,
  //         country: newSalon.country,
  //         salonPhoneNumber: newSalon.phone,
  //         salonEmail: newSalon.email,
  //         salonUserName: newSalon.username,
  //         salonPassword: newSalon.password,
  //         openingTime: newSalon.openingTime,
  //         closingTime: newSalon.closingTime,
  //         latitude: newSalon.lat,
  //         longitude: newSalon.lng
  //       })], { type: "application/json" })
  //     );

  //     // 🔥 IMAGE
  //     if (newSalon.image) {
  //       formData.append("image", newSalon.image);
  //     }

  //     await addSalon(formData);

  //     alert("Salon created successfully 🎉");

  //     setShowAddModal(false);
  //     resetForm();

  //     // 🔥 OPTIONAL: reload data
  //     // fetchSalons();

  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to create salon");
  //   }
  // };

  const showToastMessage = (message, type = "success") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleAddSalon = async () => {

    // 🔥 1. Required fields check
    if (!newSalon.name.trim()) {
      showToastMessage("Salon name is required", "error");
      return;
    }

    if (!newSalon.address.trim()) {
      showToastMessage("Address is required", "error");
      return;
    }

    if (!newSalon.city.trim()) {
      showToastMessage("City is required", "error");
      return;
    }

    if (!newSalon.country.trim()) {
      showToastMessage("Country is required", "error");
      return;
    }

    if (!newSalon.phone.trim()) {
      showToastMessage("Phone is required", "error");
      return;
    }

    if (!newSalon.email.trim()) {
      showToastMessage("Email is required", "error");
      return;
    }

    if (!newSalon.username.trim()) {
      showToastMessage("Username is required", "error");
      return;
    }

    if (!newSalon.password.trim()) {
      showToastMessage("Password is required", "error");
      return;
    }

    // 🔥 2. Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSalon.email)) {
      showToastMessage("Invalid email format", "error");
      return;
    }

    // 🔥 3. Phone validation
    if (!/^\d{10,15}$/.test(newSalon.phone)) {
      showToastMessage("Phone must be 10–15 digits only", "error");
      return;
    }

    // 🔥 4. Username validation
    if (newSalon.username.length < 4) {
      showToastMessage("Username must be at least 4 characters", "error");
      return;
    }

    // 🔥 5. Password validation
    if (newSalon.password.length < 8) {
      showToastMessage("Password must be at least 8 characters", "error");
      return;
    }

    // 🔥 6. Time validation
    if (!newSalon.openingTime || !newSalon.closingTime) {
      showToastMessage("Opening & Closing time required", "error");
      return;
    }

    if (newSalon.openingTime >= newSalon.closingTime) {
      showToastMessage("Closing time must be after opening time", "error");
      return;
    }

    // 🔥 7. Location validation
    if (!newSalon.lat || !newSalon.lng) {
      showToastMessage("Please select location on map", "error");
      return;
    }

    try {
      const formData = new FormData();

      formData.append(
        "data",
        new Blob([JSON.stringify({
          name: newSalon.name,
          address: newSalon.address,
          city: newSalon.city,
          country: newSalon.country,
          salonPhoneNumber: newSalon.phone,
          salonEmail: newSalon.email,
          salonUserName: newSalon.username,
          salonPassword: newSalon.password,
          openingTime: newSalon.openingTime,
          closingTime: newSalon.closingTime,
          latitude: newSalon.lat,
          longitude: newSalon.lng
        })], { type: "application/json" })
      );

      if (newSalon.image) {
        formData.append("image", newSalon.image);
      }

      await addSalon(formData);
      const data = await fetchDashboard();
    setSalons(data.salons);


      // ✅ SUCCESS TOAST
      showToastMessage("Salon created successfully 🎉", "success");

      setShowAddModal(false);
      resetForm();

    } catch (err) {
      const message =
        err?.response?.data?.errorMessage ||   // ✅ correct field
        err?.response?.data?.message ||        // fallback
        err?.message ||
        "Registration failed";

      // 🔥 Optional clean message
      if (message.includes("already exists")) {
        showToastMessage("username already registered", "error");
      } else {
        showToastMessage(message, "error");
      }
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const resetForm = () => {
    setNewSalon({
      name: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      username: "",
      password: "",
      openingTime: "",
      closingTime: "",
      image: null,
      imagePreview: null,
      lat: null,
      lng: null
    });
  };

  return (

    <div className="min-h-screen bg-white">


      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <img src={dashboardIcon} alt="dashboard" className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-800 truncate">
                  Welcome, {owner?.fullName}
                </h1>
              </div>
              <p className="text-gray-500 text-sm ml-13">Manage your salon businesses</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-start md:justify-end">
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Salon
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-slideDown ${showToast.type === "success"
            ? "bg-teal-500 text-white"
            : showToast.type === "error"
              ? "bg-red-500 text-white"
              : showToast.type === "warning"
                ? "bg-amber-500 text-white"
                : "bg-teal-500 text-white"
            }`}
        >
          {showToast.message}
        </div>
      )}
      {/* Salon List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex justify-between items-center mt-8 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Your Salons</h2>
          <div className="flex items-center gap-2">

          </div>
        </div>

        <div className="space-y-4">
          {salons.map((salon) => (
            <div key={salon.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-5 hover:border-teal-200 group">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {salon.image ? (
                      <img src={salon.image} alt={salon.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-500 transition">
                        <svg className="w-5 h-5 text-teal-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-800">{salon.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{salon.address}, {salon.city}, {salon.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{salon.salonPhoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{salon.salonEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{salon.openingTime} : {salon.closingTime}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <button onClick={() =>
                    navigate(`/salon/${salon.slug}`, {
                      state: { salonId: salon.id }
                    })
                  } className="w-full md:w-auto bg-gray-50 text-gray-700 px-5 py-2 rounded-lg hover:bg-teal-500 hover:text-white transition-all duration-200 text-sm font-medium border border-gray-200 hover:border-teal-500">
                    Manage Salon
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Salon Card */}
          <div
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-400 hover:bg-teal-50/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-100 transition">
              <svg className="w-7 h-7 text-gray-400 group-hover:text-teal-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium group-hover:text-teal-600 transition">Add New Salon</p>
            <p className="text-gray-400 text-sm mt-1">Create a new salon listing to grow your business</p>
          </div>
        </div>
      </div>

      {/* Add Salon Modal */}
      {showAddModal && (
        <AddSalonModal
          newSalon={newSalon}
          handleInputChange={handleInputChange}
          handleImageUpload={handleImageUpload}
          setShowAddModal={setShowAddModal}
          handleAddSalon={handleAddSalon}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          setShowLocationPicker={setShowLocationPicker}
          passwordError={passwordError}
          passwordStrength={passwordStrength}
          formErrors
              handleRemoveImage={handleRemoveImage}


        />
      )}
      {/* Location Picker Modal */}
      {showLocationPicker && <LocationPickerModal />}

      {showOtpModal && <OtpPopup />}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          editProfile={editProfile}
          handleProfileInputChange={handleProfileInputChange}
          setShowProfileModal={setShowProfileModal}
          handleSaveProfileClick={handleSaveProfileClick}
          passwordError={passwordError}
          confirmError={confirmError}
          passwordStrength={passwordStrength}
          otpLoading={otpLoading}   // ✅ ADD THIS

        />
      )}


      <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                /* Geocoder Control Styles */
                .leaflet-control-geocoder {
                    z-index: 10000 !important;
                    width: 280px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .leaflet-control-geocoder-form input {
                    width: 100%;
                    padding: 8px 12px;
                    font-size: 14px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    outline: none;
                    transition: all 0.2s;
                }
                
                .leaflet-control-geocoder-form input:focus {
                    border-color: #14b8a6;
                    box-shadow: 0 0 0 2px rgba(20,184,166,0.1);
                }
                
                .leaflet-control-geocoder-alternatives {
                    z-index: 10000 !important;
                    background: white;
                    border-radius: 8px;
                    margin-top: 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                
                .leaflet-control-geocoder-alternatives li {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .leaflet-control-geocoder-alternatives li:hover {
                    background-color: #f0fdf4;
                }
                
                .leaflet-control-geocoder-alternatives .leaflet-control-geocoder-alternative {
                    padding: 8px 12px;
                }
                
                /* Ensure map controls are accessible */
                .leaflet-control-container .leaflet-top .leaflet-left {
                    z-index: 1000;
                }
                
                .leaflet-control-zoom {
                    z-index: 1000 !important;
                }
            `}</style>
    </div>
  );
}