import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "/src/images/hero-mobile.png";
import "./OtpLogin.css";

const OtpLogin = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // ✅ Auto redirect based on role (on page load)
  useEffect(() => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return;

    axios
      .post("http://localhost:5000/api/get-user", { mobile })
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
      const res = await axios.post("http://localhost:5000/api/send-otp", { mobile });
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
    if (!otp) return alert("Enter OTP");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp", { mobile, otp });
      if (res.data.success) {
        alert("Login successful!");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-lg p-8 text-center animate-fadeIn">
        {/* 🧠 Logo */}
        <img
          src={logo}
          alt="App Logo"
          className="w-36 h-36 mx-auto mb-6 rounded-2xl shadow-[0_8px_30px_rgba(37,117,252,0.3)] transition-transform duration-300 hover:scale-105"
        />

        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Welcome to <span className="text-blue-600">Paper Generation</span>
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Powered by <strong>PaprPlus</strong>
        </p>

        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={sendOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              onClick={sendOtp}
              disabled={timer > 0}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition"
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OtpLogin;
