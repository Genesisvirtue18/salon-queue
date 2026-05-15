import { useNavigate } from "react-router-dom";

export default function PreviousBooking() {
    const navigate = useNavigate();

    // Latest past booking only
    const latestBooking = {
        barber: "David Brown",
        service: "Haircut + Beard Trim",
        queueNumber: 12,
        salon: "Luxury Hair Studio",
        time: "3:30 PM",
        date: "March 15, 2024",
        status: "Completed"
    };

    // Current active booking
    const currentBooking = {
        barber: "David Brown",
        service: "Haircut + Beard Trim",
        queueNumber: 5,
        salon: "Luxury Hair Studio",
        time: "Today, 4:00 PM",
        date: "April 9, 2026",
        status: "Waiting",
        position: "2nd in line",
        estimatedWait: "15-20 min"
    };

    const handleBookAgain = () => {
        console.log("Booking again with same barber and service");
        navigate("/kiosk/queue");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">

            {/* Header */}
            <div className="bg-white  py-3 text-center">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Previous Booking
                </h1>
                <p className="text-gray-500 mt-1">
                    Track your current queue and previous visit
                </p>
            </div>

            <div className="flex-1 px-4 py-4">
                <div className="max-w-3xl mx-auto">

                    {/* CURRENT QUEUE */}
                    <div className="mb-6">

                        <h2 className="text-lg font-semibold text-gray-700 mb-3">
                            Current Queue
                        </h2>

                        <div className="bg-teal-500 rounded-lg shadow-lg p-5 text-white">

                            <div className="flex items-center justify-between gap-4">

                                {/* Queue Number */}
                                <div>
                                    <p className="text-teal-100 text-xs mb-1">
                                        Your Queue
                                    </p>

                                    <div className="text-2xl font-bold">
                                        #{currentBooking.queueNumber}
                                    </div>


                                </div>

                                {/* Queue Info */}
                                <div className="grid grid-cols-2 gap-3 text-xs">

                                    <div>
                                        <p className="text-teal-100">Service</p>
                                        <p className="font-medium text-sm">
                                            {currentBooking.service}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-teal-100">Barber</p>
                                        <p className="font-medium text-sm">
                                            {currentBooking.barber}
                                        </p>
                                    </div>



                                </div>

                            </div>

                        </div>

                    </div>

                    {/* PREVIOUS BOOKING */}
                    <div className="mb-6">

                        <h2 className="text-lg font-semibold text-gray-700 mb-3">
                            Last Visit
                        </h2>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">

                            {/* Service + Queue */}
                            <div className="flex items-center justify-between mb-4">

                                <div>
                                    <p className="text-xs text-gray-600">Service</p>
                                    <h3 className="text-base font-semibold text-gray-800">
                                        {latestBooking.service}
                                    </h3>
                                </div>


                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">

                                <div>
                                    <p className="text-gray-600 text-xs">Barber</p>
                                    <p className="font-medium text-gray-800">
                                        {latestBooking.barber}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-xs">Date</p>
                                    <p className="font-medium text-gray-800">
                                        {latestBooking.date} • {latestBooking.time}
                                    </p>
                                </div>

                            </div>

                            {/* Button */}
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleBookAgain}
                                    className="bg-teal-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-teal-600 transition"
                                >
                                    Book Again
                                </button>
                            </div>

                        </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-center gap-3">

                        <button
                            onClick={() => navigate("/kiosk/services")}
                            className="px-30 py-3 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition"
                        >
                            Book New
                        </button>

                     

                    </div>

                </div>
            </div>
        </div>
    );
}