import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 🔥 API Base URL from .env
const API = import.meta.env.VITE_API_URL;

const OtpLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ThePaperPlus - Sign In";
  }, []);

  const [mobile, setMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // ✅ Auto redirect based on role (on page load)
  useEffect(() => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return;

    axios
      .post(`${API}/api/get-user`, { mobile })
      .then((res) => {
        const role = res.data.user?.role;
        if (role === "teacher") navigate("/teacher");
        else if (role === "student") navigate("/student");
        else navigate("/role");
      })
      .catch(() => {
        localStorage.clear();
      });
  }, []);

  // ✅ Send OTP
  const sendOtp = async () => {
    if (mobile.length !== 10) return alert("Enter valid mobile number");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/send-otp`, { mobile });
      if (res.data.success) {
        setStep(2);
        startTimer();
      } else alert(res.data.message || "Failed to send OTP");
    } catch {
      alert("Error connecting to server");
    }

    setLoading(false);
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) return alert("Enter OTP");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/verify-otp`, { mobile, otp });
      if (res.data.success) {
        localStorage.setItem("userMobile", mobile);
        navigate("/role");
      } else alert(res.data.message || "Invalid OTP");
    } catch {
      alert("Error verifying OTP");
    }

    setLoading(false);
  };

  // ✅ Timer for resend OTP
  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single character
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Handle OTP keydown for backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="text-on-surface min-h-screen w-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed overflow-hidden">
      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Logo Section - Prominent & Large */}
        <div className="mb-12 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <span
              className="material-symbols-outlined text-4xl sm:text-5xl md:text-6xl"
              data-icon="menu_book"
              style={{ color: "#003d9b", fontVariationSettings: "'FILL' 1" }}
            >
              menu_book
            </span>
            <span
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight headline-font"
              style={{ color: "#003d9b" }}
            >
              ThePaperPlus
            </span>
          </div>
          <div
            className="h-1 w-24 rounded-full"
            style={{ backgroundColor: "rgba(0, 61, 155, 0.2)" }}
          ></div>
        </div>

        {/* Main Login Card */}
        <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-2xl p-6 sm:p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,61,155,0.08)] border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-500">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2 headline-font">
              Welcome Back
            </h1>
            <p className="text-secondary font-medium">
              Please sign in to access your dashboard
            </p>
          </div>

          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              step === 1 ? sendOtp() : verifyOtp();
            }}
          >
            {step === 1 ? (
              // Mobile Number Input (Step 1)
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-outline headline-font">
                  Mobile Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <span
                      className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors"
                      data-icon="smartphone"
                    >
                      smartphone
                    </span>
                  </div>
                  <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                    <span className="text-on-surface/50 font-semibold text-base border-r border-outline-variant/50 pr-3">
                      +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="00000-00000"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="block w-full pl-[92px] pr-5 py-4 bg-surface-container-low border-0 rounded-xl text-on-surface font-semibold placeholder:text-outline/40 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-base"
                  />
                </div>
              </div>
            ) : (
              // OTP Section (Step 2)
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline headline-font">
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={timer > 0}
                    className="text-xs font-bold transition-all"
                    style={{ color: timer > 0 ? "#737685" : "#003d9b" }}
                  >
                    {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                  </button>
                </div>
                <div className="flex gap-3 justify-between">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="tel"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-full aspect-square text-center text-xl font-bold rounded-xl bg-surface-container-low border-0 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Security Note */}
            <div
              className="flex items-start gap-3 px-4 py-4 rounded-xl"
              style={{
                backgroundColor: "rgba(0, 61, 155, 0.05)",
                border: "1px solid rgba(0, 61, 155, 0.1)",
              }}
            >
              <span
                className="material-symbols-outlined text-xl mt-0.5"
                data-icon="verified_user"
                style={{ color: "#003d9b" }}
              >
                verified_user
              </span>
              <p className="text-xs text-secondary leading-relaxed font-medium">
                {step === 1
                  ? "Enter your registered mobile number to receive a secure verification code."
                  : "A secure 6-digit code has been sent to your registered mobile number for verification."}
              </p>
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-4 text-white rounded-xl font-headline font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
              style={{
                backgroundColor: "#003d9b",
                boxShadow: "0 4px 20px rgba(0, 61, 155, 0.2)",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#0052cc";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#003d9b";
              }}
            >
              {loading
                ? step === 1
                  ? "Sending..."
                  : "Verifying..."
                : step === 1
                  ? "Send Verification Code"
                  : "Verify & Sign In"}
              {!loading && (
                <span
                  className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
                  data-icon="arrow_forward"
                >
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Trusted By Section */}
          <div className="mt-12 pt-8 border-t border-outline-variant/30 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-outline mb-6">
              Trusted By Institutions
            </span>
            <div className="flex gap-8 opacity-30 grayscale items-center">
              <span
                className="material-symbols-outlined text-3xl"
                data-icon="account_balance"
              >
                account_balance
              </span>
              <span
                className="material-symbols-outlined text-3xl"
                data-icon="school"
              >
                school
              </span>
              <span
                className="material-symbols-outlined text-3xl"
                data-icon="history_edu"
              >
                history_edu
              </span>
              <span
                className="material-symbols-outlined text-3xl"
                data-icon="dictionary"
              >
                dictionary
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 flex flex-col items-center px-8 gap-6 mt-auto">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <a
            className="font-label text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="font-label text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="font-label text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
            href="#"
          >
            Help Center
          </a>
        </div>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline/60">
          © 2024 ThePaperPlus Editorial Intelligence
        </p>
      </footer>
    </div>
  );
};

export default OtpLogin;
