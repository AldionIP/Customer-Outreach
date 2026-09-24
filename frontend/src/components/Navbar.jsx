import { NavLink } from "react-router-dom";

import heroImage from "../assets/hero.png";

const navigationItems = [
  { path: "/", label: "Dashboard" },
  { path: "/customers", label: "Customers" },
  { path: "/customers/import", label: "Import" },
  { path: "/outreach/whatsapp", label: "WhatsApp" },
  { path: "/reports", label: "Report" },
  { path: "/learning-book", label: "Learning Book" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900/80 shadow-[0_0_22px_rgba(34,211,238,0.2)]">
            <img src={heroImage} alt="Customer Outreach logo" className="h-full w-full object-cover" />
          </div>

          <div className="leading-none">
            <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-300">
              Mission Control
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-100">
              Customer Outreach
            </div>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
                    : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900/80 hover:text-slate-100",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <div className="hud-label">
            <span className="status-dot" />
            ONLINE
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 md:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3 sm:px-6">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-200 ease-out",
                  isActive
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-700 bg-slate-900/70 text-slate-300",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Navbar;