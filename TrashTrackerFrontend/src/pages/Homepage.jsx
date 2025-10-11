import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="bg-gray-50 text-gray-800 font-sans">
        {/* Hero Section */}
        <section className="bg-green-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Smarter Waste Management for a Cleaner Future
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Report, Track, and Help Keep Your City Clean
            </p>
            <div className="space-x-4">
              <Link to="/auth" className="bg-white text-green-700 px-6 py-3 rounded-xl shadow hover:bg-green-100 transition">
                Report Trash Now
              </Link>
              <Link to = "/auth" className="bg-transparent border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-green-700 transition">
                Login as Admin
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Reports Resolved", value: "2,340" },
            { label: "Cleanup Rate", value: "98%" },
            { label: "Active Citizens", value: "1,200+" },
            { label: "Partner Municipalities", value: "15" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
            >
              <h2 className="text-3xl font-bold text-green-700">{stat.value}</h2>
              <p className="mt-2 text-gray-600">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* About Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-700">
              About Trash Tracker
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600">
              Trash Tracker is a community-driven platform that empowers citizens
              to report waste hotspots and helps municipalities efficiently manage
              waste collection. Together, we’re creating cleaner, greener cities.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-700">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Reporting",
                desc: "Submit trash reports with photos and GPS location in seconds.",
              },
              {
                title: "Real-Time Tracking",
                desc: "Track cleanup progress and get notified once resolved.",
              },
              {
                title: "Admin Dashboard",
                desc: "Municipal teams can assign tasks and analyze trends.",
              },
              {
                title: "Pickup Schedules",
                desc: "View and get alerts for trash pickup in your area.",
              },
              {
                title: "Community Impact",
                desc: "See stats and join initiatives for a cleaner city.",
              },
              {
                title: "Eco-Education",
                desc: "Access recycling guides and learn sustainable practices.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-green-700">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-green-700 text-white py-10 mt-20">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Trash Tracker</h3>
              <p className="text-sm text-green-100">
                Making cities cleaner through tech and community collaboration.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-green-100">
                <li><a href="#">About</a></li>
                <li><a href="#">Features</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Login</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <p className="flex items-center space-x-2 text-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>123 City Road, India</span>
              </p>
              <p className="flex items-center space-x-2 text-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2.02c-.83.18-2.47-.2-4.12-1.28A18.91 18.91 0 0 1 2.22 6.16c-1.08-1.65-1.46-3.29-1.28-4.12A2 2 0 0 1 2.08 2h3a2 2 0 0 1 2 2.18c-.18.83.2 2.47 1.28 4.12C10 11.29 12.71 14 16.92 20.28c1.65 1.08 3.29 1.46 4.12 1.28A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center space-x-2 text-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>support@trashtracker.com</span>
              </p>
            </div>
          </div>
          <div className="text-center text-green-100 mt-8 text-sm">
            © {new Date().getFullYear()} Trash Tracker. All Rights Reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
