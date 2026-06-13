import { Link } from "@tanstack/react-router";

const links = {
  Support: [
    "Help Center",
    "Safety Information",
    "Cancellation Options",
    "Report a concern",
  ],
  Community: [
    "StayEase for disaster relief",
    "Fight discrimination",
    "Guest referrals",
    "Accessibility",
  ],
  Hosting: [
    "Become a host",
    "Explore hosting resources",
    "Community forum",
    "Hosting responsibly",
  ],
  StayEase: ["Newsroom", "Features", "Careers", "Investors", "Gift cards"],
};

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {section}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      to="/"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 StayEase, Inc. · All rights reserved
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/" className="hover:text-gray-900">
              Terms
            </Link>
            <span>·</span>
            <Link to="/" className="hover:text-gray-900">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
