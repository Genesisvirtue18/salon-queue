import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 font-raleway relative overflow-hidden">

      {/* Decorative circles in background */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }}></div>

      {/* Welcome Card - Same design, solid white background */}
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center w-[500px] relative z-10">

        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Welcome <span className="inline-block animate-wave">👋</span>
        </h1>

        <p className="text-gray-500 mb-8">
  Enter your details to join the queue
        </p>

        <button
          onClick={() => navigate("/kiosk/services")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-green-700 hover:scale-105 transition-all duration-300"
        >
          Start Now
        </button>

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