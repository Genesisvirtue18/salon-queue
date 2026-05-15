import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import navIcon from "../assets/Icons/nav-icon.png";
import { useAuth } from "../hooks/useAuth";
import { fetchSalons } from "../services/publicServices";
import { useRef } from "react";
import { useAuthContext } from "../context/AuthContext";
import OtpPopup from "../components/OtpPopup";




// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Default salon image fallback
const DEFAULT_SALON_IMAGE = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop";

export default function Home() {
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const [searchLocation, setSearchLocation] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [selectedSalon, setSelectedSalon] = useState(null);
    const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [sortBy, setSortBy] = useState("distance");
    const [showToast, setShowToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loginRole, setLoginRole] = useState("OWNER");
    const [salons, setSalons] = useState([]);
    const [loadingSalons, setLoadingSalons] = useState(false);
    //     const [isLoggedIn, setIsLoggedIn] = useState(false);
    // const [loggedInUser, setLoggedInUser] = useState(null);

    // Filter states
    const [selectedType, setSelectedType] = useState(null);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [ratingFilter, setRatingFilter] = useState(null);
    const [distanceFilter, setDistanceFilter] = useState("all");

    const { user, logout, getMe } = useAuthContext();


    // Owner Auth States
    const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [ownerForm, setOwnerForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [otpError, setOtpError] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    //const { user, setUser, logout } = useAuth();

    const propertyTypes = ["All", "Hair Salon", "Beauty Salon", "Barbershop", "Spa", "Nail Salon"];
    const amenitiesList = ["Parking", "WiFi", "Cards Accepted", "Wheelchair Access"];
    const distanceOptions = [
        { value: "all", label: "All distances" },
        { value: "0.5", label: "Within 0.5 miles" },
        { value: "1", label: "Within 1 mile" },
        { value: "2", label: "Within 2 miles" }
    ];
    const { register, resendOtp, verify, salonLogin, barberLogin, login, loading } = useAuth();

    // Show toast message
    const showToastMessage = (message, type = "success") => {
        setShowToast({ message, type });
        setTimeout(() => setShowToast(null), 3000);
    };

  const timerRef = useRef(null);

const startCountdown = () => {

    clearInterval(timerRef.current);

    let timeLeft = 60;

    setCountdown(timeLeft);

    timerRef.current = setInterval(() => {

        timeLeft--;

        setCountdown(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerRef.current);
        }

    }, 1000);
};

useEffect(() => {

    return () => {
        clearInterval(timerRef.current);
    };

}, []);

    // Load salons from API
    useEffect(() => {
        loadSalons();
    }, []);

    const loadSalons = async () => {
        setLoadingSalons(true);
        try {
            const data = await fetchSalons();

            // Format the salon data for display
            const formatted = data.map(salon => ({
                id: salon.id,
                name: salon.name,
                address: `${salon.address}, ${salon.city}, ${salon.country}`,
                distance: "N/A",
                rating: "4.5", // Default rating since not in API response
                lat: salon.latitude,
                lng: salon.longitude,
                img: salon.imageUrl ? `ttps://salonqueueapi.genesisvirtue.one${salon.imageUrl}` : DEFAULT_SALON_IMAGE,
                type: "Salon", // Default type since not in API response
                amenities: ["WiFi", "Cards Accepted"], // Default amenities
                phone: salon.salonPhoneNumber,
                hours: `${salon.openingTime} - ${salon.closingTime}`,
                calculatedDistance: null,
                slug: salon.slug,
                email: salon.salonEmail
            }));

            setSalons(formatted);

            // Center map on first salon if available
            if (formatted.length > 0) {
                setMapCenter([formatted[0].lat, formatted[0].lng]);
            }

            showToastMessage(`Loaded ${formatted.length} salons successfully!`, "success");
        } catch (err) {
            console.error("Error loading salons:", err);
            showToastMessage("Failed to load salons", "error");
        } finally {
            setLoadingSalons(false);
        }
    };

    // Get user's current location and find nearby salons (within ~2 miles)
    const getUserLocationAndFindNearby = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(userLoc);
                    setMapCenter([userLoc.lat, userLoc.lng]);
                    setIsLocating(false);
                    // Automatically filter to salons within 2 miles
                    setDistanceFilter("2");
                    showToastMessage(`📍 Showing salons within 2 miles of your location`, "success");
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsLocating(false);
                    let errorMessage = "Unable to get your location. ";
                    if (error.code === 1) errorMessage += "Please enable location access to find salons near you.";
                    else errorMessage += "Please enter a location manually to find nearby salons.";
                    showToastMessage(errorMessage, "error");
                }
            );
        } else {
            setIsLocating(false);
            showToastMessage("Geolocation is not supported by your browser", "error");
        }
    };

    // Get directions to salon (opens Google Maps) - No "Near Me" required
    const getDirections = (salon) => {
        // If user has shared location, use it as starting point
        if (userLocation) {
            const origin = `${userLocation.lat},${userLocation.lng}`;
            const destination = `${salon.lat},${salon.lng}`;
            const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
            window.open(googleMapsUrl, "_blank");
            showToastMessage(`Opening directions to ${salon.name}`, "success");
        } else {
            // If no user location, just show salon location on map
            const destination = `${salon.lat},${salon.lng}`;
            const googleMapsUrl = `https://www.google.com/maps/dir//${destination}`;
            window.open(googleMapsUrl, "_blank");
            showToastMessage(`Opening ${salon.name} location in Google Maps`, "success");
        }
    };

    // Call salon
    const callSalon = (phone) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
            showToastMessage(`Calling ${phone}...`, "info");
        } else {
            showToastMessage("Phone number not available", "warning");
        }
    };

    // Calculate distance between two coordinates (in miles)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get salons with calculated distances
    const getSalonsWithDistances = () => {
        if (userLocation) {
            return salons.map(salon => ({
                ...salon,
                calculatedDistance: calculateDistance(userLocation.lat, userLocation.lng, salon.lat, salon.lng)
            }));
        }
        return salons;
    };

    // Filter and sort salons
    const filteredSalons = getSalonsWithDistances()
        .filter(salon => {
            if (selectedType && selectedType !== "All" && salon.type !== selectedType) return false;
            if (selectedAmenities.length > 0) {
                const hasAllAmenities = selectedAmenities.every(amenity =>
                    salon.amenities && salon.amenities.includes(amenity)
                );
                if (!hasAllAmenities) return false;
            }
            if (ratingFilter && parseFloat(salon.rating) < ratingFilter) return false;
            if (userLocation && distanceFilter !== "all") {
                const distance = salon.calculatedDistance;
                if (distance > parseFloat(distanceFilter)) return false;
            }
            if (searchLocation &&
                !salon.address.toLowerCase().includes(searchLocation.toLowerCase()) &&
                !salon.name.toLowerCase().includes(searchLocation.toLowerCase()) &&
                !salon.city?.toLowerCase().includes(searchLocation.toLowerCase())) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "distance" && userLocation) {
                return (a.calculatedDistance || 0) - (b.calculatedDistance || 0);
            } else if (sortBy === "rating") {
                return parseFloat(b.rating) - parseFloat(a.rating);
            }
            return 0;
        });

    const clearAllFilters = () => {
        setSelectedType(null);
        setSelectedAmenities([]);
        setRatingFilter(null);
        setDistanceFilter("all");
        setSearchLocation("");
        setSortBy("distance");
        showToastMessage("All filters cleared", "info");
    };

    const hasActiveFilters = selectedType || selectedAmenities.length > 0 || ratingFilter || distanceFilter !== "all";

    const toggleAmenity = (amenity) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    // ==================== OWNER AUTH LOGIC ====================
    const handleOwnerFormChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        if (name === "phone") {
            newValue = value.replace(/\D/g, "");
        }

        setOwnerForm(prev => ({
            ...prev,
            [name]: newValue
        }));

        let errorMsg = "";



        if (name === "email") {
            if (newValue && !/^\S+@\S+\.\S+$/.test(newValue)) {
                errorMsg = "Invalid email format";
            }
        }

        // ✅ FIX HERE
        if (name === "fullName") {
            newValue = value.replace(/[^A-Za-z\s]/g, "");
        }


        if (name === "password") {
            if (newValue && newValue.length < 8) {
                errorMsg = "Password must be at least 8 characters";
            }

            if (ownerForm.confirmPassword && newValue !== ownerForm.confirmPassword) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: "Passwords do not match"
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: ""
                }));
            }
        }

        if (name === "confirmPassword") {
            if (newValue !== ownerForm.password) {
                errorMsg = "Passwords do not match";
            }
        }

        setErrors(prev => ({
            ...prev,
            [name]: errorMsg
        }));
    };

    const getPasswordStrength = (password) => {
        if (!password) return "";

        let strength = 0;

        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 1) return "Weak";
        if (strength === 2) return "Medium";
        return "Strong";
    };

    const showTermsModalHandler = () => {
        setShowTermsModal(true);
    };

    const showPrivacyModalHandler = () => {
        setShowPrivacyModal(true);
    };

    const sendOtp = async () => {
        if (!termsAccepted) {
            showToastMessage("Please accept Terms & Conditions", "error");
            return;
        }

        if (!ownerForm.fullName || !ownerForm.email || !ownerForm.phone || !ownerForm.password || !ownerForm.confirmPassword) {
            showToastMessage("Please fill all fields", "error");
            return;
        }
        if (ownerForm.password !== ownerForm.confirmPassword) {
            showToastMessage("Passwords do not match", "error");
            return;
        }

        if (ownerForm.password.length < 8) {
            showToastMessage("Password must be at least 8 characters", "error");
            return;
        }

        if (Object.values(errors).some(err => err)) {
            showToastMessage("Please fix form errors first", "error");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(ownerForm.email)) {
            showToastMessage("Invalid email format", "error");
            return;
        }





        try {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            await register({
                fullName: ownerForm.fullName,
                email: ownerForm.email,
                phoneNumber: ownerForm.phone,
                password: ownerForm.password
            });

            setShowOtpPopup(true);
startCountdown();            setOtpCode(["", "", "", "", "", ""]);
            setOtpError("");
            showToastMessage("OTP sent to your EMAIL 📩", "success");
        } catch (err) {
            const message =
                err?.response?.data?.errorMessage ||   // ✅ correct field
                err?.response?.data?.message ||        // fallback
                err?.message ||
                "Registration failed";

            // 🔥 Optional clean message
            if (message.includes("already exists")) {
                showToastMessage("Email already registered", "error");
            } else {
                showToastMessage(message, "error");
            }
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

    useEffect(() => {
        if (showOtpPopup) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [showOtpPopup]);

    const verifyOtpAndComplete = async () => {
        const enteredOtp = otpCode.join('');

        if (enteredOtp.length !== 6) {
            setOtpError("Enter 6-digit OTP");
            return;
        }

        try {
            await verify({
                email: ownerForm.email,
                otp: enteredOtp
            });

            setShowOtpPopup(false);
            setIsOwnerModalOpen(false);
            showToastMessage("Registration successful ✅", "success");
            resetAuthModal();
            setAuthMode("login");
        } catch (err) {
            setOtpError(err || "Invalid OTP");
        }
    };

    const handleLoginClick = async () => {
        const { email, password } = ownerForm;

        if (!email || !password) {
            showToastMessage("Enter email & password", "error");
            return;
        }

        try {
            let response;
            let userData;

            if (loginRole === "OWNER") {
                response = await login({ userName: email, password });
                userData = {
                    fullName: email.split('@')[0],
                    role: "Owner"
                };
                navigate("/owner/dashboard");
            }
            else if (loginRole === "MANAGER") {
                response = await salonLogin({ userName: email, password });
                const slug = response.slug;
                if (!slug) {
                    throw new Error("Slug missing from backend");
                }
                userData = {
                    fullName: email,
                    role: "Salon Manager"
                };
                navigate(`/salon/${slug}`);
            }
            else if (loginRole === "BARBER") {
                response = await barberLogin({ userName: email, password });
                userData = {
                    fullName: email,
                    role: "Barber"
                };
                navigate("/barber/dashboard");
            }

            await getMe(); // 🔥 CRITICAL LINE

            setIsOwnerModalOpen(false);
            showToastMessage("Login successful! 🎉", "success");
            setIsOwnerModalOpen(false);
            showToastMessage(`${userData.role} login successful! 🎉`, "success");
            resetAuthModal();
        } catch (err) {
            console.error("LOGIN ERROR:", err);
            showToastMessage("Invalid username or password", "error");
        }
    };



    const resetAuthModal = () => {
        setOwnerForm({
            fullName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: ""
        });
        setOtpCode(["", "", "", "", "", ""]);
        setGeneratedOtp(null);
        setOtpError("");
        setTermsAccepted(false);
        setLoginRole("OWNER");
    };

    const openOwnerModal = (mode) => {
        setAuthMode(mode);
        resetAuthModal();
        setIsOwnerModalOpen(true);
    };

    // Terms of Service Modal Component
    const TermsModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-fadeIn" onClick={() => setShowTermsModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Terms of Service</h2>
                    <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600">Welcome to SalonFinder! By registering as a salon owner, you agree to the following terms:</p>
                    <h3 className="font-semibold text-gray-800">1. Account Responsibility</h3>
                    <p className="text-gray-600 text-sm">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                    <h3 className="font-semibold text-gray-800">2. Accurate Information</h3>
                    <p className="text-gray-600 text-sm">You agree to provide accurate, current, and complete information about your salon business during registration and throughout your use of our services.</p>
                    <h3 className="font-semibold text-gray-800">3. Salon Listings</h3>
                    <p className="text-gray-600 text-sm">You are responsible for keeping your salon information, hours, services, and pricing up to date on our platform.</p>
                    <h3 className="font-semibold text-gray-800">4. Prohibited Conduct</h3>
                    <p className="text-gray-600 text-sm">You may not use our platform for any illegal activities, spam, harassment, or to mislead customers.</p>
                    <h3 className="font-semibold text-gray-800">5. Termination</h3>
                    <p className="text-gray-600 text-sm">We reserve the right to suspend or terminate accounts that violate these terms or for any other reason at our discretion.</p>
                    <p className="text-gray-500 text-sm mt-4">Last updated: January 2024</p>
                </div>
                <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100">
                    <button onClick={() => setShowTermsModal(false)} className="w-full bg-teal-500 text-white py-2 rounded-lg font-medium hover:bg-teal-600">
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );

    // Privacy Policy Modal Component
    const PrivacyModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-fadeIn" onClick={() => setShowPrivacyModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Privacy Policy</h2>
                    <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600">At SalonFinder, we take your privacy seriously. This policy describes how we collect, use, and protect your information.</p>
                    <h3 className="font-semibold text-gray-800">1. Information We Collect</h3>
                    <p className="text-gray-600 text-sm">We collect personal information including your name, email address, phone number, and salon details when you register as an owner.</p>
                    <h3 className="font-semibold text-gray-800">2. How We Use Your Information</h3>
                    <p className="text-gray-600 text-sm">We use your information to verify your salon ownership, manage your listing, communicate with you, and improve our services.</p>
                    <h3 className="font-semibold text-gray-800">3. Data Protection</h3>
                    <p className="text-gray-600 text-sm">We implement security measures to protect your personal information from unauthorized access or disclosure.</p>
                    <h3 className="font-semibold text-gray-800">4. Information Sharing</h3>
                    <p className="text-gray-600 text-sm">We do not sell your personal information. Your salon information is shared publicly on our platform to help customers find your business.</p>
                    <h3 className="font-semibold text-gray-800">5. Your Rights</h3>
                    <p className="text-gray-600 text-sm">You have the right to access, update, or delete your account information at any time through your account settings.</p>
                    <p className="text-gray-500 text-sm mt-4">Last updated: January 2024</p>
                </div>
                <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100">
                    <button onClick={() => setShowPrivacyModal(false)} className="w-full bg-teal-500 text-white py-2 rounded-lg font-medium hover:bg-teal-600">
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );

    // Netflix-style OTP Popup Component
    // const OtpPopup = () => (
    //     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4 " onClick={() => setShowOtpPopup(false)}>
    //         <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700 transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
    //             <div className="p-8">
    //                 <div className="text-center mb-6">
    //                     <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
    //                         <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    //                         </svg>
    //                     </div>
    //                     <h2 className="text-2xl font-bold text-white mb-2">Verification Code</h2>
    //                     <p className="text-gray-400 text-sm">
    //                         We've sent a 6-digit code to<br />
    //                         <span className="text-teal-500 font-medium">{ownerForm.email}</span>
    //                     </p>
    //                 </div>

    //                 <div className="flex justify-center gap-3 mb-6">
    //                     {otpCode.map((digit, index) => (
    //                         <input
    //                             key={index}
    //                             ref={(el) => (inputRefs.current[index] = el)}
    //                             type="text"
    //                             maxLength={1}
    //                             value={otpCode[index]}
    //                             onChange={(e) => handleOtpChange(index, e)}
    //                             onKeyDown={(e) => handleKeyDown(index, e)}
    //                             className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-600 rounded-xl text-white focus:border-teal-500 focus:outline-none"
    //                         />
    //                     ))}
    //                 </div>

    //                 {otpError && (
    //                     <p className="text-red-500 text-sm text-center mb-4">{otpError}</p>
    //                 )}

    //                 <button
    //                     onClick={verifyOtpAndComplete}
    //                     className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all transform hover:scale-[1.02] shadow-lg"
    //                 >
    //                     Verify & Register
    //                 </button>

    //                 <div className="text-center mt-4">
    //                     <p className="text-gray-400 text-sm">
    //                         Didn't receive code?{" "}

    //                         <button
    //                             onClick={async () => {

    //                                 if (countdown > 0) return;

    //                                 try {

    //                                     await resendOtp({
    //                                         email: ownerForm.email
    //                                     });

    //                                     setCountdown(60);

    //                                     showToastMessage(
    //                                         "OTP resent successfully 📩",
    //                                         "success"
    //                                     );

    //                                 } catch (err) {

    //                                     showToastMessage(
    //                                         err || "Failed to resend OTP",
    //                                         "error"
    //                                     );
    //                                 }
    //                             }}

    //                             disabled={countdown > 0}

    //                             className={`font-medium transition ${countdown > 0
    //                                     ? "text-gray-500 cursor-not-allowed"
    //                                     : "text-teal-400 hover:text-teal-300"
    //                                 }`}
    //                         >

    //                             {
    //                                 countdown > 0
    //                                     ? `Resend in ${countdown}s`
    //                                     : "Resend Code"
    //                             }

    //                         </button>
    //                     </p>
    //                 </div>
    //                 <button
    //                     onClick={() => setShowOtpPopup(false)}
    //                     className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
    //                 >
    //                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    //                     </svg>
    //                 </button>
    //             </div>
    //         </div>
    //     </div>
    // );

    // Modern Registration/Login Modal
    const renderAuthModal = () => {
        const getRoleLabel = () => {
            switch (loginRole) {
                case "OWNER": return "Salon Owner";
                case "MANAGER": return "Salon Manager";
                case "BARBER": return "Barber";
                default: return "Salon Owner";
            }
        };

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn" onClick={() => setIsOwnerModalOpen(false)}>
                <div className="bg-white rounded-2xl max-w-lg w-full mx-4 sm:mx-0 shadow-2xl transform transition-all duration-300 animate-scaleUp max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                        <button
                            onClick={() => setIsOwnerModalOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-6">
                            <div className="text-center mb-5">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    {authMode === "login" ? `Welcome Back, ${getRoleLabel()}!` : "Create Account"}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    {authMode === "login"
                                        ? `Sign in to your ${getRoleLabel().toLowerCase()} account`
                                        : "Register as a salon owner"}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {authMode === "register" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Full Name</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-teal-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </span>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={ownerForm.fullName}
                                                    onChange={handleOwnerFormChange}
                                                    className="w-full pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition"
                                                    placeholder="John Doe"


                                                />

                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Email</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-teal-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={ownerForm.email}
                                                        onChange={handleOwnerFormChange}
                                                        className={`w-full pl-9 border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 transition ${errors.email ? "border-red-500" : "border-gray-200"
                                                            }`} placeholder="owner@salon.com"
                                                    />
                                                    {errors.email && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Phone</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-teal-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                    </span>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={ownerForm.phone}
                                                        onChange={handleOwnerFormChange}
                                                        className="w-full pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition"
                                                        placeholder="+1 234 567 8900"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Password</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-teal-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </span>
                                                    <input
                                                        type={showRegisterPassword ? "text" : "password"}
                                                        name="password"
                                                        value={ownerForm.password}
                                                        onChange={handleOwnerFormChange}
                                                        className={`w-full pl-9 pr-10 border rounded-lg px-3 py-2 text-sm bg-gray-50 
    focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200
    ${errors.password ? "border-red-500" : "border-gray-200"}`}
                                                        placeholder="Password"
                                                    />

                                                    {/* ✅ Error message */}
                                                    {errors.password && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors.password}
                                                        </p>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition"
                                                    >
                                                        {showRegisterPassword ? (
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

                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Confirm Password</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-teal-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    </span>
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={ownerForm.confirmPassword}
                                                        onChange={handleOwnerFormChange}
                                                        className="w-full pl-9 pr-10 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
                                                        placeholder="Confirm password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition"
                                                    >
                                                        {showConfirmPassword ? (
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
                                        {ownerForm.password && (
                                            <p className={`text-xs mt-1 ${getPasswordStrength(ownerForm.password) === "Weak"
                                                ? "text-red-500"
                                                : getPasswordStrength(ownerForm.password) === "Medium"
                                                    ? "text-yellow-500"
                                                    : "text-green-500"
                                                }`}>
                                                {getPasswordStrength(ownerForm.password)} Password
                                            </p>
                                        )}

                                        <div className="flex items-start gap-2 pt-1">
                                            <input
                                                type="checkbox"
                                                id="termsCheckbox"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-500 focus:ring-teal-200 cursor-pointer"
                                            />
                                            <label htmlFor="termsCheckbox" className="text-xs text-gray-600 cursor-pointer">
                                                I agree to the{" "}
                                                <button
                                                    type="button"
                                                    onClick={showTermsModalHandler}
                                                    className="text-teal-600 font-medium hover:underline"
                                                >
                                                    Terms of Service
                                                </button>{" "}
                                                and{" "}
                                                <button
                                                    type="button"
                                                    onClick={showPrivacyModalHandler}
                                                    className="text-teal-600 font-medium hover:underline"
                                                >
                                                    Privacy Policy
                                                </button>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {authMode === "login" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Login As</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setLoginRole("OWNER")}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${loginRole === "OWNER"
                                                        ? "bg-teal-500 text-white shadow-md"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    Owner
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLoginRole("MANAGER")}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${loginRole === "MANAGER"
                                                        ? "bg-teal-500 text-white shadow-md"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    Manager
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLoginRole("BARBER")}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${loginRole === "BARBER"
                                                        ? "bg-teal-500 text-white shadow-md"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    Barber
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                {loginRole === "OWNER" ? "Email Address" : "Username"}
                                            </label>
                                            <input
                                                type="text"
                                                name="email"
                                                value={ownerForm.email}
                                                onChange={handleOwnerFormChange}
                                                placeholder={
                                                    loginRole === "OWNER"
                                                        ? "Enter your email"
                                                        : "Enter your username"
                                                }
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={ownerForm.password}
                                                    onChange={handleOwnerFormChange}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all pr-10"
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition"
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
                                )}

                                {authMode === "register" && (
                                    <button
                                        onClick={sendOtp}
                                        disabled={loading}
                                        className={`w-full py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${loading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-teal-500 hover:bg-teal-600 text-white"
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Sending OTP...
                                            </>
                                        ) : (
                                            "Continue with OTP"
                                        )}
                                    </button>
                                )}

                                {authMode === "login" && (
                                    <button
                                        onClick={handleLoginClick}
                                        className="w-full bg-teal-500 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-600 transition-all transform hover:scale-[1.02] shadow-md"
                                    >
                                        Sign In as {getRoleLabel()}
                                    </button>
                                )}

                                <div className="text-center pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        {authMode === "login" ? (
                                            <>Don't have an account? <button onClick={() => openOwnerModal("register")} className="text-teal-600 font-medium hover:underline">Register as Owner</button></>
                                        ) : (
                                            <>Already have an account? <button onClick={() => openOwnerModal("login")} className="text-teal-600 font-medium hover:underline">Sign In</button></>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Loading state
    if (loadingSalons) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading salons...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            {/* Toast Notification */}
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

            {/* Header */}
            <header className="flex justify-between items-center px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
                        <img src={navIcon} alt="icon" className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800">SalonFinder</h1>
                </div>

                {/* Location Search - Desktop */}
                <div className="hidden md:flex gap-3 flex-1 max-w-2xl mx-8">
                    <div className="relative flex-1">
                        <input
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 pl-11 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition-all"
                            placeholder="Enter your address, zip code, or city..."
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                        />
                        <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={getUserLocationAndFindNearby}
                        disabled={isLocating}
                        className="bg-teal-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {isLocating ? "Locating..." : "Near Me"}
                    </button>
                    <button className="bg-white text-gray-700 border border-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Search
                    </button>
                </div>

                {/* Owner Auth Buttons & Status (Desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-200">
                            <span className="text-sm font-medium text-teal-700">
                                👋 {user?.fullName} ({user?.role})
                            </span>
                            <button onClick={logout} className="text-sm text-gray-600 hover:text-red-600 transition-colors">Logout</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={() => openOwnerModal("login")} className="text-teal-600 font-medium text-sm px-3 py-1.5 hover:bg-teal-50 rounded-lg transition-colors">Login</button>
                            <button onClick={() => openOwnerModal("register")} className="bg-teal-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-600 transition-all shadow-sm">Register</button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </header>

            {/* Mobile Location Search + Auth - Responsive */}
            <div className="md:hidden px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
                <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                        <input
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 pl-9 text-sm focus:outline-none focus:border-teal-400"
                            placeholder="Enter location..."
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                    </div>
                    <button className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Search
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={getUserLocationAndFindNearby}
                        disabled={isLocating}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {isLocating ? "Getting..." : "Near Me"}
                    </button>
                    {user ? (
                        <div className="flex-1 flex justify-between items-center bg-teal-50 px-3 rounded-lg border border-teal-200">
                            <span className="text-xs font-medium text-teal-700 truncate">{user?.fullName} ({user?.role})</span>
                            <button onClick={logout} className="text-xs text-red-600 ml-2">Logout</button>
                        </div>
                    ) : (
                        <>
                            <button onClick={() => openOwnerModal("login")} className="flex-1 border border-teal-500 text-teal-600 py-2 rounded-lg text-sm font-medium">Login</button>
                            <button onClick={() => openOwnerModal("register")} className="flex-1 bg-teal-500 text-white py-2 rounded-lg text-sm font-medium">Register</button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <div className="border-b border-gray-100 bg-white sticky top-[73px] md:top-[73px] z-40 shadow-sm flex-shrink-0">
                <div className="px-4 md:px-8 py-3">
                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">


                        <button
                            onClick={() => document.getElementById('distanceModal').showModal()}
                            className={`px-4 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${distanceFilter !== "all" ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
                                }`}
                        >
                            Distance {distanceFilter !== "all" && `• ${distanceFilter} mi`}
                        </button>


                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-1.5 rounded-full text-sm font-medium text-red-600 whitespace-nowrap hover:bg-red-50 transition-colors"
                            >
                                Clear All ✕
                            </button>
                        )}
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                            {selectedType && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs">
                                    {selectedType}
                                    <button onClick={() => setSelectedType(null)} className="hover:text-teal-900">×</button>
                                </span>
                            )}
                            {selectedAmenities.map(amenity => (
                                <span key={amenity} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs">
                                    {amenity}
                                    <button onClick={() => toggleAmenity(amenity)} className="hover:text-teal-900">×</button>
                                </span>
                            ))}
                            {distanceFilter !== "all" && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs">
                                    Within {distanceFilter} miles
                                    <button onClick={() => setDistanceFilter("all")} className="hover:text-teal-900">×</button>
                                </span>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Salon List */}
                <div className="hidden md:flex md:flex-col w-[480px] bg-white border-r border-gray-100 h-full overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-teal-50">
                        <h2 className="text-xl font-bold text-gray-800">
                            {filteredSalons.length} {filteredSalons.length === 1 ? 'Salon' : 'Salons'}
                            {userLocation ? ' Near You' : ' Available'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {userLocation
                                ? `Showing ${filteredSalons.length} salons within ${distanceFilter === "all" ? "your area" : `${distanceFilter} miles`}`
                                : hasActiveFilters || searchLocation
                                    ? "Filtered results from all salons"
                                    : "Click 'Near Me' to find salons around you"}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {filteredSalons.length === 0 && !loadingSalons && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📍</div>
                                <p className="text-gray-600 font-medium">No salons found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {userLocation
                                        ? `No salons within ${distanceFilter} miles of your location`
                                        : "Try clicking 'Near Me' to find salons around you"}
                                </p>
                                <button onClick={clearAllFilters} className="mt-4 text-sm text-teal-600 underline font-medium">
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {filteredSalons.map((salon) => (
                            <div
                                key={salon.id}
                                onClick={() => setSelectedSalon(salon)}
                                className={`group cursor-pointer transition-all rounded-lg border ${selectedSalon?.id === salon.id
                                    ? "border-teal-300 bg-teal-50 shadow-md"
                                    : "border-gray-200 hover:shadow-md hover:border-teal-200 bg-white"
                                    }`}
                            >
                                <div className="flex gap-4 p-4">
                                    <img
                                        src={salon.img}
                                        alt={salon.name}
                                        className="w-24 h-24 rounded-lg object-cover"
                                        onError={(e) => {
                                            e.target.src = DEFAULT_SALON_IMAGE;
                                        }}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors truncate text-base">
                                                {salon.name}
                                            </h3>
                                        </div>

                                        {/* Address with teal icon */}
                                        <div className="flex items-start gap-1.5 mb-2">
                                            <svg className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-xs text-gray-600 flex-1 line-clamp-2">{salon.address}</p>
                                        </div>

                                        {/* Contact Information - Phone & Email */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {/* Phone */}
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {salon.phone && salon.phone !== "N/A" ? (
                                                    <a
                                                        href={`tel:${salon.phone}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-xs text-gray-700 hover:text-teal-600 hover:underline transition-colors truncate"
                                                    >
                                                        {salon.phone}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No phone</span>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {salon.email && salon.email !== "N/A" ? (
                                                    <a
                                                        href={`mailto:${salon.email}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-xs text-gray-700 hover:text-teal-600 hover:underline transition-colors truncate"
                                                    >
                                                        {salon.email.length > 20 ? `${salon.email.substring(0, 20)}...` : salon.email}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No email</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hours and Directions */}
                                        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                {/* Hours icon - also teal */}
                                                <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-xs text-gray-600">
                                                    {salon.hours || "Contact for hours"}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    getDirections(salon);
                                                }}
                                                className="bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-teal-600 transition-colors flex items-center gap-1 shadow-sm"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                                Directions
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Bottom Sheet */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="sticky top-0 bg-teal-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800">{filteredSalons.length} Salons Nearby</h3>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl text-gray-500">&times;</button>
                            </div>
                            <div className="p-4 space-y-3">
                                {filteredSalons.map((salon) => (
                                    <div
                                        key={salon.id}
                                        onClick={() => {
                                            setSelectedSalon(salon);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex gap-3 p-3 rounded-lg border border-gray-200 bg-white"
                                    >
                                        <img
                                            src={salon.img}
                                            alt={salon.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                            onError={(e) => {
                                                e.target.src = DEFAULT_SALON_IMAGE;
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800">{salon.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{salon.address}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {userLocation && salon.calculatedDistance
                                                    ? `${salon.calculatedDistance.toFixed(1)} miles • ${salon.rating}★`
                                                    : `${salon.distance} • ${salon.rating}★`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Map Panel */}
                <div className="flex-1 relative bg-gray-100">
                    {filteredSalons.length > 0 ? (
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {filteredSalons.map((salon) => (
                                <Marker
                                    key={salon.id}
                                    position={[salon.lat, salon.lng]}
                                    eventHandlers={{
                                        click: () => setSelectedSalon(salon),
                                    }}
                                >
                                    <Popup>
                                        <div className="px-2 py-1">
                                            <p className="font-semibold text-gray-800 text-sm">{salon.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{salon.address}</p>
                                            <button
                                                onClick={() => getDirections(salon)}
                                                className="mt-2 text-xs bg-teal-500 text-white px-3 py-1 rounded-lg w-full"
                                            >
                                                🗺️ Get Directions
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🗺️</div>
                                <p className="text-gray-600">No salons to display on map</p>
                            </div>
                        </div>
                    )}

                    {/* Mobile View List Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-5 py-2 rounded-full text-sm font-medium shadow-lg border border-gray-200 z-10"
                    >
                        📋 View List ({filteredSalons.length})
                    </button>

                    {/* Selected Salon Card */}
                    {selectedSalon && (
                        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-white rounded-lg shadow-xl p-4 w-auto md:w-96 animate-slide-up z-10 border border-gray-200">
                            <div className="flex gap-3">
                                <img
                                    src={selectedSalon.img}
                                    alt={selectedSalon.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                    onError={(e) => {
                                        e.target.src = DEFAULT_SALON_IMAGE;
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">{selectedSalon.name}</h4>
                                        <button
                                            onClick={() => setSelectedSalon(null)}
                                            className="text-gray-400 hover:text-gray-600 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-amber-500 text-xs">★</span>
                                        <span className="text-xs font-medium text-gray-700">{selectedSalon.rating}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">
                                            {userLocation && selectedSalon.calculatedDistance
                                                ? `${selectedSalon.calculatedDistance.toFixed(1)} miles`
                                                : selectedSalon.distance}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedSalon.address}</p>
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            onClick={() => getDirections(selectedSalon)}
                                            className="flex-1 bg-teal-500 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-teal-600 transition-colors"
                                        >
                                            🗺️ Directions
                                        </button>
                                        {selectedSalon.phone && (
                                            <button
                                                onClick={() => callSalon(selectedSalon.phone)}
                                                className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                📞 Call
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Location indicator */}
                    {userLocation && (
                        <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-1.5 shadow-md z-10 text-xs text-gray-600">
                            📍 Using your location
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <dialog id="typeModal" className="rounded-lg p-0 backdrop:bg-black/30 border-none">
                <div className="w-[90vw] max-w-md bg-white rounded-lg">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-semibold text-gray-800">Salon Type</h3>
                        <button onClick={() => document.getElementById('typeModal').close()} className="text-2xl text-gray-500">&times;</button>
                    </div>
                    <div className="p-4 space-y-2">
                        {propertyTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => {
                                    setSelectedType(type === "All" ? null : type);
                                    document.getElementById('typeModal').close();
                                }}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${(type === "All" && !selectedType) || selectedType === type
                                    ? 'bg-teal-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </dialog>

            <dialog id="amenitiesModal" className="rounded-lg p-0 backdrop:bg-black/30 border-none">
                <div className="w-[90vw] max-w-md bg-white rounded-lg">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-semibold text-gray-800">Amenities</h3>
                        <button onClick={() => document.getElementById('amenitiesModal').close()} className="text-2xl text-gray-500">&times;</button>
                    </div>
                    <div className="p-4 space-y-2">
                        {amenitiesList.map(amenity => (
                            <label key={amenity} className="flex items-center gap-3 p-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedAmenities.includes(amenity)}
                                    onChange={() => toggleAmenity(amenity)}
                                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-200"
                                />
                                <span className="text-gray-700">{amenity}</span>
                            </label>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => document.getElementById('amenitiesModal').close()}
                            className="w-full bg-teal-500 text-white py-2 rounded-lg font-medium hover:bg-teal-600"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="distanceModal" className="rounded-lg p-0 backdrop:bg-black/30 border-none">
                <div className="w-[90vw] max-w-md bg-white rounded-lg">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-semibold text-gray-800">Distance</h3>
                        <button onClick={() => document.getElementById('distanceModal').close()} className="text-2xl text-gray-500">&times;</button>
                    </div>
                    <div className="p-4 space-y-2">
                        {distanceOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setDistanceFilter(option.value);
                                    document.getElementById('distanceModal').close();
                                }}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${distanceFilter === option.value
                                    ? 'bg-teal-500 text-white'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </dialog>

            <dialog id="ratingModal" className="rounded-lg p-0 backdrop:bg-black/30 border-none">
                <div className="w-[90vw] max-w-md bg-white rounded-lg">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-semibold text-gray-800">Minimum Rating</h3>
                        <button onClick={() => document.getElementById('ratingModal').close()} className="text-2xl text-gray-500">&times;</button>
                    </div>
                    <div className="p-4 space-y-2">
                        {[4, 4.5, 4.8].map(rating => (
                            <button
                                key={rating}
                                onClick={() => {
                                    setRatingFilter(ratingFilter === rating ? null : rating);
                                    document.getElementById('ratingModal').close();
                                }}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${ratingFilter === rating
                                    ? 'bg-teal-500 text-white'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                ★ {rating}+ stars
                            </button>
                        ))}
                    </div>
                </div>
            </dialog>

            {/* Owner Auth Modal */}
            {isOwnerModalOpen && renderAuthModal()}

            {/* Netflix-style OTP Popup */}
            {/* {showOtpPopup && <OtpPopup />} */}
<OtpPopup
    show={showOtpPopup}
    email={ownerForm.email}
    otpCode={otpCode}
    setOtpCode={setOtpCode}
    otpError={otpError}
    verifyOtpAndComplete={verifyOtpAndComplete}
    resendOtp={resendOtp}
    countdown={countdown}
    startCountdown={startCountdown}
    setShowOtpPopup={setShowOtpPopup}
    showToastMessage={showToastMessage}
/>
            {/* Terms and Privacy Modals */}
            {showTermsModal && <TermsModal />}
            {showPrivacyModal && <PrivacyModal />}

            <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        dialog::backdrop {
          background: rgba(0, 0, 0, 0.3);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
}
