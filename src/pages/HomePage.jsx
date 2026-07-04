import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="bg-surface text-on-surface">
      {/* TopAppBar */}
      <nav className="w-full top-0 sticky bg-[#f8f9fa] dark:bg-slate-900 shadow-sm dark:shadow-none z-50">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#003d9b] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              menu_book
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-[#003d9b] dark:text-blue-400">
              ThePaperPlus
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              className="text-[#003d9b] dark:text-blue-300 font-semibold border-b-2 border-[#003d9b] py-1"
              href="#"
            >
              Home
            </a>
            <a
              className="text-slate-600 dark:text-slate-400 hover:text-[#003d9b] transition-all duration-200"
              href="#"
            >
              Features
            </a>
            <a
              className="text-slate-600 dark:text-slate-400 hover:text-[#003d9b] transition-all duration-200"
              href="#"
            >
              How it Works
            </a>
            <Link
              to="/login"
              className="bg-[#003d9b] text-white px-6 py-2 rounded-lg font-bold transition-all duration-200 hover:shadow-lg active:scale-95"
            >
              Login
            </Link>
          </div>
          <button className="md:hidden p-2 text-[#003d9b]">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <span className="inline-block px-4 py-1.5 mb-6 text-[0.75rem] font-bold uppercase tracking-wider bg-secondary-fixed text-on-secondary-fixed-variant rounded-full">
                Editorial Intelligence
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-[#003d9b] tracking-tight leading-tight mb-6">
                One Platform for Question Paper Generation and Student Practice
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                Teachers can create structured question papers while students
                can practice from question banks and take tests. A unified
                ecosystem for academic excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white px-8 py-4 rounded-lg font-bold text-lg shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Get Started
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Link>
                <button className="border-2 border-slate-300/40 text-[#003d9b] px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                  Schedule Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#b6c8fe]/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#ffdbcf]/20 rounded-full blur-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden aspect-square md:aspect-video flex items-center justify-center border border-slate-200">
                <img
                  alt="Education Setup"
                  className="w-full h-full object-cover opacity-90"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuZLaGjrhRZLloVeR9j3JMwk_iLO8NSLcz9oxEDzi67X5QP4T_SlpB3Zl9U4QsbeCM5Ww7iI5mw7CokLloTQy8lbv838stUpL4-7xgzxgNJGA_9T4AuNB_GL5EXWB9eNJrXE8w5ZTaLNWFQ0QKyX8b0kfbLoEjthQ8CyJKYIWTz4znSfoPNvdeQpclM4fzmpNXoNylmx98OoiodmLuQTTfF-ocl5zxeCU-GnwZOk5SU34qTxaVetKei8s78lffOAFVFOpuOuzkLbg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#003d9b]/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-[#003d9b] mb-2">
                  50k+
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Papers Generated
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-[#003d9b] mb-2">
                  1M+
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Questions Available
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-[#003d9b] mb-2">
                  200k+
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Students Practicing
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-[#003d9b] mb-2">
                  40+
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Subjects Covered
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section: Bento Grid Style */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-[#003d9b] mb-4">
              Empowering Both Sides of the Classroom
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Tailored tools for educators to curate knowledge and students to
              master it.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* For Teachers */}
            <div className="lg:col-span-7 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#003d9b]/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#003d9b] text-3xl">
                    cast_for_education
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#003d9b] mb-6">
                  For Teachers: Precise Curation
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#7b2600]">
                      check_circle
                    </span>
                    <p className="text-slate-600 font-medium">
                      Generate question papers in minutes
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#7b2600]">
                      check_circle
                    </span>
                    <p className="text-slate-600 font-medium">
                      Manage private question banks
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#7b2600]">
                      check_circle
                    </span>
                    <p className="text-slate-600 font-medium">
                      Create custom exam patterns
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#7b2600]">
                      check_circle
                    </span>
                    <p className="text-slate-600 font-medium">
                      Export high-quality PDFs
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#003d9b]/5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
            </div>
            {/* Role Preview: Teacher */}
            <div className="lg:col-span-5 bg-[#003d9b] p-8 rounded-2xl text-white flex flex-col justify-between overflow-hidden relative">
              <div>
                <h4 className="text-xl font-bold mb-2">Teacher Hub</h4>
                <p className="text-[#b2c5ff] text-sm">
                  Create and manage exam papers easily with our proprietary
                  generation engine.
                </p>
              </div>
              <img
                alt="Teacher tools"
                className="mt-6 rounded-lg object-cover h-40 w-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2Tah-r2YrbH4pEcgru4txT9s-2b4aVxzwt9cSmC7CBKJairCCRZ4W8Givl02LLBxS_KEMDqVAeXqU450IVRRzaZBbNhoGbrH0HisdZqWT4kINpPtbw4UHQ0EEIweLI6uPU0SWbZEyvSh0bO-O8pnXz0AZUxZfAsueGRwSAMySJRd1tQmz-3zEfsv4fFBa0Plrhb50APB_fS5NMRaHh7dSX7g_yI9Useewm8dhAmaRUsfxYk6rp1IBm2viWIkosmJB_qXqb2y49Ws"
              />
            </div>
            {/* Role Preview: Student */}
            <div className="lg:col-span-5 bg-[#7b2600] p-8 rounded-2xl text-white flex flex-col justify-between overflow-hidden relative">
              <div>
                <h4 className="text-xl font-bold mb-2">Student Hub</h4>
                <p className="text-[#ffb59b] text-sm">
                  Practice questions and improve performance through data-driven
                  insights.
                </p>
              </div>
              <img
                alt="Student practice"
                className="mt-6 rounded-lg object-cover h-40 w-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrnzedQxeOsB9mdk7b19Wzuq35_lLKWuj3Ec4OukS1JSNW3pbl6enCVPIFXMsP9B_KJtxy51cTFEg_L3CTWzRrRe20U_gLhqOkpl1q3JD1qTkM-_ThSdcczEphiHxd6itw5vsxusPfQ1BizjbW0Fx0czne679CfiZIGIij4GQD19GPnRQSpqqIBNIbWVWyHbsPXuQPgbU_rocJEvUoTEVZLiB2bM8HI__v0RTtelC7iFS15dYSl9CiK8IXZy1AioRMJpFYWs0pwyE"
              />
            </div>
            {/* For Students */}
            <div className="lg:col-span-7 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#7b2600]/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#7b2600] text-3xl">
                    psychology
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#7b2600] mb-6">
                  For Students: Adaptive Mastery
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#003d9b]">
                      check_circle
                    </span>
                    <p className="text-slate-600 font-medium">
                      Practice from vast question banks
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#003d9b]">
                      check_circle
                    </span>
                    <p className="text-slate-600 font-medium">
                      Take timed mock tests
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#003d9b]">
                      check_circle
                    </span>
                    <p className="text-slate-600 font-medium">
                      Track preparation performance
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#003d9b]">
                      check_circle
                    </span>
                    <p className="text-slate-600 font-medium">
                      Subject-wise preparation charts
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#7b2600]/5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 bg-slate-100">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Teacher Flow */}
              <div>
                <span className="text-[#003d9b] font-extrabold uppercase tracking-widest text-xs mb-4 block">
                  Teacher Workflow
                </span>
                <h3 className="text-3xl font-extrabold text-[#003d9b] mb-12">
                  The Creation Pipeline
                </h3>
                <div className="space-y-12">
                  <div className="flex gap-6 relative">
                    <div className="absolute left-6 top-12 bottom-[-48px] w-[2px] bg-[#003d9b]/20"></div>
                    <div className="w-12 h-12 bg-[#003d9b] text-white rounded-full flex items-center justify-center font-bold shrink-0 relative z-10">
                      1
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#003d9b] mb-2">
                        Create or upload questions
                      </h4>
                      <p className="text-slate-600">
                        Populate your private repository or import bulk data
                        effortlessly.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 relative">
                    <div className="absolute left-6 top-12 bottom-[-48px] w-[2px] bg-[#003d9b]/20"></div>
                    <div className="w-12 h-12 bg-[#003d9b] text-white rounded-full flex items-center justify-center font-bold shrink-0 relative z-10">
                      2
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#003d9b] mb-2">
                        Select pattern and marks
                      </h4>
                      <p className="text-slate-600">
                        Choose from preset blueprints or define your own
                        academic weightage.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-[#003d9b] text-white rounded-full flex items-center justify-center font-bold shrink-0 relative z-10">
                      3
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#003d9b] mb-2">
                        Generate question paper
                      </h4>
                      <p className="text-slate-600">
                        Our engine randomizes according to your rules and
                        exports a clean PDF.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Student Flow */}
              <div>
                <span className="text-[#7b2600] font-extrabold uppercase tracking-widest text-xs mb-4 block">
                  Student Workflow
                </span>
                <h3 className="text-3xl font-extrabold text-[#7b2600] mb-12">
                  The Mastery Cycle
                </h3>
                <div className="space-y-12">
                  <div className="flex gap-6 relative">
                    <div className="absolute left-6 top-12 bottom-[-48px] w-[2px] bg-[#7b2600]/20"></div>
                    <div className="w-12 h-12 bg-[#7b2600] text-white rounded-full flex items-center justify-center font-bold shrink-0 relative z-10">
                      1
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#7b2600] mb-2">
                        Select subject
                      </h4>
                      <p className="text-slate-600">
                        Browse through your enrolled curriculum and choose a
                        focus area.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 relative">
                    <div className="absolute left-6 top-12 bottom-[-48px] w-[2px] bg-[#7b2600]/20"></div>
                    <div className="w-12 h-12 bg-[#7b2600] text-white rounded-full flex items-center justify-center font-bold shrink-0 relative z-10">
                      2
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#7b2600] mb-2">
                        Practice questions
                      </h4>
                      <p className="text-slate-600">
                        Engage with dynamic banks that adapt to your previous
                        answers.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-[#7b2600] text-white rounded-full flex items-center justify-center font-bold shrink-0 relative z-10">
                      3
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#7b2600] mb-2">
                        Review results
                      </h4>
                      <p className="text-slate-600">
                        Get instant feedback and performance analytics to
                        identify gaps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <span className="material-symbols-outlined text-[120px]">
                auto_stories
              </span>
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
                Ready to Transform Your Academic Experience?
              </h2>
              <p className="text-xl text-[#b2c5ff] mb-12 opacity-90">
                Join thousands of educators and students who are already using
                ThePaperPlus to streamline education.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link
                  to="/login"
                  className="bg-white text-[#003d9b] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
                >
                  Get Started Free
                </Link>
                <button className="border border-white/30 bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-slate-100 dark:bg-slate-950 border-t border-slate-200/20 dark:border-slate-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 max-w-7xl mx-auto items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#4c5d8d] text-2xl">
                menu_book
              </span>
              <span className="text-lg font-bold text-[#4c5d8d]">
                ThePaperPlus
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs mb-4">
              The next generation of educational content management and practice
              intelligence.
            </p>
            <p className="text-slate-500 text-sm tracking-wide uppercase">
              © 2024 ThePaperPlus Intelligence. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap md:justify-end gap-x-8 gap-y-4">
            <a
              className="text-slate-500 hover:text-[#7b2600] transition-colors text-sm tracking-wide uppercase"
              href="#"
            >
              Contact
            </a>
            <a
              className="text-slate-500 hover:text-[#7b2600] transition-colors text-sm tracking-wide uppercase"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-slate-500 hover:text-[#7b2600] transition-colors text-sm tracking-wide uppercase"
              href="#"
            >
              Terms
            </a>
            <a
              className="text-slate-500 hover:text-[#7b2600] transition-colors text-sm tracking-wide uppercase"
              href="#"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
