import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function RoleSelect() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      icon: "assignment",
      title: "Generate Papers",
      desc: "Create professional question papers in minutes with our automated tools.",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      id: 2,
      icon: "library_books",
      title: "Huge Question Bank",
      desc: "Access thousands of questions across various boards, classes, and subjects.",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      id: 3,
      icon: "picture_as_pdf",
      title: "Export to PDF",
      desc: "Download print-ready PDFs instantly and share them with your students.",
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

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

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentSlide(index);
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        {/* Skip Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowOnboarding(false)}
            className="text-gray-500 font-medium text-sm px-4 py-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Slides Container */}
        <div
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full h-full flex flex-col justify-center items-center p-8 snap-center"
            >
              <div
                className={`w-40 h-40 rounded-full flex items-center justify-center mb-8 ${slide.bg}`}
              >
                <span className={`material-icons text-7xl ${slide.color}`}>
                  {slide.icon}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                {slide.title}
              </h2>
              <p className="text-gray-600 text-center text-lg leading-relaxed max-w-xs">
                {slide.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Indicators & Button */}
        <div className="p-6 pb-10 flex flex-col items-center gap-6">
          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (currentSlide < slides.length - 1) {
                // Determine width of one slide and scroll
                const container = document.querySelector(".snap-x");
                if (container) {
                  container.scrollBy({
                    left: container.clientWidth,
                    behavior: "smooth",
                  });
                }
              } else {
                setShowOnboarding(false);
              }
            }}
            className="w-full max-w-xs bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            {currentSlide === slides.length - 1 ? (
              <>
                Get Started <span className="material-icons text-sm">arrow_forward</span>
              </>
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Who are you?</h1>
          <p className="text-gray-500">Select your role to continue</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSelect("teacher")}
            className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-center gap-5 text-left"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <span className="material-icons text-3xl text-blue-600 group-hover:text-white">
                school
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Teacher</h3>
              <p className="text-gray-500 text-sm">
                Create papers & manage content
              </p>
            </div>
            <span className="material-icons text-gray-300 ml-auto group-hover:text-blue-600">
              chevron_right
            </span>
          </button>

          <button
            onClick={() => handleSelect("student")}
            className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group flex items-center gap-5 text-left"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <span className="material-icons text-3xl text-purple-600 group-hover:text-white">
                person_outline
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Student</h3>
              <p className="text-gray-500 text-sm">
                Practice questions & take tests
              </p>
            </div>
            <span className="material-icons text-gray-300 ml-auto group-hover:text-purple-600">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;
