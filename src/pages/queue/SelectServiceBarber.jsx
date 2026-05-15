import { useState, useEffect } from "react";
import { fetchServices, fetchBarbersByServices, createBooking } from "../../services/publicServices";

export default function CustomerBookingFlow() {
  const [step, setStep] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: ""
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedBarbers, setSelectedBarbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showRandomInfo, setShowRandomInfo] = useState(false);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  const toggleService = (service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
      if (selectedBarbers.length > 0) setSelectedBarbers([]);
    } else {
      setSelectedServices([...selectedServices, service]);
      if (selectedBarbers.length > 0) setSelectedBarbers([]);
    }
  };

  const toggleBarber = (barber) => {
    setSelectedBarbers(prev => {
      const isSelected = prev.find(b => b.id === barber.id);
      if (isSelected) {
        return prev.filter(b => b.id !== barber.id);
      } else {
        return [...prev, barber];
      }
    });
  };

  const selectAllBarbers = () => {
    setSelectedBarbers([...availableBarbers]);
  };

  const clearAllBarbers = () => {
    setSelectedBarbers([]);
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableBarbers = barbers;

  useEffect(() => {
    const loadData = async () => {
      try {
        const servicesData = await fetchServices();
        setServices(servicesData);
      } catch (err) {
        console.error("Error loading services:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadBarbers = async () => {
      if (selectedServices.length === 0) {
        setBarbers([]);
        return;
      }
      const serviceIds = selectedServices.map(s => s.id);
      setLoadingBarbers(true);
      try {
        const data = await fetchBarbersByServices(serviceIds);
        setBarbers(data);
        if (selectedBarbers.length > 0) {
          const stillAvailable = selectedBarbers.filter(selectedBarber =>
            data.find(b => b.id === selectedBarber.id)
          );
          if (stillAvailable.length !== selectedBarbers.length) {
            setSelectedBarbers(stillAvailable);
          }
        }
      } catch (err) {
        console.error("API ERROR:", err.response?.data || err.message);
        setBarbers([]);
      } finally {
        setLoadingBarbers(false);
      }
    };
    loadBarbers();
  }, [selectedServices]);

  const validateCustomerDetails = () => {
    const newErrors = {};
    if (!customerDetails.name.trim()) {
      newErrors.name = "Name is required";
    } else if (customerDetails.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!customerDetails.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(customerDetails.phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToServices = async () => {
    if (!validateCustomerDetails()) return;
    try {
      await fetchServices();
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.errorMessage || err.response?.data?.message || "";
      if (message.includes("Unauthorized device") || message.includes("token missing") || message.includes("invalid token")) {
        sessionStorage.setItem("session_expired_msg", "Device expired. Please reconnect device.");
        window.location.href = "/";
        return;
      }
    }
  };

  const handleNextToBarbers = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }
    setStep(3);
  };

  const validateBarberServiceCoverage = () => {
    if (selectedBarbers.length === 0) {
      alert("Please select at least one barber");
      return false;
    }
    const requiredServiceNames = new Set(selectedServices.map(s => s.name));
    const coveredServices = new Set();
    selectedBarbers.forEach(barber => {
      if (barber.services && Array.isArray(barber.services)) {
        barber.services.forEach(service => {
          if (requiredServiceNames.has(service)) {
            coveredServices.add(service);
          }
        });
      }
    });
    const missingServices = Array.from(requiredServiceNames).filter(
      service => !coveredServices.has(service)
    );
    if (missingServices.length > 0) {
      setShowConflictWarning(true);
      setTimeout(() => setShowConflictWarning(false), 5000);
      alert(`The following services are not covered by selected barbers: ${missingServices.join(", ")}. Please add more barbers or change your service selection.`);
      return false;
    }
    return true;
  };

  const handleConfirmBooking = async () => {
    if (!validateBarberServiceCoverage()) return;
    const payload = {
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      barberIds: selectedBarbers.map(b => b.id),
      serviceIds: selectedServices.map(s => s.id)
    };
    try {
      console.log("BOOKING PAYLOAD:", payload);
      await createBooking(payload);
      setBookingConfirmed(true);
    } catch (err) {
      console.error("Booking Error:", err);
      alert("Failed to create booking");
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
      setSelectedBarbers([]);
      setShowConflictWarning(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCustomerDetails({ name: "", phone: "" });
    setSelectedServices([]);
    setSelectedBarbers([]);
    setSearchTerm("");
    setBookingConfirmed(false);
    setErrors({});
    setShowConflictWarning(false);
  };

  const handleRandomBarbers = () => {
    if (availableBarbers.length === 0) {
      alert("No barbers available for selected services");
      return;
    }
    const requiredServiceNames = new Set(selectedServices.map(s => s.name));
    const selected = [];
    const covered = new Set();
    const shuffled = [...availableBarbers].sort(() => 0.5 - Math.random());
    for (const barber of shuffled) {
      if (selected.length >= 3) break;
      selected.push(barber);
      if (barber.services) {
        barber.services.forEach(service => {
          if (requiredServiceNames.has(service)) {
            covered.add(service);
          }
        });
      }
      if (covered.size === requiredServiceNames.size) break;
    }
    setSelectedBarbers(selected);
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalDuration = selectedServices.reduce((total, s) => {
    if (!s.duration) return total;
    if (typeof s.duration === 'string') {
      const minutes = parseInt(s.duration.split(' ')[0]);
      return total + (isNaN(minutes) ? 0 : minutes);
    }
    if (typeof s.duration === 'number') return total + s.duration;
    return total;
  }, 0);

  const queueNumber = selectedBarbers.length > 0 
    ? Math.max(...selectedBarbers.map(b => (b.queue || 0))) + 1 
    : null;

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    if (typeof duration === 'number') return `${duration} min`;
    if (typeof duration === 'string') return duration;
    return 'N/A';
  };

  const canBarberPerformAllServices = (barber) => {
    if (!barber.services) return false;
    const requiredServiceNames = selectedServices.map(s => s.name);
    return requiredServiceNames.every(service => barber.services.includes(service));
  };

  const getCoverageSummary = () => {
    const requiredServiceNames = new Set(selectedServices.map(s => s.name));
    const coveredServices = new Set();
    selectedBarbers.forEach(barber => {
      if (barber.services) {
        barber.services.forEach(service => {
          if (requiredServiceNames.has(service)) {
            coveredServices.add(service);
          }
        });
      }
    });
    const missingServices = Array.from(requiredServiceNames).filter(s => !coveredServices.has(s));
    return { covered: coveredServices.size, total: requiredServiceNames.size, missing: missingServices };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Animated Background Circles - Made smaller for tablet */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-56 h-56 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      
      {/* Subtle Floating Emojis - Made smaller */}
      <div className="absolute top-24 right-16 text-2xl opacity-30 animate-float" style={{ animationDuration: '6s' }}>⏰</div>
      <div className="absolute bottom-32 left-12 text-3xl opacity-25 animate-float-delayed" style={{ animationDuration: '7s' }}>👥</div>
      <div className="absolute top-1/3 right-20 text-2xl opacity-20 animate-float-slow" style={{ animationDuration: '8s' }}>🎫</div>
      <div className="absolute bottom-40 right-16 text-2xl opacity-25 animate-float" style={{ animationDuration: '5.5s' }}>✅</div>
      <div className="absolute top-2/3 left-8 text-2xl opacity-20 animate-float-delayed" style={{ animationDuration: '6.5s' }}>🚶</div>
      <div className="absolute top-40 left-12 text-xl opacity-20 animate-float-slow" style={{ animationDuration: '7.5s' }}>🔔</div>
      <div className="absolute bottom-20 right-32 text-xl opacity-20 animate-float" style={{ animationDuration: '6.8s' }}>📱</div>
      <div className="absolute top-1/4 right-40 text-xl opacity-15 animate-float-delayed" style={{ animationDuration: '9s' }}>⭐</div>

      {/* Dotted Pattern Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #10b981 1.5px, transparent 1.5px)`,
        backgroundSize: '32px 32px'
      }}></div>

      {/* Subtle Wave Pattern at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#10b981" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-3 py-3 md:py-4">
        
        {/* Header - Made compact */}
        <div className="text-center mb-4 md:mb-5">
          <h1 className="text-3xl font-semibold mb-2 text-center text-gray-800">Join the Queue</h1>
          <p className="text-gray-500 text-base text-center">Complete your booking in 3 simple steps</p>
        </div>

        {/* Progress Bar - 3 Steps - Made compact */}
        <div className="flex items-center justify-between mb-5 md:mb-6 px-2">
          <div className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              step >= 1 ? "bg-teal-500 text-white shadow-md" : "bg-gray-200 text-gray-500"
            }`}>1</div>
            <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-teal-500" : "bg-gray-200"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              step >= 2 ? "bg-teal-500 text-white shadow-md" : "bg-gray-200 text-gray-500"
            }`}>2</div>
            <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-300 ${step >= 3 ? "bg-teal-500" : "bg-gray-200"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              step >= 3 ? "bg-teal-500 text-white shadow-md" : "bg-gray-200 text-gray-500"
            }`}>3</div>
          </div>
        </div>

        {/* Step Labels - Made compact */}
        <div className="flex justify-between px-2 mb-5 text-xs text-gray-500">
          <span className="text-center w-14">Your Details</span>
          <span className="text-center w-14">Services</span>
          <span className="text-center w-14">Barber Team</span>
        </div>

        {/* Success Modal - Made compact */}
        {bookingConfirmed && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-xl max-w-sm w-full p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-check-circle text-green-500 text-2xl"></i>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Booking Confirmed!</h2>
              <p className="text-gray-500 text-xs mb-3">Your appointment has been scheduled</p>
              <div className="bg-gray-50 rounded-lg p-2 mb-3 text-left text-xs">
                <p className="text-gray-600 mb-1 text-xs">Customer Details:</p>
                <p className="text-gray-800 text-xs mb-1"><span className="font-semibold">Name:</span> {customerDetails.name}</p>
                <p className="text-gray-800 text-xs mb-2"><span className="font-semibold">Phone:</span> {customerDetails.phone}</p>
                <p className="text-gray-600 mb-1 text-xs">Selected Services:</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedServices.map(s => (
                    <span key={s.id} className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px]">{s.name}</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-1 text-xs">Barber Team:</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedBarbers.map(b => (
                    <span key={b.id} className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">{b.fullName || b.name}</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-1 text-xs">Estimated Queue: <span className="font-bold text-teal-600">#{queueNumber}</span></p>
                <div className="flex justify-between pt-1 border-t mt-1">
                  <span className="font-semibold text-xs">Total Amount:</span>
                  <span className="font-bold text-teal-600 text-xs">{totalPrice}</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-1.5 bg-teal-500 text-white rounded-lg font-medium text-xs hover:bg-teal-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: CUSTOMER DETAILS - Made compact */}
        {step === 1 && !bookingConfirmed && (
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="px-3 py-2 border-b bg-gray-50">
              <h2 className="font-medium text-gray-800 text-sm">
                Your Information
              </h2>
              <p className="text-[10px] text-gray-500">
                Enter details to continue
              </p>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <label className="text-[10px] font-medium text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, name: e.target.value })
                  }
                  className={`mt-1 w-full border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none text-sm py-1.5 px-3 rounded-md`}
                />
                {errors.name && (
                  <p className="text-red-500 text-[9px] mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-600">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, phone: e.target.value })
                  }
                  className={`mt-1 w-full border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none text-sm py-1.5 px-3 rounded-md`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-[9px] mt-1">{errors.phone}</p>
                )}
              </div>
              <button
                onClick={handleNextToServices}
                className="w-full bg-teal-600 text-white text-sm py-2 rounded-md hover:bg-teal-700 transition"
              >
                Continue →
              </button>
              <p className="text-center text-gray-400 text-[9px]">
                Queue number after confirmation
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: SERVICES - Made compact */}
        {step === 2 && !bookingConfirmed && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm">Select Services</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">Choose the services you need</p>
                </div>
                <span className="text-[10px] text-teal-600 bg-white px-2 py-1 rounded-full shadow-sm font-medium">{selectedServices.length} selected</span>
              </div>
            </div>
            <div className="p-3">
              <div className="relative mb-3">
                <i className="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-6">
                    <i className="fas fa-search text-gray-300 text-2xl mb-1"></i>
                    <p className="text-gray-400 text-xs">No services found</p>
                  </div>
                ) : (
                  filteredServices.map((service) => {
                    const isSelected = selectedServices.find(s => s.id === service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleService(service)}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all duration-200 flex justify-between items-center ${
                          isSelected ? "border-teal-500 bg-teal-50 shadow-sm" : "border-gray-200 bg-white hover:border-teal-300"
                        }`}
                      >
                        <div>
                          <p className={`font-medium text-sm ${isSelected ? "text-teal-700" : "text-gray-800"}`}>{service.name}</p>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-xs text-teal-600 font-semibold">{service.price || 0}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{formatDuration(service.duration)}</span>
                          </div>
                          {service.barbers && service.barbers.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 mt-1">
                              {service.barbers.slice(0, 2).map(barber => (
                                <span key={barber} className="text-[9px] text-gray-400 bg-gray-50 px-1 rounded">
                                  {barber}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {isSelected && <i className="fas fa-check-circle text-teal-500 text-base"></i>}
                      </button>
                    );
                  })
                )}
              </div>
              {selectedServices.length > 0 && (
                <div className="mt-3 pt-2 border-t">
                  <p className="text-[10px] text-gray-500 mb-1.5">Selected Services:</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedServices.map(s => (
                      <span key={s.id} className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                        {s.name}
                        <button onClick={() => toggleService(s)} className="hover:text-teal-900">
                          <i className="fas fa-times text-[9px]"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={handleBack}
                      className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleNextToBarbers}
                      className="flex-1 py-1.5 bg-teal-500 text-white rounded-lg font-medium text-sm shadow-md hover:bg-teal-600 transition"
                    >
                      Next →
                    </button>
                  </div>
                  <div className="mt-2 text-right text-sm text-gray-600">
                    <span>Total: {totalPrice} | {totalDuration > 0 ? `${totalDuration} min` : 'N/A'}</span>
                  </div>
                </div>
              )}
              {selectedServices.length === 0 && (
                <div className="text-center mt-3">
                  <p className="text-[10px] text-gray-400">Select one or more services to continue</p>
                  <button
                    onClick={handleBack}
                    className="mt-2 px-5 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: BARBERS - Made compact */}
        {step === 3 && !bookingConfirmed && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm">Build Your Barber Team</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">Select one or more barbers for your services</p>
                </div>
                {selectedServices.length > 0 && availableBarbers.length > 0 && (
                  <div className="relative flex gap-1.5">
                    <button
                      onClick={selectAllBarbers}
                      className="text-[10px] text-white bg-gray-500 px-2 py-1 rounded-lg font-medium flex items-center gap-1 shadow-md hover:bg-gray-600 transition"
                    >
                      <i className="fas fa-users text-[9px]"></i>
                      All
                    </button>
                    <button
                      onClick={clearAllBarbers}
                      className="text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-medium flex items-center gap-1 hover:bg-gray-200 transition"
                    >
                      <i className="fas fa-times text-[9px]"></i>
                      Clear
                    </button>
                    <div className="relative">
                      <button
                        onClick={handleRandomBarbers}
                        onMouseEnter={() => setShowRandomInfo(true)}
                        onMouseLeave={() => setShowRandomInfo(false)}
                        className="text-xs text-white bg-teal-500 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-md hover:bg-teal-600 transition"
                      >
                        <i className="fas fa-dice text-[9px]"></i>
                        Random
                      </button>
                      {showRandomInfo && (
                        <div className="absolute top-full right-0 mt-1 bg-gray-800 text-white text-[9px] rounded-lg px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                          <i className="fas fa-magic mr-0.5"></i>
                          Randomly select barbers!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3">
              <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                <p className="text-[9px] text-gray-500 mb-1">Customer Details:</p>
                <p className="text-xs text-gray-800"><span className="font-semibold">{customerDetails.name}</span> • {customerDetails.phone}</p>
              </div>
              <div className="mb-2 p-2 bg-teal-50 rounded-lg">
                <p className="text-[9px] text-gray-500 mb-1">Your selected services ({selectedServices.length}):</p>
                <div className="flex flex-wrap gap-0.5">
                  {selectedServices.map(service => (
                    <span key={service.id} className="bg-white text-gray-700 px-1.5 py-0.5 rounded text-[9px] border border-gray-200 shadow-sm">
                      {service.name}
                    </span>
                  ))}
                </div>
                <div className="mt-1 pt-1 border-t border-teal-200 flex justify-between text-xs">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-semibold text-teal-600">${totalPrice}</span>
                </div>
              </div>
              {selectedBarbers.length > 0 && (
                <div className={`mb-2 p-2 rounded-lg ${getCoverageSummary().missing.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium">Coverage:</p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${getCoverageSummary().missing.length === 0 ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {getCoverageSummary().covered}/{getCoverageSummary().total}
                    </span>
                  </div>
                  {getCoverageSummary().missing.length > 0 && (
                    <p className="text-[9px] text-yellow-700 mt-0.5">
                      ⚠️ Missing: {getCoverageSummary().missing.join(", ")}
                    </p>
                  )}
                  {getCoverageSummary().missing.length === 0 && (
                    <p className="text-[9px] text-green-700 mt-0.5">
                      ✓ All services covered!
                    </p>
                  )}
                  <p className="text-[9px] text-gray-500 mt-0.5">
                    <i className="fas fa-user-friends mr-0.5 text-[8px]"></i>
                    {selectedBarbers.length} barber{selectedBarbers.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
              {loadingBarbers && (
                <div className="text-center py-5">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                  <p className="mt-1 text-gray-500 text-xs">Finding available barbers...</p>
                </div>
              )}
              {!loadingBarbers && (
                <>
                  {availableBarbers.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-user-slash text-gray-300 text-3xl mb-2"></i>
                      <p className="text-gray-500 text-sm">No barbers available</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">No barber can perform all selected services</p>
                      <button onClick={handleBack} className="mt-2 text-teal-600 text-xs font-medium">← Go back</button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 flex justify-between items-center">
                        <p className="text-[10px] text-teal-600 bg-teal-50 inline-block px-1.5 py-0.5 rounded-full">
                          <i className="fas fa-check-circle mr-0.5 text-teal-500 text-[8px]"></i>
                          {availableBarbers.length} barber(s)
                        </p>
                        <p className="text-[9px] text-gray-400">
                          {selectedBarbers.length} selected
                        </p>
                      </div>
                      <div className="space-y-2 max-h-[280px] overflow-y-auto">
                        {availableBarbers.map((barber) => {
                          const isSelected = selectedBarbers.some(b => b.id === barber.id);
                          const canPerformAll = canBarberPerformAllServices(barber);
                          const servicesBarberCanDo = selectedServices.filter(service =>
                            barber.services?.includes(service.name)
                          );
                          return (
                            <button
                              key={barber.id}
                              onClick={() => toggleBarber(barber)}
                              className={`w-full p-2.5 rounded-lg border-2 text-left transition-all duration-200 ${
                                isSelected 
                                  ? "border-teal-500 bg-teal-50 shadow-md" 
                                  : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <h3 className={`font-semibold text-sm ${isSelected ? "text-teal-700" : "text-gray-800"}`}>
                                        {barber.fullName || barber.name}
                                      </h3>
                                      {canPerformAll && (
                                        <span className="text-[8px] bg-green-100 text-green-700 px-1 py-0.5 rounded-full">
                                          All
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {isSelected && <i className="fas fa-check-circle text-teal-500 text-sm"></i>}
                                    </div>
                                  </div>
                                  {barber.specialty && barber.specialty.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 mt-1">
                                      {barber.specialty.slice(0, 2).map(s => (
                                        <span key={s} className="text-[8px] px-1 py-0.5 bg-gray-100 rounded-full text-gray-600">{s}</span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <i className="fas fa-scissors text-teal-500 text-[9px]"></i>
                                    <span className="text-[9px] text-gray-600">
                                      Can do {servicesBarberCanDo.length}/{selectedServices.length} services
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <i className="fas fa-users text-gray-400 text-[9px]"></i>
                                    <span className="text-[9px] text-gray-500">{barber.queue || 0} people ahead</span>
                                  </div>
                                  {servicesBarberCanDo.length > 0 && servicesBarberCanDo.length < selectedServices.length && (
                                    <div className="mt-1 pt-0.5">
                                      <p className="text-[8px] text-gray-400 mb-0.5">Can do:</p>
                                      <div className="flex flex-wrap gap-0.5">
                                        {servicesBarberCanDo.map(service => (
                                          <span key={service.id} className="text-[8px] bg-teal-50 text-teal-600 px-1 py-0.5 rounded">
                                            {service.name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
              {!loadingBarbers && availableBarbers.length > 0 && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={selectedBarbers.length === 0}
                    className={`flex-1 py-1.5 rounded-lg font-medium text-sm transition ${
                      selectedBarbers.length > 0
                        ? "bg-teal-500 text-white shadow-md hover:bg-teal-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Confirm ({selectedBarbers.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatDelayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: floatDelayed 7s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}