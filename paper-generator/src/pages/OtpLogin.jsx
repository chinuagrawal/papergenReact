import React, { useState } from "react";
import axios from "axios";
import { Phone, Lock, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "/src/images/hero-mobile.png";

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-soft">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Logo Container */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-xl opacity-50 animate-pulse-glow" />
              <img
                src={logo}
                alt="App Logo"
                className="relative w-32 h-32 mx-auto rounded-3xl shadow-glow object-cover"
              />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-foreground">
              Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">PaprPlus</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Secure login with OTP verification
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 backdrop-blur-sm p-8 space-y-6">
            {step === 1 ? (
              <div className="space-y-4 animate-slideUp">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="pl-11 h-12 text-base"
                      maxLength={10}
                    />
                  </div>
                  {mobile.length > 0 && mobile.length < 10 && (
                    <p className="mt-1.5 text-sm text-destructive">
                      Please enter a valid 10-digit mobile number
                    </p>
                  )}
                </div>

                <Button
                  onClick={sendOtp}
                  disabled={loading || mobile.length !== 10}
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-opacity text-base font-semibold shadow-lg hover:shadow-glow"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-slideUp">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pl-11 h-12 text-base tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    OTP sent to +91 {mobile}
                  </p>
                </div>

                <Button
                  onClick={verifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-success hover:bg-success/90 transition-colors text-base font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Login
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={sendOtp}
                    disabled={timer > 0 || loading}
                    className="text-sm font-medium text-primary hover:text-primary-light disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setTimer(0);
                    }}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change number
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:text-primary-light font-medium transition-colors">
              Terms & Conditions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpLogin;