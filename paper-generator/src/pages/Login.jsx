import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsOtpSent(true);
    alert("OTP sent successfully (mock)");
  };

  const handleVerifyOtp = () => {
    if (otp === "1234") {
      alert("OTP Verified!");
      navigate("/role");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1>📱 Login with Mobile</h1>

        {!isOtpSent ? (
          <>
            <input
              type="tel"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <button onClick={handleSendOtp}>Send OTP</button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP (try 1234)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
