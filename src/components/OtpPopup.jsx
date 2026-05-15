import { useEffect, useRef } from "react";

export default function OtpPopup({
    show,
    email,
    otpCode,
    setOtpCode,
    otpError,
    verifyOtpAndComplete,
    resendOtp,
    countdown,
    startCountdown,
    setShowOtpPopup,
    showToastMessage
}) {

    const inputRefs = useRef([]);

    useEffect(() => {

        if (show) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }

    }, [show]);

    const handleOtpChange = (index, e) => {

        const value = e.target.value;

        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otpCode];

        newOtp[index] = value;

        setOtpCode(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {

        if (e.key === "Backspace") {

            const newOtp = [...otpCode];

            if (otpCode[index]) {

                newOtp[index] = "";

                setOtpCode(newOtp);

                return;
            }

            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">

            <div
                className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="p-8">

                    <div className="text-center mb-6">

                        <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">

                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />

                            </svg>

                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Verification Code
                        </h2>

                        <p className="text-gray-400 text-sm">
                            We've sent a 6-digit code to
                            <br />

                            <span className="text-teal-500 font-medium">
                                {email}
                            </span>
                        </p>

                    </div>

                    <div className="flex justify-center gap-3 mb-6">

                        {otpCode.map((digit, index) => (

                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="
                                    w-12 h-14
                                    text-center text-2xl font-bold
                                    bg-gray-800
                                    border-2 border-gray-600
                                    rounded-xl
                                    text-white
                                    focus:border-teal-500
                                    focus:outline-none
                                "
                            />

                        ))}

                    </div>

                    {otpError && (
                        <p className="text-red-500 text-sm text-center mb-4">
                            {otpError}
                        </p>
                    )}

                    <button
                        onClick={verifyOtpAndComplete}
                        className="
                            w-full bg-teal-500 text-white py-3 rounded-xl
                            font-semibold hover:bg-teal-600 transition-all
                        "
                    >
                        Verify & Register
                    </button>

                    <div className="text-center mt-4">

                        <button
                            onClick={async () => {

                                if (countdown > 0) return;

                                try {

                                    await resendOtp({
                                        email
                                    });

                                    startCountdown();

                                    showToastMessage(
                                        "OTP resent successfully 📩",
                                        "success"
                                    );

                                } catch (err) {

                                    showToastMessage(
                                        err || "Failed to resend OTP",
                                        "error"
                                    );
                                }
                            }}

                            disabled={countdown > 0}

                            className={`text-sm font-medium transition ${
                                countdown > 0
                                    ? "text-gray-500 cursor-not-allowed"
                                    : "text-teal-400 hover:text-teal-300"
                            }`}
                        >

                            {
                                countdown > 0
                                    ? `Resend in ${countdown}s`
                                    : "Resend Code"
                            }

                        </button>

                    </div>

                    <button
                        onClick={() => setShowOtpPopup(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >

                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />

                        </svg>

                    </button>

                </div>

            </div>

        </div>
    );
}