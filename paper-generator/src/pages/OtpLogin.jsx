import React, { useState } from "react";
import axios from "axios";
import "./OtpLogin.css";
import logo from "/src/images/hero-mobile.png"; // ✅ adjust path if needed


const OtpLogin = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

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

  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp", { mobile, otp });
      if (res.data.success) {
        alert("Login successful!");
        localStorage.setItem("userMobile", mobile);
        window.location.href = "/role";
      } else alert(res.data.message || "Invalid OTP");
    } catch {
      alert("Error verifying OTP");
    }
    setLoading(false);
  };

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
    <div className="otp-container">
      <div className="otp-card">
        <img src={logo} alt="App Logo" className="otp-logo" />
        <h3>Welcome to paper generation by PaprPlus</h3><br/>

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="otp-input"
            />
            <button onClick={sendOtp} className="otp-button" disabled={loading}>
              {loading ? "Sending..." : "Continue"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="otp-input"
            />
            <button onClick={verifyOtp} className="otp-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button onClick={sendOtp} className="resend-btn" disabled={timer > 0}>
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OtpLogin;
