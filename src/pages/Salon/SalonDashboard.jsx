import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSalon } from "../../hooks/useSalon";
import {
    getServicesBySalon,
    createService,
    updateService,
    deleteServiceById,
} from "../../services/serviceService";
import {
    getBarbersBySalon,
    createBarber,
    updateBarber,
    deleteBarberById,
    updateBarberStatus
} from "../../services/barberService";
import { deleteBookingService } from "../../services/bookingService"
import { useAuthContext } from "../../context/AuthContext";
import { useMemo } from "react";
import LocationPicker from "../../components/LocationPicker";





const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-teal-500 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <i className="fas fa-times w-5 h-5"></i>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


export default function SalonDashboard() {
    const BASE_URL = "http://localhost:1009";

    const [isLocating, setIsLocating] = useState(false);
    const { slug } = useParams();
    const [openBarber, setOpenBarber] = useState(null);
    const { salon, fetchSalonBySlug, updateSalonData, fetchBookings } = useSalon();
    const salonId = salon?.id;
    const imageUrl = salon?.imageUrl
        ? `${BASE_URL}${salon.imageUrl}`
        : null;
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAddBarberModal, setShowAddBarberModal] = useState(false);
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [showEditSalonModal, setShowEditSalonModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [pendingSalonData, setPendingSalonData] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [unavailableBarber, setUnavailableBarber] = useState(null);
    const [transferTargetBarber, setTransferTargetBarber] = useState("");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [editingBarber, setEditingBarber] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editingFieldLabel, setEditingFieldLabel] = useState("");
    const [fieldValue, setFieldValue] = useState("");
    const [pendingFieldData, setPendingFieldData] = useState(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const { logout } = useAuthContext();
    const [selectedDate, setSelectedDate] = useState(
        new Date().toLocaleDateString("en-CA")
    );



    const [tempLat, setTempLat] = useState("");
    const [tempLng, setTempLng] = useState("");
    const [barbers, setBarbers] = useState([]);
    const [customers, setCustomers] = useState([]);
    // State for tokens
    const [copied, setCopied] = useState(false);
    const [showToast, setShowToast] = useState(null);

    // State variables
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    //  const [mapPreviewUrl, setMapPreviewUrl] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [locationResults, setLocationResults] = useState([]);
    const [settingsErrors, setSettingsErrors] = useState({
        email: "",
        username: "",
        password: "",
        timing: ""

    });
    const [editedData, setEditedData] = useState({
        name: "",
        address: "",
        city: "",
        country: "",
        salonPhoneNumber: "",
        salonEmail: "",
        salonUserName: "",
        password: "",
        openingTime: "",
        closingTime: "",
        latitude: "",
        longitude: "",
        imageFile: null,
        imagePreview: null
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,20}$/;

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;

        // 👉 UPDATE STATE FIRST
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "openingTime" || name === "closingTime") {
            const open = name === "openingTime" ? value : editedData.openingTime;
            const close = name === "closingTime" ? value : editedData.closingTime;

            if (open && close) {
                if (open >= close) {
                    setSettingsErrors(prev => ({
                        ...prev,
                        timing: "Closing time must be after opening time"
                    }));
                } else {
                    setSettingsErrors(prev => ({
                        ...prev,
                        timing: ""
                    }));
                }
            }
        }
        // 📧 EMAIL
        if (name === "salonEmail") {
            const valid = emailRegex.test(value);
            setSettingsErrors(prev => ({
                ...prev,
                email: valid ? "" : "Invalid email format"
            }));
        }

        // 👤 USERNAME
        if (name === "salonUserName") {
            const valid = usernameRegex.test(value);
            setSettingsErrors(prev => ({
                ...prev,
                username: valid
                    ? ""
                    : "Must include letter, number & special character"
            }));
        }

        // 🔐 PASSWORD
        if (name === "password") {
            if (value.length < 8) {
                setSettingsErrors(prev => ({
                    ...prev,
                    password: "Password must be at least 8 characters"
                }));
            } else {
                setSettingsErrors(prev => ({
                    ...prev,
                    password: ""
                }));
            }
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return "";

        if (password.length < 6) return "Weak";

        const hasLetters = /[A-Za-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[@$!%*?&]/.test(password);

        if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
            return "Strong";
        }

        return "Medium";
    };

   const handleDelete = async (id) => {
  // 🔥 1. instant UI update
  setCustomers(prev => prev.filter(c => c.id !== id));

  try {
    await deleteBookingService(id);

    // ✅ 2. success message
    showToastMessage("Booking deleted successfully", "success");

    // ✅ 3. optional sync (silent refresh)
    fetchBookings(salon?.id, selectedDate);

  } catch (err) {
    // ❌ rollback if API fails
    fetchBookings(salon?.id, selectedDate);

    showToastMessage(
      err?.errorMessage || "Delete failed",
      "error"
    );
  }
};

    const searchLocation = async (query) => {
        if (!query || query.length < 3) {
            setLocationResults([]);
            return;
        }

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
                {
                    headers: {
                        "User-Agent": "salon-app"
                    }
                }
            );

            const data = await res.json();
            setLocationResults(data);

        } catch (err) {
            console.error("Location search error", err);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            searchLocation(locationQuery);
        }, 500); // debounce

        return () => clearTimeout(delay);
    }, [locationQuery]);

    // const handleSelectLocation = (place) => {
    //     const lat = parseFloat(place.lat);
    //     const lon = parseFloat(place.lon);

    //     setEditedData({
    //         ...editedData,
    //         latitude: lat,
    //         longitude: lon,
    //         city: place.address?.city || place.display_name,
    //         country: place.address?.country || "",
    //     });

    //     //   updateMapPreview(lat, lon);

    //     setLocationResults([]); // close dropdown
    // };

    // Update map preview function
    // const updateMapPreview = (lat, lng) => {
    //     const latitude = parseFloat(lat) || 37.7749;
    //     const longitude = parseFloat(lng) || -122.4194;
    //     const url = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;
    //     setMapPreviewUrl(url);
    // };

    // Initialize edit mode

    const handleSelectLocation = (place) => {
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);

        // ✅ update input text
        setLocationQuery(place.display_name);

        // ✅ update state safely
        setEditedData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            city: place.address?.city || place.display_name,
            country: place.address?.country || "",
        }));

        // ✅ close dropdown
        setLocationResults([]);
    };

    const handleEditMode = () => {
        setEditedData({
            name: salon.name || "",
            address: salon.address || "",
            city: salon.city || "San Francisco",
            country: salon.country || "United States",
            salonPhoneNumber: salon.salonPhoneNumber || "",
            salonEmail: salon.salonEmail || "",
            salonUserName: salon.salonUserName || "salon_admin",
            password: "",
            openingTime: salon.openingTime || "09:00",
            closingTime: salon.closingTime || "20:00",
            latitude: salon.latitude || "37.7749",
            longitude: salon.longitude || "-122.4194",
            imageFile: null,
            imagePreview: null
        });
        // Initialize map preview
        //  updateMapPreview(salon.latitude || "37.7749", salon.longitude || "-122.4194");
        setEditedData(prev => ({
            ...prev,
            latitude: salon.latitude,
            longitude: salon.longitude
        }));
        setIsEditing(true);
    };

    useEffect(() => {
        const close = () => setLocationResults([]);
        window.addEventListener("click", close);

        return () => window.removeEventListener("click", close);
    }, []);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const data = await fetchBookings(salon?.id, selectedDate); // 🔥 pass date

                const formatted = data.map(b => ({
                    id: b.id,
                    name: b.customerName,
                    phone: b.customerPhone,
                    service: b.services?.join(", "),
                    barber: b.barbers?.join(", "),
                    queue: b.queueNumbers?.join(", "),
                    date: new Date(b.startTime).toLocaleDateString(),
                    time: new Date(b.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    }),
                    status: b.status
                }));

                setCustomers(formatted);

            } catch (err) {
                console.error("Failed to load bookings", err);
            }
        };

        if (salon?.id) {
            loadBookings();
        }

    }, [salon?.id, selectedDate]); // 🔥 ADD selectedDate

    // Cancel edit mode
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedData({});
        setMapPreviewUrl("");
    };

    // Get current location
    // const getCurrentLocation = () => {
    //     if (navigator.geolocation) {
    //         // Show loading state
    //         const button = document.activeElement;
    //         if (button) button.disabled = true;

    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 const lat = position.coords.latitude.toString();
    //                 const lng = position.coords.longitude.toString();
    //                 setEditedData({
    //                     ...editedData,
    //                     latitude: lat,
    //                     longitude: lng
    //                 });
    //                 updateMapPreview(lat, lng);
    //                 showToast("Current location detected! Don't forget to save changes.", "success");
    //                 if (button) button.disabled = false;
    //             },
    //             (error) => {
    //                 console.error("Error getting location:", error);
    //                 let errorMessage = "Failed to get current location";
    //                 switch (error.code) {
    //                     case error.PERMISSION_DENIED:
    //                         errorMessage = "Please allow location access to use this feature";
    //                         break;
    //                     case error.POSITION_UNAVAILABLE:
    //                         errorMessage = "Location information is unavailable";
    //                         break;
    //                     case error.TIMEOUT:
    //                         errorMessage = "Location request timed out";
    //                         break;
    //                 }
    //                 showToast(errorMessage, "error");
    //                 if (button) button.disabled = false;
    //             },
    //             {
    //                 enableHighAccuracy: true,
    //                 timeout: 10000,
    //                 maximumAge: 0
    //             }
    //         );
    //     } else {
    //         showToast("Geolocation is not supported by this browser", "error");
    //     }
    // };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true); // 🔥 START LOADING

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setEditedData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }));

                //  updateMapPreview(lat, lng);
                setEditedData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }));

                setIsLocating(false); // ✅ STOP LOADING
            },
            (error) => {
                setIsLocating(false);

                if (error.code === 1) {
                    alert("Permission denied. Please allow location access.");
                } else if (error.code === 2) {
                    alert("Location unavailable.");
                } else {
                    alert("Something went wrong while fetching location.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    };

    // Handle image upload
    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showToast("Image size should be less than 5MB", "error");
                    return;
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showToast("Please select a valid image file", "error");
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    setEditedData({
                        ...editedData,
                        imageFile: file,
                        imagePreview: reader.result
                    });
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    // Save all changes at once
    const handleSaveAllChanges = async () => {
        setIsSaving(true);

        try {
            const updatedData = {};

            if (editedData.name !== salon.name) updatedData.name = editedData.name;
            if (editedData.address !== salon.address) updatedData.address = editedData.address;
            if (editedData.city !== salon.city) updatedData.city = editedData.city;
            if (editedData.country !== salon.country) updatedData.country = editedData.country;
            if (editedData.salonPhoneNumber !== salon.salonPhoneNumber) updatedData.salonPhoneNumber = editedData.salonPhoneNumber;
            if (editedData.salonEmail !== salon.salonEmail) updatedData.salonEmail = editedData.salonEmail;
            if (editedData.salonUserName !== salon.salonUserName) updatedData.salonUserName = editedData.salonUserName;

            if (editedData.password && editedData.password.trim() !== "") {
                updatedData.password = editedData.password;
            }

            if (editedData.openingTime !== salon.openingTime) updatedData.openingTime = editedData.openingTime;
            if (editedData.closingTime !== salon.closingTime) updatedData.closingTime = editedData.closingTime;

            if (editedData.latitude !== salon.latitude) updatedData.latitude = parseFloat(editedData.latitude);
            if (editedData.longitude !== salon.longitude) updatedData.longitude = parseFloat(editedData.longitude);

            // ❗ Nothing changed
            if (Object.keys(updatedData).length === 0 && !editedData.imageFile) {
                alert("No changes to save");
                setIsEditing(false);
                return;
            }

            // 🔥 CREATE FORMDATA (IMPORTANT)
            const formData = new FormData();

            formData.append(
                "data",
                new Blob([JSON.stringify(updatedData)], {
                    type: "application/json",
                })
            );

            if (editedData.imageFile) {
                formData.append("image", editedData.imageFile);
            }

            // 🔥 CALL YOUR HOOK API
            await updateSalonData(salon.id, formData);
            await fetchSalonBySlug(slug);

            alert("Salon updated successfully");

            setIsEditing(false);
            setEditedData({});
            setMapPreviewUrl("");

        }
        catch (err) {
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
        } finally {
            setIsSaving(false);
        }
    };



    // Toast notification helper
    const showToastMessage = (message, type = "success") => {
        setShowToast({ message, type });
        setTimeout(() => setShowToast(null), 3000);
    };


    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Hide after 2 seconds
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    useEffect(() => {
        if (slug) {
            fetchSalonBySlug(slug);
        }
    }, [slug]);




    const [newBarber, setNewBarber] = useState({ fullName: "", email: "", phone: "", username: "", password: "", role: "", experience: "", image: null, serviceIds: [] });
    const [newService, setNewService] = useState({ name: "", price: "", duration: "", category: "", description: "" });
    const [newCustomer, setNewCustomer] = useState({ name: "", service: "", barber: "", barberId: "", time: "", date: "", phone: "" });
    const [editingService, setEditingService] = useState(null);


    const [showRegisterDeviceModal, setShowRegisterDeviceModal] = useState(false);
    const [showDeviceCodeModal, setShowDeviceCodeModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: "", type: "Tablet" });
    const [generatedDeviceCode, setGeneratedDeviceCode] = useState("");
    const [barberErrors, setBarberErrors] = useState({
        fullName: "",
        phone: "",
        email: "",
        username: "",
        password: ""
    });



    // Analytics data
    const analytics = useMemo(() => ({
        weeklyBookings: [28, 32, 35, 42, 48, 55, 62],

        topServices: services.map(s => ({
            name: s.name,
            bookings: Math.floor((s.popularity || 0) * 0.8)
        })),

        revenueByService: services.map(s => ({
            name: s.name,
            revenue: (s.price || 0) * 10
        })),

        barberPerformance: barbers.map(b => ({
            name: b.name,
            completedBookings: Math.floor(Math.random() * 50) + 20,
            rating: b.rating
        }))
    }), [services, barbers]);

    // Handle barber availability toggle with transfer logic
    const toggleBarberAvailability = (barberId) => {
        const barber = barbers.find(b => b.id === barberId);
        if (barber.status === "AVAILABLE") {
            // Making unavailable - check for existing bookings
            const affectedBookings = customers.filter(c => c.barberId === barberId && c.date >= new Date().toISOString().split('T')[0] && c.status !== 'completed');
            if (affectedBookings.length > 0) {
                setUnavailableBarber(barber);
                setShowTransferModal(true);
                return;
            }
        }
        setBarbers(barbers.map(b => b.id === barberId ? { ...b, available: !b.available } : b));
    };

    const handleEditLocation = () => {
        setTempLat(salon.latitude || "37.7749");
        setTempLng(salon.longitude || "-122.4194");
        setShowLocationModal(true);
    };

    const handleLocationUpdate = () => {
        if (!tempLat || !tempLng) {
            alert("Please enter both latitude and longitude");
            return;
        }

        // Generate OTP for location update
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        alert(`Demo OTP sent to ${salon.email}: ${generatedOtp}`);

        setPendingFieldData({
            field: "location",
            value: { lat: tempLat, lng: tempLng }
        });
        setShowLocationModal(false);
        setShowOtpModal(true);
    };




    const handleTransferBookings = () => {
        if (transferTargetBarber && unavailableBarber) {
            setCustomers(customers.map(c =>
                c.barberId === unavailableBarber.id && c.date >= new Date().toISOString().split('T')[0] && c.status !== 'completed'
                    ? { ...c, barber: barbers.find(b => b.id === parseInt(transferTargetBarber)).name, barberId: parseInt(transferTargetBarber) }
                    : c
            ));
            setBarbers(barbers.map(b =>
                b.id === unavailableBarber.id ? { ...b, available: false } : b
            ));
            setShowTransferModal(false);
            setUnavailableBarber(null);
            setTransferTargetBarber("");
        }
    };


    const handleUpdateBarber = async () => {
        try {
            await updateBarber(editingBarber.id, editingBarber);
            fetchBarbers();
            setEditingBarber(null);
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
    // const handleAddBarber = async () => {
    //     try {
    //         await createBarber({
    //             ...newBarber,
    //             salonId: salonId
    //         });

    //         fetchBarbers();

    //         // reset form
    //         setNewBarber({
    //             fullName: "",
    //             email: "",
    //             phone: "",
    //             username: "",
    //             password: "",
    //             role: "",
    //             experience: "",
    //             image: null,
    //             serviceIds: []   // ✅ ADD THIS

    //         });

    //         setShowAddBarberModal(false);

    //     }  catch (err) {
    //   const message =
    //     err?.response?.data?.errorMessage ||   // ✅ correct field
    //     err?.response?.data?.message ||        // fallback
    //     err?.message ||
    //     "Registration failed";

    //   // 🔥 Optional clean message
    //   if (message.includes("already exists")) {
    //     showToastMessage("username already registered", "error");
    //   } else {
    //     showToastMessage(message, "error");
    //   }
    // }
    // };

    const handleAddBarber = async () => {

        let errors = {};

        // 🔥 REQUIRED VALIDATION
        if (!newBarber.fullName.trim()) {
            errors.fullName = "Name is required";
        }

        if (!newBarber.email.trim()) {
            errors.email = "Email is required";
        }

        if (!newBarber.username.trim()) {
            errors.username = "Username is required";
        }

        if (!newBarber.password.trim()) {
            errors.password = "Password is required";
        }

        // 🔥 SET ERRORS
        if (Object.keys(errors).length > 0) {
            setBarberErrors(prev => ({ ...prev, ...errors }));
            return;
        }

        try {
            await createBarber({
                ...newBarber,
                salonId: salonId
            });

            fetchBarbers();

            setNewBarber({
                fullName: "",
                email: "",
                phone: "",
                username: "",
                password: "",
                role: "",
                experience: "",
                image: null,
                serviceIds: []
            });

            setShowAddBarberModal(false);

        } catch (err) {
            const message =
                err?.response?.data?.errorMessage ||
                err?.response?.data?.message ||
                err?.message ||
                "Registration failed";

            if (message.includes("already exists")) {
                showToastMessage("username already registered", "error");
            } else {
                showToastMessage(message, "error");
            }
        }
    };
    const handleAddService = async () => {
        try {
            await createService({
                ...newService,
                salonId: salonId
            });

            fetchServices(); // refresh list
            setShowAddServiceModal(false);

        } catch (err) {
            console.error(err);
            alert("Failed to add service");
        }
    };

    const handleUpdateService = async () => {
        try {
            await updateService(editingService.id, editingService);
            fetchServices();
            setEditingService(null);
        } catch (err) {
            console.error(err);
            alert("Update failed");
        }
    };

    useEffect(() => {
        if (salonId) {
            fetchServices();
        }
    }, [salonId]);

    const fetchBarbers = async () => {
        try {
            const data = await getBarbersBySalon(salonId);
            console.log("BARBERS DATA 👉", data);

            setBarbers(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (salonId) {
            fetchBarbers();
        }
    }, [salonId]);

    const fetchServices = async () => {
        try {
            const data = await getServicesBySalon(salonId); // ✅ CORRECT
            setServices(data);
        } catch (err) {
            console.error(err);
        }
    };


    const deleteBarber = async (id) => {
        try {
            await deleteBarberById(id);
            fetchBarbers();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const deleteService = async (id) => {
        try {
            await deleteServiceById(id);
            fetchServices();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const updateCustomerStatus = (id, status) => {
        setCustomers(customers.map(customer =>
            customer.id === id ? { ...customer, status } : customer
        ));
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = "/"; // 🔥 redirect to home
    };

    const handleBarberChange = (e, isEdit = false) => {
        const { name, value } = e.target;

        let updatedValue = value;

        // 📞 PHONE → allow only numbers (NO length validation)
        if (name === "phone") {
            updatedValue = value.replace(/\D/g, ""); // remove alphabets
        }

        // 👉 UPDATE STATE FIRST (IMPORTANT)
        if (isEdit) {
            setEditingBarber(prev => ({ ...prev, [name]: updatedValue }));
        } else {
            setNewBarber(prev => ({ ...prev, [name]: updatedValue }));
        }

        // 👉 VALIDATION (DISPLAY ONLY)

        // 📧 EMAIL
        if (name === "email") {
            const valid = emailRegex.test(updatedValue);
            setBarberErrors(prev => ({
                ...prev,
                email: valid ? "" : "Invalid email format"
            }));
        }

        // 👤 USERNAME (WITH SPECIAL CHAR REQUIRED)
        if (name === "username") {
            const valid = usernameRegex.test(updatedValue);
            setBarberErrors(prev => ({
                ...prev,
                username: valid
                    ? ""
                    : "Username must include letters, numbers & special character"
            }));
        }

        // 🔐 PASSWORD (MIN 8 + STRENGTH)
        if (name === "password") {
            if (updatedValue.length < 8) {
                setBarberErrors(prev => ({
                    ...prev,
                    password: "Password must be at least 8 characters"
                }));
            } else {
                setBarberErrors(prev => ({
                    ...prev,
                    password: ""
                }));
            }
        }
    };





    // Modal Component

    return (

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

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


            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
            >
                <i className={`${sidebarOpen ? 'fas fa-times' : 'fas fa-bars'} w-6 h-6`}></i>
            </button>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >

                {/* Brand */}
                <div className="p-6 border-b border-gray-100">

                    <div className="flex items-center gap-3">



                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                Salon Manager
                            </h2>
                            <p className="text-xs text-gray-500">
                                Management Dashboard
                            </p>
                        </div>

                    </div>

                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">

                    {[
                        { id: "overview", label: "Overview", icon: "fas fa-chart-bar" },
                        { id: "services", label: "Services", icon: "fas fa-cut" },
                        { id: "barbers", label: "Barbers", icon: "fas fa-users" },
                        { id: "customers", label: "Customers", icon: "fas fa-calendar" },
                        { id: "devices", label: "Devices", icon: "fas fa-tablet-alt" },
                        {
                            id: "deviceconnect", label: "Connect Device", icon: "fas fa-tablet-alt"
                        },
                        { id: "settings", label: "Settings", icon: "fas fa-cog" },
                    ].map((item) => {

                        const active = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === "deviceconnect") {
                                        window.open(`/device/pair`, "_blank");
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }} className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
          
          ${active
                                        ? "bg-teal-50 text-teal-600 shadow-sm"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }
          
          `}
                            >

                                {/* Active indicator */}
                                {active && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r"></div>
                                )}

                                <i
                                    className={`${item.icon} ${active ? "text-teal-600" : "text-gray-400"
                                        }`}
                                ></i>

                                <span>{item.label}</span>

                            </button>
                        );
                    })}

                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">

                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>

                </div>

            </div>

            {/* Main Content */}
            <div className="lg:ml-72 p-6">



                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <>
                        {/* Welcome Header */}
                        <div className="mb-4">
                            <h1 className="text-lg font-bold text-gray-800">Welcome to Your Salon Dashboard</h1>
                            <p className="text-xs text-gray-600">Complete these 4 steps to start accepting bookings</p>
                        </div>

                        {/* All Steps Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            {/* Step 1 Card */}
                            <div className={`rounded-lg border p-3 text-center transition-all ${services.length > 0 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 ${services.length > 0 ? 'bg-green-500 text-white' : 'bg-teal-500 text-white'
                                    }`}>
                                    {services.length > 0 ? '✓' : '1'}
                                </div>
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Create Services</h3>
                                <p className="text-xs text-gray-500 mb-2">Add haircut, shave, etc.</p>
                                {services.length > 0 ? (
                                    <p className="text-xs text-green-600">{services.length} service{services.length !== 1 ? 's' : ''}</p>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab("services")}
                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        Add Service →
                                    </button>
                                )}
                            </div>

                            {/* Step 2 Card */}
                            <div className={`rounded-lg border p-3 text-center transition-all ${barbers.length > 0 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 ${barbers.length > 0 ? 'bg-green-500 text-white' : 'bg-teal-500 text-white'
                                    }`}>
                                    {barbers.length > 0 ? '✓' : '2'}
                                </div>
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Add Barbers</h3>
                                <p className="text-xs text-gray-500 mb-2">Add your staff members</p>
                                {barbers.length > 0 ? (
                                    <p className="text-xs text-green-600">{barbers.length} barber{barbers.length !== 1 ? 's' : ''}</p>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab("barbers")}
                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        Add Barber →
                                    </button>
                                )}
                            </div>

                            {/* Step 3 Card */}
                            <div className={`rounded-lg border p-3 text-center transition-all ${barbers.some(b => b.services?.length > 0) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 ${barbers.some(b => b.services?.length > 0) ? 'bg-green-500 text-white' : 'bg-teal-500 text-white'
                                    }`}>
                                    {barbers.some(b => b.services?.length > 0) ? '✓' : '3'}
                                </div>
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Assign Services</h3>
                                <p className="text-xs text-gray-500 mb-2">Match services with barbers</p>
                                {barbers.some(b => b.services?.length > 0) ? (
                                    <p className="text-xs text-green-600">Assigned ✓</p>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab("barbers")}
                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                        disabled={services.length === 0 || barbers.length === 0}
                                    >
                                        {services.length === 0 || barbers.length === 0 ? 'Waiting...' : 'Assign →'}
                                    </button>
                                )}
                            </div>

                            {/* Step 4 Card */}
                            <div
                                className={`rounded-lg border p-3 text-center transition-all ${salon?.deviceCode
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-200"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 ${salon?.deviceCode
                                        ? "bg-green-500 text-white"
                                        : "bg-teal-500 text-white"
                                        }`}
                                >
                                    {salon?.deviceCode ? "✓" : "4"}
                                </div>

                                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                    Connect Tablet
                                </h3>

                                <p className="text-xs text-gray-500 mb-2">
                                    Generate code for tablet
                                </p>

                                {salon?.deviceCode ? (
                                    <div className="flex items-center justify-center gap-1">
                                        <code className="text-xs font-mono text-teal-600">
                                            {salon.deviceCode}
                                        </code>

                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(salon.deviceCode);
                                                alert("Code copied!");
                                            }}
                                            className="text-xs text-teal-600 hover:text-teal-700"
                                        >
                                            <i className="fas fa-copy"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab("devices")}
                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                        disabled={
                                            services.length === 0 ||
                                            barbers.length === 0 ||
                                            !barbers.some((b) => b.services?.length > 0)
                                        }
                                    >
                                        Generate →
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Detailed Steps (Only show incomplete steps) */}
                        <div className="space-y-2">
                            {/* Step 1 Details - Only if incomplete */}
                            {services.length === 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">Start by creating your services</p>
                                                <p className="text-xs text-gray-600">Services like Haircut, Shave, Beard Trim, etc.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("services")}
                                            className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
                                        >
                                            Create Service
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2 Details - Only if incomplete */}
                            {services.length > 0 && barbers.length === 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">Add your barbers/staff</p>
                                                <p className="text-xs text-gray-600">Add the professionals who will provide services</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("barbers")}
                                            className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
                                        >
                                            Add Barber
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3 Details - Only if incomplete */}
                            {services.length > 0 && barbers.length > 0 && !barbers.some(b => b.services?.length > 0) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">Assign services to barbers</p>
                                                <p className="text-xs text-gray-600">Tell us which services each barber can perform</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("barbers")}
                                            className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
                                        >
                                            Assign Now
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4 Details - Only if incomplete */}
                            {services.length > 0 && barbers.length > 0 && barbers.some(b => b.services?.length > 0) && !salon.deviceCode && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">Connect your tablet</p>
                                                <p className="text-xs text-gray-600">Generate a code to connect your salon tablet</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("devices")}
                                            className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
                                        >
                                            Generate Code
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Completion Message */}
                        {services.length > 0 && barbers.length > 0 &&
                            barbers.some(b => b.services?.length > 0) && salon.deviceCode && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 text-center">
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                        <i className="fas fa-check-circle text-green-500 text-lg"></i>
                                        <span className="font-semibold text-gray-800">All steps completed! 🎉</span>
                                        <span className="text-sm text-gray-600">Your salon is ready to accept bookings.</span>
                                        <button
                                            onClick={() => setActiveTab("bookings")}
                                            className="ml-2 px-4 py-1.5 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                                        >
                                            Create First Booking
                                        </button>
                                    </div>
                                </div>
                            )}
                    </>
                )}

                {/* Services Tab */}
                {activeTab === "services" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Services</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Manage your service offerings</p>
                            </div>
                            <button
                                onClick={() => {
                                    setNewService({
                                        name: "",
                                        price: "",
                                        duration: "",
                                        category: "",
                                        description: ""
                                    });
                                    setShowAddServiceModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-200 text-sm font-medium"
                            >
                                <i className="fas fa-plus text-xs"></i>
                                Add Service
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {services.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50/80 transition-all duration-200 group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">

                                                    <span className="text-sm font-semibold text-gray-900">{service.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                    <span className="text-sm text-gray-600">{service.duration}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ">
                                                    {service.price}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500 line-clamp-2 max-w-xs block">
                                                    {service.description || "—"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* EDIT BUTTON WITH ICON */}
                                                    <button
                                                        onClick={() => setEditingService(service)}
                                                        className="relative p-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all duration-200 hover:scale-105 group/edit"
                                                        title="Edit service"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                        </svg>
                                                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/edit:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                            Edit
                                                        </span>
                                                    </button>

                                                    {/* DELETE BUTTON WITH ICON */}
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Delete "${service.name}"?`)) {
                                                                deleteService(service.id);
                                                            }
                                                        }}
                                                        className="relative p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:scale-105 group/delete"
                                                        title="Delete service"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/delete:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                            Delete
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {services.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i className="fas fa-cut text-gray-400 text-2xl"></i>
                                </div>
                                <h3 className="text-gray-500 text-sm">No services added yet</h3>
                                <button
                                    onClick={() => setShowAddServiceModal(true)}
                                    className="mt-3 text-teal-500 hover:text-teal-600 text-sm font-medium"
                                >
                                    + Add your first service
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Barbers Tab */}
                {activeTab === "barbers" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Barbers</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Manage your barbers and their availability</p>
                            </div>
                            <button
                                onClick={() => setShowAddBarberModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-200 text-sm font-medium"
                            >
                                <i className="fas fa-plus text-xs"></i>
                                Add Barber
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Availability</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Services</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {barbers.map((barber) => (
                                        <tr key={barber.id} className="hover:bg-gray-50/80 transition-all duration-200 group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">

                                                    <span className="text-sm font-semibold text-gray-900">{barber.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">{barber.email}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">{barber.phone}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">{barber.username}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={barber.status === "AVAILABLE"}
                                                        onChange={() => toggleBarberAvailability(barber.id)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-teal-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:border-white"></div>
                                                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${barber.status === "AVAILABLE"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                        }`}>
                                                        {barber.status === "AVAILABLE" ? "Available" : "Offline"}
                                                    </span>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                    {barber.services?.slice(0, 2).map((service, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                                                            {service}
                                                        </span>
                                                    ))}
                                                    {barber.services?.length > 2 && (
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setOpenBarber(openBarber === barber.id ? null : barber.id)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                            >
                                                                +{barber.services.length - 2} more
                                                            </button>
                                                            {openBarber === barber.id && (
                                                                <div className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-2 left-0">
                                                                    <div className="text-xs font-semibold text-gray-500 px-2 py-1 border-b border-gray-100 mb-1">
                                                                        All Services ({barber.services.length})
                                                                    </div>
                                                                    {barber.services.map((service, index) => (
                                                                        <div key={index} className="px-2 py-1.5 text-sm text-gray-700 hover:bg-teal-50 rounded-md transition-colors">
                                                                            • {service}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(!barber.services || barber.services.length === 0) && (
                                                        <span className="text-xs text-gray-400 italic">No services</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingBarber({
                                                                ...barber,
                                                                serviceIds: services
                                                                    .filter(s => barber.services?.includes(s.name))
                                                                    .map(s => s.id)
                                                            });

                                                            setShowServiceDropdown(false);
                                                        }}
                                                        className="p-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all duration-200 group-hover:scale-105"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Delete ${barber.fullName}?`)) {
                                                                deleteBarber(barber.id);
                                                            }
                                                        }}
                                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 group-hover:scale-105"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Empty State */}
                        {barbers.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i className="fas fa-users text-gray-400 text-2xl"></i>
                                </div>
                                <h3 className="text-gray-500 text-sm">No barbers added yet</h3>
                                <button
                                    onClick={() => setShowAddBarberModal(true)}
                                    className="mt-3 text-teal-500 hover:text-teal-600 text-sm font-medium"
                                >
                                    + Add your first barber
                                </button>
                            </div>
                        )}
                    </div>
                )}



                {/* Customers Tab */}
                {activeTab === "customers" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Simple Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <i className="fas fa-users text-blue-500 text-sm"></i>
                                    Customer Bookings
                                </h2>

                            </div>

                            {/* Date Filter */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                                <button
                                    onClick={() => setSelectedDate(new Date().toLocaleDateString("en-CA"))}
                                    className="text-sm px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Today
                                </button>
                            </div>
                        </div>



                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Service</th>
                                        <th className="px-6 py-3">Barber</th>
                                        <th className="px-6 py-3">Date & Time</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Customer */}
                                            <td className="px-6 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{customer.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{customer.phone}</p>
                                                </div>
                                            </td>

                                            {/* Service */}
                                            <td className="px-6 py-3">
                                                <span className="text-sm text-gray-600">{customer.service}</span>
                                            </td>

                                            {/* Barber */}
                                            <td className="px-6 py-3">
                                                <span className="text-sm text-gray-600">{customer.barber}</span>
                                            </td>

                                            {/* Date & Time */}
                                            <td className="px-6 py-3">
                                                <div className="text-sm text-gray-600">
                                                    {customer.date} · {customer.time}
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-3">
                                                <span className={`
                                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                    ${customer.status === "WAITING" && "bg-yellow-50 text-yellow-700"}
                                    ${customer.status === "IN_PROGRESS" && "bg-green-50 text-green-700"}
                                    ${customer.status === "COMPLETED" && "bg-blue-50 text-blue-700"}
                                    ${customer.status === "CANCELLED" && "bg-red-50 text-red-700"}
                                `}>
                                                    {customer.status === "WAITING" && "Waiting"}
                                                    {customer.status === "IN_PROGRESS" && "In Progress"}
                                                    {customer.status === "COMPLETED" && "Completed"}
                                                    {customer.status === "CANCELLED" && "Cancelled"}
                                                </span>
                                            </td>

                                            {/* Delete Button */}
                                            <td className="px-6 py-3">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Delete booking for ${customer.name}?`)) {
                                                                handleDelete(customer.id);
                                                            }
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash-alt text-sm"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {customers.length === 0 && (
                            <div className="text-center py-12">
                                <i className="fas fa-calendar-day text-gray-300 text-5xl mb-3"></i>
                                <p className="text-gray-400 text-sm">No bookings for this date</p>
                            </div>
                        )}
                    </div>
                )}


                {/* Settings Tab */}
                {activeTab === "settings" && (
                    <div className="space-y-6">
                        {/* Shop Profile Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Shop Profile</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Manage your salon information</p>
                                </div>
                                <div className="flex gap-3">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSaveAllChanges}
                                                disabled={isSaving}
                                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin mr-1"></i> Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-save mr-1"></i> Save All Changes
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                                            >
                                                <i className="fas fa-times mr-1"></i> Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleEditMode}
                                            className="px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all"
                                        >
                                            <i className="fas fa-edit mr-1"></i> Edit
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteSalon()}
                                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                                    >
                                        <i className="fas fa-trash-alt mr-1"></i> Delete Salon
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Salon Name */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Salon Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedData.name}
                                                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                                className="w-full max-w-md text-gray-800 font-medium border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={salon.name}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 font-medium bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Street Address</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedData.address}
                                                onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={salon.address}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* City */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">City</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedData.city}
                                                onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={salon.city || "San Francisco"}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Country */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Country</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedData.country}
                                                onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={salon.country || "United States"}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Phone Number</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editedData.salonPhoneNumber}
                                                onChange={(e) => setEditedData({ ...editedData, salonPhoneNumber: e.target.value })}
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="tel"
                                                value={salon.salonPhoneNumber}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Email</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editedData.salonEmail}
                                                onChange={handleSettingsChange}
                                                name="salonEmail"
                                                //onChange={(e) => setEditedData({ ...editedData, salonEmail: e.target.value })}
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />

                                        ) : (
                                            <input
                                                type="email"
                                                value={salon.salonEmail}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                        {editedData.salonEmail && (
                                            <p className={`text-xs mt-1 ${settingsErrors.email ? "text-red-500" : "text-green-500"
                                                }`}>
                                                {settingsErrors.email || "✅ Valid email"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Username</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedData.salonUserName}
                                                name="salonUserName"
                                                onChange={handleSettingsChange}
                                                //    onChange={(e) => setEditedData({ ...editedData, salonUserName: e.target.value })}
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={salon.salonUserName || "salon_admin"}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                    {editedData.salonUserName && (
                                        <p className={`text-xs mt-1 ${settingsErrors.username ? "text-red-500" : "text-green-500"
                                            }`}>
                                            {settingsErrors.username || "✅ Username looks good"}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Password</label>
                                        {isEditing ? (
                                            <input
                                                type="password"
                                                value={editedData.password}
                                                name="password"
                                                onChange={handleSettingsChange}

                                                //    onChange={(e) => setEditedData({ ...editedData, password: e.target.value })}
                                                placeholder="Enter new password (leave blank to keep current)"
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="password"
                                                value="********"
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                    {editedData.password && (
                                        <p className={`text-xs mt-1 ${settingsErrors.password
                                            ? "text-red-500"
                                            : getPasswordStrength(editedData.password) === "Strong"
                                                ? "text-green-500"
                                                : "text-yellow-500"
                                            }`}>
                                            {settingsErrors.password || getPasswordStrength(editedData.password)}
                                        </p>
                                    )}
                                </div>

                                {/* Opening Time */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Opening Time</label>
                                        {isEditing ? (
                                            <input
                                                type="time"
                                                value={editedData.openingTime}
                                                name="openingTime"
                                                onChange={handleSettingsChange}
                                                //  onChange={(e) => setEditedData({ ...editedData, openingTime: e.target.value })}
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={salon.openingTime || "9:00 AM"}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>

                                </div>

                                {/* Closing Time */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Closing Time</label>
                                        {isEditing ? (
                                            <input
                                                type="time"
                                                value={editedData.closingTime}
                                                name="closingTime"
                                                onChange={handleSettingsChange}
                                                // onChange={(e) => setEditedData({ ...editedData, closingTime: e.target.value })}
                                                className="w-full max-w-md text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={salon.closingTime || "8:00 PM"}
                                                readOnly
                                                className="w-full max-w-md text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                    {settingsErrors.timing && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {settingsErrors.timing}
                                        </p>
                                    )}
                                </div>

                                {/* Location on Map */}
                                <div className="flex items-start justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Location on Map</label>

                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div className="relative mb-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Search city, state, country..."
                                                        value={locationQuery}
                                                        onChange={(e) => {
                                                            setLocationQuery(e.target.value);
                                                            searchLocation(e.target.value);
                                                        }}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />

                                                    {/* Dropdown Results */}
                                                    {locationResults.length > 0 && (
                                                        <div className="absolute z-[9999] w-full bg-white border rounded-lg shadow max-h-60 overflow-y-auto mt-1">                                                            {locationResults.map((place, index) => (
                                                            <div
                                                                key={index}
                                                                onClick={() => handleSelectLocation(place)}
                                                                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                                            >
                                                                {place.display_name}
                                                            </div>
                                                        ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Coordinate Inputs with Current Location Button */}
                                                <div className="flex gap-3 items-center">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-400 block mb-1">Latitude</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={editedData.latitude}
                                                            onChange={(e) => {
                                                                setEditedData({ ...editedData, latitude: e.target.value });
                                                                // Update map preview with new coordinates
                                                                updateMapPreview(e.target.value, editedData.longitude);
                                                            }}
                                                            className="w-full text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-400 block mb-1">Longitude</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={editedData.longitude}
                                                            onChange={(e) => {
                                                                setEditedData({ ...editedData, longitude: e.target.value });
                                                                // Update map preview with new coordinates
                                                                updateMapPreview(editedData.latitude, e.target.value);
                                                            }}
                                                            className="w-full text-gray-800 border border-gray-300 focus:border-teal-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={getCurrentLocation}
                                                        disabled={isLocating}
                                                        type="button"
                                                        className="mt-5 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all whitespace-nowrap disabled:opacity-50"
                                                    >
                                                        {isLocating ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                                                Fetching...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-location-dot mr-1"></i>
                                                                Current Location
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Map Preview in Edit Mode */}
                                                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    <div className="w-full h-64">
                                                        <LocationPicker
                                                            editedData={editedData}
                                                            setEditedData={setEditedData}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    <i className="fas fa-info-circle mr-1"></i>
                                                    Drag the map or adjust coordinates above. The map will update in real-time.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-full max-w-2xl h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    <iframe
                                                        title="Salon Location"
                                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(salon.longitude || -122.4194) - 0.01},${parseFloat(salon.latitude || 37.7749) - 0.01},${parseFloat(salon.longitude || -122.4194) + 0.01},${parseFloat(salon.latitude || 37.7749) + 0.01}&layer=mapnik&marker=${salon.latitude || 37.7749},${salon.longitude || -122.4194}`}
                                                        className="w-full h-full"
                                                        style={{ border: 0 }}
                                                        allowFullScreen
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Coordinates: {salon.latitude || "37.7749"}, {salon.longitude || "-122.4194"}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Salon Image */}
                                <div className="flex items-start justify-between group">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                                            Salon Image
                                        </label>

                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4">
                                                    {editedData.imagePreview || imageUrl ? (
                                                        <img
                                                            src={editedData.imagePreview || imageUrl}
                                                            alt="Salon"
                                                            className="w-20 h-20 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => editedData.imagePreview && setShowImageModal(true)}
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <i className="fas fa-store text-gray-400 text-2xl"></i>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={handleImageUpload}
                                                        type="button"
                                                        className="px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all"
                                                    >
                                                        <i className="fas fa-upload mr-1"></i> Choose Image
                                                    </button>
                                                    {editedData.imageFile && (
                                                        <button
                                                            onClick={() => {
                                                                setEditedData({ ...editedData, imageFile: null, imagePreview: null });
                                                            }}
                                                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                                                        >
                                                            <i className="fas fa-times mr-1"></i> Remove
                                                        </button>
                                                    )}
                                                </div>
                                                {editedData.imageFile && (
                                                    <p className="text-xs text-green-600">
                                                        <i className="fas fa-check-circle mr-1"></i>
                                                        New image selected. Will be uploaded when saving.
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt="Salon"
                                                        className="w-20 h-20 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => setShowImageModal(true)}
                                                    />
                                                ) : (
                                                    <>
                                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <i className="fas fa-store text-gray-400 text-2xl"></i>
                                                        </div>
                                                        <p className="text-sm text-gray-500">No image uploaded</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Modal */}
                {showImageModal && (
                    <div
                        className="fixed inset-0 bg-black/70 bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <img
                                src={editedData.imagePreview || imageUrl}
                                alt="Salon"
                                className="w-full h-full object-contain rounded-lg"
                            />
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="absolute top-4 right-4 
             bg-white text-black 
             rounded-full p-2 
             shadow-md 
             hover:bg-gray-200 
             transition-all"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                    </div>
                )}


                {/* Tablet/Kiosk Settings Tab */}
                {activeTab === "devices" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Device Code
                        </h2>

                        <p className="text-sm text-gray-500 mb-4">
                            Use this code on your tablet to connect your salon
                        </p>

                        <div className="flex items-center gap-3">
                            <code className="px-4 py-2 bg-gray-100 rounded-lg text-lg font-mono text-teal-600">
                                {salon.deviceCode}
                            </code>

                            <button
                                onClick={() => copyToClipboard(salon.deviceCode)}
                                className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                            >
                                Copy
                            </button>
                        </div>

                        {/* Success Message */}
                        {copied && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Code copied to clipboard!</span>
                            </div>
                        )}
                    </div>
                )}


                {/* Edit Field Modal */}
                <Modal
                    isOpen={editingField !== null}
                    onClose={() => {
                        setEditingField(null);
                        setFieldValue("");
                    }}
                    title={`Edit ${editingFieldLabel}`}
                >
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {editingFieldLabel} <span className="text-red-500">*</span>
                            </label>

                            {/* Text Input for most fields */}
                            {editingField !== "description" && editingField !== "image" && (
                                <input
                                    type={editingField === "password" ? "password" : "text"}
                                    value={fieldValue}
                                    onChange={(e) => setFieldValue(e.target.value)}
                                    placeholder={`Enter ${editingFieldLabel.toLowerCase()}`}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    autoFocus
                                />
                            )}

                            {/* Textarea for description */}
                            {editingField === "description" && (
                                <textarea
                                    value={fieldValue}
                                    onChange={(e) => setFieldValue(e.target.value)}
                                    rows="4"
                                    placeholder="Enter description"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            )}

                            {/* File input for image */}
                            {editingField === "image" && (
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-teal-500 transition-colors cursor-pointer">
                                    <input type="file" className="hidden" id="field-image" accept="image/*" />
                                    <label htmlFor="field-image" className="cursor-pointer block">
                                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                        <p className="text-sm text-gray-600">Upload a file</p>
                                        <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
                                        <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 10MB</p>
                                    </label>
                                </div>
                            )}

                            {editingField === "password" && (
                                <p className="text-xs text-gray-400 mt-2">Minimum 6 characters</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setEditingField(null);
                                    setFieldValue("");
                                }}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                // onClick={handleProceedToOTP}
                                className="px-5 py-2 text-sm text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                            >
                                Proceed to Verify
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Location Picker Modal with OpenStreetMap */}
                <Modal
                    isOpen={showLocationModal}
                    onClose={() => {
                        setShowLocationModal(false);
                        setTempLat("");
                        setTempLng("");
                    }}
                    title="Update Shop Location"
                    size="lg"
                >
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Click on map to select location
                            </label>

                            {/* OpenStreetMap Iframe for location picking */}
                            <div className="h-96 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                {/* const lat = parseFloat(tempLat ?? salon?.latitude ?? 37.7749);
                                const lng = parseFloat(tempLng ?? salon?.longitude ?? -122.4194);

                                const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
                                    lng - 0.02
                                },${lat - 0.02},${lng + 0.02},${lat + 0.02}&layer=mapnik&marker=${lat},${lng}`; */}
                                <iframe
                                    title="Location Picker"

                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(tempLng ?? salon?.longitude ?? -122.4194) - 0.02)
                                        },${(parseFloat(tempLat ?? salon?.latitude ?? 37.7749) - 0.02)
                                        },${(parseFloat(tempLng ?? salon?.longitude ?? -122.4194) + 0.02)
                                        },${(parseFloat(tempLat ?? salon?.latitude ?? 37.7749) + 0.02)
                                        }&layer=mapnik&marker=${parseFloat(tempLat ?? salon?.latitude ?? 37.7749)
                                        },${parseFloat(tempLng ?? salon?.longitude ?? -122.4194)
                                        }`} className="w-full h-full"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        placeholder="Latitude"
                                        value={tempLat}
                                        onChange={(e) => setTempLat(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        placeholder="Longitude"
                                        value={tempLng}
                                        onChange={(e) => setTempLng(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 mt-2">
                                💡 Tip: You can enter coordinates manually or use the map above to find your location.
                                <br />
                                To get coordinates from map: Right-click on map → "Show address" or use tools like latlong.net
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowLocationModal(false);
                                    setTempLat("");
                                    setTempLng("");
                                }}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLocationUpdate}
                                className="px-5 py-2 text-sm text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                            >
                                Update Location
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* OTP Verification Modal */}
                <Modal
                    isOpen={showOtpModal}
                    onClose={() => {
                        setShowOtpModal(false);
                        setOtpCode("");
                        setPendingFieldData(null);
                    }}
                    title="Verify Your Identity"
                >
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                            <i className="fas fa-envelope text-white text-3xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Verification Required</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                We've sent a 6-digit verification code to <br />
                                {/* <span className="font-semibold text-gray-700">{salon.email}</span> */}
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            {[...Array(6)].map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                                    value={otpCode[i] || ''}
                                    onChange={(e) => {
                                        const newOtp = otpCode.split('');
                                        newOtp[i] = e.target.value;
                                        setOtpCode(newOtp.join(''));
                                        if (e.target.value && i < 5) {
                                            const nextInput = document.querySelectorAll('.otp-input')[i + 1];
                                            if (nextInput) nextInput.focus();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">
                            Didn't receive the code? <button className="text-teal-500 font-semibold">Resend</button>
                        </p>
                        <button
                            // onClick={verifyOtpAndUpdateField}
                            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors"
                        >
                            Verify & Update
                        </button>
                    </div>
                </Modal>
            </div>


            {/* Transfer Bookings Modal */}
            <Modal
                isOpen={showTransferModal}
                onClose={() => setShowTransferModal(false)}
                title="Transfer Bookings"
            >
                <div className="space-y-5">

                    {/* Message */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">
                            {unavailableBarber?.name}
                        </span>{" "}
                        has upcoming bookings. Please select another barber to transfer the customers.
                    </div>

                    {/* Barber Select */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Select New Barber
                        </label>

                        <select
                            value={transferTargetBarber}
                            onChange={(e) => setTransferTargetBarber(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">Choose barber</option>

                            {barbers
                                .filter(b => b.id !== unavailableBarber?.id && b.available)
                                .map(barber => (
                                    <option key={barber.id} value={barber.id}>
                                        {barber.name} • {barber.role}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">

                        <button
                            onClick={() => setShowTransferModal(false)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleTransferBookings}
                            disabled={!transferTargetBarber}
                            className="px-5 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 transition disabled:opacity-50"
                        >
                            Transfer Bookings
                        </button>

                    </div>

                </div>
            </Modal>
            {/* Add Barber Modal */}
            <Modal
                isOpen={showAddBarberModal}
                onClose={() => setShowAddBarberModal(false)}
                title="Add New Barber"
            >
                <div className="space-y-5">
                    {/* Basic Info - 2 Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"   // ✅ ADD THIS

                                placeholder="John Anderson"
                                value={newBarber.fullName}
                                onChange={handleBarberChange}

                                // onChange={(e) =>
                                //     setNewBarber({ ...newBarber, fullName: e.target.value })
                                // }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {barberErrors.fullName && (
                                <p className="text-red-500 text-xs mt-1">
                                    {barberErrors.fullName}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                            <input
                                type="tel"
                                placeholder="+1 415 555"
                                name="phone"
                                value={newBarber.phone}
                                onChange={handleBarberChange}

                                //onChange={(e) => setNewBarber({ ...newBarber, phone: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {barberErrors.phone && (
                                <p className="text-red-500 text-xs mt-1">{barberErrors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="john@email.com"
                                name="email"

                                value={newBarber.email}
                                onChange={handleBarberChange}

                                //onChange={(e) => setNewBarber({ ...newBarber, email: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />

                            {newBarber.email && (
                                <p className={`text-xs mt-1 ${emailRegex.test(newBarber.email) ? "text-green-500" : "text-red-500"
                                    }`}>
                                    {emailRegex.test(newBarber.email)
                                        ? "✅ Valid email"
                                        : "Invalid email format (e.g. abc@gmail.com)"}
                                </p>
                            )}
                            {barberErrors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {barberErrors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                            <input
                                type="text"
                                placeholder="john.anderson"
                                value={newBarber.username}
                                onChange={handleBarberChange}
                                name="username"

                                //onChange={(e) => setNewBarber({ ...newBarber, username: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {newBarber.username && (
                                <p className={`text-xs mt-1 ${usernameRegex.test(newBarber.username) ? "text-green-500" : "text-red-500"
                                    }`}>
                                    {usernameRegex.test(newBarber.username)
                                        ? "✅ Username looks good"
                                        : "Must include letter, number & special character"}
                                </p>
                            )}

                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={newBarber.password}
                                onChange={handleBarberChange}
                                name="password"

                                // onChange={(e) => setNewBarber({ ...newBarber, password: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {newBarber.password && (
                                <p className={`text-xs mt-1 ${getPasswordStrength(newBarber.password) === "Weak"
                                    ? "text-red-500"
                                    : getPasswordStrength(newBarber.password) === "Medium"
                                        ? "text-yellow-500"
                                        : "text-green-500"
                                    }`}>
                                    {newBarber.password.length < 8
                                        ? "Password must be at least 8 characters"
                                        : getPasswordStrength(newBarber.password) === "Weak"
                                            ? "Weak password"
                                            : getPasswordStrength(newBarber.password) === "Medium"
                                                ? "Medium strength"
                                                : "✅ Strong password"}
                                </p>
                            )}
                            {barberErrors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {barberErrors.password}
                                </p>
                            )}
                        </div>



                    </div>

                    {/* Assign Services - Multi Select Dropdown */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Assign Services</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <span className={newBarber.serviceIds?.length > 0 ? "text-gray-800" : "text-gray-400"}>
                                    {newBarber.serviceIds?.length > 0
                                        ? `${newBarber.serviceIds.length} service${newBarber.serviceIds.length > 1 ? 's' : ''} selected`
                                        : "Select services"}
                                </span>
                                <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`}></i>
                            </button>

                            {showServiceDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {services.map((service) => (
                                        <label key={service.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newBarber.serviceIds?.includes(service.id)}
                                                onChange={(e) => {
                                                    const updated = newBarber.serviceIds || [];
                                                    if (e.target.checked) {
                                                        setNewBarber({
                                                            ...newBarber,
                                                            serviceIds: [...updated, service.id]
                                                        });
                                                    } else {
                                                        setNewBarber({
                                                            ...newBarber,
                                                            serviceIds: updated.filter(id => id !== service.id)
                                                        });
                                                    }
                                                }}
                                                className="accent-teal-500"
                                            />
                                            <span className="text-sm text-gray-700">{service.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Services Tags */}
                        {newBarber.serviceIds?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {services.filter(s => newBarber.serviceIds.includes(s.id)).map(service => (
                                    <span key={service.id} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-md">
                                        {service.name}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewBarber({
                                                    ...newBarber,
                                                    serviceIds: newBarber.serviceIds.filter(id => id !== service.id)
                                                });
                                            }}
                                            className="hover:text-teal-900"
                                        >
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => {
                                setShowAddBarberModal(false);
                                setShowServiceDropdown(false);
                            }}
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddBarber}
                            className="px-5 py-2 text-sm text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Add Barber
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Barber Modal */}
            <Modal
                isOpen={editingBarber !== null}
                onClose={() => {
                    setEditingBarber(null);
                    setShowServiceDropdown(false);
                }}
                title="Edit Barber"
            >
                <div className="space-y-5">
                    {/* Basic Info - 2 Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="John Anderson"
                                name="fullName"
                                value={editingBarber?.fullName || ""}
                                onChange={(e) => handleBarberChange(e, true)}

                                // onChange={(e) =>
                                //     setEditingBarber({
                                //         ...editingBarber,
                                //         fullName: e.target.value
                                //     })
                                // }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                            <input
                                type="tel"
                                placeholder="+1 415 555"
                                name="phone"
                                onChange={(e) => handleBarberChange(e, true)}
                                value={editingBarber?.phone || ""}
                                //onChange={(e) => setEditingBarber({ ...editingBarber, phone: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="john@email.com"
                                name="email"
                                onChange={(e) => handleBarberChange(e, true)}
                                value={editingBarber?.email || ""}
                                onChange={(e) => setEditingBarber({ ...editingBarber, email: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {editingBarber?.email && (
                                <p className={`text-xs mt-1 ${emailRegex.test(editingBarber.email) ? "text-green-500" : "text-red-500"
                                    }`}>
                                    {emailRegex.test(editingBarber.email)
                                        ? "✅ Valid email"
                                        : "Invalid email format"}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Username
                            </label>

                            <input
                                type="text"
                                placeholder="john.anderson"
                                value={editingBarber?.username || ""}
                                name="username"
                                onChange={(e) => handleBarberChange(e, true)}

                                // onChange={(e) => {
                                //     const value = e.target.value;

                                //     setEditingBarber(prev => ({
                                //         ...prev,
                                //         username: value
                                //     }));
                                // }}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm 
    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {editingBarber?.username && (
                                <p className={`text-xs mt-1 ${usernameRegex.test(editingBarber.username) ? "text-green-500" : "text-red-500"
                                    }`}>
                                    {usernameRegex.test(editingBarber.username)
                                        ? "✅ Username looks good"
                                        : "Must include letter, number & special character"}
                                </p>
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                onChange={(e) => handleBarberChange(e, true)}
                                placeholder="Leave blank to keep current password"
                                value={editingBarber?.password || ""}
                                onChange={(e) => setEditingBarber({ ...editingBarber, password: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-400 mt-1">Leave empty to keep existing password</p>
                            {editingBarber?.password && (
                                <p className={`text-xs mt-1 ${getPasswordStrength(editingBarber.password) === "Weak"
                                    ? "text-red-500"
                                    : getPasswordStrength(editingBarber.password) === "Medium"
                                        ? "text-yellow-500"
                                        : "text-green-500"
                                    }`}>
                                    {editingBarber.password.length < 8
                                        ? "Password must be at least 8 characters"
                                        : getPasswordStrength(editingBarber.password)}
                                </p>
                            )}
                        </div>



                    </div>

                    {/* Assign Services - Multi Select Dropdown */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Assign Services</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <span className={editingBarber?.services?.length > 0 ? "text-gray-800" : "text-gray-400"}>
                                    {editingBarber?.services?.length > 0
                                        ? `${editingBarber.services.length} service${editingBarber.services.length > 1 ? 's' : ''} selected`
                                        : "Select services"}
                                </span>
                                <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`}></i>
                            </button>

                            {showServiceDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {services.map((service) => (
                                        <label key={service.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editingBarber?.serviceIds?.includes(service.id) ?? false}
                                                onChange={(e) => {
                                                    const updated = editingBarber?.serviceIds ? [...editingBarber.serviceIds] : [];

                                                    let newServiceIds;

                                                    if (e.target.checked) {
                                                        newServiceIds = [...updated, service.id];
                                                    } else {
                                                        newServiceIds = updated.filter(id => id !== service.id);
                                                    }

                                                    setEditingBarber(prev => ({
                                                        ...prev,
                                                        serviceIds: newServiceIds
                                                    }));
                                                }}
                                                className="accent-teal-500"
                                            />
                                            <span className="text-sm text-gray-700">{service.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Services Tags */}
                        {editingBarber?.services?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {services.filter(s => editingBarber.services?.includes(s.id)).map(service => (
                                    <span key={service.id} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-md">
                                        {service.name}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingBarber({
                                                    ...editingBarber,
                                                    services: editingBarber.services.filter(id => id !== service.id)
                                                });
                                            }}
                                            className="hover:text-teal-900"
                                        >
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => {
                                setEditingBarber(null);
                                setShowServiceDropdown(false);
                            }}
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateBarber}
                            className="px-5 py-2 text-sm text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Update Barber
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Service Modal */}
            <Modal
                isOpen={showAddServiceModal}
                onClose={() => setShowAddServiceModal(false)}
                title="Add New Service"
            >
                <div className="space-y-6">

                    {/* Service Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Name
                        </label>

                        <input
                            type="text"
                            placeholder="Haircut"
                            value={newService.name}
                            onChange={(e) =>
                                setNewService({ ...newService, name: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
        focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                        />
                    </div>

                    {/* Price + Duration */}
                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                            </label>

                            <input
                                type="number"
                                placeholder="20"
                                value={newService.price}
                                onChange={(e) =>
                                    setNewService({ ...newService, price: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration
                            </label>

                            <input
                                type="text"
                                placeholder="30 min"
                                value={newService.duration}
                                onChange={(e) =>
                                    setNewService({ ...newService, duration: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                            />
                        </div>

                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>

                        <textarea
                            placeholder="Optional service description"
                            value={newService.description}
                            onChange={(e) =>
                                setNewService({ ...newService, description: e.target.value })
                            }
                            rows="3"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
        focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">

                        <button
                            onClick={() => setShowAddServiceModal(false)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-md
        hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleAddService}
                            className="px-5 py-2 text-sm font-medium text-white
        bg-teal-500 rounded-md hover:bg-teal-600 transition"
                        >
                            Add Service
                        </button>

                    </div>

                </div>
            </Modal>

            {/* Edit Service Modal */}
            <Modal
                isOpen={editingService !== null}
                onClose={() => setEditingService(null)}
                title="Edit Service"
            >
                <div className="space-y-6">

                    {/* Service Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Name
                        </label>

                        <input
                            type="text"
                            placeholder="Haircut"
                            value={editingService?.name || ""}
                            onChange={(e) =>
                                setEditingService({ ...editingService, name: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
        focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                        />
                    </div>

                    {/* Price + Duration */}
                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                            </label>

                            <input
                                type="number"
                                placeholder="20"
                                value={editingService?.price || ""}
                                onChange={(e) =>
                                    setEditingService({ ...editingService, price: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration
                            </label>

                            <input
                                type="text"
                                placeholder="30 min"
                                value={editingService?.duration || ""}
                                onChange={(e) =>
                                    setEditingService({ ...editingService, duration: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                            />
                        </div>

                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>

                        <textarea
                            placeholder="Optional service description"
                            value={editingService?.description || ""}
                            onChange={(e) =>
                                setEditingService({ ...editingService, description: e.target.value })
                            }
                            rows="3"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
        focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">

                        <button
                            onClick={() => setEditingService(null)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleUpdateService}
                            className="px-5 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 transition"
                        >
                            Update Service
                        </button>

                    </div>

                </div>
            </Modal>


        </div>
    );
}