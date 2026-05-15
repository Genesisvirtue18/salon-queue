import { useState } from "react";

export default function CustomerDetails() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    console.log(name, phone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col justify-center items-center px-6 relative overflow-hidden">
      
      {/* Animated Background Circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      
      {/* Subtle Floating Emojis - Queue Related */}
      {/* Clock - Time related */}
      <div className="absolute top-24 right-16 text-3xl opacity-30 animate-float" style={{ animationDuration: '6s' }}>
        ⏰
      </div>
      
      {/* People - Customer related */}
      <div className="absolute bottom-32 left-12 text-4xl opacity-25 animate-float-delayed" style={{ animationDuration: '7s' }}>
        👥
      </div>
      
      {/* Ticket - Queue number related */}
      <div className="absolute top-1/3 right-20 text-3xl opacity-20 animate-float-slow" style={{ animationDuration: '8s' }}>
        🎫
      </div>
      
      {/* Checkmark - Confirmation related */}
      <div className="absolute bottom-40 right-16 text-3xl opacity-25 animate-float" style={{ animationDuration: '5.5s' }}>
        ✅
      </div>
      
      {/* Person walking - Waiting related */}
      <div className="absolute top-2/3 left-8 text-3xl opacity-20 animate-float-delayed" style={{ animationDuration: '6.5s' }}>
        🚶
      </div>
      
      {/* Bell - Notification related */}
      <div className="absolute top-40 left-12 text-2xl opacity-20 animate-float-slow" style={{ animationDuration: '7.5s' }}>
        🔔
      </div>
      
      {/* Phone - Contact related */}
      <div className="absolute bottom-20 right-32 text-2xl opacity-20 animate-float" style={{ animationDuration: '6.8s' }}>
        📱
      </div>
      
      {/* Star - Experience related */}
      <div className="absolute top-1/4 right-40 text-2xl opacity-15 animate-float-delayed" style={{ animationDuration: '9s' }}>
        ⭐
      </div>

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

      {/* Content */}
      <div className="relative z-10 w-full max-w-xl">
        
      

        {/* Title */}
        <h1 className="text-4xl font-semibold mb-3 text-center text-gray-800">
          Join the Queue
        </h1>

        <p className="text-gray-500 mb-12 text-lg text-center">
          Please enter your details to get started
        </p>

        {/* Inputs */}
        <div className="w-full space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-lg py-3 px-4 rounded-xl transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-lg py-3 px-4 rounded-xl transition-all duration-200"
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="mt-10 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium"
        >
          Join Queue
        </button>

        {/* Footer Note */}
        <p className="text-center text-gray-400 text-sm mt-6">
          You'll receive a queue number and estimated wait time
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes floatDelayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: floatDelayed 7s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: floatSlow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}