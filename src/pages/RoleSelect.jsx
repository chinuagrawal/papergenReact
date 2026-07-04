import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function RoleSelect() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);

  const slides = [
    {
      id: 0,
      title: "Generate Papers",
      desc: "Create professional question papers in minutes with our automated tools.",
      image: "https://picsum.photos/id/20/800/400",
    },
    {
      id: 1,
      title: "Huge Question Bank",
      desc: "Access thousands of questions across various boards, classes, and subjects.",
      image: "https://picsum.photos/id/24/800/400",
    },
    {
      id: 2,
      title: "Export to PDF",
      desc: "Download print-ready PDFs instantly and share them with your students.",
      image: "https://picsum.photos/id/48/800/400",
    },
  ];

  useEffect(() => {
    document.title = showOnboarding
      ? "Onboarding - ThePaperPlus"
      : "Select Role - ThePaperPlus";
  }, [showOnboarding]);

  const handleSelect = async (role) => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return navigate("/");

    try {
      const res = await fetch(`${API}/api/save-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, role }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userRole", role);
        navigate(role === "teacher" ? "/teacher" : "/student");
      } else {
        alert(data.message || "Failed to save role");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  if (showOnboarding) {
    return (
      <div className="bg-surface text-on-surface font-body min-h-screen">
        {/* Top AppBar (Onboarding Shell) */}
        <header className="w-full top-0 sticky bg-surface dark:bg-background flex justify-between items-center px-6 py-4 z-50">
          <div
            className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate("/")}
          >
            <span
              className="material-symbols-outlined text-primary dark:text-primary-fixed"
              data-icon="school"
            >
              school
            </span>
            <span className="text-primary dark:text-primary-fixed font-display font-bold text-xl tracking-tight">
              ThePaperPlus
            </span>
          </div>
          <button
            onClick={() => setShowOnboarding(false)}
            className="px-4 py-2 text-primary font-bold font-display text-headline-sm hover:opacity-80 transition-opacity active:scale-95 transition-transform cursor-pointer"
          >
            Skip
          </button>
        </header>

        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 pb-24 overflow-hidden relative">
          {/* Background Atmospheric Element (Asymmetry) */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

          {/* Main Content Canvas */}
          <div className="max-w-md w-full flex flex-col items-center paper-slide-in">
            {/* Hero Graphic (Academic Curator Identity) */}
            <div className="relative w-80 h-[420px] mb-12 flex items-center justify-center">
              {/* Decorative Layering */}
              <div className="absolute inset-0 bg-surface-container-low rounded-full scale-110 opacity-50 blur-xl"></div>

              {/* Main Illustrative Component */}
              <div
                className="relative z-10 w-full h-full bg-surface-container-lowest rounded-xl flex flex-col p-5 overflow-hidden transition-all duration-700 hover:rotate-1"
                style={{ boxShadow: "0 32px 64px rgba(25, 28, 29, 0.06)" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="h-2 w-16 bg-surface-container-high rounded-full"></div>
                  <div className="h-2 w-8 bg-tertiary opacity-20 rounded-full"></div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary-container flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-on-secondary-container text-base"
                        data-icon="description"
                      >
                        description
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 bg-on-surface-variant opacity-10 rounded-full"></div>
                      <div className="h-2 w-1/2 bg-on-surface-variant opacity-10 rounded-full"></div>
                    </div>
                  </div>

                  {/* Asymmetric Data Visualization */}
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="h-16 bg-surface-container-low rounded-lg p-2 flex flex-col justify-end">
                      <div className="h-6 w-full bg-primary opacity-20 rounded-sm"></div>
                    </div>
                    <div className="h-16 bg-surface-container-low rounded-lg p-2 flex flex-col justify-end">
                      <div className="h-10 w-full bg-primary opacity-40 rounded-sm"></div>
                    </div>
                    <div className="h-16 bg-surface-container-low rounded-lg p-2 flex flex-col justify-end">
                      <div className="h-8 w-full bg-primary opacity-10 rounded-sm"></div>
                    </div>
                  </div>

                  <div className="h-1 w-full bg-outline-variant opacity-20 mt-2"></div>

                  {/* Ghost image representing the paper result */}
                  <div className="mt-2 flex justify-center">
                    <div className="w-full h-52 rounded-lg overflow-hidden border border-outline-variant border-opacity-10 bg-surface-container-low">
                      <img
                        className="w-full h-full object-cover"
                        alt="A clean, professional academic assessment paper"
                        src={slides[currentSlide].image}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.innerHTML = `
                            <div class="flex items-center justify-center h-full text-on-surface-variant">
                              <span class="material-symbols-outlined text-4xl">image</span>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Tertiary Accent */}
              <div
                className="absolute -bottom-4 -right-4 w-16 h-16 bg-tertiary-fixed rounded-full flex items-center justify-center transform rotate-12"
                style={{ boxShadow: "0 32px 64px rgba(25, 28, 29, 0.06)" }}
              >
                <span
                  className="material-symbols-outlined text-on-tertiary-fixed text-2xl"
                  data-icon="auto_awesome"
                >
                  auto_awesome
                </span>
              </div>
            </div>

            {/* Content Hierarchy */}
            <div className="text-center space-y-4 px-4">
              <h1 className="text-on-surface font-display font-extrabold text-[2.25rem] leading-[1.1] tracking-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-on-surface-variant font-body text-lg max-w-sm mx-auto leading-relaxed opacity-80">
                {slides[currentSlide].desc}
              </p>
            </div>
          </div>
        </main>

        {/* Navigation & CTA Shell */}
        <footer className="fixed bottom-0 w-full bg-surface/80 backdrop-blur-xl px-6 pb-12 pt-4">
          <div className="max-w-md mx-auto space-y-8">
            {/* Pagination Indicators (Shared Logic) */}
            <nav className="flex justify-center items-center gap-3 w-full">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: currentSlide === idx ? "2rem" : "0.5rem",
                    backgroundColor:
                      currentSlide === idx ? "#003d9b" : "#b6c8fe",
                    opacity: currentSlide === idx ? 1 : 0.4,
                  }}
                ></div>
              ))}
            </nav>

            {/* Primary Action */}
            <div className="flex flex-col w-full">
              <button
                onClick={handleNext}
                className="text-white font-headline font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #003d9b 0%, #0052cc 100%)",
                  boxShadow: "0 12px 40px -12px rgba(0, 61, 155, 0.2)",
                }}
              >
                <span>
                  {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                </span>
                {currentSlide !== slides.length - 1 && (
                  <span
                    className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform"
                    data-icon="arrow_forward"
                  >
                    arrow_forward
                  </span>
                )}
              </button>
            </div>
          </div>
        </footer>

        {/* Custom Styles for Animations */}
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          @keyframes paper-slide-in {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .paper-slide-in {
            animation: paper-slide-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
      </div>
    );
  }

  // Role selection screen - simplified layout
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      {/* Decorative background elements */}
      <div className="fixed -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -top-12 -left-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main container */}
      <div className="max-w-md mx-auto relative min-h-screen flex flex-col">
        {/* Top Bar Decor */}
        <div className="pt-8 px-6 flex justify-between items-center">
          <button
            className="p-2 -ml-2 text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
            onClick={() => navigate("/login")}
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <div className="flex gap-1.5">
            <div className="h-1.5 w-8 rounded-full bg-primary"></div>
            <div className="h-1.5 w-8 rounded-full bg-surface-container-high"></div>
            <div className="h-1.5 w-8 rounded-full bg-surface-container-high"></div>
          </div>
        </div>

        {/* Hero Typography */}
        <div className="px-8 pt-8 mb-6">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary leading-tight">
            Select Your <br />
            Learning Role
          </h1>
          <p className="mt-4 text-secondary font-medium leading-relaxed max-w-[280px]">
            Choose your role to personalize your experience with ThePaperPlus.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="px-8 flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Teacher */}
            <button
              className={`group relative flex flex-col items-start p-6 bg-surface-container-lowest rounded-xl text-left transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(0,61,155,0.12)] border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 ${selectedRole === "teacher" ? "border-primary shadow-[0_12px_40px_-12px_rgba(0,61,155,0.12)]" : "hover:border-primary-fixed"}`}
              onClick={() => setSelectedRole("teacher")}
            >
              <div
                className={`mb-4 h-12 w-12 rounded-xl bg-surface-container flex items-center justify-center transition-colors ${selectedRole === "teacher" ? "bg-primary-fixed" : "group-hover:bg-primary-fixed"}`}
              >
                <span
                  className={`material-symbols-outlined text-primary transition-colors ${selectedRole === "teacher" ? "text-primary-container" : "group-hover:text-primary-container"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  school
                </span>
              </div>
              <div>
                <span className="block font-headline text-xl font-bold text-on-surface mb-1">
                  Teacher
                </span>
                <span className="block text-secondary text-sm font-medium opacity-80">
                  Create question papers, manage content, and elevate your
                  teaching.
                </span>
              </div>
              <div
                className={`absolute top-6 right-6 transition-opacity ${selectedRole === "teacher" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
              </div>
            </button>

            {/* Student */}
            <button
              className={`group relative flex flex-col items-start p-6 bg-surface-container-lowest rounded-xl text-left transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(0,61,155,0.12)] border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 ${selectedRole === "student" ? "border-primary shadow-[0_12px_40px_-12px_rgba(0,61,155,0.12)]" : "hover:border-primary-fixed"}`}
              onClick={() => setSelectedRole("student")}
            >
              <div
                className={`mb-4 h-12 w-12 rounded-xl bg-surface-container flex items-center justify-center transition-colors ${selectedRole === "student" ? "bg-primary-fixed" : "group-hover:bg-primary-fixed"}`}
              >
                <span
                  className={`material-symbols-outlined text-primary transition-colors ${selectedRole === "student" ? "text-primary-container" : "group-hover:text-primary-container"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  person
                </span>
              </div>
              <div>
                <span className="block font-headline text-xl font-bold text-on-surface mb-1">
                  Student
                </span>
                <span className="block text-secondary text-sm font-medium opacity-80">
                  Practice questions, take tests, and track your academic
                  growth.
                </span>
              </div>
              <div
                className={`absolute top-6 right-6 transition-opacity ${selectedRole === "student" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Fixed bottom section with button */}
        <div className="bg-surface/95 backdrop-blur-sm pb-8 pt-4">
          <div className="px-8 flex flex-col items-center">
            <p className="text-xs text-outline font-medium tracking-wide uppercase mb-4">
              You can change this later in settings
            </p>
            <button
              onClick={() => selectedRole && handleSelect(selectedRole)}
              disabled={!selectedRole}
              className="w-full py-4 rounded-xl shadow-lg text-white font-headline font-bold text-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #003d9b 0%, #0052cc 100%)",
                boxShadow: "0 12px 40px -12px rgba(0, 61, 155, 0.2)",
              }}
            >
              Continue Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;
