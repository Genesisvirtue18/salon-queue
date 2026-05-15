import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBarberprofile, fetchBarberBookings, updateBookingStatus, fetchBarberAnalytics, fetchBarberHistory } from "../../services/barberService";
import { useAuthContext } from "../../context/AuthContext";
import { transferQueueService } from "../../services/bookingService"
import { updateBarberStatus, fetchOtherBarbers } from "../../services/barberService"
import SockJS from "sockjs-client";
import { connectSocket, disconnectSocket } from "../../components/socket";
import { Client } from "@stomp/stompjs";

export default function BarberDashboard() {
    const [activeTab, setActiveTab] = useState("queue");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileTabOpen, setMobileTabOpen] = useState(false);
    const [barber, setBarber] = useState(null);
    const [loadingBarber, setLoadingBarber] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [queue, setQueue] = useState([]);
    const [completedBookings, setCompletedBookings] = useState([]);
    const [cancelledBookings, setCancelledBookings] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const { logout } = useAuthContext();
    const [showToast, setShowToast] = useState(null);
    const notificationSound = new Audio("/sounds/notification.mp3");
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [availableBarbers, setAvailableBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);


    const [analytics, setAnalytics] = useState(null);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    const showToastMessage = (message, type = "success") => {
        setShowToast({ message, type });
    };

    const playSound = () => {
        notificationSound.currentTime = 0; // restart sound
        notificationSound.play().catch(() => {
            console.log("Sound blocked by browser");
        });
    };

    // useEffect(() => {
    //     if (!barber?.id) return;

    //     const socket = new SockJS("http://localhost:1009/ws");

    //     const client = new Client({
    //         webSocketFactory: () => socket,
    //         reconnectDelay: 5000,
    //     });

    //     client.onConnect = () => {
    //         console.log("✅ WebSocket Connected:", barber.id);

    //         // ✅ ONLY ONE SUBSCRIPTION
    //         // client.subscribe(`/topic/barber/${barber.id}`, (msg) => {
    //         //     const data = JSON.parse(msg.body);

    //         //     console.log("🔥 LIVE EVENT:", data);

    //         //     // ✅ NEW BOOKING
    //         //     if (data.type === "NEW_BOOKING") {
    //         //         showToastMessage(
    //         //             `🆕 New booking from ${data.customerName}`,
    //         //             "success"
    //         //         );

    //         //         playSound(); // 🔔 ADD THIS
    //         //           loadBookings();


    //         //         // 🔥 INSTANT UI UPDATE
    //         //         // setQueue(prev => [
    //         //         //     ...prev,
    //         //         //     {
    //         //         //         id: data.bookingId,
    //         //         //         customerName: data.customerName,
    //         //         //         status: "waiting",
    //         //         //         position: prev.length
    //         //         //     }
    //         //         // ]);
    //         //     }

    //         //     // ✅ STARTED BY OTHER
    //         //     if (data.type === "BOOKING_STARTED_BY_OTHER") {
    //         //         showToastMessage(
    //         //             `${data.customerName}'s booking started by ${data.startedBy}`,
    //         //             "warning"
    //         //         );
    //         //         playSound(); // 🔔 ADD THIS


    //         //         // 🔥 REMOVE FROM QUEUE
    //         //         setQueue(prev =>
    //         //             prev.filter(b => b.id !== data.bookingId)
    //         //         );
    //         //     }
    //         // });

    //         client.subscribe(`/topic/barber/${barber.id}`, (msg) => {
    //             const data = JSON.parse(msg.body);

    //             console.log("🔥 LIVE EVENT:", data);

    //             // ✅ NEW BOOKING
    //             if (data.type === "NEW_BOOKING") {
    //                 showToastMessage(`🆕 New booking from ${data.customerName}`, "success");
    //                 playSound();
    //                 loadBookings();
    //             }

    //             // ✅ TRANSFER RECEIVED
    //             if (data.type === "QUEUE_TRANSFERRED_TO") {
    //                 showToastMessage("📦 New bookings received", "success");
    //                 playSound();
    //                 loadBookings(); // 🔥 MUST
    //             }

    //             // ✅ TRANSFER FROM (optional)
    //             if (data.type === "QUEUE_TRANSFERRED_FROM") {
    //                 showToastMessage("📤 Bookings transferred", "info");
    //                 loadBookings();
    //             }

    //             // ✅ STARTED BY OTHER
    //             if (data.type === "BOOKING_STARTED_BY_OTHER") {
    //                 showToastMessage(
    //                     `${data.customerName}'s booking started by ${data.startedBy}`,
    //                     "warning"
    //                 );
    //                 playSound();
    //                 loadBookings(); // 🔥 FIX (instead of manual filter)
    //             }
    //         });
    //     };

    //     client.activate();

    //     return () => {
    //         if (client && client.active) {
    //             console.log("❌ WebSocket disconnected");
    //             client.deactivate();
    //         }
    //     };
    // }, [barber?.id]);


    useEffect(() => {
    if (!barber?.id) return;

    const handleMessage = (data) => {
        console.log("🔥 LIVE EVENT:", data);

        if (data.type === "NEW_BOOKING") {
            showToastMessage(`🆕 New booking from ${data.customerName}`);
            playSound();
            loadBookings();
        }

        if (data.type === "QUEUE_TRANSFERRED_TO") {
            showToastMessage("📦 New bookings received");
            playSound();
            loadBookings();
        }

        if (data.type === "QUEUE_TRANSFERRED_FROM") {
            showToastMessage("📤 Bookings transferred");
            loadBookings();
        }
    };

    const socket = connectSocket(handleMessage, barber.id);

    return () => {
        disconnectSocket();
    };
}, [barber?.id]);



    useEffect(() => {
        loadAnalytics();
        loadHistory();
    }, []);

    const loadAnalytics = async () => {
        try {
            const data = await fetchBarberAnalytics();
            setAnalytics(data);
        } catch (err) {
            setErrorMessage(getErrorMessage(err));
        }
    };

    const loadHistory = async (date = null) => {
        try {
            const data = await fetchBarberHistory(date);
            setHistory(data);
        } catch (err) {
            setErrorMessage(getErrorMessage(err));
        }
    };

    // Barber Profile Data
    useEffect(() => {
        loadBarber();
    }, []);



    const loadBarber = async () => {
        setLoadingBarber(true);
        try {
            const data = await fetchBarberprofile();

            setBarber({
                id: data.id,
                name: data.fullName,
                username: data.username,
                email: data.email,
                phone: data.phone,
                services: data.services || [],
                isAvailable: data.status === "AVAILABLE",
                completedBookings: data.completedBookings || 0,
                totalEarnings: data.totalEarnings || 0,
                cancelledBookings: data.cancelledBookings || 0
            });
        } catch (err) {
            console.error("Failed to load barber", err);
        } finally {
            setLoadingBarber(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoadingBookings(true);
        try {
            const data = await fetchBarberBookings();
            console.log("barber booking data", data);

            // Separate bookings by status
            const activeBookings = data.filter(b => b.status === "WAITING" || b.status === "IN_PROGRESS");
            const completed = data.filter(b => b.status === "COMPLETED");
            const cancelled = data.filter(b => b.status === "CANCELLED");

            // Sort active bookings by position
            const sortedActiveBookings = [...activeBookings].sort((a, b) => a.position - b.position);

            // Format active queue
            const formattedQueue = sortedActiveBookings.map(b => ({
                id: b.id,
                customerName: b.customerName,
                phone: b.customerPhone,
                service: b.services?.join(", "),
                time: new Date(b.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                date: new Date(b.startTime).toISOString().split('T')[0],
                status: b.status === "IN_PROGRESS" ? "in_service" : "waiting",
                position: b.position,
                notes: b.notes || ""
            }));

            // Format completed bookings
            const formattedCompleted = completed.map(b => ({
                id: b.id,
                customerName: b.customerName,
                service: b.services?.join(", "),
                price: servicePrices[b.services?.[0]] || 50,
                date: new Date(b.startTime).toISOString().split('T')[0],
                time: new Date(b.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                completedAt: new Date(b.endTime || b.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            }));

            // Format cancelled bookings
            const formattedCancelled = cancelled.map(b => ({
                id: b.id,
                customerName: b.customerName,
                service: b.services?.join(", "),
                date: new Date(b.startTime).toISOString().split('T')[0],
                time: new Date(b.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                cancelledAt: new Date(b.updatedAt || b.startTime).toLocaleDateString()
            }));

            setQueue(formattedQueue);
            setCompletedBookings(formattedCompleted);
            setCancelledBookings(formattedCancelled);
        } catch (err) {
            setErrorMessage(""); // reset first

            const msg =
                err?.response?.data?.errorMessage ||
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong";

            showToastMessage(msg, "error");
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleStartService = async (id) => {
        try {
            await updateBookingStatus(id, "IN_PROGRESS");
            await loadBookings(); // Refresh after update
        } catch (err) {
            setErrorMessage(""); // reset first

            const msg =
                err?.response?.data?.errorMessage ||
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong";

            showToastMessage(msg, "error");
        }
    };

    const handleCompleteService = async (id) => {
        try {
            await updateBookingStatus(id, "COMPLETED");
            await loadBookings(); // Refresh after update
            await loadBarber(); // Update stats


            await loadHistory();    // 🔥 ADD THIS
            await loadAnalytics();  // 🔥 ADD THIS
        } catch (err) {
            setErrorMessage(""); // reset first

            const msg =
                err?.response?.data?.errorMessage ||
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong";

            showToastMessage(msg, "error");
        }
    };

    const handleLogout = async () => {
        try {
            await logout(); // 🔥 calls backend logout + clears user
            navigate("/");  // 🔥 redirect to home
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await updateBookingStatus(id, "CANCELLED");
                await loadBookings(); // Refresh after cancellation
                await loadBarber(); // Update stats
            } catch (err) {
                setErrorMessage(""); // reset first

                const msg =
                    err?.response?.data?.errorMessage ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Something went wrong";

                showToastMessage(msg, "error");
            }
        }
    };

    // Stats for current day
    const today = new Date().toISOString().split('T')[0];
    const waitingCount = queue.filter(c => c.status === "waiting").length;
    const inServiceCount = queue.filter(c => c.status === "in_service").length;
    const todayCompleted = completedBookings.filter(b => b.date === today).length;
    const todayEarnings = completedBookings.filter(b => b.date === today).reduce((sum, b) => sum + (b.price || 0), 0);
    const todayCancelled = cancelledBookings.filter(c => c.date === today).length;

    // Check if any service is in progress
    const hasActiveService = queue.some(c => c.status === "in_service");

    // Toggle Barber Availability
    const toggleAvailability = async () => {
        try {

            // 👉 going UNAVAILABLE
            if (barber.isAvailable) {

                if (queue.length > 0) {
                    const res = await fetchOtherBarbers();
                    setAvailableBarbers(res);
                    setShowTransferModal(true);
                    return;
                }

                // 🔥 CALL BACKEND
                await updateBarberStatus(barber.id, "UNAVAILABLE");

                setBarber(prev => ({ ...prev, isAvailable: false }));
            }

            // 👉 going AVAILABLE
            else {
                await updateBarberStatus(barber.id, "AVAILABLE");

                setBarber(prev => ({ ...prev, isAvailable: true }));
            }

        } catch (err) {
            showToastMessage("Failed to update status", "error");
        }
    };

    const handleTransfer = async () => {
        if (!selectedBarber) {
            showToastMessage("Select a barber", "error");
            return;
        }

        try {
            // 🔥 STEP 1: TRANSFER
            await transferQueueService(barber.id, selectedBarber);

            // 🔥 STEP 2: UPDATE STATUS
            await updateBarberStatus(barber.id, "UNAVAILABLE");

            showToastMessage("Bookings transferred successfully", "success");

            setShowTransferModal(false);

            await loadBookings();

            setBarber(prev => ({ ...prev, isAvailable: false }));

        } catch (err) {

            const msg =
                err?.response?.data?.errorMessage ||
                err?.response?.data?.message ||
                err?.message ||
                "Transfer failed";

            showToastMessage(msg, "error");
        }
    };

    // Navigation Items
    const navItems = [
        { id: "queue", label: "Live Queue", icon: "fas fa-users" },
        { id: "analytics", label: "Analytics", icon: "fas fa-chart-line" },
        { id: "history", label: "History", icon: "fas fa-history" },
        { id: "profile", label: "My Profile", icon: "fas fa-user" }
    ];

    if (loadingBarber) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading barber profile...</p>
                </div>
            </div>
        );
    }


    return (

        <div className="min-h-screen  bg-gray-50">
            {showToast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center justify-between gap-3
    ${showToast.type === "error" ? "bg-red-500" :
                        showToast.type === "warning" ? "bg-yellow-500" :
                            "bg-green-500"}`}>

                    <span>{showToast.message}</span>

                    <button
                        onClick={() => setShowToast(null)}
                        className="ml-3 text-white font-bold hover:opacity-70"
                    >
                        ✖
                    </button>
                </div>
            )}
            {/* Mobile Bottom Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex justify-around items-center py-2">
                    {navItems.map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${active ? "text-teal-600" : "text-gray-500"}`}
                            >
                                <i className={`${item.icon} text-lg ${active ? "text-teal-600" : "text-gray-400"}`}></i>
                                <span className={`text-xs ${active ? "font-semibold" : ""}`}>{item.label}</span>
                                {item.id === "queue" && waitingCount > 0 && (
                                    <span className="absolute -top-1 right-1 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px]">
                                        {waitingCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Top Tab Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm px-4">
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-cut text-white text-sm"></i>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{barber?.name?.split(' ')[0] || 'Barber'}</p>
                            <p className="text-xs text-gray-500">Barber</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <i className="fas fa-bars text-gray-600 text-lg"></i>
                    </button>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide gap-1 pb-2">
                    {navItems.map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${active
                                    ? "bg-teal-500 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <i className={`${item.icon} mr-1 text-xs`}></i>
                                {item.label}
                                {item.id === "queue" && waitingCount > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${active ? "bg-white text-teal-600" : "bg-teal-100 text-teal-600"
                                        }`}>
                                        {waitingCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
                >
                    <i className="fas fa-times text-gray-500"></i>
                </button>

                <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base md:text-lg font-bold text-gray-800 truncate">{barber?.name}</h2>
                        </div>
                        <button
                            onClick={toggleAvailability}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${barber?.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                            {barber?.isAvailable ? "Available" : "Unavailable"}
                        </button>
                    </div>
                </div>

                <nav className="p-3 md:p-4 space-y-1">
                    {navItems.map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`relative w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                                {active && <div className="absolute left-0 w-1 bg-teal-500 rounded-r"></div>}
                                <i className={`${item.icon} ${active ? "text-teal-600" : "text-gray-400"} w-5 h-5`}></i>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.id === "queue" && waitingCount > 0 && (
                                    <span className="ml-auto bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {waitingCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition">
                        <i className="fas fa-sign-out-alt w-5 h-5"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="lg:ml-72 pt-28 pb-16 lg:pt-6 lg:pb-6 px-3 md:px-6">
                {/* Header */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4 md:mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div>
                            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Welcome back, {barber?.name?.split(' ')[0] || 'Barber'}!</h1>
                            <p className="text-xs md:text-sm text-gray-500 mt-1">Here's your queue status for today</p>
                        </div>
                        <div className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-lg self-start">
                            <i className="fas fa-clock text-teal-500 text-sm"></i>
                            <span className="text-xs md:text-sm font-medium text-gray-700">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Only show on analytics tab or dashboard */}
                {activeTab === "analytics" && (
                    <div className="space-y-6">

                        {/* STATS CARDS */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

                            {/* TOTAL EARNINGS */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Total Earnings</p>
                                <p className="text-xl font-bold text-teal-600">₹{analytics?.totalEarnings || 0}</p>
                            </div>

                            {/* TODAY EARNINGS */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Today Earnings</p>
                                <p className="text-xl font-bold text-green-600">₹{analytics?.todayEarnings || 0}</p>
                            </div>

                            {/* TOTAL BOOKINGS */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Total Bookings</p>
                                <p className="text-xl font-bold text-gray-800">{analytics?.totalBookings || 0}</p>
                            </div>

                            {/* COMPLETED */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Completed</p>
                                <p className="text-xl font-bold text-blue-600">{analytics?.completedBookings || 0}</p>
                            </div>

                            {/* CANCELLED */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Cancelled</p>
                                <p className="text-xl font-bold text-red-600">{analytics?.cancelledBookings || 0}</p>
                            </div>

                            {/* TODAY BOOKINGS */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Today Bookings</p>
                                <p className="text-xl font-bold text-orange-600">{analytics?.todayBookings || 0}</p>
                            </div>

                        </div>

                        {/* QUEUE STATUS CARD */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Queue Status</p>
                                    <p className="text-xs text-gray-400">Real-time customer waiting</p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    Avg wait: <span className="font-semibold text-orange-600">{Math.ceil(waitingCount * 3)} min</span>
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-3xl font-bold text-orange-500">{waitingCount}</span>
                                <span className="text-sm text-gray-400">people waiting</span>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${waitingCount > 8 ? 'bg-red-500' :
                                        waitingCount > 4 ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(100, (waitingCount / 15) * 100)}%` }}
                                />
                            </div>

                            <p className="text-xs mt-2 text-gray-500">
                                {waitingCount > 8 ? "🔴 Heavy traffic" :
                                    waitingCount > 4 ? "🟡 Moderate queue" :
                                        "🟢 Light queue"}
                            </p>
                        </div>

                        {/* DAILY EARNINGS LIST */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700">Daily Earnings</h3>
                                    <span className="text-xs text-gray-400">
                                        Last {Object.entries(analytics?.earningsPerDay || {}).length} days
                                    </span>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {(analytics?.earningsPerDay && Object.entries(analytics.earningsPerDay).length > 0) ? (
                                    Object.entries(analytics.earningsPerDay)
                                        .reverse()
                                        .slice(0, 7)
                                        .map(([date, amount]) => {
                                            const isToday = () => {
                                                const today = new Date();
                                                const todayStr = `${today.toLocaleDateString('en-US', { month: 'short' })} ${today.getDate()}`;
                                                return date.includes(todayStr);
                                            };
                                            return (
                                                <div key={date} className={`flex justify-between items-center py-2.5 px-5 hover:bg-gray-50 transition ${isToday() ? 'bg-teal-50/20' : ''}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm ${isToday() ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                            {date}
                                                        </span>
                                                        {isToday() && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded">Today</span>
                                                        )}
                                                    </div>
                                                    <span className={`font-medium ${isToday() ? 'text-teal-600' : 'text-gray-700'}`}>
                                                        ₹{amount}
                                                    </span>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-gray-400 text-sm">No earnings data</p>
                                        <p className="text-gray-300 text-xs mt-1">Complete bookings to see earnings</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
                {/* Live Queue Tab */}
                {activeTab === "queue" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base md:text-lg font-semibold text-gray-800">Live Queue</h2>
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage your active and waiting customers</p>
                            {hasActiveService && (
                                <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded-lg">
                                    <i className="fas fa-info-circle mr-1"></i> You have an active customer. Complete current service before starting next.
                                </p>
                            )}
                            {loadingBookings && (
                                <p className="text-xs text-gray-500 mt-2">Loading queue...</p>
                            )}
                        </div>
                        <div className="divide-y divide-gray-100">
                            {/* Active/In-Service Customer */}
                            {queue.filter(c => c.status === "in_service").map((customer) => (
                                <div key={customer.id} className="p-4 md:p-5 bg-teal-50/50 hover:bg-teal-50 transition">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <i className="fas fa-cut text-white text-sm"></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-800 text-sm md:text-base">{customer.customerName}</p>
                                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                                                        <i className="fas fa-scissors mr-1"></i>In Service
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                                    <span className="text-xs text-gray-500"><i className="fas fa-cut mr-1"></i>{customer.service}</span>
                                                    <span className="text-xs text-gray-500"><i className="far fa-clock mr-1"></i>{customer.time}</span>
                                                    <span className="text-xs text-gray-500"><i className="fas fa-phone mr-1"></i>{customer.phone}</span>
                                                </div>
                                                {customer.notes && (
                                                    <p className="text-xs text-gray-400 mt-1"><i className="fas fa-sticky-note mr-1"></i>{customer.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCompleteService(customer.id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition w-full sm:w-auto"
                                        >
                                            <i className="fas fa-check mr-1"></i> Complete
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Waiting Customers - Displaying correct position */}
                            {queue.filter(c => c.status === "waiting").map((customer) => {
                                // Calculate display position (1-indexed for users)
                                const displayPosition = customer.position + 1;
                                const isNext = customer.position === 0;

                                return (
                                    <div key={customer.id} className="p-4 md:p-5 hover:bg-gray-50 transition">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-gray-600 font-bold text-sm">
                                                        #{displayPosition}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <p className="font-semibold text-gray-800 text-sm md:text-base">{customer.customerName}</p>

                                                        {/* Show "Next" badge for position 0 */}
                                                        {isNext && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                                <i className="fas fa-hourglass-half mr-1"></i>Next
                                                            </span>
                                                        )}

                                                        {/* Show position in queue for others */}
                                                        {!isNext && (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                                Position #{displayPosition}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                                                        <span className="text-xs text-gray-500"><i className="fas fa-cut mr-1"></i>{customer.service}</span>
                                                        <span className="text-xs text-gray-500"><i className="far fa-clock mr-1"></i>{customer.time}</span>
                                                        <span className="text-xs text-gray-500"><i className="fas fa-phone mr-1"></i>{customer.phone}</span>
                                                    </div>
                                                    {customer.notes && (
                                                        <p className="text-xs text-gray-400 mt-1"><i className="fas fa-sticky-note mr-1"></i>{customer.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStartService(customer.id)}
                                                    disabled={hasActiveService}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex-1 sm:flex-none ${hasActiveService
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-teal-500 text-white hover:bg-teal-600"
                                                        }`}
                                                >
                                                    <i className="fas fa-play mr-1"></i> Start
                                                </button>
                                                <button
                                                    onClick={() => cancelBooking(customer.id)}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition flex-1 sm:flex-none"
                                                >
                                                    <i className="fas fa-times mr-1"></i> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {queue.filter(c => c.status === "waiting" || c.status === "in_service").length === 0 && (
                                <div className="text-center py-12">
                                    <i className="fas fa-smile-wink text-gray-300 text-5xl mb-3"></i>
                                    <p className="text-gray-400">No customers in queue</p>
                                    {!barber?.isAvailable && (
                                        <p className="text-sm text-orange-500 mt-2">You are currently marked as unavailable</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}




                {/* History Tab */}
                {activeTab === "history" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">

                        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                            <div>
                                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                                    Service History
                                </h2>
                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                    All completed services
                                </p>
                            </div>

                            {/* 🔥 DATE FILTER */}
                            <div className="flex items-center gap-2">

                                {/* Today Button */}
                                <button
                                    onClick={() => loadHistory()}
                                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Today
                                </button>

                                {/* Date Picker */}
                                <input
                                    type="date"
                                    onChange={(e) => loadHistory(e.target.value)}
                                    className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                        </div>



                        <div className="divide-y divide-gray-100">

                            {(history || []).map((booking) => {
                                const start = new Date(booking.startTime);
                                const end = new Date(booking.endTime);

                                return (
                                    <div key={booking.id} className="p-4 md:p-5 hover:bg-gray-50 transition">

                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

                                            {/* LEFT */}
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm md:text-base">
                                                    {booking.customerName}
                                                </p>

                                                <div className="flex flex-wrap gap-2 mt-1">

                                                    <span className="text-xs text-gray-500">
                                                        <i className="fas fa-cut mr-1"></i>
                                                        {booking.services?.join(", ")}
                                                    </span>

                                                    <span className="text-xs text-gray-500">
                                                        <i className="far fa-calendar mr-1"></i>
                                                        {start.toLocaleDateString()}
                                                    </span>

                                                    <span className="text-xs text-gray-500">
                                                        <i className="far fa-clock mr-1"></i>
                                                        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>

                                                </div>
                                            </div>

                                            {/* RIGHT */}
                                            <div className="text-left sm:text-right">

                                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block">
                                                    <i className="fas fa-check mr-1"></i>Completed
                                                </span>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    at {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                );
                            })}

                            {(history || []).length === 0 && (
                                <div className="text-center py-12">
                                    <i className="fas fa-history text-gray-300 text-5xl mb-3"></i>
                                    <p className="text-gray-400">No service history yet</p>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="space-y-4 md:space-y-6">
                        {/* Availability Status Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800">Availability Status</h3>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">Toggle to receive new bookings</p>
                                </div>
                                <button
                                    onClick={toggleAvailability}
                                    className={`px-4 md:px-6 py-2 rounded-lg font-medium transition text-sm ${barber?.isAvailable
                                        ? "bg-green-500 text-white hover:bg-green-600"
                                        : "bg-red-500 text-white hover:bg-red-600"
                                        }`}
                                >
                                    {barber?.isAvailable ? "Available" : "Unavailable"}
                                </button>
                            </div>
                            {!barber?.isAvailable && (
                                <p className="text-xs md:text-sm text-orange-600 mt-3 bg-orange-50 p-3 rounded-lg">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    You are currently marked as unavailable. No new bookings will be assigned to you.
                                </p>
                            )}
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                                <h2 className="text-base md:text-lg font-semibold text-gray-800">Personal Information</h2>
                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">View your profile details</p>
                            </div>
                            <div className="p-4 md:p-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="md:w-1/3">
                                            <label className="text-xs md:text-sm text-gray-600 font-medium">Full Name</label>
                                        </div>
                                        <div className="md:w-2/3 mt-1 md:mt-0">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-gray-800 text-sm md:text-base">
                                                {barber?.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="md:w-1/3">
                                            <label className="text-xs md:text-sm text-gray-600 font-medium">Username</label>
                                        </div>
                                        <div className="md:w-2/3 mt-1 md:mt-0">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-gray-800 text-sm md:text-base">
                                                {barber?.username}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="md:w-1/3">
                                            <label className="text-xs md:text-sm text-gray-600 font-medium">Email Address</label>
                                        </div>
                                        <div className="md:w-2/3 mt-1 md:mt-0">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-gray-800 text-sm md:text-base break-all">
                                                {barber?.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="md:w-1/3">
                                            <label className="text-xs md:text-sm text-gray-600 font-medium">Phone Number</label>
                                        </div>
                                        <div className="md:w-2/3 mt-1 md:mt-0">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-gray-800 text-sm md:text-base">
                                                {barber?.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Services I Can Perform */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                                <h2 className="text-base md:text-lg font-semibold text-gray-800">Services I Can Perform</h2>
                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">List of services offered by you</p>
                            </div>
                            <div className="p-4 md:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                                    {barber?.services?.map((service, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 md:p-3 bg-teal-50 rounded-lg">
                                            <i className="fas fa-check-circle text-teal-500 text-xs md:text-sm"></i>
                                            <span className="text-gray-700 text-xs md:text-sm">{service}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showTransferModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-0 w-full max-w-md shadow-2xl transform transition-all duration-200 scale-100">

                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-teal-50 rounded-xl">
                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Transfer Bookings</h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Info message */}
                            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-blue-800">
                                    You have <span className="font-semibold">active bookings</span>. Select a barber to transfer them to.
                                </p>
                            </div>

                            {/* Barber list */}
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Barber
                            </label>

                            <div className="space-y-2 max-h-64 overflow-y-auto mb-6 pr-1">
                                {availableBarbers.map(b => (
                                    <div
                                        key={b.id}
                                        onClick={() => setSelectedBarber(b.id)}
                                        className={`
                flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer
                transition-all duration-200
                ${selectedBarber === b.id
                                                ? "border-teal-500 bg-teal-50 shadow-sm"
                                                : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                                            }
              `}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Avatar circle */}
                                            <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${selectedBarber === b.id
                                                    ? "bg-teal-500 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                                }
                `}>
                                                {b.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`font-medium ${selectedBarber === b.id ? "text-teal-700" : "text-gray-700"}`}>
                                                {b.fullName}
                                            </span>
                                        </div>

                                        {/* Check icon for selected */}
                                        {selectedBarber === b.id && (
                                            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTransferModal(false)}
                                    className="flex-1 px-4 py-2.5 text-gray-600 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTransfer}
                                    disabled={!selectedBarber}
                                    className={`
              flex-1 px-4 py-2.5 text-white font-medium rounded-xl
              transition-all duration-200
              ${selectedBarber
                                            ? "bg-teal-500 hover:bg-teal-600 hover:shadow-md active:scale-95"
                                            : "bg-gray-300 cursor-not-allowed"
                                        }
            `}
                                >
                                    Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>



    );
}